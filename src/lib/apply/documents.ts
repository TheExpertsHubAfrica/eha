import type { JobOffer } from "@/lib/catalog/types";

export function missingRequiredDocuments(
  job: Pick<JobOffer, "documentRequirements">,
  documents: { requirementKey: string }[],
) {
  const uploaded = new Set(documents.map((doc) => doc.requirementKey));
  return job.documentRequirements.filter((item) => item.required && !uploaded.has(item.key));
}
