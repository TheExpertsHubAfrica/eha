import { createHash, randomBytes } from "node:crypto";

export function createDraftToken() {
  return randomBytes(32).toString("base64url");
}

export function hashDraftToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function draftCookieName(jobId: string) {
  return `eha_draft_${jobId}`;
}

export const DRAFT_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
