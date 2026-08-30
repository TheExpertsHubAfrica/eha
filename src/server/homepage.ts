import type { JobOffer, StudyDestination, TravelPackage } from "@/lib/catalog/types";
import { getFeaturedStudy, getFeaturedTravel } from "@/server/content";
import { prisma } from "@/server/db";
import { getFeaturedJobs } from "@/server/jobs";
import { safeQuery } from "@/server/safe-query";

export type HomepageTestimonial = {
  id: string;
  quote: string;
  attribution: string;
};

export type HomepageData = {
  jobs: JobOffer[];
  travel: TravelPackage[];
  study: StudyDestination[];
  quotes: HomepageTestimonial[];
};

export async function getHomepageData(): Promise<HomepageData> {
  return safeQuery(
    "getHomepageData",
    async () => {
      const [jobs, travel, study, quotes] = await Promise.all([
        getFeaturedJobs(),
        getFeaturedTravel(),
        getFeaturedStudy(),
        prisma.testimonial.findMany({
          where: { published: true },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
          take: 6,
          select: { id: true, quote: true, attribution: true },
        }),
      ]);

      return { jobs, travel, study, quotes };
    },
    { jobs: [], travel: [], study: [], quotes: [] },
  );
}
