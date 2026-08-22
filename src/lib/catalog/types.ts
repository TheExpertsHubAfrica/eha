export type PublishStatus = "draft" | "published" | "archived";

export type Money = {
  amount: number;
  currency: string;
};

export type JobAvailability = "open" | "limited" | "closed";

export type DocumentRequirement = {
  key: string;
  name: string;
  description: string;
  required: boolean;
  acceptedTypes: string[];
  maxSizeMb: number;
  instructions?: string | null;
};

export type JobOffer = {
  id: string;
  slug: string;
  citySlug: string;
  title: string;
  category: string;
  country: string;
  countryCode: string;
  city: string;
  salary: Money;
  convertedSalary?: Money;
  conversionNote?: string;
  benefits: string[];
  featured: boolean;
  published: boolean;
  availability: JobAvailability;
  publishedAt?: Date | null;
  overview: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  accommodation: string;
  flight: string;
  visa: string;
  workingConditions: string;
  applicationRequirements: string[];
  importantInformation: string[];
  faqs: { question: string; answer: string }[];
  requiredDocuments: string[];
  documentRequirements: DocumentRequirement[];
  requiredProfileSections: string[];
  includesAccommodation: boolean;
  includesFlight: boolean;
  includesVisaSupport: boolean;
};

export type TravelPackage = {
  id: string;
  slug: string;
  destination: string;
  country: string;
  name: string;
  duration: string;
  summary: string;
  featured: boolean;
  published: boolean;
  includes: string[];
  excludes: string[];
  accent: "navy" | "blue" | "teal" | "sand" | "rose";
};

export type StudyDestination = {
  id: string;
  slug: string;
  name: string;
  region: string;
  summary: string;
  featured: boolean;
  published: boolean;
  support: string[];
};

export type JobListQuery = {
  q?: string;
  country?: string;
  city?: string;
  category?: string;
  availability?: JobAvailability;
  salaryMin?: number;
  salaryMax?: number;
  accommodation?: boolean;
  flight?: boolean;
  visa?: boolean;
  sort?: "newest" | "salary-desc" | "salary-asc";
};

export type JobListFacets = {
  countries: { value: string; label: string }[];
  cities: string[];
  categories: string[];
};
