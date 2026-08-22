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
    <section className="bg-black text-white">
      <div className="container-wide py-14 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-white/60 uppercase">
          Why applicants choose us
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-bold text-white sm:text-3xl">
          Organised, careful, and built around a complete application — not a
          crowded homepage.
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((item, index) => (
            <article key={item.title} className="border-t border-white/15 pt-5">
              <p className="text-xs tracking-wide text-white/50">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/70">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
