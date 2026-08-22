"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckboxField } from "@/components/ui/select";
import { FormBanner } from "@/components/apply/form-banner";
import { submitApplicationAction } from "@/server/application/actions";

export function SubmitApplicationForm({
  offerId,
  similarCount,
}: {
  offerId: string;
  similarCount: number;
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await submitApplicationAction(offerId, {
      declaration: formData.get("declaration") === "1",
      acknowledgeSimilar: similarCount === 0 || formData.get("acknowledgeSimilar") === "1",
    });
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error ?? "The application could not be submitted.");
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="rounded-lg border border-border bg-white p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-navy">Submit this application</h2>
      <p className="mt-2 text-sm text-muted">
        Submitting creates a reference number and a work-profile copy. Visa and
        placement outcomes are not decided on this screen.
      </p>
      <div className="mt-5 space-y-3">
        <CheckboxField
          id="declaration"
          name="declaration"
          label="I confirm that the information and documents in this application are accurate to the best of my knowledge."
        />
        {similarCount > 0 ? (
          <CheckboxField
            id="acknowledgeSimilar"
            name="acknowledgeSimilar"
            label="I understand a similar application may already exist for this role and still want to submit this one."
          />
        ) : null}
      </div>
      <FormBanner error={error} />
      <Button type="submit" className="mt-6" size="lg" disabled={pending}>
        {pending ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
