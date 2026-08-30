import { NextResponse } from "next/server";
import { canAccessStep } from "@/lib/apply/steps";
import { HARD_MAX_BYTES } from "@/lib/uploads/validate";
import { saveUploadedDocument } from "@/server/application/documents";
import { loadDraftForJob } from "@/server/application/service";
import { getJobById } from "@/server/jobs";
import { ObjectStorageNotConfiguredError } from "@/server/storage";
import { consumeUploadSlot } from "@/server/uploads/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await context.params;
  const job = await getJobById(offerId);
  if (!job || job.availability !== "open") {
    return NextResponse.json({ ok: false, error: "This opportunity is not open." }, { status: 404 });
  }
  const draft = await loadDraftForJob(offerId);
  if (!draft) {
    return NextResponse.json(
      { ok: false, error: "Start this application from the opportunity page." },
      { status: 401 },
    );
  }
  if (!canAccessStep(job, draft.stepsCompleted, "documents")) {
    return NextResponse.json(
      { ok: false, error: "Complete the previous application steps first." },
      { status: 403 },
    );
  }

  const limited = consumeUploadSlot(draft.id);
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many uploads. Wait a little and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ ok: false, error: "The upload could not be read." }, { status: 400 });
  }
  const file = form.get("file");
  const requirementKey = String(form.get("requirementKey") ?? "");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Choose a file to upload." }, { status: 400 });
  }
  if (file.size > HARD_MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "The file is larger than the 8 MB platform limit." },
      { status: 413 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const result = await saveUploadedDocument({
      job,
      draft,
      requirementKey,
      filename: file.name,
      bytes,
    });
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
    }
    return NextResponse.json({ ok: true, document: result.document });
  } catch (error) {
    if (error instanceof ObjectStorageNotConfiguredError) {
      console.error("document upload: storage not configured", error.message);
      return NextResponse.json(
        {
          ok: false,
          error:
            "Document storage is not set up on this server yet. Please contact support or try again later.",
        },
        { status: 503 },
      );
    }
    console.error("document upload failed", error);
    return NextResponse.json(
      { ok: false, error: "The file could not be uploaded. Please try again." },
      { status: 500 },
    );
  }
}
