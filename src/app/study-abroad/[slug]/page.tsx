import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { getStudyBySlug } from "@/lib/catalog";
import { recordEvent } from "@/server/analytics/events";

type Params = { slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await getStudyBySlug(slug);
  if (!item) return { title: "Destination not found" };
  return { title: `Study in ${item.name}`, description: item.summary };
}

export default async function StudyDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = await getStudyBySlug(slug);
  if (!item) notFound();
  await recordEvent({ name: "study_viewed", targetType: "StudyOpportunity", targetId: item.id });

  return (
    <SiteShell>
      <div className="container-page py-10 sm:py-14">
        <p className="text-sm text-muted">
          <Link href="/study-abroad" className="hover:text-navy">
            Study abroad
          </Link>
          <span aria-hidden="true"> / </span>
          {item.name}
        </p>
        <h1 className="mt-6 text-3xl font-semibold text-navy">
          Study in {item.name}
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">{item.summary}</p>
        <h2 className="mt-10 text-xl font-semibold text-navy">How we help</h2>
        <ul className="mt-3 max-w-xl list-disc space-y-1 pl-5 text-muted">
          {item.support.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-8 max-w-2xl text-sm text-muted">
          University lists, tuition figures, and intake calendars are not
          invented here. Administrators can add them as verified programme
          records in a later phase.
        </p>
        <Button asChild className="mt-8">
          <Link href={`/contact?intent=study&offer=${item.slug}`}>
            Talk to us about this destination
          </Link>
        </Button>
      </div>
    </SiteShell>
  );
}
