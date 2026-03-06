import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value) {
  const numericValue = Number(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericValue);
}

export function formatCompactNumber(value) {
  const numericValue = Number(value) || 0;
  const absValue = Math.abs(numericValue);
  
  if (absValue < 1000) {
    return formatCurrency(numericValue);
  }
  
  const formatter = new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  });

  // Standard notation: 1K, 1M, 1B, 1T
  // We can manually map if we want specific ID suffixes like jt, M, T
  if (absValue >= 1000000000000) return (numericValue / 1000000000000).toFixed(1).replace(/\.0$/, '') + ' T';
  if (absValue >= 1000000000) return (numericValue / 1000000000).toFixed(1).replace(/\.0$/, '') + ' M';
  if (absValue >= 1000000) return (numericValue / 1000000).toFixed(1).replace(/\.0$/, '') + ' jt';
  if (absValue >= 1000) return (numericValue / 1000).toFixed(1).replace(/\.0$/, '') + ' rb';
  
  return formatter.format(numericValue);
}

export function parseSafeDate(dateStr) {
  if (!dateStr || dateStr === "null" || dateStr === "undefined") return undefined;
  if (dateStr instanceof Date) {
    return Number.isNaN(dateStr.getTime()) ? undefined : dateStr;
  }
  const str = String(dateStr);
  const normalizedStr = str.includes('T') ? str : str.replace(/-/g, '/');
  const d = new Date(normalizedStr);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export function generateUniqueId() {
  if (typeof self !== 'undefined' && self.crypto) {
    if (self.crypto.randomUUID) {
      return self.crypto.randomUUID();
    }
    const array = new Uint32Array(4);
    self.crypto.getRandomValues(array);
    return Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');
  }
  // extreme fallback
  return Date.now().toString(36) + Math.floor(performance.now()).toString(36);
}
