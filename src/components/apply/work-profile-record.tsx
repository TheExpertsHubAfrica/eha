import type { ReactNode } from "react";
import { formatFileSize } from "@/lib/uploads/validate";
import { dateInputValue, formatDisplayDate, formatMoney } from "@/lib/utils";
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
  const homeContacts = application.emergencyContacts.filter((item) => item.kind !== "uae");
  const uaeContacts = application.emergencyContacts.filter((item) => item.kind === "uae");

  return (
    <div className="space-y-5">
      <Block title="Selected opportunity">
        <Row label="Role" value={job.title} />
        <Row label="Location" value={`${job.city}, ${job.country}`} />
        <Row label="Category" value={job.category} />
        <Row
          label="Listed salary"
          value={formatMoney(job.salary.amount, job.salary.currency)}
        />
      </Block>
      {profile ? (
        <Block title="Personal information">
          <Row label="Full name" value={profile.fullName} />
          <Row label="Date of birth" value={dateInputValue(profile.dateOfBirth)} />
          <Row label="Place of birth" value={profile.placeOfBirth} />
          <Row label="Nationality" value={profile.nationality} />
          <Row label="Previous nationality" value={profile.previousNationality} />
          {hideSensitive ? null : <Row label="Passport" value={profile.passportNumber} />}
          <Row
            label="Residence"
            value={`${profile.currentCity}, ${profile.countryOfResidence}`}
          />
        </Block>
      ) : null}
      {profile ? (
        <Block title="Marital status">
          <Row label="Status" value={profile.maritalStatus} />
          <Row label="Spouse" value={profile.spouseName} />
          <Row label="Spouse nationality" value={profile.spouseNationality} />
          <Row label="Spouse place of birth" value={profile.spousePlaceOfBirth} />
          <Row
            label="Spouse date of birth"
            value={dateInputValue(profile.spouseDateOfBirth)}
          />
        </Block>
      ) : null}
      {application.education.length > 0 ? (
        <Block title="Education qualification">
          {application.education.map((record) => (
            <div key={record.id} className="divide-y divide-border">
              <Row label="Qualification" value={record.qualification} />
              <Row
                label="School / College"
                value={[record.institution, record.programme].filter(Boolean).join(" — ")}
              />
              <Row label="Languages" value={record.languages} />
              <Row
                label="Graduation / certifications"
                value={[record.graduationYear?.toString(), record.certifications]
                  .filter(Boolean)
                  .join(" · ")}
              />
            </div>
          ))}
        </Block>
      ) : null}
      {application.dependants.length > 0 ? (
        <Block title="Children / dependants">
          {application.dependants.map((record) => (
            <Row
              key={record.id}
              label={record.relationship}
              value={`${record.fullName} · ${dateInputValue(record.dateOfBirth)}`}
            />
          ))}
        </Block>
      ) : null}
      {profile ? (
        <Block title="Communication">
          <Row label="Phone" value={profile.phone} />
          <Row label="Email" value={profile.email} />
        </Block>
      ) : null}
      {application.employment.length > 0 ? (
        <Block title="Work history">
          {application.employment.map((record) => (
            <div key={record.id}>
              <Row
                label={record.position}
                value={`${record.employer}, ${record.country}`}
              />
              <Row
                label="Dates"
                value={
                  record.current
                    ? `${dateInputValue(record.startDate)} – current`
                    : `${dateInputValue(record.startDate)} – ${dateInputValue(record.endDate)}`
                }
              />
              <Row label="Responsibilities" value={record.responsibilities} />
              <Row label="Reason for leaving" value={record.reasonForLeaving} />
            </div>
          ))}
        </Block>
      ) : null}
      <Block title="Military service">
        {application.military ? (
          <>
            <Row label="Country" value={application.military.country} />
            <Row label="Type of service" value={application.military.serviceType} />
            <Row label="Rank" value={application.military.rank} />
            <Row label="Duration" value={application.military.duration} />
          </>
        ) : (
          <Row label="Service" value="N/A" />
        )}
      </Block>
      {homeContacts.length > 0 ? (
        <Block title="Emergency / home-country contacts">
          {homeContacts.map((item) => (
            <Row
              key={item.id}
              label={item.name}
              value={`${item.relationship} · ${item.phone}${item.email ? ` · ${item.email}` : ""} · ${item.city}, ${item.country}`}
            />
          ))}
        </Block>
      ) : null}
      {uaeContacts.length > 0 ? (
        <Block title="Contact persons in UAE">
          {uaeContacts.map((item) => (
            <Row
              key={item.id}
              label={item.name}
              value={`${item.phone} · ${item.city}, ${item.country}`}
            />
          ))}
        </Block>
      ) : null}
      <Block title="Previously visited countries">
        {application.travelHistory.length > 0 ? (
          application.travelHistory.map((record) => (
            <Row
              key={record.id}
              label={record.country}
              value={`${record.year} · ${record.purpose} · ${record.duration}`}
            />
          ))
        ) : (
          <Row label="Travel" value={profile?.visitedAbroad ? "Yes — details not listed" : "N/A"} />
        )}
      </Block>
      <Block title="A brief about you">
        <Row label="Statement" value={profile?.personalStatement} />
      </Block>
      {hideSensitive ? null : (
        <Block title="Documents">
          {job.documentRequirements.map((requirement) => {
            const uploaded = application.documents.find(
              (doc) => doc.requirementKey === requirement.key,
            );
            return (
              <Row
                key={requirement.key}
                label={requirement.name}
                value={
                  uploaded
                    ? `${uploaded.originalFilename} · ${formatFileSize(uploaded.sizeBytes)} · included in PDF download`
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
        Record dated {formatDisplayDate(application.submittedAt) || "—"}. Download the PDF
        summary for the form layout with passport photo and attached files. This is a copy of
        the submitted work profile, not a visa or placement decision.
      </p>
    </div>
  );
}
