import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  Plane,
  Plus,
} from "lucide-react";
import { AdminApplicationRow } from "@/components/admin/application-table-row";
import { BarList, Sparkline } from "@/components/admin/charts";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminPanel, AdminQuickAction, AdminStatCard } from "@/components/admin/stat-card";
import { ApplicationStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/admin/permissions";
import { loadAnalytics } from "@/server/analytics/queries";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

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

  const hour = new Date().getHours();
  const firstName = admin.name.split(/\s+/).filter(Boolean)[0] ?? admin.name;

  const primaryCards = stats
    ? [
        {
          label: "Total applications",
          value: stats.cards.total,
          href: "/admin/applications",
          hint: "All submitted and later",
        },
        {
          label: "Submitted this week",
          value: stats.cards.newThisWeek,
          href: "/admin/applications",
          hint: "Needs attention soon",
          accent: true,
        },
        {
          label: "Under review",
          value: stats.cards.underReview,
          href: "/admin/applications?status=under_review",
        },
        {
          label: "Shortlisted",
          value: stats.cards.shortlisted,
          href: "/admin/applications?status=shortlisted",
        },
      ]
    : [];

  const pipelineCards = stats
    ? [
        { label: "Approved", value: stats.cards.approved, href: "/admin/applications?status=approved" },
        { label: "Rejected", value: stats.cards.rejected, href: "/admin/applications?status=rejected" },
        { label: "Published jobs", value: stats.cards.publishedJobs, href: "/admin/jobs" },
        { label: "Travel packages", value: stats.cards.publishedTravel, href: "/admin/travel" },
        { label: "Study destinations", value: stats.cards.publishedStudy, href: "/admin/study" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Dashboard"
        title={`${greetingForHour(hour)}, ${firstName}`}
        description="Live counts from the database. Jump into applications, catalogue, or analytics from here."
        actions={
          can(admin.role, "applications.read") ? (
            <Button asChild size="sm">
              <Link href="/admin/applications">
                Review applications
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          ) : null
        }
      />

      {query.denied ? (
        <p
          className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          That section is not available for your role.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {can(admin.role, "applications.read") ? (
          <AdminQuickAction
            href="/admin/applications"
            title="Applications inbox"
            description="Filter, open and update candidate status"
            icon={<ClipboardList className="size-5" />}
          />
        ) : null}
        {can(admin.role, "jobs.write") ? (
          <AdminQuickAction
            href="/admin/jobs/new"
            title="Post a job"
            description="Create a new work abroad listing"
            icon={<Plus className="size-5" />}
          />
        ) : null}
        {can(admin.role, "jobs.write") ? (
          <AdminQuickAction
            href="/admin/jobs"
            title="Manage jobs"
            description="Publish, feature or archive roles"
            icon={<Briefcase className="size-5" />}
          />
        ) : null}
        {can(admin.role, "travel.write") ? (
          <AdminQuickAction
            href="/admin/travel"
            title="Travel packages"
            description="Update destinations and listing photos"
            icon={<Plane className="size-5" />}
          />
        ) : null}
      </div>

      {stats ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {primaryCards.map((card) => (
              <AdminStatCard
                key={card.label}
                label={card.label}
                value={card.value}
                href={card.href}
                hint={card.hint}
                accent={card.accent}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {pipelineCards.map((card) => (
              <AdminStatCard
                key={card.label}
                label={card.label}
                value={card.value}
                href={card.href}
              />
            ))}
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-border bg-white px-4 py-6 text-sm text-muted">
          Detailed analytics require the analyst or admin role.
        </p>
      )}

      {stats ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminPanel title="Application funnel">
            <BarList items={stats.funnel} />
          </AdminPanel>
          <AdminPanel
            title="Submitted · 30 days"
            action={
              can(admin.role, "analytics.read") ? (
                <Link
                  href="/admin/analytics"
                  className="text-xs font-semibold text-gold-deep hover:underline"
                >
                  Full analytics
                </Link>
              ) : null
            }
          >
            <Sparkline points={stats.days} />
          </AdminPanel>
        </div>
      ) : null}

      {can(admin.role, "applications.read") ? (
        <AdminPanel
          title="Recent applications"
          action={
            <Link href="/admin/applications" className="text-xs font-semibold text-gold-deep hover:underline">
              View all
            </Link>
          }
        >
          {recent.length === 0 ? (
            <AdminEmptyState
              title="No submitted applications yet"
              description="When candidates complete an application, they will appear here for review."
              className="border-0 px-0 py-4"
            />
          ) : (
            <div className="-mx-5 -mb-5 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border bg-surface text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Reference</th>
                    <th className="px-5 py-3 font-medium">Applicant</th>
                    <th className="px-5 py-3 font-medium">Opportunity</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((item) => (
                    <AdminApplicationRow
                      key={item.id}
                      href={`/admin/applications/${item.id}`}
                      label={item.referenceNumber ?? "Draft"}
                    >
                      <td className="px-5 py-3 font-medium text-navy group-hover:text-gold-deep">
                        {item.referenceNumber ?? "—"}
                      </td>
                      <td className="px-5 py-3">{item.profile?.fullName ?? "Incomplete profile"}</td>
                      <td className="px-5 py-3">
                        {item.job.title}, {item.job.city}
                      </td>
                      <td className="px-5 py-3">
                        <ApplicationStatusBadge status={item.status} />
                      </td>
                    </AdminApplicationRow>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminPanel>
      ) : null}
    </div>
  );
}
