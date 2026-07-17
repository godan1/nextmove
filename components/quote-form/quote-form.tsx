"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldLabel, FieldError, Input, Select } from "@/components/ui/field";
import { AddressFields } from "@/components/quote-form/address-fields";
import { PreciseQuoteFields } from "@/components/quote-form/precise-quote-fields";
import type { AttachedPhoto } from "@/components/quote-form/photo-upload";
import {
  MOVE_SIZES,
  quoteSchema,
  quoteDefaults,
  type QuoteValues
} from "@/lib/quote-schema";

type FormValues = typeof quoteDefaults;
type Status = "idle" | "submitting" | "success" | "error";

function issuesToErrorMap(issues: { path: (string | number)[]; message: string }[]) {
  const map: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0]);
    if (!(key in map)) map[key] = issue.message;
  }
  return map;
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Could not read photo."));
    reader.readAsDataURL(blob);
  });
}

async function uploadPhoto(photo: AttachedPhoto): Promise<string | null> {
  try {
    const dataBase64 = await blobToBase64(photo.blob);
    const response = await fetch("/api/upload-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: `${photo.id}.jpg`, mimeType: "image/jpeg", dataBase64 })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.url) return null;
    return result.url as string;
  } catch {
    return null;
  }
}

export function QuoteForm() {
  const [values, setValues] = useState<FormValues>(quoteDefaults);
  const [photos, setPhotos] = useState<AttachedPhoto[]>([]);
  const [showPrecise, setShowPrecise] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key as string];
        return next;
      });
    }
  }

  const updatePrecise: Parameters<typeof PreciseQuoteFields>[0]["onChange"] = (key, value) =>
    update(key, value as unknown as FormValues[typeof key]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (company) {
      // Honeypot tripped — silently no-op, don't tip off the bot.
      return;
    }

    const result = quoteSchema.safeParse({ ...values, photos: [], company: "" });
    if (!result.success) {
      setErrors(issuesToErrorMap(result.error.issues));
      const firstPath = result.error.issues[0]?.path[0];
      const preciseOnlyFields = new Set([
        "propertyType",
        "boxSmall2cu",
        "boxMedium3cu",
        "boxLarge5cu",
        "boxXLarge6cu",
        "totes",
        "beds",
        "dressers",
        "notes"
      ]);
      if (firstPath && preciseOnlyFields.has(String(firstPath))) setShowPrecise(true);
      return;
    }
    setErrors({});

    setStatus("submitting");
    setStatusMessage("");

    const uploadedUrls = (await Promise.all(photos.map(uploadPhoto))).filter(
      (url): url is string => Boolean(url)
    );

    const payload: QuoteValues = quoteSchema.parse({ ...values, photos: uploadedUrls, company: "" });

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || "Please check the form and try again.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Could not send the request right now.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-sm border border-spruce/30 bg-spruce-light p-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-spruce">Request sent</p>
        <h3 className="mt-3 font-display text-2xl font-semibold tracking-stencil">
          Thanks, {values.name.split(" ")[0] || "there"}.
        </h3>
        <p className="mx-auto mt-2 max-w-sm leading-relaxed text-muted">
          We&apos;ve got your move details — we&apos;ll email your best rate to{" "}
          <span className="font-medium text-ink">{values.email || "your inbox"}</span> shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Honeypot: hidden from real users, invisible to screen readers via aria-hidden + tabIndex. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      <div className="grid gap-5">
        <div>
          <FieldLabel htmlFor="name">Full name</FieldLabel>
          <Input
            id="name"
            autoComplete="name"
            value={values.name}
            error={errors.name}
            onChange={(e) => update("name", e.target.value)}
          />
          <FieldError>{errors.name}</FieldError>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={values.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />
            <FieldError>{errors.email}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              error={errors.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
            <FieldError>{errors.phone}</FieldError>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <AddressFields
            idPrefix="pickup"
            label="Moving from"
            streetValue={values.pickupStreet}
            streetError={errors.pickupStreet}
            onStreetChange={(v) => update("pickupStreet", v)}
            cityValue={values.pickupCity}
            cityError={errors.pickupCity}
            onCityChange={(v) => update("pickupCity", v)}
            postalValue={values.pickupPostalCode}
            onPostalChange={(v) => update("pickupPostalCode", v)}
            floorValue={values.pickupFloor}
            onFloorChange={(v) => update("pickupFloor", v)}
            aptValue={values.pickupApt}
            onAptChange={(v) => update("pickupApt", v)}
          />
          <AddressFields
            idPrefix="destination"
            label="Moving to"
            streetValue={values.destinationStreet}
            streetError={errors.destinationStreet}
            onStreetChange={(v) => update("destinationStreet", v)}
            cityValue={values.destinationCity}
            cityError={errors.destinationCity}
            onCityChange={(v) => update("destinationCity", v)}
            postalValue={values.destinationPostalCode}
            onPostalChange={(v) => update("destinationPostalCode", v)}
            floorValue={values.destinationFloor}
            onFloorChange={(v) => update("destinationFloor", v)}
            aptValue={values.destinationApt}
            onAptChange={(v) => update("destinationApt", v)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="date">Preferred date</FieldLabel>
            <Input
              id="date"
              type="date"
              value={values.date}
              error={errors.date}
              onChange={(e) => update("date", e.target.value)}
            />
            <FieldError>{errors.date}</FieldError>
          </div>
          <div>
            <FieldLabel htmlFor="size">Move size</FieldLabel>
            <Select
              id="size"
              value={values.size}
              error={errors.size}
              onChange={(e) => update("size", e.target.value as FormValues["size"])}
            >
              {MOVE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
            <FieldError>{errors.size}</FieldError>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button type="button" variant="secondary" onClick={() => setShowPrecise((v) => !v)}>
          {showPrecise ? "− Hide detailed inventory" : "+ Get a precise quote"}
        </Button>
        {!showPrecise && (
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Add box counts, furniture, and photos for our most accurate rate.
          </p>
        )}
      </div>

      {showPrecise && (
        <div className="mt-6">
          <PreciseQuoteFields
            values={values}
            errors={errors}
            onChange={updatePrecise}
            photos={photos}
            onPhotosChange={setPhotos}
          />
        </div>
      )}

      <p className="mt-6 max-w-xl rounded-sm border border-line bg-spruce-light/50 p-4 text-sm leading-relaxed text-ink">
        Every customer matters to us. If we&apos;re not the right fit for your move, we&apos;ll
        personally help connect you with a trusted local mover who can. Moving is stressful — we&apos;re
        glad to help either way.
      </p>

      {status === "error" && (
        <p role="alert" className="mt-4 font-mono text-sm text-route">
          {statusMessage}
        </p>
      )}

      <div className="mt-6">
        <Button type="submit" disabled={status === "submitting"} className="w-full sm:w-auto">
          {status === "submitting" ? "Sending..." : "Request my free quote"}
        </Button>
        <p className="mt-2 font-mono text-xs text-muted">
          We&apos;ll email you our best rate after you submit — no pressure, no obligation.
        </p>
      </div>
    </form>
  );
}
