import type { Metadata } from "next";
import Link from "next/link";
import type { PaymentStatus, Prisma } from "@prisma/client";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/select";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { formatDisplayDate } from "@/lib/utils";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/server/db";
import { Wallet } from "lucide-react";

export const metadata: Metadata = {
  title: "Payments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function one(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

const paymentTone: Record<string, "success" | "gold" | "danger" | "muted"> = {
  success: "success",
  pending: "gold",
  failed: "danger",
  abandoned: "muted",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin("payments.read");
  const params = await searchParams;
  const q = one(params.q)?.trim() ?? "";
  const status = one(params.status) ?? "";
  const kind = one(params.kind) ?? "";

  const where: Prisma.PaymentWhereInput = {};
  if (status) where.status = status as PaymentStatus;
  if (kind === "application" || kind === "invoice") where.kind = kind;
  if (q) {
    where.OR = [
      { applicationRef: { contains: q, mode: "insensitive" } },
      { invoiceNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { payerName: { contains: q, mode: "insensitive" } },
      { paystackReference: { contains: q, mode: "insensitive" } },
    ];
  }

  const rows = await prisma.payment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      application: { select: { id: true } },
      invoice: { select: { id: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Finance"
        title="Payments"
        description="Paystack charges linked to application submission numbers or open invoices."
        actions={
          <Button asChild size="sm" variant="outline">
            <Link href="/admin/invoices">Manage invoices</Link>
          </Button>
        }
      />

      <form className="mt-6 grid gap-3 rounded-lg border border-border bg-white p-4 md:grid-cols-4">
        <Input name="q" placeholder="Search reference, invoice, email…" defaultValue={q} className="md:col-span-2" />
        <NativeSelect name="status" defaultValue={status}>
          <option value="">All statuses</option>
          <option value="success">success</option>
          <option value="pending">pending</option>
          <option value="failed">failed</option>
          <option value="abandoned">abandoned</option>
        </NativeSelect>
        <div className="flex gap-2">
          <NativeSelect name="kind" defaultValue={kind} className="flex-1">
            <option value="">All kinds</option>
            <option value="application">application</option>
            <option value="invoice">invoice</option>
          </NativeSelect>
          <Button type="submit" size="sm">
            Filter
          </Button>
        </div>
      </form>

      {rows.length === 0 ? (
        <AdminEmptyState
          className="mt-6"
          title="No payments found"
          description="Successful and attempted Paystack payments will appear here."
          icon={<Wallet className="size-5" />}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Payer</th>
                <th className="px-4 py-3 font-medium">Linked to</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-gold-soft/20">
                  <td className="px-4 py-3 whitespace-nowrap">{formatDisplayDate(row.paidAt ?? row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy">{row.payerName}</p>
                    <p className="text-muted">{row.email}</p>
                    <p className="font-mono text-xs text-muted">{row.paystackReference}</p>
                  </td>
                  <td className="px-4 py-3">
                    {row.kind === "application" ? (
                      <>
                        <Badge tone="outline">Application</Badge>
                        <p className="mt-1 font-mono text-navy">{row.applicationRef}</p>
                        <p className="text-muted">{row.jobTitleSnapshot}</p>
                        {row.applicationId ? (
                          <Link
                            href={`/admin/applications/${row.applicationId}`}
                            className="text-xs text-gold-deep hover:underline"
                          >
                            Open application
                          </Link>
                        ) : null}
                      </>
                    ) : (
                      <>
                        <Badge tone="outline">Invoice</Badge>
                        <p className="mt-1 font-mono text-navy">{row.invoiceNumber}</p>
                        <p className="text-muted">{row.jobTitleSnapshot}</p>
                        {row.invoiceId ? (
                          <Link
                            href={`/admin/invoices/${row.invoiceId}`}
                            className="text-xs text-gold-deep hover:underline"
                          >
                            Open invoice
                          </Link>
                        ) : null}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold tabular-nums text-navy">
                    {formatGhs(pesewasToGhs(row.amountPesewas))}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={paymentTone[row.status] ?? "muted"} className="capitalize">
                      {row.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
