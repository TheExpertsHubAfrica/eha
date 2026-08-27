import Link from "next/link";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="border-y border-border bg-ash-wash">
      <div className="container-page py-16 text-center sm:py-20">
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
