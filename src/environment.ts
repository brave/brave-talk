export const env = process.env.ENVIRONMENT ?? "local";
export const isDevelopment = env.startsWith("development") || env === "local";
const useJaasPilot = isDevelopment && env !== "development2";

let vpaas = "";
if (isDevelopment) {
  if (useJaasPilot) {
    vpaas = "vpaas-magic-cookie-41b5e4eb989e414cac4fe7f51400a1d7";
  } else {
    vpaas = "vpaas-magic-cookie-cd4131ef77674a71b73411408226e232";
  }
} else if (env === "staging") {
  vpaas = "vpaas-magic-cookie-520aa9362071418c8a8661950bc0a470";
} else {
  vpaas = "vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe";
}

export const config = {
  vpaas,
  webrtc_domain: useJaasPilot ? "stage.8x8.vc" : "8x8.vc",
};

export const isProduction = env === "production";
