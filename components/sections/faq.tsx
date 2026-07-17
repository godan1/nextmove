const FAQS = [
  {
    q: "Does it cost anything to get a quote?",
    a: "No. Submitting a request and getting a rate back from us is completely free."
  },
  {
    q: "How much will I pay for my move?",
    a: "The cost of your move depends on distance, size, and how much needs to move — access details like stairs and elevators factor in too. On average, a local move of about 1,000 cubic feet (a moderately furnished 2-bedroom apartment or small home) runs around $1,300, while a long-distance move of the same size can run upwards of $4,000. These are just estimates — after you submit the form, we'll review your details and email you an accurate, itemized rate for your specific move."
  },
  {
    q: "How does it work?",
    a: "Fill out the form with your move details — the more precise, the better. Our team prices the move based on your inventory and route, then emails you our best rate. No account, no obligation to book."
  },
  {
    q: "What if I don't have an exact date yet?",
    a: "That's fine — give us your best estimate. We can work with a flexible date and refine it with you directly."
  },
  {
    q: "What if you can't take my move?",
    a: "It happens occasionally — a date's already booked, or the route is outside what our crew can cover. When that happens, we won't just leave you hanging: we'll help connect you with a trusted local mover who can take care of it."
  },
  {
    q: "Can you move a hot tub? / Jacuzzi / Grand piano / Pool table / Gun safe / Aquarium / Large furniture?",
    a: "Yes, we can move specialty items like hot tubs, Jacuzzis, grand pianos, pool tables, gun safes, aquariums, and large furniture. These items may require special handling and can add to the cost, so flag them under \"Special or heavy items\" in the precise quote section — the more detail you give us, the more accurate your rate will be."
  }
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 border-b border-line py-14 sm:py-20 md:py-28">
      <div className="container max-w-content max-w-3xl">
        <p className="eyebrow mb-3">Questions</p>
        <h2 className="font-display text-3xl font-semibold tracking-stencil md:text-4xl">
          Before you fill out the form
        </h2>

        <div className="mt-10 divide-y divide-line border-y border-line">
          {FAQS.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium tracking-stencil">
                {item.q}
                <span
                  aria-hidden
                  className="shrink-0 font-mono text-xl text-muted transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
