import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-white/80">
      <div className="container max-w-content grid gap-10 py-14 md:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="font-display text-lg font-semibold tracking-stencil text-white">
            NextMove
          </span>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            NextMove is a local, full-service moving company based in
            Fredericton, NB. We handle local moves in the Fredericton area and
            long-distance moves across the Maritimes.
          </p>
        </div>

        <nav aria-label="Site" className="text-sm">
          <p className="eyebrow mb-3 text-white/50">Site</p>
          <ul className="space-y-2">
            <li><Link href="#how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="#service-area" className="hover:text-white">Service area</Link></li>
            <li><Link href="#moving-tips" className="hover:text-white">Moving tips</Link></li>
            <li><Link href="#faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="#quote" className="hover:text-white">Get a quote</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10 py-5 text-xs text-white/50">
        <div className="container max-w-content flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} NextMove. Fredericton, NB.</p>
          <p>Serving Fredericton locally and the Maritimes long-distance.</p>
        </div>
      </div>
    </footer>
  );
}
