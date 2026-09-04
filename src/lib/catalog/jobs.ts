import { defaultDisclaimer } from "@/lib/site-config";
import type { JobOffer } from "@/lib/catalog/types";

type SeedJob = Omit<
  JobOffer,
  | "includesAccommodation"
  | "includesFlight"
  | "includesVisaSupport"
  | "publishedAt"
  | "documentRequirements"
>;

const dubaiDocs = [
  "Passport-size photograph",
  "Passport bio page",
  "Curriculum vitae (PDF)",
];

const dubaiProfile = [
  "education",
  "workExperience",
  "travelHistory",
  "emergencyContact",
];

export const jobs: SeedJob[] = [
  {
    id: "job_factory_worker_dubai",
    slug: "factory-worker",
    citySlug: "dubai",
    title: "Factory Worker",
    category: "Manufacturing",
    country: "United Arab Emirates",
    countryCode: "AE",
    city: "Dubai",
    salary: { amount: 1500, currency: "AED" },
    convertedSalary: { amount: 4800, currency: "GHS" },
    conversionNote:
      "The Ghana cedi figure is indicative only and may change. Confirm the current display rate with our team before you apply.",
    benefits: [
      "Flight included",
      "Accommodation included",
      "UAE card included",
      "Allowances included",
    ],
    featured: true,
    published: true,
    availability: "open",
    overview:
      "A structured manufacturing placement in Dubai for applicants ready to work in a production environment with on-the-ground support for travel, housing and documentation.",
    description:
      "Factory placements involve shift-based production work. Exact site, shift pattern and task mix are confirmed during processing. This listing describes the opportunity as currently offered through The Experts Hub Africa — it is not an employment contract.",
    responsibilities: [
      "Carry out assigned production or packing tasks to the employer’s safety and quality standards.",
      "Follow workplace instructions, attendance rules and protective equipment requirements.",
      "Keep work areas orderly and report hazards or equipment issues promptly.",
      "Work collaboratively with supervisors and teammates on shift.",
    ],
    requirements: [
      "Valid passport with sufficient remaining validity for processing.",
      "Fitness for physical, shift-based factory work.",
      "Willingness to complete medical, visa and onboarding checks as required.",
      "Clear, complete application documents submitted through this platform.",
    ],
    accommodation: "Shared staff accommodation is included, as arranged for this placement.",
    flight: "A placement-related flight is included, subject to processing timelines and ticket rules.",
    visa: defaultDisclaimer,
    workingConditions:
      "Expect structured shifts in an industrial setting. Specific hours, overtime policy and site rules are confirmed before travel.",
    applicationRequirements: [
      "Complete the work profile steps when the application portal opens for this offer.",
      "Upload the documents listed for this opportunity.",
      "Review and confirm accuracy before submission.",
    ],
    importantInformation: [
      defaultDisclaimer,
      "Do not pay unnamed third parties who contact you outside this website or our published contact channels.",
      "Yellow fever, police, or additional documents are only requested when this opportunity requires them.",
    ],
    faqs: [
      {
        question: "Is a job and visa guaranteed?",
        answer: defaultDisclaimer,
      },
      {
        question: "What documents do I need?",
        answer:
          "For this offer: passport bio page, passport-size photograph on a white background and a PDF CV. Additional documents may be requested after review.",
      },
      {
        question: "When should I upload documents?",
        answer:
          "Only after you start an application for a specific opportunity. Documents are not collected on the homepage.",
      },
    ],
    requiredDocuments: dubaiDocs,
    requiredProfileSections: dubaiProfile,
  },
  {
    id: "job_sales_assistant_dubai",
    slug: "sales-assistant",
    citySlug: "dubai",
    title: "Sales Assistant",
    category: "Retail",
    country: "United Arab Emirates",
    countryCode: "AE",
    city: "Dubai",
    salary: { amount: 1000, currency: "AED" },
    convertedSalary: { amount: 3600, currency: "GHS" },
    conversionNote:
      "The Ghana cedi figure is indicative only and may change. Confirm the current display rate with our team before you apply.",
    benefits: [
      "Flight included",
      "Accommodation included",
      "UAE card included",
      "Allowances included",
    ],
    featured: true,
    published: true,
    availability: "open",
    overview:
      "A customer-facing retail placement in Dubai for applicants who communicate clearly, present well and can support day-to-day store operations.",
    description:
      "Sales assistant roles typically involve helping customers, keeping displays in order and supporting checkout or floor operations. The employer and exact location are confirmed during processing.",
    responsibilities: [
      "Greet customers and help them find products.",
      "Support stock, merchandising and store presentation standards.",
      "Follow cash-handling and inventory procedures where assigned.",
      "Uphold the employer’s service and attendance expectations.",
    ],
    requirements: [
      "Valid passport with sufficient remaining validity for processing.",
      "Comfortable communicating with customers in English.",
      "Willingness to stand for extended periods and work retail hours, including weekends where required.",
      "Complete application documents submitted through this platform.",
    ],
    accommodation: "Shared staff accommodation is included, as arranged for this placement.",
    flight: "A placement-related flight is included, subject to processing timelines and ticket rules.",
    visa: defaultDisclaimer,
    workingConditions:
      "Retail hours often include weekends and peak trading periods. Uniform or dress standards may apply.",
    applicationRequirements: [
      "Complete the work profile for this opportunity.",
      "Upload the listed documents.",
      "Be available for follow-up questions from our team.",
    ],
    importantInformation: [
      defaultDisclaimer,
      "Use only the contact details published on this website.",
    ],
    faqs: [
      {
        question: "Do I need prior retail experience?",
        answer:
          "Retail experience is helpful but not always required. Your work profile should describe relevant customer service or sales experience clearly.",
      },
      {
        question: "How is salary paid?",
        answer:
          "Pay currency and cycle are confirmed with the offer terms during processing. Figures on this page are the current listed amounts.",
      },
    ],
    requiredDocuments: dubaiDocs,
    requiredProfileSections: dubaiProfile,
  },
  {
    id: "job_security_guard_dubai",
    slug: "security-guard",
    citySlug: "dubai",
    title: "Security Guard",
    category: "Security",
    country: "United Arab Emirates",
    countryCode: "AE",
    city: "Dubai",
    salary: { amount: 2200, currency: "AED" },
    benefits: [
      "Flight included",
      "Accommodation included",
      "UAE card included",
      "Allowances included",
    ],
    featured: true,
    published: true,
    availability: "open",
    overview:
      "A security placement in Dubai for disciplined applicants able to keep watch, follow post orders and represent a professional standard on site.",
    description:
      "Security roles are typically rostered posts with clear procedures. Licensing, medical and background checks may apply. We will only ask for additional history or documents when this offer requires them.",
    responsibilities: [
      "Maintain a visible, professional presence at the assigned post.",
      "Follow access-control, patrol and incident-reporting procedures.",
      "Escalate concerns according to site instructions.",
      "Protect people and property without exceeding assigned authority.",
    ],
    requirements: [
      "Valid passport with sufficient remaining validity for processing.",
      "Fitness for standing or walking posts and shift work.",
      "Willingness to complete background, medical and licensing steps if required.",
      "A clear work profile and the documents listed for this opportunity.",
    ],
    accommodation: "Shared staff accommodation is included, as arranged for this placement.",
    flight: "A placement-related flight is included, subject to processing timelines and ticket rules.",
    visa: defaultDisclaimer,
    workingConditions:
      "Shifts may include nights, weekends and public holidays. Post orders and uniform standards are set by the employer.",
    applicationRequirements: [
      "Complete the work profile, including relevant experience.",
      "Upload required identity and CV documents.",
      "Provide additional security-related documents only if requested for this offer.",
    ],
    importantInformation: [
      defaultDisclaimer,
      "Military or police history is only requested when this opportunity requires it.",
    ],
    faqs: [
      {
        question: "Will I need a police report?",
        answer:
          "Only if this opportunity is configured to require one. If it is required, the application will ask for it during the document step — not on the homepage.",
      },
      {
        question: "Is prior security experience mandatory?",
        answer:
          "Helpful, but not always mandatory. Describe relevant experience, training, or discipline clearly in your profile.",
      },
    ],
    requiredDocuments: dubaiDocs,
    requiredProfileSections: [...dubaiProfile, "militaryHistory"],
  },
];
