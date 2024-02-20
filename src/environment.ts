export const env = process.env.ENVIRONMENT ?? "local";
export const isDevelopment = env.startsWith("development") || env === "local";
export const config = {
  vpaas: isDevelopment
    ? "vpaas-magic-cookie-41b5e4eb989e414cac4fe7f51400a1d7"
    : env === "staging"
      ? "vpaas-magic-cookie-520aa9362071418c8a8661950bc0a470"
      : env === "local"
        ? "vpaas-magic-cookie-cd4131ef77674a71b73411408226e232"
        : "vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe",
  webrtc_domain: isDevelopment ? "stage.8x8.vc" : "8x8.vc",
};

export const isProduction = env === "production";
