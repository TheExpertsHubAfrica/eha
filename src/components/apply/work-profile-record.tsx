import type { ReactNode } from "react";
import { formatFileSize } from "@/lib/uploads/validate";
import { dateInputValue, formatDisplayDate } from "@/lib/utils";
import type { JobOffer } from "@/lib/catalog/types";
import type { DraftApplication } from "@/server/application/service";

function Row({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid gap-1 py-2 sm:grid-cols-[11rem_1fr]">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-sm text-navy">{value}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-white p-6 sm:p-8 print:break-inside-avoid print:border-black/20">
      <h2 className="text-lg font-semibold text-navy">{title}</h2>
      <dl className="mt-4 divide-y divide-border">{children}</dl>
    </section>
  );
}

export function WorkProfileRecord({
  job,
  application,
  hideSensitive = false,
}: {
  job: JobOffer;
  application: DraftApplication;
  hideSensitive?: boolean;
}) {
  const profile = application.profile;
  return (
    <div className="space-y-5">
      <Block title="Selected opportunity">
        <Row label="Role" value={job.title} />
        <Row label="Location" value={`${job.city}, ${job.country}`} />
        <Row label="Category" value={job.category} />
      </Block>
      {profile ? (
        <Block title="Personal information">
          <Row label="Full name" value={profile.fullName} />
          <Row label="Date of birth" value={dateInputValue(profile.dateOfBirth)} />
          <Row label="Place of birth" value={profile.placeOfBirth} />
          <Row label="Nationality" value={profile.nationality} />
          {hideSensitive ? null : <Row label="Passport" value={profile.passportNumber} />}
          <Row label="Phone" value={profile.phone} />
          <Row label="Email" value={profile.email} />
          <Row label="Residence" value={`${profile.currentCity}, ${profile.countryOfResidence}`} />
          <Row label="Marital status" value={profile.maritalStatus} />
          <Row label="Spouse" value={profile.spouseName} />
        </Block>
      ) : null}
      {application.education.length > 0 ? (
        <Block title="Education">
          {application.education.map((record) => (
            <Row
              key={record.id}
              label={record.qualification}
              value={[record.institution, record.programme, record.graduationYear]
                .filter(Boolean)
                .join(" · ")}
            />
          ))}
        </Block>
      ) : null}
      {application.employment.length > 0 ? (
        <Block title="Work experience">
          {application.employment.map((record) => (
            <Row
              key={record.id}
              label={record.position}
              value={`${record.employer}, ${record.country}`}
            />
          ))}
        </Block>
      ) : null}
      <Block title="Background">
        {application.travelHistory.map((record) => (
          <Row
            key={record.id}
            label="Travel"
            value={`${record.country} (${record.year}) · ${record.purpose}`}
          />
        ))}
        {application.dependants.map((record) => (
          <Row key={record.id} label="Dependant" value={`${record.fullName} · ${record.relationship}`} />
        ))}
        {application.emergencyContacts.map((item) => (
          <Row
            key={item.id}
            label={item.kind === "uae" ? "UAE contact" : "Emergency contact"}
            value={`${item.name} · ${item.phone}`}
          />
        ))}
        {application.military ? (
          <Row
            label="Military service"
            value={`${application.military.country} · ${application.military.serviceType}`}
          />
        ) : null}
        <Row label="Statement" value={profile?.personalStatement} />
      </Block>
      {hideSensitive ? null : (
      <Block title="Documents">
        {job.documentRequirements.map((requirement) => {
          const uploaded = application.documents.find((doc) => doc.requirementKey === requirement.key);
          return (
            <Row
              key={requirement.key}
              label={requirement.name}
              value={
                uploaded
                  ? `${uploaded.originalFilename} · ${formatFileSize(uploaded.sizeBytes)}`
                  : requirement.required
                    ? "Required — not uploaded"
                    : "Optional — not uploaded"
              }
            />
          );
        })}
      </Block>
      )}
      <p className="text-xs text-muted">
        Record dated {formatDisplayDate(application.submittedAt) || "—"}. This is a copy of the
        submitted work profile, not a visa or placement decision.
      </p>
    </div>
  );
}
