import { useEffect, useRef, useState } from "react";
import { IJitsiMeetApi } from "../jitsi/types";
import { renderConferencePage } from "../jitsi/conference-page";
import { jitsiOptions } from "../jitsi/options";
import {
  subjectChangeHandler,
  videoQualityChangeHandler,
  videoLinkAvailableHandler,
  recordingStatusChangedHandler,
  readyToCloseHandler,
  breakoutRoomsUpdatedHandler,
  participantJoinedHandler,
  participantKickedOutHandler,
  participantLeftHandler,
  passwordRequiredHandler,
} from "../jitsi/event-handlers";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
  isWeb3Call: boolean;
}

export const InCall: React.FC<Props> = (props) => {
  const divRef = useRef(null);
  const [jistiMeet, setJitsiMeet] = useState<IJitsiMeetApi>();

  const options = jitsiOptions(
    props.roomName,
    divRef.current,
    props.jwt,
    props.isMobile
  );

  const jitsiEventHandlers = [
    subjectChangeHandler,
    videoQualityChangeHandler,
    videoLinkAvailableHandler,
    recordingStatusChangedHandler,
    readyToCloseHandler,
    breakoutRoomsUpdatedHandler,
    participantJoinedHandler,
    participantKickedOutHandler,
    participantLeftHandler,
    passwordRequiredHandler,
  ];

  useEffect(() => {
    if (!jistiMeet && divRef.current) {
      setJitsiMeet(renderConferencePage(jitsiEventHandlers, options));
    }
  }, [divRef, jistiMeet, props]);

  return <div ref={divRef} css={{ height: "100%" }} />;
};
