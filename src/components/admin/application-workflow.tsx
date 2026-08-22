"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/select";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminStatuses, statusLabel } from "@/lib/admin/status";
import { addAdminNoteAction, updateApplicationStatusAction } from "@/server/admin/application-actions";
import type { ApplicationStatus } from "@prisma/client";

export function ApplicationWorkflowForms({
  applicationId,
  currentStatus,
}: {
  applicationId: string;
  currentStatus: ApplicationStatus;
}) {
  const [statusError, setStatusError] = useState<string>();
  const [noteError, setNoteError] = useState<string>();
  const [statusPending, setStatusPending] = useState(false);
  const [notePending, setNotePending] = useState(false);

  async function onStatus(formData: FormData) {
    setStatusPending(true);
    setStatusError(undefined);
    const result = await updateApplicationStatusAction(applicationId, formData);
    if (result && !result.ok) {
      setStatusError(result.error);
      toast.error(result.error);
      setStatusPending(false);
      return;
    }
    toast.success("Status updated.");
    setStatusPending(false);
  }

  async function onNote(formData: FormData) {
    setNotePending(true);
    setNoteError(undefined);
    const result = await addAdminNoteAction(applicationId, formData);
    if (result && !result.ok) {
      setNoteError(result.error);
      toast.error(result.error);
      setNotePending(false);
      return;
    }
    toast.success("Note saved.");
    setNotePending(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form action={onStatus} className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Change status</h2>
        <div className="mt-3">
          <Label htmlFor="status">Status</Label>
          <NativeSelect id="status" name="status" defaultValue={currentStatus}>
            {adminStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="mt-3">
          <Label htmlFor="note">Internal note (optional)</Label>
          <Textarea id="note" name="note" rows={3} className="min-h-24" />
        </div>
        {statusError ? <p className="mt-3 text-sm text-danger">{statusError}</p> : null}
        <Button type="submit" className="mt-4" size="sm" disabled={statusPending}>
          {statusPending ? "Saving…" : "Update status"}
        </Button>
      </form>
      <form action={onNote} className="rounded-lg border border-border bg-white p-5">
        <h2 className="text-sm font-semibold text-navy">Internal note</h2>
        <div className="mt-3">
          <Label htmlFor="body">Note</Label>
          <Textarea id="body" name="body" rows={6} required />
        </div>
        {noteError ? <p className="mt-3 text-sm text-danger">{noteError}</p> : null}
        <Button type="submit" className="mt-4" size="sm" variant="outline" disabled={notePending}>
          {notePending ? "Saving…" : "Add note"}
        </Button>
      </form>
    </div>
  );
}
