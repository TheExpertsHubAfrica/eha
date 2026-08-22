import Link from "next/link";
import { ArrowRight, Briefcase, GraduationCap, Plane } from "lucide-react";

const journeys = [
  {
    href: "/work-abroad",
    icon: Briefcase,
    title: "Work abroad",
    text: "Browse current job offers, understand benefits and requirements, then start a structured application.",
    cta: "Explore jobs",
  },
  {
    href: "/study-abroad",
    icon: GraduationCap,
    title: "Study abroad",
    text: "Explore study destinations and the admission, document, and visa guidance we provide.",
    cta: "Explore study opportunities",
  },
  {
    href: "/travel",
    icon: Plane,
    title: "Travel",
    text: "Review curated travel packages by destination, duration, and what’s included.",
    cta: "Explore packages",
  },
] as const;

export function JourneySelector() {
  return (
    <section id="pathways" className="bg-surface">
      <div className="container-wide py-14 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue uppercase">
          Choose a path
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-semibold text-navy sm:text-3xl">
          Start with the journey that matches your goal.
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {journeys.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex flex-col rounded-lg border border-border bg-white p-6 hover:border-blue/30"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-md bg-sky text-blue">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-navy">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {item.text}
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-blue">
                {item.cta}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
