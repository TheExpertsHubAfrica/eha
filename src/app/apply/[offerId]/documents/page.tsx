import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { DocumentsForm } from "@/components/apply/documents-form";
import { toDocumentMeta } from "@/server/application/documents";
import { requireDraftStep } from "@/server/application/service";

export const dynamic = "force-dynamic";

export default async function DocumentsStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "documents");
  if (!result.ok) redirect(result.redirectTo);
  return (
    <ApplyShell job={result.job} step="documents" completed={result.draft.stepsCompleted}>
      <DocumentsForm
        offerId={offerId}
        requirements={result.job.documentRequirements}
        initialDocuments={result.draft.documents.map(toDocumentMeta)}
      />
    </ApplyShell>
  );
}
