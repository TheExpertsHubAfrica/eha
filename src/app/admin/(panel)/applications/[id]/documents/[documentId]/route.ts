import { NextResponse } from "next/server";
import { can } from "@/lib/admin/permissions";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { readStoredDocument } from "@/server/application/documents";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_") || "download";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

export async function GET(
  _request: Request,
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
  await writeAdminAudit({
    actorId: admin.id,
    action: "document.download",
    targetType: "UploadedDocument",
    targetId: record.id,
    metadata: { applicationId: id, requirementKey: record.requirementKey },
  });
  return new NextResponse(new Uint8Array(stored.body), {
    status: 200,
    headers: {
      "Content-Type": stored.document.mimeType,
      "Content-Disposition": contentDisposition(stored.document.originalFilename),
      "Content-Length": String(stored.body.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
