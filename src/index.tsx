import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env, isProduction } from "./environment";

import "./js/jwt-decode";

// these envvars are set by the EnvironmentPlugin in webpack.config.js
console.log(
  `!!! version ${process.env.GIT_VERSION} (${process.env.ENVIRONMENT})`
);

if (!isProduction) {
  document.title = env.toUpperCase() + " " + document.title;
}

const rootNode = document.getElementById("root");

if (rootNode) {
  const root = createRoot(rootNode);
  root.render(<App />);
}
