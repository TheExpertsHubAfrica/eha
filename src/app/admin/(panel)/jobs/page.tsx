import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { AdminCatalogBrowser } from "@/components/admin/catalog-browser";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { offerCoverUrl } from "@/lib/covers";
import { workCoverForJob } from "@/lib/site-images";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Jobs",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminJobsPage() {
  await requireAdmin("jobs.write");
  const jobs = await prisma.job.findMany({
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  const items = jobs.map((job) => {
    const coverImageUrl = job.coverImageKey ? offerCoverUrl("job", job.id) : null;
    return {
      id: job.id,
      href: `/admin/jobs/${job.id}`,
      title: job.title,
      subtitle: `${job.city}, ${job.country}`,
      status: job.status,
      featured: job.featured,
      availability: job.availability,
      coverUrl: workCoverForJob({
        id: job.id,
        category: job.category,
        slug: job.slug,
        coverImageUrl,
      }),
      meta: job.category,
    };
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalogue"
        title="Jobs"
        description="Create, feature, publish, or archive work opportunities. Listing photos appear on the public Work Abroad cards."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/jobs/new">New job</Link>
          </Button>
        }
      />
      <AdminCatalogBrowser
        items={items}
        emptyTitle="No jobs yet"
        emptyDescription="Add your first work abroad opportunity. You can upload a listing photo after saving."
        emptyActionHref="/admin/jobs/new"
        emptyActionLabel="Create job"
        emptyIcon={<Briefcase className="size-5" />}
        searchPlaceholder="Search jobs by title, city or category…"
      />
    </div>
  );
}
