import { isProduction } from "../environment";
import { reportAction } from "../lib";
import {
  IJitsiMeetApi,
  JitsiContext,
  JitsiOptions,
  JitsiTranscriptionChunk,
  JitsiRoomResult,
  JitsiRoom,
  JitsiParticipant,
  JitsiTranscriptionStatusEvent,
} from "./types";
import {
  availableRecordings,
  resetCurrentRecordingState,
} from "../recordings-store";
import { acquireWakeLock, releaseWakeLock } from "../wakelock";
import {
  nowActive,
  updateRecTimestamp,
  askOnUnload,
  updateSubject,
} from "./lib";
import { TranscriptManager } from "../transcripts";

const isBrave = true;

export const subjectChangeHandler = (transcriptManager: TranscriptManager) => ({
  name: "subjectChange",
  fn:
    (jitsi: IJitsiMeetApi, _context: JitsiContext, options: JitsiOptions) =>
    (params: any) => {
      reportAction("subjectChange", params);
      addEventForTranscript(jitsi, "subjectChange", params, transcriptManager);

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
});

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
        resetCurrentRecordingState();
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

export const participantJoinedHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "participantJoined",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantJoined", params);
    addEventForTranscript(
      jitsi,
      "participantJoined",
      params,
      transcriptManager,
    );
  },
});

export const participantKickedOutHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "participantKickedOut",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantKickedOut", params);
    addEventForTranscript(
      jitsi,
      "participantKickedOut",
      params,
      transcriptManager,
    );

    if (context.web3Participants) {
      delete context.web3Participants[params.id];
      reportAction("web3 participants", context.web3Participants);
    }
  },
});

export const participantLeftHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "participantLeft",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantLeft", params);
    addEventForTranscript(jitsi, "participantLeft", params, transcriptManager);

    if (context.web3Participants) {
      delete context.web3Participants[params.id];
      reportAction("web3 participants", context.web3Participants);
    }
  },
});

export const knockingParticipantHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "knockingParticipant",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "knockingParticipant", params);
    addEventForTranscript(
      jitsi,
      "knockingParticipant",
      params,
      transcriptManager,
    );
  },
});

export const raiseHandUpdatedHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "raiseHandUpdated",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "raiseHandUpdated", params);
    addEventForTranscript(jitsi, "raiseHandUpdated", params, transcriptManager);
  },
});

export const displayNameChangeHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "displayNameChange",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "displayNameChange", params);
    addEventForTranscript(
      jitsi,
      "displayNameChange",
      params,
      transcriptManager,
    );
  },
});

export const incomingMessageHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "incomingMessage",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    if (params.privateMessage) {
      params.from = "";
      params.nick = "";
      params.message = "";
    }
    nowActive(jitsi, context, "incomingMessage", params);
    addEventForTranscript(jitsi, "incomingMessage", params, transcriptManager);
  },
});

export const outgoingMessageHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "outgoingMessage",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    if (params.privateMessage) {
      params.message = "";
    }
    nowActive(jitsi, context, "outgoingMessage", params);
    addEventForTranscript(jitsi, "outgoingMessage", params, transcriptManager);
  },
});

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

let myUserID = "";
export const videoConferenceJoinedHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "videoConferenceJoined",
  fn: () => (params: any) => {
    reportAction("videoConferenceJoined", params);

    myUserID = params.id;

    // Prevent the screen from turning off while in the video conference
    acquireWakeLock();

    if (!isBrave) {
      return;
    }
    // Delay transcript retrieval to give server a chance
    // recognize new participant.
    setTimeout(async () => {
      await transcriptManager.initTranscript(false);
    }, 7500);
  },
});

export const transcriptionChunkReceivedHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "transcriptionChunkReceived",
  fn: (jitsi: IJitsiMeetApi) => (params: any) => {
    if (!isBrave) {
      return;
    }
    const chunk: JitsiTranscriptionChunk = params.data;
    reportAction("transcriptionChunkReceived", chunk);

    transcriptManager.doT(jitsi);
    transcriptManager.processChunk(chunk);
    transcriptManager.updateTranscript();
  },
});

