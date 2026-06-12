"use client";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle, Users,
  MapPin, Clock, FileText,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  useCoordinatorDashboard,
  useFieldStaffDashboard,
  useAcknowledgeIncident,
} from "@/hooks";
import { CardSkeleton, PageHeader, EmptyState } from "@/components/ui";
import { LiveFeed, AlertsPanel, TopAreas } from "@/features/incidents/LiveFeed";
import { cn } from "@/utils";
import type { Incident } from "@/types";
import { toast } from "sonner";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "FIELD_STAFF";

  if (role === "FIELD_STAFF") {
    return <FieldStaffDashboard />;
  }

  // COORDINATOR and ADMIN both use coordinator dashboard
  return <CoordinatorDashboard />;
}

// ── Coordinator / Admin Dashboard ─────────────────────────────────────────────
function CoordinatorDashboard() {
  const { data, isLoading } = useCoordinatorDashboard();
  const user    = useAuthStore((s) => s.user);
  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  return (
    <div>
      <PageHeader
        title={greeting}
        subtitle={
          data
            ? `${data.organisation} · ${data.state}`
            : "Here's what is happening in your community right now."
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <FileText size={22} className="text-red-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">New Reports</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.new_reports ?? 0}
              </p>
              <p className={cn(
                "text-[12px] mt-1.5",
                (data?.new_reports_delta ?? 0) > 0 ? "text-red-400" :
                (data?.new_reports_delta ?? 0) < 0 ? "text-emerald-mid" : "text-gray-400"
              )}>
                {(data?.new_reports_delta ?? 0) > 0
                  ? `▲ +${data?.new_reports_delta} from yesterday`
                  : (data?.new_reports_delta ?? 0) < 0
                  ? `▼ ${data?.new_reports_delta} from yesterday`
                  : "— No change"}
              </p>
            </div>

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

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
        {/* Live feed */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold flex items-center gap-2">
              Live Incident Feed
              <span className="live-dot" />
            </h2>
            <Link href="/incidents"
              className="text-[12.5px] text-emerald-mid font-medium hover:underline">
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3].map((i) => <CardSkeleton key={i} />)}
            </div>
          ) : data?.incidents?.length === 0 ? (
            <EmptyState
              title="No active incidents"
              description="New incidents will appear here in real time."
            />
          ) : (
            <LiveFeed
              incidents={data?.incidents ?? []}
              loading={isLoading}
            />
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* By city */}
          <div className="sp-card p-5">
            <h2 className="text-[15px] font-semibold mb-4">By City</h2>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3 w-8  bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <TopAreas areas={
                (data?.by_city ?? []).map((c) => ({
                  name:       c.location,
                  count:      c.count,
                  percentage: Math.round(
                    (c.count / Math.max(...(data?.by_city ?? []).map((x) => x.count), 1)) * 100
                  ),
                }))
              } />
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

// ── Field Staff Dashboard ─────────────────────────────────────────────────────
function FieldStaffDashboard() {
  const { data, isLoading } = useFieldStaffDashboard();
  const user    = useAuthStore((s) => s.user);
  const router  = useRouter();
  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">{greeting}</h1>
        <p className="text-[13.5px] text-gray-500 mt-0.5">
          {data?.organisation} — your assigned cases
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {isLoading ? (
          [1,2,3,4].map((i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
                <Users size={22} className="text-blue-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Assigned to me</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.total_assigned ?? 0}
              </p>
            </div>
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-orange-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Ongoing</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.ongoing ?? 0}
              </p>
            </div>
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <AlertTriangle size={22} className="text-red-500" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Critical</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.critical_ongoing ?? 0}
              </p>
              <p className="text-[12px] text-red-400 mt-1">Needs attention</p>
            </div>
            <div className="sp-card p-5">
              <div className="w-11 h-11 rounded-xl bg-emerald-light flex items-center justify-center mb-3">
                <CheckCircle size={22} className="text-emerald-sp" />
              </div>
              <p className="text-[12.5px] font-medium text-gray-500">Closed</p>
              <p className="text-[28px] font-semibold text-gray-900 leading-none mt-0.5">
                {data?.closed ?? 0}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Assigned incidents */}
      <h2 className="text-[15px] font-semibold mb-4 flex items-center gap-2">
        My Assigned Cases
        <span className="live-dot" />
      </h2>

      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : !data?.incidents?.length ? (
        <EmptyState
          title="No cases assigned yet"
          description="Your coordinator will assign cases to you shortly."
        />
      ) : (
        <div className="space-y-3">
          {data.incidents.map((inc: Incident) => (
            <div
              key={inc.id}
              onClick={() => router.push(`/incidents/${inc.id}`)}
              className={cn(
                "sp-card p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-all",
                inc.severity_level === "Critical" ? "border-l-red-500"    :
                inc.severity_level === "High"     ? "border-l-orange-500" :
                                                    "border-l-yellow-400"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full flex-shrink-0",
                    inc.severity_level === "Critical" ? "bg-red-500"    :
                    inc.severity_level === "High"     ? "bg-orange-500" : "bg-yellow-500"
                  )} />
                  <span className="text-[14.5px] font-semibold text-gray-900">
                    {inc.incident_type}
                  </span>
                </div>
                <span className={cn(
                  "text-[11px] font-medium px-2.5 py-1 rounded-full",
                  inc.follow_up_status === "Closed"
                    ? "bg-emerald-light text-emerald-mid"
                    : "bg-blue-50 text-blue-500"
                )}>
                  {inc.follow_up_status === "Closed" ? "● Resolved" : "● Active"}
                </span>
              </div>
              <div className="flex gap-4 text-[12.5px] text-gray-500">
                <span className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-emerald-mid" />
                  {inc.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-emerald-mid" />
                  {/* Fixed: Safely falls back if inc.created_at is null or malformed */}
                  {(() => {
                    const parsedDate = new Date(inc.created_at);
                    return !isNaN(parsedDate.getTime())
                      ? parsedDate.toLocaleDateString("en-NG")
                      : "Date unavailable";
                  })()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
