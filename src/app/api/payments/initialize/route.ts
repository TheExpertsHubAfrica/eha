import { NextResponse } from "next/server";
import { z } from "zod";
import { parseApplicationReference } from "@/lib/apply/reference";
import { formatGhs, pesewasToGhs } from "@/lib/money";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/server/db";
import {
  buildPaystackReference,
  ghsToPesewas,
  initializePaystackTransaction,
  paystackConfigured,
} from "@/server/payments/paystack";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("application"),
    applicationRef: z.string().trim().min(5),
    amountGhs: z.number().positive().max(1_000_000),
    email: z.string().trim().email(),
    payerName: z.string().trim().min(2).max(120).optional(),
  }),
  z.object({
    kind: z.literal("invoice"),
    invoiceNumber: z.string().trim().min(3),
    amountGhs: z.number().positive().max(1_000_000),
    email: z.string().trim().email(),
    payerName: z.string().trim().min(2).max(120),
  }),
]);

export async function POST(request: Request) {
  if (!paystackConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Online payments are not configured yet. Please try again later." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Check the payment details and try again." }, { status: 400 });
  }

  const amountPesewas = ghsToPesewas(parsed.data.amountGhs);
  if (amountPesewas < 100) {
    return NextResponse.json(
      { ok: false, error: "Enter an amount of at least GHS 1.00." },
      { status: 400 },
    );
  }

  const origin = new URL(request.url).origin;
  const callbackUrl = `${origin}/payments/callback`;

  try {
    if (parsed.data.kind === "application") {
      const ref = parsed.data.applicationRef.trim().toUpperCase();
      if (!parseApplicationReference(ref)) {
        return NextResponse.json({ ok: false, error: "Invalid submission number." }, { status: 400 });
      }
      const application = await prisma.application.findUnique({
        where: { referenceNumber: ref },
        include: {
          profile: { select: { fullName: true } },
          job: { select: { title: true, city: true, country: true } },
        },
      });
      if (!application || application.status === "draft" || !application.submittedAt) {
        return NextResponse.json(
          { ok: false, error: "No submitted application was found for that number." },
          { status: 404 },
        );
      }

      const payerName =
        parsed.data.payerName?.trim() ||
        application.profile?.fullName ||
        "Applicant";
      const paystackReference = buildPaystackReference("APP");
      const payment = await prisma.payment.create({
        data: {
          kind: "application",
          amountPesewas,
          email: parsed.data.email.toLowerCase(),
          payerName,
          applicationId: application.id,
          applicationRef: ref,
          jobTitleSnapshot: `${application.job.title} · ${application.job.city}`,
          paystackReference,
        },
      });

      const init = await initializePaystackTransaction({
        email: payment.email,
        amountPesewas,
        reference: paystackReference,
        callbackUrl,
        metadata: {
          paymentId: payment.id,
          kind: "application",
          applicationRef: ref,
        },
      });

      await prisma.payment.update({
        where: { id: payment.id },
        data: { paystackAccessCode: init.access_code },
      });

      return NextResponse.json({
        ok: true,
        authorizationUrl: init.authorization_url,
        reference: init.reference,
      });
    }

    const invoiceNumber = parsed.data.invoiceNumber.trim().toUpperCase();
    const invoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
    if (!invoice || invoice.status !== "open") {
      return NextResponse.json(
        { ok: false, error: "No open invoice was found for that number." },
        { status: 404 },
      );
    }

    const chargePesewas =
      invoice.amountPesewas != null ? invoice.amountPesewas : amountPesewas;
    if (invoice.amountPesewas != null && amountPesewas !== invoice.amountPesewas) {
      return NextResponse.json(
        {
          ok: false,
          error: `This invoice requires payment of exactly ${formatGhs(pesewasToGhs(invoice.amountPesewas))}.`,
        },
        { status: 400 },
      );
    }
    if (chargePesewas < 100) {
      return NextResponse.json(
        { ok: false, error: "Enter an amount of at least GHS 1.00." },
        { status: 400 },
      );
    }

    const paystackReference = buildPaystackReference("INV");
    const payment = await prisma.payment.create({
      data: {
        kind: "invoice",
        amountPesewas: chargePesewas,
        email: parsed.data.email.toLowerCase(),
        payerName: parsed.data.payerName.trim(),
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        jobTitleSnapshot: invoice.title,
        paystackReference,
      },
    });

    const init = await initializePaystackTransaction({
      email: payment.email,
      amountPesewas: chargePesewas,
      reference: paystackReference,
      callbackUrl,
      metadata: {
        paymentId: payment.id,
        kind: "invoice",
        invoiceNumber,
        site: siteConfig.shortName,
      },
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: { paystackAccessCode: init.access_code },
    });

    return NextResponse.json({
      ok: true,
      authorizationUrl: init.authorization_url,
      reference: init.reference,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start payment.";
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
