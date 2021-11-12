/** @format */
import * as rules from "./rules";

const DESKTOP_BRAVE: rules.BrowserProperties = {
  isBrave: true,
  isMobile: false,
  supportsWebRTC: true,
};

const MOBILE_BRAVE: rules.BrowserProperties = {
  isBrave: true,
  isMobile: true,
  supportsWebRTC: true,
};

const BASE_CONTEXT: rules.Context = {
  browser: DESKTOP_BRAVE,
  userHasOptedInToAds: false,
  userIsSubscribed: false,
  useBraveRequestAdsEnabledApi: false,
};

test("if a valid room name is supplied, opens room on all webrtc supporting browsers", () => {
  expect(rules.checkJoinRoom("some room", DESKTOP_BRAVE)).toEqual("some room");

  expect(rules.checkJoinRoom("some room", MOBILE_BRAVE)).toEqual("some room");

  expect(
    rules.checkJoinRoom("some room", {
      isBrave: false,
      isMobile: true,
      supportsWebRTC: true,
    })
  ).toEqual("some room");

  expect(
    rules.checkJoinRoom("some room", {
      isBrave: false,
      isMobile: true,
      supportsWebRTC: false,
    })
  ).toBeUndefined();
});

it("on mobile non brave should prompt to download brave if no room name is supplied", () => {
  expect(
    rules.determineWelcomeScreenUI({
      ...BASE_CONTEXT,
      browser: { isBrave: false, isMobile: true, supportsWebRTC: true },
    })
  ).toEqual({ showDownload: true });
});

it("should show start call button but request opt in for non-opted in non-subscribed browsers on desktop", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: true,
  });

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false,
  });
});

it("on mobile should show start call button for non subscribed users only when braveRequestAdsEnabled api is in use", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toMatchObject({
    showStartCall: false,
  });

  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: true,
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: true,
  });
});

it("should never show opt in to subscribed users", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false,
  });

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false,
  });
});

it("should show message to users of brave browsers that don't support webRTC", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: {
        ...MOBILE_BRAVE,
        supportsWebRTC: false,
      },
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false,
    })
  ).toEqual<rules.WelcomeScreenOptions>({
    showFailureMessage:
      "Brave Talk requires that your device is running the latest version of iOS. Please upgrade. Yes, this is an inconvenience and we do apologize!",
  });
});

it("should show premium UI only to subscribers", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false,
    }).showPremiumUI
  ).toBeFalsy();

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false,
    }).showPremiumUI
  ).toBeTruthy();
});
