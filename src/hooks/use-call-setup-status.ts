import { useEffect, useState } from "react";
import { TranslationKeys } from "../i18n/i18next";
import { POAP } from "../components/web3/core";
import { Web3Authentication } from "../components/web3/api";
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
  retryAsWeb3?: boolean;
}

const fetchOrCreateJWT = async (
  roomName: string,
  createP: boolean,
  waitForSubscriptionBeforeCreating: boolean,
  notice: (message: TranslationKeys) => void,
  web3: Web3CallSetup
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
    } else if (err.message.includes("Retry as Web3 call")) {
      return { retryAsWeb3: true };
    } else {
      console.error(error);
      notice(error.message);
      return {};
    }
  }
};

interface Web3CallSetup {
  isWeb3Call: boolean;
  web3Address?: string;
  web3Auth?: Web3Authentication;
  nft?: string;
  participantPoaps?: POAP[];
  moderatorPoaps?: POAP[];
  setIsWeb3Call: (isWeb3Call: boolean) => void;
  setWeb3Address: (web3Address: string) => void;
  setWeb3Auth: (web3Auth: Web3Authentication) => void;
  setNft: (nft: string) => void;
  setParticipantPoaps: (participanPoaps: POAP[]) => void;
  setModeratorPoaps: (moderatorPoaps: POAP[]) => void;
}

interface CallSetup {
  roomName?: string;
  jwt?: string;
  notice?: TranslationKeys;
  isEstablishingCall: boolean;
  hasInitialRoom: boolean;
  onStartCall: () => void;
  isCallReady: boolean;
  web3: Web3CallSetup;
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
  const [isWeb3Call, setIsWeb3Call] = useState(false);
  const [web3Address, setWeb3Address] = useState<string>();
  const [web3Auth, setWeb3Auth] = useState<Web3Authentication>();
  const [nft, setNft] = useState<string>();
  const [participantPoaps, setParticipantPoaps] = useState<POAP[]>();
  const [moderatorPoaps, setModeratorPoaps] = useState<POAP[]>();
  const [jwt, setJwt] = useState<string>();
  const [notice, setNotice] = useState<TranslationKeys>();
  const [isEstablishingCall, setIsEstablishingCall] = useState(false);
  const isCallReady = !!(roomName && jwt);

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
          }
          if (result.retryAsWeb3) {
            // Convert this to a web3 call
            setIsWeb3Call(true);
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
  }, [roomName, waitForSubscriptionBeforeCreating, isWeb3Call, web3Address]);

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
    isCallReady,
    web3: {
      isWeb3Call,
      web3CallReady,
      web3Address,
      nft,
      participantPoaps,
      moderatorPoaps,
      setIsWeb3Call,
      setWeb3Address,
      setWeb3Auth,
      setNft,
      setParticipantPoaps,
      setModeratorPoaps,
    },
  };
}
