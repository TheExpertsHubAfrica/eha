import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { TravelCard } from "@/components/home/featured-travel";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getPublishedTravel } from "@/lib/catalog";
import { siteImages } from "@/lib/site-images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Travel Packages",
  description: `Browse travel packages with ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default async function TravelPage() {
  const packages = await getPublishedTravel();

  return (
    <SiteShell>
      <PageHero
        eyebrow="Travel"
        title="Browse our available tour packages below"
        image={siteImages.travel.hero}
        imageAlt="International travel packages and curated holiday destinations"
      />
      <section className="container-wide py-12 sm:py-16">
        {packages.length === 0 ? (
          <EmptyState
            title="No travel packages"
            description="Packages will appear here when they are published. Contact us if you need a custom itinerary."
            actionHref="/contact"
            actionLabel="Contact us"
            image={siteImages.travel.empty}
            imageAlt="No travel packages published yet"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => (
              <TravelCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
