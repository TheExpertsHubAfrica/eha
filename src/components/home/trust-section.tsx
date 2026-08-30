import { siteImages } from "@/lib/site-images";

const reasons = [
  {
    title: "Guided application process",
    text: "Applications move in clear steps: profile, documents, review, then submit.",
  },
  {
    title: "Experienced support",
    text: "Our team helps you prepare a complete file and understand what happens next.",
  },
  {
    title: "Transparent information",
    text: "Salary, benefits, and requirements are listed on each opportunity — not hidden in a homepage form.",
  },
  {
    title: "International opportunities",
    text: "Work, travel, and study pathways are organised in one professional platform.",
  },
  {
    title: "Dedicated applicant support",
    text: "Questions go to the published contact channels — phone, email, or WhatsApp when enabled.",
  },
  {
    title: "Secure document handling",
    text: "Identity documents are requested only after you start an application, and stored privately.",
  },
];

export function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-black text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${siteImages.home.trustTexture})` }}
        aria-hidden="true"
      />
      <div className="relative container-wide py-14 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-gold-bright uppercase">
          Why applicants choose us
        </p>
        <div className="mt-3 h-0.5 w-10 bg-gold" aria-hidden="true" />
        <h2 className="mt-5 max-w-xl text-2xl font-bold text-white sm:text-3xl">
          Organised, careful, and built around a complete application — not a
          crowded homepage.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((item, index) => (
            <article key={item.title} className="border-t border-white/10 pt-5">
              <p className="text-xs font-semibold tracking-wide text-gold-bright">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
