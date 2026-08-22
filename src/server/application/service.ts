import type { Prisma } from "@prisma/client";
import type { JobOffer } from "@/lib/catalog/types";
import {
  applyPath,
  canAccessStep,
  getFirstIncompleteStep,
  jobRequiresEmergency,
  jobRequiresMilitary,
  jobRequiresTravel,
  jobRequiresUaeContact,
  type ApplyStepId,
} from "@/lib/apply/steps";
import { confirmationPath } from "@/lib/apply/reference";
import { missingRequiredDocuments } from "@/lib/apply/documents";
import { createDraftToken, hashDraftToken } from "@/lib/apply/token";
import { parseDateOnly } from "@/lib/utils";
import type {
  EducationInput,
  EmploymentInput,
  PersonalInput,
  SupportingInput,
} from "@/lib/validation/application";
import {
  stripEmptyDependants,
  supportingSchema,
  supportingSchemaForJob,
} from "@/lib/validation/application";
import { prisma } from "@/server/db";
import { recordEvent } from "@/server/analytics/events";
import { readDraftToken, writeDraftToken } from "@/server/application/cookies";
import { toJobOffer } from "@/server/mappers";

const draftInclude = {
  profile: true,
  education: { orderBy: { sortOrder: "asc" as const } },
  employment: { orderBy: { sortOrder: "asc" as const } },
  travelHistory: { orderBy: { sortOrder: "asc" as const } },
  dependants: { orderBy: { sortOrder: "asc" as const } },
  emergencyContacts: { orderBy: { sortOrder: "asc" as const } },
  military: true,
  documents: { orderBy: { createdAt: "asc" as const } },
  job: {
    include: {
      faqs: { orderBy: { sortOrder: "asc" as const } },
      documentRequirements: { orderBy: { sortOrder: "asc" as const } },
      profileSectionRequirements: true,
    },
  },
} satisfies Prisma.ApplicationInclude;

export type DraftApplication = Prisma.ApplicationGetPayload<{
  include: typeof draftInclude;
}>;

