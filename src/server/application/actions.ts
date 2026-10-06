"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { canAccessStep, jobRequiresEmergency, jobRequiresMilitary, jobRequiresTravel } from "@/lib/apply/steps";
import { isGenderAllowed } from "@/lib/gender";
import { siteConfig } from "@/lib/site-config";
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
  findDraftByEmail,
  loadDraftForJob,
  resumeDraftWithToken,
  rotateDraftResumeToken,
  saveEducation,
  saveEmployment,
  savePersonal,
  saveSupporting,
  startOrResumeApplication,
} from "@/server/application/service";
import { overlayEmailTemplate } from "@/server/email/custom";
import { deliverEmail } from "@/server/email/send";
import { draftResumeEmail } from "@/server/email/templates";

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
        "Your application draft could not be found. Start again from the opportunity page, or request a resume link by email.",
    } as const;
  }
  return { job, draft };
}

async function sendDraftResume(input: {
  applicationId: string;
  offerId: string;
  token: string;
  email: string;
  fullName: string;
  jobTitle: string;
  location: string;
  allowResend?: boolean;
}) {
  const resumeUrl = `${siteConfig.url.replace(/\/$/, "")}/apply/${input.offerId}/resume?t=${encodeURIComponent(input.token)}`;
  const fallback = draftResumeEmail({
    applicantName: input.fullName,
    jobTitle: input.jobTitle,
    location: input.location,
    resumeUrl,
  });
  const message = await overlayEmailTemplate(
    "draft_resume",
    {
      applicantName: input.fullName,
      jobTitle: input.jobTitle,
      location: input.location,
      resumeUrl,
    },
    fallback,
    siteConfig.name,
  );
  await deliverEmail({
    applicationId: input.applicationId,
    template: message.template,
    to: input.email,
    subject: message.subject,
    html: message.html,
    text: message.text,
    allowResend: input.allowResend,
  });
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
  const job = await getJobById(offerId);
  if (!job || job.availability !== "open") {
    return { ok: false, error: "This opportunity is not open for applications." };
  }
  const draft = await loadDraftForJob(offerId);
  const parsed = personalSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenIssues(parsed.error.issues) };
  }
  if (!isGenderAllowed(job.genderEligibility, parsed.data.gender)) {
    const only =
      job.genderEligibility === "male"
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

  const saved = await savePersonal(job, draft?.id ?? null, parsed.data);

  // Email a resume link on first save (new draft) so the applicant can return without the cookie.
  if (saved.resumeToken) {
    await sendDraftResume({
      applicationId: saved.applicationId,
      offerId: job.id,
      token: saved.resumeToken,
      email: saved.email,
      fullName: saved.fullName,
      jobTitle: job.title,
      location: `${job.city}, ${job.country}`,
    }).catch(() => undefined);
  }

  redirect(saved.nextPath);
}

export async function requestResumeLinkAction(
  offerId: string,
  formData: FormData,
): Promise<ActionState> {
  const job = await getJobById(offerId);
  if (!job || job.availability !== "open") {
    return { ok: false, error: "This opportunity is not open for applications." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) {
    return { ok: false, fieldErrors: { email: "Enter a valid email address." } };
  }

  const draft = await findDraftByEmail(job.id, parsed.data);
  // Always return success wording so we do not reveal whether an email has a draft.
  if (draft?.profile) {
    const token = await rotateDraftResumeToken(draft.id);
    await sendDraftResume({
      applicationId: draft.id,
      offerId: job.id,
      token,
      email: parsed.data,
      fullName: draft.profile.fullName || "Applicant",
      jobTitle: job.title,
      location: `${job.city}, ${job.country}`,
      allowResend: true,
    }).catch(() => undefined);
  }

  return { ok: true };
}

export async function resumeApplicationAction(offerId: string, token: string) {
  const job = await getJobById(offerId);
  if (!job) {
    redirect(`/apply/${offerId}/unavailable`);
  }
  const result = await resumeDraftWithToken(offerId, token);
  if (!result.ok) {
    redirect(`/apply/${offerId}?resume=invalid`);
  }
  redirect(result.redirectTo);
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
    const fieldErrors = flattenIssues(
      result.issues as { path: (string | number | symbol)[]; message: string }[],
    );
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
