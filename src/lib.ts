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
  init: RequestInit,
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

export enum TimeStampStyle {
  None = 0,
  Short,
  Long,
}

export const delta2elapsed = (style: TimeStampStyle, delta_ms: number) => {
  // i could not find a small JS package to do this....
  const oneMinute = 60;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  let elapsed = style === TimeStampStyle.Long ? "(" : "";

  if (style === TimeStampStyle.Long) {
    const days = Math.floor(delta_ms / oneDay);
    if (days > 0) {
      delta_ms -= days * oneDay;
      elapsed += `${days}d `;
    }

    const hours = Math.floor(delta_ms / oneHour);
    delta_ms -= hours * oneHour;
    elapsed += `${hours > 9 ? hours : "0" + hours}:`;
  }

  const minutes = Math.floor(delta_ms / oneMinute);
  delta_ms -= minutes * oneMinute;
  if (style === TimeStampStyle.Long) {
    elapsed += `${minutes > 9 ? minutes : "0" + minutes}:`;
  } else {
    elapsed += `${minutes}m`;
  }

  elapsed += `${delta_ms > 9 ? delta_ms : "0" + delta_ms}${style === TimeStampStyle.Long ? ")" : "s"}`;

  return elapsed;
};
