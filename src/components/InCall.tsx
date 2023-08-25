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
  //onEndpointTextMessageForCryptoHandler,
  // onEndpointTextMessageCryptoSendReturned,
  onEndpointTextMessageForCryptoSendHandler,
} from "../jitsi/event-handlers";

import { CryptoWrapper } from "./web3/SendCryptoPopup";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
  isCallReady: boolean;
  isWeb3Call: boolean;
  jitsiContext: JitsiContext;
  web3Account: "ETH" | "SOL" | null;
}

export const InCall: React.FC<Props> = ({
  roomName,
  jwt,
  isMobile,
  isCallReady,
  isWeb3Call,
  jitsiContext: context,
  web3Account,
}) => {
  const divRef = useRef(null);
  const [jitsiMeet, setJitsiMeet] = useState<IJitsiMeetApi>();

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
        //onEndpointTextMessageForCryptoHandler,
        // onEndpointTextMessageCryptoSendReturned,
        onEndpointTextMessageForCryptoSendHandler,
      ];

      const options = jitsiOptions(roomName, divRef.current, jwt, isMobile);

      renderConferencePage(jitsiEventHandlers, options, context).then(
        setJitsiMeet
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
      {isWeb3Call && <CryptoWrapper jitsi={jitsiMeet} />}
    </div>
  );
};
