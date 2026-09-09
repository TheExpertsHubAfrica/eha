import { NextResponse } from "next/server";
import { pesewasToGhs } from "@/lib/money";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const invoiceNumber = new URL(request.url).searchParams.get("invoice")?.trim().toUpperCase() ?? "";
  if (invoiceNumber.length < 3) {
    return NextResponse.json({ ok: false, error: "Enter a valid invoice number." }, { status: 400 });
  }

  const invoice = await prisma.invoice.findUnique({ where: { invoiceNumber } });
  if (!invoice || invoice.status !== "open") {
    return NextResponse.json(
      {
        ok: false,
        error:
          invoice?.status === "closed" || invoice?.status === "void"
            ? "That invoice is no longer open for payment."
            : "No open invoice was found for that number.",
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    invoice: {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      title: invoice.title,
      description: invoice.description,
      amountPesewas: invoice.amountPesewas,
      amountGhs: invoice.amountPesewas != null ? pesewasToGhs(invoice.amountPesewas) : null,
      amountFixed: invoice.amountPesewas != null,
    },
  });
}
