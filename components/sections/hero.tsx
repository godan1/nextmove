import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { RouteLineIcon } from "@/components/route-line-icon";

export function Hero() {
  return (
    <section className="border-b border-line bg-paper">
      <div className="container grid max-w-content gap-12 py-12 sm:py-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-24">
        <div>
          <p className="eyebrow mb-4">Fredericton, NB · Local &amp; long-distance across the Maritimes</p>
          <h1 className="font-display text-4xl font-semibold leading-[1.08] tracking-stencil sm:text-[2.6rem] sm:leading-[1.05] md:text-6xl">
            One move.
            <br />
            Transparent price.
            <br />
            <span className="text-harbor">Stress-free</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            NextMove is a local, full-service moving company. Tell us about
            your move and we&apos;ll email you our best rate.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <Link href="#quote" className={buttonVariants("primary", "lg", "w-full sm:w-auto")}>
              Start my free quote
            </Link>
            <span className="font-mono text-xs text-muted">
              ~2 minutes · No obligation to book
            </span>
          </div>
        </div>

        <div className="rounded-sm border border-line bg-white p-6 shadow-card md:p-8">
          <p className="eyebrow mb-5">Sample request</p>
          <div className="flex items-center justify-between font-mono text-sm">
            <div>
              <p className="text-xs text-muted">From</p>
              <p className="font-semibold text-ink">Fredericton, NB</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">To</p>
              <p className="font-semibold text-ink">Halifax, NS</p>
            </div>
          </div>

          <RouteLineIcon className="my-4 h-16 w-full" />

          <dl className="grid grid-cols-2 gap-4 border-t border-line pt-5 font-mono text-sm">
            <div>
              <dt className="text-xs text-muted">Move size</dt>
              <dd className="mt-1 font-semibold text-ink">2-bedroom home</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Small boxes (2 cu ft)</dt>
              <dd className="mt-1 font-semibold text-ink">25</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Status</dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 font-semibold text-spruce">
                <span className="h-1.5 w-1.5 rounded-full bg-spruce" aria-hidden />
                Quote on its way
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Response time</dt>
              <dd className="mt-1 font-semibold text-ink">Same day, typically</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
