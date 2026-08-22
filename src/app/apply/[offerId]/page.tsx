import { notFound, redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { StartApplicationButton } from "@/components/apply/start-button";
import { getFirstIncompleteStep } from "@/lib/apply/steps";
import { startApplicationAction } from "@/server/application/actions";
import { loadDraftForJob, loadSubmittedForJob } from "@/server/application/service";
import { confirmationPath } from "@/lib/apply/reference";
import { getJobById } from "@/server/jobs";
import { jobPath } from "@/lib/catalog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApplyStartPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const job = await getJobById(offerId);
  if (!job) notFound();
  if (job.availability !== "open") {
    redirect(`/apply/${offerId}/unavailable`);
  }

  const submitted = await loadSubmittedForJob(job.id);
  if (submitted?.referenceNumber) {
    redirect(confirmationPath(submitted.referenceNumber));
  }

  const draft = await loadDraftForJob(job.id);
  if (draft) {
    const next = getFirstIncompleteStep(job, draft.stepsCompleted);
    redirect(`/apply/${job.id}/${next.id}`);
  }

  return (
    <ApplyShell job={job}>
      <div className="max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Start a guided application</h2>
        <p className="mt-3 text-muted">
          Your answers are saved as a private draft on this device after you begin.
          You can leave and return. Documents are uploaded later in this application — never on the homepage.
        </p>
        <ul className="mt-5 list-disc space-y-1 pl-5 text-sm text-fg-soft">
          <li>Personal details</li>
          <li>Education and work history, if required for this role</li>
          <li>Background and a short statement</li>
          <li>Private document upload for this opportunity</li>
          <li>Review everything before final submission</li>
        </ul>
        <form action={startApplicationAction.bind(null, job.id)} className="mt-8">
          <StartApplicationButton />
        </form>
        <p className="mt-4 text-sm">
          <Link href={jobPath(job)} className="text-blue">
            Back to the opportunity
          </Link>
        </p>
      </div>
    </ApplyShell>
  );
}
