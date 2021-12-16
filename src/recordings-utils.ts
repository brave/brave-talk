import { availableRecordings } from "./recordings";
import { Recording } from "./jwt-store";

export type RecordingWithUrl = Recording & { url: string };

export const sortedRecordings = (): RecordingWithUrl[] => {
  const recordings = availableRecordings();

  /* sort by descending creation timestamp and then group by roomName
   */
  const records: RecordingWithUrl[] = Object.entries(recordings).map(
    ([url, recording]) => {
      return {
        ...recording,
        url,
      };
    }
  );

  records.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });
  records.sort((a, b) => {
    if (a.roomName === b.roomName) return 0;

    for (let i = 0; i < records.length; i++) {
      const roomName = records[i].roomName;

      if (a.roomName === roomName) return -1;
      if (b.roomName === roomName) return 1;
    }

    return 0;
  });

  return records;
};

// exported for testing
export function formatRelativeDay(d: Date): string {
  const getDateString = (epochMs: number) =>
    new Date(epochMs).toLocaleDateString();

  const now = new Date().getTime();
  const offsets = {
    Today: getDateString(now),
    Yesterday: getDateString(now - 24 * 60 * 60 * 1000),
    Tomorrow: getDateString(now + 24 * 60 * 60 * 1000),
  };

  const s = d.toLocaleDateString();
  let result = s;

  Object.entries(offsets).forEach(([prefix, formattedString]) => {
    if (s === formattedString) result = prefix;
  });

  return result;
}

export function formatDuration(s: number): string {
  const pos = s >= 3600 ? 11 : 14;
  const len = s >= 3600 ? 8 : 5;

  return new Date(s * 1000).toISOString().substr(pos, len);
}
