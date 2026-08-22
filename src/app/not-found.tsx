import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="container-page py-24 text-center">
        <p className="text-sm font-semibold tracking-wide text-blue">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-navy">
          This page is not available.
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          The link may be out of date, or the opportunity is no longer
          published.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/">Return home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
