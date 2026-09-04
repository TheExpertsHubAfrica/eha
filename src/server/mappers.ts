import type {
  Job,
  JobDocumentRequirement,
  JobFaq,
  JobProfileSectionRequirement,
  StudyOpportunity,
  TravelPackage as DbTravelPackage,
} from "@prisma/client";
import type { JobOffer, StudyDestination, TravelPackage } from "@/lib/catalog/types";
import { offerCoverUrl } from "@/lib/covers";

function money(amount: unknown, currency: string) {
  return { amount: Number(amount), currency };
}

type JobRecord = Job & {
  faqs: JobFaq[];
  documentRequirements: JobDocumentRequirement[];
  profileSectionRequirements: JobProfileSectionRequirement[];
};

function compareDocumentRequirements(
  a: Pick<JobDocumentRequirement, "key" | "sortOrder">,
  b: Pick<JobDocumentRequirement, "key" | "sortOrder">,
) {
  if (a.key === "passport_photo" && b.key !== "passport_photo") return -1;
  if (b.key === "passport_photo" && a.key !== "passport_photo") return 1;
  return a.sortOrder - b.sortOrder;
}

export function toJobOffer(job: JobRecord): JobOffer {
  return {
    id: job.id,
    slug: job.slug,
    citySlug: job.citySlug,
    title: job.title,
    category: job.category,
    country: job.country,
    countryCode: job.countryCode,
    city: job.city,
    salary: money(job.salaryAmount, job.salaryCurrency),
    convertedSalary:
      job.convertedAmount != null && job.convertedCurrency
        ? money(job.convertedAmount, job.convertedCurrency)
        : undefined,
    conversionNote: job.conversionNote ?? undefined,
    benefits: job.benefits,
    featured: job.featured,
    published: job.status === "published",
    availability: job.availability,
    publishedAt: job.publishedAt,
    overview: job.overview,
    description: job.description,
    responsibilities: job.responsibilities,
    requirements: job.requirements,
    accommodation: job.accommodation,
    flight: job.flight,
    visa: job.visa,
    workingConditions: job.workingConditions,
    applicationRequirements: job.applicationRequirements,
    importantInformation: job.importantInformation,
    faqs: [...job.faqs]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((faq) => ({ question: faq.question, answer: faq.answer })),
    requiredDocuments: [...job.documentRequirements]
      .sort((a, b) => compareDocumentRequirements(a, b))
      .map((doc) => doc.name),
    documentRequirements: [...job.documentRequirements]
      .sort((a, b) => compareDocumentRequirements(a, b))
      .map((doc) => ({
        key: doc.key,
        name: doc.name,
        description: doc.description,
        required: doc.required,
        acceptedTypes: doc.acceptedTypes,
        maxSizeMb: doc.maxSizeMb,
        instructions: doc.instructions,
      })),
    requiredProfileSections: job.profileSectionRequirements.map((item) => item.section),
    includesAccommodation: job.includesAccommodation,
    includesFlight: job.includesFlight,
    includesVisaSupport: job.includesVisaSupport,
    coverImageUrl: job.coverImageKey ? offerCoverUrl("job", job.id) : null,
  };
}

export function toTravelPackage(item: DbTravelPackage): TravelPackage {
  return {
    id: item.id,
    slug: item.slug,
    destination: item.destination,
    country: item.country,
    name: item.name,
    duration: item.duration,
    summary: item.summary,
    featured: item.featured,
    published: item.status === "published",
    includes: item.includes,
    excludes: item.excludes,
    accent: item.accent,
    coverImageUrl: item.coverImageKey ? offerCoverUrl("travel", item.id) : null,
  };
}

export function toStudyDestination(item: StudyOpportunity): StudyDestination {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    region: item.region,
    summary: item.summary,
    featured: item.featured,
    published: item.status === "published",
    support: item.support,
  };
}
