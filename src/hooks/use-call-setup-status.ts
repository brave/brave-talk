import { useEffect, useState } from "react";
import { TranslationKeys } from "../i18n/i18next";
import { JitsiContext } from "../jitsi/types";
import {
  extractRoomNameFromPath,
  extractValueFromFragment,
  generateRoomName,
  reportAction,
  reportMethod,
  wait,
} from "../lib";
import { fetchJWT } from "../rooms";
import { subscriptionCheckWithTimeout } from "./use-subscribed-status";

function calculateInitialRoomNameFromUrl(pathname: string): string | undefined {
  const requestedRoomName = extractRoomNameFromPath(pathname);

  if (!requestedRoomName) {
    return undefined;
  }

  // special case for when called from the new tab page:
  //  of the room name is "widget", this is a request to automatically
  //  create a new room
  if (requestedRoomName === "widget") {
    return generateRoomName();
  }

  return requestedRoomName;
}

interface JoinConferenceRoomResult {
  jwt?: string;
  retryLater?: boolean;
}

const fetchOrCreateJWT = async (
  roomName: string,
  createP: boolean,
  waitForSubscriptionBeforeCreating: boolean,
  notice: (message: TranslationKeys) => void,
): Promise<JoinConferenceRoomResult> => {
  reportMethod("joinConferenceRoom", { roomName, createP });

  try {
    const { jwt } = await fetchJWT(roomName, createP, notice);
    return { jwt };
  } catch (error: any) {
    if (!createP && error.message === "The room does not exist") {
      // we _could_ try and pass down the subscription status via react state, but
      // we're deliberately choosing not to do that: we've deliberately
      // scoped the subscription checks to the welcome screen so that the
      // "normal" case case of joining an existing call doesn't force a load
      // of the massive wasm that supports subscriptions.
      const isSubscribed = await subscriptionCheckWithTimeout();

      if (waitForSubscriptionBeforeCreating && !isSubscribed) {
        notice("Waiting for a subscriber to create the room...");
        return { retryLater: true };
      }

      reportAction(`Creating room`, { roomName });
      return await fetchOrCreateJWT(roomName, true, false, notice);
    } else {
      console.error(error);
      notice(error.message);
      return {};
    }
  }
};

interface CallSetup {
  roomName?: string;
  jwt?: string;
  notice?: TranslationKeys;
  isEstablishingCall: boolean;
  hasInitialRoom: boolean;
  jitsiContext: JitsiContext;
  onStartCall: () => void;
  isCallReady: boolean;
  setJwt: (jwt: string) => void;
  setRoomName: (roomName: string) => void;
  setJitsiContext: (jitsiContext: JitsiContext) => void;
}

export function useCallSetupStatus(
  waitForSubscriptionBeforeCreating: boolean,
): CallSetup {
  const [roomName, setRoomName] = useState(() =>
    calculateInitialRoomNameFromUrl(window.location.pathname),
  );

  // why is this important? Because we don't want to show any
  // buttons to start a call if the initial url has a valid room name
  // on it
  const [hasInitialRoom, setHasInitialRoom] = useState(() => !!roomName);
  const [jwt, setJwt] = useState<string>();
  const [notice, setNotice] = useState<TranslationKeys>();
  const [isEstablishingCall, setIsEstablishingCall] = useState(false);
  const [jitsiContext, setJitsiContext] = useState<JitsiContext>({
    firstTime: true,
    // check every 30 seconds (disable by setting to 0)
    inactiveInterval: 30 * 1000,
    // total 1 hour of inactivity
    inactiveTotal: 120,
    inactiveCount: 0,
    inactiveTimer: undefined,
    passcode: extractValueFromFragment("passcode"),
  });

  const isCallReady = !!(roomName && jwt);

  useEffect(() => {
    (async function tryFetchJwt(
      roomName,
      hasInitialRoom,
      waitForSubscriptionBeforeCreating,
    ) {
      if (roomName) {
        try {
          // keep the url in sync with the any room name configured
          window.history.replaceState(null, "", `/${roomName}`);
          setIsEstablishingCall(true);

          // if we don't have a jwt fetch one
          const result = await fetchOrCreateJWT(
            roomName,
            false,
            waitForSubscriptionBeforeCreating,
            setNotice,
          );

          if (result.jwt) {
            setJwt(result.jwt);
          }

          // the error message has already been displayed by fetchOrCreateJWT,
          // but we need to allow the user to recover by enabling all functionality
          setHasInitialRoom(false);

          if (result.retryLater) {
            wait(5_000).then(() =>
              tryFetchJwt(roomName, false, waitForSubscriptionBeforeCreating),
            );
          }
        } catch (e: any) {
          console.error(e);
        } finally {
          setIsEstablishingCall(false);
        }
      }
    })(roomName, hasInitialRoom, waitForSubscriptionBeforeCreating);
  }, [roomName, hasInitialRoom, waitForSubscriptionBeforeCreating]);

  const doStartCall = () => {
    setRoomName(generateRoomName());
    // ...which will then trigger the effect above to fetch the jwt
  };

  return {
    roomName,
    notice,
    jwt,
    isEstablishingCall,
    hasInitialRoom,
    jitsiContext,
    onStartCall: doStartCall,
    isCallReady,
    setJwt,
    setRoomName,
    setJitsiContext,
  };
}
