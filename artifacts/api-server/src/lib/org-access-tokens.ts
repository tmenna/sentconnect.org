import { randomBytes } from "crypto";

interface OrgAccessToken {
  userId: number;
  orgSubdomain: string;
  expiresAt: number;
}

const _tokens = new Map<string, OrgAccessToken>();

export function createOrgAccessToken(userId: number, orgSubdomain: string): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 90_000; // 90 seconds
  _tokens.set(token, { userId, orgSubdomain, expiresAt });
  // Purge stale entries
  for (const [k, v] of _tokens) {
    if (v.expiresAt < Date.now()) _tokens.delete(k);
  }
  return token;
}

export function redeemOrgAccessToken(token: string): OrgAccessToken | null {
  const entry = _tokens.get(token);
  if (!entry) return null;
  _tokens.delete(token); // one-time use
  if (entry.expiresAt < Date.now()) return null;
  return entry;
}
