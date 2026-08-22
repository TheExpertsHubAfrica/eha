"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { FormBanner } from "@/components/apply/form-banner";
import { useUnsavedChanges } from "@/components/apply/use-unsaved-changes";
import { saveEmploymentAction } from "@/server/application/actions";
import {
  employmentSchema,
  type EmploymentInput,
} from "@/lib/validation/application";

const emptyRecord: EmploymentInput["records"][number] = {
  employer: "",
  position: "",
  country: "",
  startDate: "",
  endDate: "",
  current: false,
  responsibilities: "",
  reasonForLeaving: "",
};

export function WorkForm({
  offerId,
  defaults,
}: {
  offerId: string;
  defaults: EmploymentInput;
}) {
  const [error, setError] = useState<string>();
  const form = useForm<EmploymentInput>({
    resolver: zodResolver(employmentSchema),
    defaultValues: defaults.records.length ? defaults : { records: [emptyRecord] },
  });
  const fields = useFieldArray({ control: form.control, name: "records" });
  useUnsavedChanges(form.formState.isDirty);

  async function onSubmit(values: EmploymentInput) {
    setError(undefined);
    const result = await saveEmploymentAction(offerId, values);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error ?? "Please check the highlighted fields.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Work experience</h2>
        <p className="mt-1 text-sm text-muted">
          Start with your most recent role. Add more if you have them.
        </p>
        <FormBanner error={error} />
      </div>
      {fields.fields.map((field, index) => {
        const current = form.watch(`records.${index}.current`);
        return (
          <fieldset key={field.id} className="space-y-5 rounded-lg border border-border bg-white p-6 sm:p-8">
            <legend className="text-sm font-semibold text-navy">Role {index + 1}</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={`employer-${index}`} required>Employer</Label>
                <Input id={`employer-${index}`} {...form.register(`records.${index}.employer`)} />
                <FieldError>{form.formState.errors.records?.[index]?.employer?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor={`position-${index}`} required>Position</Label>
                <Input id={`position-${index}`} {...form.register(`records.${index}.position`)} />
                <FieldError>{form.formState.errors.records?.[index]?.position?.message}</FieldError>
              </div>
            </div>
            <div>
              <Label htmlFor={`country-${index}`} required>Country</Label>
              <Input id={`country-${index}`} {...form.register(`records.${index}.country`)} />
              <FieldError>{form.formState.errors.records?.[index]?.country?.message}</FieldError>
            </div>
            <label className="flex items-center gap-2 text-sm text-navy">
              <input type="checkbox" {...form.register(`records.${index}.current`)} />
              This is my current employment
            </label>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor={`start-${index}`} required>Start date</Label>
                <Input id={`start-${index}`} type="date" {...form.register(`records.${index}.startDate`)} />
                <FieldError>{form.formState.errors.records?.[index]?.startDate?.message}</FieldError>
              </div>
              {current ? null : (
                <div>
                  <Label htmlFor={`end-${index}`} required>End date</Label>
                  <Input id={`end-${index}`} type="date" {...form.register(`records.${index}.endDate`)} />
                  <FieldError>{form.formState.errors.records?.[index]?.endDate?.message}</FieldError>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor={`resp-${index}`} required>Responsibilities</Label>
              <Textarea id={`resp-${index}`} {...form.register(`records.${index}.responsibilities`)} />
              <FieldError>{form.formState.errors.records?.[index]?.responsibilities?.message}</FieldError>
            </div>
            {current ? null : (
              <div>
                <Label htmlFor={`reason-${index}`}>Reason for leaving</Label>
                <Input id={`reason-${index}`} {...form.register(`records.${index}.reasonForLeaving`)} />
              </div>
            )}
            {fields.fields.length > 1 ? (
              <Button type="button" variant="ghost" onClick={() => fields.remove(index)}>
                Remove this role
              </Button>
            ) : null}
          </fieldset>
        );
      })}
      <Button type="button" variant="outline" onClick={() => fields.append(emptyRecord)}>
        + Add work experience
      </Button>
      <div>
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save and continue"}
        </Button>
      </div>
    </form>
  );
}
