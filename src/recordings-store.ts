export interface Recording {
  url: string;
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

export const upsertRecordingForRoom = (
  url: string,
  roomName: string,
  ttl: number | undefined,
): void => {
  const recordings = loadFromStorage();

  const existingEntryForUrl = recordings.find((r) => r.url === url);

  console.log(
    `!!! upsertRecording ${url} for room ${roomName} ttl=${ttl} createP=${!existingEntryForUrl}`,
  );

  const now = Math.ceil(new Date().getTime() / 1000);
  if (typeof ttl === "undefined") {
    ttl = 24 * 60 * 60;
  }
  const expiresAt = now + ttl;

  if (existingEntryForUrl) {
    existingEntryForUrl.expiresAt = now + ttl;
  } else {
    recordings.push({
      roomName,
      url,
      createdAt: now,
      ttl,
      expiresAt,
    });
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
