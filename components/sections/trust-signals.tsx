const CHECKS = [
  {
    title: "Licensed and insured",
    body: "NextMove and our crew carry valid commercial insurance on every move, local or long-distance."
  },
  {
    title: "One form, not five phone calls",
    body: "Describe the move once. We come back to you with a quote instead of you chasing estimates."
  },
  {
    title: "Your info stays private",
    body: "Your details are used only to quote and coordinate your move — never sold or shared with a marketing list."
  },
  {
    title: "Every customer matters",
    body: "Even if we can't take your move, we'll personally help you find a trusted local mover who can."
  }
];

export function TrustSignals() {
  return (
    <section className="border-b border-line bg-spruce-light/40 py-14 sm:py-20 md:py-28">
      <div className="container max-w-content">
        <p className="eyebrow mb-3">Why customers choose us</p>
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-stencil md:text-4xl">
          A local crew that shows up and does the job right.
        </h2>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {CHECKS.map((item) => (
            <div key={item.title} className="rounded-sm border border-line bg-white p-6">
              <h3 className="font-display text-lg font-semibold tracking-stencil">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
