import { isProduction } from "../environment";
import { reportAction } from "../lib";
import {
  IJitsiMeetApi,
  JitsiContext,
  JitsiOptions,
  JitsiTranscriptionChunk,
} from "./types";
import { availableRecordings } from "../recordings-store";
import { acquireWakeLock, releaseWakeLock } from "../wakelock";
import {
  nowActive,
  updateRecTimestamp,
  askOnUnload,
  updateSubject,
} from "./lib";

export const subjectChangeHandler = {
  name: "subjectChange",
  fn:
    (jitsi: IJitsiMeetApi, _context: JitsiContext, options: JitsiOptions) =>
    (params: any) => {
      reportAction("subjectChange", params);

      if (options.configOverwrite.disableBeforeUnloadHandlers) {
        // window.addEventListener("onpagehide", (e) => { ... }) appears to be a no-op on iOS
        // and listening for "onbeforeunload" works for both desktop and Android

        if ("onbeforeunload" in window) {
          console.log("!!! listening for beforeunload");
          window.addEventListener("beforeunload", askOnUnload);
        }
      }

      // (used) to reset when someone changes a media device?!?
      if (params.subject === "") {
        updateSubject(jitsi, options);
      }
    },
};

export const videoQualityChangeHandler = {
  name: "videoQualityChanged",
  fn: () => (params: any) => {
    reportAction("videoQualityChanged", params);
  },
};

export const recordingLinkAvailableHandler = {
  name: "recordingLinkAvailable",
  fn:
    (_jitsi: IJitsiMeetApi, context: JitsiContext, options: JitsiOptions) =>
    (params: any) => {
      reportAction("recordingLinkAvailable", params);
      context.recordingLink = params.link;

      const ttl = Math.floor(params.ttl / 1000) || 0;

      if (ttl > 0) context.recordingTTL = ttl;
      updateRecTimestamp(context, options);
    },
};

export const recordingStatusChangedHandler = {
  name: "recordingStatusChanged",
  fn:
    (_: IJitsiMeetApi, context: JitsiContext, options: JitsiOptions) =>
    (params: any) => {
      reportAction("recordingStatusChanged", params);
      if (params.on && !context.recordingLink) {
        const recordings = availableRecordings();
        const record = recordings.find((r) => r.roomName === options.roomName);

        if (record) {
          console.log("!!! resuming recording", record);
          context.recordingLink = record.url;
        } else {
          console.log("!!! unable to find recording for this room");
        }
      }
      updateRecTimestamp(context, options);
      if (!params.on) {
        context.recordingLink = undefined;
      }
    },
};

export const readyToCloseHandler = {
  name: "readyToClose",
  fn:
    (jitsi: IJitsiMeetApi, context: JitsiContext, options: JitsiOptions) =>
    (params: any) => {
      reportAction("readyToClose", params);
      window.removeEventListener("beforeunload", askOnUnload);
      updateRecTimestamp(context, options);
      if (context.inactiveTimer) {
        clearTimeout(context.inactiveTimer);
      }
      jitsi.dispose();
      releaseWakeLock();
      window.open(
        window.location.protocol + "//" + window.location.host,
        "_self",
        "noopener",
      );
    },
};

export const breakoutRoomsUpdatedHandler = {
  name: "breakoutRoomsUpdated",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    reportAction("breakoutRoomsUpdated", params);
    if (!context.firstTime) {
      return;
    }
    context.firstTime = false;

    let roomCount = 0;
    Object.entries(params.rooms).forEach((room) => {
      reportAction("room", room);
      roomCount++;
    });
    console.log("!!! room count=" + roomCount);
    if (roomCount > 1) {
      jitsi.executeCommand("toggleParticipantsPane", { enabled: true });
    }
  },
};

export const participantJoinedHandler = {
  name: "participantJoined",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantJoined", params);
  },
};

export const participantKickedOutHandler = {
  name: "participantKickedOut",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantKickedOut", params);

    if (context.web3Participants) {
      delete context.web3Participants[params.id];
      reportAction("web3 participants", context.web3Participants);
    }
  },
};

