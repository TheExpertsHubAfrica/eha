import { Prisma } from "@prisma/client";
import type { JobListFacets, JobListQuery, JobOffer } from "@/lib/catalog/types";
import { prisma } from "@/server/db";
import { toJobOffer } from "@/server/mappers";

const published = { status: "published" as const };

const jobInclude = {
  faqs: { orderBy: { sortOrder: "asc" as const } },
  documentRequirements: { orderBy: { sortOrder: "asc" as const } },
  profileSectionRequirements: true,
};

function buildWhere(filters: JobListQuery = {}): Prisma.JobWhereInput {
  const where: Prisma.JobWhereInput = { ...published };

  if (filters.country) where.countryCode = filters.country;
  if (filters.city) where.city = filters.city;
  if (filters.category) where.category = filters.category;
  if (filters.availability) where.availability = filters.availability;
  if (filters.accommodation) where.includesAccommodation = true;
  if (filters.flight) where.includesFlight = true;
  if (filters.visa) where.includesVisaSupport = true;

  if (filters.salaryMin != null || filters.salaryMax != null) {
    where.salaryAmount = {
      ...(filters.salaryMin != null ? { gte: filters.salaryMin } : {}),
      ...(filters.salaryMax != null ? { lte: filters.salaryMax } : {}),
    };
  }

  const q = filters.q?.trim();
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { country: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
      { overview: { contains: q, mode: "insensitive" } },
    ];
  }

  return where;
}

function sortOrder(sort?: JobListQuery["sort"]): Prisma.JobOrderByWithRelationInput[] {
  if (sort === "salary-desc") return [{ salaryAmount: "desc" }, { title: "asc" }];
  if (sort === "salary-asc") return [{ salaryAmount: "asc" }, { title: "asc" }];
  return [{ publishedAt: "desc" }, { createdAt: "desc" }];
}

export async function getFeaturedJobs(): Promise<JobOffer[]> {
  try {
    const rows = await prisma.job.findMany({
      where: { ...published, featured: true },
      include: jobInclude,
      orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
    });
    return rows.map(toJobOffer);
  } catch (error) {
    console.error("getFeaturedJobs: database unavailable", error);
    return [];
  }
}

export async function getPublishedJobs(): Promise<JobOffer[]> {
  const rows = await prisma.job.findMany({
    where: published,
    include: jobInclude,
    orderBy: [{ publishedAt: "desc" }, { title: "asc" }],
  });
  return rows.map(toJobOffer);
}

export async function getJobById(id: string): Promise<JobOffer | undefined> {
  const row = await prisma.job.findFirst({
    where: { ...published, id },
    include: jobInclude,
  });
  return row ? toJobOffer(row) : undefined;
}

export async function getJobByPath(
  citySlug: string,
  slug: string,
): Promise<JobOffer | undefined> {
  const row = await prisma.job.findFirst({
    where: { ...published, citySlug, slug },
    include: jobInclude,
  });
  return row ? toJobOffer(row) : undefined;
}

export async function getRelatedJobs(job: JobOffer, limit = 3): Promise<JobOffer[]> {
  const rows = await prisma.job.findMany({
    where: {
      ...published,
      id: { not: job.id },
      OR: [{ city: job.city }, { category: job.category }],
    },
    include: jobInclude,
    take: limit,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map(toJobOffer);
}

export async function searchJobs(filters: JobListQuery = {}): Promise<JobOffer[]> {
  const rows = await prisma.job.findMany({
    where: buildWhere(filters),
    include: jobInclude,
    orderBy: sortOrder(filters.sort),
  });
  return rows.map(toJobOffer);
}

export async function getJobFacets(): Promise<JobListFacets> {
  const rows = await prisma.job.findMany({
    where: published,
    select: { country: true, countryCode: true, city: true, category: true },
    orderBy: [{ country: "asc" }, { city: "asc" }, { category: "asc" }],
  });

  const countries = new Map<string, string>();
  const cities = new Set<string>();
  const categories = new Set<string>();

  for (const row of rows) {
    countries.set(row.countryCode, row.country);
    cities.add(row.city);
    categories.add(row.category);
  }

  return {
    countries: [...countries.entries()]
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label })),
    cities: [...cities],
    categories: [...categories],
  };
}
