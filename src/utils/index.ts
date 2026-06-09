import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";
import type { IncidentSeverity } from "@/types";

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

// ─── Severity helpers ─────────────────────────────────────────────────────────
export const SEVERITY_COLORS: Record<IncidentSeverity, string> = {
  critical: "bg-danger-light text-danger border-danger",
  high:     "bg-warning-light text-warning border-warning",
  medium:   "bg-yellow-50 text-yellow-700 border-yellow-300",
  low:      "bg-emerald-pale text-emerald-sp border-emerald-light",
};

export const SEVERITY_DOT: Record<IncidentSeverity, string> = {
  critical: "bg-danger",
  high:     "bg-warning",
  medium:   "bg-yellow-500",
  low:      "bg-emerald-mid",
};

export const SEVERITY_BORDER: Record<IncidentSeverity, string> = {
  critical: "border-l-danger",
  high:     "border-l-warning",
  medium:   "border-l-yellow-400",
  low:      "border-l-emerald-mid",
};

// ─── Status helpers ───────────────────────────────────────────────────────────
export const STATUS_COLORS: Record<IncidentStatus, string> = {
  new:          "bg-red-50 text-red-600",
  acknowledged: "bg-orange-50 text-orange-600",
  assigned:     "bg-blue-50 text-blue-600",
  in_progress:  "bg-blue-50 text-blue-700",
  escalated:    "bg-red-100 text-red-800",
  resolved:     "bg-emerald-light text-emerald-mid",
  archived:     "bg-gray-100 text-gray-500",
};

export const STATUS_LABELS: Record<IncidentStatus, string> = {
  new:          "New",
  acknowledged: "Acknowledged",
  assigned:     "Assigned",
  in_progress:  "In Progress",
  escalated:    "Escalated",
  resolved:     "Resolved",
  archived:     "Archived",
};

// ─── Category display labels ──────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<IncidentCategory, string> = {
  harassment:        "Harassment",
  domestic_violence: "Domestic Violence",
  violence_assault:  "Violence / Assault",
  missing_person:    "Missing Person",
  sos:               "SOS Emergency",
  other:             "Other",
};
