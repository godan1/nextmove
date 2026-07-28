"use client";

import { useRef } from "react";
import { CalendarDays, Tag, Briefcase, Recycle, ShieldCheck, DoorOpen } from "lucide-react";

const TIPS = [
  {
    label: "Tip 01",
    title: "Start 3–4 weeks out",
    body: "Begin with things you don't use often — off-season clothes, books, decor. Save daily essentials for the final days.",
    Icon: CalendarDays
  },
  {
    label: "Tip 02",
    title: "Label every box",
    body: "Room plus a one-line description (\"Kitchen — pots & pans\"). It's the single biggest time-saver on unload day.",
    Icon: Tag
  },
  {
    label: "Tip 03",
    title: "Pack an essentials bag",
    body: "Toiletries, chargers, medication, a change of clothes, and important documents — keep it with you, not on the truck.",
    Icon: Briefcase
  },
  {
    label: "Tip 04",
    title: "Declutter before you pack",
    body: "Donate, sell, or toss what you don't need. Less to pack, less to carry, less to pay for.",
    Icon: Recycle
  },
  {
    label: "Tip 05",
    title: "Protect fragile items",
    body: "Wrap dishes and glassware individually and use proper packing tape — the cheap stuff lets go halfway through the move.",
    Icon: ShieldCheck
  },
  {
    label: "Tip 06",
    title: "Clear the path on moving day",
    body: "Reserve parking or the elevator if you need to, and keep driveways and hallways clear so the crew can move quickly.",
    Icon: DoorOpen
  }
];

/**
 * Swipeable on touch (native scroll-snap, no JS needed) with arrow buttons
 * for mouse/keyboard users. Each slide gets an icon "picture" rather than
 * stock photography — the rest of the site is illustration/typography-led
 * (see RouteLineIcon), so this keeps the carousel visually consistent
 * instead of bolting on unrelated photos.
 */
export function MovingPrep() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 24 : track.clientWidth * 0.8;
    track.scrollBy({ left: amount * direction, behavior: "smooth" });
  }

  return (
    <section id="moving-tips" className="scroll-mt-20 border-b border-line py-14 sm:py-20 md:py-28">
      <div className="container max-w-content">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-3">Getting ready</p>
            <h2 className="max-w-lg font-display text-3xl font-semibold tracking-stencil md:text-4xl">
              How to prepare for moving day.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              A few habits that make packing faster and moving day smoother —
              from customers who&apos;ve done it before.
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous tip"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-harbor/40 hover:text-harbor"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scrollByCard(1)}
              aria-label="Next tip"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-harbor/40 hover:text-harbor"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {TIPS.map((tip) => (
            <div
              key={tip.label}
              data-card
              className="w-[82%] shrink-0 snap-center rounded-sm border border-line bg-white p-6 sm:w-[46%] lg:w-[31%]"
            >
              <div className="flex h-28 items-center justify-center rounded-sm bg-spruce-light/40">
                <tip.Icon className="h-12 w-12 text-harbor" strokeWidth={1.5} aria-hidden />
              </div>
              <span className="mt-4 block font-mono text-xs font-medium text-muted">{tip.label}</span>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-stencil">{tip.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{tip.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
