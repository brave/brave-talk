import { loadLocalJwtStore } from "./jwt-store";
import { getCsrfToken, fetchWithTimeout } from "./lib";

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

  if (!response.ok) {
    throw new Error(
      `Request failed: ${response.status} ${response.statusText}`,
    );
  }

  const body = await response.json();
  return body.recoveryToken;
}
