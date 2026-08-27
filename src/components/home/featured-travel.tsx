import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/page-hero";
import { DestinationPanel } from "@/components/travel/destination-panel";
import { getFeaturedTravel, travelPath } from "@/lib/catalog";
import type { TravelPackage } from "@/lib/catalog/types";

export function TravelCard({ item }: { item: TravelPackage }) {
  return (
    <article className="flex h-full flex-col overflow-hidden border border-border bg-white transition-colors hover:border-gold/40">
      <DestinationPanel accent={item.accent} label={item.country} />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium tracking-wide text-gold-deep uppercase">
          {item.duration}
        </p>
        <h3 className="mt-1 text-lg font-semibold text-navy">
          {item.destination}
        </h3>
        <p className="text-sm text-fg-soft">{item.name}</p>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
          {item.summary}
        </p>
        <Button asChild variant="outline" size="sm" className="mt-5 w-full">
          <Link href={travelPath(item)}>View package</Link>
        </Button>
      </div>
    </article>
  );
}

export async function FeaturedTravel() {
  const packages = await getFeaturedTravel();

  return (
    <section className="bg-surface">
      <div className="container-wide py-14 sm:py-16">
        <SectionHeading
          eyebrow="Travel"
          title="Featured packages"
          description="A short selection of destinations. Full itineraries sit on each package page."
          action={
            <Button asChild variant="ghost">
              <Link href="/travel">View all travel packages</Link>
            </Button>
          }
        />
        {packages.length === 0 ? (
          <EmptyState
            title="No published packages"
            description="Travel packages will appear here when they are published."
            actionHref="/contact"
            actionLabel="Contact us"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((item) => (
              <TravelCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
