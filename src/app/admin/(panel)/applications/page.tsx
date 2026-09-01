import type { Metadata } from "next";
import type { ApplicationStatus, Prisma } from "@prisma/client";
import { AdminApplicationRow } from "@/components/admin/application-table-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
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
  await requireAdmin("applications.read");
  const params = await searchParams;
  const q = one(params.q)?.trim() ?? "";
  const status = one(params.status) ?? "";
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

  const [rows, jobs, countries] = await Promise.all([
    prisma.application.findMany({
      where,
      orderBy: [{ submittedAt: "desc" }, { createdAt: "desc" }],
      take: 75,
      include: { profile: true, job: true },
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

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy">Applications</h1>
      <p className="mt-1 text-sm text-muted">
        Search by reference, name, email, or phone. Drafts are hidden unless you choose All.
      </p>
      <form className="mt-6 grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-6">
        <Input name="q" placeholder="Search" defaultValue={q} className="md:col-span-2" />
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
        <div className="flex gap-2 md:col-span-6">
          <Input type="date" name="from" defaultValue={from} aria-label="From date" />
          <Input type="date" name="to" defaultValue={to} aria-label="To date" />
          <Button type="submit" size="sm">
            Filter
          </Button>
        </div>
      </form>
      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No applications match these filters.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Applicant</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Opportunity</th>
                <th className="px-4 py-3 font-medium">Status</th>
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
                  <td className="px-4 py-3 font-medium text-navy group-hover:text-blue">
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
                  <td className="px-4 py-3 capitalize">{statusLabel(row.status)}</td>
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
