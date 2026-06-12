"use client";
import { CheckCircle, MapPin, Clock, MessageSquare, AlertTriangle, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn, formatTime, SEVERITY_BORDER } from "@/utils";
import { SeverityBadge, Skeleton } from "@/components/ui";
import { useAcknowledgeIncident } from "@/hooks";
import type { Incident, ActiveAlert, TopArea } from "@/types";

// ─── Live Incident Feed ───────────────────────────────────────────────────────
export function LiveFeed({
  incidents,
  loading,
}: {
  incidents: Incident[];
  loading: boolean;
}) {
  const acknowledge = useAcknowledgeIncident();

  function handleAck(incident: Incident) {
    acknowledge.mutate(
      { id: incident.id },
      {
        onSuccess: () => toast.success(`Incident ${incident.id} acknowledged`),
        onError: () => toast.error("Failed to acknowledge. Try again."),
      }
    );
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="sp-card p-4 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {incidents.map((inc) => (
        <div
          key={inc.id}
          className={cn(
            "sp-card p-4 border-l-[3px] cursor-pointer hover:shadow-md transition-shadow",
            SEVERITY_BORDER[inc.severity_level]
          )}
          onClick={() => (window.location.href = `/incidents/${inc.id}`)}
        >
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full flex-shrink-0 mt-0.5",
                inc.severity_level === "Critical" ? "bg-danger" :
                inc.severity_level === "High"     ? "bg-warning" : "bg-yellow-400"
              )} />
              <span className="text-[14.5px] font-semibold text-gray-900">
                {inc.incident_type}
              </span>
            </div>
            <span className="text-[12px] text-gray-400 font-mono">{inc.id}</span>
          </div>

          <div className="flex flex-wrap gap-3 mb-3">
            <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
              <MapPin size={13} className="text-emerald-mid" /> {inc.location}
            </span>
            
            {/* Safe Date/Time Parser Block */}
            <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
              <Clock size={13} className="text-emerald-mid" />
              {(() => {
                try {
                  if (!inc.incident_time) return "Just now";
                  
                  // If it's already structured text like "09:21 PM", bypass utilities
                  if (
                    typeof inc.incident_time === "string" &&
                    (inc.incident_time.includes("AM") || inc.incident_time.includes("PM"))
                  ) {
                    return inc.incident_time;
                  }

                  // Verify timestamp before running formatTime utility
                  if (isNaN(Date.parse(inc.incident_time))) {
                    return "Just now";
                  }

                  return formatTime(inc.incident_time);
                } catch (error) {
                  return "Just now";
                }
              })()}
            </span>

            <span className="flex items-center gap-1.5 text-[12.5px] text-gray-500">
              <MessageSquare size={13} className="text-emerald-mid" /> Via {inc.reporting_channel}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <SeverityBadge severity={inc.severity_level} />
            {inc.follow_up_status === "New" ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAck(inc);
                }}
                disabled={acknowledge.isPending}
                className="flex items-center gap-1.5 px-4 py-2 bg-sidebar text-white text-[13px] font-medium rounded-lg hover:bg-emerald-sp transition-colors disabled:opacity-60"
              >
                <CheckCircle size={14} />
                Acknowledge
              </button>
            ) : (
              <span className="text-[12px] text-emerald-mid font-medium flex items-center gap-1">
                <CheckCircle size={13} /> Acknowledged
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Active Alerts Panel ──────────────────────────────────────────────────────
export function AlertsPanel({ alerts }: { alerts: ActiveAlert[] }) {
  const iconMap: Record<string, { bg: string; icon: React.ReactNode }> = {
    critical: { bg: "bg-danger-light", icon: <Shield size={17} className="text-danger" /> },
    warning:  { bg: "bg-warning-light", icon: <AlertTriangle size={17} className="text-warning" /> },
    info:     { bg: "bg-blue-50",       icon: <AlertTriangle size={17} className="text-blue-500" /> },
  };

  const titleColor: Record<string, string> = {
    critical: "text-danger",
    warning:  "text-warning",
    info:     "text-blue-500",
  };

  return (
    <div className="space-y-2">
      {alerts.map((alert) => {
        const config = iconMap[alert.type] ?? { bg: "bg-gray-50", icon: <AlertTriangle size={17} /> };
        return (
          <div
            key={alert.id}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-surface-secondary cursor-pointer transition-colors"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-[13.5px] font-semibold mb-0.5", titleColor[alert.type])}>
                {alert.title}
              </p>
              <p className="text-[12px] text-gray-500 leading-snug">{alert.description}</p>
              <p className="text-[11.5px] text-gray-400 mt-1">{alert.area}</p>
            </div>
            <span className="text-[11px] text-gray-400 flex-shrink-0 whitespace-nowrap">
              {alert.count} reports
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Top Areas Bar Chart ──────────────────────────────────────────────────────
const AREA_COLORS = ["#d63b3b", "#e07c2a", "#1c6e4e", "#2d6aa8", "#c9a000"];

export function TopAreas({ areas }: { areas: TopArea[] }) {
  return (
    <div className="space-y-2.5">
      {areas.map((area, i) => (
        <div key={area.name} className="flex items-center gap-3">
          <span className="text-[12px] font-semibold text-gray-400 w-4 text-center">{i + 1}</span>
          <span className="text-[13px] font-medium flex-1">{area.name}</span>
          <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${area.percentage}%`, background: AREA_COLORS[i] }}
            />
          </div>
          <span className="text-[12px] text-gray-400 text-right w-16">{area.count} reports</span>
        </div>
      ))}
    </div>
  );
}
