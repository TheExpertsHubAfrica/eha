import type { StudyDestination, TravelPackage } from "@/lib/catalog/types";
import { prisma } from "@/server/db";
import { toStudyDestination, toTravelPackage } from "@/server/mappers";

const published = { status: "published" as const };

async function safeQuery<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.error(`${label}: database unavailable`, error);
    return fallback;
  }
}

export async function getFeaturedTravel(): Promise<TravelPackage[]> {
  return safeQuery(
    "getFeaturedTravel",
    async () => {
      const rows = await prisma.travelPackage.findMany({
        where: { ...published, featured: true },
        orderBy: { destination: "asc" },
        take: 4,
      });
      return rows.map(toTravelPackage);
    },
    [],
  );
}

export async function getPublishedTravel(): Promise<TravelPackage[]> {
  return safeQuery(
    "getPublishedTravel",
    async () => {
      const rows = await prisma.travelPackage.findMany({
        where: published,
        orderBy: { destination: "asc" },
      });
      return rows.map(toTravelPackage);
    },
    [],
  );
}

export async function getTravelBySlug(slug: string): Promise<TravelPackage | undefined> {
  return safeQuery(
    "getTravelBySlug",
    async () => {
      const row = await prisma.travelPackage.findFirst({
        where: { ...published, slug },
      });
      return row ? toTravelPackage(row) : undefined;
    },
    undefined,
  );
}

export async function getFeaturedStudy(): Promise<StudyDestination[]> {
  return safeQuery(
    "getFeaturedStudy",
    async () => {
      const rows = await prisma.studyOpportunity.findMany({
        where: { ...published, featured: true },
        orderBy: { name: "asc" },
      });
      return rows.map(toStudyDestination);
    },
    [],
  );
}

export async function getPublishedStudy(): Promise<StudyDestination[]> {
  return safeQuery(
    "getPublishedStudy",
    async () => {
      const rows = await prisma.studyOpportunity.findMany({
        where: published,
        orderBy: { name: "asc" },
      });
      return rows.map(toStudyDestination);
    },
    [],
  );
}

export async function getStudyBySlug(slug: string): Promise<StudyDestination | undefined> {
  return safeQuery(
    "getStudyBySlug",
    async () => {
      const row = await prisma.studyOpportunity.findFirst({
        where: { ...published, slug },
      });
      return row ? toStudyDestination(row) : undefined;
    },
    undefined,
  );
}
