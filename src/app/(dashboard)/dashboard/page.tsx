"use client";
import { useAuthStore } from "@/store/auth.store";
import { useCoordinatorDashboard, useFieldStaffDashboard } from "@/hooks";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, CheckCircle, Users, MapPin, Clock,
} from "lucide-react";
import { CardSkeleton, EmptyState } from "@/components/ui";
import { cn } from "@/utils";


export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? "FIELD_STAFF";

  // Show correct dashboard based on role
  if (role === "FIELD_STAFF") {
    return <FieldStaffDashboard />;
  }
  return <CoordinatorDashboard />;
}

// ── Coordinator dashboard ─────────────────────────────────────────────────────
function CoordinatorDashboard() {
  const { data, isLoading } = useCoordinatorDashboard();
  const user = useAuthStore((s) => s.user);

  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  // ... your existing coordinator dashboard JSX unchanged
  return (
    <div>
      {/* All your existing coordinator dashboard code here */}
    </div>
  );
}

// ── Field staff dashboard ─────────────────────────────────────────────────────
function FieldStaffDashboard() {
  const { data, isLoading } = useFieldStaffDashboard();
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  const greeting = user?.first_name
    ? `Welcome back, ${user.first_name}`
    : "Welcome back";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-gray-900">{greeting}</h1>
        <p className="text-[13.5px] text-gray-500 mt-0.5">
          Your assigned cases — {data?.organisation}
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
              <p className="text-[12px] text-red-400 mt-1">Needs immediate attention</p>
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

      {/* Assigned incidents list */}
      <div>
        <h2 className="text-[15px] font-semibold mb-4">My Assigned Cases</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3].map((i) => <CardSkeleton key={i} />)}
          </div>
        ) : data?.incidents?.length === 0 ? (
          <EmptyState
            title="No cases assigned yet"
            description="Your coordinator will assign cases to you shortly."
          />
        ) : (
          <div className="space-y-3">
            {data?.incidents?.map((inc) => (
              <div
                key={inc.id}
                onClick={() => router.push(`/incidents/${inc.id}`)}
                className={cn(
                  "sp-card p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-all",
                  inc.severity_level === "Critical" ? "border-l-red-500" :
                  inc.severity_level === "High"     ? "border-l-orange-500" :
                                                      "border-l-yellow-400"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      inc.severity_level === "Critical" ? "bg-red-500" :
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
                <div className="flex gap-3 text-[12.5px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-mid" />
                    {inc.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-emerald-mid" />
                    {new Date(inc.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}