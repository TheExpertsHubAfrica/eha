"use client";

import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxField, NativeSelect } from "@/components/ui/select";
import { saveJobAction } from "@/server/admin/offer-actions";

const PROFILE_SECTIONS = [
  { key: "education", label: "Education" },
  { key: "workExperience", label: "Work experience" },
  { key: "travelHistory", label: "Travel history" },
  { key: "emergencyContact", label: "Emergency contact" },
  { key: "militaryHistory", label: "Military history" },
];

export type AdminJobFormValues = {
  id?: string;
  title: string;
  slug: string;
  citySlug: string;
  city: string;
  country: string;
  countryCode: string;
  category: string;
  salaryAmount: string;
  salaryCurrency: string;
  overview: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  accommodation: string;
  flight: string;
  visa: string;
  workingConditions: string;
  applicationRequirements: string;
  importantInformation: string;
  featured: boolean;
  status: string;
  availability: string;
  includesAccommodation: boolean;
  includesFlight: boolean;
  includesVisaSupport: boolean;
  profileSections: string[];
  documentRequirements: { key: string; name: string; required: boolean }[];
};

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
    </div>
  );
}

export function AdminJobForm({ job }: { job: AdminJobFormValues }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await saveJobAction(job.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="title" label="Title" required>
          <Input id="title" name="title" required defaultValue={job.title} />
        </Field>
        <Field id="category" label="Category" required>
          <Input id="category" name="category" required defaultValue={job.category} />
        </Field>
        <Field id="city" label="City" required>
          <Input id="city" name="city" required defaultValue={job.city} />
        </Field>
        <Field id="citySlug" label="City slug">
          <Input id="citySlug" name="citySlug" defaultValue={job.citySlug} />
        </Field>
        <Field id="country" label="Country" required>
          <Input id="country" name="country" required defaultValue={job.country} />
        </Field>
        <Field id="countryCode" label="Country code" required>
          <Input id="countryCode" name="countryCode" required maxLength={2} defaultValue={job.countryCode} />
        </Field>
        <Field id="slug" label="Job slug">
          <Input id="slug" name="slug" defaultValue={job.slug} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="salaryAmount" label="Salary amount" required>
            <Input id="salaryAmount" name="salaryAmount" type="number" required defaultValue={job.salaryAmount} />
          </Field>
          <Field id="salaryCurrency" label="Currency">
            <Input id="salaryCurrency" name="salaryCurrency" defaultValue={job.salaryCurrency} />
          </Field>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field id="status" label="Publish status">
          <NativeSelect id="status" name="status" defaultValue={job.status}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </NativeSelect>
        </Field>
        <Field id="availability" label="Availability">
          <NativeSelect id="availability" name="availability" defaultValue={job.availability}>
            <option value="open">open</option>
            <option value="limited">limited</option>
            <option value="closed">closed</option>
          </NativeSelect>
        </Field>
      </div>
      <div className="flex flex-wrap gap-4">
        <CheckboxField id="featured" name="featured" label="Featured" defaultChecked={job.featured} />
        <CheckboxField
          id="includesAccommodation"
          name="includesAccommodation"
          label="Accommodation included"
          defaultChecked={job.includesAccommodation}
        />
        <CheckboxField
          id="includesFlight"
          name="includesFlight"
          label="Flight included"
          defaultChecked={job.includesFlight}
        />
        <CheckboxField
          id="includesVisaSupport"
          name="includesVisaSupport"
          label="Visa support included"
          defaultChecked={job.includesVisaSupport}
        />
      </div>
      <Field id="overview" label="Overview">
        <Textarea id="overview" name="overview" defaultValue={job.overview} />
      </Field>
      <Field id="description" label="Description">
        <Textarea id="description" name="description" defaultValue={job.description} />
      </Field>
      <Field id="responsibilities" label="Responsibilities (one per line)">
        <Textarea id="responsibilities" name="responsibilities" defaultValue={job.responsibilities} />
      </Field>
      <Field id="requirements" label="Requirements (one per line)">
        <Textarea id="requirements" name="requirements" defaultValue={job.requirements} />
      </Field>
      <Field id="benefits" label="Benefits (one per line)">
        <Textarea id="benefits" name="benefits" defaultValue={job.benefits} />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field id="accommodation" label="Accommodation note">
          <Textarea id="accommodation" name="accommodation" className="min-h-24" defaultValue={job.accommodation} />
        </Field>
        <Field id="flight" label="Flight note">
          <Textarea id="flight" name="flight" className="min-h-24" defaultValue={job.flight} />
        </Field>
        <Field id="visa" label="Visa note">
          <Textarea id="visa" name="visa" className="min-h-24" defaultValue={job.visa} />
        </Field>
        <Field id="workingConditions" label="Working conditions">
          <Textarea id="workingConditions" name="workingConditions" className="min-h-24" defaultValue={job.workingConditions} />
        </Field>
      </div>
      <Field id="applicationRequirements" label="Application requirements (one per line)">
        <Textarea id="applicationRequirements" name="applicationRequirements" defaultValue={job.applicationRequirements} />
      </Field>
      <Field id="importantInformation" label="Important information (one per line)">
        <Textarea id="importantInformation" name="importantInformation" defaultValue={job.importantInformation} />
      </Field>
      <fieldset className="rounded-lg border border-border p-4">
        <legend className="px-1 text-sm font-medium text-navy">Required profile sections</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PROFILE_SECTIONS.map((section) => (
            <CheckboxField
              key={section.key}
              id={`section_${section.key}`}
              name={`section_${section.key}`}
              label={section.label}
              defaultChecked={job.profileSections.includes(section.key)}
            />
          ))}
        </div>
      </fieldset>
      {job.documentRequirements.length > 0 ? (
        <fieldset className="rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium text-navy">Document requirements</legend>
          <p className="mt-1 text-sm text-muted">New jobs start with passport bio, passport-size photo (white background), and CV. Toggle required on existing files.</p>
          <div className="mt-3 space-y-2">
            {job.documentRequirements.map((doc) => (
              <CheckboxField
                key={doc.key}
                id={`docRequired_${doc.key}`}
                name={`docRequired_${doc.key}`}
                label={doc.name}
                defaultChecked={doc.required}
              />
            ))}
          </div>
        </fieldset>
      ) : (
        <p className="text-sm text-muted">
          Saving a new job creates passport bio, passport-size photo, and CV requirements. You can mark them optional after the first save.
        </p>
      )}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : job.id ? "Save job" : "Create job"}
      </Button>
    </form>
  );
}
