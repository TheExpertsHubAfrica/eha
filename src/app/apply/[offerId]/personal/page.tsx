import { notFound, redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { PersonalForm } from "@/components/apply/personal-form";
import { emptyPersonalDefaults, personalDefaults } from "@/lib/apply/defaults";
import { getJobById } from "@/server/jobs";
import { loadDraftForJob, requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function PersonalStepPage({
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

  const draft = await loadDraftForJob(offerId);
  if (draft) {
    const result = await requireDraftStep(offerId, "personal");
    if (!result.ok) redirect(result.redirectTo);
    return (
      <ApplyShell job={result.job} step="personal" completed={result.draft.stepsCompleted}>
        <PersonalForm
          offerId={offerId}
          defaults={personalDefaults(result.draft, result.job.genderEligibility)}
          genderEligibility={result.job.genderEligibility}
        />
      </ApplyShell>
    );
  }

  // No draft yet — show the form; first save creates the application.
  return (
    <ApplyShell job={job} step="personal" completed={[]}>
      <PersonalForm
        offerId={offerId}
        defaults={emptyPersonalDefaults(job.genderEligibility)}
        genderEligibility={job.genderEligibility}
      />
    </ApplyShell>
  );
}
