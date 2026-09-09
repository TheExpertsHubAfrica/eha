import type { Metadata } from "next";
import { PaymentsForm } from "@/components/payments/payments-form";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";
import { paystackConfigured } from "@/server/payments/paystack";

export const metadata: Metadata = {
  title: "Payments",
  description: `Pay ${siteConfig.name} securely with Paystack using your application submission number or invoice number.`,
};

export const dynamic = "force-dynamic";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice?: string }>;
}) {
  const params = await searchParams;
  const initialInvoiceNumber = params.invoice?.trim() ?? "";

  return (
    <SiteShell>
      <PageHero
        eyebrow="Payments"
        title="Pay securely online."
        description="Use your application submission number (for example TEHA-2026-000005) or an open invoice number from our team. You will confirm the details before Paystack opens."
      />
      <section className="container-page py-10 sm:py-14">
        <div className="mx-auto max-w-xl">
          <PaymentsForm
            paystackReady={paystackConfigured()}
            initialInvoiceNumber={initialInvoiceNumber}
          />
          <p className="mt-6 text-sm text-muted">
            After a successful payment, keep your Paystack receipt and TEHA reference for our records.
            Contact us if you need help matching a payment to your application.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
