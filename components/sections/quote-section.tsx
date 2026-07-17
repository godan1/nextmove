import { QuoteForm } from "@/components/quote-form/quote-form";

export function QuoteSection() {
  return (
    <section id="quote" className="scroll-mt-20 py-14 sm:py-20 md:py-28">
      <div className="container max-w-content grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-start">
        <div>
          <p className="eyebrow mb-3">Get a quote</p>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-stencil md:text-4xl">
            Tell us about the move.
          </h2>
          <p className="mt-4 max-w-sm leading-relaxed text-muted">
            One quick form gets you a rate. Click &quot;Get a precise quote&quot; to add box
            counts, furniture, and photos for our most accurate number.
          </p>

          <dl className="mt-8 space-y-4 border-t border-line pt-6 font-mono text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Cost to you</dt>
              <dd className="font-semibold text-ink">Free</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Obligation to book</dt>
              <dd className="font-semibold text-ink">None</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Time to complete</dt>
              <dd className="font-semibold text-ink">~2 minutes</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-sm border border-line bg-white p-6 shadow-card md:p-10">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
