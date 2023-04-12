// Telling typescript about the apis we use that we don't have type declarations for

// 8x8 vc api, included driect from index.html
declare let JitsiMeetExternalAPI: any;

// jwt_decode, the version of which we include works by adding a global function onto window :(
declare function jwt_decode(input: string): any;

interface Window {
  chrome?: {
    braveRequestAdsEnabled?: () => Promise<boolean>;
  };
  JitsiMeetExternalApi: any;
}

declare module "*.svg" {
  const content: any;
  export default content;
}
