import { Prisma } from "@prisma/client";
import { createHash, randomBytes } from "node:crypto";
import type { JobOffer } from "@/lib/catalog/types";
import { applyPath, getFirstIncompleteStep } from "@/lib/apply/steps";
import { missingRequiredDocuments } from "@/lib/apply/documents";
import type { DocumentMeta } from "@/lib/uploads/types";
import { inspectUpload } from "@/lib/uploads/validate";
import { prisma } from "@/server/db";
import { getObjectStorage, storageDriverName } from "@/server/storage";
import type { DraftApplication } from "@/server/application/service";

const REQUIREMENT_KEY = /^[a-z0-9_]{1,64}$/;

export function toDocumentMeta(doc: {
  id: string;
  requirementKey: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}): DocumentMeta {
  return {
    id: doc.id,
    requirementKey: doc.requirementKey,
    originalFilename: doc.originalFilename,
    mimeType: doc.mimeType,
    sizeBytes: doc.sizeBytes,
    createdAt: doc.createdAt.toISOString(),
  };
}

function safeKeyPart(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64);
}

async function writeAudit(input: {
  actorId: string;
  action: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorType: "applicant",
      actorId: input.actorId,
      action: input.action,
      targetType: "UploadedDocument",
      targetId: input.targetId,
      metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => undefined);
}

export async function saveUploadedDocument(input: {
  job: JobOffer;
  draft: DraftApplication;
  requirementKey: string;
  filename: string;
  bytes: Buffer;
}) {
  if (!REQUIREMENT_KEY.test(input.requirementKey)) {
    return { ok: false as const, status: 400, error: "Unknown document slot." };
  }
  const requirement = input.job.documentRequirements.find((item) => item.key === input.requirementKey);
  if (!requirement) {
    return { ok: false as const, status: 400, error: "This opportunity does not request that document." };
  }

  const inspected = inspectUpload(input.bytes, input.filename, requirement);
  if (!inspected.ok) {
    const status = inspected.code === "size" ? 413 : inspected.code === "blocked" ? 415 : 400;
    return { ok: false as const, status, error: inspected.error };
  }

  const checksum = createHash("sha256").update(input.bytes).digest("hex");
  const storageKey = [
    "applications",
    safeKeyPart(input.draft.id),
    safeKeyPart(input.requirementKey),
    `${randomBytes(16).toString("hex")}.${inspected.extension}`,
  ].join("/");

  const storage = getObjectStorage();
  await storage.put(storageKey, input.bytes, inspected.mimeType);

  try {
    const previous = input.draft.documents.find((doc) => doc.requirementKey === input.requirementKey);
    const saved = await prisma.$transaction(async (tx) => {
      if (previous) {
        await tx.uploadedDocument.delete({ where: { id: previous.id } });
      }
      return tx.uploadedDocument.create({
        data: {
          applicationId: input.draft.id,
          requirementKey: input.requirementKey,
          originalFilename: inspected.originalFilename,
          storageKey,
          mimeType: inspected.mimeType,
          sizeBytes: input.bytes.length,
          checksumSha256: checksum,
        },
      });
    });

    if (previous) {
      await storage.delete(previous.storageKey).catch(() => undefined);
    }
    await writeAudit({
      actorId: input.draft.id,
      action: "document.upload",
      targetId: saved.id,
      metadata: {
        requirementKey: input.requirementKey,
        mimeType: inspected.mimeType,
        sizeBytes: input.bytes.length,
        storage: storageDriverName(),
      },
    });
    return { ok: true as const, document: toDocumentMeta(saved) };
  } catch (error) {
    await storage.delete(storageKey).catch(() => undefined);
    throw error;
  }
}

export async function removeUploadedDocument(draft: DraftApplication, documentId: string, job: JobOffer) {
  const existing = draft.documents.find((doc) => doc.id === documentId);
  if (!existing) {
    return { ok: false as const, status: 404, error: "Document not found." };
  }

  await prisma.uploadedDocument.delete({ where: { id: existing.id } });
  await getObjectStorage().delete(existing.storageKey).catch(() => undefined);

  const remaining = draft.documents.filter((doc) => doc.id !== existing.id);
  if (missingRequiredDocuments(job, remaining).length > 0) {
    await prisma.application.update({
      where: { id: draft.id },
      data: {
        currentStep: "documents",
        stepsCompleted: draft.stepsCompleted.filter((step) => step !== "documents"),
      },
    });
  }

  await writeAudit({
    actorId: draft.id,
    action: "document.delete",
    targetId: existing.id,
    metadata: { requirementKey: existing.requirementKey },
  });
  return { ok: true as const };
}

export async function readStoredDocument(documentId: string) {
  const existing = await prisma.uploadedDocument.findUnique({
    where: { id: documentId },
  });
  if (!existing) return null;
  const body = await getObjectStorage().get(existing.storageKey);
  return { document: existing, body };
}

export async function readOwnedDocument(
  draft: DraftApplication,
  documentId: string,
  purpose: "download" | "preview" = "download",
) {
  const existing = draft.documents.find((doc) => doc.id === documentId);
  if (!existing) return null;
  const body = await getObjectStorage().get(existing.storageKey);
  await writeAudit({
    actorId: draft.id,
    action: purpose === "preview" ? "document.preview" : "document.download",
    targetId: existing.id,
    metadata: { requirementKey: existing.requirementKey, purpose },
  });
  return { document: existing, body };
}

export async function completeDocuments(job: JobOffer, draft: DraftApplication) {
  const missing = missingRequiredDocuments(job, draft.documents);
  if (missing.length > 0) {
    return {
      ok: false as const,
      error: `Upload required documents first: ${missing.map((item) => item.name).join(", ")}.`,
    };
  }
  const steps = Array.from(new Set([...draft.stepsCompleted, "documents"]));
  await prisma.application.update({
    where: { id: draft.id },
    data: { currentStep: "documents", stepsCompleted: steps },
  });
  return { ok: true as const, redirectTo: applyPath(job.id, getFirstIncompleteStep(job, steps).id) };
}
