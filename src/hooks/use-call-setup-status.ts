import { useEffect, useState } from "react";
import {
  extractRoomNameFromPath,
  generateRoomName,
  reportAction,
  reportMethod,
} from "../lib";
import { fetchJWT } from "../rooms";

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
  errorMessage?: string;
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
      if (waitForSubscriptionBeforeCreating) {
        /* TODO - how to implement this logic! */
        notice(
          "TODO: now want to wait for a subscriber to create the room if not subscribed!"
        );
        // const isSubscribed = await userIsSubscribed();
        // if (!isSubscribed) {
        //   notice("Waiting for a subscriber to create the room...");
        //   renderHomePage({
        //     showSubscribeCTA: true,
        //     showStartCall: true,
        //     roomNameOverride: roomName,
        //   });
        //   setAutoOpenRoom(roomName);
        //   setTimeout(() => joinConferenceRoom(roomName, false), 5_000);

        return { errorMessage: "Not yet implemented" };
      }

      reportAction(`Creating room`, { roomName });
      return await fetchOrCreateJWT(roomName, true, false, notice);
    } else {
      console.error(error);
      notice(error.message);
      return { errorMessage: error.message };
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

export function useCallSetupStatus(): CallSetup {
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
    if (roomName) {
      // keep the url in sync with the any room name configured
      window.history.replaceState(null, "", `/${roomName}`);

      // and if we don't have a jwt fetch one
      setIsEstablishingCall(true);
      fetchOrCreateJWT(roomName, false, false, setNotice)
        .then((result) => {
          if (result.jwt) {
            setJwt(result.jwt);
          } else {
            // the error message has already been displayed by fetchOrCreateJWT,
            // but we need to allow the user to recover by enabling all functionality
            setHasInitialRoom(false);
          }
        })
        .catch(console.error)
        .finally(() => setIsEstablishingCall(false));
    }
  }, [roomName]);

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
