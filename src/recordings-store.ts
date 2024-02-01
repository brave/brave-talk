export interface Recording {
  url?: string;
  transcriptUrl?: string;
  roomName: string;
  createdAt: number;
  ttl: number;
  expiresAt: number;
}

export const availableRecordings = (): Readonly<Recording[]> => {
  const now = Math.ceil(new Date().getTime() / 1000);

  const recordings = loadFromStorage().filter((r) => r.expiresAt >= now);

  /* sort by descending creation timestamp */
  recordings.sort((a, b) => {
    return b.createdAt - a.createdAt;
  });

  return recordings;
};

let lastRecordedCreationTime: number | null = null;

export const resetCurrentRecordingState = () => {
  console.log("!!! resetCurrentRecordingState");
  lastRecordedCreationTime = null;
};

export const upsertRecordingForRoom = (
  recordingUrl: string | null,
  transcriptUrl: string | null,
  roomName: string,
  ttl: number | undefined,
): void => {
  const recordings = loadFromStorage();
  const now = Math.ceil(new Date().getTime() / 1000);

  // Remove vpaas-magic-cookie prefix, if need be
  if (roomName.includes("/")) {
    roomName = roomName.split("/")[1];
  }

  const existingEntryForUrl = recordings.find((r) => {
    return r.roomName === roomName && r.createdAt === lastRecordedCreationTime;
  });

  console.log(
    `!!! upsertRecording ${recordingUrl} and ${transcriptUrl} for room ${roomName} ttl=${ttl} createP=${!existingEntryForUrl}`,
  );

  if (ttl === undefined) {
    ttl = 24 * 60 * 60;
  }
  const expiresAt = now + ttl;

  const entry: Recording = existingEntryForUrl || {
    roomName,
    createdAt: now,
    ttl,
    expiresAt,
  };
  if (!existingEntryForUrl) {
    recordings.push(entry);
    lastRecordedCreationTime = now;
  } else {
    entry.expiresAt = expiresAt;
  }
  if (recordingUrl) {
    entry.url = recordingUrl;
  }
  if (transcriptUrl) {
    entry.transcriptUrl = transcriptUrl;
  }
  writeToStorage(recordings);
};

export const clearAllRecordings = (): void => {
  writeToStorage([]);
};

const STORAGE_KEY = "recordings";

function loadFromStorage(): Recording[] {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);

    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.log(`!!! localStorage.getItem ${STORAGE_KEY} failed`, error);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      // continue regardless of error
    }
  }
  return [];
}

function writeToStorage(recordings: Recording[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
}
