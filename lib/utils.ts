import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { decode } from 'html-entities';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// HTML entity decoding utility
// Uses the html-entities package for comprehensive HTML entity decoding
export function decodeHtmlEntities(text: string): string {
  if (!text) return "";
  return decode(text).trim();
}

// Limit text to specified number of lines
export function limitLines(text: string, maxLines: number = 5): string {
  if (!text) return "";
  
  const lines = text.split('\n');
  return lines.slice(0, maxLines).join('\n').trim();
}

// Process description: decode entities and limit lines
export function processDescription(description: string, maxLines: number = 5): string {
  if (!description) return "";
  
  const decoded = decodeHtmlEntities(description);
  return limitLines(decoded, maxLines);
}
