import { useState, useEffect } from "react";

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

    const subscriptionCheck = import("../subscriptions")
      .then((s) => s.checkSubscribedUsingSDK())
      .finally(() => clearTimeout(timer));

    Promise.race([timeout, subscriptionCheck]).then((b) =>
      setSubscribed(b ? "yes" : "no")
    );
  }, []);

  return subscribed;
}
