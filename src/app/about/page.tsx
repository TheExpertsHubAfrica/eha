import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { PageHero } from "@/components/ui/page-hero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn how ${siteConfig.name} supports applicants exploring work, travel, and study opportunities abroad.`,
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About"
        title={`A professional platform for pursuing opportunities abroad.`}
        description={`${siteConfig.name} helps applicants discover overseas work, travel packages, and study pathways — then complete a structured application with guidance from our team.`}
      />
      <section className="container-page prose-eha py-12 sm:py-16">
        <h2 className="text-2xl">What we do</h2>
        <p className="mt-4 text-muted">
          Applicants should not have to send passports, photos, and CVs through a
          crowded homepage form. This platform separates discovery from
          application: you browse published opportunities, read the terms, and
          only then start a profile and document upload for a specific offer.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Work",
              text: "International job listings with salary, benefits, and application requirements stated on the opportunity page.",
            },
            {
              title: "Travel",
              text: "Curated packages with duration, inclusions, and destination context — not a dump of every itinerary on one screen.",
            },
            {
              title: "Study",
              text: "Study-abroad destinations with admission, visa, and document guidance. Programme catalogues can grow over time.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="border border-border bg-white p-6"
            >
              <p className="eyebrow">{item.title}</p>
              <div className="gold-rule mt-3" aria-hidden="true" />
              <p className="mt-4 text-sm text-muted">{item.text}</p>
            </article>
          ))}
        </div>
        <h2 className="mt-14 text-2xl">How we talk about visas and jobs</h2>
        <p className="mt-4 text-muted">
          Support with placement and visa processing is part of many offers. We
          do not present absolute guarantees as legal facts. Language such as
          “job placement and visa support included, subject to eligibility and
          applicable requirements” is the standard unless administrators publish
          a more specific, reviewed statement for an offer.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/work-abroad">Browse jobs</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact the team</Link>
          </Button>
        </div>
      </section>
    </SiteShell>
  );
}
