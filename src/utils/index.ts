import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import type { IncidentSeverity } from "@/types";

// Declare internal inline types for your status keys to keep the mappings strict
type IncidentStatus = "New" | "Ongoing" | "Active" | "Closed" | "Resolved";

// ─── Tailwind class merger ────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date formatters ──────────────────────────────────────────────────────────
export function timeAgo(date: string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTime(date: string) {
  return format(new Date(date), "hh:mm a");
}

export function formatDate(date: string) {
  return format(new Date(date), "MMM d, yyyy");
}

// ─── Severity helpers (Capitalized Keys Fixed) ────────────────────────────────
export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  Critical: "bg-danger-light text-danger border-danger",
  High:     "bg-warning-light text-warning border-warning",
  Medium:   "bg-yellow-50 text-yellow-700 border-yellow-300",
  Low:      "bg-emerald-pale text-emerald-sp border-emerald-light",
};

export const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  Critical: "bg-danger",
  High:     "bg-warning",
  Medium:   "bg-yellow-500",
  Low:      "bg-emerald-mid",
};

export const SEVERITY_BORDER: Record<IncidentSeverity, string> = {
  Critical: "border-l-danger",
  High:     "border-l-warning",
  Medium:   "border-l-yellow-400",
  Low:      "border-l-emerald-mid",
};

// ─── Status helpers (Mapped to your real Incident interface fields) ───────────
export const STATUS_COLORS: Record<IncidentStatus, string> = {
  New:      "bg-red-50 text-red-600",
  Ongoing:  "bg-blue-50 text-blue-600",
  Active:   "bg-blue-50 text-blue-700",
  Resolved: "bg-emerald-light text-emerald-mid",
  Closed:   "bg-gray-100 text-gray-500",
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  New:      "New",
  Ongoing:  "Ongoing",
  Active:   "Active",
  Resolved: "Resolved",
  Closed:   "Closed",
};

// ─── Category display labels (Using generic string record to avoid type blocks) ───
export const CATEGORY_LABELS: Record<string, string> = {
  harassment:        "Harassment",
  domestic_violence: "Domestic Violence",
  violence_assault:  "Violence / Assault",
  missing_person:    "Missing Person",
  sos:               "SOS Emergency",
  other:             "Other",
};
