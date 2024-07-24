import { useEffect, useRef, useState } from "react";
import { css } from "@emotion/react";
import { IJitsiMeetApi, JitsiContext } from "../jitsi/types";
import { renderConferencePage } from "../jitsi/conference-page";
import { jitsiOptions } from "../jitsi/options";
import {
  breakoutRoomsUpdatedHandler,
  buttonHandler,
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
  transcribingStatusChangedHandler,
  transcriptionChunkReceivedHandler,
  videoConferenceJoinedHandler,
  videoQualityChangeHandler,
} from "../jitsi/event-handlers";
import { TranscriptManager } from "../transcripts";
import { resetCurrentRecordingState } from "../recordings-store";

interface Props {
  roomName: string;
  jwt: string;
  isMobile: boolean;
  isCallReady: boolean;
  isWeb3Call: boolean;
  jitsiContext: JitsiContext;
}

const DEFAULT_TRANSCRIPT = `Transcripts are not enabled for this call. You can ask the host to enable transcripts by going to "More options" and selecting "Start recording".`;

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
  const [transcript, setTranscript] = useState<string>(DEFAULT_TRANSCRIPT);
  const transcriptManager = useRef(new TranscriptManager(setTranscript));

  useEffect(() => {
    if (!jitsiMeet && divRef.current && isCallReady) {
      transcriptManager.current.roomName = roomName;
      transcriptManager.current.jwt = jwt;

      resetCurrentRecordingState(roomName);

      const options = jitsiOptions(roomName, divRef.current, jwt, isMobile);

      const resetLeoButton = !options.configOverwrite.customToolbarButtons.find(
        (button) => button.id === "leo",
      )
        ? () => {}
        : (jitsi: IJitsiMeetApi, transcriptionIsOn: boolean) => {
            const buttons = options.configOverwrite.customToolbarButtons;
            if (buttons.find((button) => button.id === "leo")) {
              // remove button
              jitsi.executeCommand("overwriteConfig", {
                customToolbarButtons: buttons.filter(
                  (button) => button.id !== "leo",
                ),
              });
              // re-add button with new text
              jitsi.executeCommand("overwriteConfig", {
                customToolbarButtons: buttons.map((button) => {
                  if (button.id === "leo") {
                    return {
                      id: button.id,
                      icon: button.icon,
                      text: transcriptionIsOn
                        ? "Disable Transcript"
                        : "Enable Transcript",
                    };
                  }
                }),
              });
            }
          };

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
        transcriptionChunkReceivedHandler(transcriptManager.current),
        transcribingStatusChangedHandler(
          transcriptManager.current,
          resetLeoButton,
        ),
        buttonHandler(transcriptManager.current),
      ];

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

  const hiddenStyle = css({
    opacity: "0",
    pointerEvents: "none" as const,
    position: "fixed" as const,
    zIndex: -1,
  });

  return (
    <>
      <div ref={divRef} css={{ height: "100%" }} />{" "}
      <main css={hiddenStyle}>{transcript}</main>{" "}
    </>
  );
};
