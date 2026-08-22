import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";
import { jobs } from "../src/lib/catalog/jobs";
import { travelPackages } from "../src/lib/catalog/travel";
import { studyDestinations } from "../src/lib/catalog/study";
import { randomBytes, scryptSync } from "node:crypto";

config({ path: ".env.local" });
config({ path: ".env" });

const prisma = new PrismaClient();

function benefitFlags(benefits: string[]) {
  const text = benefits.join(" ").toLowerCase();
  return {
    includesAccommodation: text.includes("accommodation"),
    includesFlight: text.includes("flight"),
    includesVisaSupport: true,
  };
}

function documentKey(name: string) {
  const n = name.toLowerCase();
  if (n.includes("bio")) return "passport_bio";
  if (n.includes("photo")) return "passport_photo";
  if (n.includes("cv") || n.includes("curriculum")) return "cv";
  if (n.includes("yellow")) return "yellow_fever";
  if (n.includes("police") || n.includes("criminal")) return "police_report";
  if (n.includes("transcript")) return "academic_transcript";
  return n.replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function documentMeta(name: string) {
  const key = documentKey(name);
  const pdfOnly = key === "cv" || key === "academic_transcript";
  return {
    key,
    name,
    description: `${name} for this opportunity.`,
    required: true,
    acceptedTypes: pdfOnly ? ["application/pdf"] : ["application/pdf", "image/jpeg", "image/png"],
    maxSizeMb: 5,
    instructions: pdfOnly
      ? "Upload a PDF, maximum 5 MB."
      : "PDF, JPG, or PNG, maximum 5 MB.",
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is missing. Uncomment it in .env.local and paste your Neon connection string.",
    );
  }

  for (const job of jobs) {
    const flags = benefitFlags(job.benefits);
    await prisma.job.upsert({
      where: { id: job.id },
      update: {},
      create: {
        id: job.id,
        slug: job.slug,
        citySlug: job.citySlug,
        title: job.title,
        category: job.category,
        country: job.country,
        countryCode: job.countryCode,
        city: job.city,
        salaryAmount: job.salary.amount,
        salaryCurrency: job.salary.currency,
        convertedAmount: job.convertedSalary?.amount,
        convertedCurrency: job.convertedSalary?.currency,
        conversionNote: job.conversionNote,
        conversionSource: job.convertedSalary ? "indicative_seed" : undefined,
        conversionAt: job.convertedSalary ? new Date() : undefined,
        benefits: job.benefits,
        ...flags,
        featured: job.featured,
        status: job.published ? "published" : "draft",
        availability: job.availability,
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
        publishedAt: job.published ? new Date("2026-08-01T08:00:00.000Z") : null,
        faqs: {
          create: job.faqs.map((faq, index) => ({
            question: faq.question,
            answer: faq.answer,
            sortOrder: index,
          })),
        },
        documentRequirements: {
          create: job.requiredDocuments.map((name, index) => ({
            ...documentMeta(name),
            sortOrder: index,
          })),
        },
        profileSectionRequirements: {
          create: job.requiredProfileSections.map((section) => ({
            section,
            required: true,
          })),
        },
      },
    });
  }

  for (const item of travelPackages) {
    await prisma.travelPackage.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        slug: item.slug,
        destination: item.destination,
        country: item.country,
        name: item.name,
        duration: item.duration,
        summary: item.summary,
        featured: item.featured,
        status: item.published ? "published" : "draft",
        includes: item.includes,
        excludes: item.excludes,
        accent: item.accent,
      },
    });
  }

  for (const item of studyDestinations) {
    await prisma.studyOpportunity.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        slug: item.slug,
        name: item.name,
        region: item.region,
        summary: item.summary,
        featured: item.featured,
        status: item.published ? "published" : "draft",
        support: item.support,
      },
    });
  }

  console.log(
    `Seed complete: ${jobs.length} jobs, ${travelPackages.length} packages, ${studyDestinations.length} study destinations.`,
  );

  if ((await prisma.faqItem.count()) === 0) {
    await prisma.faqItem.createMany({
      data: [
        {
          question: "Do I upload my passport on the homepage?",
          answer:
            "No. Identity documents are requested only after you start an application for a specific opportunity.",
          sortOrder: 0,
          published: true,
        },
        {
          question: "Are jobs and visas guaranteed?",
          answer:
            "We provide placement and visa support subject to eligibility, documentation, and applicable requirements. We do not treat absolute guarantees as legal facts unless a reviewed statement is published for that offer.",
          sortOrder: 1,
          published: true,
        },
        {
          question: "Can I apply for more than one role?",
          answer:
            "You may enquire about more than one opportunity. Duplicate detection will warn you if a similar application already exists; it will not silently reject you.",
          sortOrder: 2,
          published: true,
        },
        {
          question: "How do I get a copy of my work profile?",
          answer:
            "After a successful submission you receive a reference number, a confirmation page, and a printable/PDF work profile. Email delivery is sent when outbound mail is configured.",
          sortOrder: 3,
          published: true,
        },
      ],
    });
    console.log("Default FAQs created.");
  }

  const legalDefaults = [
    {
      slug: "privacy",
      title: "Privacy Policy",
      body: "The Experts Hub Africa collects personal information only as needed to operate this platform: contact enquiries, applications, and the documents required for a selected opportunity.\n\n# What we collect\n\nDepending on the opportunity: identity details, contact information, education and employment history, travel history where relevant, emergency contacts, and supporting documents such as passport copies and CVs.\n\nWe do not require religion or religious sect unless there is a stated operational or legal reason for a specific opportunity.\n\n# Documents\n\nIdentity files are collected inside the application — never on the landing page. They are stored privately and accessed by authorised staff only.\n\n# Contact\n\nQuestions about this notice can be sent through the contact page.",
    },
    {
      slug: "terms",
      title: "Terms & Conditions",
      body: "Listings describe opportunities as currently offered. They are not employment contracts, visa grants, or university offers.\n\nPlacement and visa support, where stated, is subject to eligibility, documentation, employer or institution decisions, and applicable law.\n\nYou are responsible for the accuracy of information you submit. False documents or identity details may result in an application being declined.",
    },
    {
      slug: "cookies",
      title: "Cookie Policy",
      body: "Essential cookies or local storage may be used to keep an application draft, protect forms against abuse, and maintain an admin session. We do not currently place advertising cookies.\n\nPage-view counts used in the admin console are stored without names, emails, or document contents.",
    },
  ];
  for (const page of legalDefaults) {
    await prisma.legalPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
  }

  const emailDefaults = [
    {
      key: "application_received",
      name: "Applicant — application received",
      subject: "Application Received — {{reference}}",
      bodyText:
        "Hello {{applicantName}},\n\nWe have received your application for {{jobTitle}} ({{location}}).\n\nReference: {{reference}}\nSubmitted: {{submittedAt}}\n\nConfirmation: {{confirmationUrl}}\n\nThis is a receipt of your submitted profile — it is not a visa or placement decision.",
    },
    {
      key: "admin_new_application",
      name: "Admin — new application",
      subject: "New Work Application Received — {{reference}}",
      bodyText:
        "A new application was submitted.\n\nReference: {{reference}}\nApplicant: {{applicantName}}\nEmail: {{applicantEmail}}\nPhone: {{phone}}\nOpportunity: {{jobTitle}} — {{location}}\nSubmitted: {{submittedAt}}\n\n{{adminUrl}}",
    },
    {
      key: "application_status_changed",
      name: "Applicant — status update",
      subject: "Application update — {{reference}}",
      bodyText:
        "Hello {{applicantName}},\n\nYour application {{reference}} for {{jobTitle}} is now marked as {{statusLabel}}.\n\n{{confirmationUrl}}\n\nThis is a status update from our team, not a visa or placement decision.",
    },
  ];
  for (const template of emailDefaults) {
    await prisma.emailTemplate.upsert({
      where: { key: template.key },
      update: {},
      create: template,
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    console.log("No admin user created. Set ADMIN_EMAIL and ADMIN_PASSWORD, then re-run seed.");
  } else if (adminPassword.length < 8) {
    console.log("No admin user created. ADMIN_PASSWORD must be at least 8 characters.");
  } else {
    const salt = randomBytes(16);
    const key = scryptSync(adminPassword, salt, 64);
    const passwordHash = `scrypt:${salt.toString("base64url")}:${key.toString("base64url")}`;
    await prisma.adminUser.upsert({
      where: { email: adminEmail },
      update: { passwordHash, active: true, role: "super_admin" },
      create: {
        email: adminEmail,
        name: "Super Admin",
        passwordHash,
        role: "super_admin",
      },
    });
    console.log("Admin user ready.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
