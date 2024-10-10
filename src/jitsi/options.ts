import { config } from "../environment";
import { getLangPref } from "../get-language-detector";
import { CustomToolbarButton, JitsiOptions } from "./types";
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
      buttonsWithNotifyClick: <string[]>[],
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
      customToolbarButtons: <CustomToolbarButton[]>[],
      disabledSounds: ["E2EE_OFF_SOUND", "E2EE_ON_SOUND"],
      disableGTM: true,
      disableBeforeUnloadHandlers: true,
      disableInviteFunctions: false,
      // turn off all third-party requests, e.g., for avatars
      // not yet (waiting on iOS update)
      //    disableThirdPartyRequests: true,
      disableTileEnlargement: true,
      doNotStoreRoom: true,
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
      // Default if not moderator
      mainToolbarButtons: [
        [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "reactions",
          "participants-pane",
          "tileview",
        ],
        [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "participants-pane",
          "tileview",
        ],
        [
          "microphone",
          "camera",
          "desktop",
          "chat",
          "raisehand",
          "participants-pane",
        ],
        ["microphone", "camera", "desktop", "chat", "participants-pane"],
        ["microphone", "camera", "chat", "participants-pane"],
        ["microphone", "camera", "chat"],
        ["microphone", "camera"],
      ],
      // taken from https://github.com/jitsi/jitsi-meet/blob/master/react/features/base/config/constants.ts#L16
      // DO NOT ADD "subtitles"/"closedcaptions" without first talking with the JAAS folks first, or else!
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
      transcription: {
        autoTranscribeOnRecord: false,
      },
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

  const jwtContext = jwt_decode(jwt)?.context;
  const features = jwtContext?.features;
  const isModerator = jwtContext?.user?.moderator === "true";

  reportAction("features", { features });

  Object.entries(features).forEach(([feature, state]) => {
    if (state === "true") {
      options.interfaceConfigOverwrite.TOOLBAR_BUTTONS.push(feature);
      if (feature === "recording") {
        options.configOverwrite.conferenceInfo.autoHide.push(
          "highlight-moment",
        );
      }
      if (feature === "transcription" && isModerator) {
        options.configOverwrite.customToolbarButtons.push(
          leoButtonTranscriptionOff,
        );
        options.configOverwrite.buttonsWithNotifyClick.push("leo");
        options.configOverwrite.mainToolbarButtons = [
          [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "reactions",
            "participants-pane",
            "leo",
          ],
          [
            "microphone",
            "camera",
            "desktop",
            "chat",
            "raisehand",
            "participants-pane",
            "leo",
          ],
          ["microphone", "camera", "desktop", "chat", "raisehand", "leo"],
          ["microphone", "camera", "desktop", "chat", "leo"],
          ["microphone", "camera", "chat", "leo"],
          ["microphone", "camera", "leo"],
          ["microphone", "camera"],
        ];
      }
    }
  });

  return options;
};

