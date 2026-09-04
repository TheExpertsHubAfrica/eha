import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/ui/content-image";
import { SectionHeading } from "@/components/ui/page-hero";
import { StudyDestinationCard } from "@/components/study/destination-card";
import type { StudyDestination } from "@/lib/catalog/types";
import { siteImages } from "@/lib/site-images";

const support = [
  "Admission assistance",
  "Application guidance",
  "Visa support",
  "Document guidance",
];

export function StudySection({ destinations }: { destinations: StudyDestination[] }) {
  return (
    <section className="bg-white">
      <div className="container-wide py-14 sm:py-16">
        <SectionHeading
          eyebrow="Study abroad"
          title="Education pathways with guided applications"
          description="We help you understand destination options, required documents and the visa process — without rushing you into a form on the homepage."
        />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-8">
            <ContentImage
              src={siteImages.study.support}
              alt="Study abroad support — admission, visa and document guidance"
              aspect="video"
            />
            <div>
              <ul className="space-y-3">
                {support.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-fg-soft">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-8">
                <Link href="/study-abroad">Explore study abroad</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {destinations.map((item) => (
              <StudyDestinationCard key={item.id} destination={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
