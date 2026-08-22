import { NextResponse } from "next/server";
import {
  readOwnedDocument,
  removeUploadedDocument,
} from "@/server/application/documents";
import { loadDraftForJob } from "@/server/application/service";
import { getJobById } from "@/server/jobs";
import {
  contentDisposition,
  isPreviewableMime,
  parseDisposition,
} from "@/lib/uploads/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function ownedDraft(offerId: string) {
  const job = await getJobById(offerId);
  if (!job) return { error: "Opportunity not found.", status: 404 as const };
  const draft = await loadDraftForJob(offerId);
  if (!draft) {
    return { error: "Start this application from the opportunity page.", status: 401 as const };
  }
  return { job, draft };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ offerId: string; documentId: string }> },
) {
  const { offerId, documentId } = await context.params;
  const loaded = await ownedDraft(offerId);
  if ("error" in loaded) {
    return NextResponse.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }
  let disposition = parseDisposition(request);
  const owned = await readOwnedDocument(
    loaded.draft,
    documentId,
    disposition === "inline" ? "preview" : "download",
  );
  if (!owned) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }

  if (disposition === "inline" && !isPreviewableMime(owned.document.mimeType)) {
    disposition = "attachment";
  }

  return new NextResponse(new Uint8Array(owned.body), {
    status: 200,
    headers: {
      "Content-Type": owned.document.mimeType,
      "Content-Disposition": contentDisposition(
        owned.document.originalFilename,
        disposition,
      ),
      "Content-Length": String(owned.body.length),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ offerId: string; documentId: string }> },
) {
  const { offerId, documentId } = await context.params;
  const loaded = await ownedDraft(offerId);
  if ("error" in loaded) {
    return NextResponse.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }
  const result = await removeUploadedDocument(loaded.draft, documentId, loaded.job);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
