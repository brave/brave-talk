import {
  BrowserProperties,
  checkJoinRoom,
  Context,
  determineWelcomeScreenUI,
  WelcomeScreenOptions,
} from "./rules";
import { resolveService } from "./services";

import "./css/main.css";
import "./js/jwt-decode";
import { fetchJWT } from "./rooms";
import {
  availableRecordings,
  upsertRecordingForRoom,
  refreshRecording,
} from "./recordings";

const useBraveRequestAdsEnabledApi: boolean =
  !!window.chrome && !!window.chrome.braveRequestAdsEnabled;

const config = {
  vpaas: "vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe",
  webrtc_domain: "8x8.vc",
};

const isProduction: boolean = process.env.ENVIRONMENT === "production";

const params = new URLSearchParams(window.location.search);

// there's a chance that window.onload has already fired by the time this code runs
if (document.readyState === "complete") {
  window.setTimeout(() => main());
} else {
  window.onload = () => main();
}

const main = async () => {
  // these envvars are set by the EnvironmentPlugin in webpack.config.js
  console.log(
    `!!! version 0.11.58 (${process.env.GIT_VERSION} ${process.env.ENVIRONMENT})`
  );

  if (useBraveRequestAdsEnabledApi) {
    console.log("--> will use braveRequestAdsEnabled");
  }

  const intent = params.get("intent");
  const order = params.get("order");
  let orderId: string | null | undefined;

  if (order) {
    try {
      const o = JSON.parse(atob(order));
      const exp = o?.recovery_expiration;
      const isExpired = exp <= new Date().getTime();

      if (!isExpired) {
        orderId = o?.order_id;
      }

      console.log("order details", { parsed: o, exp, isExpired, orderId });
    } catch (e) {}
  }

  if (!orderId) {
    // backwards compatibility - remove once the order param is implemented everywhere
    orderId = params.get("orderId");
  }

  if (intent === "provision" && orderId) {
    try {
      const s = await import("./subscriptions");
      await s.provisionOrder(orderId);
    } catch (e) {}
  } else if (intent === "recover" && orderId) {
    try {
      const s = await import("./subscriptions");
      await s.recoverCredsIfRequired(orderId);
    } catch (e) {}
  }

  // fast track check for whether we should immediately try to join a room
  const browser = await calcBrowserCapabilities();
  const joinRoom = checkJoinRoom(extractRoomNameFromUrl(), browser);

  if (!joinRoom || joinRoom === "widget") {
    const context: Context = {
      browser,
      userHasOptedInToAds: isOptedInToAds(),
      userIsSubscribed: browser.isBrave && (await userIsSubscribed()),
      useBraveRequestAdsEnabledApi,
    };

    console.log("Context:", context);

    if (!joinRoom || !context.userIsSubscribed) {
      return renderHomePage(determineWelcomeScreenUI(context));
    }
  }

  hideLoadingIndicators();
  joinConferenceRoom(
    joinRoom !== "widget" ? joinRoom : generateRoomName(),
    false
  );
};

const checkDevOverride = (code: string): boolean | null => {
  if (!isProduction) {
    const paramValue = extractValueFromFragment(code);
    if (paramValue === "yes") {
      return true;
    }

    if (paramValue === "no") {
      return false;
    }
  }

  return null;
};

const userIsSubscribed = async (): Promise<boolean> => {
  const override = checkDevOverride("subscribed");

  if (override !== null) {
    console.log(`OVERRIDE subscribed to ${override}`);
    await new Promise<boolean>((resolve) => {
      setTimeout(resolve, 1500);
    });
    return override;
  }

  let timer: any;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => {
      console.log(
        "Timeout on checking subscription status, assuming not subscribed"
      );
      resolve(false);
    }, 10_000);
  });

  const subscriptionCheck = import("./subscriptions")
    .then((s) => s.checkSubscribedUsingSDK())
    .finally(() => clearTimeout(timer));

  return Promise.race([timeout, subscriptionCheck]);
};

