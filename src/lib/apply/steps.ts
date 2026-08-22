import type { JobOffer } from "@/lib/catalog/types";

export type ApplyStepId =
  | "personal"
  | "education"
  | "work"
  | "supporting"
  | "documents"
  | "review";

export type ApplyStep = {
  id: ApplyStepId;
  path: ApplyStepId;
  label: string;
  description: string;
};

const STEP_META: Record<ApplyStepId, Omit<ApplyStep, "id" | "path">> = {
  personal: { label: "Personal", description: "Tell us about yourself" },
  education: { label: "Education", description: "Your qualifications" },
  work: { label: "Work", description: "Employment history" },
  supporting: { label: "Background", description: "Supporting information" },
  documents: { label: "Documents", description: "Upload required files" },
  review: { label: "Review", description: "Check before you continue" },
};

function jobNeeds(job: JobOffer, section: string) {
  return job.requiredProfileSections.includes(section);
}

export function getApplySteps(job: JobOffer): ApplyStep[] {
  const ids: ApplyStepId[] = ["personal"];
  if (jobNeeds(job, "education")) ids.push("education");
  if (jobNeeds(job, "workExperience")) ids.push("work");
  ids.push("supporting");
  ids.push("documents");
  ids.push("review");
  return ids.map((id) => ({ id, path: id, ...STEP_META[id] }));
}

export function getNextStep(job: JobOffer, current: ApplyStepId) {
  const steps = getApplySteps(job);
  const index = steps.findIndex((step) => step.id === current);
  return steps[index + 1] ?? steps[steps.length - 1];
}

export function getFirstIncompleteStep(job: JobOffer, completed: string[]) {
  const steps = getApplySteps(job).filter((step) => step.id !== "review");
  return steps.find((step) => !completed.includes(step.id)) ?? {
    id: "review" as const,
    path: "review" as const,
    ...STEP_META.review,
  };
}

export function canAccessStep(
  job: JobOffer,
  completed: string[],
  target: ApplyStepId,
) {
  const steps = getApplySteps(job);
  const targetIndex = steps.findIndex((step) => step.id === target);
  if (targetIndex === -1) return false;
  if (target === "personal") return true;
  if (target === "review") {
    return steps
      .filter((step) => step.id !== "review")
      .every((step) => completed.includes(step.id));
  }
  const previous = steps[targetIndex - 1];
  return Boolean(previous && completed.includes(previous.id));
}

export function jobRequiresTravel(job: JobOffer) {
  return jobNeeds(job, "travelHistory");
}

export function jobRequiresMilitary(job: JobOffer) {
  return jobNeeds(job, "militaryHistory");
}

export function jobRequiresEmergency(job: JobOffer) {
  return jobNeeds(job, "emergencyContact");
}

export function jobRequiresUaeContact(job: JobOffer) {
  return job.countryCode === "AE";
}

export function applyPath(offerId: string, step?: ApplyStepId) {
  return step ? `/apply/${offerId}/${step}` : `/apply/${offerId}`;
}
