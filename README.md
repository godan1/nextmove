# NextMove

Marketing/lead-capture website for NextMove, a local moving company based in
Fredericton, NB. NextMove does the move itself — local moves in the
Fredericton area, long-distance moves across the Maritimes. The site collects
a quote request (with an optional detailed inventory and photos) and emails
the customer a rate directly.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript (strict) · Tailwind CSS ·
shadcn/ui-style primitives · Zod validation · Google Sheets + Google Drive
(via Apps Script) as the only datastore.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in GOOGLE_APPS_SCRIPT_URL
npm run dev
```

Open http://localhost:3000.

## Connecting Google Sheets

1. Open (or create) the Google Sheet you want leads written to.
2. Extensions → Apps Script, paste in `apps-script/Code.gs`.
3. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**.
4. Copy the `/exec` URL into `GOOGLE_APPS_SCRIPT_URL` in `.env.local`.
5. Re-deploy (Manage deployments → Edit → New version) any time
   `apps-script/Code.gs` changes — the live URL keeps pointing at whatever
   version was deployed last.

The `Leads` sheet is created automatically on first submission, formatted via
`formatLeadsSheet_` (colored bold header, sized columns, wrapped long-text
columns, alternating row colors, formatted date) — this runs automatically
on first creation; run it manually from the Apps Script editor's function
dropdown to apply it to a sheet that already has rows. Numeric columns (box
counts, totes, beds, dressers, stairs, elevators) are stored as real numbers
so they sort/filter correctly.

Every new lead also sends a Telegram message via `notifyTelegram_`, gated on
two Script Properties (Apps Script editor → gear icon → Project Settings →
Script Properties) — `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`. Leave
either unset to disable notifications; never hardcode the token in
`Code.gs` itself, since that file is visible to anyone with edit access to
the script. To find your chat id: message the bot once on Telegram, then
open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and read
`result[0].message.chat.id` from the JSON response.

### Photo uploads

The "Get a precise quote" section lets customers attach up to 6 photos.
Photos are resized client-side (`components/quote-form/photo-upload.tsx`, via
`<canvas>`, ~1MB target) so uploads stay fast, then sent one at a time to
`app/api/upload-photo/route.ts`, which forwards each to the same Apps Script
deployment with `action: "uploadPhoto"`. `Code.gs` decodes the base64 payload,
saves it into a "NextMove Lead Photos" Drive folder (created automatically on
first upload), sets link-sharing to viewable, and returns the file URL. Those
URLs are collected client-side and included as a `photos` field when the lead
itself is submitted — the main `/api/quote` payload never carries binary
image data, only links.

## Architecture notes

- **Server Components by default.** Only the quote form (`components/
  quote-form/quote-form.tsx`) and its child inputs are client components —
  everything else ships zero JS.
- **One Zod schema, several consumers.** `lib/quote-schema.ts` defines
  `contactBoxSchema` (always required — name, contact info, exact pickup/
  destination address, date, move size), `preciseQuoteSchema` (optional,
  numeric defaults — box counts by size, totes, beds, dressers, misc items,
  special items, stairs, elevators, notes), and `photosSchema`. `quoteSchema`
  merges all three plus the honeypot field. The form validates client-side
  for UX; `app/api/quote/route.ts` re-validates the full payload
  server-side, since client-side validation is not a security boundary.
- **Single-page form with progressive disclosure.** The Contact box (name,
  email, phone, pickup/destination address, date, move size) is always
  visible and submittable on its own. A "Get a precise quote" button toggles
  `components/quote-form/precise-quote-fields.tsx`, which adds the detailed
  inventory and photo upload. This replaced an earlier 3-step wizard —
  submitting a quick quote shouldn't require walking through steps the
  customer doesn't care about.
- **Exact address with live suggestions, not a dropdown.**
  `components/quote-form/address-fields.tsx` collects street, city, postal
  code, and (for condos/apartments) floor + unit number for both pickup and
  destination. The street input (`components/quote-form/
  street-autocomplete.tsx`) is a debounced autocomplete backed by
  `app/api/address-suggest/route.ts`, which proxies Nominatim
  (OpenStreetMap) — free, no API key, results biased toward Fredericton, NB.
  Selecting a suggestion auto-fills city + postal code; every field stays
  editable by hand. Nominatim's usage policy discourages heavy
  autocomplete-style traffic (~1 req/sec, no guaranteed uptime) — fine for a
  small local site, but swap in a paid provider (Google Places Autocomplete,
  Mapbox, Canada Post AddressComplete) if volume grows or reliability
  becomes an issue; only `app/api/address-suggest/route.ts` would need to
  change, since the client just expects `{ suggestions: [{ label, street,
  city, postalCode }] }`.
- **Honeypot + rate limit**, ported from the previous Express backend
  (`company` field + 8 req/10 min per IP on `/api/quote`; the photo upload
  route has its own bucket at 24 req/10 min per IP, since one submission can
  fire up to 6 photo uploads in parallel).
- **FAQ uses native `<details>`/`<summary>`** — zero JS, works with
  find-in-page, indexable by search engines.

## Design system

Token system lives in `tailwind.config.ts` (colors: `paper`, `ink`,
`harbor`, `spruce`, `route`; type: `--font-display` Oswald, `--font-body` IBM
Plex Sans, `--font-mono` IBM Plex Mono, set in `app/layout.tsx`).

Signature element: a stenciled route line with pins
(`components/route-line-icon.tsx`), used decoratively in the hero.

## What's still a placeholder

- The footer's phone number and email (`components/layout/site-footer.tsx`)
  are placeholders — swap in the real business contact info.
- Copy in `components/sections/*` is real but generic — swap in your actual
  crew size, response-time numbers, licensing details, etc. once you have
  them; avoid inventing specific stats you can't back up.
- `metadataBase` in `app/layout.tsx` and the URLs in `app/sitemap.ts` /
  `app/robots.ts` point at `https://www.nextmove.ca` — update once the real
  domain is set.
- No photography is used (the hero uses the route-line device instead), so
  there's nothing to swap if you don't have brand photography yet. If you
  get real photos later, add them via `next/image` in `components/sections/
  hero.tsx`.
