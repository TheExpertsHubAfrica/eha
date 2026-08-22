import type { Metadata } from "next";
import { ConfirmationShell } from "@/components/apply/confirmation-shell";
import { PrintButton } from "@/components/apply/print-button";
import { WorkProfileRecord } from "@/components/apply/work-profile-record";
import { siteConfig } from "@/lib/site-config";
import { formatDisplayDate } from "@/lib/utils";
import { requireSubmittedAccess } from "@/server/application/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Print work profile",
  robots: { index: false, follow: false },
};

export default async function PrintWorkProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { reference } = await params;
  const query = await searchParams;
  const { application, job } = await requireSubmittedAccess(reference, query.t);

  return (
    <ConfirmationShell>
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-muted">Printed copy for {application.referenceNumber}</p>
        <PrintButton />
      </div>
      <header className="mb-8 border-b border-border pb-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue uppercase">{siteConfig.name}</p>
        <h1 className="mt-2 text-2xl font-semibold text-navy">Work profile</h1>
        <p className="mt-1 font-mono text-sm text-navy">{application.referenceNumber}</p>
        <p className="mt-1 text-sm text-muted">
          Submitted {formatDisplayDate(application.submittedAt)} · {job.title}, {job.city}
        </p>
      </header>
      <WorkProfileRecord job={job} application={application} />
    </ConfirmationShell>
  );
}
