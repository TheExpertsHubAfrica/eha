import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { DestinationPanel } from "@/components/travel/destination-panel";
import { Button } from "@/components/ui/button";
import { getTravelBySlug } from "@/lib/catalog";
import { recordEvent } from "@/server/analytics/events";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getTravelBySlug(slug);
  if (!item) return { title: "Package not found" };
  return {
    title: `${item.destination} — ${item.name}`,
    description: item.summary,
  };
}

export default async function TravelDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = await getTravelBySlug(slug);
  if (!item) notFound();
  await recordEvent({ name: "travel_viewed", targetType: "TravelPackage", targetId: item.id });

  return (
    <SiteShell>
      <div className="container-page py-10 sm:py-14">
        <p className="text-sm text-muted">
          <Link href="/travel" className="hover:text-navy">
            Travel packages
          </Link>
          <span aria-hidden="true"> / </span>
          {item.destination}
        </p>
        <div className="mt-6 overflow-hidden rounded-lg border border-border">
          <DestinationPanel
            accent={item.accent}
            label={item.country}
            coverImageUrl={item.coverImageUrl}
          />
        </div>
        <h1 className="mt-8 text-3xl font-semibold text-navy">
          {item.destination}
        </h1>
        <p className="mt-1 text-muted">
          {item.name} · {item.duration}
        </p>
        <p className="mt-6 max-w-2xl text-fg-soft">{item.summary}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-navy">Included</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              {item.includes.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
          <section className="rounded-lg border border-border bg-white p-6">
            <h2 className="text-lg font-semibold text-navy">Not included</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-muted">
              {item.excludes.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </section>
        </div>
        <Button asChild className="mt-8">
          <Link href={`/contact?intent=travel&offer=${item.slug}`}>
            Enquire about this package
          </Link>
        </Button>
      </div>
    </SiteShell>
  );
}
