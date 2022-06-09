export function getLangPref(): any {
  const language =
    (navigator.languages && navigator.languages[0]) || navigator.language;

  if (language === "ja") return "ja";
  return "en";
}
