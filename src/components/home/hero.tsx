import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileCheck, Headphones, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteImages } from "@/lib/site-images";
import { siteConfig } from "@/lib/site-config";
const highlights = [
  {
    icon: Route,
    title: "Guided applications",
    text: "Step-by-step flow for each opportunity",
  },
  {
    icon: FileCheck,
    title: "Documents when you apply",
    text: "No uploads on the homepage or contact form",
  },
  {
    icon: Headphones,
    title: "Applicant support",
    text: "Clear guidance from enquiry to submission",
  },
] as const;

function splitBrandName(name: string) {
  const words = name.trim().split(/\s+/);
  if (words.length <= 1) return { lead: name, tail: "" };
  return {
    lead: words.slice(0, -1).join(" "),
    tail: words.at(-1) ?? "",
  };
}

export function HomeHero() {
  const { lead, tail } = splitBrandName(siteConfig.name);

  return (
    <section className="relative overflow-hidden border-b border-border bg-white">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_0%_0%,rgb(184_149_58/0.1),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="container-wide relative py-10 sm:py-12 lg:py-16 xl:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-5 xl:col-span-5">
            <p className="eyebrow">Work · Travel · Study</p>
            <div className="gold-rule mt-4" aria-hidden="true" />

            <h1 className="mt-5 max-w-xl text-[2rem] leading-[1.02] font-bold tracking-tight sm:text-[2.65rem] xl:text-[3rem]">
              <span className="block text-black uppercase">{lead}</span>
              {tail ? (
                <span className="mt-1 block bg-linear-to-r from-gold-deep via-gold to-gold-bright bg-clip-text text-transparent uppercase">
                  {tail}
                </span>
              ) : null}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-fg-soft sm:text-lg">
              Discover overseas work, travel, and study pathways — then complete a
              guided application with clear steps, document checks, and support from
              our team.
            </p>

            <div className="mt-7">
              <Button
                asChild
                size="lg"
                variant="gold"
                className="w-full whitespace-nowrap uppercase tracking-[0.08em] sm:w-auto"
              >
                <Link href="#pathways">
                  Explore pathways
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {highlights.map((item) => (
                <li
                  key={item.title}
                  className="border border-border bg-white/90 p-4 backdrop-blur-sm transition-colors hover:border-gold/40 hover:bg-gold-soft/15"
                >
                  <span className="inline-flex size-9 items-center justify-center bg-gold-soft text-gold-deep">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-black">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{item.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7 xl:col-span-7">
            <div className="relative">
              <div
                className="absolute -top-3 -left-3 hidden h-16 w-16 border-t-2 border-l-2 border-gold lg:block"
                aria-hidden="true"
              />
              <div
                className="absolute -right-3 -bottom-3 hidden h-16 w-16 border-r-2 border-b-2 border-gold/70 lg:block"
                aria-hidden="true"
              />

              <div className="relative aspect-[5/4] overflow-hidden border border-border bg-ash-100 shadow-[0_24px_60px_-24px_rgb(28_27_24/0.45)] sm:aspect-[16/11] lg:aspect-[5/4] xl:aspect-[16/11]">
                <Image
                  src={siteImages.home.hero}
                  alt="International work, travel and study opportunities abroad with The Experts Hub Africa"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                <div
                  className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 bg-linear-to-r from-black/25 via-transparent to-transparent lg:from-black/35"
                  aria-hidden="true"
                />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <div className="max-w-xs">
                    <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-gold-bright uppercase">
                      Your journey starts here
                    </p>
                    <p className="mt-1 text-sm leading-snug text-white/90">
                      Work placements, study pathways, and curated travel — one
                      guided platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
