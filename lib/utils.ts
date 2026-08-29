import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { randomBytes } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generates a URL-safe slug in the format xxxx-xxxx (lowercase a-z only)
export function generateApplySlug(): string {
  const alpha = "abcdefghijklmnopqrstuvwxyz";
  const bytes = randomBytes(8);
  const part = (offset: number) =>
    Array.from({ length: 4 }, (_, i) => alpha[bytes[offset + i] % 26]).join("");
  return `${part(0)}-${part(4)}`;
}
