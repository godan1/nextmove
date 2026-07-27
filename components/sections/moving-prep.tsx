const TIPS = [
  {
    label: "Tip 01",
    title: "Start 3–4 weeks out",
    body: "Begin with things you don't use often — off-season clothes, books, decor. Save daily essentials for the final days."
  },
  {
    label: "Tip 02",
    title: "Label every box",
    body: "Room plus a one-line description (\"Kitchen — pots & pans\"). It's the single biggest time-saver on unload day."
  },
  {
    label: "Tip 03",
    title: "Pack an essentials bag",
    body: "Toiletries, chargers, medication, a change of clothes, and important documents — keep it with you, not on the truck."
  },
  {
    label: "Tip 04",
    title: "Declutter before you pack",
    body: "Donate, sell, or toss what you don't need. Less to pack, less to carry, less to pay for."
  },
  {
    label: "Tip 05",
    title: "Protect fragile items",
    body: "Wrap dishes and glassware individually and use proper packing tape — the cheap stuff lets go halfway through the move."
  },
  {
    label: "Tip 06",
    title: "Clear the path on moving day",
    body: "Reserve parking or the elevator if you need to, and keep driveways and hallways clear so the crew can move quickly."
  }
];

export function MovingPrep() {
  return (
    <section id="moving-tips" className="scroll-mt-20 border-b border-line py-14 sm:py-20 md:py-28">
      <div className="container max-w-content">
        <p className="eyebrow mb-3">Getting ready</p>
        <h2 className="max-w-lg font-display text-3xl font-semibold tracking-stencil md:text-4xl">
          How to prepare for moving day.
        </h2>
        <p className="mt-4 max-w-xl leading-relaxed text-muted">
          A few habits that make packing faster and moving day smoother — from
          customers who&apos;ve done it before.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map((tip) => (
            <div key={tip.label} className="rounded-sm border border-line bg-white p-6">
              <span className="font-mono text-xs font-medium text-muted">{tip.label}</span>
              <h3 className="mt-3 font-display text-lg font-semibold tracking-stencil">{tip.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
