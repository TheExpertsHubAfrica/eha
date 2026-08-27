import { FeaturedJobs } from "@/components/home/featured-jobs";
import { FeaturedTravel } from "@/components/home/featured-travel";
import { FinalCta } from "@/components/home/final-cta";
import { HomeHero } from "@/components/home/hero";
import { HowItWorks } from "@/components/home/how-it-works";
import { JourneySelector } from "@/components/home/journey-selector";
import { StudySection } from "@/components/home/study-section";
import { TrustSection } from "@/components/home/trust-section";
import { SiteShell } from "@/components/layout/site-shell";
import { recordEvent } from "@/server/analytics/events";
import { prisma } from "@/server/db";

export default async function HomePage() {
  await recordEvent({ name: "homepage_viewed" });
  const quotes = await prisma.testimonial
    .findMany({
      where: { published: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 6,
    })
    .catch((error) => {
      console.error("homepage testimonials: database unavailable", error);
      return [];
    });

  return (
    <SiteShell>
      <HomeHero />
      <JourneySelector />
      <FeaturedJobs />
      <FeaturedTravel />
      <StudySection />
      <TrustSection />
      {quotes.length > 0 ? (
        <section className="bg-surface">
          <div className="container-wide py-14">
            <p className="eyebrow">From applicants</p>
            <div className="gold-rule mt-3" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-semibold text-navy">Published feedback</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              These quotes are added in the admin CMS. There are no placeholder testimonials.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {quotes.map((item) => (
                <blockquote
                  key={item.id}
                  className="border border-border border-l-gold bg-white p-6"
                >
                  <p className="text-navy">{item.quote}</p>
                  <footer className="mt-3 text-sm text-muted">{item.attribution}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <HowItWorks />
      <FinalCta />
    </SiteShell>
  );
}
