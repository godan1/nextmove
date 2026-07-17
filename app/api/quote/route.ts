import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { quoteSchema } from "@/lib/quote-schema";

// Simple in-memory rate limit (per server instance). Good enough for a
// single Node process; swap for a durable store (Upstash/Redis) once this
// runs on multiple instances/edge regions.
const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 8;

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

function preventSheetFormula(text: string) {
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, message: "Too many quote requests. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  // Honeypot: bots that fill every field get a fake success, no Sheets write.
  if (body && typeof body === "object" && "company" in body && (body as { company?: string }).company) {
    return NextResponse.json({ ok: true });
  }

  const parsed = quoteSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { ok: false, message: firstIssue?.message ?? "Please check the form and try again.", errors: parsed.error.issues },
      { status: 400 }
    );
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("GOOGLE_APPS_SCRIPT_URL is not configured.");
    return NextResponse.json(
      { ok: false, message: "Quote notifications are not configured yet." },
      { status: 503 }
    );
  }

  const requestId = randomUUID();
  const payload = {
    source: "nextmove-website",
    receivedAt: new Date().toISOString(),
    requestId,
    ...Object.fromEntries(
      Object.entries(parsed.data).map(([key, value]) => [
        key,
        typeof value === "string" ? preventSheetFormula(value) : value
      ])
    ),
    userAgent: req.headers.get("user-agent") ?? ""
  };

  try {
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Apps Script returned ${response.status}: ${text.slice(0, 240)}`);
    }
  } catch (error) {
    console.error("Quote request failed to reach Apps Script", error);
    return NextResponse.json(
      { ok: false, message: "Could not send the quote request right now." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, requestId, message: "Quote request sent." }, { status: 201 });
}
