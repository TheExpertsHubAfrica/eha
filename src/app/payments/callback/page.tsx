import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import {
  PaymentReceiptCard,
  PrintReceiptButton,
  receiptFromPayment,
  stampUtc,
} from "@/components/payments/payment-receipt";
import { Button } from "@/components/ui/button";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { markPaymentFromPaystack } from "@/server/payments/service";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Payment result",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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
  let receipt = null as ReturnType<typeof receiptFromPayment> | null;

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
      receipt = receiptFromPayment(payment);
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
        paidAt: payment.paidAt ? stampUtc(payment.paidAt) : null,
        title: payment.jobTitleSnapshot,
      };
    }
  }

  return (
    <SiteShell>
      <section className="container-page py-14 sm:py-20 print:py-6">
        <PaymentReceiptCard
          eyebrow={ok ? "Receipt" : "Payments"}
          heading={heading}
          message={message}
          receipt={receipt}
          actions={
            <>
              {ok ? <PrintReceiptButton /> : null}
              <Button asChild>
                <Link href="/payments">Make another payment</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Contact us</Link>
              </Button>
            </>
          }
        />
      </section>
    </SiteShell>
  );
}
