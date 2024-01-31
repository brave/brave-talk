import i18next from "i18next";
import { getParticipants } from "./jitsi/event-handlers";
import { IJitsiMeetApi, JitsiTranscriptionChunk } from "./jitsi/types";
import { fetchWithTimeout } from "./lib";
import { getRoomCsrfToken, getRoomUrl } from "./rooms";

interface TranscriptDetailsResponse {
  url: string;
  startTime: string | null;
}

enum TimeStampStyle {
  None = 0,
  Short,
  Long,
}

const fetchOrCreateTranscriptDetails = async (
  roomName: string,
  jwt: string,
  create: boolean,
): Promise<TranscriptDetailsResponse | null> => {
  try {
    const url = `${getRoomUrl(roomName)}/transcript`;

    const method = create ? "POST" : "GET";
    let headers: HeadersInit;

    if (create) {
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
  didT = false;
  start = 0;
  preTranscript: string = "";
  roomName: string | null = null;
  jwt: string | null = null;
  messageIDs: string[] = [];
  data: { [key: string]: JitsiTranscriptionChunk } = {};
  prompt: string = "";

  constructor(public onTranscriptChange: (transcript: string) => void) {}

  async initTranscript(create: boolean) {
    if (!this.jwt || !this.roomName) {
      throw new Error(
        "Could not init transcript due to missing JWT and/or roomName",
      );
    }

    const transcriptDetails = await fetchOrCreateTranscriptDetails(
      this.roomName,
      this.jwt,
      create,
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

  // TODO(djandries): find a better name for this method, and for 'didT'
  doT(jitsi?: IJitsiMeetApi) {
    if (!this.didT && !!jitsi) {
      this.didT = true;
      if (!this.start) {
        this.start = new Date().getTime();
      }
      getParticipants(jitsi, this);
    }
  }

  async handleTranscriptionEnabledEvent(jitsi: IJitsiMeetApi) {
    if (!this.jwt) {
      throw new Error(
        "Could not process transcription enabled event due to missing JWT",
      );
    }
    const parsedJwt = jwt_decode(this.jwt);
    if (parsedJwt.context.user.moderator !== "true") {
      return;
    }
    const transcriptUrl = await this.initTranscript(true);
    jitsi.executeCommand("showNotification", {
      title: i18next.t("transcription_link_available_title"),
      description: i18next.t("transcription_link_available_description", {
        transcriptUrl,
      }),
      type: "normal",
      timeout: "sticky",
    });
  }

  delta2elapsed = (delta: number) => {
    // i could not find a small JS package to do this....
    const oneMinute = 60;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;

    let elapsed = this.timeStampStyle === TimeStampStyle.Long ? "(" : "";

    if (this.timeStampStyle === TimeStampStyle.Long) {
      const days = Math.floor(delta / oneDay);
      if (days > 0) {
        delta -= days * oneDay;
        elapsed += `${days}d `;
      }

      const hours = Math.floor(delta / oneHour);
      delta -= hours * oneHour;
      elapsed += `${hours > 9 ? hours : "0" + hours}:`;
    }

    const minutes = Math.floor(delta / oneMinute);
    delta -= minutes * oneMinute;
    if (this.timeStampStyle === TimeStampStyle.Long) {
      elapsed += `${minutes > 9 ? minutes : "0" + minutes}:`;
    } else {
      elapsed += `${minutes}m`;
    }

    elapsed += `${delta > 9 ? delta : "0" + delta}${this.timeStampStyle === TimeStampStyle.Long ? ")" : "s"}`;

    return elapsed;
  };

  processChunk(chunk: JitsiTranscriptionChunk) {
    const messageID = chunk.messageID;

    if (!this.data[messageID]) {
      this.messageIDs.push(messageID);

      const delta = Math.ceil((new Date().getTime() - this.start) / 1000);
      chunk.delta = delta;
      chunk.elapsed = this.delta2elapsed(delta);
    } else {
      chunk.delta = this.data[messageID].delta;
      chunk.elapsed = this.data[messageID].elapsed;
    }

    this.data[messageID] = chunk;
  }

  updateTranscript() {
    let transcript = this.prompt.concat(this.preTranscript);
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
