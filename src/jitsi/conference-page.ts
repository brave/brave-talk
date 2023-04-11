import { reportAction, reportMethod } from "../lib";
import { config } from "../environment";
import { inactiveTimeout, updateSubject } from "./lib";
import { getAvatarUrl } from "../components/web3/core";
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
  options: JitsiOptions,
  context: JitsiContext
): IJitsiMeetApi => {
  const { roomName, jwt } = options;
  reportMethod("renderConferencePage", { roomName, jwt });
  reportMethod("JitsiMeetExternalAPI", options);

  const JitsiMeetJS = new JitsiMeetExternalAPI(config.webrtc_domain, options);
  reportAction("JitsiMeetExternalAPI", { status: "activated!" });
  updateSubject(JitsiMeetJS, options);

  if (context.inactiveInterval) {
    context.inactiveTimer = setTimeout(
      inactiveTimeout(JitsiMeetJS, context),
      context.inactiveInterval
    );
  }

  const avatarUrl = getAvatarUrl();
  if (avatarUrl) {
    JitsiMeetJS.executeCommand("avatarUrl", avatarUrl);
  }

  jitsiEventHandlers.forEach(({ name, fn }: JitsiEventHandler) => {
    JitsiMeetJS.on(name, fn(JitsiMeetJS, context, options));
  });

  return JitsiMeetJS;
};
