declare let window: any;

export interface POAP {
  event: {
    id: number;
    name: string;
    image_url: string;
  };
  tokenId: string;
}

export interface NFTcollection {
  id: string;
  name: string;
  image_url: string;
}

export interface NFT {
  image_url: string;
  name: string;
  id: string;
  collection?: {
    collection_id: string;
    name: string;
    image_url: string;
    spam_score: number;
  };
  previews?: {
    image_small_url: string;
  };
}

const AVATAR_URL_SESSION_KEY = "avatar_url";

/**
 * Sets or clears avatar url from session based on passed value. Null/Undefined clears any value
 * currently set, string values are set as the new value.
 * @param {string|undefined|null} url - The url to set, if present
 * @returns {void}
 */
export function rememberAvatarUrl(url: string | undefined | null) {
  if (url) {
    window.sessionStorage.setItem(AVATAR_URL_SESSION_KEY, url);
  } else {
    window.sessionStorage.removeItem(AVATAR_URL_SESSION_KEY);
  }
}

/**
 * Gets the currently set avatar url, if any
 * @returns {string|null} - The avatar url value or a null value
 */
export function getAvatarUrl(jwt: string): string | null {
  const sessionAvatar = window.sessionStorage.getItem(AVATAR_URL_SESSION_KEY);
  return sessionAvatar || jwt_decode(jwt).avatar_url || null;
}
