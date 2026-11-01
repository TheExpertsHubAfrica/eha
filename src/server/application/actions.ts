"use server";

import { headers } from "next/headers";
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
import { applicationAccessPath, confirmationPath, parseApplicationReference } from "@/lib/apply/reference";
import { getJobById } from "@/server/jobs";
import { clientIp, consumeApplicantEmailSlot, consumeRateLimit, RATE_LIMITS } from "@/server/rate-limit";
import {
  consumeAccessLink,
  findSubmittedByReferenceAndEmail,
  issueAccessLink,
} from "@/server/application/access";
import { completeDocuments } from "@/server/application/documents";
import { submitApplication } from "@/server/application/submit";
import {
  consumeResumeToken,
  findDraftByEmail,
  issueResumeToken,
  loadDraftForJob,
  saveEducation,
  saveEmployment,
  savePersonal,
  saveSupporting,
  startOrResumeApplication,
} from "@/server/application/service";
import { overlayEmailTemplate } from "@/server/email/custom";
import { deliverEmail, reserveSiteEmailSlot } from "@/server/email/send";
import { applicationAccessEmail, draftResumeEmail } from "@/server/email/templates";

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

/** Shared by every applicant email, so all of them count towards the same per-recipient cap. */
async function consumeDraftEmailSlot(email: string) {
  return consumeApplicantEmailSlot(clientIp(await headers()), email);
}

/** Checked before a new link is issued, so a refused email cannot cancel a link that still works. */
function reserveLinkEmail(applicationId: string, template: string, to: string, reference: string) {
  return reserveSiteEmailSlot(RATE_LIMITS.siteLinkEmails, {
    applicationId,
    template,
    to,
    subject: `Link email — ${reference}`,
  });
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

  if (!draft) {
    const limited = await consumeRateLimit(RATE_LIMITS.draftCreateIp, clientIp(await headers()));
    if (!limited.ok) {
      return { ok: false, error: "Too many new applications from this network. Please try again later." };
    }
  }

  const saved = await savePersonal(job, draft?.id ?? null, parsed.data);

  // Email a resume link on first save (new draft) so the applicant can return without the cookie.
  // Over the limit the draft still saves, because the applicant's work matters more than the email.
  if (
    saved.resumeToken &&
    (await consumeDraftEmailSlot(saved.email)) &&
    (await reserveLinkEmail(saved.applicationId, "draft_resume", saved.email, job.title))
  ) {
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

  // Counted whether or not a draft exists, so hitting the limit reveals nothing about the email.
  if (!(await consumeDraftEmailSlot(parsed.data))) {
    return { ok: false, error: "Too many resume link requests. Please try again later." };
  }

  const draft = await findDraftByEmail(job.id, parsed.data);
  // Always return success wording so we do not reveal whether an email has a draft.
  if (draft?.profile && (await reserveLinkEmail(draft.id, "draft_resume", parsed.data, job.title))) {
    const token = await issueResumeToken(draft.id);
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
  const result =
    typeof token === "string" ? await consumeResumeToken(offerId, token) : { ok: false as const };
  if (!result.ok) {
    redirect(`/apply/${offerId}?resume=invalid`);
  }
  redirect(result.redirectTo);
}

export async function requestApplicationLinkAction(formData: FormData): Promise<ActionState> {
  const reference = String(formData.get("reference") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!parseApplicationReference(reference)) {
    return { ok: false, fieldErrors: { reference: "Enter your application reference." } };
  }
  if (!z.string().email().safeParse(email).success) {
    return { ok: false, fieldErrors: { email: "Enter a valid email address." } };
  }
  // Counted whether or not the details match, so the limit reveals nothing about the application.
  if (!(await consumeDraftEmailSlot(email))) {
    return { ok: false, error: "Too many link requests. Please try again later." };
  }

  const application = await findSubmittedByReferenceAndEmail(reference, email);
  if (
    application?.profile &&
    (await reserveLinkEmail(application.id, "application_access", email, reference))
  ) {
    const vars = {
      applicantName: application.profile.fullName,
      reference,
      jobTitle: application.job.title,
      confirmationUrl: await issueAccessLink(application.id, reference),
    };
    const message = await overlayEmailTemplate(
      "application_access",
      vars,
      applicationAccessEmail(vars),
      siteConfig.name,
    );
    await deliverEmail({ applicationId: application.id, to: email, allowResend: true, ...message }).catch(
      () => undefined,
    );
  }
  return { ok: true };
}

export async function openApplicationAction(reference: string, token: string) {
  const opened =
    typeof reference === "string" && typeof token === "string" && (await consumeAccessLink(reference, token));
  if (!opened) {
    redirect(`${applicationAccessPath(String(reference))}&link=expired`);
  }
  redirect(confirmationPath(reference));
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