export const participantLeftHandler = {
  name: "participantLeft",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantLeft", params);

    if (context.web3Participants) {
      delete context.web3Participants[params.id];
      reportAction("web3 participants", context.web3Participants);
    }
  },
};

export const passwordRequiredHandler = {
  name: "passwordRequired",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (_: any) => {
    if (context.passcode) {
      jitsi.executeCommand("password", context.passcode);
    }
  },
};

export const errorOccurredHandler = {
  name: "errorOccurred",
  fn: () => (params: any) => {
    reportAction("errorOccurred", params);
  },
};

export const endpointTextMessageReceivedHandler = {
  name: "endpointTextMessageReceived",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => async (params: any) => {
    reportAction("endpointTextMessageReceived", params);

    if (isProduction) {
      return;
    }

    if (!context.web3Participants) {
      return;
    }

    try {
      const sender = params.data.senderInfo.id;
      const message = JSON.parse(params.data.eventData.text);
      if (!message.web3) {
        return;
      }

      const type = message.web3.type;
      const payload = message.web3.payload;

      if (type === "broadcast") {
        jitsi.executeCommand(
          "sendEndpointTextMessage",
          sender,
          JSON.stringify({
            web3: { type: "unicast", payload: context.web3Authentication },
          }),
        );
      }

      if (payload.method !== "EIP-4361-json") {
        console.log("!!! payload", payload);
        throw new Error(
          `unsupported method in payload: ${context.web3Authentication?.method}`,
        );
      }

      const proof = payload.proof;
      const hexOctets = proof.payload
        .match(/[\da-f]{2}/gi)
        .map((h: any) => parseInt(h, 16));
      const hexArray = new Uint8Array(hexOctets);
      const payloadBytes = new TextDecoder().decode(hexArray.buffer);
      const { ethers } = await import("ethers");
      const signer = ethers.verifyMessage(payloadBytes, proof.signature);
      if (signer.toLowerCase() !== proof.signer.toLowerCase()) {
        console.log("!!! payload", payload);
        throw new Error(`address mismatch in payload, got ${signer}`);
      }

      context.web3Participants[sender] = proof.signer;
      reportAction("web3 participants", context.web3Participants);
    } catch (error: any) {
      console.error("!!! web3 " + error.message);
    }
  },
};

export const dataChannelOpenedHandler = {
  name: "dataChannelOpened",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    reportAction("dataChannelOpened", params);

    if (isProduction) {
      return;
    }

    if (!context.web3Authentication) {
      return;
    }

    jitsi.executeCommand(
      "sendEndpointTextMessage",
      "",
      JSON.stringify({
        web3: { type: "broadcast", payload: context.web3Authentication },
      }),
    );
  },
};

// Prevent the screen from turning off while in the video conference
export const videoConferenceJoinedHandler = {
  name: "videoConferenceJoined",
  fn: () => () => acquireWakeLock(),
};

const messageIDs: string[] = [];
const data: { [key: string]: JitsiTranscriptionChunk } = {};

export const transcriptionChunkReceivedHander = (
  onTranscriptChange: (transcript: string) => void,
) => ({
  name: "transcriptionChunkReceived",
  fn: () => (params: any) => {
    const chunk: JitsiTranscriptionChunk = params.data;
    reportAction("transcriptionChunkReceived", chunk);

    const messageID = chunk.messageID;

    if (!data[messageID]) {
      messageIDs.push(messageID);
    }
    data[messageID] = chunk;

    let transcript = "";
    let participantName = "";
    for (const messageID of messageIDs) {
      const chunk = data[messageID];
      if (participantName !== chunk.participant?.name) {
        participantName = chunk.participantName;
        transcript += `\n\n${participantName}: `;
      }
      transcript += chunk.final || chunk.stable || chunk.unstable;
    }
    console.log(`!!! transcript: ${transcript}`);

    onTranscriptChange(transcript);
  },
});
