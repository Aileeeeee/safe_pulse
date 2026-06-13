"use client";

import { useEffect, useState } from "react";
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
} from "@/hooks";
import { CardSkeleton, PageHeader, EmptyState } from "@/components/ui";
import { LiveFeed } from "@/features/incidents/LiveFeed";
import { cn } from "@/utils";
import type { Incident } from "@/types";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [isHydrated, setIsHydrated] = useState(false);

  // 1. Force React to finish hydration before evaluation to prevent race conditions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // 2. Render a clean layout state spinner until user session data is securely matched
  if (!isHydrated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-emerald-sp border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-gray-500">Syncing secure profile session...</p>
        </div>
      </div>
    );
  }

  // 3. Route strictly based on true database string matches
  if (user.role === "FIELD_STAFF") {
    return <FieldStaffDashboardView />;
  }

  if (user.role === "COORDINATOR" || user.role === "ADMIN") {
    return <CoordinatorDashboardView />;
  }

  // Fallback for unauthorized/malformed profiles
  return (
    <div className="p-8 max-w-md mx-auto text-center space-y-2">
      <AlertTriangle size={40} className="text-red-500 mx-auto" />
      <h3 className="text-lg font-semibold text-gray-900">Access Restricted</h3>
      <p className="text-sm text-gray-500">
        Your assigned system profile structure lacks dashboard routing clearance.
      </p>
    </div>
  );
}

// ── Coordinator / Admin Dashboard View ─────────────────────────────────────────────
function CoordinatorDashboardView() {
  const { data, isLoading } = useCoordinatorDashboard();
  const user    = useAuthStore((s) => s.user);
  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  // Calculate maximum count to properly scale the Tailwind CSS progress bars dynamically
  const topAreasList = data?.top_reported_areas ?? [];
  const maxCount = topAreasList.length > 0 ? Math.max(...topAreasList.map((item: any) => item.count)) : 1;

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

      {/* Stat cards - Layout Logic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
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
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* Left Column: Live feed */}
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
              {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
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

        {/* Right Column: Active Alerts Feed & Top Reported Areas Widgets */}
        <div className="space-y-6">
          
          {/* 🌟 WIDGET 1: ACTIVE ALERTS PANELS */}
          <div className="sp-card p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-semibold">Active Alerts</h2>
              <button className="text-[12px] text-emerald-mid font-medium hover:underline">View all</button>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="h-16 w-full bg-gray-50 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !data?.active_alerts?.length ? (
              <p className="text-[12px] text-gray-400 text-center py-4">All operations parameters are clear.</p>
            ) : (
              <div className="space-y-3.5">
                {data.active_alerts.map((alert: any) => (
                  <div key={alert.id} className="flex gap-3 p-3.5 rounded-xl border border-gray-50 bg-white shadow-2xs">
                    <div className={cn(
                      "w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm",
                      alert.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
                    )}>
                      {alert.type === 'danger' ? '🚨' : '⚠️'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className={cn(
                          "text-[13px] font-bold truncate",
                          alert.type === 'danger' ? 'text-red-600' : 'text-orange-600'
                        )}>
                          {alert.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 font-medium ml-2 whitespace-nowrap">{alert.timeAgo}</span>
                      </div>
                      <p className="text-[12px] text-gray-600 font-medium line-clamp-2 mt-0.5 leading-snug">{alert.description}</p>
                      <span className="text-[10px] text-gray-400 font-medium mt-1 block">{alert.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 🌟 WIDGET 2: TOP REPORTED AREAS (GLOBAL ADMIN COMPATIBLE) */}
          <div className="sp-card p-5">
            <h2 className="text-[15px] font-semibold mb-4">Top Reported Areas</h2>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-1/3 bg-gray-100 rounded animate-pulse" />
                    <div className="h-2 w-full bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !topAreasList.length ? (
              <p className="text-[12px] text-gray-400 text-center py-4">No regional coordinates logged.</p>
            ) : (
              <div className="space-y-4">
                {topAreasList.map((item: any) => {
                  const barColor = item.rank === 1 ? 'bg-red-500' : item.rank === 2 ? 'bg-orange-500' : 'bg-emerald-800';
                  const badgeStyle = item.rank === 1 ? 'bg-red-50 text-red-700' : item.rank === 2 ? 'bg-orange-50 text-orange-700' : 'bg-emerald-50 text-emerald-800';

                  return (
                    <div key={item.rank} className="space-y-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0", badgeStyle)}>
                            {item.rank}
                          </span>
                          {/* 🌟 CHANGED: Appends the parent state to provide structural context to ADMIN users */}
                          <span className="font-bold text-gray-800 truncate">
                            {item.name} 
                            {item.state && (
                              <span className="text-[11px] text-gray-400 font-normal ml-1">
                                ({item.state})
                              </span>
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 flex-shrink-0 ml-2">
                          {item.count} reports
                        </span>
                      </div>
                      
                      {/* Graphical Progress Bar element layout */}
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full rounded-full transition-all duration-500", barColor)}
                          style={{ width: `${(item.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Field Staff Dashboard View ─────────────────────────────────────────────────────
function FieldStaffDashboardView() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 mb-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
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
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
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