const isOptedInToAds = (): boolean => {
  const override = checkDevOverride("adsoptin");

  if (override !== null) {
    console.log(`OVERRIDE adsoptin to ${override}`);
    return override;
  }

  if (useBraveRequestAdsEnabledApi) {
    // we'll check on clicking the button to join call
    return false;
  }

  // a greaselion script sets the visibility of this div based on whether the user
  // has opted into ads or not
  const button = document.getElementById("enter_1on1_button");

  if (button && button.style.display !== "none" && button.style.display !== "")
    return true;

  return false;
};

const calcBrowserCapabilities = async (): Promise<BrowserProperties> => {
  const userAgent = navigator.userAgent;
  const androidP = !!userAgent.match(/Android/i);
  // cf., https://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
  const iosP =
    !!userAgent.match(/iP(ad|hone|od)/i) ||
    (userAgent.includes("Mac") && "ontouchend" in document);

  const webrtcP =
    androidP ||
    (!!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);

  const isBrave = async () => {
    try {
      return await (navigator as any).brave.isBrave();
    } catch (error) {
      return false;
    }
  };

  return {
    isBrave: await isBrave(),
    isMobile: iosP || androidP,
    supportsWebRTC: webrtcP,
  };
};

const extractRoomNameFromUrl = (): string | undefined => {
  const parts = window.location.pathname.split("/");

  if (parts.length !== 2) {
    return undefined;
  }

  const roomName = parts[1];

  if (roomName === "") {
    return undefined;
  }

  if (roomName === "widget") {
    return roomName;
  }

  if (!isRoomValid(roomName)) {
    console.warn("!!! invalid roomName: " + roomName);
    return undefined;
  }

  return roomName;
};

const extractValueFromFragment = (key: string): string | undefined => {
  let value: string | undefined;

  if (window.location.hash !== "") {
    const hashes = window.location.hash.substr(1).split("&");

    hashes.forEach((hash) => {
      const equals = hash.indexOf("=");

      if (equals !== -1 && key === hash.substr(0, equals)) {
        value = hash.substr(equals + 1);
      }
    });
  }

  return value;
};

const findElement = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`Expected element ${id} not found in html`);
  }
  return el! as T;
};

const hideLoadingIndicators = () => {
  findElement("subscribe_loading").style.display = "none";
  findElement("enter_room_loading").style.display = "none";
};

const copyRoomLink = async (button: HTMLButtonElement) => {
  button.disabled = true;
  const originalButtonContent = button.innerHTML;
  const updateButtonText = (msg: string) => (button.innerText = msg);

  try {
    const roomName = generateRoomName();
    const { url } = await fetchJWT(roomName, true, updateButtonText);

    if (!url) {
      throw new Error("Failed to create meeting room");
    }

    const absoluteUrl = new URL(url, window.location.href);
    await window.navigator.clipboard.writeText(absoluteUrl.href);

    updateButtonText("Room link copied to clipboard");
    await wait(5_000);
  } catch (error: any) {
    console.error(error);
    notice(error.message);
  } finally {
    button.disabled = false;

    // although we're setting innerHTML here, the content is only that extracted
    // at the top of this function - there is no user entered text involved
    button.innerHTML = originalButtonContent;
  }
};

