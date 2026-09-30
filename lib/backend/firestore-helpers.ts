import { Timestamp } from "firebase/firestore";

export function toDate(value: unknown, fallback = new Date()) {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

export function toIso(value: unknown) {
  return toDate(value).toISOString();
}
