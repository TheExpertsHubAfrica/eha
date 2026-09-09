"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { CheckboxField } from "@/components/ui/select";
import { formatGhs } from "@/lib/money";

type ApplicationLookup = {
  id: string;
  referenceNumber: string;
  applicantName: string;
  suggestedEmail: string;
  jobTitle: string;
  jobLocation: string;
};

type InvoiceLookup = {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string | null;
  amountPesewas: number | null;
  amountGhs: number | null;
  amountFixed: boolean;
};

type ConfirmState =
  | {
      kind: "application";
      application: ApplicationLookup;
      amountGhs: number;
      email: string;
      payerName: string;
    }
  | {
      kind: "invoice";
      invoice: InvoiceLookup;
      amountGhs: number;
      email: string;
      payerName: string;
    };

export function PaymentsForm({
  paystackReady,
  initialInvoiceNumber = "",
}: {
  paystackReady: boolean;
  initialInvoiceNumber?: string;
}) {
  const prefilledInvoice = initialInvoiceNumber.trim().toUpperCase();
  const [openPayment, setOpenPayment] = useState(Boolean(prefilledInvoice));
  const [applicationRef, setApplicationRef] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(prefilledInvoice);
  const [amount, setAmount] = useState("");
  const [amountFixed, setAmountFixed] = useState(false);
  const [invoiceTitle, setInvoiceTitle] = useState<string>();
  const [email, setEmail] = useState("");
  const [payerName, setPayerName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const amountGhs = useMemo(() => {
    const value = Number(amount);
    return Number.isFinite(value) ? value : NaN;
  }, [amount]);

  useEffect(() => {
    if (!prefilledInvoice) return;
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(
          `/api/payments/lookup/invoice?invoice=${encodeURIComponent(prefilledInvoice)}`,
        );
        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          invoice?: InvoiceLookup;
        };
        if (cancelled) return;
        if (!payload.ok || !payload.invoice) {
          setError(payload.error || "Invoice not found.");
          return;
        }
        setInvoiceNumber(payload.invoice.invoiceNumber);
        setInvoiceTitle(payload.invoice.title);
        setOpenPayment(true);
        if (payload.invoice.amountFixed && payload.invoice.amountGhs != null) {
          setAmount(String(payload.invoice.amountGhs));
          setAmountFixed(true);
        }
      } catch {
        if (!cancelled) setError("Could not load that invoice. Enter the number manually.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [prefilledInvoice]);

  async function applyInvoiceDetails(invoice: InvoiceLookup) {
    setInvoiceNumber(invoice.invoiceNumber);
    setInvoiceTitle(invoice.title);
    if (invoice.amountFixed && invoice.amountGhs != null) {
      setAmount(String(invoice.amountGhs));
      setAmountFixed(true);
    } else {
      setAmountFixed(false);
    }
  }

  async function prepareConfirmation(event: React.FormEvent) {
    event.preventDefault();
    setError(undefined);

    if (!paystackReady) {
      setError("Online payments are not configured yet.");
      return;
    }
    if (!Number.isFinite(amountGhs) || amountGhs < 1) {
      setError("Enter an amount of at least GHS 1.00.");
      return;
    }
    if (!email.trim()) {
      setError("Enter the email for your payment receipt.");
      return;
    }

    setPending(true);
    try {
      if (openPayment) {
        if (!invoiceNumber.trim()) {
          setError("Enter the invoice number from TEHA.");
          return;
        }
        if (!payerName.trim()) {
          setError("Enter your full name.");
          return;
        }
        const response = await fetch(
          `/api/payments/lookup/invoice?invoice=${encodeURIComponent(invoiceNumber.trim())}`,
        );
        const payload = (await response.json()) as {
          ok: boolean;
          error?: string;
          invoice?: InvoiceLookup;
        };
        if (!payload.ok || !payload.invoice) {
          setError(payload.error || "Invoice not found.");
          toast.error(payload.error || "Invoice not found.");
          return;
        }
        await applyInvoiceDetails(payload.invoice);
        const chargeAmount =
          payload.invoice.amountFixed && payload.invoice.amountGhs != null
            ? payload.invoice.amountGhs
            : amountGhs;
        if (payload.invoice.amountFixed && Math.round(amountGhs * 100) !== Math.round(chargeAmount * 100)) {
          setAmount(String(chargeAmount));
          setError(`This invoice requires payment of exactly ${formatGhs(chargeAmount)}.`);
          return;
        }
        setConfirm({
          kind: "invoice",
          invoice: payload.invoice,
          amountGhs: chargeAmount,
          email: email.trim(),
          payerName: payerName.trim(),
        });
        return;
      }

      if (!applicationRef.trim()) {
        setError("Enter your application submission number.");
        return;
      }
      const response = await fetch(
        `/api/payments/lookup/application?ref=${encodeURIComponent(applicationRef.trim())}`,
      );
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        application?: ApplicationLookup;
      };
      if (!payload.ok || !payload.application) {
        setError(payload.error || "Application not found.");
        toast.error(payload.error || "Application not found.");
        return;
      }
      const receiptEmail = email.trim() || payload.application.suggestedEmail;
      if (!receiptEmail) {
        setError("Enter the email for your payment receipt.");
        return;
      }
      if (!email.trim() && payload.application.suggestedEmail) {
        setEmail(payload.application.suggestedEmail);
      }
      setConfirm({
        kind: "application",
        application: payload.application,
        amountGhs,
        email: receiptEmail,
        payerName: payerName.trim() || payload.application.applicantName,
      });
      return;
    } catch {
      setError("Could not verify those details. Please try again.");
      toast.error("Could not verify those details.");
    } finally {
      setPending(false);
    }
  }

  async function proceedToPaystack() {
    if (!confirm) return;
    setPending(true);
    setError(undefined);
    try {
      const body =
        confirm.kind === "application"
          ? {
              kind: "application" as const,
              applicationRef: confirm.application.referenceNumber,
              amountGhs: confirm.amountGhs,
              email: confirm.email,
              payerName: confirm.payerName,
            }
          : {
              kind: "invoice" as const,
              invoiceNumber: confirm.invoice.invoiceNumber,
              amountGhs: confirm.amountGhs,
              email: confirm.email,
              payerName: confirm.payerName,
            };

      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        error?: string;
        authorizationUrl?: string;
      };
      if (!payload.ok || !payload.authorizationUrl) {
        setError(payload.error || "Could not start payment.");
        toast.error(payload.error || "Could not start payment.");
        return;
      }
      window.location.href = payload.authorizationUrl;
    } catch {
      setError("Could not start payment. Please try again.");
      toast.error("Could not start payment.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <form onSubmit={prepareConfirmation} className="space-y-5 rounded-lg border border-border bg-white p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-semibold text-navy">Make a payment</h2>
          <p className="mt-1 text-sm text-muted">
            Pay with card or mobile money via Paystack. Amounts are in Ghana cedis (GHS).
          </p>
          {invoiceTitle && openPayment ? (
            <p className="mt-2 text-sm text-navy">
              Invoice: <span className="font-medium">{invoiceTitle}</span>
            </p>
          ) : null}
        </div>

        {!paystackReady ? (
          <p className="rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
            Online payments are not configured on this environment yet.
          </p>
        ) : null}

        <CheckboxField
          id="openPayment"
          name="openPayment"
          label="Open payment (I have an invoice number instead of an application submission number)"
          checked={openPayment}
          onCheckedChange={(checked) => {
            setOpenPayment(checked);
            setConfirm(null);
            setError(undefined);
            if (!checked) {
              setAmountFixed(false);
              setInvoiceTitle(undefined);
            }
          }}
        />

        {openPayment ? (
          <>
            <div>
              <Label htmlFor="invoiceNumber" required>
                Invoice number
              </Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(event) => {
                  setInvoiceNumber(event.target.value.toUpperCase());
                  setAmountFixed(false);
                  setInvoiceTitle(undefined);
                }}
                placeholder="INV-2026-0001"
                autoComplete="off"
              />
              <FieldHint>Use the invoice number issued by TEHA.</FieldHint>
            </div>
            <div>
              <Label htmlFor="payerName" required>
                Your full name
              </Label>
              <Input
                id="payerName"
                value={payerName}
                onChange={(event) => setPayerName(event.target.value)}
                autoComplete="name"
              />
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="applicationRef" required>
              Application submission number
            </Label>
            <Input
              id="applicationRef"
              value={applicationRef}
              onChange={(event) => setApplicationRef(event.target.value.toUpperCase())}
              placeholder="TEHA-2026-000005"
              autoComplete="off"
            />
            <FieldHint>Example: TEHA-2026-000005 from your confirmation email or success page.</FieldHint>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <Label htmlFor="amount" required>
              Amount (GHS)
            </Label>
            <Input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              readOnly={amountFixed}
              className={amountFixed ? "bg-surface" : undefined}
            />
            {amountFixed ? (
              <FieldHint>This invoice has a fixed amount set by TEHA.</FieldHint>
            ) : null}
          </div>
          <div>
            <Label htmlFor="email" required>
              Email for receipt
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <FieldHint>Confirm the email Paystack should send the receipt to.</FieldHint>
          </div>
        </div>

        {!openPayment ? (
          <div>
            <Label htmlFor="payerNameOptional">Name on payment (optional)</Label>
            <Input
              id="payerNameOptional"
              value={payerName}
              onChange={(event) => setPayerName(event.target.value)}
              autoComplete="name"
              placeholder="Defaults to the applicant name on the submission"
            />
          </div>
        ) : null}

        {error ? <FieldError>{error}</FieldError> : null}

        <Button type="submit" size="lg" disabled={pending || !paystackReady}>
          {pending ? "Checking…" : "Review payment"}
        </Button>
      </form>

      {confirm ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-confirm-title"
        >
          <div className="w-full max-w-md rounded-lg border border-border bg-white p-6 shadow-xl">
            <h3 id="payment-confirm-title" className="text-lg font-semibold text-navy">
              Confirm payment
            </h3>
            <p className="mt-1 text-sm text-muted">
              Check these details before you continue to Paystack.
            </p>
            <dl className="mt-5 space-y-3 text-sm">
              {confirm.kind === "application" ? (
                <>
                  <div>
                    <dt className="text-muted">Applicant</dt>
                    <dd className="font-medium text-navy">{confirm.application.applicantName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Submission number</dt>
                    <dd className="font-mono text-navy">{confirm.application.referenceNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Applied job</dt>
                    <dd className="text-navy">
                      {confirm.application.jobTitle}
                      <span className="block text-muted">{confirm.application.jobLocation}</span>
                    </dd>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <dt className="text-muted">Payer</dt>
                    <dd className="font-medium text-navy">{confirm.payerName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Invoice</dt>
                    <dd className="font-mono text-navy">{confirm.invoice.invoiceNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Description</dt>
                    <dd className="text-navy">
                      {confirm.invoice.title}
                      {confirm.invoice.description ? (
                        <span className="mt-1 block text-muted">{confirm.invoice.description}</span>
                      ) : null}
                    </dd>
                  </div>
                </>
              )}
              <div>
                <dt className="text-muted">Email</dt>
                <dd className="text-navy">{confirm.email}</dd>
              </div>
              <div>
                <dt className="text-muted">Amount</dt>
                <dd className="text-xl font-semibold text-navy">{formatGhs(confirm.amountGhs)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" onClick={() => void proceedToPaystack()} disabled={pending}>
                {pending ? "Opening Paystack…" : "Proceed to Paystack"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setConfirm(null)}
              >
                Edit details
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
