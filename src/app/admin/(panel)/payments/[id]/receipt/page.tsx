import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  PaymentReceiptCard,
  PrintReceiptButton,
  receiptFromPayment,
} from "@/components/payments/payment-receipt";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/server/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const payment = await prisma.payment.findUnique({
    where: { id },
    select: { paystackReference: true, status: true },
  });
  return {
    title: payment ? `Receipt ${payment.paystackReference}` : "Payment receipt",
    robots: { index: false, follow: false },
  };
}

export default async function AdminPaymentReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("payments.read");
  const { id } = await params;
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) notFound();

  const paid = payment.status === "success";
  const receipt = receiptFromPayment(payment);
  const backHref =
    payment.kind === "invoice" && payment.invoiceId
      ? `/admin/invoices/${payment.invoiceId}`
      : payment.kind === "application" && payment.applicationId
        ? `/admin/applications/${payment.applicationId}`
        : "/admin/payments";

  return (
    <div className="space-y-6 print:space-y-0">
      <div className="print:hidden">
        <Link href={backHref} className="text-sm text-blue hover:underline">
          Back
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Payment receipt</h1>
        <p className="mt-1 text-sm text-muted">
          {paid
            ? "Print or save as PDF from your browser print dialog."
            : "This payment is not marked successful, so it is not a paid receipt."}
        </p>
      </div>

      <section className="print:py-0">
        <PaymentReceiptCard
          eyebrow={paid ? "Receipt" : "Payment"}
          heading={paid ? "Payment successful" : "Payment not completed"}
          message={
            paid
              ? "Official TEHA record of this Paystack payment."
              : `Current status: ${payment.status}. Only successful payments can be issued as receipts.`
          }
          receipt={receipt}
          actions={
            <>
              {paid ? <PrintReceiptButton /> : null}
              <Button asChild variant="outline">
                <Link href={backHref}>Back</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/admin/payments">All payments</Link>
              </Button>
            </>
          }
        />
      </section>
    </div>
  );
}
