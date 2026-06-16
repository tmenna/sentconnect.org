import { logger } from "./logger";

/**
 * Verifies a Cloudflare Turnstile challenge token server-side.
 *
 * - If TURNSTILE_SECRET_KEY is not set the check is skipped (returns true).
 *   This allows the demo to work in dev/staging without Cloudflare keys.
 * - If the key IS set and no token is supplied the request is rejected.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  ip?: string,
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;   // not configured — pass through in dev
  if (!token)     return false;  // key set but caller sent no token — reject

  try {
    const body = new URLSearchParams({ secret: secretKey, response: token });
    if (ip) body.set("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() },
    );

    if (!res.ok) {
      logger.warn({ status: res.status }, "turnstile: siteverify API error");
      return false;
    }

    const data = await res.json() as { success: boolean; "error-codes"?: string[] };
    if (!data.success) {
      logger.warn({ errorCodes: data["error-codes"] }, "turnstile: token rejected");
    }
    return data.success === true;
  } catch (err) {
    logger.error({ err }, "turnstile: network error during verification");
    return false;
  }
}
