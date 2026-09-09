"use server";

import { redirect } from "next/navigation";
import { canAccessStep, jobRequiresEmergency, jobRequiresMilitary, jobRequiresTravel } from "@/lib/apply/steps";
import { isGenderAllowed } from "@/lib/gender";
import {
  educationSchema,
  employmentSchema,
  personalSchema,
  stripEmptyDependants,
  supportingSchemaForJob,
  type SupportingInput,
} from "@/lib/validation/application";
import { getJobById } from "@/server/jobs";
import { completeDocuments } from "@/server/application/documents";
import { submitApplication } from "@/server/application/submit";
import {
  loadDraftForJob,
  saveEducation,
  saveEmployment,
  savePersonal,
  saveSupporting,
  startOrResumeApplication,
} from "@/server/application/service";

function flattenIssues(issues: { path: (string | number | symbol)[]; message: string }[]) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).filter(Boolean).join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}

export type ActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

async function context(offerId: string) {
  const job = await getJobById(offerId);
  const draft = await loadDraftForJob(offerId);
  if (!job || job.availability !== "open") {
    return { error: "This opportunity is not open for applications." as const };
  }
  if (!draft) {
    return {
      error:
        "Your application draft could not be found. Start again from the opportunity page.",
    } as const;
  }
  return { job, draft };
}

export async function startApplicationAction(offerId: string) {
  const job = await getJobById(offerId);
  if (!job || job.availability !== "open") {
    redirect(`/apply/${offerId}/unavailable`);
  }
  const started = await startOrResumeApplication(job);
  redirect(started.redirectTo);
}

export async function savePersonalAction(
  offerId: string,
  payload: unknown,
): Promise<ActionState> {
  const loaded = await context(offerId);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  const parsed = personalSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error.issues) };
  }
  if (!isGenderAllowed(loaded.job.genderEligibility, parsed.data.gender)) {
    const only =
      loaded.job.genderEligibility === "male"
        ? "male applicants"
        : "female applicants";
    return {
      ok: false,
      fieldErrors: {
        gender: `This opportunity is open to ${only} only.`,
      },
      error: `This opportunity is open to ${only} only.`,
    };
  }
  const next = await savePersonal(loaded.job, loaded.draft.id, parsed.data);
  redirect(next);
}

export async function saveEducationAction(
  offerId: string,
  payload: unknown,
): Promise<ActionState> {
  const loaded = await context(offerId);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  const parsed = educationSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error.issues) };
  }
  const next = await saveEducation(loaded.job, loaded.draft.id, parsed.data);
  redirect(next);
}

export async function saveEmploymentAction(
  offerId: string,
  payload: unknown,
): Promise<ActionState> {
  const loaded = await context(offerId);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  const parsed = employmentSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error.issues) };
  }
  const next = await saveEmployment(loaded.job, loaded.draft.id, parsed.data);
  redirect(next);
}

export async function saveSupportingAction(
  offerId: string,
  payload: unknown,
): Promise<ActionState> {
  const loaded = await context(offerId);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  const schema = supportingSchemaForJob({
    requireTravel: jobRequiresTravel(loaded.job),
    requireEmergency: jobRequiresEmergency(loaded.job),
    requireMilitary: jobRequiresMilitary(loaded.job),
  });
  const normalized =
    payload && typeof payload === "object"
      ? {
          ...(payload as Record<string, unknown>),
          dependants: stripEmptyDependants(
            ((payload as { dependants?: SupportingInput["dependants"] }).dependants ?? []) as SupportingInput["dependants"],
          ),
        }
      : payload;
  const parsed = schema.safeParse(normalized);
  if (!parsed.success) {
    const fieldErrors = flattenIssues(parsed.error.issues);
    return {
      ok: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }
  const result = await saveSupporting(loaded.job, loaded.draft.id, parsed.data);
  if (!result.ok) {
    const fieldErrors = flattenIssues(result.issues as { path: (string | number)[]; message: string }[]);
    return {
      ok: false,
      error: Object.values(fieldErrors)[0],
      fieldErrors,
    };
  }
  redirect(result.redirectTo);
}

export async function completeDocumentsAction(offerId: string): Promise<ActionState> {
  const loaded = await context(offerId);
  if ("error" in loaded) return { ok: false, error: loaded.error };
  if (!canAccessStep(loaded.job, loaded.draft.stepsCompleted, "documents")) {
    return { ok: false, error: "Complete the previous application steps first." };
  }
  const fresh = await loadDraftForJob(offerId);
  if (!fresh) return { ok: false, error: "Your application draft could not be found." };
  const result = await completeDocuments(loaded.job, fresh);
  if (!result.ok) return { ok: false, error: result.error };
  redirect(result.redirectTo);
}

export async function submitApplicationAction(
  offerId: string,
  input: { declaration: boolean; acknowledgeSimilar: boolean },
): Promise<ActionState> {
  const result = await submitApplication(offerId, input);
  if (!result.ok) return { ok: false, error: result.error };
  redirect(result.redirectTo);
}

