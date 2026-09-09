import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminJobForm } from "@/components/admin/job-form";
import { offerCoverUrl } from "@/lib/covers";
import { prisma } from "@/server/db";
import { requireAdmin } from "@/server/admin/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const job = await prisma.job.findUnique({ where: { id }, select: { title: true } });
  return { title: job?.title ?? "Job", robots: { index: false, follow: false } };
}

export default async function AdminEditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin("jobs.write");
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      profileSectionRequirements: true,
      documentRequirements: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!job) notFound();

  return (
    <div>
      <Link href="/admin/jobs" className="text-sm text-blue hover:underline">
        Back to jobs
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-navy">{job.title}</h1>
      <p className="mt-1 mb-6 text-sm text-muted">
        Public listing: /work-abroad/{job.citySlug}/{job.slug}. Unpublished jobs leave the marketplace.
      </p>
      <AdminJobForm
        job={{
          id: job.id,
          title: job.title,
          slug: job.slug,
          citySlug: job.citySlug,
          city: job.city,
          country: job.country,
          countryCode: job.countryCode,
          category: job.category,
          salaryAmount: String(job.salaryAmount),
          salaryCurrency: job.salaryCurrency,
          overview: job.overview,
          description: job.description,
          responsibilities: job.responsibilities.join("\n"),
          requirements: job.requirements.join("\n"),
          benefits: job.benefits.join("\n"),
          accommodation: job.accommodation,
          flight: job.flight,
          visa: job.visa,
          workingConditions: job.workingConditions,
          applicationRequirements: job.applicationRequirements.join("\n"),
          importantInformation: job.importantInformation.join("\n"),
          featured: job.featured,
          status: job.status,
          availability: job.availability,
          genderEligibility: job.genderEligibility,
          includesAccommodation: job.includesAccommodation,
          includesFlight: job.includesFlight,
          includesVisaSupport: job.includesVisaSupport,
          profileSections: job.profileSectionRequirements.map((item) => item.section),
          documentRequirements: job.documentRequirements.map((item) => ({
            key: item.key,
            name: item.name,
            required: item.required,
          })),
          coverImageUrl: job.coverImageKey ? offerCoverUrl("job", job.id) : null,
        }}
      />
    </div>
  );
}
