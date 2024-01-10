import { getParticipants } from "./jitsi/event-handlers";
import { IJitsiMeetApi, JitsiTranscriptionChunk } from "./jitsi/types";
import { fetchWithTimeout } from "./lib";

interface TranscriptDetailsResponse {
  url: string;
  startTime: string | null;
}

export const fetchTranscriptDetails = async (
  roomName: string,
  jwt: string,
): Promise<TranscriptDetailsResponse | null> => {
  try {
    const url = `/api/v1/rooms/${encodeURIComponent(roomName)}/transcript`;

    const reqParams: RequestInit = {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    };

    const response = await fetchWithTimeout(url, reqParams);
    const { status } = response;

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

export const fetchTranscript = async (
  transcriptUrl: string,
): Promise<string> => {
  try {
    const response = await fetchWithTimeout(transcriptUrl, {});
    const { status } = response;

    if (status !== 200) {
      throw new Error(`Bad status code: ${status}`);
    }

    return await response.text();
  } catch (e: any) {
    console.warn(`Failed to retrieve existing transcript: ${e}`);
    throw e;
  }
};

export const delta2elapsed = (delta: number) => {
  // i could not find a small JS package to do this....
  const oneMinute = 60;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  let elapsed = "(";

  const days = Math.floor(delta / oneDay);
  if (days > 0) {
    delta -= days * oneDay;
    elapsed += `${days}d `;
  }

  const hours = Math.floor(delta / oneHour);
  delta -= hours * oneHour;
  elapsed += `${hours > 9 ? hours : "0" + hours}:`;

  const minutes = Math.floor(delta / oneMinute);
  delta -= minutes * oneMinute;
  elapsed += `${minutes > 9 ? minutes : "0" + minutes}:`;

  elapsed += `${delta > 9 ? delta : "0" + delta})`;

  return elapsed;
};

export class TranscriptManager {
  didT = false;
  start = 0;
  preTranscript: string = "";
  jwt: string | null = null;
  messageIDs: string[] = [];
  data: { [key: string]: JitsiTranscriptionChunk } = {};

  constructor(public onTranscriptChange: (transcript: string) => void) {}

  /* never reset the state
  reset() {
    this.didT = false;
    this.start = 0;
    this.preTranscript = "";
    this.messageIDs = [];
    this.data = {};
  }
 */

  async initPreviousTranscript(roomName: string) {
    if (!this.jwt) {
      throw new Error("Could not fetch transcript due to missing JWT");
    }

    const transcriptDetails = await fetchTranscriptDetails(roomName, this.jwt);

    if (!transcriptDetails) {
      // No transcript available, ignore
      return;
    }

    if (transcriptDetails.startTime) {
      this.start = new Date(transcriptDetails.startTime).getTime();
    }

    this.preTranscript = await fetchTranscript(transcriptDetails.url);
    this.updateTranscript();
  }

  // TODO(djandries): find a better name for this method, and for 'didT'
  doT(jitsi?: IJitsiMeetApi) {
    if (!this.didT && !!jitsi) {
      this.didT = true;
      if (!this.start) {
        this.start = new Date().getTime();
      }
      jitsi.executeCommand("setSubtitles", true, false);
      getParticipants(jitsi, this);
    }
  }

  processChunk(chunk: JitsiTranscriptionChunk) {
    const messageID = chunk.messageID;

    if (!this.data[messageID]) {
      this.messageIDs.push(messageID);

      const delta = Math.ceil((new Date().getTime() - this.start) / 1000);
      chunk.delta = delta;
      chunk.elapsed = delta2elapsed(delta);
    } else {
      chunk.delta = this.data[messageID].delta;
      chunk.elapsed = this.data[messageID].elapsed;
    }

    this.data[messageID] = chunk;
  }

  updateTranscript() {
    let transcript = this.preTranscript.slice();
    let participantName = "";
    let delta = -1;
    for (const messageID of this.messageIDs) {
      const chunk = this.data[messageID];
      if (
        delta < chunk.delta + 20 ||
        participantName !== chunk.participant?.name
      ) {
        delta = chunk.delta;
        transcript += `\n\n${chunk.elapsed} `;
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
