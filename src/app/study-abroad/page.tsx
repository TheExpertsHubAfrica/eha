import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedStudy } from "@/lib/catalog";
import { siteImages } from "@/lib/site-images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Study Abroad",
  description: `Study destinations and application guidance with ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default async function StudyAbroadPage() {
  const destinations = await getPublishedStudy();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Study abroad"
        title="Destination guidance first. Programme catalogues can grow later."
        description="We currently publish destination-level support: admission assistance, application guidance, visa orientation, and document checklists. Individual universities and intakes will be added through the admin CMS."
        image={siteImages.study.hero}
        imageAlt="Study abroad programs and international education pathways"
      />
      <section className="container-page py-12 sm:py-16">
        {destinations.length === 0 ? (
          <EmptyState
            title="No study destinations yet"
            description="Published study pathways will appear here. Contact us if you want to start a conversation now."
            actionHref="/contact"
            actionLabel="Contact us"
            image={siteImages.study.empty}
            imageAlt="Study abroad destinations coming soon"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {destinations.map((item) => (
              <Link
                key={item.id}
                href={`/study-abroad/${item.slug}`}
                className="rounded-lg border border-border bg-white p-6 hover:border-blue/30"
              >
                <p className="text-xs font-medium tracking-wide text-muted uppercase">
                  {item.region}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-navy">{item.name}</h2>
                <p className="mt-2 text-sm text-muted">{item.summary}</p>
                <ul className="mt-4 space-y-1 text-sm text-fg-soft">
                  {item.support.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
