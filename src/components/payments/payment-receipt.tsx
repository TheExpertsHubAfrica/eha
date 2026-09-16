import { PrintReceiptButton } from "@/components/payments/print-receipt-button";
import { siteConfig } from "@/lib/site-config";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import type { ReactNode } from "react";

export type PaymentReceiptData = {
  payer: string;
  email: string;
  amount: string;
  linked: string;
  reference: string;
  paidAt: string | null;
  title: string | null;
};

export function stampUtc(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

export function receiptFromPayment(payment: {
  payerName: string;
  email: string;
  amountPesewas: number;
  kind: string;
  applicationRef: string | null;
  invoiceNumber: string | null;
  paystackReference: string;
  paidAt: Date | null;
  jobTitleSnapshot: string | null;
}): PaymentReceiptData {
  return {
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

export function PaymentReceiptCard({
  eyebrow = "Receipt",
  heading,
  message,
  receipt,
  actions,
}: {
  eyebrow?: string;
  heading: string;
  message: string;
  receipt: PaymentReceiptData | null;
  actions?: ReactNode;
}) {
  return (
    <div
      id="payment-receipt"
      className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6 sm:p-8 print:max-w-none print:border-0 print:p-0 print:shadow-none"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-gold-deep uppercase print:text-black">
        {eyebrow}
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

      {actions ? <div className="mt-8 flex flex-wrap gap-3 print:hidden">{actions}</div> : null}
    </div>
  );
}

export { PrintReceiptButton };
