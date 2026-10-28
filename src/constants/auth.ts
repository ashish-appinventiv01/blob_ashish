export const AUTH = {
  cookieName: "token",
  sessionTtlMs: 7 * 24 * 60 * 60 * 1000,
  bcryptRounds: 12,
  tokenBytes: 32,
} as const;
