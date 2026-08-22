import type { Metadata } from "next";
import { FaqForm, TestimonialForm } from "@/components/admin/cms-forms";
import { Button } from "@/components/ui/button";
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
        <h1 className="text-2xl font-semibold text-navy">FAQs</h1>
        <p className="mt-1 mb-6 text-sm text-muted">These appear on /faq when published.</p>
        <div className="rounded-lg border border-border bg-white p-5">
          <FaqForm />
        </div>
        <ul className="mt-6 space-y-6">
          {faqs.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-5">
              <FaqForm item={item} />
              <form action={deleteFaqAction.bind(null, item.id)} className="mt-3">
                <Button type="submit" size="sm" variant="ghost">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-2xl font-semibold text-navy">Testimonials</h2>
        <p className="mt-1 mb-6 text-sm text-muted">
          Only add quotes from real people. Unpublished quotes stay off the homepage.
        </p>
        <div className="rounded-lg border border-border bg-white p-5">
          <TestimonialForm />
        </div>
        <ul className="mt-6 space-y-4">
          {quotes.map((item) => (
            <li key={item.id} className="rounded-lg border border-border bg-white p-5 text-sm">
              <p className="text-navy">{item.quote}</p>
              <p className="mt-2 text-muted">
                {item.attribution}
                {item.published ? " · published" : " · draft"}
              </p>
              <form action={deleteTestimonialAction.bind(null, item.id)} className="mt-3">
                <Button type="submit" size="sm" variant="ghost">
                  Delete
                </Button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
