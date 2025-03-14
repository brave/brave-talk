import { reportAction, reportMethod } from "../lib";
import { config } from "../environment";
import { inactiveTimeout, updateSubject } from "./lib";
import { ensureJitsiApiLoaded } from "./init";
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

function clearAvatarInfoFromLocalStorage() {
  const jitsiLocalStorageSettings =
    window.localStorage.getItem("jitsiLocalStorage");
  if (jitsiLocalStorageSettings) {
    const jitsiLocalStorageSettingsObj = JSON.parse(jitsiLocalStorageSettings);
    let baseSettings = jitsiLocalStorageSettingsObj["features/base/settings"];
    if (baseSettings) {
      baseSettings = JSON.parse(baseSettings);
      baseSettings["avatarURL"] = "";
      jitsiLocalStorageSettingsObj["features/base/settings"] =
        JSON.stringify(baseSettings);
    }
    window.localStorage.setItem(
      "jitsiLocalStorage",
      JSON.stringify(jitsiLocalStorageSettingsObj),
    );
  }
}

export const renderConferencePage = async (
  jitsiEventHandlers: JitsiEventHandler[],
  options: JitsiOptions,
  context: JitsiContext,
): Promise<IJitsiMeetApi> => {
  await ensureJitsiApiLoaded();
  const { roomName, jwt } = options;
  reportMethod("renderConferencePage", { roomName, jwt });
  reportMethod("JitsiMeetExternalAPI", options);
  clearAvatarInfoFromLocalStorage();
  const JitsiMeetJS = new JitsiMeetExternalAPI(config.webrtc_domain, options);
  reportAction("JitsiMeetExternalAPI", { status: "activated!" });
  updateSubject(JitsiMeetJS, options);

  if (context.inactiveInterval) {
    context.inactiveTimer = setTimeout(
      inactiveTimeout(JitsiMeetJS, context),
      context.inactiveInterval,
    );
  }
  window.sessionStorage.removeItem("avatar_url");
  jitsiEventHandlers.forEach(({ name, fn }: JitsiEventHandler) => {
    JitsiMeetJS.on(name, fn(JitsiMeetJS, context, options));
  });

  return JitsiMeetJS;
};
