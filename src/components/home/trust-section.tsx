import { siteImages } from "@/lib/site-images";

const steps = [
  {
    n: "01",
    title: "Profile submission",
    text: "CV, passport bio page, academic credentials and passport photo on a white background.",
  },
  {
    n: "02",
    title: "Training",
    text: "Prepare for the role and process with guided training from our team.",
  },
  {
    n: "03",
    title: "Interview",
    text: "Meet with employers or partners as part of the selection pathway.",
  },
  {
    n: "04",
    title: "Selection",
    text: "Successful candidates are confirmed for the next stage.",
  },
  {
    n: "05",
    title: "Remaining documents",
    text: "Police clearance, medical exam and yellow card.",
  },
  {
    n: "06",
    title: "Offer signing",
    text: "Review and sign your offer before visa processing begins.",
  },
  {
    n: "07",
    title: "Visa processing",
    text: "We guide you through visa submission and follow-up.",
  },
  {
    n: "08",
    title: "Orientation & departure",
    text: "Final briefing and support before you travel.",
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
          How it works
        </p>
        <div className="mt-3 h-0.5 w-10 bg-gold" aria-hidden="true" />
        <h2 className="mt-5 max-w-xl text-2xl font-bold text-white sm:text-3xl">
          Our application process is simple.
        </h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n} className="border-t border-white/10 pt-5">
              <p className="text-xs font-semibold tracking-wide text-gold-bright">
                {step.n}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 border-t border-white/10 pt-6 text-sm font-medium text-white/75">
          Entire process takes 15–30 days.
        </p>
      </div>
    </section>
  );
}
