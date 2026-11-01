import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplyShell } from "@/components/apply/apply-shell";
import { ContinueApplicationButton } from "@/components/apply/start-button";
import { jobPath } from "@/lib/catalog";
import { maskEmail } from "@/lib/apply/mask-email";
import { confirmationPath } from "@/lib/apply/reference";
import { resumeApplicationAction } from "@/server/application/actions";
import { inspectResumeToken } from "@/server/application/service";
import { getJobById } from "@/server/jobs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Continue your application",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function ResumeApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ offerId: string }>;
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const { offerId } = await params;
  const query = await searchParams;
  const token = typeof query.t === "string" ? query.t.trim() : "";
  if (!token) {
    redirect(`/apply/${offerId}?resume=invalid`);
  }

  const resume = await inspectResumeToken(offerId, token);
  if (resume.kind === "invalid") {
    redirect(`/apply/${offerId}?resume=invalid`);
  }
  if (resume.kind === "submitted") {
    redirect(`${confirmationPath(resume.referenceNumber)}?t=${encodeURIComponent(token)}`);
  }

  const job = await getJobById(offerId);
  if (!job || job.availability !== "open") {
    redirect(`/apply/${offerId}/unavailable`);
  }

  return (
    <ApplyShell job={job}>
      <div className="max-w-xl rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Continue this application?</h2>
        <p className="mt-3 text-muted">
          This link opens a saved draft for {job.title} in {job.city}
          {resume.email ? (
            <>
              , started with the email{" "}
              <span className="font-medium text-navy">{maskEmail(resume.email)}</span>
            </>
          ) : null}
          .
        </p>
        <p className="mt-3 text-sm text-muted">
          Only continue if this is your email. If someone else sent you this link, do not enter your
          details here, because they may be able to see them. The link works once, and continuing
          signs the draft out on any other device.
        </p>
        <form action={resumeApplicationAction.bind(null, job.id, token)} className="mt-6">
          <ContinueApplicationButton />
        </form>
        <p className="mt-4 text-sm">
          <Link href={jobPath(job)} className="text-blue">
            This is not my application
          </Link>
        </p>
      </div>
    </ApplyShell>
  );
}
