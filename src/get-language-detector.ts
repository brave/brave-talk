export function getLangPref(): any {
  var language =
    (navigator.languages && navigator.languages[0]) || navigator.language;

  if (language == "ja") return "ja";
  return "en";
}
