import type { Metadata } from "next";
import Link from "next/link";
import { AdminApplicationRow } from "@/components/admin/application-table-row";
import { Card, CardBody } from "@/components/ui/card";
import { BarList, Sparkline } from "@/components/admin/charts";
import { can } from "@/lib/admin/permissions";
import { statusLabel } from "@/lib/admin/status";
import { loadAnalytics } from "@/server/analytics/queries";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const admin = await requireAdmin("dashboard.read");
  const query = await searchParams;
  const stats = can(admin.role, "analytics.read") ? await loadAnalytics() : null;
  const recent = can(admin.role, "applications.read")
    ? await prisma.application.findMany({
        where: { status: { not: "draft" } },
        orderBy: { submittedAt: "desc" },
        take: 8,
        include: { profile: true, job: true },
      })
    : [];

  const cards = stats
    ? [
        { label: "Total applications", value: stats.cards.total },
        { label: "Submitted this week", value: stats.cards.newThisWeek },
        { label: "Under review", value: stats.cards.underReview },
        { label: "Shortlisted", value: stats.cards.shortlisted },
        { label: "Approved", value: stats.cards.approved },
        { label: "Rejected", value: stats.cards.rejected },
        { label: "Published jobs", value: stats.cards.publishedJobs },
        { label: "Travel packages", value: stats.cards.publishedTravel },
        { label: "Study destinations", value: stats.cards.publishedStudy },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Overview</h1>
      <p className="mt-1 text-sm text-muted">Live counts from the database. Charts use submitted applications, not invented figures.</p>
      {query.denied ? (
        <p className="mt-4 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
          That section is not available for your role.
        </p>
      ) : null}
      {stats ? (
        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-lg border border-border bg-white px-3 py-2.5 sm:px-4 sm:py-3"
            >
              <p className="text-[11px] leading-snug text-muted sm:text-xs">{card.label}</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-navy sm:mt-1 sm:text-xl">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-muted">Detailed analytics require the analyst or admin role.</p>
      )}
      {stats ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Card>
            <CardBody>
              <h2 className="text-sm font-semibold text-navy">Application funnel</h2>
              <div className="mt-4">
                <BarList items={stats.funnel} />
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
        </div>
      ) : null}
      {can(admin.role, "analytics.read") ? (
        <p className="mt-6 text-sm">
          <Link href="/admin/analytics" className="text-blue hover:underline">
            Open full analytics
          </Link>
        </p>
      ) : null}
      {can(admin.role, "applications.read") ? (
        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-semibold text-navy">Recent applications</h2>
            <Link href="/admin/applications" className="text-sm text-blue hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No submitted applications yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Applicant</th>
                    <th className="px-4 py-3 font-medium">Opportunity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <AdminApplicationRow
                      key={item.id}
                      href={`/admin/applications/${item.id}`}
                      label={item.referenceNumber ?? "Draft"}
                    >
                      <td className="px-4 py-3 font-medium text-navy group-hover:text-blue">
                        {item.referenceNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">{item.profile?.fullName ?? "Incomplete profile"}</td>
                      <td className="px-4 py-3">
                        {item.job.title}, {item.job.city}
                      </td>
                      <td className="px-4 py-3 capitalize">{statusLabel(item.status)}</td>
                    </AdminApplicationRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
