import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyPaymentLink } from "@/components/admin/copy-payment-link";
import { AdminInvoiceForm } from "@/components/admin/invoice-form";
import { Badge } from "@/components/ui/badge";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate } from "@/lib/utils";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.invoice.findUnique({ where: { id }, select: { invoiceNumber: true } });
  return { title: row?.invoiceNumber ?? "Invoice", robots: { index: false, follow: false } };
}

export default async function AdminEditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("payments.write");
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!invoice) notFound();

  const paymentLink = `${siteConfig.url.replace(/\/$/, "")}/payments?invoice=${encodeURIComponent(invoice.invoiceNumber)}`;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/invoices" className="text-sm text-blue hover:underline">
          Back to invoices
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold text-navy">{invoice.invoiceNumber}</h1>
          <Badge tone={invoice.status === "open" ? "success" : "muted"} className="capitalize">
            {invoice.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted">
          {invoice.amountPesewas != null
            ? `Fixed amount ${formatGhs(pesewasToGhs(invoice.amountPesewas))}.`
            : "Open amount — payer chooses how much to pay."}{" "}
          Share the payment link below so clients do not need to type the invoice number.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Direct payment link</h2>
        <p className="mt-1 text-sm text-muted">
          Copy and send this link to the client. It opens Payments with this invoice selected.
        </p>
        <div className="mt-3">
          <CopyPaymentLink url={paymentLink} />
        </div>
      </section>

      <div className="rounded-lg border border-border bg-white p-5">
        <AdminInvoiceForm
          invoice={{
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            title: invoice.title,
            description: invoice.description ?? "",
            status: invoice.status,
            amountPesewas: invoice.amountPesewas,
          }}
        />
      </div>
      <section className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Recent payments</h2>
        {invoice.payments.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No payments against this invoice yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {invoice.payments.map((payment) => (
              <li key={payment.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium text-navy">{payment.payerName}</p>
                  <p className="text-muted">
                    {payment.email} · {formatDisplayDate(payment.createdAt)} · {payment.status}
                  </p>
                </div>
                <p className="tabular-nums font-semibold text-navy">
                  {formatGhs(pesewasToGhs(payment.amountPesewas))}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
