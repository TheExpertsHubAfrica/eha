import { NextResponse } from "next/server";
import {
  readOwnedDocument,
  removeUploadedDocument,
} from "@/server/application/documents";
import { loadDraftForJob } from "@/server/application/service";
import { getJobById } from "@/server/jobs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function contentDisposition(filename: string) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/["\\]/g, "_") || "download";
  return `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}

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
  _request: Request,
  context: { params: Promise<{ offerId: string; documentId: string }> },
) {
  const { offerId, documentId } = await context.params;
  const loaded = await ownedDraft(offerId);
  if ("error" in loaded) {
    return NextResponse.json({ ok: false, error: loaded.error }, { status: loaded.status });
  }
  const owned = await readOwnedDocument(loaded.draft, documentId);
  if (!owned) {
    return NextResponse.json({ ok: false, error: "Document not found." }, { status: 404 });
  }
  return new NextResponse(new Uint8Array(owned.body), {
    status: 200,
    headers: {
      "Content-Type": owned.document.mimeType,
      "Content-Disposition": contentDisposition(owned.document.originalFilename),
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
