import { NextResponse } from "next/server";
import { requireSubmittedAccess } from "@/server/application/access";
import { buildWorkProfilePdf } from "@/server/pdf/work-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ reference: string }> },
) {
  const { reference } = await context.params;
  const token = new URL(request.url).searchParams.get("t");
  const { application, job } = await requireSubmittedAccess(reference, token);
  const bytes = await buildWorkProfilePdf(application, job);
  const filename = `${application.referenceNumber}-work-profile.pdf`;
  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
