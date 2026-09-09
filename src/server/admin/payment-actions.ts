"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ghsToPesewas } from "@/lib/money";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { prisma } from "@/server/db";

function slugifyInvoice(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

export async function saveInvoiceAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("payments.write");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "open");
  const status =
    statusRaw === "closed" || statusRaw === "void" || statusRaw === "open" ? statusRaw : "open";
  let invoiceNumber = slugifyInvoice(String(formData.get("invoiceNumber") ?? ""));
  const amountRaw = String(formData.get("amountGhs") ?? "").trim();

  if (!title) return { ok: false as const, error: "Title is required." };
  if (!invoiceNumber) {
    invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;
  }

  let amountPesewas: number | null = null;
  if (amountRaw) {
    const amountGhs = Number(amountRaw);
    if (!Number.isFinite(amountGhs) || amountGhs < 1) {
      return { ok: false as const, error: "Enter a fixed amount of at least GHS 1.00, or leave blank." };
    }
    amountPesewas = ghsToPesewas(amountGhs);
    if (amountPesewas < 100) {
      return { ok: false as const, error: "Enter a fixed amount of at least GHS 1.00, or leave blank." };
    }
  }

  try {
    const saved = id
      ? await prisma.invoice.update({
          where: { id },
          data: {
            title,
            description: description || null,
            status,
            invoiceNumber,
            amountPesewas,
          },
        })
      : await prisma.invoice.create({
          data: {
            title,
            description: description || null,
            status,
            invoiceNumber,
            amountPesewas,
          },
        });

    await writeAdminAudit({
      actorId: admin.id,
      action: id ? "invoice.update" : "invoice.create",
      targetType: "Invoice",
      targetId: saved.id,
      metadata: {
        invoiceNumber: saved.invoiceNumber,
        status: saved.status,
        amountPesewas: saved.amountPesewas,
      },
    });
    revalidatePath("/admin/invoices");
    revalidatePath("/admin/payments");
    redirect(`/admin/invoices/${saved.id}`);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return { ok: false as const, error: "Could not save invoice. The number may already be in use." };
    }
    throw error;
  }
}
