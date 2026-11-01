import { PaymentStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/server/db";
import { verifyPaystackTransaction } from "@/server/payments/paystack";
import { paymentStatusFromPaystack } from "@/server/payments/status";

/**
 * The webhook and the callback page can run at once, and either may hold an older answer from
 * Paystack, so the update is conditional: nothing can overwrite a payment already recorded as paid.
 */
async function savePaymentUnlessPaid(id: string, data: Prisma.PaymentUpdateManyMutationInput) {
  await prisma.payment.updateMany({
    where: { id, status: { not: PaymentStatus.success } },
    data,
  });
  return prisma.payment.findUniqueOrThrow({ where: { id } });
}

/** `final: false` means the answer could still change, so the webhook should be retried. */
export async function markPaymentFromPaystack(reference: string) {
  const existing = await prisma.payment.findUnique({ where: { paystackReference: reference } });
  if (!existing) {
    return { ok: false as const, final: true, error: "Payment not found." };
  }
  if (existing.status === PaymentStatus.success) {
    return { ok: true as const, payment: existing, alreadyComplete: true };
  }

  const verified = await verifyPaystackTransaction(reference);
  const mapped = paymentStatusFromPaystack(verified.status);

  if (
    mapped.status === "success" &&
    (verified.amount !== existing.amountPesewas || verified.currency !== existing.currency)
  ) {
    console.error("payment amount mismatch", {
      reference,
      expected: existing.amountPesewas,
      received: verified.amount,
      currency: verified.currency,
    });
    const payment = await savePaymentUnlessPaid(existing.id, {
      status: PaymentStatus.failed,
      paystackStatus: "amount_mismatch",
    });
    return { ok: false as const, final: true, error: "Payment amount did not match.", payment };
  }

  const payment = await savePaymentUnlessPaid(existing.id, {
    status: mapped.status,
    paystackStatus: verified.status,
    ...(mapped.status === "success"
      ? { paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date() }
      : {}),
  });

  if (payment.status === PaymentStatus.success) {
    return { ok: true as const, payment, alreadyComplete: mapped.status !== "success" };
  }
  return {
    ok: false as const,
    final: mapped.final,
    error: `Payment ${verified.status}.`,
    payment,
  };
}
