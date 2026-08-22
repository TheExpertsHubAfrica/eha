const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const buffer = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const byte of buffer) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64Url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function signAdminToken(payload: string, secret: string) {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return `${toBase64Url(encoder.encode(payload))}.${toBase64Url(signature)}`;
}

export async function verifyAdminToken(token: string, secret: string) {
  const split = token.lastIndexOf(".");
  if (split <= 0) return null;
  let payload: string;
  try {
    payload = new TextDecoder().decode(fromBase64Url(token.slice(0, split)));
  } catch {
    return null;
  }
  const signature = token.slice(split + 1);
  const key = await hmacKey(secret);
  const ok = await crypto.subtle.verify("HMAC", key, fromBase64Url(signature), encoder.encode(payload));
  if (!ok) return null;
  try {
    const data = JSON.parse(payload) as { sub?: string; exp?: number };
    if (!data.sub || !data.exp || data.exp * 1000 < Date.now()) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export const ADMIN_SESSION_COOKIE = "teha_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12;
