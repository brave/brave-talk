import { config } from "../environment";
import { getLangPref } from "../get-language-detector";
import { JitsiOptions } from "./types";
import { reportAction } from "../lib";

export const jitsiOptions = (
  roomName: string,
  el: Element | null,
  jwt: string,
  isMobile?: boolean,
): JitsiOptions => {
  const options = {
    roomName: config.vpaas + "/" + roomName,
    jwt: jwt,
    parentNode: el,
    lang: getLangPref(),

    configOverwrite: {
      analytics: {
        disabled: true,
        rtcstatsEnabled: false,
      },
      brandingRoomAlias: roomName,
      callStatsID: false,
      callStatsSecret: false,
      conferenceInfo: {
        autoHide: [
          "subject",
          "conference-timer",
          "participants-count",
          "e2ee",
          "transcribing",
          "video-quality",
          "insecure-room",
          // "highlight-moment"
          "top-panel-toggle",
        ],
      },
      disabledSounds: ["E2EE_OFF_SOUND", "E2EE_ON_SOUND"],
      disableGTM: true,
      doNotStoreRoom: true,
      disableBeforeUnloadHandlers: true,
      disableInviteFunctions: false,
      disableTileEnlargement: true,
      dropbox: {
        appKey: null,
      },
      e2eeLabels: {
        e2ee: "Video Bridge Encryption",
        labelToolTip:
          "Audio and Video Communication on this call is encrypted on the video bridge",
        description:
          "Video Bridge Encryption is currently EXPERIMENTAL. Please keep in mind that turning it on will effectively disable server-side provided services such as: phone participation. Also keep in mind that the meeting will only work for people joining from browsers with support for insertable streams.  Note that chats will not use this encryption.",
        label: "Enable Video Bridge Encryption",
        warning:
          "WARNING: Not all participants in this meeting seem to have support for Video Bridge Encryption. If you enable it they won't be able to see nor hear you.",
      },
      enableTalkWhileMuted: false,
      faceLandmarks: {
        enableFaceExpressionsDetection: false,
        enableDisplayFaceExpressions: false,
      },
      giphy: {
        enabled: false,
      },
      hideEmailInSettings: true,
      inviteAppName: "Brave Talk",
      localSubject: "Brave Talk",
      prejoinPageEnabled: true,
      recordings: {
        recordAudioAndVideo: false,
      },
      resolution: isMobile ? 360 : undefined,
      roomPasswordNumberOfDigits: false,
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      localRecording: {
        disable: true,
      },
      toolbarConfig: {
        autoHideWhileChatIsOpen: true,
      },
      // taken from https://github.com/jitsi/jitsi-meet/blob/master/react/features/base/config/constants.ts#L16
      // DO NOT ADD "subtitles" without first talking with the JAAS folks first, or else!
      toolbarButtons: [
        "camera",
        "chat",
        "desktop",
        "download",
        "embedmeeting",
        "etherpad",
        "feedback",
        "filmstrip",
        "fullscreen",
        "hangup",
        "help",
        "highlight",
        "invite",
        "linktosalesforce",
        "livestreaming",
        "microphone",
        "mute-everyone",
        "mute-video-everyone",
        "participants-pane",
        "profile",
        "raisehand",
        // added to help de-clutter hand raising and gestures
        "reactions",
        "recording",
        "security",
        "select-background",
        "settings",
        "shareaudio",
        "noisesuppression",
        "sharedvideo",
        "shortcuts",
        "stats",
        "tileview",
        "toggle-camera",
        "videoquality",
        "whiteboard",
      ],
      transcribingEnabled: true,
      useHostPageLocalStorage: true,
      videoQuality: {
        persist: true,
      },
    },

    interfaceConfigOverwrite: {
      APP_NAME: "Brave Talk",
      DEFAULT_BACKGROUND: "#3B3E4F",
      DEFAULT_LOCAL_DISPLAY_NAME: "me",
      // a no-op
      DEFAULT_LOGO_URL: "https://talk.brave.com/images/brave_logo_dark.svg",
      DEFAULT_REMOTE_DISPLAY_NAME: "User",
      DISABLE_TRANSCRIPTION_SUBTITLES: false,

      //          DISABLE_FOCUS_INDICATOR: true,
      //          DISABLE_DOMINANT_SPEAKER_INDICATOR: true,

      // a no-op
      JITSI_WATERMARK_LINK: "https://brave.com",
      NATIVE_APP_NAME: "Brave Talk",
      PROVIDER_NAME: "Brave",
      //          SET_FILMSTRIP_ENABLED: false,
      // remove 'dial-in'
      SHARING_FEATURES: ["email", "url", "embed"],
      SHOW_CHROME_EXTENSION_BANNER: false,
      SUPPORT_URL: "https://community.brave.com/",
      TOOLBAR_BUTTONS: [
        "microphone",
        "camera",
        "desktop",
        "embedmeeting",
        "fullscreen",
        "fodeviceselection",
        "hangup",
        "profile",
        "chat",
        // must be enabled in JWT context.features object
        // "recording",
        // "livestreaming",
        "etherpad",
        "sharedvideo",
        "shareaudio",
        "settings",
        "raisehand",
        "videoquality",
        "filmstrip",
        "participants-pane",
        "feedback",
        "stats",
        "shortcuts",
        "tileview",
        "select-background",
        "help",
        "mute-everyone",
        "mute-video-everyone",
        "security",
        "toggle-camera",
        "invite",
      ],
    },

    onload: () => {
      document.title = options.interfaceConfigOverwrite.APP_NAME;
    },
  };

  const features = jwt_decode(jwt)?.context?.features;

  reportAction("features", { features });

  Object.entries(features).forEach(([feature, state]) => {
    if (state === "true") {
      options.interfaceConfigOverwrite.TOOLBAR_BUTTONS.push(feature);
      if (feature === "recording") {
        options.configOverwrite.conferenceInfo.autoHide.push(
          "highlight-moment",
        );
      }
    }
  });

  return options;
};
