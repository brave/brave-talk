const PROMO_STORAGE_KEY = "extension_promo_dismissed";

export function shouldShowExtensionPromo(): boolean {
  const value = window.localStorage.getItem(PROMO_STORAGE_KEY);
  return value !== "true";
}

export function recordExtensionPromoDismissed(): void {
  window.localStorage.setItem(PROMO_STORAGE_KEY, "true");
}
