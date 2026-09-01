import type { Metadata } from "next";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobCard } from "@/components/home/featured-jobs";
import { SiteShell } from "@/components/layout/site-shell";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHero } from "@/components/ui/page-hero";
import { getJobFacets, searchJobs } from "@/lib/catalog";
import { hasActiveFilters, parseJobFilters } from "@/lib/jobs/filters";
import { siteImages } from "@/lib/site-images";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Work Abroad",
  description: `Browse overseas job opportunities with ${siteConfig.name}.`,
};

export const dynamic = "force-dynamic";

export default async function WorkAbroadPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseJobFilters(params);
  const [jobs, facets] = await Promise.all([searchJobs(filters), getJobFacets()]);
  const filtered = hasActiveFilters(filters);

  return (
    <SiteShell>
      <PageHero
        eyebrow="Work abroad"
        title="Roles with salary, benefits, and requirements in one place."
        image={siteImages.work.hero}
        imageAlt="Browse overseas jobs and work abroad opportunities with TEHA"
      />
      <section className="container-wide grid gap-6 py-10 sm:py-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 lg:py-16">
        <JobFilters filters={filters} facets={facets} resultCount={jobs.length} />
        <div>
          {jobs.length === 0 ? (
            <EmptyState
              title={filtered ? "No matching opportunities" : "No current opportunities"}
              description={
                filtered
                  ? "We don’t currently have an opportunity matching these filters. Check back soon or contact our team."
                  : "No published roles are available right now. Check back soon or contact our team."
              }
              actionHref="/contact"
              actionLabel="Contact us"
              image={siteImages.work.empty}
              imageAlt="No current work abroad job listings available"
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
