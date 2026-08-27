import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroVisual } from "@/components/home/hero-visual";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export function HomeHero() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="grid lg:grid-cols-2">
        <div className="bg-ash-wash bg-grid-pattern px-6 py-14 sm:px-8 lg:px-12 lg:py-20">
          <p className="eyebrow">Work · Travel · Study</p>
          <div className="gold-rule mt-4" aria-hidden="true" />
          <h1 className="mt-5 max-w-xl text-[2rem] leading-[1.05] font-bold tracking-tight text-black uppercase sm:text-[2.75rem]">
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
            <Button asChild size="lg" variant="gold" className="uppercase tracking-[0.08em]">
              <Link href="/work-abroad">Apply now</Link>
            </Button>
          </div>
          <ul className="mt-10 flex flex-col gap-2.5 text-sm text-fg-soft sm:flex-row sm:flex-wrap sm:gap-x-8">
            {[
              "Guided applications",
              "Documents collected only when you apply",
              "Dedicated applicant support",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="relative hidden min-h-[420px] bg-ash-100 lg:block">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
