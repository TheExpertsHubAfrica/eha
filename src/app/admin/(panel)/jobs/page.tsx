import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Jobs</h1>
          <p className="mt-1 text-sm text-muted">Create, feature, publish, or archive work opportunities.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/jobs/new">New job</Link>
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Availability</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/jobs/${job.id}`} className="font-medium text-blue hover:underline">
                    {job.title}
                  </Link>
                  {job.featured ? (
                    <Badge tone="gold" className="ml-2">
                      Featured
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  {job.city}, {job.country}
                </td>
                <td className="px-4 py-3 capitalize">{job.status}</td>
                <td className="px-4 py-3 capitalize">{job.availability}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
