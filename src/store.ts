//
// This file groups methods responsible for maintaining the local data stored by talk. We keep this to
// the minimum possible:
//  -- an mau tracker, to enable us to report the user as a new user this calendar month
//  -- jwts issued for rooms joined - this are short-lived tokens that allow acces to rooms. We store them locally so that we don't need to go get a new one on rejoin.
//  -- refresh tokens - these are longer-lived than the JWTs, don't in themsleves give access to the room, but can be used to issue a new room jwt. Since the only thing special here
//      is whether you are the room moderator or not, a refresh token only gets issued for rooms where you were the creator.
//
// The data is all stored under the "confabs" local storage key.
//

// PUBLIC INTERFACE

export interface JwtStore {
  findJwtForRoom: (roomName: string) => string | undefined;

  findRefreshTokenForRoom: (roomName: string) => string | undefined;

  storeJwtForRoom: (
    roomName: string,
    encodedJwt: string,
    encodedRefreshToken?: string | undefined
  ) => void;

  isNewMonthlyActiveUser: () => boolean;

  availableRecordings: () => Readonly<Record<string, Recording>>;

  findRecordingAtURL: (url: string) => Recording;

  upsertRecordingForRoom: (
    url: string,
    roomName: string,
    expiresAt: number | undefined
  ) => void;
}

export interface Recording {
  roomName: string;
  createdAt: number;
  expiresAt: number;
}

export function loadLocalJwtStore(): JwtStore {
  const confabs: ConfabStructure = loadFromStorage();

  console.log("!!! begin=", confabs);
  garbageCollect(confabs);
  console.log("!!!   end=", confabs);

  return {
    findJwtForRoom: (roomName) => confabs.JWTs[roomName],

    findRefreshTokenForRoom: (roomName) => confabs.refresh[roomName],

    storeJwtForRoom: (roomName, encodedJwt, encodedRefreshToken) => {
      confabs.JWTs[roomName] = encodedJwt;
      if (encodedRefreshToken) {
        confabs.refresh[roomName] = encodedRefreshToken;
      }
      saveToStorage(confabs);
    },

    isNewMonthlyActiveUser: () => performMauCheck(confabs),

    availableRecordings: () => confabs.recordings,

    findRecordingAtURL: (url: string) => confabs.recordings[url],

    upsertRecordingForRoom: (
      url: string,
      roomName: string,
      expiresAt: number | undefined
    ) => {
      const now = Math.ceil(new Date().getTime() / 1000);

      console.log(
        "!!! upsertRecording " +
          url +
          " for room " +
          roomName +
          " expiresAt=" +
          expiresAt +
          "  updateP=" +
          !!confabs.recordings[url]
      );
      console.log("!!! before=", confabs.recordings);
      if (typeof expiresAt === "undefined") {
        expiresAt = now + 24 * 60 * 60;
      }
      if (!confabs.recordings[url]) {
        confabs.recordings[url] = {
          roomName: roomName,
          createdAt: now,
          expiresAt: expiresAt,
        };
      } else {
        confabs.recordings[url].expiresAt = expiresAt;
      }
      console.log("!!!  after=", confabs.recordings);
      saveToStorage(confabs);
    },
  };
}

// IMPLEMENTATION

interface ConfabStructure {
  // epoch timestamp (e.g. 1635724800000) of when this user should next be reported as an monthly active user
  mauStamp: number;

  // map from roomid -> encoded jwt
  JWTs: Record<string, string>;

  // map from roomid -> encoded refresh token (which is itself a jwt, just not one valid for creating or joining a room)
  refresh: Record<string, string>;

  recordings: Record<string, Recording>;
}

const LOCAL_STORAGE_KEY = "confabs";

const defaults: ConfabStructure = {
  JWTs: {},
  refresh: {},
  mauStamp: 0,
  recordings: {},
};

const loadFromStorage = (): ConfabStructure => {
  try {
    const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (item) {
      const value = JSON.parse(item);
      console.log("!!! good return ");
      return {
        ...defaults,
        ...value,
      };
    }
  } catch (error) {
    console.log("!!! localStorage.getItem: ", error);
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {}
  }

  console.log("!!! oops return ");
  return {
    ...defaults,
  };
};

// remove all expired tokens from confabs, saving back to local storage if needed
const garbageCollect = (confabs: ConfabStructure) => {
  let didP = false;

  // Object.entries only includes own properties, so no need to explicitly check hasOwnProperty to avoid
  // the risk of prototype polltion
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  Object.entries(confabs.JWTs).forEach(([roomName, jwt]) => {
    if (expiredP(roomName, jwt)) {
      delete confabs.JWTs[roomName];
      didP = true;
    }
  });

  Object.entries(confabs.refresh).forEach(([roomName, refreshJwt]) => {
    if (expiredP(roomName, refreshJwt)) {
      delete confabs.refresh[roomName];
      didP = true;
    }
  });

  const now = Math.ceil(new Date().getTime() / 1000);
  Object.entries(confabs.recordings).forEach(([url, recording]) => {
    if (recording.expiresAt >= now) {
      delete confabs.recordings[url];
      didP = true;
    }
  });

  if (didP) {
    saveToStorage(confabs);
  }
};

const expiredP = (roomName: string, jwt: string): boolean => {
  const now = Math.ceil(new Date().getTime() / 1000);

  try {
    const payload = jwt_decode(jwt);
    return payload.exp < now;
  } catch (error) {
    console.warn(`!!! unable to parse JWT for ${roomName}: `, error);
    return false;
  }
};

const saveToStorage = (confabs: ConfabStructure): void => {
  console.log("!!! saveToStorage", confabs);
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(confabs));
  } catch (error) {
    console.warn("!!! localStorage.setItem failed", error);
  }
};

const performMauCheck = (confabs: ConfabStructure) => {
  // track whether we are a new monthly active user or not
  const mauStamp = confabs.mauStamp || 0;
  const now = new Date();

  if (mauStamp <= now.getTime()) {
    const next =
      now.getMonth() === 11
        ? new Date(now.getFullYear() + 1, 0, 1)
        : new Date(now.getFullYear(), now.getMonth() + 1, 1);
    confabs.mauStamp = next.getTime();

    saveToStorage(confabs);

    return true;
  }

  return false;
};
