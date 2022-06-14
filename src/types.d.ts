// Telling typescript about the apis we use that we don't have type declarations for

// 8x8 vc api, included driect from index.html
declare let JitsiMeetExternalAPI: any

// jwt_decode, the version of which we include works by adding a global function onto window :(

// turning off linting just in case (ts-standard already ignores jwt-decode.js)
/* eslint-disable @typescript-eslint/naming-convention */
declare function jwt_decode (input: string): any
/* eslint-enable @typescript-eslint/naming-convention */

interface Window {
  chrome?: {
    braveRequestAdsEnabled?: () => Promise<boolean>
  }
}

declare module '*.svg' {
  const content: any
  export default content
}
