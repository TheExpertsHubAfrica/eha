import { createHash, randomBytes, randomInt } from "node:crypto";

export function createDraftToken() {
  return randomBytes(32).toString("base64url");
}

export function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

// No 0/O or 1/I, because applicants retype references on the payments page.
const REFERENCE_SUFFIX_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function createReferenceSuffix() {
  let suffix = "";
  for (let i = 0; i < 6; i += 1) {
    suffix += REFERENCE_SUFFIX_ALPHABET[randomInt(REFERENCE_SUFFIX_ALPHABET.length)];
  }
  return suffix;
}

export function draftCookieName(jobId: string) {
  return `eha_draft_${jobId}`;
}

export const DRAFT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