const renderHomePage = (options: WelcomeScreenOptions) => {
  reportMethod("renderHomePage", options);

  hideLoadingIndicators();

  const enterRoomEl = findElement("enter_room_button");
  const subscribeCtaEl = findElement("subscribe");
  const downloadCta = findElement("download_brave");
  const adsOptIn = findElement("opt_in");
  const adsOptInManualSteps = findElement("opt_in_manual_steps");
  const copyLinkEl = findElement<HTMLButtonElement>("copy_link");

  if (options.showDownload) {
    downloadCta.style.display = "flex";
    enterRoomEl.style.display = "none";
    notice(
      "Unlimited private video calls, right in your browser. No app required."
    );
  }

  if (options.showStartCall) {
    enterRoomEl.innerText = options.showPremiumUI
      ? "Start Premium call"
      : "Start free 1:1 call";

    enterRoomEl.style.display = "block";

    enterRoomEl.onclick = async () => {
      if (options.startCallButtonPromptsOptIn) {
        if (useBraveRequestAdsEnabledApi) {
          reportAction("checking braveRequestAdsEnabled...", {});
          const result = await window.chrome!.braveRequestAdsEnabled!();
          reportAction("braveRequestAdsEnabled", { result });
          if (result) {
            // good to start the call now
            joinConferenceRoom(generateRoomName(), true);
            return;
          }

          // otherwise fall through to showing the original message prompting manual opt-in,
          // but without the manual step images
          adsOptInManualSteps.style.display = "none";
        }

        adsOptIn.style.display = "flex";

        findElement("opt_in_close").onclick = () => {
          // force a reload to recalculate whether ads are enabled or not
          window.location.reload();
        };
      } else {
        joinConferenceRoom(generateRoomName(), true);
      }
    };
  }

  const subsUrl = resolveService("account");

  if (options.showSubscribeCTA) {
    findElement("subscribe_button").onclick = () =>
      window.location.assign(`${subsUrl}/plans/?intent=checkout&product=talk`);
    findElement<HTMLAnchorElement>(
      "subscribe_login_link"
    ).href = `${subsUrl}/account/?intent=recover&product=talk`;
    subscribeCtaEl.style.display = "block";
  }

  if (options.showPremiumUI) {
    const myAccountElement = findElement<HTMLAnchorElement>("my_account_link");
    myAccountElement.href = subsUrl;
    myAccountElement.style.display = "block";

    findElement("talk_title").innerText = "Brave Talk Premium";

    if (!isProduction) {
      copyLinkEl.style.display = "flex";
      copyLinkEl.onclick = async () => {
        await copyRoomLink(copyLinkEl);
      };
    }
  }

  if (options.showUseDesktopMessage) {
    enterRoomEl.style.display = "none";
    findElement("desktop_needed").style.display = "block";
  }

  if (options.showFailureMessage) {
    notice(options.showFailureMessage);
  }
};

let JitsiMeetJS: any;

