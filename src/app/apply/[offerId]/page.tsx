import { notFound, redirect } from "next/navigation";
import { ResumeDraftForm } from "@/components/apply/resume-draft-form";
import { ApplyShell } from "@/components/apply/apply-shell";
import { StartApplicationButton } from "@/components/apply/start-button";
import { ContentImage } from "@/components/ui/content-image";
import { getFirstIncompleteStep } from "@/lib/apply/steps";
import { genderEligibilityLabel } from "@/lib/gender";
import { startApplicationAction } from "@/server/application/actions";
import { loadDraftForJob, loadSubmittedForJob } from "@/server/application/service";
import { confirmationPath } from "@/lib/apply/reference";
import { getJobById } from "@/server/jobs";
import { jobPath } from "@/lib/catalog";
import { siteImages } from "@/lib/site-images";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApplyStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{ resume?: string }>;
}) {
  const { offerId } = await params;
  const query = await searchParams;
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
      <div className="max-w-xl overflow-hidden rounded-lg border border-border bg-white">
        <ContentImage
          src={siteImages.apply.start}
          alt="Start your guided work abroad application"
          aspect="video"
          className="border-b border-border"
        />
        <div className="p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-navy">Start a guided application</h2>
          <p className="mt-3 text-muted">
            Begin with your personal details. Your draft is saved privately after that first save,
            and we email you a resume link so you can continue on another device.
          </p>
          {job.genderEligibility !== "both" ? (
            <p className="mt-3 rounded-md border border-gold/30 bg-gold-soft/40 px-3 py-2 text-sm text-navy">
              Eligibility: {genderEligibilityLabel(job.genderEligibility)}.
            </p>
          ) : null}
          {query.resume === "invalid" ? (
            <p className="mt-3 rounded-md border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
              That resume link is invalid or has expired. Request a new link below, or start again.
            </p>
          ) : null}
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
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-sm font-semibold text-navy">Already started on another device?</h3>
            <p className="mt-1 text-sm text-muted">
              Enter the email you used on the personal details step and we will send a resume link
              if a draft exists.
            </p>
            <div className="mt-4">
              <ResumeDraftForm offerId={job.id} />
            </div>
          </div>
          <p className="mt-4 text-sm">
            <Link href={jobPath(job)} className="text-blue">
              Back to the opportunity
            </Link>
          </p>
        </div>
      </div>
    </ApplyShell>
  );
}
