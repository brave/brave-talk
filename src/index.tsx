import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env, isProduction, config } from "./environment";
import { miniLoadExternalApi } from "./jitsi/init";

import "./js/jwt-decode";

// these envvars are set by the EnvironmentPlugin in webpack.config.js
console.log(
  `!!! version ${process.env.GIT_VERSION} (${process.env.ENVIRONMENT})`
);

if (!isProduction) {
  document.title = env.toUpperCase() + " " + document.title;
}

const mountReactApp = async () => {
  await miniLoadExternalApi("8x8.vc", "", config.vpaas);

  const rootNode = document.getElementById("root");

  if (rootNode) {
    const root = createRoot(rootNode);
    root.render(<App />);
  }
};

mountReactApp();
