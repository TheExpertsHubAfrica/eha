import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { markPaymentFromPaystack } from "@/server/payments/service";
import { paystackSecretKey } from "@/server/payments/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const raw = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";
  const hash = createHmac("sha512", paystackSecretKey()).update(raw).digest("hex");

  try {
    const a = Buffer.from(hash);
    const b = Buffer.from(signature);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    // Any non-200 makes Paystack retry, so a temporary failure cannot lose a real payment.
    try {
      const result = await markPaymentFromPaystack(event.data.reference);
      if (!result.ok && !result.final) {
        console.warn("payment webhook: not final yet, asking Paystack to retry", event.data.reference);
        return NextResponse.json({ ok: false }, { status: 503 });
      }
    } catch (error) {
      console.error("payment webhook failed", event.data.reference, error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
