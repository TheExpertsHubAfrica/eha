import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { SupportingForm } from "@/components/apply/supporting-form";
import { supportingDefaults } from "@/lib/apply/defaults";
import {
  jobRequiresEmergency,
  jobRequiresMilitary,
  jobRequiresTravel,
  jobRequiresUaeContact,
} from "@/lib/apply/steps";
import { requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function SupportingStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "supporting");
  if (!result.ok) redirect(result.redirectTo);
  const { job, draft } = result;
  return (
    <ApplyShell job={job} step="supporting" completed={draft.stepsCompleted}>
      <SupportingForm
        offerId={offerId}
        defaults={supportingDefaults(draft)}
        requireTravel={jobRequiresTravel(job)}
        requireMilitary={jobRequiresMilitary(job)}
        requireEmergency={jobRequiresEmergency(job)}
        requireUaeContact={jobRequiresUaeContact(job)}
      />
    </ApplyShell>
  );
}
