import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "@/components/home/hero-visual";
import { Button } from "@/components/ui/button";

export function HomeHero() {
  return (
    <section className="bg-white">
      <div className="container-wide grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-16">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-blue uppercase">
            Work · Travel · Study
          </p>
          <h1 className="mt-4 max-w-xl text-[2rem] leading-tight font-semibold text-navy sm:text-5xl">
            Your opportunity abroad starts here.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            Discover overseas work, travel, and study pathways — then complete a
            guided application with clear steps, document checks, and support from
            our team.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="#pathways">
                Explore opportunities
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/work-abroad">Apply now</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm text-fg-soft sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li>Guided applications</li>
            <li>Documents collected only when you apply</li>
            <li>Dedicated applicant support</li>
          </ul>
        </div>
        <div className="hidden md:block">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
