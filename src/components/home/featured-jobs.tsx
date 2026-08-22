import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/page-hero";
import { getFeaturedJobs, jobPath } from "@/lib/catalog";
import type { JobOffer } from "@/lib/catalog/types";
import { formatMoney } from "@/lib/utils";

function publishedLabel(date?: Date | null) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
import { EmptyState } from "@/components/ui/empty-state";

export function JobCard({ job }: { job: JobOffer }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-border bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <Badge tone="blue">{job.category}</Badge>
        <Badge tone={job.availability === "open" ? "success" : "muted"}>
          {job.availability === "open" ? "Open" : job.availability}
        </Badge>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-navy">{job.title}</h3>
      <p className="mt-1 text-sm text-muted">
        {job.city}, {job.country}
      </p>
      {publishedLabel(job.publishedAt) ? (
        <p className="mt-1 text-xs text-muted">
          Published {publishedLabel(job.publishedAt)}
        </p>
      ) : null}
      <p className="mt-4 text-lg font-semibold text-navy">
        {formatMoney(job.salary.amount, job.salary.currency)}
        <span className="ml-1 text-sm font-normal text-muted">/ month</span>
      </p>
      {job.convertedSalary ? (
        <p className="text-sm text-muted">
          ≈ {formatMoney(job.convertedSalary.amount, job.convertedSalary.currency)}{" "}
          <span className="text-xs">(indicative)</span>
        </p>
      ) : null}
      <ul className="mt-5 flex flex-wrap gap-2">
        {job.benefits.map((benefit) => (
          <li key={benefit}>
            <Badge tone="outline">{benefit}</Badge>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Button asChild variant="outline" className="w-full">
          <Link href={jobPath(job)}>View opportunity</Link>
        </Button>
      </div>
    </article>
  );
}

export async function FeaturedJobs() {
  const jobs = await getFeaturedJobs();

  return (
    <section className="bg-white">
      <div className="container-wide py-14 sm:py-16">
        <SectionHeading
          eyebrow="Work abroad"
          title="Featured opportunities"
          description="Currently published roles. Details, documents, and requirements live on each opportunity page — not on this homepage."
          action={
            <Button asChild variant="ghost">
              <Link href="/work-abroad">View all jobs</Link>
            </Button>
          }
        />
        {jobs.length === 0 ? (
          <EmptyState
            title="No current opportunities"
            description="We don’t currently have an opportunity to feature. Check back soon or contact our team."
            actionHref="/contact"
            actionLabel="Contact us"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
