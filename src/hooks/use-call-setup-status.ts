import { useEffect, useState } from "react";
import {
  extractRoomNameFromPath,
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
  notice: (message: string) => void
): Promise<JoinConferenceRoomResult> => {
  reportMethod("joinConferenceRoom", { roomName, createP });

  try {
    const result = await fetchJWT(roomName, createP, notice);
    return { jwt: result.jwt };
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
  notice?: string;
  isEstablishingCall: boolean;
  hasInitialRoom: boolean;
  onStartCall: () => void;
}

export function useCallSetupStatus(
  waitForSubscriptionBeforeCreating: boolean
): CallSetup {
  const [roomName, setRoomName] = useState(() =>
    calculateInitialRoomNameFromUrl(window.location.pathname)
  );

  // why is this important? Because we don't want to show any
  // buttons to start a call if the initial url has a valid room name
  // on it
  const [hasInitialRoom, setHasInitialRoom] = useState(() => !!roomName);

  const [jwt, setJwt] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const [isEstablishingCall, setIsEstablishingCall] = useState(false);

  useEffect(() => {
    const tryFetchJwt = (roomName: string) => {
      // if we don't have a jwt fetch one
      setIsEstablishingCall(true);
      fetchOrCreateJWT(
        roomName,
        false,
        waitForSubscriptionBeforeCreating,
        setNotice
      )
        .then((result) => {
          if (result.jwt) {
            setJwt(result.jwt);
          } else {
            // the error message has already been displayed by fetchOrCreateJWT,
            // but we need to allow the user to recover by enabling all functionality
            setHasInitialRoom(false);

            if (result.retryLater) {
              wait(5_000).then(() => tryFetchJwt(roomName));
            }
          }
        })
        .catch(console.error)
        .finally(() => setIsEstablishingCall(false));
    };

    if (roomName) {
      // keep the url in sync with the any room name configured
      window.history.replaceState(null, "", `/${roomName}`);

      tryFetchJwt(roomName);
    }
  }, [roomName, waitForSubscriptionBeforeCreating]);

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
    onStartCall: doStartCall,
  };
}
