export function getLangPref(): string {
  const language =
    (navigator.languages && navigator.languages[0]) || navigator.language;

  if (language === "ja-JP" || language === "ja") return "ja";
  return "en";
}
