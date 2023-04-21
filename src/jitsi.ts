import { getLangPref } from "./get-language-detector";
import { extractValueFromFragment, reportAction, reportMethod } from "./lib";
import { config } from "./environment";
import {
  availableRecordings,
  upsertRecordingForRoom,
} from "./recordings-store";

export type IJistiMeetApi = any;

const disableBeforeUnloadHandlers = true;

export const renderConferencePage = (
  el: Element,
  roomName: string,
  jwt: string,
  isMobile: boolean
): IJistiMeetApi => {
  reportMethod("renderConferencePage", { roomName, jwt });

  const options: any = {
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
      disableBeforeUnloadHandlers: disableBeforeUnloadHandlers,
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
      /* !!! temporary for testing
      startLastN: 2,
       */
      startWithAudioMuted: true,
      startWithVideoMuted: true,
      toolbarConfig: {
        autoHideWhileChatIsOpen: true,
      },
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

  if (isMobile) {
    options.configOverwrite.resolution = 360;
  }

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

  const askOnUnload = (e: any) => {
    e.returnValue = "";

    window.removeEventListener("beforeunload", askOnUnload);

    // causes the browser to ask whether the user really wants to reload/close
    e.preventDefault();

    window.addEventListener("beforeunload", askOnUnload);
  };

  reportMethod("JitsiMeetExternalAPI", options);
  let JitsiMeetJS = new JitsiMeetExternalAPI(config.webrtc_domain, options);
  reportAction("JitsiMeetExternalAPI", { status: "activated!" });

  const updateSubject = () => {
    try {
      // works for everyone...
      JitsiMeetJS.executeCommand(
        "localSubject",
        options.interfaceConfigOverwrite.APP_NAME
      );
    } catch (error: any) {
      console.error("!!! failed local subject change", error);
    }

    try {
      // works for moderator...
      JitsiMeetJS.executeCommand(
        "subject",
        options.interfaceConfigOverwrite.APP_NAME
      );
    } catch (error: any) {
      console.error("!!! failed subject change", error);
    }
  };

  updateSubject();

  let recordingLink: string | undefined;
  let recordingTTL: number | undefined;
  const updateRecTimestamp = () => {
    if (!recordingLink) {
      return;
    }

    upsertRecordingForRoom(recordingLink, roomName, recordingTTL);
    setTimeout(updateRecTimestamp, 5 * 60 * 1000);
  };

  let firstTime = true;

  // check every 30 seconds (disable by setting to 0)
  const inactiveInterval = 30 * 1000;
  // total 1 hour of inactivity
  const inactiveTotal = 120;

  let inactiveCount = 0;
  let inactiveTimer: any;

  const inactiveTimeout = () => {
    const participantCount = JitsiMeetJS.getNumberOfParticipants();

    if (participantCount > 1) {
      inactiveCount = 0;
    } else {
      inactiveCount++;
    }
    console.log(
      "!!! testing inactivity: participants",
      participantCount,
      "and inactive count",
      inactiveCount
    );

    if (inactiveCount >= inactiveTotal) {
      JitsiMeetJS.executeCommand("hangup");
    } else {
      inactiveTimer = setTimeout(inactiveTimeout, inactiveInterval);
    }
  };
  const nowActive = (event: string, params: any) => {
    if (!inactiveInterval) {
      return;
    }
    reportAction(event, params);
    inactiveCount = 0;
    clearTimeout(inactiveTimer);
    inactiveTimer = setTimeout(inactiveTimeout, inactiveInterval);
  };

  if (inactiveInterval) {
    inactiveTimer = setTimeout(inactiveTimeout, inactiveInterval);
  }

  JitsiMeetJS.on("subjectChange", (params: any) => {
    reportAction("subjectChange", params);

    if (disableBeforeUnloadHandlers) {
      // window.addEventListener("onpagehide", (e) => { ... }) appears to be a no-op on iOS
      // and listening for "onbeforeunload" works for both desktop and Android

      if ("onbeforeunload" in window) {
        console.log("!!! listening for beforeunload");
        window.addEventListener("beforeunload", askOnUnload);
      }
    }

    // (used) to reset when someone changes a media device?!?
    if (params.subject === "") {
      updateSubject();
    }
  })
    .on("videoQualityChanged", (params: any) => {
      reportAction("videoQualityChanged", params);
    })
    .on("recordingLinkAvailable", (params: any) => {
      reportAction("recordingLinkAvailable", params);
      recordingLink = params.link;

      const ttl = Math.floor(params.ttl / 1000) || 0;

      if (ttl > 0) recordingTTL = ttl;
      updateRecTimestamp();
    })
    .on("recordingStatusChanged", (params: any) => {
      reportAction("recordingStatusChanged", params);
      if (params.on && !recordingLink) {
        const recordings = availableRecordings();
        const record = recordings.find((r) => r.roomName === roomName);

        if (record) {
          console.log("!!! resuming recording", record);
          recordingLink = record.url;
        } else {
          console.log("!!! unable to find recording for this room");
        }
      }
      updateRecTimestamp();
      if (!params.on) {
        recordingLink = undefined;
      }
    })
    .on("readyToClose", (params: any) => {
      reportAction("readyToClose", params);
      window.removeEventListener("beforeunload", askOnUnload);
      updateRecTimestamp();
      if (inactiveTimer) {
        clearTimeout(inactiveTimer);
      }
      JitsiMeetJS.dispose();
      JitsiMeetJS = null;
      window.open(
        window.location.protocol + "//" + window.location.host,
        "_self",
        "noopener"
      );
    })
    .on("breakoutRoomsUpdated", (params: any) => {
      reportAction("breakoutRoomsUpdated", params);
      if (!firstTime) {
        return;
      }
      firstTime = false;

      let roomCount = 0;
      Object.entries(params.rooms).forEach((room) => {
        reportAction("room", room);
        roomCount++;
      });
      console.log("!!! room count=" + roomCount);
      if (roomCount > 1) {
        JitsiMeetJS.executeCommand("toggleParticipantsPane", { enabled: true });
      }
    })
    .on("participantJoined", (params: any) => {
      nowActive("participantJoined", params);
    })
    .on("participantKickedOut", (params: any) => {
      nowActive("participantKickedOut", params);
    })
    .on("participantLeft", (params: any) => {
      nowActive("participantLeft", params);
    });

  const passcode = extractValueFromFragment("passcode");
  if (passcode) {
    JitsiMeetJS.on("passwordRequired", () => {
      JitsiMeetJS.executeCommand("password", passcode);
    });
  }

  return JitsiMeetJS;
};

// taken from http://localhost:8080/Uw8dfAU56OYYzACPQ59_sU0WpQTWlC4sSQDQNeC7HOEhttps://github.com/jitsi/jitsi-meet-react-sdk/blob/main/src/init.ts#L4-L22
// the goal is to load the bootstrap JS for the current JAAS release (we load JitsiMeetExternalAPI elsewhere)
// so this function does exactly that and nothing else.

declare let window: any;

let loadingPromise: Promise<IJistiMeetApi>;

export const miniLoadExternalApi = (
  domain: string,
  release?: string,
  appId?: string
): Promise<IJistiMeetApi> => {
  loadingPromise = new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalApi) {
      return resolve(window.JitsiMeetExternalApi);
    }

    const script: HTMLScriptElement = document.createElement("script");
    const releaseParam: string = release ? `?release=${release}` : "";
    const appIdPath: string = appId ? `${appId}/` : "";

    script.async = false;
    script.src = `https://${domain}/${appIdPath}external_api.js${releaseParam}`;
    script.onload = () => {
      console.log(`!!! bootstrap ${script.src}`);
      resolve(window.JitsiMeetExternalApi);
    };
    script.onerror = () =>
      reject(new Error(`Script load error: ${script.src}`));

    document.head.appendChild(script as Node);
  });

  return loadingPromise;
};

export const miniLoadedExternalApi = async () => {
  await loadingPromise;
};
