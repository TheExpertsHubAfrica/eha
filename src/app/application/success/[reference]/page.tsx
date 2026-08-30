import type { Metadata } from "next";
import Link from "next/link";
import { ConfirmationShell } from "@/components/apply/confirmation-shell";
import { Button } from "@/components/ui/button";
import { ContentImage } from "@/components/ui/content-image";
import { siteConfig } from "@/lib/site-config";
import { siteImages } from "@/lib/site-images";
import { formatDisplayDate } from "@/lib/utils";
import { jobPath } from "@/lib/catalog";
import { applicantEmailStatus, requireSubmittedAccess } from "@/server/application/access";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Application submitted",
  robots: { index: false, follow: false },
};

function withToken(path: string, tokenFromQuery?: string | null) {
  if (!tokenFromQuery) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}t=${encodeURIComponent(tokenFromQuery)}`;
}

export default async function ApplicationSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { reference } = await params;
  const query = await searchParams;
  const { application, job, token } = await requireSubmittedAccess(reference, query.t);
  const emailStatus = applicantEmailStatus(application.emailLogs);
  const profile = application.profile;
  const tokenQuery = query.t ? token : null;
  const printHref = withToken(`/application/success/${application.referenceNumber}/print`, tokenQuery);
  const pdfHref = withToken(`/application/success/${application.referenceNumber}/pdf`, tokenQuery);

  return (
    <ConfirmationShell>
      <div className="max-w-2xl overflow-hidden rounded-lg border border-border bg-white">
        <ContentImage
          src={siteImages.apply.success}
          alt="Application submitted successfully"
          aspect="video"
          className="border-b border-border"
        />
        <div className="p-6 sm:p-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue uppercase">Application submitted</p>
        <h1 className="mt-2 text-3xl font-semibold text-navy">Application received</h1>
        <p className="mt-3 text-muted">
          {siteConfig.name} has your work profile for {job.title} in {job.city}. This
          confirmation is a receipt, not a visa or placement decision.
        </p>
        <dl className="mt-8 space-y-4">
          <div>
            <dt className="text-sm text-muted">Application reference</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tracking-wide text-navy">
              {application.referenceNumber}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Opportunity</dt>
            <dd className="mt-1 text-navy">
              {job.title} · {job.city}, {job.country}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted">Submitted</dt>
            <dd className="mt-1 text-navy">{formatDisplayDate(application.submittedAt)}</dd>
          </div>
          {profile ? (
            <div>
              <dt className="text-sm text-muted">Confirmation email</dt>
              <dd className="mt-1 text-navy">{profile.email}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-6 text-sm text-muted" role="status">
          {emailStatus === "sent"
            ? "A confirmation email with your work-profile PDF was sent to this address."
            : emailStatus === "failed"
              ? "Your application was saved. We could not send the confirmation email yet — keep this reference number."
              : "Email delivery is not configured on this environment yet. Keep this reference number and download your work profile below."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <a href={printHref}>Print work profile</a>
          </Button>
          <Button asChild variant="outline">
            <a href={pdfHref}>Download PDF</a>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/">Return home</Link>
          </Button>
        </div>
        <p className="mt-6 text-sm">
          <Link href={jobPath(job)} className="text-blue">
            Back to the opportunity
          </Link>
        </p>
        </div>
      </div>
    </ConfirmationShell>
  );
}
