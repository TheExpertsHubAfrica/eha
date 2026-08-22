import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "@/components/home/hero-visual";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function HomeHero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="grid lg:grid-cols-2">
        <div className="bg-grid-pattern px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <p className="text-sm font-medium tracking-wide text-fg-soft">
            Work · Travel · Study
          </p>
          <h1 className="mt-4 max-w-xl text-[2rem] leading-[1.05] font-bold tracking-tight text-black uppercase sm:text-[2.75rem]">
            {siteConfig.name}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            Discover overseas work, travel, and study pathways — then complete a
            guided application with clear steps, document checks, and support from
            our team.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="uppercase tracking-[0.08em]">
              <Link href="#pathways">
                Explore
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="uppercase tracking-[0.08em]">
              <Link href="/work-abroad">Apply now</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-col gap-2 text-sm text-fg-soft sm:flex-row sm:flex-wrap sm:gap-x-6">
            <li>Guided applications</li>
            <li>Documents collected only when you apply</li>
            <li>Dedicated applicant support</li>
          </ul>
        </div>
        <div className="relative hidden min-h-[420px] bg-[#e8e8e8] lg:block">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
