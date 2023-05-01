import { IJitsiMeetApi } from "./types";

// taken from http://localhost:8080/Uw8dfAU56OYYzACPQ59_sU0WpQTWlC4sSQDQNeC7HOEhttps://github.com/jitsi/jitsi-meet-react-sdk/blob/main/src/init.ts#L4-L22
// the goal is to load the bootstrap JS for the current JAAS release (we load JitsiMeetExternalAPI elsewhere)
// so this function does exactly that and nothing else.

let loadingPromise: Promise<IJitsiMeetApi>;

export const miniLoadExternalApi = (
  domain: string,
  release?: string,
  appId?: string
): Promise<IJitsiMeetApi> => {
  loadingPromise = new Promise((resolve, reject) => {
    if (window.JitsiMeetExternalApi) {
      return resolve(window.JitsiMeetExternalApi);
    }

    const script: HTMLScriptElement = document.createElement("script");
    const releaseParam: string = release ? `?release=${release}` : "";
    const appIdPath: string = appId ? `${appId}/` : "";

    script.async = false;
    script.src = `https://${domain}/${appIdPath}external_api.js${releaseParam}`;
    script.onload = () => {
      console.log(`!!! bootstrap ${script.src}`);
      resolve(window.JitsiMeetExternalApi);
    };
    script.onerror = () =>
      reject(new Error(`Script load error: ${script.src}`));

    document.head.appendChild(script as Node);
  });

  return loadingPromise;
};

export const ensureJitsiApiLoaded = async () => {
  if (!loadingPromise) {
    throw Error(
      "!!! you must call miniLoadExternalApi before ensureJitsiApiLoaded"
    );
  }
  await loadingPromise;
};
