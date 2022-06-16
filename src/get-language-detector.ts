export function getLangPref (): any {
  let language

  if (navigator.language !== '' && navigator.language !== null) {
    language = navigator.language
  } else if (navigator.languages !== null && navigator.languages[0] !== '' && navigator.languages[0] !== null) {
    language = navigator.languages[0]
  }

  if (language === 'ja') return 'ja'
  return 'en'
}
