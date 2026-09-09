import { PaymentStatus } from "@prisma/client";
import { prisma } from "@/server/db";
import { verifyPaystackTransaction } from "@/server/payments/paystack";

export async function markPaymentFromPaystack(reference: string) {
  const existing = await prisma.payment.findUnique({ where: { paystackReference: reference } });
  if (!existing) {
    return { ok: false as const, error: "Payment not found." };
  }
  if (existing.status === PaymentStatus.success) {
    return { ok: true as const, payment: existing, alreadyComplete: true };
  }

  const verified = await verifyPaystackTransaction(reference);
  if (verified.status !== "success") {
    const updated = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: PaymentStatus.failed,
        paystackStatus: verified.status,
      },
    });
    return { ok: false as const, error: `Payment ${verified.status}.`, payment: updated };
  }

  if (verified.amount !== existing.amountPesewas || verified.currency !== existing.currency) {
    const updated = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        status: PaymentStatus.failed,
        paystackStatus: "amount_mismatch",
      },
    });
    return { ok: false as const, error: "Payment amount did not match.", payment: updated };
  }

  const updated = await prisma.payment.update({
    where: { id: existing.id },
    data: {
      status: PaymentStatus.success,
      paystackStatus: verified.status,
      paidAt: verified.paid_at ? new Date(verified.paid_at) : new Date(),
    },
  });

  return { ok: true as const, payment: updated, alreadyComplete: false };
}
