import { NextResponse } from "next/server";
import { can } from "@/lib/admin/permissions";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { readStoredDocument } from "@/server/application/documents";
import { prisma } from "@/server/db";
import {
  contentDisposition,
  isPreviewableMime,
  parseDisposition,
} from "@/lib/uploads/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; documentId: string }> },
) {
  const admin = await requireAdmin("applications.documents");
  if (!can(admin.role, "applications.documents")) {
    return NextResponse.json({ ok: false, error: "Not permitted." }, { status: 403 });
  }
  const { id, documentId } = await context.params;
  const record = await prisma.uploadedDocument.findFirst({
    where: { id: documentId, applicationId: id },
  });
  if (!record) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }
  const stored = await readStoredDocument(record.id);
  if (!stored) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }

  let disposition = parseDisposition(request);
  if (disposition === "inline" && !isPreviewableMime(stored.document.mimeType)) {
    disposition = "attachment";
  }

  await writeAdminAudit({
    actorId: admin.id,
    action: disposition === "inline" ? "document.preview" : "document.download",
    targetType: "UploadedDocument",
    targetId: record.id,
    metadata: {
      applicationId: id,
      requirementKey: record.requirementKey,
      disposition,
    },
  });

  return new NextResponse(new Uint8Array(stored.body), {
    status: 200,
    headers: {
      "Content-Type": stored.document.mimeType,
      "Content-Disposition": contentDisposition(
        stored.document.originalFilename,
        disposition,
      ),
      "Content-Length": String(stored.body.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
