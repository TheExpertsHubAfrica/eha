import type { Metadata } from "next";
import type { ApplicationStatus, Prisma } from "@prisma/client";
import { ClipboardList } from "lucide-react";
import { AdminApplicationRow } from "@/components/admin/application-table-row";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { AdminPageHeader } from "@/components/admin/page-header";
import {
  ApplicationPaymentBadge,
  ApplicationStatusBadge,
  summarizeApplicationPayments,
} from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { can } from "@/lib/admin/permissions";
import { adminStatuses, statusLabel } from "@/lib/admin/status";
import { formatDisplayDate } from "@/lib/utils";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "Applications",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function one(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin("applications.read");
  const showPaymentStatus = can(admin.role, "payments.read");
  const params = await searchParams;
  const q = one(params.q)?.trim() ?? "";
  const status = one(params.status) ?? "";
  const payment = one(params.payment) ?? "";
  const jobId = one(params.jobId) ?? "";
  const country = one(params.country) ?? "";
  const from = one(params.from) ?? "";
  const to = one(params.to) ?? "";

  const where: Prisma.ApplicationWhereInput = {};
  if (status === "all") {
    // include drafts
  } else if (status && status !== "active") {
    where.status = status as ApplicationStatus;
  } else {
    where.status = { not: "draft" };
  }
  if (jobId) where.jobId = jobId;
  if (country) where.job = { country };
  if (from || to) {
    where.submittedAt = {
      ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.000Z`) } : {}),
    };
  }
  if (q) {
    where.OR = [
      { referenceNumber: { contains: q, mode: "insensitive" } },
      { profile: { fullName: { contains: q, mode: "insensitive" } } },
      { profile: { email: { contains: q, mode: "insensitive" } } },
      { profile: { phone: { contains: q, mode: "insensitive" } } },
    ];
  }
  if (showPaymentStatus && payment === "paid") {
    where.payments = { some: { status: "success" } };
  } else if (showPaymentStatus && payment === "unpaid") {
    where.payments = { none: { status: "success" } };
  } else if (showPaymentStatus && payment === "pending") {
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { payments: { some: { status: "pending" } } },
      { payments: { none: { status: "success" } } },
    ];
  }

  const [rows, jobs, countries] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      take: 75,
      include: {
        profile: true,
        job: true,
        payments: showPaymentStatus
          ? {
              where: { status: { in: ["success", "pending"] } },
              select: { status: true, amountPesewas: true },
            }
          : false,
      },
    }),
    prisma.job.findMany({
      orderBy: { title: "asc" },
      select: { id: true, title: true, city: true },
    }),
    prisma.job.findMany({
      distinct: ["country"],
      select: { country: true },
      orderBy: { country: "asc" },
    }),
  ]);

  const hasFilters = Boolean(q || status || payment || jobId || country || from || to);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Workspace"
        title="Applications"
        description="Search by reference, name, email, or phone. Drafts are hidden unless you choose All."
      />

      <form className="mt-6 space-y-3 rounded-lg border border-border bg-white p-4 shadow-[0_1px_0_rgba(26,24,20,0.04)]">
        <div className="grid gap-3 md:grid-cols-6">
          <Input name="q" placeholder="Search reference, name, email…" defaultValue={q} className="md:col-span-2" />
          <NativeSelect name="status" defaultValue={status || "active"}>
            <option value="active">Submitted and later</option>
            <option value="all">All including drafts</option>
            {adminStatuses.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
            <option value="draft">draft</option>
          </NativeSelect>
          {showPaymentStatus ? (
            <NativeSelect name="payment" defaultValue={payment}>
              <option value="">Any payment</option>
              <option value="paid">Paid</option>
              <option value="pending">Payment pending</option>
              <option value="unpaid">Unpaid</option>
            </NativeSelect>
          ) : null}
          <NativeSelect name="jobId" defaultValue={jobId}>
            <option value="">All jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} · {job.city}
              </option>
            ))}
          </NativeSelect>
          <NativeSelect name="country" defaultValue={country}>
            <option value="">All countries</option>
            {countries.map((item) => (
              <option key={item.country} value={item.country}>
                {item.country}
              </option>
            ))}
          </NativeSelect>
          <div className="flex flex-wrap gap-2 md:col-span-6">
            <Input type="date" name="from" defaultValue={from} aria-label="From date" className="w-auto" />
            <Input type="date" name="to" defaultValue={to} aria-label="To date" className="w-auto" />
            <Button type="submit" size="sm">
              Apply filters
            </Button>
            {hasFilters ? (
              <Button asChild type="button" size="sm" variant="ghost">
                <a href="/admin/applications">Clear</a>
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Showing <span className="font-semibold tabular-nums text-navy">{rows.length}</span>
          {rows.length >= 75 ? " (capped at 75)" : ""} result{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      {rows.length === 0 ? (
        <AdminEmptyState
          title="No applications match"
          description={
            hasFilters
              ? "Try clearing filters or broadening the date range."
              : "Submitted applications will appear here for review."
          }
          actionHref={hasFilters ? "/admin/applications" : undefined}
          actionLabel={hasFilters ? "Clear filters" : undefined}
          icon={<ClipboardList className="size-5" />}
          className="mt-4"
        />
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {showPaymentStatus ? <th className="px-4 py-3 font-medium">Payment</th> : null}
                <th className="px-4 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <AdminApplicationRow
                  key={row.id}
                  href={`/admin/applications/${row.id}`}
                  label={row.referenceNumber ?? "Draft"}
                >
                  <td className="px-4 py-3 font-medium text-navy group-hover:text-gold-deep">
                    {row.referenceNumber ?? "Draft"}
                  </td>
                  <td className="px-4 py-3">{row.profile?.fullName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <p>{row.profile?.email ?? "—"}</p>
                    <p className="text-muted">{row.profile?.phone ?? ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.job.title}
                    <span className="block text-muted">
                      {row.job.city}, {row.job.country}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ApplicationStatusBadge status={row.status} />
                  </td>
                  {showPaymentStatus ? (
                    <td className="px-4 py-3">
                      <ApplicationPaymentBadge
                        summary={summarizeApplicationPayments(row.payments ?? [])}
                        showAmount
                      />
                    </td>
                  ) : null}
                  <td className="px-4 py-3">{formatDisplayDate(row.submittedAt) || "—"}</td>
                </AdminApplicationRow>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
