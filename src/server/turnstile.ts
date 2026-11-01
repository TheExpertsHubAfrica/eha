const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const MAX_TOKEN_LENGTH = 2048;
const TIMEOUT_MS = 5000;

// These mean the visitor's token is bad. Any other error is our configuration or Cloudflare's.
const TOKEN_ERRORS = new Set(["missing-input-response", "invalid-input-response", "timeout-or-duplicate"]);

function turnstileSecret() {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return secret && siteKey ? secret : null;
}

/**
 * Tokens are single-use, so call this once per request. The check is skipped until both keys are
 * set, and allows the request if Cloudflare or our secret is at fault, because rate limits still
 * apply and a third-party outage should not stop people applying.
 */
export async function verifyTurnstile(token: unknown, ip: string, action: string) {
  const secret = turnstileSecret();
  if (!secret) return true;
  if (typeof token !== "string" || !token || token.length > MAX_TOKEN_LENGTH) return false;

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip === "unknown" ? undefined : ip }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const result = (await response.json()) as {
      success?: boolean;
      action?: string;
      "error-codes"?: string[];
    };
    if (result.success) {
      // Cloudflare's test keys return an empty action; real tokens carry the one set on the widget.
      return !result.action || result.action === action;
    }
    const codes = result["error-codes"] ?? [];
    if (codes.length > 0 && codes.every((code) => TOKEN_ERRORS.has(code))) return false;
    console.error("turnstile verification unavailable, allowing request", codes);
    return true;
  } catch (error) {
    console.error("turnstile verification unavailable, allowing request", error);
    return true;
  }
}
