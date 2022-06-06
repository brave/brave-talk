export function getLangPref(): any {
  const lang = window.localStorage.getItem("jitsiLocalStorage");
  if (lang) {
    let val = JSON.parse(lang);
    console.log(val.language);
    if (val.language == "ja") {
      return val.language;
    }
  }
  return "en";
}
