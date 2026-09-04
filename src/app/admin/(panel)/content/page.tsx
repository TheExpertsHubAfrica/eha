import type { Metadata } from "next";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit";
import { FaqForm, TestimonialForm } from "@/components/admin/cms-forms";
import { AdminPageHeader } from "@/components/admin/page-header";
import { deleteFaqAction, deleteTestimonialAction } from "@/server/admin/cms-actions";
import { requireAdmin } from "@/server/admin/auth";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Content",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin("content.write");
  const [faqs, quotes] = await Promise.all([
    prisma.faqItem.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.testimonial.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <AdminPageHeader
          eyebrow="Site"
          title="FAQs"
          description="These appear on /faq when published."
        />
        <div className="mt-6 rounded-lg border border-border bg-white p-5">
          <FaqForm />
        </div>
        <ul className="mt-6 space-y-4">
          {faqs.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-5 transition-colors hover:border-gold/30">
              <FaqForm item={item} />
              <form action={deleteFaqAction.bind(null, item.id)} className="mt-3">
                <ConfirmSubmitButton
                  size="sm"
                  variant="ghost"
                  confirmMessage="Delete this FAQ permanently?"
                  idleLabel="Delete"
                  confirmLabel="Confirm delete"
                />
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <AdminPageHeader
          title="Testimonials"
          description="Only add quotes from real people. Unpublished quotes stay off the homepage."
        />
        <div className="mt-6 rounded-lg border border-border bg-white p-5">
          <TestimonialForm />
        </div>
        <ul className="mt-6 space-y-4">
          {quotes.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-5 text-sm transition-colors hover:border-gold/30">
              <p className="text-navy">{item.quote}</p>
              <p className="mt-2 text-muted">
                {item.attribution}
                {item.published ? " · published" : " · draft"}
              </p>
              <form action={deleteTestimonialAction.bind(null, item.id)} className="mt-3">
                <ConfirmSubmitButton
                  size="sm"
                  variant="ghost"
                  confirmMessage="Delete this testimonial permanently?"
                  idleLabel="Delete"
                  confirmLabel="Confirm delete"
                />
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
