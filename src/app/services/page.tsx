import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Services",
  description: `Job placement support, study-abroad assistance, travel packages, and visa guidance from ${siteConfig.name}.`,
};

const services = [
  {
    id: "work",
    title: "Job opportunities",
    text: "Published overseas roles with location, salary, benefits, and requirements. Applications are multi-step and opportunity-specific.",
    href: "/work-abroad",
    cta: "Explore jobs",
  },
  {
    id: "study",
    title: "Study abroad assistance",
    text: "Help with destination choice, admission paperwork, and visa-oriented document guidance for selected study pathways.",
    href: "/study-abroad",
    cta: "Explore study destinations",
  },
  {
    id: "travel",
    title: "Travel services",
    text: "Holiday and city packages with duration, inclusions, and destination pages. Enquiries go through contact or WhatsApp when configured.",
    href: "/travel",
    cta: "Explore packages",
  },
  {
    id: "visa",
    title: "Visa assistance",
    text: "Guidance on documents and process steps connected to a specific offer or study destination. We do not sell guaranteed outcomes.",
    href: "/contact?intent=visa",
    cta: "Ask about visa support",
  },
];

export default function ServicesPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="Services"
        title="Support across work, study, travel, and visas."
        description="Each service has its own pages and a staged application or enquiry — not a single form trying to do everything."
      />
      <section className="container-page grid gap-5 py-12 sm:py-16">
        {services.map((item) => (
          <article
            key={item.id}
            id={item.id}
            className="scroll-mt-24 rounded-lg border border-border bg-white p-6 sm:p-8"
          >
            <h2 className="text-xl font-semibold text-navy">{item.title}</h2>
            <p className="mt-2 max-w-2xl text-muted">{item.text}</p>
            <Button asChild variant="ghost" className="mt-4 px-0">
              <Link href={item.href}>{item.cta}</Link>
            </Button>
          </article>
        ))}
      </section>
    </SiteShell>
  );
}
