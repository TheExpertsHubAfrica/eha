import type { ApplicationStatus } from "@prisma/client";

export const adminStatuses: ApplicationStatus[] = [
  "submitted",
  "under_review",
  "documents_required",
  "shortlisted",
  "processing",
  "approved",
  "rejected",
  "withdrawn",
  "completed",
];

export function statusLabel(status: ApplicationStatus | string) {
  return status.replaceAll("_", " ");
}
