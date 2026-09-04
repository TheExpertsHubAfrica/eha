import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { AdminCatalogBrowser } from "@/components/admin/catalog-browser";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Study destinations",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminStudyPage() {
  await requireAdmin("study.write");
  const rows = await prisma.studyOpportunity.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  const items = rows.map((row) => ({
    id: row.id,
    href: `/admin/study/${row.id}`,
    title: row.name,
    subtitle: row.region,
    status: row.status,
    featured: row.featured,
    meta: "Study destination",
  }));

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Study"
        description="Destination-level study copy. Detailed course catalogues are not in this phase."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/study/new">New destination</Link>
          </Button>
        }
      />
      <AdminCatalogBrowser
        items={items}
        emptyTitle="No study destinations yet"
        emptyDescription="Add a destination with a short summary and the support you offer applicants."
        emptyActionHref="/admin/study/new"
        emptyActionLabel="Create destination"
        emptyIcon={<GraduationCap className="size-5" />}
        searchPlaceholder="Search destinations…"
      />
    </div>
  );
}
