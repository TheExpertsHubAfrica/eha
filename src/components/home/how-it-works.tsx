const steps = [
  {
    n: "01",
    title: "Explore",
    text: "Find an opportunity that matches your goals.",
  },
  {
    n: "02",
    title: "Apply",
    text: "Complete your work profile and provide the required documents for that offer.",
  },
  {
    n: "03",
    title: "Review",
    text: "Our team reviews your submission and follows up if anything is missing.",
  },
  {
    n: "04",
    title: "Next steps",
    text: "Receive updates and guidance on processing for your application.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white">
      <div className="container-wide py-14 sm:py-16">
        <p className="text-xs font-semibold tracking-[0.16em] text-blue uppercase">
          How it works
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-semibold text-navy sm:text-3xl">
          Four clear stages from discovery to next steps.
        </h2>
        <ol className="mt-10 grid gap-0 md:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.n}
              className="relative border-t border-border py-6 md:border-t-0 md:border-l md:px-6 md:py-0 first:md:border-l-0 first:md:pl-0"
            >
              <p className="text-sm font-semibold tracking-wide text-gold">
                {step.n}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-navy">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted">{step.text}</p>
              {index < steps.length - 1 ? (
                <span className="sr-only">Then</span>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
