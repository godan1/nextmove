"use client";

import { useRef, useState } from "react";
import { FieldLabel } from "@/components/ui/field";

export const MAX_PHOTOS = 6;
const MAX_DIMENSION = 1600;
const TARGET_BYTES = 1_000_000;

export type AttachedPhoto = {
  id: string;
  blob: Blob;
  previewUrl: string;
};

type Props = {
  photos: AttachedPhoto[];
  onChange: (photos: AttachedPhoto[]) => void;
};

/** Resizes an image client-side (max ~1600px long edge, JPEG) and iterates
 *  down in quality once more if it's still over ~1MB, so uploads stay fast
 *  without needing a server-side image library. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const toBlob = (quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not process image"))), "image/jpeg", quality);
    });

  let blob = await toBlob(0.75);
  if (blob.size > TARGET_BYTES) {
    blob = await toBlob(0.55);
  }
  return blob;
}

export function PhotoUpload({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError("");

    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const room = MAX_PHOTOS - photos.length;

    if (files.length > room) {
      setError(`You can attach up to ${MAX_PHOTOS} photos total.`);
    }

    const toProcess = files.slice(0, Math.max(room, 0));
    if (toProcess.length === 0) return;

    setProcessing(true);
    try {
      const compressed = await Promise.all(
        toProcess.map(async (file) => {
          const blob = await compressImage(file);
          return {
            id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            blob,
            previewUrl: URL.createObjectURL(blob)
          };
        })
      );
      onChange([...photos, ...compressed]);
    } catch {
      setError("Could not process one of those images. Try a different photo.");
    } finally {
      setProcessing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removePhoto(id: string) {
    const target = photos.find((p) => p.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange(photos.filter((p) => p.id !== id));
  }

  return (
    <div>
      <FieldLabel htmlFor="photos">Photos (optional)</FieldLabel>
      <p className="mb-2.5 text-sm leading-relaxed text-muted">
        A few photos of your rooms or larger items help us quote more accurately.
      </p>

      <div className="flex flex-wrap gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative h-20 w-20 overflow-hidden rounded-sm border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.previewUrl} alt="Attached photo preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(photo.id)}
              aria-label="Remove photo"
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-white hover:bg-ink"
            >
              ×
            </button>
          </div>
        ))}

        {photos.length < MAX_PHOTOS && (
          <label
            htmlFor="photos"
            className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-line text-center text-xs text-muted hover:border-harbor/50 hover:text-harbor"
          >
            <span className="text-lg leading-none">+</span>
            <span>{processing ? "Processing..." : "Add photo"}</span>
          </label>
        )}
      </div>

      <input
        ref={inputRef}
        id="photos"
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 font-mono text-xs text-muted">
        {photos.length} / {MAX_PHOTOS} photos
      </p>
      {error && (
        <p role="alert" className="mt-1.5 font-mono text-xs text-route">
          {error}
        </p>
      )}
    </div>
  );
}
