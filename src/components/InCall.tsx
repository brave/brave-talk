import { useEffect, useRef, useState } from "react";
import { IJitsiMeetApi, JitsiContext } from "../jitsi/types";
import { renderConferencePage } from "../jitsi/conference-page";
import { jitsiOptions } from "../jitsi/options";
import {
  breakoutRoomsUpdatedHandler,
  dataChannelOpenedHandler,
  endpointTextMessageReceivedHandler,
  errorOccurredHandler,
  participantJoinedHandler,
  participantKickedOutHandler,
  participantLeftHandler,
  passwordRequiredHandler,
  readyToCloseHandler,
  recordingLinkAvailableHandler,
  recordingStatusChangedHandler,
  subjectChangeHandler,
  videoQualityChangeHandler,
  videoConferenceJoinedHandler,
  sendCryptoButtonPressedHandler,
  onEndpointTextMessageForCryptoSendHandler,
} from "../jitsi/event-handlers";

import { CryptoWrapper } from "./web3/crypto/CryptoWrapper";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
  isCallReady: boolean;
  isWeb3Call: boolean;
  jitsiContext: JitsiContext;
  web3Account: "ETH" | "SOL" | null;
}

export const InCall = ({
  roomName,
  jwt,
  isMobile,
  isCallReady,
  isWeb3Call,
  jitsiContext: context,
  web3Account,
}: Props) => {
  const divRef = useRef(null);
  const [jitsiMeet, setJitsiMeet] = useState<IJitsiMeetApi>();

  // why not fix the isWeb3Call setting? because it breaks if we fix it naively. This works for now.
  const callIsWeb3 = jwt
    ? jwt_decode(jwt).context["x-brave-features"].web3 === "true"
    : false;

  useEffect(() => {
    if (!jitsiMeet && divRef.current && isCallReady) {
      const jitsiEventHandlers = [
        subjectChangeHandler,
        videoQualityChangeHandler,
        recordingLinkAvailableHandler,
        recordingStatusChangedHandler,
        readyToCloseHandler,
        breakoutRoomsUpdatedHandler,
        participantJoinedHandler,
        participantKickedOutHandler,
        participantLeftHandler,
        passwordRequiredHandler,
        errorOccurredHandler,
        dataChannelOpenedHandler,
        endpointTextMessageReceivedHandler,
        videoConferenceJoinedHandler,
        sendCryptoButtonPressedHandler,
        onEndpointTextMessageForCryptoSendHandler,
      ];

      const options = jitsiOptions(roomName, divRef.current, jwt, isMobile);

      renderConferencePage(jitsiEventHandlers, options, context).then(
        setJitsiMeet,
      );
    }
  }, [
    divRef,
    jitsiMeet,
    roomName,
    jwt,
    isMobile,
    isCallReady,
    isWeb3Call,
    context,
  ]);

  if (!isCallReady) {
    return null;
  }

  return (
    <div ref={divRef} css={{ height: "100%" }}>
      {callIsWeb3 && <CryptoWrapper jitsi={jitsiMeet} />}
    </div>
  );
};
