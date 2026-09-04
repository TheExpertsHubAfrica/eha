import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { getObjectStorage } from "@/server/storage";

export const runtime = "nodejs";

type Kind = "job" | "travel";

function isKind(value: string): value is Kind {
  return value === "job" || value === "travel";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ kind: string; id: string }> },
) {
  const { kind, id } = await context.params;
  if (!isKind(kind) || !id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const row =
    kind === "job"
      ? await prisma.job.findUnique({
          where: { id },
          select: { coverImageKey: true, coverImageMime: true },
        })
      : await prisma.travelPackage.findUnique({
          where: { id },
          select: { coverImageKey: true, coverImageMime: true },
        });

  if (!row?.coverImageKey) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const body = await getObjectStorage().get(row.coverImageKey);
    return new NextResponse(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": row.coverImageMime || "image/jpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