function empty(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function draftJob(draft: DraftApplication): JobOffer {
  return toJobOffer(draft.job);
}

export async function startOrResumeApplication(job: JobOffer) {
  const existingToken = await readDraftToken(job.id);
  if (existingToken) {
    const session = await findApplicationByToken(job.id, existingToken);
    if (session?.status !== "draft" && session?.referenceNumber) {
      return { draft: session, redirectTo: confirmationPath(session.referenceNumber) };
    }
    if (session && session.status === "draft" && session.expiresAt > new Date()) {
      const next = getFirstIncompleteStep(job, session.stepsCompleted);
      return { draft: session, redirectTo: applyPath(job.id, next.id) };
    }
  }

  const token = createDraftToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const draft = await prisma.application.create({
    data: {
      tokenHash: hashDraftToken(token),
      jobId: job.id,
      expiresAt,
      statusHistory: {
        create: { toStatus: "draft", note: "Application draft created" },
      },
    },
    include: draftInclude,
  });
  await recordEvent({ name: "application_started", targetType: "Job", targetId: job.id });
  await writeDraftToken(job.id, token);
  return { draft, redirectTo: applyPath(job.id, "personal") };
}

export async function loadApplicationSession(jobId: string) {
  const token = await readDraftToken(jobId);
  if (!token) return null;
  return findApplicationByToken(jobId, token);
}

export async function loadDraftForJob(jobId: string) {
  const session = await loadApplicationSession(jobId);
  if (!session || session.status !== "draft") return null;
  if (session.expiresAt < new Date()) return null;
  return session;
}

export async function loadSubmittedForJob(jobId: string) {
  const session = await loadApplicationSession(jobId);
  if (!session || session.status === "draft" || !session.referenceNumber) return null;
  return session;
}

async function findApplicationByToken(jobId: string, token: string) {
  return prisma.application.findFirst({
    where: { jobId, tokenHash: hashDraftToken(token) },
    include: draftInclude,
  });
}

export async function requireDraftStep(jobId: string, step: ApplyStepId) {
  const session = await loadApplicationSession(jobId);
  if (!session) {
    return { ok: false as const, redirectTo: applyPath(jobId) };
  }
  if (session.status !== "draft" && session.referenceNumber) {
    return { ok: false as const, redirectTo: confirmationPath(session.referenceNumber) };
  }
  const draft = session.status === "draft" && session.expiresAt > new Date() ? session : null;
  if (!draft) {
    return { ok: false as const, redirectTo: applyPath(jobId) };
  }
  const job = draftJob(draft);
  if (draft.job.status !== "published" || draft.job.availability !== "open") {
    return { ok: false as const, redirectTo: `/apply/${jobId}/unavailable` };
  }
  if (!canAccessStep(job, draft.stepsCompleted, step)) {
    const next = getFirstIncompleteStep(job, draft.stepsCompleted);
    return { ok: false as const, redirectTo: applyPath(jobId, next.id), draft };
  }
  if (step === "review" && missingRequiredDocuments(job, draft.documents).length > 0) {
    return { ok: false as const, redirectTo: applyPath(jobId, "documents"), draft };
  }
  return { ok: true as const, draft, job };
}

async function markStep(applicationId: string, step: ApplyStepId, completed: string[]) {
  const steps = Array.from(new Set([...completed, step]));
  await prisma.application.update({
    where: { id: applicationId },
    data: { currentStep: step, stepsCompleted: steps },
  });
  return steps;
}

export async function savePersonal(job: JobOffer, draftId: string, input: PersonalInput) {
  await prisma.applicantProfile.upsert({
    where: { applicationId: draftId },
    create: {
      applicationId: draftId,
      fullName: input.fullName,
      dateOfBirth: parseDateOnly(input.dateOfBirth),
      placeOfBirth: input.placeOfBirth,
      nationality: input.nationality,
      passportNumber: input.passportNumber.toUpperCase(),
      previousNationality: empty(input.previousNationality),
      maritalStatus: input.maritalStatus,
      phone: input.phone,
      email: input.email.toLowerCase(),
      countryOfResidence: input.countryOfResidence,
      currentCity: input.currentCity,
      spouseName: input.maritalStatus === "married" ? empty(input.spouseName) : null,
      spouseNationality:
        input.maritalStatus === "married" ? empty(input.spouseNationality) : null,
      spousePlaceOfBirth:
        input.maritalStatus === "married" ? empty(input.spousePlaceOfBirth) : null,
      spouseDateOfBirth:
        input.maritalStatus === "married" && input.spouseDateOfBirth
          ? parseDateOnly(input.spouseDateOfBirth)
          : null,
    },
    update: {
      fullName: input.fullName,
      dateOfBirth: parseDateOnly(input.dateOfBirth),
      placeOfBirth: input.placeOfBirth,
      nationality: input.nationality,
      passportNumber: input.passportNumber.toUpperCase(),
      previousNationality: empty(input.previousNationality),
      maritalStatus: input.maritalStatus,
      phone: input.phone,
      email: input.email.toLowerCase(),
      countryOfResidence: input.countryOfResidence,
      currentCity: input.currentCity,
      spouseName: input.maritalStatus === "married" ? empty(input.spouseName) : null,
      spouseNationality:
        input.maritalStatus === "married" ? empty(input.spouseNationality) : null,
      spousePlaceOfBirth:
        input.maritalStatus === "married" ? empty(input.spousePlaceOfBirth) : null,
      spouseDateOfBirth:
        input.maritalStatus === "married" && input.spouseDateOfBirth
          ? parseDateOnly(input.spouseDateOfBirth)
          : null,
    },
  });
  const draft = await prisma.application.findUniqueOrThrow({ where: { id: draftId } });
  const steps = await markStep(draftId, "personal", draft.stepsCompleted);
  return applyPath(job.id, getFirstIncompleteStep(job, steps).id);
}

export async function saveEducation(job: JobOffer, draftId: string, input: EducationInput) {
  await prisma.$transaction([
    prisma.educationRecord.deleteMany({ where: { applicationId: draftId } }),
    prisma.educationRecord.createMany({
      data: input.records.map((record, index) => ({
        applicationId: draftId,
        qualification: record.qualification,
        institution: record.institution,
        programme: empty(record.programme),
        graduationYear: record.graduationYear ? Number(record.graduationYear) : null,
        languages: empty(record.languages),
        certifications: empty(record.certifications),
        sortOrder: index,
      })),
    }),
  ]);
  const draft = await prisma.application.findUniqueOrThrow({ where: { id: draftId } });
  const steps = await markStep(draftId, "education", draft.stepsCompleted);
  return applyPath(job.id, getFirstIncompleteStep(job, steps).id);
}

export async function saveEmployment(job: JobOffer, draftId: string, input: EmploymentInput) {
  await prisma.$transaction([
    prisma.employmentRecord.deleteMany({ where: { applicationId: draftId } }),
    ...input.records.map((record, index) =>
      prisma.employmentRecord.create({
        data: {
          applicationId: draftId,
          employer: record.employer,
          position: record.position,
          country: record.country,
          startDate: parseDateOnly(record.startDate),
          endDate: record.current || !record.endDate ? null : parseDateOnly(record.endDate),
          current: record.current,
          responsibilities: record.responsibilities,
          reasonForLeaving: record.current ? null : empty(record.reasonForLeaving),
          sortOrder: index,
        },
      }),
    ),
  ]);
  const draft = await prisma.application.findUniqueOrThrow({ where: { id: draftId } });
  const steps = await markStep(draftId, "work", draft.stepsCompleted);
  return applyPath(job.id, getFirstIncompleteStep(job, steps).id);
}

function parseSupportingForJob(job: JobOffer, input: SupportingInput) {
  const parsed = supportingSchemaForJob({
    requireTravel: jobRequiresTravel(job),
    requireEmergency: jobRequiresEmergency(job),
    requireMilitary: jobRequiresMilitary(job),
  }).safeParse({
    ...input,
    dependants: stripEmptyDependants(input.dependants),
  });
  if (!parsed.success) return parsed;
  return {
    success: true as const,
    data: { ...parsed.data, dependants: stripEmptyDependants(parsed.data.dependants) },
  };
}

export async function saveSupporting(job: JobOffer, draftId: string, input: SupportingInput) {
  const parsed = parseSupportingForJob(job, input);
  if (!parsed.success) {
    return { ok: false as const, issues: parsed.error.issues };
  }
  const data = parsed.data;

  await prisma.$transaction(async (tx) => {
    await tx.applicantProfile.update({
      where: { applicationId: draftId },
      data: {
        visitedAbroad: data.visitedAbroad,
        militaryService: jobRequiresMilitary(job) ? data.militaryService : false,
        personalStatement: data.personalStatement,
      },
    });

    await tx.travelHistoryRecord.deleteMany({ where: { applicationId: draftId } });
    if (data.visitedAbroad) {
      await tx.travelHistoryRecord.createMany({
        data: data.travel.map((record, index) => ({
          applicationId: draftId,
          country: record.country,
          purpose: record.purpose,
          year: Number(record.year),
          duration: record.duration,
          sortOrder: index,
        })),
      });
    }

    await tx.dependantRecord.deleteMany({ where: { applicationId: draftId } });
    if (data.dependants.length > 0) {
      await tx.dependantRecord.createMany({
        data: data.dependants.map((record, index) => ({
          applicationId: draftId,
          fullName: record.fullName,
          dateOfBirth: parseDateOnly(record.dateOfBirth),
          relationship: record.relationship,
          sortOrder: index,
        })),
      });
    }

    await tx.emergencyContact.deleteMany({ where: { applicationId: draftId } });
    if (jobRequiresEmergency(job) && data.emergencyName) {
      await tx.emergencyContact.create({
        data: {
          applicationId: draftId,
          name: data.emergencyName,
          relationship: data.emergencyRelationship || "",
          phone: data.emergencyPhone || "",
          email: empty(data.emergencyEmail),
          country: data.emergencyCountry || "",
          city: data.emergencyCity || "",
          kind: "home",
          sortOrder: 0,
        },
      });
    }
    if (jobRequiresUaeContact(job) && data.uaeName?.trim()) {
      await tx.emergencyContact.create({
        data: {
          applicationId: draftId,
          name: data.uaeName,
          relationship: "UAE contact",
          phone: data.uaePhone || "",
          email: null,
          country: "United Arab Emirates",
          city: data.uaeWorkplace || "",
          kind: "uae",
          sortOrder: 1,
        },
      });
    }

    await tx.militaryRecord.deleteMany({ where: { applicationId: draftId } });
    if (jobRequiresMilitary(job) && data.militaryService) {
      await tx.militaryRecord.create({
        data: {
          applicationId: draftId,
          country: data.militaryCountry || "",
          serviceType: data.militaryType || "",
          rank: empty(data.militaryRank),
          duration: data.militaryDuration || "",
        },
      });
    }
  });

  const draft = await prisma.application.findUniqueOrThrow({ where: { id: draftId } });
  const steps = await markStep(draftId, "supporting", draft.stepsCompleted);
  const next = getFirstIncompleteStep(job, steps);
  await prisma.application.update({
    where: { id: draftId },
    data: { profileCompletedAt: new Date(), currentStep: next.id },
  });
  return { ok: true as const, redirectTo: applyPath(job.id, next.id) };
}

export async function findSimilarDrafts(jobId: string, email: string, passportNumber: string, excludeId: string) {
  return prisma.application.findMany({
    where: {
      id: { not: excludeId },
      jobId,
      status: { in: ["draft", "submitted", "under_review"] },
      profile: {
        OR: [
          { email: email.toLowerCase() },
          { passportNumber: passportNumber.toUpperCase() },
        ],
      },
    },
    select: { id: true, status: true, createdAt: true },
    take: 3,
  });
}
