"use client";
import { useState } from "react";
import { Shield, AlertTriangle, Info, X, MapPin } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils";
import { PageHeader, EmptyState } from "@/components/ui";

type AlertLevel = "all" | "critical" | "warning" | "info";

const MOCK_ALERTS = [
  { id: 1, type: "critical" as const, title: "High Risk Area Detected", description: "Multiple harassment reports received from Yaba area within 2 hours. Pattern indicates coordinated threat. Immediate response recommended.", area: "Yaba, Lagos", count: 7, time: "40 mins ago" },
  { id: 2, type: "warning" as const,  title: "Surge in Reports — Surulere", description: "Several unrelated incidents reported from Surulere in the past 30 minutes. May indicate an emerging hotspot requiring monitoring.", area: "Surulere, Lagos", count: 4, time: "30 mins ago" },
  { id: 3, type: "warning" as const,  title: "Area Caution — Surulere", description: "Multiple activity reports received. Community safety team has been notified and is reviewing.", area: "Surulere, Lagos", count: 3, time: "30 mins ago" },
  { id: 4, type: "info" as const,    title: "New Volunteer Assignment", description: "Adaeze Okafor has been assigned to Case #2342 and notified via mobile app.", area: "Surulere, Lagos", count: 0, time: "1 hr ago" },
];

const ICON_MAP = {
  critical: { bg: "bg-danger-light", icon: Shield,        color: "text-danger",  border: "border-l-danger" },
  warning:  { bg: "bg-warning-light", icon: AlertTriangle, color: "text-warning", border: "border-l-warning" },
  info:     { bg: "bg-blue-50",       icon: Info,          color: "text-blue-500",border: "border-l-blue-400" },
};

const TITLE_COLOR = {
  critical: "text-danger",
  warning:  "text-warning",
  info:     "text-blue-500",
};

export default function AlertsPage() {
  const [filter,    setFilter]   = useState<AlertLevel>("all");
  const [dismissed, setDismissed] = useState<number[]>([]);

  const visible = MOCK_ALERTS.filter(
    (a) => !dismissed.includes(a.id) && (filter === "all" || a.type === filter)
  );

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle="Real-time system alerts and area notifications"
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "critical", "warning", "info"] as AlertLevel[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3.5 py-1.5 text-[12.5px] font-medium rounded-lg border transition-all capitalize",
              filter === f
                ? "bg-emerald-light border-emerald-mid text-emerald-sp"
                : "bg-white border-gray-200 text-gray-500 hover:border-emerald-mid"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {visible.length === 0 ? (
        <EmptyState
          title="No alerts"
          description="All clear — no active alerts matching the current filter."
          icon={<Shield size={24} />}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((alert) => {
            const config = ICON_MAP[alert.type];
            const Icon   = config.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  "sp-card p-5 flex items-start gap-4 border-l-[3px]",
                  config.border
                )}
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", config.bg)}>
                  <Icon size={19} className={config.color} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className={cn("text-[11px] font-bold tracking-[0.5px] uppercase mb-1", config.color)}>
                    {alert.type}
                  </p>
                  <h3 className="text-[14.5px] font-semibold text-gray-900 mb-1.5">{alert.title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed mb-2">{alert.description}</p>
                  <div className="flex gap-4 text-[12px] text-gray-400">
                    <span className="flex items-center gap-1"><MapPin size={11} /> {alert.area}</span>
                    {alert.count > 0 && <span>{alert.count} reports</span>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-[12px] text-gray-400">{alert.time}</span>
                  <button
                    onClick={() => { setDismissed((p) => [...p, alert.id]); toast.success("Alert dismissed"); }}
                    className="flex items-center gap-1.5 text-[12px] text-gray-400 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:border-danger hover:text-danger transition-all"
                  >
                    <X size={12} /> Dismiss
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
