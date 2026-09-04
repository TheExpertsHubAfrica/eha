import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminTravelForm } from "@/components/admin/offer-forms";
import { offerCoverUrl } from "@/lib/covers";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.travelPackage.findUnique({ where: { id }, select: { name: true } });
  return { title: row?.name ?? "Travel package", robots: { index: false, follow: false } };
}

export default async function AdminEditTravelPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("travel.write");
  const { id } = await params;
  const row = await prisma.travelPackage.findUnique({ where: { id } });
  if (!row) notFound();
  return (
    <div>
      <Link href="/admin/travel" className="text-sm text-blue hover:underline">
        Back to travel
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold text-navy">{row.name}</h1>
      <AdminTravelForm
        pack={{
          id: row.id,
          name: row.name,
          slug: row.slug,
          destination: row.destination,
          country: row.country,
          duration: row.duration,
          summary: row.summary,
          includes: row.includes.join("\n"),
          excludes: row.excludes.join("\n"),
          featured: row.featured,
          status: row.status,
          accent: row.accent,
          coverImageUrl: row.coverImageKey ? offerCoverUrl("travel", row.id) : null,
        }}
      />
    </div>
  );
}
