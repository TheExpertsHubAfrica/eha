import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { BarList, Sparkline, percent } from "@/components/admin/charts";
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-navy">Analytics</h1>
          <p className="mt-1 text-sm text-muted">
            Page views are counted when a public detail page loads. Conversion is submitted applications divided by job views. These are not unique visitors.
          </p>
        </div>
        <div className="flex gap-3 text-sm">
          <a className="text-blue hover:underline" href="/admin/analytics/export?type=applications">
            Applications CSV
          </a>
          <a className="text-blue hover:underline" href="/admin/analytics/export?type=jobs">
            Job report CSV
          </a>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Completion rate</p>
            <p className="mt-2 text-2xl font-semibold text-navy">{percent(stats.completionRate)}</p>
            <p className="mt-1 text-xs text-muted">Submitted / applications started</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Document completeness</p>
            <p className="mt-2 text-2xl font-semibold text-navy">{percent(stats.documentRate)}</p>
            <p className="mt-1 text-xs text-muted">Submitted files that include at least one upload</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-sm text-muted">Abandoned drafts</p>
            <p className="mt-2 text-2xl font-semibold text-navy">{stats.abandoned}</p>
            <p className="mt-1 text-xs text-muted">Expired, or untouched for 7 days</p>
          </CardBody>
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3">
                      {row.title}
                      <span className="block text-muted">{row.city}</span>
                    </td>
                    <td className="px-4 py-3">{row.views}</td>
                    <td className="px-4 py-3">{row.started}</td>
                    <td className="px-4 py-3">{row.applied}</td>
                    <td className="px-4 py-3">{percent(row.conversion)}</td>
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
