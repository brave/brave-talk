import { createRoot } from "react-dom/client";
import { App } from "./App";
import { env, isProduction, config } from "./environment";

import "./js/jwt-decode";

// these envvars are set by the EnvironmentPlugin in webpack.config.js
console.log(
  `!!! version ${process.env.GIT_VERSION} (${process.env.ENVIRONMENT})`
);

if (!isProduction) {
  document.title = env.toUpperCase() + " " + document.title;
}

// taken from https://github.com/jitsi/jitsi-meet-react-sdk/blob/main/src/init.ts#L4-L22
// the goal is to load the bootstrap JS for the current JAAS release (we load JitsiMeetExternalAPI elsewhere)
// so this function does exactly that and nothing else.

const miniLoadExternalApi = async (
  domain: string,
  release?: string,
  appId?: string
): Promise<any> =>
  new Promise((resolve, reject) => {
    const script: HTMLScriptElement = document.createElement("script");
    const releaseParam: string = release ? `?release=${release}` : "";
    const appIdPath: string = appId ? `${appId}/` : "";

    script.async = true;
    script.src = `https://${domain}/${appIdPath}external_api.js${releaseParam}`;
    console.log(`!!! bootstrap ${script.src}`);
    script.onerror = () =>
      reject(new Error(`Script load error: ${script.src}`));
    document.head.appendChild(script as Node);
  });

miniLoadExternalApi("8x8.vc", "", config.vpaas);

const rootNode = document.getElementById("root");

if (rootNode) {
  const root = createRoot(rootNode);
  root.render(<App />);
}
