import { useEffect, useState } from "react";
import { calcBrowserCapabilities } from "./lib";
import { BrowserProperties } from "./rules";

/* see https://reactjs.org/docs/hooks-intro.html for a background on what hooks are,
   and in particular the rules they need to follow */

export function useBrowserProperties(): BrowserProperties | undefined {
  const [browser, setBrowser] = useState<BrowserProperties>();

  useEffect(() => {
    calcBrowserCapabilities().then(setBrowser);
  }, []);

  return browser;
}

export type SubscriptionStatus = "unknown" | "yes" | "no";

export function useSubscribedStatus(): SubscriptionStatus {
  const [subscribed, setSubscribed] = useState<SubscriptionStatus>("unknown");

  useEffect(() => {
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

    Promise.race([timeout, subscriptionCheck]).then((b) =>
      setSubscribed(b ? "yes" : "no")
    );
  }, []);

  return subscribed;
}
