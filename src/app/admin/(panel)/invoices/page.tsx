import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminEmptyState } from "@/components/admin/empty-state";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/server/db";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Invoices",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminInvoicesPage() {
  await requireAdmin("payments.write");
  const rows = await prisma.invoice.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { payments: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        eyebrow="Finance"
        title="Invoices"
        description="Create open invoices that payers can settle on the public Payments page."
        actions={
          <Button asChild size="sm">
            <Link href="/admin/invoices/new">New invoice</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <AdminEmptyState
          className="mt-6"
          title="No invoices yet"
          description="Create an invoice number for open payments that are not tied to an application submission."
          actionHref="/admin/invoices/new"
          actionLabel="Create invoice"
          icon={<FileText className="size-5" />}
        />
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Payments</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-gold-soft/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/invoices/${row.id}`}
                      className="font-mono font-medium text-navy hover:underline"
                    >
                      {row.invoiceNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{row.title}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {row.amountPesewas != null
                      ? formatGhs(pesewasToGhs(row.amountPesewas))
                      : "Open"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={row.status === "open" ? "success" : "muted"} className="capitalize">
                      {row.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{row._count.payments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
