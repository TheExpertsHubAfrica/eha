import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/page-hero";
import { getFeaturedStudy } from "@/lib/catalog";

const support = [
  "Admission assistance",
  "Application guidance",
  "Visa support",
  "Document guidance",
];

export async function StudySection() {
  const destinations = await getFeaturedStudy();

  return (
    <section className="bg-white">
      <div className="container-wide py-14 sm:py-16">
        <SectionHeading
          eyebrow="Study abroad"
          title="Education pathways with guided applications"
          description="We help you understand destination options, required documents, and the visa process — without rushing you into a form on the homepage."
        />
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
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
          <div className="grid gap-4 sm:grid-cols-2">
            {destinations.map((item) => (
              <Link
                key={item.id}
                href={`/study-abroad/${item.slug}`}
                className="rounded-lg border border-border bg-surface p-5 hover:border-blue/30"
              >
                <p className="text-xs font-medium tracking-wide text-muted uppercase">
                  {item.region}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-navy">
                  {item.name}
                </h3>
                <p className="mt-2 text-sm text-muted">{item.summary}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
