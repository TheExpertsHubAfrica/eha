import type { Metadata } from "next";
import Link from "next/link";
import { AdminInvoiceForm } from "@/components/admin/invoice-form";
import { AdminPageHeader } from "@/components/admin/page-header";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "New invoice",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewInvoicePage() {
  await requireAdmin("payments.write");
  return (
    <div>
      <Link href="/admin/invoices" className="text-sm text-blue hover:underline">
        Back to invoices
      </Link>
      <AdminPageHeader
        className="mt-2 border-0 pb-4"
        title="New invoice"
        description="Only invoices marked open can be paid on the public Payments page."
      />
      <div className="rounded-lg border border-border bg-white p-5">
        <AdminInvoiceForm />
      </div>
    </div>
  );
}
