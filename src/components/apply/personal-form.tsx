"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label, FieldError, FieldHint } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/select";
import { FormBanner } from "@/components/apply/form-banner";
import { useUnsavedChanges } from "@/components/apply/use-unsaved-changes";
import { savePersonalAction } from "@/server/application/actions";
import {
  personalSchema,
  type PersonalInput,
} from "@/lib/validation/application";

export function PersonalForm({
  offerId,
  defaults,
}: {
  offerId: string;
  defaults: PersonalInput;
}) {
  const [error, setError] = useState<string>();
  const form = useForm<PersonalInput>({
    resolver: zodResolver(personalSchema),
    defaultValues: defaults,
  });
  const married = form.watch("maritalStatus") === "married";
  useUnsavedChanges(form.formState.isDirty);

  async function onSubmit(values: PersonalInput) {
    setError(undefined);
    const result = await savePersonalAction(offerId, values);
    if (result && !result.ok) {
      setError(result.error);
      if (result.fieldErrors) {
        for (const [key, message] of Object.entries(result.fieldErrors)) {
          form.setError(key as keyof PersonalInput, { message });
        }
      }
      toast.error(result.error ?? "Please check the highlighted fields.");
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-border bg-white p-6 sm:p-8">
      <div>
        <h2 className="text-xl font-semibold text-navy">Tell us about yourself</h2>
        <p className="mt-1 text-sm text-muted">
          We only collect identity details needed for this application. Religion is not requested.
        </p>
      </div>
      <FormBanner error={error} />
      <div>
        <Label htmlFor="fullName" required>Full name</Label>
        <Input id="fullName" autoComplete="name" {...form.register("fullName")} />
        <FieldError>{form.formState.errors.fullName?.message}</FieldError>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="dateOfBirth" required>Date of birth</Label>
          <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
          <FieldError>{form.formState.errors.dateOfBirth?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="placeOfBirth" required>Place of birth</Label>
          <Input id="placeOfBirth" {...form.register("placeOfBirth")} />
          <FieldError>{form.formState.errors.placeOfBirth?.message}</FieldError>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="nationality" required>Nationality</Label>
          <Input id="nationality" {...form.register("nationality")} />
          <FieldError>{form.formState.errors.nationality?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="previousNationality">Previous nationality</Label>
          <Input id="previousNationality" {...form.register("previousNationality")} />
          <FieldHint>Leave blank if not applicable.</FieldHint>
        </div>
      </div>
      <div>
        <Label htmlFor="passportNumber" required>Passport number</Label>
        <Input id="passportNumber" autoComplete="off" {...form.register("passportNumber")} />
        <FieldError>{form.formState.errors.passportNumber?.message}</FieldError>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone" required>Phone number</Label>
          <Input id="phone" type="tel" autoComplete="tel" {...form.register("phone")} />
          <FieldHint>Include your country code.</FieldHint>
          <FieldError>{form.formState.errors.phone?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="email" required>Email</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="countryOfResidence" required>Country of residence</Label>
          <Input id="countryOfResidence" {...form.register("countryOfResidence")} />
          <FieldError>{form.formState.errors.countryOfResidence?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="currentCity" required>Current city</Label>
          <Input id="currentCity" {...form.register("currentCity")} />
          <FieldError>{form.formState.errors.currentCity?.message}</FieldError>
        </div>
      </div>
      <div>
        <Label htmlFor="maritalStatus" required>Marital status</Label>
        <NativeSelect id="maritalStatus" {...form.register("maritalStatus")}>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
          <option value="separated">Separated</option>
        </NativeSelect>
      </div>
      {married ? (
        <fieldset className="space-y-5 border-t border-border pt-5">
          <legend className="text-sm font-medium text-navy">Spouse</legend>
          <div>
            <Label htmlFor="spouseName" required>Spouse full name</Label>
            <Input id="spouseName" {...form.register("spouseName")} />
            <FieldError>{form.formState.errors.spouseName?.message}</FieldError>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="spouseNationality" required>Spouse nationality</Label>
              <Input id="spouseNationality" {...form.register("spouseNationality")} />
              <FieldError>{form.formState.errors.spouseNationality?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="spouseDateOfBirth">Spouse date of birth</Label>
              <Input id="spouseDateOfBirth" type="date" {...form.register("spouseDateOfBirth")} />
            </div>
          </div>
          <div>
            <Label htmlFor="spousePlaceOfBirth">Spouse place of birth</Label>
            <Input id="spousePlaceOfBirth" {...form.register("spousePlaceOfBirth")} />
          </div>
        </fieldset>
      ) : null}
      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : "Save and continue"}
      </Button>
    </form>
  );
}
