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

export function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="container-wide py-14 sm:py-16">
        <p className="eyebrow">How it works</p>
        <div className="gold-rule mt-3" aria-hidden="true" />
        <h2 className="mt-4 max-w-xl text-2xl font-bold text-black sm:text-3xl">
          Our application process is simple.
        </h2>
        <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.n}>
              <p className="text-sm font-semibold tracking-wide text-gold">
                {step.n}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-black">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 border-t border-border pt-6 text-sm font-medium text-fg-soft">
          Entire process takes 15–30 days.
        </p>
      </div>
    </section>
  );
}
