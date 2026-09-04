import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { StudyDestinationCard } from "@/components/study/destination-card";
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
        title="We guide you every step of the way."
        description="This direction is focused on those who want to study, gain qualifications and build long-term opportunities in Europe, Canada & USA. Our goal is to provide clear guidance on available programs, admission requirements and preparation steps. This service is available as part of our full support system."
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
              <StudyDestinationCard key={item.id} destination={item} showSupport />
            ))}
          </div>
        )}
      </section>
    </SiteShell>
  );
}