export const transcribingStatusChangedHandler = (
  transcriptManager: TranscriptManager,
) => ({
  name: "transcribingStatusChanged",
  fn: (jitsi: IJitsiMeetApi) => async (params: any) => {
    if (!isBrave) {
      return;
    }

    const event: JitsiTranscriptionStatusEvent = params;
    reportAction("transcribingStatusChanged", event);

    if (event.on) {
      await transcriptManager.handleTranscriptionEnabledEvent(jitsi);
    }
  },
});

let didS = false;
let serialNo = 0;

const addEventForTranscript = (
  jitsi: IJitsiMeetApi,
  event: string,
  params: any,
  transcriptManager: TranscriptManager,
) => {
  if (!isBrave) {
    return;
  }
  reportAction(`addEventForTranscript: ${event}`, params);

  serialNo++;
  const messageID = `event.${serialNo}`;
  let delta = Math.ceil(
    (new Date().getTime() - transcriptManager.start) / 1000,
  );

  const text = {
    subjectChange: () => {
      if (params.subject !== "" && params.subject !== "Brave Talk") {
        didS = true;
        return `The conference subject is now ${params.subject}`;
      }
      if (!didS) {
        return "";
      }
      didS = false;
      return "The conference no longer has a subject";
    },
    participantJoined: () => {
      participants[params.id] = params.displayName;
      return `Participant ${params.displayName} has joined`;
    },
    participantKickedOut: () => {
      const kicked = participants[params.kicked.id] || params.kicked.id;
      const kicker = participants[params.kicker.id] || params.kicker.id;
      delete participants[params.kicked.id];
      return `Participant ${kicked} has been kicked out by ${kicker}`;
    },
    participantLeft: () => {
      const participant = participants[params.id] || params.id;
      delete participants[params.id];
      return `Participant ${participant} has left`;
    },
    knockingParticipant: () => {
      return `Participant ${params.participant.name} is asking to join`;
    },
    raiseHandUpdated: () => {
      if (params.id === "local") {
        return "";
      }

      const participant = participants[params.id] || params.id;
      return `Participant ${participant} has ${
        params.handRaised ? "raised" : "lowered"
      } a hand`;
    },
    displayNameChange: () => {
      const participant = participants[params.id] || params.id;
      participants[params.id] = params.displayname;
      return `Participant ${participant} is now known as ${params.displayname}`;
    },
    incomingMessage: () => {
      if (params.privateMessage) {
        return "";
      }

      const participant = participants[params.from] || params.from;
      return `Participant ${participant} wrote: ${params.message}`;
    },
    outgoingMessage: () => {
      if (params.privateMessage) {
        return "";
      }

      const participant = participants[myUserID] || myUserID;
      return `Participant ${participant} wrote: ${params.message}`;
    },

    getRoomsInfo: () => {
      let present =
        "This is a transcript of a Brave Talk meeting. Participants present:";
      let s = " ";

      params.rooms.forEach((room: JitsiRoom) => {
        if (!room.isMainRoom) {
          return;
        }

        delta = 0;
        room.participants.forEach((participant: JitsiParticipant) => {
          participants[participant.id] = participant.displayName;
          present += `${s}${participant.displayName || participant.id}`;
          s = ", ";
        });
      });
      return present;
    },
  }[event];
  let final = "";
  if (text) {
    final = text();
  }
  if (!final || !transcriptManager.didT) {
    return;
  }

  if (event !== "getRoomsInfo") {
    transcriptManager.messageIDs.push(messageID);
  } else {
    transcriptManager.prompt = final;
  }
  const chunk = {
    language: "en",
    messageID: messageID,
    final: final,
    delta: delta,
    elapsed: transcriptManager.delta2elapsed(delta),
  };

  transcriptManager.data[messageID] = chunk;

  transcriptManager.updateTranscript();
};

let participants: { [key: string]: string } = {};

export const getParticipants = (
  jitsi: IJitsiMeetApi,
  transcriptManager: TranscriptManager,
) => {
  participants = {};

  jitsi.getRoomsInfo().then((result: JitsiRoomResult) => {
    addEventForTranscript(jitsi, "getRoomsInfo", result, transcriptManager);
  });
};
