import { randomBytes } from "node:crypto";
import { inspectUpload } from "@/lib/uploads/validate";
import { getObjectStorage } from "@/server/storage";

const COVER_REQUIREMENT = {
  acceptedTypes: ["image/jpeg", "image/png"],
  maxSizeMb: 5,
};

export type CoverKind = "job" | "travel";

export type CoverUploadResult =
  | { ok: true; storageKey: string; mimeType: string }
  | { ok: false; error: string };

function storagePrefix(kind: CoverKind, id: string) {
  return `covers/${kind}s/${id}`;
}

export async function uploadOfferCover(
  kind: CoverKind,
  id: string,
  file: File,
  previousKey?: string | null,
): Promise<CoverUploadResult> {
  if (file.size === 0) {
    return { ok: false, error: "The cover image file is empty." };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const inspected = inspectUpload(bytes, file.name || "cover.jpg", COVER_REQUIREMENT);
  if (!inspected.ok) {
    return { ok: false, error: inspected.error };
  }

  const storageKey = `${storagePrefix(kind, id)}/${randomBytes(8).toString("hex")}.${inspected.extension}`;
  const storage = getObjectStorage();
  await storage.put(storageKey, bytes, inspected.mimeType);

  if (previousKey && previousKey !== storageKey) {
    await storage.delete(previousKey).catch(() => undefined);
  }

  return { ok: true, storageKey, mimeType: inspected.mimeType };
}

export async function deleteOfferCover(storageKey: string | null | undefined) {
  if (!storageKey) return;
  await getObjectStorage().delete(storageKey).catch(() => undefined);
}

export function coverFileFromForm(formData: FormData) {
  const value = formData.get("coverImage");
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

export function shouldRemoveCover(formData: FormData) {
  return formData.get("removeCover") === "1";
}
