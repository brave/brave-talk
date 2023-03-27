import { resources, defaultNS } from "../i18n/i18next";

// see https://www.i18next.com/overview/typescript
// for why this is set up like this - it gives us typesafety, confirming
// at compile time that the translations keys we reference exist.

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)["en"];
  }
}
