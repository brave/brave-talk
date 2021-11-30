export interface BrowserProperties {
  isBrave: boolean;
  isMobile: boolean;
  supportsWebRTC: boolean;
}

export interface Context {
  // we know the user has a valid subscription
  userIsSubscribed: boolean;

  // via greaselion, we know the user has opted into ads
  userHasOptedInToAds: boolean;

  // the user is on a platform that supports braveRequestAdsEnabled,
  // and we choose to use that api instead of the greaselion detection
  useBraveRequestAdsEnabledApi: boolean;

  browser: BrowserProperties;
}

export interface WelcomeScreenOptions {
  // UI eleements to show on welcome page
  showDownload?: boolean;
  showStartCall?: boolean;
  showSubscribeCTA?: boolean;
  showPremiumUI?: boolean;
  showUseDesktopMessage?: boolean;
  showFailureMessage?: string;

  // clicking the start call button doesn't actually start a call
  // it asks for the user to opt in - either by manual instruction UI
  // or by calling braveRequestAdsEnabled if available
  startCallButtonPromptsOptIn?: boolean;

  // in some cases, we know the name room we'd want to join/create,
  // (e.g. when `create=y` is present), so allow override
  // of the auto-generated room name
  roomNameOverride?: string;
}

export function checkJoinRoom(
  roomName: string | undefined,
  browser: BrowserProperties
): string | undefined {
  if (roomName && browser.supportsWebRTC) {
    // direct room links open whenever supported
    return roomName;
  }

  return undefined;
}

// This is a pure function (its outputs should be a function of just its inputs,
// with no side effects or other calls) that, given a whole set of context,
// determines what the behaviour of the brave talk landing page should be.
export function determineWelcomeScreenUI(c: Context): WelcomeScreenOptions {
  if (!c.browser.isBrave) {
    return {
      showDownload: true,
    };
  }

  // on mobile only subscribed users can start a call
  if (c.browser.isMobile) {
    // old iOS versions just won't work
    if (!c.browser.supportsWebRTC) {
      return {
        showFailureMessage:
          "Brave Talk requires that your device is running the latest version of iOS. Please upgrade. Yes, this is an inconvenience and we do apologize!",
      };
    }

    if (c.userIsSubscribed) {
      return {
        showStartCall: true,
        showPremiumUI: true,
      };
    } else if (c.useBraveRequestAdsEnabledApi) {
      return {
        showSubscribeCTA: true,
        showStartCall: true,
        startCallButtonPromptsOptIn: true,
      };
    } else {
      return {
        showSubscribeCTA: true,
        showUseDesktopMessage: true,
        showStartCall: false,
      };
    }
  }

  // on brave desktop
  return {
    showStartCall: true,
    showSubscribeCTA: !c.userIsSubscribed,
    showPremiumUI: c.userIsSubscribed,
    startCallButtonPromptsOptIn: !c.userIsSubscribed && !c.userHasOptedInToAds,
  };
}
