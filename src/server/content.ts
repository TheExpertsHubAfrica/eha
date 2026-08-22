import type { StudyDestination, TravelPackage } from "@/lib/catalog/types";
import { prisma } from "@/server/db";
import { toStudyDestination, toTravelPackage } from "@/server/mappers";

const published = { status: "published" as const };

export async function getFeaturedTravel(): Promise<TravelPackage[]> {
  const rows = await prisma.travelPackage.findMany({
    where: { ...published, featured: true },
    orderBy: { destination: "asc" },
  });
  return rows.map(toTravelPackage);
}

export async function getPublishedTravel(): Promise<TravelPackage[]> {
  const rows = await prisma.travelPackage.findMany({
    where: published,
    orderBy: { destination: "asc" },
  });
  return rows.map(toTravelPackage);
}

export async function getTravelBySlug(slug: string): Promise<TravelPackage | undefined> {
  const row = await prisma.travelPackage.findFirst({
    where: { ...published, slug },
  });
  return row ? toTravelPackage(row) : undefined;
}

export async function getFeaturedStudy(): Promise<StudyDestination[]> {
  const rows = await prisma.studyOpportunity.findMany({
    where: { ...published, featured: true },
    orderBy: { name: "asc" },
  });
  return rows.map(toStudyDestination);
}

export async function getPublishedStudy(): Promise<StudyDestination[]> {
  const rows = await prisma.studyOpportunity.findMany({
    where: published,
    orderBy: { name: "asc" },
  });
  return rows.map(toStudyDestination);
}

export async function getStudyBySlug(slug: string): Promise<StudyDestination | undefined> {
  const row = await prisma.studyOpportunity.findFirst({
    where: { ...published, slug },
  });
  return row ? toStudyDestination(row) : undefined;
}
