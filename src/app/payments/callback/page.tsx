import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { PrintReceiptButton } from "@/components/payments/print-receipt-button";
import { Button } from "@/components/ui/button";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { siteConfig } from "@/lib/site-config";
import { markPaymentFromPaystack } from "@/server/payments/service";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Payment result",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function stamp(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

export default async function PaymentsCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string }>;
}) {
  const params = await searchParams;
  const reference = (params.reference || params.trxref || "").trim();

  let heading = "Payment incomplete";
  let message =
    "We could not confirm a payment reference. If you were charged, contact us with your receipt.";
  let ok = false;
  let receipt: {
    payer: string;
    email: string;
    amount: string;
    linked: string;
    reference: string;
    paidAt: string | null;
    title: string | null;
  } | null = null;

  if (reference) {
    const result = await markPaymentFromPaystack(reference).catch(() => null);
    const payment =
      result && "payment" in result && result.payment
        ? result.payment
        : await prisma.payment.findUnique({ where: { paystackReference: reference } });

    if (result?.ok && payment) {
      ok = true;
      heading = result.alreadyComplete ? "Payment already recorded" : "Payment successful";
      message = "Thank you. Your payment has been recorded against the details below.";
      receipt = {
        payer: payment.payerName,
        email: payment.email,
        amount: formatGhs(pesewasToGhs(payment.amountPesewas)),
        linked:
          payment.kind === "application"
            ? `Application ${payment.applicationRef}`
            : `Invoice ${payment.invoiceNumber}`,
        reference: payment.paystackReference,
        paidAt: payment.paidAt ? stamp(payment.paidAt) : null,
        title: payment.jobTitleSnapshot,
      };
    } else if (payment) {
      heading = "Payment not completed";
      message =
        result && "error" in result && result.error
          ? result.error
          : "Paystack did not confirm a successful charge for this reference.";
      receipt = {
        payer: payment.payerName,
        email: payment.email,
        amount: formatGhs(pesewasToGhs(payment.amountPesewas)),
        linked:
          payment.kind === "application"
            ? `Application ${payment.applicationRef}`
            : `Invoice ${payment.invoiceNumber}`,
        reference: payment.paystackReference,
        paidAt: null,
        title: payment.jobTitleSnapshot,
      };
    }
  }

  return (
    <SiteShell>
      <section className="container-page py-14 sm:py-20 print:py-6">
        <div
          id="payment-receipt"
          className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6 sm:p-8 print:max-w-none print:border-0 print:p-0 print:shadow-none"
        >
          <p className="text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase print:text-black">
            {ok ? "Receipt" : "Payments"}
          </p>
          <p className="mt-2 text-sm font-semibold text-navy print:text-base">{siteConfig.name}</p>
          <h1 className="mt-2 text-2xl font-semibold text-navy print:text-xl">{heading}</h1>
          <p className="mt-3 text-muted print:text-black">{message}</p>

          {receipt ? (
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="text-muted print:text-black/70">Payer</dt>
                <dd className="text-navy">{receipt.payer}</dd>
              </div>
              <div>
                <dt className="text-muted print:text-black/70">Email</dt>
                <dd className="text-navy">{receipt.email}</dd>
              </div>
              <div>
                <dt className="text-muted print:text-black/70">Linked to</dt>
                <dd className="text-navy">{receipt.linked}</dd>
              </div>
              {receipt.title ? (
                <div>
                  <dt className="text-muted print:text-black/70">Description</dt>
                  <dd className="text-navy">{receipt.title}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted print:text-black/70">Amount</dt>
                <dd className="text-xl font-semibold text-navy">{receipt.amount}</dd>
              </div>
              {receipt.paidAt ? (
                <div>
                  <dt className="text-muted print:text-black/70">Paid at (UTC)</dt>
                  <dd className="text-navy">{receipt.paidAt}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-muted print:text-black/70">Paystack reference</dt>
                <dd className="font-mono text-xs text-navy">{receipt.reference}</dd>
              </div>
            </dl>
          ) : null}

          <p className="mt-6 hidden text-xs text-black/60 print:block">
            Keep this receipt for your records. Contact {siteConfig.email || siteConfig.name} if you need
            help matching this payment.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 print:hidden">
            {ok ? <PrintReceiptButton /> : null}
            <Button asChild>
              <Link href="/payments">Make another payment</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/contact">Contact us</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
