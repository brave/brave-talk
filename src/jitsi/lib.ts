import { IJitsiMeetApi, JitsiContext, JitsiOptions } from "./types";
import { upsertRecordingForRoom } from "../recordings-store";
import { reportAction } from "../lib";

/**
 * Creates a new recording or updates the expiration time for an existing recording
 * @param {JitsiContext} context - Context for the conference room
 * @returns {void}
 */
export const updateRecTimestamp = (
  context: JitsiContext,
  options: JitsiOptions
) => {
  (function _updateRecTimestamp() {
    if (!context.recordingLink) {
      return;
    }

    upsertRecordingForRoom(
      context.recordingLink,
      options.roomName,
      context.recordingTTL
    );
    setTimeout(_updateRecTimestamp, 5 * 60 * 1000);
  })();
};

/**
 * Tracks number of attendees and hangs up the call if none over a given threshold
 * @param {IJitsiMeetApi} jitsi - The Jitsi API instance for the room
 * @param {JitsiContext} context - The context for the conference room
 * @returns {function} The setTimeout callback
 */
export const inactiveTimeout =
  (jitsi: IJitsiMeetApi, context: JitsiContext) => () => {
    const participantCount = jitsi.getNumberOfParticipants();

    if (participantCount > 1) {
      context.inactiveCount = 0;
    } else {
      context.inactiveCount++;
    }
    console.log(
      "!!! testing inactivity: participants",
      participantCount,
      "and inactive count",
      context.inactiveCount
    );

    if (context.inactiveCount >= context.inactiveTotal) {
      jitsi.executeCommand("hangup");
    } else {
      context.inactiveTimer = setTimeout(
        inactiveTimeout(jitsi, context),
        context.inactiveInterval
      );
    }
  };

/**
 * Resets attendee tracking for the room
 * @param {IJistiMeetApi} jitsi - The Jitsi API instance for the room
 * @param {JitsiContext} context - The context for the conference room
 * @param {string} event - The event triggering the reset
 * @param {any} params - Event params / metadata
 * @returns {void}
 */
export const nowActive = (
  jitsi: IJitsiMeetApi,
  context: JitsiContext,
  event: string,
  params: any
) => {
  if (!context.inactiveInterval) {
    return;
  }
  reportAction(event, params);
  context.inactiveCount = 0;
  clearTimeout(context.inactiveTimer);
  context.inactiveTimer = setTimeout(
    inactiveTimeout(jitsi, context),
    context.inactiveInterval
  );
};

/**
 * Updates the subject of the room
 * @param {IJistiMeetApi} jitsi - The Jitsi API instance for the room
 * @param {JitsiOptions} options - The configuration options for the conference room
 * @returns {void}
 */
export const updateSubject = (jitsi: IJitsiMeetApi, options: JitsiOptions) => {
  try {
    // works for everyone...
    jitsi.executeCommand(
      "localSubject",
      options.interfaceConfigOverwrite.APP_NAME
    );
  } catch (error: any) {
    console.error("!!! failed local subject change", error);
  }

  try {
    // works for moderator...
    jitsi.executeCommand("subject", options.interfaceConfigOverwrite.APP_NAME);
  } catch (error: any) {
    console.error("!!! failed subject change", error);
  }
};

/**
 * Event listener that triggers alert when user tries to reload or close the window/tab
 * @param {any} e - The event that triggered beforeunload
 * @returns {void}
 */
export const askOnUnload = (e: any) => {
  e.returnValue = "";

  window.removeEventListener("beforeunload", askOnUnload);

  // causes the browser to ask whether the user really wants to reload/close
  e.preventDefault();

  window.addEventListener("beforeunload", askOnUnload);
};
