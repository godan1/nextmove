"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/field";

export type AddressSuggestion = {
  label: string;
  street: string;
  city: string;
  postalCode: string;
};

type Props = {
  id: string;
  value: string;
  error?: string;
  placeholder?: string;
  onChange: (value: string) => void;
  onSelectSuggestion: (suggestion: AddressSuggestion) => void;
};

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 4;

/** A plain street-address input with a live suggestions dropdown (debounced
 *  fetch to /api/address-suggest). Selecting a suggestion fills in the
 *  street text and hands city/postal code back to the parent to auto-fill
 *  those fields — the user can still edit everything by hand. */
export function StreetAutocomplete({ id, value, error, placeholder, onChange, onSelectSuggestion }: Props) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(next: string) {
    onChange(next);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();

    if (next.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      try {
        const response = await fetch(`/api/address-suggest?q=${encodeURIComponent(next)}`, {
          signal: controller.signal
        });
        const result = await response.json().catch(() => ({ suggestions: [] }));
        setSuggestions(result.suggestions ?? []);
        setOpen(true);
      } catch {
        // Aborted (newer keystroke) or network error — leave suggestions as-is.
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }

  function selectSuggestion(s: AddressSuggestion) {
    onSelectSuggestion(s);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={containerRef} className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        error={error}
        autoComplete="off"
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {open && (suggestions.length > 0 || loading) && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-sm border border-line bg-white shadow-md">
          {loading && suggestions.length === 0 && <li className="px-3.5 py-2 text-sm text-muted">Searching...</li>}
          {suggestions.map((s, i) => (
            <li key={`${s.label}-${i}`}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="block w-full px-3.5 py-2 text-left text-sm text-ink hover:bg-spruce-light"
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