const renderConferencePage = (roomName: string, jwt: string) => {
  reportMethod("renderConferencePage", { roomName, jwt });

  findElement("welcome_page").style.display = "none";
  findElement("meet").style.display = "block";

  const options = {
    roomName: config.vpaas + "/" + roomName,
    jwt: jwt,
    parentNode: document.querySelector("#meet"),

    configOverwrite: {
      analytics: {
        disabled: true,
        rtcstatsEnabled: false,
      },
      brandingRoomAlias: roomName,
      callStatsID: false,
      callStatsSecret: false,
      disabledSounds: ["E2EE_OFF_SOUND", "E2EE_ON_SOUND"],
      disableGTM: true,
      doNotStoreRoom: true,
      disableInviteFunctions: false,
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
      inviteAppName: "Brave Talk",
      prejoinPageEnabled: true,
      /* !!! temporary for testing
      startLastN: 2,
       */
      startWithAudioMuted: true,
      startWithVideoMuted: true,
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
        /* must be enabled in JWT context.features object
        "recording",
        "livestreaming",
 */
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
    }
  });

  document.getElementById("talk")!.style.backgroundColor =
    options.interfaceConfigOverwrite.DEFAULT_BACKGROUND;

  const askOnUnload = (e: any) => {
    e.returnValue = "";

    window.removeEventListener("beforeunload", askOnUnload);

    // causes the browser to ask whether the user really wants to reload/close
    e.preventDefault();

    window.addEventListener("beforeunload", askOnUnload);
  };

  reportMethod("JitsiMeetExternalAPI", options);
  JitsiMeetJS = new JitsiMeetExternalAPI(config.webrtc_domain, options);
  reportAction("JitsiMeetExternalAPI", { status: "activated!" });
  JitsiMeetJS.executeCommand(
    "subject",
    options.interfaceConfigOverwrite.APP_NAME
  );

  let recordingLink: string | undefined;

  JitsiMeetJS.on("subjectChange", (params: any) => {
    reportAction("subjectChange", params);

    if (!isProduction) {
      // window.addEventListener("onpagehide", (e) => { ... }) appears to be a no-op on iOS
      // and listening for "onbeforeunload" works for both desktop and Android

      if ("onbeforeunload" in window) {
        console.log("!!! listening for beforeunload");
        window.addEventListener("beforeunload", askOnUnload);
      }
    }

    // (used) to reset when someone changes a media device?!?
    if (params.subject === "")
      JitsiMeetJS.executeCommand(
        "subject",
        options.interfaceConfigOverwrite.APP_NAME
      );
  })
    .on("videoQualityChanged", (params: any) => {
      reportAction("videoQualityChanged", params);
    })
    .on("recordingLinkAvailable", (params: any) => {
      reportAction("recordingLinkAvailable", params);
      recordingLink = params.link;
      upsertRecordingForRoom(params.link, roomName, undefined);
    })
    .on("recordingStatusChanged", (params: any) => {
      reportAction("recordingStatusChanged", params);
      if (recordingLink) {
        upsertRecordingForRoom(recordingLink, roomName, undefined);
        if (!params.on) {
          recordingLink = undefined;
        }
      }
    })
    .on("readyToClose", (params: any) => {
      reportAction("readyToClose", params);
      window.removeEventListener("beforeunload", askOnUnload);
      JitsiMeetJS.dispose();
      JitsiMeetJS = null;
      window.open(
        window.location.protocol + "//" + window.location.host,
        "_self"
      );
    });

  const passcode = extractValueFromFragment("passcode");
  if (passcode) {
    JitsiMeetJS.on("passwordRequired", () => {
      JitsiMeetJS.executeCommand("password", passcode);
    });
  }
};

const joinConferenceRoom = async (
  roomName: string,
  createP: boolean
): Promise<void> => {
  reportMethod("joinConferenceRoom", { roomName, createP });

  try {
    const result = await fetchJWT(roomName, createP, notice);
    if (!result.url) {
      renderConferencePage(roomName, result.jwt);
    } else {
      const passcode = extractValueFromFragment("passcode");

      window.open(
        result.url + (passcode ? "#passcode=" + passcode : ""),
        "_self"
      );
    }
  } catch (error: any) {
    if (!createP && error.message === "The room does not exist") {
      if (params.get("create") === "y") {
        const isSubscribed = await userIsSubscribed();
        if (!isSubscribed) {
          notice("Waiting for a subscriber to create the room...");
          setTimeout(() => joinConferenceRoom(roomName, false), 5_000);
          return;
        }
      }

      reportAction(`Creating room`, { roomName });
      return await joinConferenceRoom(roomName, true);
    } else {
      console.error(error);
      notice(error.message);
    }
  }
};

const generateRoomName = () => {
  const { crypto } = window;
  const buf = new Uint8Array(32);
  crypto.getRandomValues(buf);
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

const isRoomValid = (room: string) => {
  // e.g., "abcdefghijklmnopqrstuvwxyz0123456789-_ABCDE"
  return typeof room === "string" && room.match(/^[A-Za-z0-9-_]{43}$/);
};

const notice = (text: string) => {
  const element = document.getElementById("notice_text")!;

  element.innerText = text;
  element.style.display = text ? "inline-block" : "none";
};

const reportAction = (action: string, params: object) => {
  console.log("!!! < " + action + ": ", params);
};

const reportMethod = (method: string, params: object) => {
  console.log("!!! > " + method + ": ", params);
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => window.setTimeout(resolve, ms));
