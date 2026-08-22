import type { Metadata } from "next";
import Link from "next/link";
import { AdminJobForm } from "@/components/admin/job-form";
import { requireAdmin } from "@/server/admin/auth";

export const metadata: Metadata = {
  title: "New job",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminNewJobPage() {
  await requireAdmin("jobs.write");
  return (
    <div>
      <Link href="/admin/jobs" className="text-sm text-blue hover:underline">
        Back to jobs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-navy">New job</h1>
      <p className="mt-1 mb-6 text-sm text-muted">Fields match the live job record. There is no image gallery in this phase.</p>
      <AdminJobForm
        job={{
          title: "",
          slug: "",
          citySlug: "",
          city: "",
          country: "",
          countryCode: "",
          category: "",
          salaryAmount: "",
          salaryCurrency: "AED",
          overview: "",
          description: "",
          responsibilities: "",
          requirements: "",
          benefits: "",
          accommodation: "",
          flight: "",
          visa: "",
          workingConditions: "",
          applicationRequirements: "",
          importantInformation: "",
          featured: false,
          status: "draft",
          availability: "open",
          includesAccommodation: false,
          includesFlight: false,
          includesVisaSupport: true,
          profileSections: ["education", "workExperience", "travelHistory", "emergencyContact"],
          documentRequirements: [],
        }}
      />
    </div>
  );
}
