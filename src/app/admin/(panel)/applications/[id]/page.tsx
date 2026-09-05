import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download } from "lucide-react";
import { ApplicationWorkflowForms } from "@/components/admin/application-workflow";
import { WorkProfileRecord } from "@/components/apply/work-profile-record";
import { DocumentFileActions } from "@/components/documents/document-preview";
import { Button } from "@/components/ui/button";
import { can } from "@/lib/admin/permissions";
import { statusLabel } from "@/lib/admin/status";
import { formatFileSize } from "@/lib/uploads/validate";
import { formatDisplayDate } from "@/lib/utils";
import { prisma } from "@/server/db";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { draftJob, type DraftApplication } from "@/server/application/service";

export const dynamic = "force-dynamic";

function stamp(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const row = await prisma.application.findUnique({
    where: { id },
    select: { referenceNumber: true },
  });
  return {
    title: row?.referenceNumber ? `Application ${row.referenceNumber}` : "Application",
    robots: { index: false, follow: false },
  };
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdmin("applications.read");
  const { id } = await params;
  const canFiles = can(admin.role, "applications.documents");
  const canWrite = can(admin.role, "applications.write");

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      profile: true,
      education: { orderBy: { sortOrder: "asc" } },
      employment: { orderBy: { sortOrder: "asc" } },
      travelHistory: { orderBy: { sortOrder: "asc" } },
      dependants: { orderBy: { sortOrder: "asc" } },
      emergencyContacts: { orderBy: { sortOrder: "asc" } },
      military: true,
      documents: { orderBy: { createdAt: "asc" } },
      statusHistory: { orderBy: { createdAt: "desc" } },
      adminNotes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      job: {
        include: {
          faqs: { orderBy: { sortOrder: "asc" } },
          documentRequirements: { orderBy: { sortOrder: "asc" } },
          profileSectionRequirements: true,
        },
      },
    },
  });
  if (!application) notFound();

  await writeAdminAudit({
    actorId: admin.id,
    action: "application.view",
    targetType: "Application",
    targetId: application.id,
  });

  const draft = application as DraftApplication;
  const job = draftJob(draft);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin/applications" className="text-sm text-blue hover:underline">
            Back to applications
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-navy">
            {application.referenceNumber ?? "Draft application"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {application.job.title} · {application.job.city} · {statusLabel(application.status)}
            {application.submittedAt ? ` · submitted ${formatDisplayDate(application.submittedAt)}` : ""}
          </p>
        </div>
        {canFiles ? (
          <Button asChild size="sm" variant="outline">
            <a href={`/admin/applications/${application.id}/work-profile`}>
              <Download className="size-4" />
              Download Job Profile
            </a>
          </Button>
        ) : null}
      </div>

      {canWrite && application.status !== "draft" ? (
        <ApplicationWorkflowForms applicationId={application.id} currentStatus={application.status} />
      ) : (
        <p className="text-sm text-muted">
          {application.status === "draft"
            ? "This is still a draft. Status changes become available after the applicant submits."
            : canWrite
              ? null
              : "Status changes and notes are view-only for this role."}
        </p>
      )}

      <WorkProfileRecord job={job} application={draft} hideSensitive={!canFiles} />

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Documents</h2>
        {!canFiles ? (
          <p className="mt-3 text-sm text-muted">Document files are restricted for this role.</p>
        ) : application.documents.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No files have been uploaded.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {application.documents.map((doc) => {
              const requirement = application.job.documentRequirements.find(
                (item) => item.key === doc.requirementKey,
              );
              return (
                <li key={doc.id} className="flex flex-wrap items-center justify-between gap-4 py-3 text-sm">
                  <div>
                    <p className="font-medium text-navy">
                      {requirement?.name ?? doc.requirementKey}
                    </p>
                    <p className="text-muted">
                      {doc.originalFilename} · {formatFileSize(doc.sizeBytes)}
                    </p>
                  </div>
                  <DocumentFileActions
                    href={`/admin/applications/${application.id}/documents/${doc.id}`}
                    filename={doc.originalFilename}
                    mimeType={doc.mimeType}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Internal notes</h2>
        {application.adminNotes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No internal notes yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {application.adminNotes.map((note) => (
              <li key={note.id} className="border-b border-border pb-4 last:border-0">
                <p className="text-sm text-navy">{note.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {note.author.name} · {stamp(note.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="text-lg font-semibold text-navy">Status timeline</h2>
        {application.statusHistory.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No status history recorded.</p>
        ) : (
          <ol className="mt-4 space-y-3">
            {application.statusHistory.map((item) => (
              <li key={item.id} className="text-sm">
                <p className="font-medium capitalize text-navy">
                  {item.fromStatus ? `${statusLabel(item.fromStatus)} → ` : ""}
                  {statusLabel(item.toStatus)}
                </p>
                <p className="text-muted">
                  {stamp(item.createdAt)}
                  {item.note ? ` · ${item.note}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
