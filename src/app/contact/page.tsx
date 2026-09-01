import type { Metadata } from "next";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact/contact-form";
import { SiteShell } from "@/components/layout/site-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { ContentImage } from "@/components/ui/content-image";
import { PageHero } from "@/components/ui/page-hero";
import { siteImages } from "@/lib/site-images";
import { siteConfig, whatsappHref } from "@/lib/site-config";
import { getResolvedSite } from "@/server/settings";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${siteConfig.name} about work, travel, or study opportunities.`,
};

export default async function ContactPage() {
  const site = await getResolvedSite();
  const whatsapp = whatsappHref(undefined, site);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Contact"
        title="Talk to the team."
        description="Use the form for a written enquiry, or the published phone, email, and WhatsApp channels when they are configured."
        image={siteImages.contact.hero}
        imageAlt="TEHA advisor helping an applicant — friendly support for your enquiry"
      />
      <section className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_0.85fr] lg:py-16">
        <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-navy">Send a message</h2>
          <p className="mt-2 text-sm text-muted">
            Do not attach passports or identity documents here. Document upload
            happens only after you start an application for a specific
            opportunity.
          </p>
          <div className="mt-6">
            <Suspense fallback={<Skeleton className="h-96 w-full" />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
        <aside className="space-y-6">
          <ContentImage
            src={siteImages.contact.aside}
            alt="The Experts Hub Africa team collaborating — here to guide your journey"
            aspect="video"
          />
          <div className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-navy">Details</h2>
            <dl className="mt-4 space-y-4 text-sm">
              {site.phone ? (
                <div>
                  <dt className="text-muted">Phone</dt>
                  <dd className="mt-1">
                    <a href={`tel:${site.phone.replace(/\s/g, "")}`}>
                      {site.phone}
                    </a>
                  </dd>
                </div>
              ) : null}
              {site.email ? (
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="mt-1">
                    <a href={`mailto:${site.email}`}>{site.email}</a>
                  </dd>
                </div>
              ) : null}
              {site.address ? (
                <div>
                  <dt className="text-muted">Location</dt>
                  <dd className="mt-1">{site.address}</dd>
                </div>
              ) : null}
              {site.hours ? (
                <div>
                  <dt className="text-muted">Hours</dt>
                  <dd className="mt-1">{site.hours}</dd>
                </div>
              ) : null}
              {!site.phone &&
              !site.email &&
              !site.address ? (
                <p className="text-muted">
                  Contact channels will appear here once they are configured in
                  site settings.
                </p>
              ) : null}
            </dl>
            {whatsapp ? (
              <a
                href={whatsapp}
                className="mt-6 inline-flex text-sm font-medium text-blue"
                rel="noopener noreferrer"
                target="_blank"
              >
                Chat with {site.name} on WhatsApp
              </a>
            ) : null}
          </div>
        </aside>
      </section>
    </SiteShell>
  );
}
