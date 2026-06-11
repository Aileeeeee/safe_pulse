"use client";

import { PageHeader } from "@/components/ui/PageHeader";

const LOGS = [
  { emoji: "✅", bg: "#e8f2ec", action: "Admin acknowledged incident", highlight: "#2345", meta: "Harassment · Oshodi", time: "10:38 AM" },
  { emoji: "🔴", bg: "#fde8e8", action: "New incident", highlight: "#2346", meta: "Domestic Violence · Oshodi reported via app", time: "10:40 AM" },
  { emoji: "⬆️", bg: "#fdf3ea", action: "Emeka Nwosu escalated incident", highlight: "#2340", meta: "Harassment · Ojo", time: "08:10 AM" },
  { emoji: "✅", bg: "#e8f2ec", action: "Incident", highlight: "#2341", meta: "marked as resolved · Domestic Violence · GRA", time: "10:00 AM" },
  { emoji: "👤", bg: "#eaf2fb", action: "Adaeze Okafor assigned to case", highlight: "#2342", meta: "Missing Person · Surulere", time: "09:31 AM" },
  { emoji: "📝", bg: "#f5f5f5", action: "Chidi Obi added internal note to", highlight: "#2340", meta: "", time: "09:15 AM" },
  { emoji: "🔴", bg: "#fde8e8", action: "New SOS pulse received from Ikeja — incident", highlight: "#2347", meta: "created automatically", time: "09:00 AM" },
];

export default function ActivityPage() {
  return (
    <div>
      <PageHeader title="Activity Log" subtitle="Full audit trail of platform actions" />

      <div className="sp-card overflow-hidden">
        {LOGS.map((log, i) => (
          <div
            key={i}
            className="flex items-start gap-3.5 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
              style={{ background: log.bg }}
            >
              {log.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] text-gray-700 leading-snug">
                {log.action}{" "}
                <strong className="text-emerald-mid">{log.highlight}</strong>
                {log.meta && ` — ${log.meta}`}
              </p>
            </div>
            <span className="text-[12px] text-gray-400 flex-shrink-0 font-mono">{log.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
