import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteImages } from "@/lib/site-images";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-y border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${siteImages.home.finalCta})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-white/88" aria-hidden="true" />
      <div className="relative container-page py-16 text-center sm:py-20">
        <p className="eyebrow justify-self-center">Next step</p>
        <div className="gold-rule mx-auto mt-3" aria-hidden="true" />
        <h2 className="mt-5 text-2xl font-bold text-black sm:text-3xl">
          Ready to explore your next opportunity?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Review current roles, study destinations, or travel packages — then
          start an application when you are ready.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/work-abroad">Explore opportunities</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
