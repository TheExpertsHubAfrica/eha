"use server";

import { Prisma, type JobGenderEligibility } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import {
  coverFileFromForm,
  deleteOfferCover,
  shouldRemoveCover,
  uploadOfferCover,
} from "@/server/admin/cover-images";
import { passportPhotoDocumentMeta } from "@/lib/apply/document-requirements";
import { prisma } from "@/server/db";

function lines(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

async function applyCoverUpdate(
  kind: "job" | "travel",
  id: string,
  formData: FormData,
  previousKey: string | null | undefined,
) {
  const file = coverFileFromForm(formData);
  if (file) {
    const uploaded = await uploadOfferCover(kind, id, file, previousKey);
    if (!uploaded.ok) return uploaded;
    if (kind === "job") {
      await prisma.job.update({
        where: { id },
        data: { coverImageKey: uploaded.storageKey, coverImageMime: uploaded.mimeType },
      });
    } else {
      await prisma.travelPackage.update({
        where: { id },
        data: { coverImageKey: uploaded.storageKey, coverImageMime: uploaded.mimeType },
      });
    }
    return { ok: true as const };
  }

  if (shouldRemoveCover(formData) && previousKey) {
    if (kind === "job") {
      await prisma.job.update({
        where: { id },
        data: { coverImageKey: null, coverImageMime: null },
      });
    } else {
      await prisma.travelPackage.update({
        where: { id },
        data: { coverImageKey: null, coverImageMime: null },
      });
    }
    await deleteOfferCover(previousKey);
  }

  return { ok: true as const };
}

export async function saveJobAction(jobId: string | null, formData: FormData) {
  const admin = await requireAdmin("jobs.write");
  const title = String(formData.get("title") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const countryCode = String(formData.get("countryCode") ?? "").trim().toUpperCase();
  const category = String(formData.get("category") ?? "").trim();
  if (!title || !city || !country || countryCode.length !== 2 || !category) {
    return { ok: false as const, error: "Title, city, country, country code and category are required." };
  }

  const slug = slugify(String(formData.get("slug") ?? title));
  const citySlug = slugify(String(formData.get("citySlug") ?? city));
  if (!slug || !citySlug) {
    return { ok: false as const, error: "Slug and city slug must contain letters or numbers." };
  }
  const salaryAmount = Number(formData.get("salaryAmount"));
  const status = String(formData.get("status") ?? "draft") as "draft" | "published" | "archived";
  const existing = jobId
    ? await prisma.job.findUnique({
        where: { id: jobId },
        include: { documentRequirements: true },
      })
    : null;
  if (jobId && !existing) {
    return { ok: false as const, error: "Job not found." };
  }

  const data = {
    title,
    slug,
    citySlug,
    city,
    country,
    countryCode,
    category,
    salaryAmount: Number.isFinite(salaryAmount) ? salaryAmount : 0,
    salaryCurrency: String(formData.get("salaryCurrency") ?? "AED").trim() || "AED",
    overview: String(formData.get("overview") ?? "").trim() || title,
    description: String(formData.get("description") ?? "").trim() || title,
    responsibilities: lines(formData.get("responsibilities")),
    requirements: lines(formData.get("requirements")),
    benefits: lines(formData.get("benefits")),
    accommodation: String(formData.get("accommodation") ?? "").trim() || "To be confirmed.",
    flight: String(formData.get("flight") ?? "").trim() || "To be confirmed.",
    visa: String(formData.get("visa") ?? "").trim() || "Visa support is subject to eligibility.",
    workingConditions: String(formData.get("workingConditions") ?? "").trim() || "To be confirmed.",
    applicationRequirements: lines(formData.get("applicationRequirements")),
    importantInformation: lines(formData.get("importantInformation")),
    featured: formData.get("featured") === "1",
    status,
    availability: (String(formData.get("availability") ?? "open") as "open" | "limited" | "closed"),
    genderEligibility: ((): JobGenderEligibility => {
      const value = String(formData.get("genderEligibility") ?? "both");
      return value === "male" || value === "female" || value === "both" ? value : "both";
    })(),
    includesAccommodation: formData.get("includesAccommodation") === "1",
    includesFlight: formData.get("includesFlight") === "1",
    includesVisaSupport: formData.get("includesVisaSupport") === "1",
    publishedAt:
      status === "published" ? (existing?.publishedAt ?? new Date()) : null,
  };

  const sections = ["education", "workExperience", "travelHistory", "emergencyContact", "militaryHistory"].filter(
    (section) => formData.get(`section_${section}`) === "1",
  );

  let savedId = jobId;
  try {
    if (!savedId) {
      const created = await prisma.job.create({
        data: {
          ...data,
          profileSectionRequirements: {
            create: sections.map((section) => ({ section, required: true })),
          },
          documentRequirements: {
            create: [
              passportPhotoDocumentMeta(0),
              {
                key: "passport_bio",
                name: "Passport bio page",
                description: "Passport bio page for this opportunity.",
                required: true,
                acceptedTypes: ["application/pdf", "image/jpeg", "image/png"],
                maxSizeMb: 5,
                instructions: "PDF, JPG, or PNG, maximum 5 MB.",
                sortOrder: 1,
              },
              {
                key: "cv",
                name: "Curriculum vitae (PDF)",
                description: "Curriculum vitae for this opportunity.",
                required: true,
                acceptedTypes: ["application/pdf"],
                maxSizeMb: 5,
                instructions: "Upload a PDF, maximum 5 MB.",
                sortOrder: 2,
              },
            ],
          },
        },
      });
      savedId = created.id;
    } else {
      await prisma.$transaction([
        prisma.job.update({ where: { id: savedId }, data }),
        prisma.jobProfileSectionRequirement.deleteMany({ where: { jobId: savedId } }),
        prisma.jobProfileSectionRequirement.createMany({
          data: sections.map((section) => ({ jobId: savedId as string, section, required: true })),
        }),
        ...((existing?.documentRequirements ?? []).map((req) =>
          prisma.jobDocumentRequirement.update({
            where: { id: req.id },
            data: { required: formData.get(`docRequired_${req.key}`) === "1" },
          }),
        )),
      ]);
    }
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { ok: false as const, error: "A job with this city and slug already exists." };
    }
    throw error;
  }

  const coverResult = await applyCoverUpdate("job", savedId!, formData, existing?.coverImageKey);
  if (!coverResult.ok) {
    return { ok: false as const, error: coverResult.error };
  }

  await writeAdminAudit({
    actorId: admin.id,
    action: jobId ? "job.update" : "job.create",
    targetType: "Job",
    targetId: savedId,
    metadata: { status: data.status, featured: data.featured },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/work-abroad");
  revalidatePath("/");
  redirect(`/admin/jobs/${savedId}`);
}

export async function saveTravelAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("travel.write");
  const name = String(formData.get("name") ?? "").trim();
  const destination = String(formData.get("destination") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  if (!name || !destination || !country) {
    return { ok: false as const, error: "Name, destination and country are required." };
  }
  const payload = {
    name,
    destination,
    country,
    slug: slugify(String(formData.get("slug") ?? destination)),
    duration: String(formData.get("duration") ?? "").trim() || "Flexible",
    summary: String(formData.get("summary") ?? "").trim() || name,
    includes: lines(formData.get("includes")),
    excludes: lines(formData.get("excludes")),
    featured: formData.get("featured") === "1",
    status: (String(formData.get("status") ?? "draft") as "draft" | "published" | "archived"),
    accent: (String(formData.get("accent") ?? "navy") as "navy" | "blue" | "teal" | "sand" | "rose"),
  };
  if (!payload.slug) {
    return { ok: false as const, error: "Slug must contain letters or numbers." };
  }
  try {
    const existing = id
      ? await prisma.travelPackage.findUnique({
          where: { id },
          select: { coverImageKey: true },
        })
      : null;
    if (id && !existing) {
      return { ok: false as const, error: "Travel package not found." };
    }

    const saved = id
      ? await prisma.travelPackage.update({ where: { id }, data: payload })
      : await prisma.travelPackage.create({ data: payload });

    const coverResult = await applyCoverUpdate("travel", saved.id, formData, existing?.coverImageKey);
    if (!coverResult.ok) {
      return { ok: false as const, error: coverResult.error };
    }

    await writeAdminAudit({
      actorId: admin.id,
      action: id ? "travel.update" : "travel.create",
      targetType: "TravelPackage",
      targetId: saved.id,
    });
    revalidatePath("/admin/travel");
    revalidatePath("/travel");
    revalidatePath(`/travel/${saved.slug}`);
    revalidatePath("/");
    redirect(`/admin/travel/${saved.id}`);
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { ok: false as const, error: "A travel package with this slug already exists." };
    }
    throw error;
  }
}

export async function saveStudyAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("study.write");
  const name = String(formData.get("name") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  if (!name || !region) return { ok: false as const, error: "Name and region are required." };
  const payload = {
    name,
    region,
    slug: slugify(String(formData.get("slug") ?? name)),
    summary: String(formData.get("summary") ?? "").trim() || name,
    support: lines(formData.get("support")),
    featured: formData.get("featured") === "1",
    status: (String(formData.get("status") ?? "draft") as "draft" | "published" | "archived"),
  };
  if (!payload.slug) {
    return { ok: false as const, error: "Slug must contain letters or numbers." };
  }
  try {
    const saved = id
      ? await prisma.studyOpportunity.update({ where: { id }, data: payload })
      : await prisma.studyOpportunity.create({ data: payload });
    await writeAdminAudit({
      actorId: admin.id,
      action: id ? "study.update" : "study.create",
      targetType: "StudyOpportunity",
      targetId: saved.id,
    });
    revalidatePath("/admin/study");
    revalidatePath("/study-abroad");
    revalidatePath("/");
    redirect(`/admin/study/${saved.id}`);
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { ok: false as const, error: "A study destination with this slug already exists." };
    }
    throw error;
  }
}
