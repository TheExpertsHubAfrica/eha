import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { getJobById } from "@/server/jobs";
import { jobPath } from "@/lib/catalog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApplyUnavailablePage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const job = await getJobById(offerId);

  return (
    <SiteShell>
      <div className="container-page py-16 sm:py-20">
        <h1 className="text-3xl font-semibold text-navy">
          This application isn’t available
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          The opportunity may be closed or no longer published. Your saved
          answers stay on this device if you still have a draft cookie, but you
          can’t continue until the role is open again.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {job ? (
            <Button asChild>
              <Link href={jobPath(job)}>View opportunity</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/work-abroad">Browse jobs</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </SiteShell>
  );
}
