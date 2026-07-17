import { NextRequest, NextResponse } from "next/server";

// Same in-memory per-instance rate limit pattern as /api/quote, kept in its
// own bucket since a single form submission can fire up to 6 of these in
// parallel (one per attached photo).
const requestBuckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 24;

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

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
// ~1.5MB of binary data, base64-encoded (base64 adds ~33% overhead).
const MAX_BASE64_LENGTH = 2_000_000;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  if (rateLimited(`photo:${ip}`)) {
    return NextResponse.json(
      { ok: false, message: "Too many photo uploads. Please try again in a few minutes." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request." }, { status: 400 });
  }

  const { filename, mimeType, dataBase64 } = (body ?? {}) as {
    filename?: unknown;
    mimeType?: unknown;
    dataBase64?: unknown;
  };

  if (typeof mimeType !== "string" || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json({ ok: false, message: "Unsupported image type." }, { status: 400 });
  }

  if (typeof dataBase64 !== "string" || dataBase64.length === 0 || dataBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json({ ok: false, message: "Photo is too large or missing." }, { status: 400 });
  }

  const safeFilename = typeof filename === "string" ? filename.replace(/[^a-zA-Z0-9_.-]/g, "_").slice(0, 100) : "photo.jpg";

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!appsScriptUrl) {
    console.error("GOOGLE_APPS_SCRIPT_URL is not configured.");
    return NextResponse.json({ ok: false, message: "Photo uploads are not configured yet." }, { status: 503 });
  }

  try {
    const response = await fetch(appsScriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "uploadPhoto", filename: safeFilename, mimeType, dataBase64 })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok || !result?.url) {
      throw new Error(result?.message || `Apps Script returned ${response.status}`);
    }

    return NextResponse.json({ ok: true, url: result.url }, { status: 201 });
  } catch (error) {
    console.error("Photo upload failed to reach Apps Script", error);
    return NextResponse.json({ ok: false, message: "Could not upload that photo right now." }, { status: 500 });
  }
}
