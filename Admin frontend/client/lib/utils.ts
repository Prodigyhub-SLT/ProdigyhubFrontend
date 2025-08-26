import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Safely extract a human-readable label from TMF620-style refs or plain values
export function getCategoryLabel(input: any): string {
  if (!input) return 'Other';
  if (typeof input === 'string') return input;
  if (Array.isArray(input)) {
    const first = input[0];
    if (!first) return 'Other';
    return (first as any).name || (first as any).label || (first as any).id || 'Other';
  }
  if (typeof input === 'object') {
    return (input as any).name || (input as any).label || (input as any).id || 'Other';
  }
  return String(input);
}
