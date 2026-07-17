import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="container flex h-14 max-w-content items-center justify-between sm:h-16">
        <Link href="/" className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-sm bg-ink font-display text-sm font-bold tracking-stencil text-white"
          >
            NM
          </span>
          <span className="font-display text-lg font-semibold tracking-stencil">
            NextMove
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 text-sm font-medium md:flex">
          <Link href="#how-it-works" className="rounded-sm px-3 py-2 hover:bg-ink/5">
            How it works
          </Link>
          <Link href="#service-area" className="rounded-sm px-3 py-2 hover:bg-ink/5">
            Service area
          </Link>
          <Link href="#faq" className="rounded-sm px-3 py-2 hover:bg-ink/5">
            FAQ
          </Link>
        </nav>

        <Link href="#quote" className={buttonVariants("primary", "default", "h-10 px-4 text-sm")}>
          <span className="sm:hidden">Get a quote</span>
          <span className="hidden sm:inline">Get a free quote</span>
        </Link>
      </div>
    </header>
  );
}
