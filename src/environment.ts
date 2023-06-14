export const env = process.env.ENVIRONMENT ?? "local";
export const isDevelopment = env === "production" || env === "development2";
export const config = {
  vpaas: isDevelopment
    ? "vpaas-magic-cookie-cd4131ef77674a71b73411408226e232"
    : env === "staging"
    ? "vpaas-magic-cookie-520aa9362071418c8a8661950bc0a470"
    : env === "local"
    ? "vpaas-magic-cookie-cd4131ef77674a71b73411408226e232"
    : "vpaas-magic-cookie-a4818bd762a044998d717b70ac734cfe",
  webrtc_domain: "8x8.vc",
};

export const isProduction = env === "production";
