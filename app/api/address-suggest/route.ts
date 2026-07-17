import { NextRequest, NextResponse } from "next/server";

/**
 * Proxies address search to Nominatim (OpenStreetMap) — free, no API key,
 * good enough for a small local site's traffic. If volume grows or
 * Nominatim's usage policy (~1 req/sec, discourages heavy autocomplete
 * traffic) becomes a bottleneck, swap in a paid provider (Google Places,
 * Mapbox, Canada Post AddressComplete) — this route is the only place that
 * needs to change; the client just expects `{ suggestions: AddressSuggestion[] }`.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
// Greater Fredericton area (Fredericton, Oromocto, New Maryland, Hanwell,
// Nashwaaksis, Marysville) bounding box — biases (doesn't restrict) results
// locally.
const FREDERICTON_VIEWBOX = "-66.85,45.78,-66.45,46.05";

const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 30;

function rateLimited(key: string) {
  const now = Date.now();
  const bucket = requestBuckets.get(key) ?? { count: 0, resetAt: now + WINDOW_MS };

  if (bucket.resetAt <= now) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  requestBuckets.set(key, bucket);
  return bucket.count > MAX_REQUESTS;
}

type NominatimResult = {
  display_name: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
  };
};

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ suggestions: [] }, { status: 429 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 4) {
    return NextResponse.json({ suggestions: [] });
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "ca");
  url.searchParams.set("limit", "8");
  url.searchParams.set("viewbox", FREDERICTON_VIEWBOX);
  url.searchParams.set("q", q);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        // Required by Nominatim's usage policy — identifies the client.
        "User-Agent": "NextMove-Fredericton-Website/1.0",
        "Accept-Language": "en-CA"
      }
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] });
    }

    const results = (await response.json()) as NominatimResult[];

    const suggestions = results
      .map((r) => {
        const a = r.address ?? {};
        const street = [a.house_number, a.road].filter(Boolean).join(" ");
        const city = a.city ?? a.town ?? a.village ?? a.municipality ?? "";
        const postalCode = a.postcode ?? "";
        // Keep the suggestion label to just street, city, postal code — drop
        // county/province/country that Nominatim's display_name includes.
        const label = [street, city, postalCode].filter(Boolean).join(", ");
        return { label: label || r.display_name, street: street || r.display_name, city, postalCode };
      })
      .filter((s) => s.street);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Address suggest request failed", error);
    return NextResponse.json({ suggestions: [] });
  }
}
