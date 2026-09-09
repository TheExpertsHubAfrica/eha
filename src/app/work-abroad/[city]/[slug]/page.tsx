import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { applyHref, getJobByPath, getRelatedJobs } from "@/lib/catalog";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobCard } from "@/components/home/featured-jobs";
import { formatMoney } from "@/lib/utils";
import { jobWhatsAppHref, whatsappPrefillJob } from "@/lib/whatsapp";
import { recordEvent } from "@/server/analytics/events";
import { getResolvedSite } from "@/server/settings";

type Params = { city: string; slug: string };

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { city, slug } = await params;
  const job = await getJobByPath(city, slug);
  if (!job) return { title: "Opportunity not found" };
  return {
    title: `${job.title} in ${job.city}`,
    description: job.overview,
    alternates: { canonical: `/work-abroad/${job.citySlug}/${job.slug}` },
  };
}

function Block({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="scroll-mt-24 border-t border-border pt-8">
      <h2 className="text-xl font-semibold text-navy">{title}</h2>
      <div className="mt-3 text-muted">{children}</div>
    </section>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { city, slug } = await params;
  const job = await getJobByPath(city, slug);
  if (!job) notFound();
  await recordEvent({ name: "job_viewed", targetType: "Job", targetId: job.id });
  const [related, site] = await Promise.all([getRelatedJobs(job), getResolvedSite()]);
  const whatsapp = jobWhatsAppHref(job, site);
  const open = job.availability === "open";

  return (
    <SiteShell
      whatsapp={{
        mode: "soft",
        prefill: whatsappPrefillJob(job, site),
        raiseForMobileBar: open,
        label: "Questions before you apply?",
      }}
    >
      <article>
        <header className="border-b border-border bg-white">
          <div className="container-page py-10 sm:py-12">
            <p className="text-sm text-muted">
              <Link href="/work-abroad" className="hover:text-navy">
                Work abroad
              </Link>
              <span aria-hidden="true"> / </span>
              {job.city}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="blue">{job.category}</Badge>
              <Badge tone="success">
                {open ? "Open for applications" : job.availability}
              </Badge>
              {job.genderEligibility !== "both" ? (
                <Badge tone="gold">
                  {job.genderEligibility === "male" ? "Male applicants only" : "Female applicants only"}
                </Badge>
              ) : null}
            </div>
            <h1 className="mt-4 text-3xl font-semibold text-navy sm:text-4xl">
              {job.title}
            </h1>
            <p className="mt-2 text-muted">
              {job.city}, {job.country}
              {job.publishedAt
                ? ` · Listed ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(job.publishedAt)}`
                : ""}
            </p>
            <p className="mt-5 text-2xl font-semibold text-navy">
              {formatMoney(job.salary.amount, job.salary.currency)}
              <span className="ml-1 text-base font-normal text-muted">/ month</span>
            </p>
            {job.convertedSalary ? (
              <p className="text-sm text-muted">
                ≈ {formatMoney(job.convertedSalary.amount, job.convertedSalary.currency)}{" "}
                (indicative)
              </p>
            ) : null}
            {open ? (
              <div className="mt-6 hidden space-y-3 lg:block">
                <Button asChild size="lg">
                  <Link href={applyHref(job)}>Apply now</Link>
                </Button>
                <p className="max-w-md text-sm text-muted">
                  Submit your application online to be reviewed. Documents are uploaded in the guided form — not by chat.
                </p>
                {whatsapp ? (
                  <p className="text-sm">
                    <a
                      href={whatsapp}
                      className="font-medium text-navy underline-offset-4 hover:underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Questions before you apply? Message us on WhatsApp
                    </a>
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted">This role is not open for new applications.</p>
            )}
          </div>
        </header>

        <div className="container-page grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:py-14">
          <div className="space-y-10">
            <Block title="Overview">
              <p>{job.overview}</p>
            </Block>
            <Block title="Job description">
              <p>{job.description}</p>
            </Block>
            <Block title="Responsibilities">
              <ul className="list-disc space-y-1 pl-5">
                {job.responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
            <Block title="Requirements">
              <ul className="list-disc space-y-1 pl-5">
                {job.requirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
            <Block title="Salary & benefits">
              <p>
                Listed salary: {formatMoney(job.salary.amount, job.salary.currency)} per
                month.
              </p>
              {job.conversionNote ? (
                <p className="mt-3 text-sm">{job.conversionNote}</p>
              ) : null}
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {job.benefits.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
            <Block title="Accommodation">
              <p>{job.accommodation}</p>
            </Block>
            <Block title="Flight">
              <p>{job.flight}</p>
            </Block>
            <Block title="Visa">
              <p>{job.visa}</p>
            </Block>
            <Block title="Working conditions">
              <p>{job.workingConditions}</p>
            </Block>
            <Block title="Application requirements">
              <ul className="list-disc space-y-1 pl-5">
                {job.applicationRequirements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm">
                Documents requested for this offer: {job.requiredDocuments.join(", ")}.
                Uploads happen after you start the application — never on the homepage.
              </p>
            </Block>
            <Block title="Frequently asked questions">
              <div className="space-y-4">
                {job.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3 className="font-medium text-navy">{faq.question}</h3>
                    <p className="mt-1">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </Block>
            <Block title="Important information">
              <ul className="list-disc space-y-1 pl-5">
                {job.importantInformation.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Block>
            {related.length > 0 ? (
              <Block title="Related opportunities">
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((item) => (
                    <JobCard key={item.id} job={item} />
                  ))}
                </div>
              </Block>
            ) : null}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-white p-5">
              <p className="text-sm text-muted">Ready to continue?</p>
              <p className="mt-1 font-semibold text-navy">{job.title}</p>
              {open ? (
                <>
                  <Button asChild className="mt-4 w-full">
                    <Link href={applyHref(job)}>Apply now</Link>
                  </Button>
                  <p className="mt-3 text-xs text-muted">
                    Complete your guided profile online. Documents are uploaded in the application — not by WhatsApp.
                  </p>
                  {whatsapp ? (
                    <a
                      href={whatsapp}
                      className="mt-4 inline-block text-xs font-medium text-navy underline-offset-4 hover:underline"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Questions? WhatsApp us
                    </a>
                  ) : null}
                </>
              ) : (
                <p className="mt-4 text-sm text-muted">This role is not open for new applications.</p>
              )}
            </div>
          </aside>
        </div>
      </article>

      {open ? (
        <div className="sticky bottom-0 z-30 border-t border-border bg-white p-3 lg:hidden">
          <Button asChild className="w-full" size="lg">
            <Link href={applyHref(job)}>Apply now</Link>
          </Button>
          {whatsapp ? (
            <p className="mt-2 text-center text-xs text-muted">
              <a
                href={whatsapp}
                className="font-medium text-navy underline-offset-4 hover:underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                Questions before you apply?
              </a>
            </p>
          ) : null}
        </div>
      ) : null}
    </SiteShell>
  );
}
