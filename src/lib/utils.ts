import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
}

export function formatYear(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric'
  }).format(new Date(date));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalize URL by adding protocol if missing
 * Handles special cases like mailto:, #, and empty strings
 */
export function normalizeUrl(url: string | undefined | null): string {
  if (!url || url === '#' || url === '') {
    return '#';
  }
  
  // Don't modify URLs that already have a protocol
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  
  // Don't modify special protocols
  if (/^(mailto:|tel:|#)/i.test(url)) {
    return url;
  }
  
  // Add https:// for URLs without protocol
  return `https://${url}`;
}