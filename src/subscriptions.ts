import * as Rewards from "@brave-intl/skus-sdk";

let sdkref: Rewards.JSSDK | undefined;

const loadRewardsSdk = async (): Promise<Rewards.JSSDK> => {
  if (sdkref) {
    return sdkref;
  }

  // this envvar is set by the EnvironmentPlugin in webpack.config.js
  const env = process.env.ENVIRONMENT ?? "local";

  log(`calling initialize(${env}, false)...`);
  const sdk = await Rewards.initialize(env, false, "error");
  sdkref = sdk;
  return sdk;
};

export async function provisionOrder(orderId: string): Promise<void> {
  let currentMethod;
  try {
    const sdk = await loadRewardsSdk();

    currentMethod = "refresh_order";
    log(`calling refresh_order...`);
    const order = await sdk.refresh_order(orderId);

    if (order && order.status === "paid") {
      currentMethod = "fetch_order_credentials";
      log(`calling fetch_order_credentials...`);
      await sdk.fetch_order_credentials(orderId);
    }
  } catch (e) {
    error(`${currentMethod} fails`, e);
    throw e;
  }
}

export async function recoverCredsIfRequired(orderId: string): Promise<void> {
  let currentMethod;
  try {
    const sdk = await loadRewardsSdk();

    currentMethod = "refresh_order";
    log("calling refresh_order...");
    const order = await sdk.refresh_order(orderId);
    log("order status is ", order.status);

    if (["paid", "canceled"].includes(order.status)) {
      // user should have a subscription, re-fetch their credentials if not
      const isSubscribed = await checkSubscribedUsingSDK();
      if (!isSubscribed) {
        currentMethod = "fetch_order_credentials";
        log("calling fetch_order_credentials...");
        await sdk.fetch_order_credentials(orderId);
      }
    } else {
      throw new Error("Order not paid.");
    }
  } catch (e) {
    error(`${currentMethod} fails`, e);
    throw e;
  }
}

export async function checkSubscribedUsingSDK(): Promise<boolean> {
  try {
    const sdk = await loadRewardsSdk();
    log(`calling credential_summary...`);

    const result = await sdk.credential_summary();
    log("credential_summary returns", result);
    if (result && result.active) {
      return true;
    }
  } catch (e) {
    error("credential_summary fails", e);
  }

  return false;
}

export async function setTemporaryCredentialCookie(): Promise<boolean> {
  try {
    const sdk = await loadRewardsSdk();

    log(`calling present_credentials...`);

    const result = await sdk.present_credentials();
    log("present_credentials returns", result);
    if (result) {
      return true;
    }
  } catch (e) {
    error("present_credentials fails", e);
  }

  return false;
}

function log(message: string, ...args: any[]) {
  console.log(`skus-sdk: ${message}`, ...args);
}

function error(message: string, ...args: any[]) {
  console.error(`!!! skus-sdk: ${message}`, ...args);
}
