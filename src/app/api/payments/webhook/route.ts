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
    await markPaymentFromPaystack(event.data.reference).catch(() => undefined);
  }

  return NextResponse.json({ ok: true });
}
