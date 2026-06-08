"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useIncidents, useAcknowledgeIncident } from "@/hooks";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/utils";
import type { Incident } from "@/types";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<string, string> = {
  Ongoing: "bg-red-50 text-red-500 border border-red-200",
  New:     "bg-red-50 text-red-500 border border-red-200",
  Active:  "bg-gray-100 text-gray-600 border border-gray-200",
  Closed:  "bg-emerald-light text-emerald-mid border border-emerald-200",
  Resolved:"bg-emerald-light text-emerald-mid border border-emerald-200",
};

const SEV_DOT: Record<string, string> = {
  Critical: "bg-red-500",
  High:     "bg-orange-500",
  Medium:   "bg-yellow-500",
  Low:      "bg-green-500",
};

// ── Filters ───────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "All", "Sexual Assault", "Harassment",
  "Domestic Violence", "Child Abuse", "Unknown",
];

const STATUSES = ["All", "New", "Ongoing", "Active", "Closed", "Resolved"];

function StatusPill({ status }: { status: string }) {
  const displayStatus =
    status === "Ongoing" ? "New" :
    status === "Closed"  ? "Resolved" : status;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 text-[11.5px] font-medium",
      "px-2.5 py-1 rounded-full",
      STATUS_STYLE[status] ?? "bg-gray-100 text-gray-500"
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {displayStatus}
    </span>
  );
}

export default function IncidentsPage() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [status,   setStatus]   = useState("All");

  const { data: incidents = [], isLoading } = useIncidents();
  const acknowledge = useAcknowledgeIncident();

  // ── Client-side filter ───────────────────────────────────────────────────────
  // Typed 'inc' as 'Incident' to fix the implicit 'any' compile error
  const filtered = incidents.filter((inc: Incident) => {
    const catMatch =
      category === "All" || inc.incident_type === category;
    const statusMap: Record<string, string[]> = {
      New:      ["Ongoing"],
      Ongoing:  ["Ongoing"],
      Active:   ["Active"],
      Closed:   ["Closed"],
      Resolved: ["Closed", "Resolved"],
    };
    const statusMatch =
      status === "All" ||
      (statusMap[status] ?? [status]).includes(inc.follow_up_status);
    return catMatch && statusMatch;
  });

  function handleAck(e: React.MouseEvent, inc: Incident) {
    e.stopPropagation();
    acknowledge.mutate(
      { id: inc.id },
      {
        onSuccess: () =>
          toast.success(`Incident #${inc.id} acknowledged`),
        onError: () =>
          toast.error("Failed to acknowledge"),
      }
    );
  }

  return (
    <div>
      <PageHeader
        title="Incidents"
        subtitle="Manage all reported incidents"
      />

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <div className="flex items-center gap-1.5 text-[13px] text-gray-400 mr-1">
          <Filter size={13} /> Filters:
        </div>

        {/* Category dropdown */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-[13px] font-medium bg-white border border-gray-200 rounded-lg text-gray-600 outline-none cursor-pointer hover:border-emerald-mid transition-colors"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === "All" ? "Category ▾" : c}</option>
            ))}
          </select>
        </div>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 text-[13px] font-medium bg-white border border-gray-200 rounded-lg text-gray-600 outline-none cursor-pointer hover:border-emerald-mid transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === "All" ? "Status ▾" : s}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select className="appearance-none pl-3 pr-8 py-1.5 text-[13px] font-medium bg-white border border-gray-200 rounded-lg text-gray-600 outline-none cursor-pointer hover:border-emerald-mid transition-colors">
            <option>Date ▾</option>
            <option>Today</option>
            <option>This week</option>
            <option>This month</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-[14px] border border-gray-100 shadow-card overflow-hidden">
        {/* Head */}
        <div className="grid grid-cols-[100px_1fr_120px_110px_160px_180px] px-6 py-3.5 bg-surface-secondary border-b border-gray-100">
          {["ID", "CATEGORY", "AREA", "TIME", "STATUS", "ACTION"].map((h) => (
            <span key={h} className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide">
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {isLoading ? (
          <div className="p-6 space-y-5">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="grid grid-cols-6 gap-4">
                {[1,2,3,4,5,6].map((j) => (
                  <Skeleton key={j} className="h-4" />
                ))}
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No incidents found"
            description="Try adjusting your filters"
          />
        ) : (
          filtered.map((inc, idx) => (
            <div
              key={inc.id}
              onClick={() => router.push(`/incidents/${inc.id}`)}
              className={cn(
                "grid grid-cols-[100px_1fr_120px_110px_160px_180px]",
                "px-6 py-4 items-center cursor-pointer transition-colors",
                "border-b border-gray-50 last:border-0",
                "hover:bg-surface-secondary"
              )}
            >
              {/* ID */}
              <span className="text-[13px] font-mono text-gray-500">
                #{String(1000 + idx + 1).padStart(4, "0")}
              </span>

              {/* Category */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0",
                  SEV_DOT[inc.severity_level] ?? "bg-gray-400"
                )} />
                <span className="text-[13.5px] font-medium text-gray-800">
                  {inc.incident_type}
                </span>
              </div>

              {/* Area */}
              <span className="text-[13.5px] text-gray-500">
                {inc.location}
              </span>

              {/* Time */}
              <span className="text-[13px] text-gray-500 font-mono">
                {inc.incident_time?.slice(0, 5)}
              </span>

              {/* Status */}
              <StatusPill status={inc.follow_up_status} />

              {/* Action */}
              <div className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}>
                {!inc.is_acknowledged ? (
                  <button
                    onClick={(e) => handleAck(e, inc)}
                    disabled={acknowledge.isPending}
                    className="px-3.5 py-1.5 text-[12.5px] font-medium border border-gray-200 rounded-lg bg-white text-gray-600 hover:border-emerald-mid hover:text-emerald-mid transition-all disabled:opacity-50"
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="px-3.5 py-1.5 text-[12.5px] font-medium text-emerald-mid bg-emerald-light rounded-lg">
                    ✓ Acknowledged
                  </span>
                )}
                <button
                  onClick={() => router.push(`/incidents/${inc.id}`)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
