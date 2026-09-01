"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckboxField, NativeSelect } from "@/components/ui/select";
import {
  saveBlogAction,
  saveEmailTemplateAction,
  saveFaqAction,
  saveLegalPageAction,
  saveSiteSettingsAction,
  saveTestimonialAction,
} from "@/server/admin/cms-actions";

export function SiteSettingsForm({
  values,
}: {
  values: Record<string, string>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const result = await saveSiteSettingsAction(new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Contact details saved.");
      router.refresh();
    } catch {
      const message = "Could not save settings. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  const fields: { key: string; label: string }[] = [
    { key: "tagline", label: "Tagline" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Public email" },
    { key: "address", label: "Address" },
    { key: "hours", label: "Hours" },
    { key: "whatsapp", label: "WhatsApp number" },
    { key: "facebook", label: "Facebook URL" },
    { key: "instagram", label: "Instagram URL" },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "youtube", label: "YouTube URL" },
  ];
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <div key={field.key}>
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input id={field.key} name={field.key} defaultValue={values[field.key] ?? ""} />
        </div>
      ))}
      <p className="text-sm text-muted">
        Leave a field blank to hide it. API keys and the email From address stay in environment variables.
      </p>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save contact details"}
      </Button>
    </form>
  );
}

export function LegalPageForm({
  slug,
  title,
  body,
}: {
  slug: string;
  title: string;
  body: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const result = await saveLegalPageAction(slug, new FormData(event.currentTarget));
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Legal page saved.");
      router.refresh();
    } catch {
      const message = "Could not save this legal page. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor={`${slug}-title`}>Title</Label>
        <Input id={`${slug}-title`} name="title" defaultValue={title} required />
      </div>
      <div>
        <Label htmlFor={`${slug}-body`}>Body</Label>
        <Textarea id={`${slug}-body`} name="body" defaultValue={body} className="min-h-40" required />
        <p className="mt-1.5 text-xs text-muted">
          Use blank lines between sections. Numbered titles like{" "}
          <span className="font-medium">1. Purpose:</span> become section headings. Lines
          starting with <span className="font-medium"># </span> also create headings.
        </p>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

export function EmailTemplateForm({
  templateKey,
  name,
  subject,
  bodyText,
}: {
  templateKey: string;
  name: string;
  subject: string;
  bodyText: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(undefined);
    try {
      const result = await saveEmailTemplateAction(
        templateKey,
        new FormData(event.currentTarget),
      );
      if (!result.ok) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Template saved.");
      router.refresh();
    } catch {
      const message = "Could not save this template. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm font-medium text-navy">{name}</p>
      <div>
        <Label htmlFor={`${templateKey}-subject`}>Subject</Label>
        <Input id={`${templateKey}-subject`} name="subject" defaultValue={subject} required />
      </div>
      <div>
        <Label htmlFor={`${templateKey}-body`}>Body</Label>
        <Textarea id={`${templateKey}-body`} name="bodyText" defaultValue={bodyText} required />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save template"}
      </Button>
    </form>
  );
}

export function BlogForm({
  post,
}: {
  post?: { id: string; title: string; slug: string; excerpt: string; body: string; status: string };
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await saveBlogAction(post?.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
      setPending(false);
    }
  }
  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title" required>Title</Label>
        <Input id="title" name="title" defaultValue={post?.title} required />
      </div>
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={post?.slug} />
      </div>
      <div>
        <Label htmlFor="excerpt" required>Excerpt</Label>
        <Textarea id="excerpt" name="excerpt" className="min-h-24" defaultValue={post?.excerpt} required />
      </div>
      <div>
        <Label htmlFor="body" required>Body</Label>
        <Textarea id="body" name="body" className="min-h-56" defaultValue={post?.body} required />
      </div>
      <div>
        <Label htmlFor="status">Status</Label>
        <NativeSelect id="status" name="status" defaultValue={post?.status ?? "draft"}>
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="archived">archived</option>
        </NativeSelect>
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : post ? "Save post" : "Create post"}
      </Button>
    </form>
  );
}

export function FaqForm({
  item,
}: {
  item?: { id: string; question: string; answer: string; sortOrder: number; published: boolean };
}) {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await saveFaqAction(item?.id ?? null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success("FAQ saved.");
    }
    setPending(false);
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <Input name="question" placeholder="Question" defaultValue={item?.question} required />
      <Textarea name="answer" placeholder="Answer" defaultValue={item?.answer} className="min-h-24" required />
      <Input name="sortOrder" type="number" defaultValue={item?.sortOrder ?? 0} />
      <CheckboxField id={`faq-pub-${item?.id ?? "new"}`} name="published" label="Published" defaultChecked={item?.published ?? true} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : item ? "Update" : "Add FAQ"}
      </Button>
    </form>
  );
}

export function TestimonialForm() {
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function onSubmit(formData: FormData) {
    setPending(true);
    const result = await saveTestimonialAction(null, formData);
    if (result && !result.ok) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success("Testimonial saved.");
    }
    setPending(false);
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <Textarea name="quote" placeholder="Quote" required className="min-h-24" />
      <Input name="attribution" placeholder="Attribution (real name or organisation)" required />
      <CheckboxField id="testimonial-pub" name="published" label="Publish on homepage" />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Add testimonial"}
      </Button>
    </form>
  );
}
