import { useState, useEffect } from "react";

export type SubscriptionStatus = "unknown" | "yes" | "no";

export function subscriptionCheckWithTimeout(): Promise<boolean> {
  let timer: any;
  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => {
      console.log(
        "Timeout on checking subscription status, assuming not subscribed",
      );
      resolve(false);
    }, 10_000);
  });

  const subscriptionCheck = import("../subscriptions")
    .then((s) => s.checkSubscribedUsingSDK())
    .finally(() => clearTimeout(timer));

  return Promise.race([timeout, subscriptionCheck]);
}

async function parseOrderFromQueryParams(): Promise<void> {
  const params = new URLSearchParams(window.location.search);

  const intent = params.get("intent");
  const order = params.get("order");
  let orderId: string | null | undefined;

  if (order) {
    // Strip order from URL
    params.delete("intent");
    params.delete("order");
    const paramString = params.size ? `?${params}` : "";
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${paramString}${window.location.hash}`,
    );
    try {
      const o = JSON.parse(atob(order));
      const exp = o?.recovery_expiration;
      const isExpired = exp <= new Date().getTime();

      if (!isExpired) {
        orderId = o?.order_id;
      }

      console.log("order details", { parsed: o, exp, isExpired, orderId });
    } catch (e) {
      // continue regardless of error
    }
  }

  if (orderId) {
    try {
      const s = await import("../subscriptions");
      if (intent === "provision") {
        await s.provisionOrder(orderId);
      } else if (intent === "recover") {
        await s.recoverCredsIfRequired(orderId);
      }
    } catch (e) {
      console.error("!!! failed to update order", e);
    }
  }
}

export function useSubscribedStatus(): SubscriptionStatus {
  const [subscribed, setSubscribed] = useState<SubscriptionStatus>("unknown");

  useEffect(() => {
    parseOrderFromQueryParams()
      .then(() => subscriptionCheckWithTimeout())
      .then((b) => setSubscribed(b ? "yes" : "no"));
  }, []);

  return subscribed;
}
