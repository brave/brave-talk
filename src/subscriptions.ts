import * as Rewards from "brave-rewards-js-sdk";

let sdkref: Rewards.JSSDK | undefined;

const loadRewardsSdk = async (): Promise<Rewards.JSSDK> => {
  if (sdkref) {
    return sdkref;
  }

  // this envvar is set by the EnvironmentPlugin in webpack.config.js
  const env = process.env.ENVIRONMENT ?? "local";

  console.log(`brave-rewards-js-sdk: calling initialize(${env}, false)...`);
  const sdk = await Rewards.initialize(env, false);
  sdkref = sdk;
  return sdk;
};

export async function provisionOrder(orderId: string): Promise<void> {
  let currentMethod;
  try {
    const sdk = await loadRewardsSdk();

    currentMethod = "refresh_order";
    console.log(`brave-rewards-js-sdk: calling refresh_order...`);
    const order = await sdk.refresh_order(orderId);

    if (order && order.status === "paid") {
      currentMethod = "fetch_order_credentials";
      console.log(`brave-rewards-js-sdk: calling fetch_order_credentials...`);
      await sdk.fetch_order_credentials(orderId);
    }
  } catch (e) {
    console.error(`brave-rewards-js-sdk: ${currentMethod} fails`, e);
    throw e;
  }
}

export async function recoverCredsIfRequired(orderId: string): Promise<void> {
  let currentMethod;
  try {
    const sdk = await loadRewardsSdk();

    currentMethod = "refresh_order";
    const order = await sdk.refresh_order(orderId);

    currentMethod = "credential_summary";
    const summary = await sdk.credential_summary(order.location);
    if (["paid", "canceled"].includes(order.status)) {
      if (!summary) {
        currentMethod = "fetch_order_credentials";
        await sdk.fetch_order_credentials(orderId);
      }
    } else {
      throw new Error("Order not paid.");
    }
  } catch (e) {
    console.error(`brave-rewards-js-sdk: ${currentMethod} fails`, e);
    throw e;
  }
}

export async function checkSubscribedUsingSDK(): Promise<boolean> {
  try {
    const sdk = await loadRewardsSdk();
    console.log(`brave-rewards-js-sdk: calling credential_summary...`);

    const result = await sdk.credential_summary();
    console.log("brave-rewards-js-sdk: credential_summary returns", result);
    if (result) {
      return true;
    }
  } catch (e) {
    console.error("brave-rewards-js-sdk: credential_summary fails", e);
  }

  return false;
}

export async function setTemporaryCredentialCookie(): Promise<boolean> {
  try {
    const sdk = await loadRewardsSdk();

    console.log(`brave-rewards-js-sdk: calling present_credentials...`);

    const result = await sdk.present_credentials();
    console.log("brave-rewards-js-sdk: present_credentials returns", result);
    if (result) {
      return true;
    }
  } catch (e) {
    console.error("brave-rewards-js-sdk: present_credentials fails", e);
  }

  return false;
}
