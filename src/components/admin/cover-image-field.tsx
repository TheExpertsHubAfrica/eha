"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { CheckboxField } from "@/components/ui/select";

export function AdminCoverImageField({
  currentUrl,
  label = "Listing photo",
}: {
  currentUrl?: string | null;
  label?: string;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <fieldset className="rounded-lg border border-border p-4">
      <legend className="px-1 text-sm font-medium text-navy">{label}</legend>
      <p className="mt-1 text-sm text-muted">
        JPEG or PNG, maximum 5 MB. Shown on marketplace cards and package listings.
      </p>
      {(preview || currentUrl) && (
        // eslint-disable-next-line @next/next/no-img-element -- local blob / API preview
        <img
          src={preview || currentUrl || ""}
          alt="Current listing cover"
          className="mt-3 aspect-video w-full max-w-md object-cover"
        />
      )}
      <div className="mt-3 space-y-3">
        <div>
          <Label htmlFor="coverImage">Upload photo</Label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="mt-1 block w-full text-sm text-muted file:mr-3 file:rounded-md file:border file:border-border file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-navy"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                setPreview(null);
                return;
              }
              setPreview(URL.createObjectURL(file));
            }}
          />
        </div>
        {currentUrl && !preview ? (
          <CheckboxField id="removeCover" name="removeCover" label="Remove current photo" />
        ) : null}
      </div>
    </fieldset>
  );
}
