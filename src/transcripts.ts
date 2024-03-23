import i18next from "i18next";
import { getParticipants } from "./jitsi/event-handlers";
import { IJitsiMeetApi, JitsiTranscriptionChunk } from "./jitsi/types";
import { fetchWithTimeout, TimeStampStyle, delta2elapsed } from "./lib";
import { getRoomCsrfToken, getRoomUrl } from "./rooms";
import {
  resetCurrentRecordingState,
  upsertRecordingForRoom,
} from "./recordings-store";

interface TranscriptDetailsResponse {
  url: string;
  startTime: string | null;
}

enum TranscriptDetailsOperation {
  Fetch,
  Create,
  Finalize,
}

const operateOnTranscriptDetails = async (
  roomName: string,
  jwt: string,
  operation: TranscriptDetailsOperation,
): Promise<TranscriptDetailsResponse | null> => {
  try {
    let url;
    if (operation === TranscriptDetailsOperation.Finalize) {
      url = `${getRoomUrl(roomName)}/finalize_transcript`;
    } else {
      url = `${getRoomUrl(roomName)}/transcript`;
    }

    const method =
      operation !== TranscriptDetailsOperation.Fetch ? "POST" : "GET";
    let headers: HeadersInit;

    if (operation !== TranscriptDetailsOperation.Fetch) {
      const csrfToken = await getRoomCsrfToken(roomName);
      headers = {
        Authorization: `Bearer ${jwt}`,
        "x-csrf-token": csrfToken,
      };
    } else {
      headers = {
        Authorization: `Bearer ${jwt}`,
      };
    }

    const reqParams: RequestInit = {
      headers,
      method: method,
    };

    console.log(`>>> ${method} ${url}`);
    const response = await fetchWithTimeout(url, reqParams);
    const { status } = response;
    console.log(`<<< ${method} ${url} ${status}`);

    if (status === 404) {
      // No transcript exists, return null
      return null;
    }
    if (status !== 200) {
      throw new Error(`Bad status code: ${status}`);
    }

    return await response.json();
  } catch (e: any) {
    console.warn(`Failed to retrieve existing transcript URL: ${e}`);
    throw e;
  }
};

const fetchTranscript = async (transcriptUrl: string): Promise<string> => {
  try {
    transcriptUrl += "?internal=1";
    console.log(`>>> GET ${transcriptUrl}`);
    const response = await fetchWithTimeout(transcriptUrl, {});
    const { status } = response;
    console.log(`<<< GET ${transcriptUrl} ${status}`);

    if (status !== 200) {
      throw new Error(`Bad status code: ${status}`);
    }

    return await response.text();
  } catch (e: any) {
    console.warn(`Failed to retrieve existing transcript: ${e}`);
    throw e;
  }
};

export class TranscriptManager {
  timeStampStyle: TimeStampStyle = TimeStampStyle.Short;
  initializedP = false;
  start = 0;
  preTranscript: string = "";
  roomName: string | null = null;
  jwt: string | null = null;
  messageIDs: string[] = [];
  data: { [key: string]: JitsiTranscriptionChunk } = {};
  prompt: string = "";
  transcriptionUsed: boolean = false;

  constructor(public onTranscriptChange: (transcript: string) => void) {}

  async initTranscript(create: boolean) {
    if (!this.jwt || !this.roomName) {
      throw new Error(
        "Could not init transcript due to missing JWT and/or roomName",
      );
    }

    const transcriptDetails = await operateOnTranscriptDetails(
      this.roomName,
      this.jwt,
      create
        ? TranscriptDetailsOperation.Create
        : TranscriptDetailsOperation.Fetch,
    );

    if (!transcriptDetails) {
      // No transcript available, ignore
      return;
    }

    if (transcriptDetails.startTime) {
      this.start = new Date(transcriptDetails.startTime).getTime();
    }

    this.preTranscript = await fetchTranscript(transcriptDetails.url);
    this.updateTranscript();

    return transcriptDetails.url;
  }

  initialize(jitsi?: IJitsiMeetApi) {
    if (!this.initializedP && !!jitsi) {
      this.initializedP = true;
      if (!this.start) {
        this.start = new Date().getTime();
      }
      getParticipants(jitsi, this);
    }
  }

  async handleTranscriptionEnabledEvent(jitsi: IJitsiMeetApi, status: boolean) {
    if (!this.jwt) {
      throw new Error(
        "Could not process transcription enabled event due to missing JWT",
      );
    }
    const parsedJwt = jwt_decode(this.jwt);
    if (parsedJwt.context.user.moderator !== "true" || !this.roomName) {
      return;
    }
    if (!status) {
      // Delay transcript finalization. Transcription can be turned off mid-call
      // by moderators who will finalize the transcript. If a moderator destroys
      // the room (thus turning off transcription, and navigating away from the call page),
      // the transcript won't be explicitly finalized to prevent omitting
      // "participant left" events due to premature finalization.
      setTimeout(async () => {
        if (!this.roomName || !this.jwt || !this.transcriptionUsed) {
          return;
        }
        await operateOnTranscriptDetails(
          this.roomName,
          this.jwt,
          TranscriptDetailsOperation.Finalize,
        );
      }, 5000);
      // update expiration time if transcription
      // was turned off
      if (this.roomName) {
        resetCurrentRecordingState(this.roomName);
      }
      return;
    }

    this.transcriptionUsed = true;

    const transcriptUrl = await this.initTranscript(true);
    if (transcriptUrl) {
      upsertRecordingForRoom(null, transcriptUrl, this.roomName);
      jitsi.executeCommand("showNotification", {
        title: i18next.t("transcription_link_available_title"),
        description: i18next.t("transcription_link_available_description", {
          transcriptUrl,
        }),
        type: "normal",
        timeout: "sticky",
      });
    }
  }

  processChunk(chunk: JitsiTranscriptionChunk) {
    const messageID = chunk.messageID;

    if (!this.data[messageID]) {
      this.messageIDs.push(messageID);

      const delta = Math.ceil((new Date().getTime() - this.start) / 1000);
      chunk.delta = delta;
      chunk.elapsed = delta2elapsed(this.timeStampStyle, delta);
    } else {
      chunk.delta = this.data[messageID].delta;
      chunk.elapsed = this.data[messageID].elapsed;
    }

    this.data[messageID] = chunk;
  }

  updateTranscript() {
    let transcript = `${this.prompt}\n${this.preTranscript}`;
    let participantName = "";
    let delta = -1;
    for (const messageID of this.messageIDs) {
      const chunk = this.data[messageID];
      if (
        delta < chunk.delta + 30 ||
        participantName !== chunk.participant?.name
      ) {
        delta = chunk.delta;
        transcript +=
          this.timeStampStyle !== TimeStampStyle.None
            ? `\n\n${chunk.elapsed} `
            : "\n";
        participantName = chunk.participant?.name || "";
        if (participantName) {
          transcript += `${participantName}: `;
        }
      }
      transcript += chunk.final || chunk.stable || chunk.unstable;
    }
    console.log(`!!! transcript: ${transcript}`);

    this.onTranscriptChange(transcript);
  }
}
