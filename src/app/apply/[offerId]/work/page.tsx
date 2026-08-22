import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { WorkForm } from "@/components/apply/work-form";
import { employmentDefaults } from "@/lib/apply/defaults";
import { requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function WorkStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "work");
  if (!result.ok) redirect(result.redirectTo);
  return (
    <ApplyShell job={result.job} step="work" completed={result.draft.stepsCompleted}>
      <WorkForm offerId={offerId} defaults={employmentDefaults(result.draft)} />
    </ApplyShell>
  );
}
