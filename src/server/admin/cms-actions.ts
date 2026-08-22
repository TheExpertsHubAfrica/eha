"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SETTING_KEYS } from "@/lib/site-config";
import { slugify } from "@/lib/slug";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { prisma } from "@/server/db";
import { DEFAULT_EMAIL_TEMPLATES } from "@/server/email/custom";

function isUniqueConflict(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function saveSiteSettingsAction(formData: FormData) {
  const admin = await requireAdmin("settings.write");
  await prisma.$transaction(
    SETTING_KEYS.map((key) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value: String(formData.get(key) ?? "").trim() },
        create: { key, value: String(formData.get(key) ?? "").trim() },
      }),
    ),
  );
  await writeAdminAudit({
    actorId: admin.id,
    action: "settings.update",
    targetType: "SiteSetting",
    targetId: "contact",
  });
  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function saveLegalPageAction(slug: string, formData: FormData) {
  const admin = await requireAdmin("settings.write");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return { ok: false as const, error: "Title and body are required." };
  await prisma.legalPage.upsert({
    where: { slug },
    update: { title, body },
    create: { slug, title, body },
  });
  await writeAdminAudit({
    actorId: admin.id,
    action: "legal.update",
    targetType: "LegalPage",
    targetId: slug,
  });
  revalidatePath(`/${slug === "terms" ? "terms" : slug}`);
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function saveEmailTemplateAction(key: string, formData: FormData) {
  const admin = await requireAdmin("settings.write");
  const fallback = DEFAULT_EMAIL_TEMPLATES.find((item) => item.key === key);
  if (!fallback) return { ok: false as const, error: "Unknown template." };
  const subject = String(formData.get("subject") ?? "").trim();
  const bodyText = String(formData.get("bodyText") ?? "").trim();
  if (!subject || !bodyText) return { ok: false as const, error: "Subject and body are required." };
  await prisma.emailTemplate.upsert({
    where: { key },
    update: { subject, bodyText, name: fallback.name },
    create: { key, name: fallback.name, subject, bodyText },
  });
  await writeAdminAudit({
    actorId: admin.id,
    action: "email_template.update",
    targetType: "EmailTemplate",
    targetId: key,
  });
  revalidatePath("/admin/settings");
  return { ok: true as const };
}

export async function saveBlogAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("content.write");
  const title = String(formData.get("title") ?? "").trim();
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "draft") as "draft" | "published" | "archived";
  if (!title || !excerpt || !body) {
    return { ok: false as const, error: "Title, excerpt, and body are required." };
  }
  const slug = slugify(String(formData.get("slug") ?? title));
  if (!slug) return { ok: false as const, error: "Slug must contain letters or numbers." };
  const data = {
    title,
    excerpt,
    body,
    slug,
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
  try {
    const saved = id
      ? await prisma.blogPost.update({
          where: { id },
          data: {
            ...data,
            publishedAt:
              status === "published"
                ? ((await prisma.blogPost.findUnique({ where: { id } }))?.publishedAt ?? new Date())
                : null,
          },
        })
      : await prisma.blogPost.create({ data });
    await writeAdminAudit({
      actorId: admin.id,
      action: id ? "blog.update" : "blog.create",
      targetType: "BlogPost",
      targetId: saved.id,
      metadata: { status },
    });
    revalidatePath("/blog");
    revalidatePath("/admin/blog");
    redirect(`/admin/blog/${saved.id}`);
  } catch (error) {
    if (isUniqueConflict(error)) {
      return { ok: false as const, error: "A post with this slug already exists." };
    }
    throw error;
  }
}

export async function saveFaqAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("content.write");
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!question || !answer) return { ok: false as const, error: "Question and answer are required." };
  const published = formData.get("published") === "1";
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const saved = id
    ? await prisma.faqItem.update({
        where: { id },
        data: { question, answer, published, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
      })
    : await prisma.faqItem.create({
        data: { question, answer, published, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
      });
  await writeAdminAudit({
    actorId: admin.id,
    action: id ? "faq.update" : "faq.create",
    targetType: "FaqItem",
    targetId: saved.id,
  });
  revalidatePath("/faq");
  revalidatePath("/admin/content");
  return { ok: true as const };
}

export async function deleteFaqAction(id: string) {
  const admin = await requireAdmin("content.write");
  await prisma.faqItem.delete({ where: { id } });
  await writeAdminAudit({
    actorId: admin.id,
    action: "faq.delete",
    targetType: "FaqItem",
    targetId: id,
  });
  revalidatePath("/faq");
  revalidatePath("/admin/content");
}

export async function saveTestimonialAction(id: string | null, formData: FormData) {
  const admin = await requireAdmin("content.write");
  const quote = String(formData.get("quote") ?? "").trim();
  const attribution = String(formData.get("attribution") ?? "").trim();
  if (!quote || !attribution) {
    return { ok: false as const, error: "Quote and attribution are required. Do not invent testimonials." };
  }
  const published = formData.get("published") === "1";
  const sortOrder = Number(formData.get("sortOrder") || 0);
  const saved = id
    ? await prisma.testimonial.update({
        where: { id },
        data: { quote, attribution, published, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
      })
    : await prisma.testimonial.create({
        data: { quote, attribution, published, sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0 },
      });
  await writeAdminAudit({
    actorId: admin.id,
    action: id ? "testimonial.update" : "testimonial.create",
    targetType: "Testimonial",
    targetId: saved.id,
  });
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true as const };
}

export async function deleteTestimonialAction(id: string) {
  const admin = await requireAdmin("content.write");
  await prisma.testimonial.delete({ where: { id } });
  await writeAdminAudit({
    actorId: admin.id,
    action: "testimonial.delete",
    targetType: "Testimonial",
    targetId: id,
  });
  revalidatePath("/");
  revalidatePath("/admin/content");
}
