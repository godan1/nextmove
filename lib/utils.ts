import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class lists safely (later classes win on conflicting
 * utilities). Standard shadcn/ui-style helper so components stay composable.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
