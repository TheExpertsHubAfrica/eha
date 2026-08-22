"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, type FieldErrors, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { FormBanner } from "@/components/apply/form-banner";
import { useUnsavedChanges } from "@/components/apply/use-unsaved-changes";
import { saveSupportingAction } from "@/server/application/actions";
import {
  stripEmptyDependants,
  supportingSchemaForJob,
  type SupportingInput,
} from "@/lib/validation/application";

const emptyTravel = { country: "", purpose: "", year: String(new Date().getUTCFullYear()), duration: "" };
const emptyDependant = { fullName: "", dateOfBirth: "", relationship: "Child" };

function firstErrorMessage(errors: FieldErrors<SupportingInput>): string | undefined {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    if ("message" in value && typeof value.message === "string") return value.message;
    const nested = firstErrorMessage(value as FieldErrors<SupportingInput>);
    if (nested) return nested;
  }
  return undefined;
}

export function SupportingForm({
  offerId,
  defaults,
  requireTravel,
  requireMilitary,
  requireEmergency,
  requireUaeContact,
}: {
  offerId: string;
  defaults: SupportingInput;
  requireTravel: boolean;
  requireMilitary: boolean;
  requireEmergency: boolean;
  requireUaeContact: boolean;
}) {
  const [error, setError] = useState<string>();
  const schema = useMemo(
    () =>
      supportingSchemaForJob({
        requireTravel,
        requireEmergency,
        requireMilitary,
      }),
    [requireTravel, requireEmergency, requireMilitary],
  );
  const form = useForm<SupportingInput>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  });
  const travel = useFieldArray({ control: form.control, name: "travel" });
  const dependants = useFieldArray({ control: form.control, name: "dependants" });
  const visited = form.watch("visitedAbroad");
  const military = form.watch("militaryService");
  const statement = form.watch("personalStatement") ?? "";
  useUnsavedChanges(form.formState.isDirty);

  function applyFieldErrors(fieldErrors: Record<string, string>) {
    for (const [key, message] of Object.entries(fieldErrors)) {
      form.setError(key as Path<SupportingInput>, { message });
    }
  }

  function onInvalid(errors: FieldErrors<SupportingInput>) {
    const message = firstErrorMessage(errors) ?? "Please check the highlighted fields.";
    setError(message);
    toast.error(message);
  }

  async function onSubmit(values: SupportingInput) {
    setError(undefined);
    const payload = { ...values, dependants: stripEmptyDependants(values.dependants) };
    const result = await saveSupportingAction(offerId, payload);
    if (result && !result.ok) {
      if (result.fieldErrors) applyFieldErrors(result.fieldErrors);
      const message = result.error ?? "Please check the highlighted fields.";
      setError(message);
      toast.error(message);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      <FormBanner error={error} />

      {requireTravel ? (
        <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-navy">Travel history</h2>
          <label className="mt-4 flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register("visitedAbroad")} />
            I have travelled outside my country of residence
          </label>
          {visited ? (
            <div className="mt-5 space-y-4">
              {travel.fields.map((field, index) => (
                <div key={field.id} className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor={`t-country-${index}`} required>Country</Label>
                    <Input id={`t-country-${index}`} {...form.register(`travel.${index}.country`)} />
                  </div>
                  <div>
                    <Label htmlFor={`t-purpose-${index}`} required>Purpose</Label>
                    <Input id={`t-purpose-${index}`} {...form.register(`travel.${index}.purpose`)} />
                  </div>
                  <div>
                    <Label htmlFor={`t-year-${index}`} required>Year</Label>
                    <Input id={`t-year-${index}`} inputMode="numeric" {...form.register(`travel.${index}.year`)} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor={`t-duration-${index}`} required>Duration</Label>
                    <Input id={`t-duration-${index}`} {...form.register(`travel.${index}.duration`)} />
                  </div>
                  {travel.fields.length > 1 ? (
                    <Button type="button" variant="ghost" onClick={() => travel.remove(index)}>
                      Remove
                    </Button>
                  ) : null}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => travel.append(emptyTravel)}>
                + Add country
              </Button>
              <FieldError>{form.formState.errors.travel?.message as string}</FieldError>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted">You can leave this blank if you have not travelled.</p>
          )}
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-navy">Children / dependants</h2>
        <p className="mt-1 text-sm text-muted">Optional. Add only if relevant to this application.</p>
        <div className="mt-4 space-y-4">
          {dependants.fields.map((field, index) => {
            const rowErrors = form.formState.errors.dependants?.[index];
            return (
            <div key={field.id} className="grid gap-3 rounded-md border border-border p-4 sm:grid-cols-3">
              <div>
                <Label htmlFor={`d-name-${index}`} required>Name</Label>
                <Input id={`d-name-${index}`} {...form.register(`dependants.${index}.fullName`)} />
                <FieldError>{rowErrors?.fullName?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor={`d-dob-${index}`} required>Date of birth</Label>
                <Input id={`d-dob-${index}`} type="date" {...form.register(`dependants.${index}.dateOfBirth`)} />
                <FieldError>{rowErrors?.dateOfBirth?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor={`d-rel-${index}`} required>Relationship</Label>
                <Input id={`d-rel-${index}`} {...form.register(`dependants.${index}.relationship`)} />
                <FieldError>{rowErrors?.relationship?.message}</FieldError>
              </div>
              <Button type="button" variant="ghost" onClick={() => dependants.remove(index)}>
                Remove
              </Button>
            </div>
            );
          })}
          <Button type="button" variant="outline" onClick={() => dependants.append(emptyDependant)}>
            + Add a dependant
          </Button>
        </div>
      </section>

      {requireEmergency ? (
        <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-navy">Emergency contact</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="emergencyName" required>Name</Label>
              <Input id="emergencyName" {...form.register("emergencyName")} />
              <FieldError>{form.formState.errors.emergencyName?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="emergencyRelationship" required>Relationship</Label>
              <Input id="emergencyRelationship" {...form.register("emergencyRelationship")} />
              <FieldError>{form.formState.errors.emergencyRelationship?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="emergencyPhone" required>Phone</Label>
              <Input id="emergencyPhone" type="tel" {...form.register("emergencyPhone")} />
              <FieldError>{form.formState.errors.emergencyPhone?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="emergencyEmail">Email</Label>
              <Input id="emergencyEmail" type="email" {...form.register("emergencyEmail")} />
              <FieldError>{form.formState.errors.emergencyEmail?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="emergencyCountry" required>Country</Label>
              <Input id="emergencyCountry" {...form.register("emergencyCountry")} />
              <FieldError>{form.formState.errors.emergencyCountry?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="emergencyCity" required>City</Label>
              <Input id="emergencyCity" {...form.register("emergencyCity")} />
              <FieldError>{form.formState.errors.emergencyCity?.message}</FieldError>
            </div>
          </div>
        </section>
      ) : null}

      {requireUaeContact ? (
        <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-navy">Contact person in the UAE</h2>
          <FieldHint>Only if you already know someone there. Optional.</FieldHint>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="uaeName">Name</Label>
              <Input id="uaeName" {...form.register("uaeName")} />
            </div>
            <div>
              <Label htmlFor="uaePhone">Phone</Label>
              <Input id="uaePhone" {...form.register("uaePhone")} />
            </div>
            <div>
              <Label htmlFor="uaeNationality">Nationality</Label>
              <Input id="uaeNationality" {...form.register("uaeNationality")} />
            </div>
            <div>
              <Label htmlFor="uaeWorkplace">Place of work</Label>
              <Input id="uaeWorkplace" {...form.register("uaeWorkplace")} />
            </div>
          </div>
        </section>
      ) : null}

      {requireMilitary ? (
        <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-navy">Military / security background</h2>
          <label className="mt-4 flex items-center gap-2 text-sm text-navy">
            <input type="checkbox" {...form.register("militaryService")} />
            I have previous military service
          </label>
          {military ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="militaryCountry" required>Country</Label>
                <Input id="militaryCountry" {...form.register("militaryCountry")} />
                <FieldError>{form.formState.errors.militaryCountry?.message}</FieldError>
              </div>
              <div>
                <Label htmlFor="militaryType" required>Type of service</Label>
                <Input id="militaryType" {...form.register("militaryType")} />
              </div>
              <div>
                <Label htmlFor="militaryRank">Rank</Label>
                <Input id="militaryRank" {...form.register("militaryRank")} />
              </div>
              <div>
                <Label htmlFor="militaryDuration" required>Duration</Label>
                <Input id="militaryDuration" {...form.register("militaryDuration")} />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-lg border border-border bg-white p-6 sm:p-8">
        <Label htmlFor="personalStatement" required>
          Tell us briefly about yourself and why you are interested in this opportunity.
        </Label>
        <Textarea id="personalStatement" {...form.register("personalStatement")} />
        <p className="mt-1.5 text-sm text-muted">{statement.length} / 1,000 characters</p>
        <FieldError>{form.formState.errors.personalStatement?.message}</FieldError>
      </section>

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save and continue"}
      </Button>
    </form>
  );
}
