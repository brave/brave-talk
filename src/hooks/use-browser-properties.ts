/* see https://reactjs.org/docs/hooks-intro.html for a background on what hooks are,
   and in particular the rules they need to follow */

import { useState, useEffect } from "react";

export interface BrowserProperties {
  isBrave: boolean | undefined; // "undefined" means not yet known
  isMobile: boolean;
  isIOS: boolean;
  supportsWebRTC: boolean;
}

const calcBrowserCapabilities = (): BrowserProperties => {
  const userAgent = navigator.userAgent;
  const androidP = !!userAgent.match(/Android/i);
  // cf., https://stackoverflow.com/questions/9038625/detect-if-device-is-ios/9039885#9039885
  const iosP =
    !!userAgent.match(/iP(ad|hone|od)/i) ||
    (userAgent.includes("Mac") && "ontouchend" in document);

  const webrtcP =
    androidP ||
    (!!navigator.mediaDevices && !!navigator.mediaDevices.getUserMedia);

  return {
    isBrave: undefined,
    isMobile: iosP || androidP,
    isIOS: iosP,
    supportsWebRTC: webrtcP,
  };
};

const isBrave = async () => {
  try {
    return await (navigator as any).brave.isBrave();
  } catch (error) {
    return false;
  }
};

export function useBrowserProperties(): BrowserProperties {
  // Most of the properties of the browser we can identify synchronously,
  // so provide these values immediately.  Detection of brave is async,
  // so we calculate that separately and provide the value later on.
  // This helps avoid delays / flashes of content on load.

  const [browser, setBrowser] = useState<BrowserProperties>(
    calcBrowserCapabilities(),
  );

  useEffect(() => {
    isBrave().then((isBrave: boolean) =>
      setBrowser((bp) => ({ ...bp, isBrave: isBrave })),
    );
  }, []);

  return browser;
}
