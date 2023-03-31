import { extractValueFromFragment, reportAction, reportMethod } from "../lib";
import { passwordRequiredHandler } from "./event-handlers";
import { config } from "../environment";
import { inactiveTimeout, updateSubject } from "./lib";
import {
  JitsiOptions,
  IJitsiMeetApi,
  JitsiContext,
  JitsiEventHandler,
} from "./types";

/**
 * Renders Jitsi conference page
 * @param {boolean} isMobile - Flag to determine if we're using mobile
 * @param {JitsiEventHandler[]} jitsiEventHandlers - Event handlers to apply for the room
 * @param {JitsiOptions} options - Configuration options for the conference room
 * @returns {IJitsiMeetApi} The Jitsi API instance for the conference room
 */
export const renderConferencePage = (
  jitsiEventHandlers: JitsiEventHandler[],
  options: JitsiOptions
): IJitsiMeetApi => {
  const { roomName, jwt } = options;
  reportMethod("renderConferencePage", { roomName, jwt });
  reportMethod("JitsiMeetExternalAPI", options);

  let JitsiMeetJS = new JitsiMeetExternalAPI(config.webrtc_domain, options);
  reportAction("JitsiMeetExternalAPI", { status: "activated!" });
  updateSubject(JitsiMeetJS, options);

  const context: JitsiContext = {
    recordingLink: undefined,
    recordingTTL: undefined,
    firstTime: true,
    // check every 30 seconds (disable by setting to 0)
    inactiveInterval: 30 * 1000,
    // total 1 hour of inactivity
    inactiveTotal: 120,
    inactiveCount: 0,
    inactiveTimer: undefined,
    passcode: extractValueFromFragment("passcode"),
  };

  if (context.inactiveInterval) {
    context.inactiveTimer = setTimeout(
      inactiveTimeout(JitsiMeetJS, context),
      context.inactiveInterval
    );
  }

  jitsiEventHandlers.forEach(({ name, fn }: JitsiEventHandler) => {
    JitsiMeetJS.on(name, fn(JitsiMeetJS, context, options));
  });

  return JitsiMeetJS;
};
