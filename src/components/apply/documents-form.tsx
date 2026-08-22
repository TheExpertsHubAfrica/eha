"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/apply/form-banner";
import { DocumentFileActions } from "@/components/documents/document-preview";
import type { DocumentRequirement } from "@/lib/catalog/types";
import { missingRequiredDocuments } from "@/lib/apply/documents";
import { acceptAttribute, formatFileSize } from "@/lib/uploads/validate";
import { completeDocumentsAction } from "@/server/application/actions";
import type { DocumentMeta } from "@/lib/uploads/types";

function typeLabel(types: string[]) {
  const labels = types.map((type) => {
    if (type === "application/pdf") return "PDF";
    if (type === "image/jpeg") return "JPG";
    if (type === "image/png") return "PNG";
    return type;
  });
  return labels.join(", ");
}

export function DocumentsForm({
  offerId,
  requirements,
  initialDocuments,
}: {
  offerId: string;
  requirements: DocumentRequirement[];
  initialDocuments: DocumentMeta[];
}) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [error, setError] = useState<string>();
  const [busyKey, setBusyKey] = useState<string>();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [slotError, setSlotError] = useState<Record<string, string>>({});
  const [completing, setCompleting] = useState(false);

  const missing = useMemo(
    () => missingRequiredDocuments({ documentRequirements: requirements }, documents),
    [requirements, documents],
  );
  const missingKeys = new Set(missing.map((item) => item.key));
  const uploadedCount = documents.length;
  const requiredCount = requirements.filter((item) => item.required).length;
  const requiredDone = requiredCount - missing.length;

  function documentFor(key: string) {
    return documents.find((item) => item.requirementKey === key);
  }

  async function upload(requirementKey: string, file: File) {
    setError(undefined);
    setSlotError((current) => ({ ...current, [requirementKey]: "" }));
    setBusyKey(requirementKey);
    setProgress((current) => ({ ...current, [requirementKey]: 0 }));

    try {
      const form = new FormData();
      form.set("file", file);
      form.set("requirementKey", requirementKey);

      const uploaded = await new Promise<DocumentMeta>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `/api/apply/${offerId}/documents`);
        xhr.responseType = "json";
        xhr.upload.onprogress = (event) => {
          if (!event.lengthComputable) return;
          const value = Math.round((event.loaded / event.total) * 100);
          setProgress((current) => ({ ...current, [requirementKey]: value }));
        };
        xhr.onload = () => {
          const payload = xhr.response as { ok?: boolean; document?: DocumentMeta; error?: string } | null;
          if (xhr.status >= 200 && xhr.status < 300 && payload?.ok && payload.document) {
            resolve(payload.document);
            return;
          }
          reject(new Error(payload?.error || "The file could not be uploaded."));
        };
        xhr.onerror = () => reject(new Error("The file could not be uploaded."));
        xhr.send(form);
      });

      setDocuments((current) => [
        ...current.filter((item) => item.requirementKey !== requirementKey),
        uploaded,
      ]);
      toast.success(`${file.name} uploaded.`);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The file could not be uploaded.";
      setSlotError((current) => ({ ...current, [requirementKey]: message }));
      toast.error(message);
    } finally {
      setBusyKey(undefined);
      setProgress((current) => ({ ...current, [requirementKey]: 0 }));
    }
  }

  async function remove(document: DocumentMeta) {
    setBusyKey(document.requirementKey);
    setError(undefined);
    try {
      const response = await fetch(`/api/apply/${offerId}/documents/${document.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "The file could not be removed.");
      }
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      toast.success("File removed.");
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "The file could not be removed.";
      setSlotError((current) => ({ ...current, [document.requirementKey]: message }));
      toast.error(message);
    } finally {
      setBusyKey(undefined);
    }
  }

  async function onComplete() {
    setCompleting(true);
    setError(undefined);
    const result = await completeDocumentsAction(offerId);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error ?? "Upload the required documents first.");
      setCompleting(false);
    }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Upload your documents</h2>
        <p className="mt-2 text-sm text-muted">
          Files stay private to this application. We check type and size before storing them.
          Do not email these documents or upload them on the homepage.
        </p>
        <p className="mt-4 text-sm text-navy">
          {requiredDone} of {requiredCount} required documents uploaded
          {uploadedCount > requiredDone ? ` · ${uploadedCount - requiredDone} optional` : ""}.
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky">
          <div
            className="h-full bg-blue transition-[width]"
            style={{ width: `${requiredCount ? Math.round((requiredDone / requiredCount) * 100) : 100}%` }}
          />
        </div>
        <FormBanner error={error} />
      </section>

      {requirements.map((requirement) => {
        const current = documentFor(requirement.key);
        const uploading = busyKey === requirement.key;
        const percent = progress[requirement.key] ?? 0;
        const slotMessage = slotError[requirement.key];
        return (
          <section key={requirement.key} className="rounded-lg border border-border bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold text-navy">{requirement.name}</h3>
                  <Badge tone={requirement.required ? "navy" : "muted"}>
                    {requirement.required ? "Required" : "Optional"}
                  </Badge>
                  {current ? <Badge tone="success">Uploaded</Badge> : null}
                  {requirement.required && missingKeys.has(requirement.key) ? (
                    <Badge tone="danger">Missing</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted">{requirement.description}</p>
                <p className="mt-1 text-sm text-fg-soft">
                  {requirement.instructions || `${typeLabel(requirement.acceptedTypes)}, maximum ${requirement.maxSizeMb} MB.`}
                </p>
              </div>
            </div>

            {current ? (
              <div className="mt-4 rounded-md border border-border bg-surface px-3 py-3 text-sm">
                <p className="font-medium text-navy">{current.originalFilename}</p>
                <p className="mt-1 text-muted">
                  {typeLabel([current.mimeType])} · {formatFileSize(current.sizeBytes)}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DocumentFileActions
                    href={`/api/apply/${offerId}/documents/${current.id}`}
                    filename={current.originalFilename}
                    mimeType={current.mimeType}
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    type="button"
                    disabled={uploading}
                    onClick={() => void remove(current)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4">
              <label className="block text-sm font-medium text-navy" htmlFor={`file-${requirement.key}`}>
                {current ? "Replace file" : "Choose file"}
              </label>
              <input
                id={`file-${requirement.key}`}
                type="file"
                className="mt-2 block w-full text-sm text-fg file:mr-3 file:rounded-md file:border file:border-border file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium"
                accept={acceptAttribute(requirement.acceptedTypes)}
                disabled={uploading}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (file) void upload(requirement.key, file);
                }}
              />
              {uploading ? (
                <p className="mt-2 text-sm text-blue" aria-live="polite">
                  Uploading{percent ? ` · ${percent}%` : "…"}
                </p>
              ) : null}
              {slotMessage ? (
                <p className="mt-2 text-sm text-danger" role="alert">
                  {slotMessage}
                </p>
              ) : null}
            </div>
          </section>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-6">
        <p className="text-sm text-muted">
          Optional documents can be skipped. Required files must be uploaded before review.
        </p>
        <Button type="button" onClick={() => void onComplete()} disabled={completing || missing.length > 0 || Boolean(busyKey)}>
          {completing ? "Saving…" : "Continue to review"}
        </Button>
      </div>
    </div>
  );
}
