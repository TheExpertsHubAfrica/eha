"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxField, NativeSelect } from "@/components/ui/select";
import { saveStudyAction, saveTravelAction } from "@/server/admin/offer-actions";

export type AdminTravelFormValues = {
  id?: string;
  name: string;
  slug: string;
  destination: string;
  country: string;
  duration: string;
  summary: string;
  includes: string;
  excludes: string;
  featured: boolean;
  status: string;
  accent: string;
};

export type AdminStudyFormValues = {
  id?: string;
  name: string;
  slug: string;
  region: string;
  summary: string;
  support: string;
  featured: boolean;
  status: string;
};

export function AdminTravelForm({ pack }: { pack: AdminTravelFormValues }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await saveTravelAction(pack.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Name</Label>
          <Input id="name" name="name" required defaultValue={pack.name} />
        </div>
        <div>
          <Label htmlFor="destination" required>Destination</Label>
          <Input id="destination" name="destination" required defaultValue={pack.destination} />
        </div>
        <div>
          <Label htmlFor="country" required>Country</Label>
          <Input id="country" name="country" required defaultValue={pack.country} />
        </div>
        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input id="duration" name="duration" defaultValue={pack.duration} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={pack.slug} />
        </div>
        <div>
          <Label htmlFor="accent">Accent</Label>
          <NativeSelect id="accent" name="accent" defaultValue={pack.accent}>
            <option value="navy">navy</option>
            <option value="blue">blue</option>
            <option value="teal">teal</option>
            <option value="sand">sand</option>
            <option value="rose">rose</option>
          </NativeSelect>
        </div>
      </div>
      <div>
        <Label htmlFor="status">Publish status</Label>
        <NativeSelect id="status" name="status" defaultValue={pack.status}>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </NativeSelect>
      </div>
      <CheckboxField id="featured" name="featured" label="Featured" defaultChecked={pack.featured} />
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" defaultValue={pack.summary} />
      </div>
      <div>
        <Label htmlFor="includes">Includes (one per line)</Label>
        <Textarea id="includes" name="includes" defaultValue={pack.includes} />
      </div>
      <div>
        <Label htmlFor="excludes">Excludes (one per line)</Label>
        <Textarea id="excludes" name="excludes" defaultValue={pack.excludes} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : pack.id ? "Save package" : "Create package"}
      </Button>
    </form>
  );
}

export function AdminStudyForm({ item }: { item: AdminStudyFormValues }) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(undefined);
    const result = await saveStudyAction(item.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="name" required>Name</Label>
          <Input id="name" name="name" required defaultValue={item.name} />
        </div>
        <div>
          <Label htmlFor="region" required>Region</Label>
          <Input id="region" name="region" required defaultValue={item.region} />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={item.slug} />
        </div>
        <div>
          <Label htmlFor="status">Publish status</Label>
          <NativeSelect id="status" name="status" defaultValue={item.status}>
            <option value="draft">draft</option>
            <option value="published">published</option>
            <option value="archived">archived</option>
          </NativeSelect>
        </div>
      </div>
      <CheckboxField id="featured" name="featured" label="Featured" defaultChecked={item.featured} />
      <div>
        <Label htmlFor="summary">Summary</Label>
        <Textarea id="summary" name="summary" defaultValue={item.summary} />
      </div>
      <div>
        <Label htmlFor="support">Support items (one per line)</Label>
        <Textarea id="support" name="support" defaultValue={item.support} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : item.id ? "Save destination" : "Create destination"}
      </Button>
    </form>
  );
}
