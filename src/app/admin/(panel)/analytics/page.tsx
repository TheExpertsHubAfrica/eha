import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarList, Sparkline, percent } from "@/components/admin/charts";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminStatCard } from "@/components/admin/stat-card";
import { loadAnalytics } from "@/server/analytics/queries";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Analytics",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  await requireAdmin("analytics.read");
  const stats = await loadAnalytics();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Workspace"
        title="Analytics"
        description="Page views are counted when a public detail page loads. Conversion is submitted applications divided by job views. These are not unique visitors."
        actions={
          <>
            <Button asChild size="sm" variant="outline">
              <a href="/admin/analytics/export?type=applications">Applications CSV</a>
            </Button>
            <Button asChild size="sm" variant="outline">
              <a href="/admin/analytics/export?type=jobs">Job report CSV</a>
            </Button>
          </>
        }
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <AdminStatCard
          label="Completion rate"
          value={percent(stats.completionRate)}
          hint="Submitted / applications started"
        />
        <AdminStatCard
          label="Document completeness"
          value={percent(stats.documentRate)}
          hint="Submitted files with at least one upload"
        />
        <AdminStatCard
          label="Abandoned drafts"
          value={stats.abandoned}
          hint="Expired, or untouched for 7 days"
          accent
        />
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-navy">Funnel</h2>
            <div className="mt-4">
              <BarList items={stats.funnel} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-navy">By status</h2>
            <div className="mt-4">
              <BarList items={stats.byStatus} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-navy">Submitted · 30 days</h2>
            <div className="mt-4">
              <Sparkline points={stats.days} />
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h2 className="text-sm font-semibold text-navy">By country</h2>
            <div className="mt-4">
              <BarList items={stats.byCountry} empty="No submitted applications yet." />
            </div>
          </CardBody>
        </Card>
      </div>
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-navy">Job performance</h2>
        {stats.jobPerformance.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No job views or applications recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Views</th>
                  <th className="px-4 py-3 font-medium">Started</th>
                  <th className="px-4 py-3 font-medium">Submitted</th>
                  <th className="px-4 py-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {stats.jobPerformance.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border transition-colors last:border-0 hover:bg-gold-soft/20"
                  >
                    <td className="px-4 py-3">
                      {row.title}
                      <span className="block text-muted">{row.city}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{row.views}</td>
                    <td className="px-4 py-3 tabular-nums">{row.started}</td>
                    <td className="px-4 py-3 tabular-nums">{row.applied}</td>
                    <td className="px-4 py-3 tabular-nums">{percent(row.conversion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
