function jobPath(job: { citySlug: string; slug: string }) {
  return `/work-abroad/${job.citySlug}/${job.slug}`;
}

function applyHref(job: { id: string }) {
  return `/apply/${job.id}`;
}

function travelPath(item: { slug: string }) {
  return `/travel/${item.slug}`;
}

function studyPath(item: { slug: string }) {
  return `/study-abroad/${item.slug}`;
}

export { jobPath, applyHref, travelPath, studyPath };

export {
  getFeaturedJobs,
  getPublishedJobs,
  getJobByPath,
  getJobById,
  getRelatedJobs,
  searchJobs,
  getJobFacets,
} from "@/server/jobs";

export {
  getFeaturedTravel,
  getPublishedTravel,
  getTravelBySlug,
  getFeaturedStudy,
  getPublishedStudy,
  getStudyBySlug,
} from "@/server/content";

export type {
  JobOffer,
  TravelPackage,
  StudyDestination,
  JobListQuery,
  JobListFacets,
} from "@/lib/catalog/types";
