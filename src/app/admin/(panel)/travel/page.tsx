import type { Metadata } from "next";
import Link from "next/link";
import { Plane } from "lucide-react";
import { AdminCatalogBrowser } from "@/components/admin/catalog-browser";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { offerCoverUrl } from "@/lib/covers";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Travel packages",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminTravelPage() {
  await requireAdmin("travel.write");
  const rows = await prisma.travelPackage.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  const items = rows.map((row) => ({
    id: row.id,
    href: `/admin/travel/${row.id}`,
    title: row.name,
    subtitle: `${row.destination}, ${row.country}`,
    status: row.status,
    featured: row.featured,
    coverUrl: row.coverImageKey ? offerCoverUrl("travel", row.id) : null,
    meta: row.duration,
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Travel"
        description="Publish and feature destination packages. Upload a listing photo to replace the accent panel on public cards."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/travel/new">New package</Link>
          </Button>
        }
      />
      <AdminCatalogBrowser
        items={items}
        emptyTitle="No travel packages yet"
        emptyDescription="Create a package with destination details and an optional cover photo."
        emptyActionHref="/admin/travel/new"
        emptyActionLabel="Create package"
        emptyIcon={<Plane className="size-5" />}
        searchPlaceholder="Search packages by name or destination…"
      />
    </div>
  );
}
