import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminStudyForm } from "@/components/admin/offer-forms";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.studyOpportunity.findUnique({ where: { id }, select: { name: true } });
  return { title: row?.name ?? "Study destination", robots: { index: false, follow: false } };
}

export default async function AdminEditStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("study.write");
  const { id } = await params;
  const row = await prisma.studyOpportunity.findUnique({ where: { id } });
  if (!row) notFound();
  return (
    <div>
      <Link href="/admin/study" className="text-sm text-blue hover:underline">
        Back to study
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">{row.name}</h1>
      <AdminStudyForm
        item={{
          id: row.id,
          name: row.name,
          slug: row.slug,
          region: row.region,
          summary: row.summary,
          support: row.support.join("\n"),
          featured: row.featured,
          status: row.status,
        }}
      />
    </div>
  );
}
