export const extractRoomNameFromPath = (path: string): string | undefined => {
  const parts = path.split("/");

  if (parts.length !== 2) {
    return undefined;
  }

  const roomName = parts[1];

  if (roomName === "") {
    return undefined;
  }

  if (roomName === "widget") {
    return roomName;
  }

  if (!isRoomValid(roomName)) {
    console.warn(`!!! invalid roomName: ${roomName}`);
    return undefined;
  }

  return roomName;
};

export const generateRoomName = () => {
  const { crypto } = window;
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

export const isRoomValid = (room: string) => {
  // e.g., "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE"
  return typeof room === "string" && room.match(/^[A-Za-z0-9-_]{43}$/);
};

export const reportAction = (action: string, params: object) => {
  console.log("!!! < %s: ", action, params);
};

export const reportMethod = (method: string, params: object) => {
  console.log("!!! > %s: ", method, params);
};

export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export const extractValueFromFragment = (key: string): string | undefined => {
  let value: string | undefined;

  if (window.location.hash !== "") {
    const hashes = window.location.hash.substr(1).split("&");

    hashes.forEach((hash: string) => {
      const equals = hash.indexOf("=");

      if (equals !== -1 && key === hash.substr(0, equals)) {
        value = hash.substr(equals + 1);
      }
    });
  }

  return value;
};

const FETCH_TIMEOUT_MS = 5_000;

// HT: https://dmitripavlutin.com/timeout-fetch-request/
export async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit
): Promise<Response> {
  const controller = new AbortController();

  const id = window.setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  const response = await fetch(input, {
    ...init,
    signal: controller.signal,
  });

  clearTimeout(id);

  return response;
}
