/* see https://reactjs.org/docs/hooks-intro.html for a background on what hooks are,
   and in particular the rules they need to follow */

import { useState, useEffect } from "react";
import { BrowserProperties } from "../rules";

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
    isIOS: iosP,
    supportsWebRTC: webrtcP,
  };
};

export function useBrowserProperties(): BrowserProperties | undefined {
  const [browser, setBrowser] = useState<BrowserProperties>();

  useEffect(() => {
    calcBrowserCapabilities().then(setBrowser);
  }, []);

  return browser;
}
