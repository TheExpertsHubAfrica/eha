import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ApplyShell } from "@/components/apply/apply-shell";
import { SubmitApplicationForm } from "@/components/apply/submit-form";
import { DocumentFileActions } from "@/components/documents/document-preview";
import { applyPath } from "@/lib/apply/steps";
import { formatFileSize } from "@/lib/uploads/validate";
import { dateInputValue } from "@/lib/utils";
import {
  findSimilarDrafts,
  requireDraftStep,
} from "@/server/application/service";
import { jobPath } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-navy">{value}</dd>
    </div>
  );
}

function Section({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-navy">{title}</h2>
        <Link href={href} className="text-sm font-medium text-blue">
          Edit
        </Link>
      </div>
      <dl className="mt-4 divide-y divide-border">{children}</dl>
    </section>
  );
}

export default async function ReviewStepPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const { offerId } = await params;
  const result = await requireDraftStep(offerId, "review");
  if (!result.ok) redirect(result.redirectTo);
  const { draft, job } = result;
  const profile = draft.profile;
  const similar =
    profile
      ? await findSimilarDrafts(job.id, profile.email, profile.passportNumber, draft.id)
      : [];

  return (
    <ApplyShell job={job} step="review" completed={draft.stepsCompleted}>
      <div className="space-y-5">
        <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-navy">Review your application</h2>
          <p className="mt-2 text-sm text-muted">
            Check every section, then submit. You will receive a reference number and a
            downloadable work-profile copy. This is not a visa or placement decision.
          </p>
          {similar.length > 0 ? (
            <p className="mt-4 rounded-md border border-gold/30 bg-gold-soft px-3 py-2 text-sm text-navy" role="status">
              A similar application may already exist for this role. You can still
              keep this draft; our team will review duplicates later rather than
              blocking you automatically.
            </p>
          ) : null}
        </div>

        <Section title="Selected opportunity" href={jobPath(job)}>
          <Row label="Role" value={job.title} />
          <Row label="Location" value={`${job.city}, ${job.country}`} />
        </Section>

        {profile ? (
          <Section title="Personal information" href={applyPath(job.id, "personal")}>
            <Row label="Full name" value={profile.fullName} />
            <Row label="Date of birth" value={dateInputValue(profile.dateOfBirth)} />
            <Row label="Place of birth" value={profile.placeOfBirth} />
            <Row label="Nationality" value={profile.nationality} />
            <Row label="Passport" value={profile.passportNumber} />
            <Row label="Phone" value={profile.phone} />
            <Row label="Email" value={profile.email} />
            <Row label="Residence" value={`${profile.currentCity}, ${profile.countryOfResidence}`} />
            <Row label="Marital status" value={profile.maritalStatus} />
            <Row label="Spouse" value={profile.spouseName} />
          </Section>
        ) : null}

        {draft.education.length > 0 ? (
          <Section title="Education" href={applyPath(job.id, "education")}>
            {draft.education.map((record) => (
              <Row
                key={record.id}
                label={record.qualification}
                value={[record.institution, record.programme, record.graduationYear]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </Section>
        ) : null}

        {draft.employment.length > 0 ? (
          <Section title="Work experience" href={applyPath(job.id, "work")}>
            {draft.employment.map((record) => (
              <Row
                key={record.id}
                label={record.position}
                value={`${record.employer}, ${record.country}`}
              />
            ))}
          </Section>
        ) : null}

        <Section title="Background" href={applyPath(job.id, "supporting")}>
          {draft.travelHistory.map((record) => (
            <Row
              key={record.id}
              label="Travel"
              value={`${record.country} (${record.year}) · ${record.purpose}`}
            />
          ))}
          {draft.dependants.map((record) => (
            <Row key={record.id} label="Dependant" value={`${record.fullName} · ${record.relationship}`} />
          ))}
          {draft.emergencyContacts
            .filter((item) => item.kind === "home")
            .map((item) => (
              <Row key={item.id} label="Emergency contact" value={`${item.name} · ${item.phone}`} />
            ))}
          {draft.military ? (
            <Row
              label="Military service"
              value={`${draft.military.country} · ${draft.military.serviceType}`}
            />
          ) : null}
          <Row label="Statement" value={profile?.personalStatement} />
        </Section>

        <Section title="Documents" href={applyPath(job.id, "documents")}>
          {job.documentRequirements.map((requirement) => {
            const uploaded = draft.documents.find((doc) => doc.requirementKey === requirement.key);
            if (uploaded) {
              return (
                <div
                  key={requirement.key}
                  className="flex flex-wrap items-start justify-between gap-3 py-2"
                >
                  <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[11rem_1fr]">
                    <dt className="text-sm text-muted">{requirement.name}</dt>
                    <dd className="text-sm text-navy">
                      {uploaded.originalFilename} · {formatFileSize(uploaded.sizeBytes)}
                    </dd>
                  </div>
                  <DocumentFileActions
                    href={`/api/apply/${job.id}/documents/${uploaded.id}`}
                    filename={uploaded.originalFilename}
                    mimeType={uploaded.mimeType}
                  />
                </div>
              );
            }
            return (
              <Row
                key={requirement.key}
                label={requirement.name}
                value={requirement.required ? "Required — not uploaded" : "Optional — not uploaded"}
              />
            );
          })}
        </Section>

        <SubmitApplicationForm offerId={job.id} similarCount={similar.length} />
      </div>
    </ApplyShell>
  );
}