export const leoButtonTranscriptionOn: CustomToolbarButton = {
  id: "leo",
  text: "Disable Transcript",
  icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik05LjM1MTc1IDAuMDA1MjQ5MDJDOC4zMjY1MSAwLjAwNTI0OTAyIDcuNDMyODMgMC43MDMwMSA3LjE4NDE3IDEuNjk3NjRMNi42OTMyMSAzLjY2MTQ5QzYuMzE5OTkgNS4xNTQzNiA1LjE1NDM2IDYuMzE5OTkgMy42NjE0OSA2LjY5MzIxTDEuNjk3NjQgNy4xODQxN0MwLjcwMzAxMyA3LjQzMjgzIDAuMDA1MjQ5MDIgOC4zMjY1IDAuMDA1MjQ5MDIgOS4zNTE3NUMwLjAwNTI0OTAyIDEwLjM3NyAwLjcwMzAxMiAxMS4yNzA3IDEuNjk3NjQgMTEuNTE5M0wzLjY2MTQ5IDEyLjAxMDNDNS4xNTQzNiAxMi4zODM1IDYuMzE5OTkgMTMuNTQ5MSA2LjY5MzIxIDE1LjA0Mkw3LjE4NDE3IDE3LjAwNTlDNy40MzI4MyAxOC4wMDA1IDguMzI2NTEgMTguNjk4MiA5LjM1MTc1IDE4LjY5ODJDMTAuMzc3IDE4LjY5ODIgMTEuMjcwNyAxOC4wMDA1IDExLjUxOTMgMTcuMDA1OUwxMi4wMTAzIDE1LjA0MkMxMi4zODM1IDEzLjU0OTEgMTMuNTQ5MSAxMi4zODM1IDE1LjA0MiAxMi4wMTAzTDE3LjAwNTggMTEuNTE5M0MxOC4wMDA1IDExLjI3MDcgMTguNjk4MiAxMC4zNzcgMTguNjk4MiA5LjM1MTc1QzE4LjY5ODIgOC4zMjY1IDE4LjAwMDUgNy40MzI4MyAxNy4wMDU4IDcuMTg0MTdMMTUuMDQyIDYuNjkzMjFDMTMuNTQ5MSA2LjMxOTk5IDEyLjM4MzUgNS4xNTQzNiAxMi4wMTAzIDMuNjYxNDlMMTEuNTE5MyAxLjY5NzY0QzExLjI3MDcgMC43MDMwMDkgMTAuMzc3IDAuMDA1MjQ5MDIgOS4zNTE3NSAwLjAwNTI0OTAyWk04Ljc1OTM4IDIuMDkxNDRDOC44MjczMyAxLjgxOTYyIDkuMDcxNTYgMS42Mjg5MyA5LjM1MTc1IDEuNjI4OTNDOS42MzE5MyAxLjYyODkzIDkuODc2MTYgMS44MTk2MiA5Ljk0NDEyIDIuMDkxNDRMMTAuNDM1MSA0LjA1NTI5QzEwLjk1MzcgNi4xMjk5IDEyLjU3MzYgNy43NDk3NiAxNC42NDgyIDguMjY4NDFMMTYuNjEyIDguNzU5MzhDMTYuODgzOSA4LjgyNzMzIDE3LjA3NDYgOS4wNzE1NiAxNy4wNzQ2IDkuMzUxNzVDMTcuMDc0NiA5LjYzMTkzIDE2Ljg4MzkgOS44NzYxNiAxNi42MTIgOS45NDQxMkwxNC42NDgyIDEwLjQzNTFDMTIuNTczNiAxMC45NTM3IDEwLjk1MzcgMTIuNTczNiAxMC40MzUxIDE0LjY0ODJMOS45NDQxMiAxNi42MTIxQzkuODc2MTYgMTYuODgzOSA5LjYzMTkzIDE3LjA3NDYgOS4zNTE3NSAxNy4wNzQ2QzkuMDcxNTYgMTcuMDc0NiA4LjgyNzMzIDE2Ljg4MzkgOC43NTkzOCAxNi42MTIxTDguMjY4NDIgMTQuNjQ4MkM3Ljc0OTc2IDEyLjU3MzYgNi4xMjk5IDEwLjk1MzcgNC4wNTUyOSAxMC40MzUxTDIuMDkxNDQgOS45NDQxMkMxLjgxOTYyIDkuODc2MTYgMS42Mjg5MyA5LjYzMTkzIDEuNjI4OTMgOS4zNTE3NUMxLjYyODkzIDkuMDcxNTYgMS44MTk2MiA4LjgyNzMzIDIuMDkxNDQgOC43NTkzOEw0LjA1NTI5IDguMjY4NDJDNi4xMjk5IDcuNzQ5NzYgNy43NDk3NiA2LjEyOTkgOC4yNjg0MiA0LjA1NTI5TDguNzU5MzggMi4wOTE0NFpNMTcuMDY1OSAxMy40NDE5QzE3LjAwMSAxMy4xODIyIDE2Ljc2NzcgMTMgMTYuNSAxM0MxNi4yMzIzIDEzIDE1Ljk5OSAxMy4xODIyIDE1LjkzNDEgMTMuNDQxOUwxNS43MzI3IDE0LjI0NzJDMTUuNTQ5OSAxNC45Nzg3IDE0Ljk3ODcgMTUuNTQ5OSAxNC4yNDcyIDE1LjczMjdMMTMuNDQxOSAxNS45MzQxQzEzLjE4MjIgMTUuOTk5IDEzIDE2LjIzMjMgMTMgMTYuNUMxMyAxNi43Njc3IDEzLjE4MjIgMTcuMDAxIDEzLjQ0MTkgMTcuMDY1OUwxNC4yNDcyIDE3LjI2NzNDMTQuOTc4NyAxNy40NTAxIDE1LjU0OTkgMTguMDIxMyAxNS43MzI3IDE4Ljc1MjhMMTUuOTM0MSAxOS41NTgxQzE1Ljk5OSAxOS44MTc4IDE2LjIzMjMgMjAgMTYuNSAyMEMxNi43Njc3IDIwIDE3LjAwMSAxOS44MTc4IDE3LjA2NTkgMTkuNTU4MUwxNy4yNjczIDE4Ljc1MjhDMTcuNDUwMSAxOC4wMjEzIDE4LjAyMTMgMTcuNDUwMSAxOC43NTI4IDE3LjI2NzNMMTkuNTU4MSAxNy4wNjU5QzE5LjgxNzggMTcuMDAxIDIwIDE2Ljc2NzcgMjAgMTYuNUMyMCAxNi4yMzIzIDE5LjgxNzggMTUuOTk5IDE5LjU1ODEgMTUuOTM0MUwxOC43NTI4IDE1LjczMjdDMTguMDIxMyAxNS41NDk5IDE3LjQ1MDEgMTQuOTc4NyAxNy4yNjczIDE0LjI0NzJMMTcuMDY1OSAxMy40NDE5WiIgZmlsbD0idXJsKCNwYWludDBfbGluZWFyXzI4MF81OTQ5KSIvPgo8ZGVmcz4KPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDBfbGluZWFyXzI4MF81OTQ5IiB4MT0iMTguOTYxMyIgeTE9IjE4LjYxODIiIHgyPSItMC4wMTMyNzg0IiB5Mj0iMC4wMjQxMzc0IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CjxzdG9wIG9mZnNldD0iMC4wMjYwNDE3IiBzdG9wLWNvbG9yPSIjRkE3MjUwIi8+CjxzdG9wIG9mZnNldD0iMC40MDEwNDIiIHN0b3AtY29sb3I9IiNGRjE4OTMiLz4KPHN0b3Agb2Zmc2V0PSIwLjk5NDc5MiIgc3RvcC1jb2xvcj0iI0E3OEFGRiIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+Cjwvc3ZnPiAg",
};

