import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/ui/content-image";
import { PageHero } from "@/components/ui/page-hero";
import { siteImages } from "@/lib/site-images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About Us",
  description: `${siteConfig.name} helps you study, work or relocate abroad legally with full support from opportunity choice to starting life in another country.`,
};

export default function AboutPage() {
  return (
    <SiteShell>
      <PageHero
        eyebrow="About Us"
        title="Connecting Africans to opportunities globally."
        description="The Experts Hub Africa helps you study, work or relocate abroad legally. We provide full support, from choosing an opportunity to starting your new life in another country."
        image={siteImages.about.team}
        imageAlt="The Experts Hub Africa team providing work, travel and study abroad support"
      />
      <section className="container-page prose-eha py-12 sm:py-16">
        <h2 className="text-2xl">What we do</h2>
        <p className="mt-4 text-muted">
          The UAE and Europe offer a wide range of opportunities for people who
          want to build a better future, increase their income or gain
          international experience. Our company helps candidates from different
          countries access reliable opportunities in Europe and the UAE,
          including employment and future education programmes. We focus on
          creating a clear and structured path for relocation by providing
          support at every stage: from choosing the right direction to starting
          work or preparing for study programmes. Our goal is to simplify the
          process and make these opportunities more accessible.
        </p>
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          <ContentImage
            src={siteImages.about.team}
            alt="The Experts Hub Africa team providing work, travel and study abroad support"
            aspect="video"
          />
          <ContentImage
            src={siteImages.about.process}
            alt="Guided job and study abroad application process with document support"
            aspect="video"
          />
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
