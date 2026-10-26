import type { Units } from '@/types/user';

const POUNDS_PER_KG = 2.20462;
const CM_PER_INCH = 2.54;

/** `75` → `1:15`, `3725` → `1:02:05`. */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${rest}` : `${minutes}:${rest}`;
}

/** `90` → `1 min 30 s`, `120` → `2 min`, `45` → `45 s`. */
export function formatRest(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}

export function weightUnit(units: Units) {
  return units === 'metric' ? 'kg' : 'lb';
}

export function heightUnit(units: Units) {
  return units === 'metric' ? 'cm' : 'in';
}

/** Rounded to one decimal, in the user's units. */
export function toDisplayWeight(kg: number, units: Units): number {
  const value = units === 'metric' ? kg : kg * POUNDS_PER_KG;
  return Math.round(value * 10) / 10;
}

export function fromDisplayWeight(value: number, units: Units): number {
  return units === 'metric' ? value : value / POUNDS_PER_KG;
}

export function toDisplayHeight(cm: number, units: Units): number {
  const value = units === 'metric' ? cm : cm / CM_PER_INCH;
  return Math.round(value * 10) / 10;
}

export function fromDisplayHeight(value: number, units: Units): number {
  return units === 'metric' ? value : value * CM_PER_INCH;
}

/** Accepts both `72.5` and `72,5`. Returns `undefined` for an empty or invalid value. */
export function parseDecimal(text: string): number | undefined {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return undefined;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

/**
 * Formats digits as `YYYY-MM-DD` while the user types: `199804` → `1998-04`.
 * A dash is only added after a digit that follows it, so deleting a dash works as expected.
 */
export function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}
