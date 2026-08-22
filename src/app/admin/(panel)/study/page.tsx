import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Study</h1>
          <p className="mt-1 text-sm text-muted">
            Destination-level study copy. Detailed course catalogues are not in this phase.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/study/new">New destination</Link>
        </Button>
      </div>
      <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Region</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link href={`/admin/study/${row.id}`} className="font-medium text-blue hover:underline">
                    {row.name}
                  </Link>
                  {row.featured ? (
                    <Badge tone="gold" className="ml-2">
                      Featured
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">{row.region}</td>
                <td className="px-4 py-3 capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
