const STOPS = [
  {
    label: "Stop 01",
    title: "Tell us about the move",
    body: "Route, date, size, and access details — one short form, about 2 minutes. Add box counts and photos for a sharper number."
  },
  {
    label: "Stop 02",
    title: "We price it ourselves",
    body: "Our crew reviews your inventory and distance and works out your rate directly — no third party involved."
  },
  {
    label: "Stop 03",
    title: "We email your best rate",
    body: "Review the quote, ask questions, and book your move date directly with us. No account, no obligation."
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-line py-14 sm:py-20 md:py-28">
      <div className="container max-w-content">
        <p className="eyebrow mb-3">How it works</p>
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-stencil md:text-4xl">
          Three stops between you and a moving quote.
        </h2>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {STOPS.map((stop, index) => (
            <li key={stop.label} className="relative">
              {index < STOPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute right-[-1rem] top-3 hidden h-px w-8 border-t border-dashed border-harbor/40 md:block"
                />
              )}
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-route" aria-hidden />
                <span className="font-mono text-xs font-medium text-muted">{stop.label}</span>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold tracking-stencil">
                {stop.title}
              </h3>
              <p className="mt-2 leading-relaxed text-muted">{stop.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
