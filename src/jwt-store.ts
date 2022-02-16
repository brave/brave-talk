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
}

let jwtStore: JwtStore | undefined;

// forceReload expected only for tests, setting it otherwise may introduce race conditions
export function loadLocalJwtStore(forceReload: boolean = false): JwtStore {
  if (!jwtStore || forceReload) {
    const confabs: ConfabStructure = loadConfabsFromStorage();

    garbageCollect(confabs);

    jwtStore = {
      findJwtForRoom: (roomName) => confabs.JWTs[roomName],
      findRefreshTokenForRoom: (roomName) => confabs.refresh[roomName],
      storeJwtForRoom: (roomName, encodedJwt, encodedRefreshToken) => {
        const logs = loadLogsFromStorage();
        const now = Math.ceil(new Date().getTime() / 1000);

        confabs.JWTs[roomName] = encodedJwt;
        logs.push({
          tag: roomName,
          iat: now,
          evt: "add confab JWT",
          exp: expires(encodedJwt),
        });
        if (encodedRefreshToken) {
          confabs.refresh[roomName] = encodedRefreshToken;
          logs.push({
            tag: roomName,
            iat: now,
            evt: "add refresh JWT",
            exp: expires(encodedRefreshToken),
          });
        }
        saveConfabsToStorage(confabs);
        saveLogsToStorage(logs);
      },
      isNewMonthlyActiveUser: () => performMauCheck(confabs),
    };
  }

  return jwtStore;
}

// IMPLEMENTATION

interface ConfabStructure {
  // epoch timestamp (e.g. 1635724800000) of when this user should next be reported as an monthly active user
  mauStamp: number;

  // map from roomid -> encoded jwt
  JWTs: Record<string, string>;

  // map from roomid -> encoded refresh token (which is itself a jwt, just not one valid for creating or joining a room)
  refresh: Record<string, string>;
}

interface LogEntry {
  tag: string;
  iat: number;
  evt: string;
  exp: number;
}

type LogEntries = Array<LogEntry>;

const CONFABS_STORAGE_KEY = "confabs";
const LOGS_STORAGE_KEY = "logs";

const defaults: ConfabStructure = {
  JWTs: {},
  refresh: {},
  mauStamp: 0,
};

const loadConfabsFromStorage = (): ConfabStructure => {
  try {
    const item = window.localStorage.getItem(CONFABS_STORAGE_KEY);
    if (item) {
      const value = JSON.parse(item);
      return {
        ...defaults,
        ...value,
      };
    }
  } catch (error) {
    console.log(
      "!!! localStorage.getItem " + CONFABS_STORAGE_KEY + " failed",
      error
    );
    try {
      window.localStorage.removeItem(CONFABS_STORAGE_KEY);
    } catch (error) {}
  }

  return {
    ...defaults,
  };
};

const loadLogsFromStorage = (): LogEntries => {
  try {
    const item = window.localStorage.getItem(LOGS_STORAGE_KEY);

    if (item) {
      return JSON.parse(item);
    }
  } catch (error) {
    console.log(
      "!!! localStorage.getItem " + LOGS_STORAGE_KEY + " failed",
      error
    );
    try {
      window.localStorage.removeItem(LOGS_STORAGE_KEY);
    } catch (error) {}
  }

  return [];
};

// remove all expired tokens from confabs, saving back to local storage if needed
const garbageCollect = (confabs: ConfabStructure) => {
  let didP = false;
  let logP = false;
  let logs: LogEntries = [];
  const now = Math.ceil(new Date().getTime() / 1000);

  // Object.entries only includes own properties, so no need to explicitly check hasOwnProperty to avoid
  // the risk of prototype polltion
  // see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
  Object.entries(confabs.JWTs).forEach(([roomName, jwt]) => {
    if (expiredP(roomName, jwt)) {
      delete confabs.JWTs[roomName];
      didP = true;

      if (!logP) {
        logs = loadLogsFromStorage();
        logP = true;
      }
      logs.push({
        tag: roomName,
        iat: now,
        evt: "expire confab JWT",
        exp: expires(jwt),
      });
    }
  });

  Object.entries(confabs.refresh).forEach(([roomName, refreshJwt]) => {
    if (expiredP(roomName, refreshJwt)) {
      delete confabs.refresh[roomName];
      didP = true;

      if (!logP) {
        logs = loadLogsFromStorage();
        logP = true;
      }
      logs.push({
        tag: roomName,
        iat: now,
        evt: "expire refresh JWT",
        exp: expires(refreshJwt),
      });
    }
  });

  if (didP) {
    saveConfabsToStorage(confabs);
  }
  if (logP) {
    saveLogsToStorage(logs);
  }
};

const expires = (jwt: string): number => {
  const payload = jwt_decode(jwt);

  return payload.exp;
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

const saveConfabsToStorage = (confabs: ConfabStructure): void => {
  try {
    window.localStorage.setItem(CONFABS_STORAGE_KEY, JSON.stringify(confabs));
  } catch (error) {
    console.warn(
      "!!! localStorage.setItem " + CONFABS_STORAGE_KEY + " failed",
      error
    );
  }
};

const saveLogsToStorage = (logs: LogEntries): void => {
  logs = logs.slice(-19);
  try {
    window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.warn(
      "!!! localStorage.setItem " + LOGS_STORAGE_KEY + " failed",
      error
    );
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

    saveConfabsToStorage(confabs);

    const logs = loadLogsFromStorage();
    logs.push({
      tag: "",
      iat: Math.ceil(now.getTime() / 1000),
      evt: "update mauStamp",
      exp: confabs.mauStamp,
    });
    saveLogsToStorage(logs);

    return true;
  }

  return false;
};
