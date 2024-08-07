import { shouldForcePaymentsStaging } from "./environment";

export function resolveService(
  servicePrefix: string,
  baseHost: string = window.location.host,
): string {
  if (shouldForcePaymentsStaging && servicePrefix === "account") {
    // Only use payments staging in dev2, dev3 and staging
    return "https://account.bravesoftware.com";
  }
  return `https://${servicePrefix}.${secondLevelDomain(baseHost)}`;
}

// Note: this function isn't sensitive to county-specific top level domains such as .co.uk,
// it is design for use only with the limited set of domains that brave uses and that this
// website runs on.
export function secondLevelDomain(
  baseHost: string = window.location.host,
): string {
  let sld = baseHost.split(".").slice(-2).join(".");
  if (sld.startsWith("localhost:")) {
    sld = "brave.software";
  }
  return sld;
}
