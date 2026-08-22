import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { PersonalForm } from "@/components/apply/personal-form";
import { personalDefaults } from "@/lib/apply/defaults";
import { requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function PersonalStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "personal");
  if (!result.ok) redirect(result.redirectTo);
  return (
    <ApplyShell job={result.job} step="personal" completed={result.draft.stepsCompleted}>
      <PersonalForm offerId={offerId} defaults={personalDefaults(result.draft)} />
    </ApplyShell>
  );
}
