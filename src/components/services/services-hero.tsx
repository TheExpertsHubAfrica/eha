import Image from "next/image";
import { siteImages } from "@/lib/site-images";

const panels = [
  {
    label: "Work",
    src: siteImages.services.work,
    alt: "Work abroad — overseas job placement services",
  },
  {
    label: "Study",
    src: siteImages.services.study,
    alt: "Study abroad — university and admission support",
  },
  {
    label: "Travel",
    src: siteImages.services.travel,
    alt: "Travel packages — international holiday destinations",
  },
  {
    label: "Visa",
    src: siteImages.services.visa,
    alt: "Visa assistance — document and application guidance",
  },
] as const;

export function ServicesPageHero() {
  return (
    <section className="border-b border-border bg-ash-wash">
      <div className="h-72 overflow-hidden sm:h-80">
        <div className="grid h-full grid-cols-2 gap-px bg-gold lg:grid-cols-4">
        {panels.map((panel, index) => (
          <div key={panel.label} className="relative min-h-0 bg-ash-100">
            <Image
              src={panel.src}
              alt={panel.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
              priority={index === 0}
            />
            <div
              className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent px-3 py-4 sm:px-4 sm:py-5"
              aria-hidden="true"
            >
              <p className="text-[0.65rem] font-semibold tracking-[0.18em] text-gold-bright uppercase sm:text-xs">
                {panel.label}
              </p>
            </div>
          </div>
        ))}
        </div>
      </div>

      <div className="container-page py-12 sm:py-16">
        <p className="eyebrow">Services</p>
        <div className="gold-rule mt-4" aria-hidden="true" />
        <h1 className="mt-5 max-w-3xl text-3xl font-bold text-black sm:text-4xl">
          Support across work, study, travel, and visas.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Each service has its own pages and a staged application or enquiry — not a single
          form trying to do everything.
        </p>
      </div>
    </section>
  );
}
