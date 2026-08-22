import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { EducationForm } from "@/components/apply/education-form";
import { educationDefaults } from "@/lib/apply/defaults";
import { requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function EducationStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "education");
  if (!result.ok) redirect(result.redirectTo);
  return (
    <ApplyShell job={result.job} step="education" completed={result.draft.stepsCompleted}>
      <EducationForm offerId={offerId} defaults={educationDefaults(result.draft)} />
    </ApplyShell>
  );
}
