const PROMO_STORAGE_KEY = 'extension_promo_dismissed'

export function shouldShowExtensionPromo (): boolean {
  const value = window.localStorage.getItem(PROMO_STORAGE_KEY)
  return value !== 'true'
}

export function incrementExtensionPromoCounter (): void {
  if (window.localStorage.getItem(PROMO_STORAGE_KEY) === 'true') {
    return
  }
  let value = Number(window.localStorage.getItem(PROMO_STORAGE_KEY))
  if (value < 3) {
    value += 1
    window.localStorage.setItem(PROMO_STORAGE_KEY, value.toString())
  } else {
    window.localStorage.setItem(PROMO_STORAGE_KEY, 'true')
  }
}
