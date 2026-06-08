"use client";
import Link from "next/link";
import {
  AlertTriangle, CheckCircle, MapPin,
  Clock, MessageSquare, Building2, Users,
  FileText, 
} from "lucide-react";
import { toast } from "sonner";
import { useCoordinatorDashboard, useAcknowledgeIncident } from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { CardSkeleton, PageHeader, EmptyState } from "@/components/ui";
import { cn } from "@/utils";
import type { Incident } from "@/types";

// ── Severity config ───────────────────────────────────────────────────────────
const SEV = {
  Critical: { dot: "bg-red-500",    badge: "bg-red-50 text-red-600 border-red-200",    border: "border-l-red-500" },
  High:     { dot: "bg-orange-500", badge: "bg-orange-50 text-orange-600 border-orange-200", border: "border-l-orange-500" },
  Medium:   { dot: "bg-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", border: "border-l-yellow-400" },
  Low:      { dot: "bg-green-500",  badge: "bg-green-50 text-green-700 border-green-200",   border: "border-l-green-400" },
};

const STATUS = {
  Ongoing: "bg-blue-50 text-blue-600",
  Closed:  "bg-emerald-light text-emerald-mid",
  Pending: "bg-orange-50 text-orange-500",
};

// ── Incident card ─────────────────────────────────────────────────────────────
function IncidentCard({ incident }: { incident: Incident }) {
  const sev        = SEV[incident.severity_level] ?? SEV.Medium;
  const acknowledge = useAcknowledgeIncident();

  function handleAck(e: React.MouseEvent) {
    e.stopPropagation();
    acknowledge.mutate(
      { id: incident.id },
      {
        onSuccess: () => toast.success(`Incident #${incident.id} acknowledged`),
        onError:   () => toast.error("Failed to acknowledge"),
      }
    );
  }

  return (
    <div
      className={cn(
        "sp-card p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-all",
        sev.border
      )}
      onClick={() => (window.location.href = `/incidents/${incident.id}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-0.5", sev.dot)} />
          <span className="text-[14.5px] font-semibold text-gray-900">
            {incident.incident_type}
          </span>
        </div>
        <span className="text-[11px] font-mono text-gray-400">#{incident.id}</span>
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap gap-3 mb-3">
        <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
          <MapPin size={13} className="text-emerald-mid" />
          {incident.location}
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
          <Clock size={13} className="text-emerald-mid" />
          {incident.incident_time?.slice(0, 5)} · {incident.incident_date}
        </span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
          <MessageSquare size={13} className="text-emerald-mid" />
          {incident.reporting_channel}
        </span>
      </div>

      {/* Victim info */}
      <div className="flex gap-2 mb-3 text-[12px] text-gray-400">
        <span>
          {incident.is_anonymous ? "Anonymous" : "Identified"}
        </span>
        <span>·</span>
        <span>{incident.victim_gender}, {incident.victim_age} yrs</span>
        <span>·</span>
        <span>{incident.support_provided}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <span className={cn(
            "text-[11px] font-medium px-2.5 py-1 rounded-full border",
            sev.badge
          )}>
            {incident.severity_level}
          </span>
          <span className={cn(
            "text-[11px] font-medium px-2.5 py-1 rounded-full",
            STATUS[incident.follow_up_status as keyof typeof STATUS] ?? "bg-gray-100 text-gray-500"
          )}>
            {incident.follow_up_status}
          </span>
        </div>

        {!incident.is_acknowledged ? (
          <button
            onClick={handleAck}
            disabled={acknowledge.isPending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sidebar text-white text-[12.5px] font-medium rounded-lg hover:bg-emerald-sp transition-colors disabled:opacity-60"
          >
            <CheckCircle size={13} />
            Acknowledge
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-[12px] text-emerald-mid font-medium">
            <CheckCircle size={13} /> Acknowledged
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main dashboard page ───────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data, isLoading } = useCoordinatorDashboard();
  const user = useAuthStore((s) => s.user);

  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  return (
    <div>
      <PageHeader
        title={greeting}
        subtitle={
          data
            ? `${data.organisation} · ${data.state} · ${data.role}`
            : "Here's what is happening in your community right now."
        }
      />

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">

        {isLoading ? (
          [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
        ) : (
          <>
            {/* ── NEW — New Reports card ── */}
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <FileText size={22} className="text-red-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">New Reports</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.new_reports ?? 0}
              </p>
              <p className={cn(
                "text-[12px] mt-1.5 flex items-center gap-1",
                (data?.new_reports_delta ?? 0) > 0
                  ? "text-red-400"
                  : (data?.new_reports_delta ?? 0) < 0
                  ? "text-emerald-mid"
                  : "text-gray-400"
              )}>
                {(data?.new_reports_delta ?? 0) > 0
                  ? `▲ +${data?.new_reports_delta} from yesterday`
                  : (data?.new_reports_delta ?? 0) < 0
                  ? `▼ ${data?.new_reports_delta} from yesterday`
                  : "— No change"}
              </p>
            </div>

            {/* Total Incidents */}
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Users size={22} className="text-blue-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Total Incidents</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.total_incidents ?? 0}
              </p>
              <p className="text-[12px] text-gray-400 mt-1.5">All reported cases</p>
            </div>

            {/* Critical Ongoing */}
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Critical Ongoing</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.critical_ongoing ?? 0}
              </p>
              <p className="text-[12px] text-red-400 mt-1.5">Needs immediate attention</p>
            </div>

            {/* Pending Acknowledgement */}
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                <CheckCircle size={22} className="text-orange-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Pending Acknowledgement</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.pending_acknowledgement ?? 0}
              </p>
              <p className="text-[12px] text-orange-400 mt-1.5">Awaiting response</p>
            </div>
          </>
        )}
      </div>

      {/* ── Two column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">

        {/* Live incident feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold flex items-center gap-2">
              Live Incident Feed
              <span className="live-dot" />
            </h2>
            <Link
              href="/incidents"
              className="text-[12.5px] text-emerald-mid font-medium hover:underline"
            >
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : data?.incidents?.length === 0 ? (
            <EmptyState
              title="No active incidents"
              description="New incidents will appear here in real time."
            />
          ) : (
            <div className="space-y-3">
              {data?.incidents?.map((inc) => (
                <IncidentCard key={inc.id} incident={inc} />
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Incidents by city */}
          <div className="sp-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={15} className="text-emerald-mid" />
              <h2 className="text-[15px] font-semibold">By City</h2>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-8 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {data?.by_city?.map((city, i) => {
                  const max = Math.max(...(data.by_city?.map((c) => c.count) ?? [1]));
                  const pct = Math.round((city.count / max) * 100);
                  return (
                    <div key={city.location}>
                      <div className="flex justify-between text-[12.5px] mb-1">
                        <span className="text-gray-600 font-medium">{city.location}</span>
                        <span className="text-gray-400">{city.count} reports</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-mid transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Organisation info */}
          {data && (
            <div className="sp-card p-5">
              <h2 className="text-[15px] font-semibold mb-3">Organisation</h2>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Name</p>
                  <p className="text-[13.5px] font-medium text-gray-800">{data.organisation}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">State</p>
                  <p className="text-[13.5px] font-medium text-gray-800">{data.state}</p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">Your Role</p>
                  <span className="text-[12px] font-medium px-2.5 py-1 rounded-full bg-emerald-light text-emerald-sp">
                    {data.role}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}