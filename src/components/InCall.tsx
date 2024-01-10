import { useEffect, useRef, useState } from "react";
import { IJitsiMeetApi, JitsiContext } from "../jitsi/types";
import { renderConferencePage } from "../jitsi/conference-page";
import { jitsiOptions } from "../jitsi/options";
import {
  breakoutRoomsUpdatedHandler,
  dataChannelOpenedHandler,
  displayNameChangeHandler,
  endpointTextMessageReceivedHandler,
  errorOccurredHandler,
  incomingMessageHandler,
  knockingParticipantHandler,
  outgoingMessageHandler,
  participantJoinedHandler,
  participantKickedOutHandler,
  participantLeftHandler,
  passwordRequiredHandler,
  raiseHandUpdatedHandler,
  readyToCloseHandler,
  recordingLinkAvailableHandler,
  recordingStatusChangedHandler,
  subjectChangeHandler,
  transcriptionChunkReceivedHander,
  videoConferenceJoinedHandler,
  videoQualityChangeHandler,
} from "../jitsi/event-handlers";
import { TranscriptManager } from "../transcripts";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
  isCallReady: boolean;
  isWeb3Call: boolean;
  jitsiContext: JitsiContext;
}

export const InCall = ({
  roomName,
  jwt,
  isMobile,
  isCallReady,
  isWeb3Call,
  jitsiContext: context,
}: Props) => {
  const divRef = useRef(null);
  const [jitsiMeet, setJitsiMeet] = useState<IJitsiMeetApi>();
  const [transcript, setTranscript] = useState<string>("");
  const transcriptManager = useRef(new TranscriptManager(setTranscript));

  useEffect(() => {
    if (!jitsiMeet && divRef.current && isCallReady) {
      const jitsiEventHandlers = [
        subjectChangeHandler(transcriptManager.current),
        videoQualityChangeHandler,
        recordingLinkAvailableHandler,
        recordingStatusChangedHandler,
        readyToCloseHandler,
        breakoutRoomsUpdatedHandler,
        participantJoinedHandler(transcriptManager.current),
        participantKickedOutHandler(transcriptManager.current),
        participantLeftHandler(transcriptManager.current),
        knockingParticipantHandler(transcriptManager.current),
        raiseHandUpdatedHandler(transcriptManager.current),
        displayNameChangeHandler(transcriptManager.current),
        incomingMessageHandler(transcriptManager.current),
        outgoingMessageHandler(transcriptManager.current),
        passwordRequiredHandler,
        errorOccurredHandler,
        dataChannelOpenedHandler,
        endpointTextMessageReceivedHandler,
        videoConferenceJoinedHandler(transcriptManager.current),
        transcriptionChunkReceivedHander(transcriptManager.current),
      ];

      transcriptManager.current.jwt = jwt;

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

  const hidden = {
    opacity: "0",
    pointerEvents: "none" as const,
    position: "absolute" as const,
    zIndex: -1,
  };

  return (
    <>
      <div ref={divRef} css={{ height: "100%" }} />{" "}
      <main style={hidden}>{transcript}</main>{" "}
    </>
  );
};
