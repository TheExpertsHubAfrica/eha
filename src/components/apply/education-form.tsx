"use client";

import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError } from "@/components/ui/label";
import { FormBanner } from "@/components/apply/form-banner";
import { useUnsavedChanges } from "@/components/apply/use-unsaved-changes";
import { saveEducationAction } from "@/server/application/actions";
import {
  educationSchema,
  type EducationInput,
} from "@/lib/validation/application";

const emptyRecord = {
  qualification: "",
  institution: "",
  programme: "",
  graduationYear: "",
  languages: "",
  certifications: "",
};

export function EducationForm({
  offerId,
  defaults,
}: {
  offerId: string;
  defaults: EducationInput;
}) {
  const [error, setError] = useState<string>();
  const form = useForm<EducationInput>({
    resolver: zodResolver(educationSchema),
    defaultValues: defaults.records.length ? defaults : { records: [emptyRecord] },
  });
  const fields = useFieldArray({ control: form.control, name: "records" });
  useUnsavedChanges(form.formState.isDirty);

  async function onSubmit(values: EducationInput) {
    setError(undefined);
    const result = await saveEducationAction(offerId, values);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error ?? "Please check the highlighted fields.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-navy">Education</h2>
        <p className="mt-1 text-sm text-muted">
          Add your highest qualification first. You can include more if needed.
        </p>
        <FormBanner error={error} />
      </div>
      {fields.fields.map((field, index) => (
        <fieldset key={field.id} className="space-y-5 rounded-lg border border-border bg-white p-6 sm:p-8">
          <legend className="text-sm font-semibold text-navy">
            Qualification {index + 1}
          </legend>
          <div>
            <Label htmlFor={`qualification-${index}`} required>Highest qualification</Label>
            <Input id={`qualification-${index}`} {...form.register(`records.${index}.qualification`)} />
            <FieldError>{form.formState.errors.records?.[index]?.qualification?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor={`institution-${index}`} required>Institution</Label>
            <Input id={`institution-${index}`} {...form.register(`records.${index}.institution`)} />
            <FieldError>{form.formState.errors.records?.[index]?.institution?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor={`programme-${index}`}>Course / programme</Label>
            <Input id={`programme-${index}`} {...form.register(`records.${index}.programme`)} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor={`year-${index}`}>Graduation year</Label>
              <Input id={`year-${index}`} inputMode="numeric" {...form.register(`records.${index}.graduationYear`)} />
            </div>
            <div>
              <Label htmlFor={`languages-${index}`}>Languages</Label>
              <Input id={`languages-${index}`} {...form.register(`records.${index}.languages`)} />
            </div>
          </div>
          <div>
            <Label htmlFor={`certs-${index}`}>Professional certifications</Label>
            <Input id={`certs-${index}`} {...form.register(`records.${index}.certifications`)} />
          </div>
          {fields.fields.length > 1 ? (
            <Button type="button" variant="ghost" onClick={() => fields.remove(index)}>
              Remove this qualification
            </Button>
          ) : null}
        </fieldset>
      ))}
      <Button type="button" variant="outline" onClick={() => fields.append(emptyRecord)}>
        + Add another qualification
      </Button>
      <div>
        <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : "Save and continue"}
        </Button>
      </div>
    </form>
  );
}
