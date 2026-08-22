import type { StudyDestination } from "@/lib/catalog/types";

export const studyDestinations: StudyDestination[] = [
  {
    id: "study_canada",
    slug: "canada",
    name: "Canada",
    region: "North America",
    summary:
      "Admission and visa guidance for applicants exploring Canadian colleges and universities.",
    featured: true,
    published: true,
    support: [
      "Programme shortlisting support",
      "Application document guidance",
      "Admission process assistance",
      "Study-permit guidance",
    ],
  },
  {
    id: "study_united-states",
    slug: "united-states",
    name: "United States",
    region: "North America",
    summary:
      "Structured help for US applications, including document preparation and visa-process orientation.",
    featured: true,
    published: true,
    support: [
      "Application guidance",
      "Document checklists",
      "Admission process assistance",
      "Visa interview preparation support",
    ],
  },
  {
    id: "study_united-kingdom",
    slug: "united-kingdom",
    name: "United Kingdom",
    region: "Europe",
    summary:
      "Support for UK study pathways, from course selection through to visa documentation.",
    featured: true,
    published: true,
    support: [
      "Course and intake guidance",
      "Application assistance",
      "CAS and document orientation",
      "Student-visa guidance",
    ],
  },
  {
    id: "study_schengen",
    slug: "schengen",
    name: "Schengen / Europe",
    region: "Europe",
    summary:
      "Assistance for selected European study destinations, including admission and visa document guidance.",
    featured: true,
    published: true,
    support: [
      "Destination and programme guidance",
      "Admission assistance",
      "Visa document orientation",
      "Pre-departure briefing",
    ],
  },
];
