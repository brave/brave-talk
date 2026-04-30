import { loadLocalJwtStore } from "./jwt-store";
import { getCsrfToken, fetchWithTimeout } from "./lib";

const PENDING_RECOVERY_TOKEN_KEY = "pendingRecoveryToken";
const PENDING_RECOVERY_TOKEN_MAX_AGE_MS = 10 * 60 * 1000;

// Captured at module load so a later history.replaceState (e.g. by
// useSubscribedStatus stripping the order/intent params) cannot race with
// consumePendingRecoveryToken.
const initialQueryParams = new URLSearchParams(window.location.search);

interface PendingRecoveryToken {
  token: string;
  savedAt: number;
}

export function savePendingRecoveryToken(token: string): void {
  const payload: PendingRecoveryToken = { token, savedAt: Date.now() };
  localStorage.setItem(PENDING_RECOVERY_TOKEN_KEY, JSON.stringify(payload));
}

export function consumePendingRecoveryToken(): string | null {
  const stored = localStorage.getItem(PENDING_RECOVERY_TOKEN_KEY);
  if (!stored) {
    return null;
  }

  let parsed: PendingRecoveryToken | null = null;
  try {
    parsed = JSON.parse(stored) as PendingRecoveryToken;
  } catch {
    // fall through to expiry/cleanup below
  }

  const isValid =
    !!parsed?.token &&
    typeof parsed.savedAt === "number" &&
    Date.now() - parsed.savedAt <= PENDING_RECOVERY_TOKEN_MAX_AGE_MS;

  if (!isValid) {
    localStorage.removeItem(PENDING_RECOVERY_TOKEN_KEY);
    return null;
  }

  const hasCreds =
    !!initialQueryParams.get("order") &&
    initialQueryParams.get("intent") === "recover";
  return hasCreds ? parsed!.token : null;
}

export class NoRefreshTokensError extends Error {
  constructor() {
    super("No refresh tokens found. Please join a room first.");
    this.name = "NoRefreshTokensError";
  }
}

export class PremiumRoomsConflictError extends Error {
  constructor() {
    super("Some rooms require an active premium subscription to recover.");
    this.name = "PremiumRoomsConflictError";
  }
}

export class TooManyRoomsError extends Error {
  constructor() {
    super("Too many rooms.");
    this.name = "TooManyRoomsError";
  }
}

export async function loadRecoveryToken(
  recoveryToken: string,
  force: boolean,
): Promise<void> {
  const url = "/api/v1/recovery";
  const csrfToken = await getCsrfToken(url);

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    credentials: "include",
    body: JSON.stringify({ recoveryToken, force }),
  });

  if (response.status === 409) {
    throw new PremiumRoomsConflictError();
  }

  if (response.status === 413) {
    throw new TooManyRoomsError();
  }

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  const body = await response.json();
  const store = loadLocalJwtStore();
  store.storeRefreshTokens(body.refreshTokens);
}

export async function createRecoveryToken(): Promise<string> {
  const store = loadLocalJwtStore();
  const refreshTokens = store.getAllRefreshTokens();

  if (refreshTokens.length === 0) {
    throw new NoRefreshTokensError();
  }

  const url = "/api/v1/backup";
  const csrfToken = await getCsrfToken(url);

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
    credentials: "include",
    body: JSON.stringify({ refreshTokens }),
  });

  if (response.status === 413) {
    throw new TooManyRoomsError();
  }

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  const body = await response.json();
  return body.recoveryToken;
}
