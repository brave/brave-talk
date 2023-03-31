import { reportAction } from "../lib";
import { IJitsiMeetApi, JitsiContext, JitsiOptions } from "./types";
import {
  availableRecordings,
  upsertRecordingForRoom,
} from "../recordings-store";
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

export const videoLinkAvailableHandler = {
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
      window.open(
        window.location.protocol + "//" + window.location.host,
        "_self",
        "noopener"
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
  },
};

export const participantLeftHandler = {
  name: "participantLeft",
  fn: (jitsi: IJitsiMeetApi, context: JitsiContext) => (params: any) => {
    nowActive(jitsi, context, "participantLeft", params);
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
