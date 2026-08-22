import { cookies } from "next/headers";
import { DRAFT_MAX_AGE_SECONDS, draftCookieName } from "@/lib/apply/token";

export async function readDraftToken(jobId: string) {
  const store = await cookies();
  return store.get(draftCookieName(jobId))?.value ?? null;
}

export async function writeDraftToken(jobId: string, token: string) {
  const store = await cookies();
  store.set(draftCookieName(jobId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DRAFT_MAX_AGE_SECONDS,
  });
}
