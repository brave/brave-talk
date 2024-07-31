import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env, isProduction, config } from "./environment";
import { miniLoadExternalApi } from "./jitsi/init";

import "./js/jwt-decode";

// these envvars are set by the EnvironmentPlugin in webpack.config.js
console.log(
  `!!! version ${process.env.GIT_VERSION} (${process.env.ENVIRONMENT}) using ${config.webrtc_domain}`,
);

if (!isProduction) {
  document.title = env.toUpperCase() + " " + document.title;
}

// deliberately don't wait for the resolution of the promise
// returned here - we'll await it only when we need to interact with
// the jitsi api.
void miniLoadExternalApi(config.webrtc_domain, "", config.vpaas);

const rootNode = document.getElementById("root");

if (rootNode) {
  const root = createRoot(rootNode);
  root.render(<App />);
}
