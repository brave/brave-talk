import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLangPref } from "../get-language-detector";

import transEN from "./locales/en/translation.json";
import transJP from "./locales/jp/translation.json";

// see https://www.i18next.com/overview/typescript
// for why this is set up like this
export const defaultNS = "translation";
export const resources = {
  en: {
    translation: transEN,
  },
  ja: {
    translation: transJP,
  },
} as const;

// this type defines all of the keys used in the english translation file,
// use these for all strings shown to the user so the compiler checks whether
// all keys are defined.
export type TranslationKeys = keyof (typeof resources)["en"]["translation"];

// localizing brave-talk for English and Japanese
i18next.use(initReactI18next).init({
  lng: getLangPref(),
  debug: false,
  fallbackLng: "en",
  resources,
  interpolation: {
    escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
  },
});