export const leoButtonTranscriptionOff: CustomToolbarButton = {
  id: "leo",
  text: "Enable Transcript",
  icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzExOV8xOTcyMykiPgo8cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTExLjM1MTkgMi4wMDUzN0MxMC4zMjY2IDIuMDA1MzcgOS40MzI5NSAyLjcwMzEzIDkuMTg0MjkgMy42OTc3Nkw4LjY5MzMzIDUuNjYxNjFDOC4zMjAxMiA3LjE1NDQ4IDcuMTU0NDggOC4zMjAxMiA1LjY2MTYxIDguNjkzMzNMMy42OTc3NiA5LjE4NDI5QzIuNzAzMTMgOS40MzI5NSAyLjAwNTM3IDEwLjMyNjYgMi4wMDUzNyAxMS4zNTE5QzIuMDA1MzcgMTIuMzc3MSAyLjcwMzEzIDEzLjI3MDggMy42OTc3NiAxMy41MTk0TDUuNjYxNjEgMTQuMDEwNEM3LjE1NDQ4IDE0LjM4MzYgOC4zMjAxMiAxNS41NDkzIDguNjkzMzMgMTcuMDQyMUw5LjE4NDI5IDE5LjAwNkM5LjQzMjk1IDIwLjAwMDYgMTAuMzI2NiAyMC42OTg0IDExLjM1MTkgMjAuNjk4NEMxMi4zNzcxIDIwLjY5ODQgMTMuMjcwOCAyMC4wMDA2IDEzLjUxOTQgMTkuMDA2TDE0LjAxMDQgMTcuMDQyMUMxNC4zODM2IDE1LjU0OTMgMTUuNTQ5MyAxNC4zODM2IDE3LjA0MjEgMTQuMDEwNEwxOS4wMDYgMTMuNTE5NEMyMC4wMDA2IDEzLjI3MDggMjAuNjk4NCAxMi4zNzcxIDIwLjY5ODQgMTEuMzUxOUMyMC42OTg0IDEwLjMyNjYgMjAuMDAwNiA5LjQzMjk1IDE5LjAwNiA5LjE4NDI5TDE3LjA0MjEgOC42OTMzM0MxNS41NDkzIDguMzIwMTEgMTQuMzgzNiA3LjE1NDQ4IDE0LjAxMDQgNS42NjE2MUwxMy41MTk0IDMuNjk3NzZDMTMuMjcwOCAyLjcwMzEzIDEyLjM3NzEgMi4wMDUzNyAxMS4zNTE5IDIuMDA1MzdaTTEwLjc1OTUgNC4wOTE1NkMxMC44Mjc1IDMuODE5NzQgMTEuMDcxNyAzLjYyOTA2IDExLjM1MTkgMy42MjkwNkMxMS42MzIxIDMuNjI5MDYgMTEuODc2MyAzLjgxOTc1IDExLjk0NDIgNC4wOTE1NkwxMi40MzUyIDYuMDU1NDFDMTIuOTUzOSA4LjEzMDAyIDE0LjU3MzcgOS43NDk4OCAxNi42NDgzIDEwLjI2ODVMMTguNjEyMiAxMC43NTk1QzE4Ljg4NCAxMC44Mjc1IDE5LjA3NDcgMTEuMDcxNyAxOS4wNzQ3IDExLjM1MTlDMTkuMDc0NyAxMS42MzIxIDE4Ljg4NCAxMS44NzYzIDE4LjYxMjIgMTEuOTQ0MkwxNi42NDgzIDEyLjQzNTJDMTQuNTczNyAxMi45NTM5IDEyLjk1MzkgMTQuNTczNyAxMi40MzUyIDE2LjY0ODNMMTEuOTQ0MiAxOC42MTIyQzExLjg3NjMgMTguODg0IDExLjYzMjEgMTkuMDc0NyAxMS4zNTE5IDE5LjA3NDdDMTEuMDcxNyAxOS4wNzQ3IDEwLjgyNzUgMTguODg0IDEwLjc1OTUgMTguNjEyMkwxMC4yNjg1IDE2LjY0ODNDOS43NDk4OSAxNC41NzM3IDguMTMwMDIgMTIuOTUzOSA2LjA1NTQxIDEyLjQzNTJMNC4wOTE1NiAxMS45NDQyQzMuODE5NzQgMTEuODc2MyAzLjYyOTA2IDExLjYzMjEgMy42MjkwNiAxMS4zNTE5QzMuNjI5MDYgMTEuMDcxNyAzLjgxOTc1IDEwLjgyNzUgNC4wOTE1NiAxMC43NTk1TDYuMDU1NDEgMTAuMjY4NUM4LjEzMDAyIDkuNzQ5ODggOS43NDk4OCA4LjEzMDAyIDEwLjI2ODUgNi4wNTU0MUwxMC43NTk1IDQuMDkxNTZaTTE5LjA2NiAxNS40NDJDMTkuMDAxMSAxNS4xODIzIDE4Ljc2NzggMTUuMDAwMSAxOC41MDAxIDE1LjAwMDFDMTguMjMyNCAxNS4wMDAxIDE3Ljk5OTEgMTUuMTgyMyAxNy45MzQyIDE1LjQ0MkwxNy43MzI5IDE2LjI0NzNDMTcuNTUgMTYuOTc4OCAxNi45Nzg4IDE3LjU1IDE2LjI0NzMgMTcuNzMyOUwxNS40NDIgMTcuOTM0MkMxNS4xODIzIDE3Ljk5OTEgMTUuMDAwMSAxOC4yMzI0IDE1LjAwMDEgMTguNTAwMUMxNS4wMDAxIDE4Ljc2NzggMTUuMTgyMyAxOS4wMDExIDE1LjQ0MiAxOS4wNjZMMTYuMjQ3MyAxOS4yNjc0QzE2Ljk3ODggMTkuNDUwMyAxNy41NSAyMC4wMjE0IDE3LjczMjkgMjAuNzUyOUwxNy45MzQyIDIxLjU1ODNDMTcuOTk5MSAyMS44MTc5IDE4LjIzMjQgMjIuMDAwMSAxOC41MDAxIDIyLjAwMDFDMTguNzY3OCAyMi4wMDAxIDE5LjAwMTEgMjEuODE3OSAxOS4wNjYgMjEuNTU4M0wxOS4yNjc0IDIwLjc1MjlDMTkuNDUwMyAyMC4wMjE0IDIwLjAyMTQgMTkuNDUwMyAyMC43NTI5IDE5LjI2NzRMMjEuNTU4MyAxOS4wNjZDMjEuODE3OSAxOS4wMDExIDIyLjAwMDEgMTguNzY3OCAyMi4wMDAxIDE4LjUwMDFDMjIuMDAwMSAxOC4yMzI0IDIxLjgxNzkgMTcuOTk5MSAyMS41NTgzIDE3LjkzNDJMMjAuNzUyOSAxNy43MzI5QzIwLjAyMTQgMTcuNTUgMTkuNDUwMyAxNi45Nzg4IDE5LjI2NzQgMTYuMjQ3M0wxOS4wNjYgMTUuNDQyWiIgZmlsbD0iI2ZmZmZmZiIvPgo8L2c+CjxkZWZzPgo8Y2xpcFBhdGggaWQ9ImNsaXAwXzExOV8xOTcyMyI+CjxwYXRoIGQ9Ik0wIDYuNDRDMCA0LjE2MjA0IDAgMy4wMjMwNiAwLjQ1MDM0NiAyLjE1NjFDMC44Mjk4NDggMS40MjU1MyAxLjQyNTUzIDAuODI5ODQ4IDIuMTU2MSAwLjQ1MDM0NkMzLjAyMzA2IDAgNC4xNjIwNCAwIDYuNDQgMEgxNy41NkMxOS44MzggMCAyMC45NzY5IDAgMjEuODQzOSAwLjQ1MDM0NkMyMi41NzQ1IDAuODI5ODQ4IDIzLjE3MDIgMS40MjU1MyAyMy41NDk3IDIuMTU2MUMyNCAzLjAyMzA2IDI0IDQuMTYyMDQgMjQgNi40NFYxNy41NkMyNCAxOS44MzggMjQgMjAuOTc2OSAyMy41NDk3IDIxLjg0MzlDMjMuMTcwMiAyMi41NzQ1IDIyLjU3NDUgMjMuMTcwMiAyMS44NDM5IDIzLjU0OTdDMjAuOTc2OSAyNCAxOS44MzggMjQgMTcuNTYgMjRINi40NEM0LjE2MjA0IDI0IDMuMDIzMDYgMjQgMi4xNTYxIDIzLjU0OTdDMS40MjU1MyAyMy4xNzAyIDAuODI5ODQ4IDIyLjU3NDUgMC40NTAzNDYgMjEuODQzOUMwIDIwLjk3NjkgMCAxOS44MzggMCAxNy41NlY2LjQ0WiIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K",
};
