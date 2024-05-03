enum TranscriptAction {
  CallStart,
  Join,
  Leave,
}

export interface TranscriptionEvent {
  timeOffset: string;
  participant: string;
  message: string;
  action?: TranscriptAction;
}

export interface DownloadedTranscript {
  id: string;
  url: string;
  blobUrl: string;
  events: TranscriptionEvent[];
  startDateTime: Date | undefined;
}

const ACTION_NAMES: Record<string, TranscriptAction> = {
  " joined the call.": TranscriptAction.Join,
  " left the call.": TranscriptAction.Leave,
};

export function parseTranscriptLines(transcript: string): {
  events: TranscriptionEvent[];
  text: string;
} {
  return {
    events: [...generateTranscriptLines(transcript)],
    text: transcript,
  };
}

export function* generateTranscriptLines(transcript: string) {
  for (const line of transcript.split("\n")) {
    const timeOffset = line.match(/^(\d+m\d\ds) /)?.[1];
    if (!timeOffset) continue;
    const remainder = line.substring(timeOffset.length + 1);
    for (const s in ACTION_NAMES) {
      if (remainder.endsWith(s)) {
        const result: TranscriptionEvent = {
          timeOffset,
          participant: remainder.substring(0, remainder.length - s.length),
          message: s,
          action: ACTION_NAMES[s],
        };
        yield result;
      }
    }
    // Nothing stops a name from containing a colon
    const match = remainder.match(
      /^(?<participant>[^\n]*):[ ]{2}(?<message>.*)$/,
    )?.groups;
    if (!match) continue;
    const result: TranscriptionEvent = {
      timeOffset,
      participant: match.participant,
      message: match.message,
    };
    yield result;
  }
}
