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
  const quotes = await prisma.testimonial.findMany({
    where: { published: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    take: 6,
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
        <section className="container-wide py-14">
          <p className="text-xs font-semibold tracking-[0.16em] text-blue uppercase">
            From applicants
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-navy">Published feedback</h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            These quotes are added in the admin CMS. There are no placeholder testimonials.
          </p>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {quotes.map((item) => (
              <blockquote key={item.id} className="rounded-lg border border-border bg-white p-6">
                <p className="text-navy">{item.quote}</p>
                <footer className="mt-3 text-sm text-muted">{item.attribution}</footer>
              </blockquote>
            ))}
          </div>
        </section>
      ) : null}
      <HowItWorks />
      <FinalCta />
    </SiteShell>
  );
}
