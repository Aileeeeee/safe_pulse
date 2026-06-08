"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn, SEVERITY_COLORS, STATUS_COLORS, STATUS_LABELS } from "@/utils";
import type { IncidentSeverity, IncidentStatus } from "@/types";

// ─── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: number | string;
  delta?: number;
  deltaLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
}

export function StatCard({ label, value, delta, deltaLabel, icon, iconBg }: StatCardProps) {
  const positive = delta !== undefined && delta > 0;
  const neutral  = delta === 0;

  return (
    <div className="sp-card p-5 flex flex-col gap-3">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: iconBg ?? "#e8f2ec" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[12.5px] font-medium text-gray-500">{label}</p>
        <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">{value}</p>
      </div>
      {delta !== undefined && (
        <div className={cn(
          "flex items-center gap-1 text-[12px]",
          positive ? "text-emerald-mid" : neutral ? "text-gray-400" : "text-danger"
        )}>
          {positive ? <TrendingUp size={13} /> : neutral ? <Minus size={13} /> : <TrendingDown size={13} />}
          <span>{deltaLabel ?? (delta > 0 ? `+${delta}` : delta) + " from yesterday"}</span>
        </div>
      )}
    </div>
  );
}

// ─── Severity Badge ───────────────────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full border",
      SEVERITY_COLORS[severity]
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)} risk
    </span>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full",
      STATUS_COLORS[status]
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-100 rounded-lg",
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="sp-card p-5 space-y-3">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-medium text-gray-700 mb-1">{title}</p>
      {description && (
        <p className="text-[13px] text-gray-400 max-w-xs">{description}</p>
      )}
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13.5px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
