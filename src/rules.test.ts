/** @format */
import * as rules from './rules'

const DESKTOP_BRAVE: rules.BrowserProperties = {
  isBrave: true,
  isMobile: false,
  isIOS: false,
  supportsWebRTC: true
}

const MOBILE_BRAVE: rules.BrowserProperties = {
  isBrave: true,
  isMobile: true,
  isIOS: false,
  supportsWebRTC: true
}

const MOBILE_BRAVE_IOS: rules.BrowserProperties = {
  isBrave: true,
  isMobile: true,
  isIOS: true,
  supportsWebRTC: true
}

const BASE_CONTEXT: rules.Context = {
  browser: DESKTOP_BRAVE,
  userHasOptedInToAds: false,
  userIsSubscribed: false,
  useBraveRequestAdsEnabledApi: false
}

test('if a valid room name is supplied, opens room on all webrtc supporting browsers', () => {
  expect(rules.checkJoinRoom('some room', DESKTOP_BRAVE)).toEqual('some room')

  expect(rules.checkJoinRoom('some room', MOBILE_BRAVE)).toEqual('some room')

  expect(
    rules.checkJoinRoom('some room', {
      isBrave: false,
      isMobile: true,
      isIOS: true,
      supportsWebRTC: true
    })
  ).toEqual('some room')

  expect(
    rules.checkJoinRoom('some room', {
      isBrave: false,
      isMobile: true,
      isIOS: true,
      supportsWebRTC: false
    })
  ).toBeUndefined()
})

it('on mobile non brave should prompt to download brave if no room name is supplied', () => {
  expect(
    rules.determineWelcomeScreenUI({
      ...BASE_CONTEXT,
      browser: {
        isBrave: false,
        isMobile: true,
        supportsWebRTC: true,
        isIOS: true
      }
    })
  ).toEqual({ showDownload: true })
})

it('should show start call button without opt in for non-subscribed browsers on desktop', () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })
})

it.skip('on mobile should show start call button for non subscribed users', () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })

  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: true
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })
})

it('should never show opt in to subscribed users', () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: false,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    })
  ).toMatchObject({
    showStartCall: true,
    startCallButtonPromptsOptIn: false
  })
})

it("should show message to users of brave browsers that don't support webRTC", () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: {
        ...MOBILE_BRAVE,
        supportsWebRTC: false
      },
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    })
  ).toEqual<rules.WelcomeScreenOptions>({
    showFailureMessage:
      'Brave Talk requires that your device is running the latest version of iOS. Please upgrade. Yes, this is an inconvenience and we do apologize!'
  })
})

it('should show premium UI only to subscribers', () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: false,
      useBraveRequestAdsEnabledApi: false
    }).showPremiumUI
  ).toBeFalsy()

  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    }).showPremiumUI
  ).toBeTruthy()
})

it('should show copy link for later to subscribers on non-IOS', () => {
  expect(
    rules.determineWelcomeScreenUI({
      browser: DESKTOP_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    }).showCopyLinkForLater
  ).toBeTruthy()

  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    }).showCopyLinkForLater
  ).toBeTruthy()

  expect(
    rules.determineWelcomeScreenUI({
      browser: MOBILE_BRAVE_IOS,
      userHasOptedInToAds: true,
      userIsSubscribed: true,
      useBraveRequestAdsEnabledApi: false
    }).showCopyLinkForLater
  ).toBeFalsy()
})
