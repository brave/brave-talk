import { config } from "../environment";
import { getLangPref } from "../get-language-detector";
import { JitsiOptions } from "./types";
import { reportAction } from "../lib";

export const jitsiOptions = (
  roomName: string,
  el: Element | null,
  jwt: string,
  isMobile?: boolean
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
      customParticipantMenuButtons: [
        {
          icon: "data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M10.1 4C7.06241 4 4.59998 6.46243 4.59998 9.5C4.59998 11.4177 5.58061 13.1068 7.07245 14.0926C7.94034 14.6661 8.97964 15 10.1 15C10.5562 15 10.9981 14.9447 11.4199 14.8408C13.8205 14.2499 15.6 12.0815 15.6 9.5C15.6 8.99636 15.5325 8.51005 15.4068 8.04887C14.7703 5.71468 12.6341 4 10.1 4ZM2.59998 9.5C2.59998 5.35786 5.95784 2 10.1 2C13.3975 2 16.1958 4.12726 17.2016 7.08279L20.4472 8.70558C20.7083 8.83613 20.8993 9.07426 20.9701 9.35747L21.9701 13.3575C22.0432 13.6496 21.9807 13.9591 21.8 14.2L18.8 18.2C18.6111 18.4518 18.3148 18.6 18 18.6H14.7386C13.9452 20.3118 12.2124 21.5 10.2 21.5C7.43853 21.5 5.19995 19.2614 5.19995 16.5C5.19995 16.0872 5.25018 15.6852 5.34506 15.3003C3.67061 13.926 2.59998 11.8382 2.59998 9.5ZM7.20102 16.4189C7.20031 16.4458 7.19995 16.4729 7.19995 16.5C7.19995 18.1569 8.5431 19.5 10.2 19.5C11.1104 19.5 11.9271 19.0941 12.4777 18.4528C12.3714 18.3876 12.2768 18.3024 12.2 18.2L11.2358 16.9144C10.865 16.9708 10.4856 17 10.1 17C9.07323 17 8.09341 16.7932 7.20102 16.4189ZM13.273 16.2974L13.5 16.6H17.5L19.9144 13.3808L19.1414 10.2887L17.6 9.51802C17.5929 12.5192 15.8237 15.1047 13.273 16.2974ZM10 5.8C10.3632 5.8 10.6978 5.99689 10.8742 6.31436L13.3742 10.8144C13.5462 11.1241 13.5416 11.5018 13.3619 11.8071C13.1822 12.1125 12.8543 12.3 12.5 12.3H7.5C7.14568 12.3 6.81781 12.1125 6.63813 11.8071C6.45844 11.5018 6.45377 11.1241 6.62584 10.8144L9.12584 6.31436C9.30221 5.99689 9.63683 5.8 10 5.8ZM9.19951 10.3H10.8005L10 8.85913L9.19951 10.3Z' fill='%23687485'/%3E%3C/svg%3E%0A",
          id: "send-crypto",
          text: "Send Crypto",
        },
      ],
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
      resolution: isMobile ? 360 : undefined,
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      toolbarConfig: {
        autoHideWhileChatIsOpen: true,
      },
      // taken from https://github.com/jitsi/jitsi-meet/blob/master/react/features/base/config/constants.ts#L16
      toolbarButtons: [
        "camera",
        "chat",
        "closedcaptions",
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
      transcribingEnabled: false,
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
      DISABLE_TRANSCRIPTION_SUBTITLES: true,

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
          "highlight-moment"
        );
      }
    }
  });

  return options;
};
