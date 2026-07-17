const COVERAGE = [
  {
    code: "Local",
    name: "Fredericton & area",
    note: "Downtown, Nashwaaksis, New Maryland, Oromocto, Hanwell, and surrounding neighborhoods"
  },
  {
    code: "Long-distance",
    name: "Across the Maritimes",
    note: "New Brunswick, Nova Scotia, PEI, and beyond — full-service moves, one crew door to door"
  }
];

export function ServiceArea() {
  return (
    <section id="service-area" className="scroll-mt-20 border-b border-line bg-ink py-14 text-white sm:py-20 md:py-28">
      <div className="container max-w-content grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center">
        <div>
          <p className="eyebrow mb-3">Where we cover</p>
          <h2 className="font-display text-3xl font-semibold tracking-stencil text-white md:text-4xl">
            Based in Fredericton, NB. We drive the whole route ourselves.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-white/70">
            Local moves around Fredericton, and long-distance moves across
            Atlantic Canada — including seasonal timing for longer routes.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {COVERAGE.map((area) => (
            <div key={area.code} className="rounded-sm border border-white/15 bg-white/5 p-5">
              <p className="font-mono text-lg font-semibold text-route">{area.code}</p>
              <p className="mt-3 font-semibold">{area.name}</p>
              <p className="mt-1 text-sm text-white/60">{area.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
