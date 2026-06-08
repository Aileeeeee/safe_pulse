"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { PageHeader } from "@/components/ui";

const weeklyData = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 14 },
  { day: "Wed", count: 11 },
  { day: "Thu", count: 19 },
  { day: "Fri", count: 13 },
  { day: "Sat", count: 7 },
  { day: "Sun", count: 4 },
];

const categoryData = [
  { name: "Domestic Violence", value: 35, color: "#d63b3b" },
  { name: "Harassment",        value: 25, color: "#e07c2a" },
  { name: "Assault",           value: 22, color: "#2d6aa8" },
  { name: "Missing Person",    value: 18, color: "#1c6e4e" },
];

const statusData = [
  { name: "New",          count: 13, color: "#d63b3b" },
  { name: "In Progress",  count: 6,  color: "#2d6aa8" },
  { name: "Escalated",    count: 3,  color: "#e07c2a" },
  { name: "Resolved",     count: 20, color: "#1c6e4e" },
];

const channelData = [
  { name: "Mobile App", pct: 68, color: "#1c6e4e" },
  { name: "SMS",        pct: 20, color: "#2d6aa8" },
  { name: "Web Form",   pct: 12, color: "#e07c2a" },
];

const miniStats = [
  { label: "Avg. Response Time",  value: "8.4m",   delta: "▼ 2.1m faster this week", positive: true },
  { label: "Resolution Rate",     value: "76%",     delta: "▲ +4% vs last week",      positive: true },
  { label: "Escalation Rate",     value: "12%",     delta: "▲ +2% vs last week",      positive: false },
];

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader title="Analytics" subtitle="Incident trends and response performance" />

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3.5 mb-5">
        {miniStats.map((s) => (
          <div key={s.label} className="sp-card p-4">
            <p className="text-[12px] text-gray-400 mb-1">{s.label}</p>
            <p className="text-[22px] font-bold text-gray-900">{s.value}</p>
            <p className={`text-[11.5px] mt-1 ${s.positive ? "text-emerald-mid" : "text-danger"}`}>{s.delta}</p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly bar */}
        <div className="sp-card p-5">
          <h3 className="text-[14px] font-semibold mb-5">Reports This Week</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={24}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9c9a94" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "#1c3a2e", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }}
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
              />
              <Bar dataKey="count" fill="#2d8a62" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category donut */}
        <div className="sp-card p-5">
          <h3 className="text-[14px] font-semibold mb-4">Incidents by Category</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={130} height={130}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {categoryData.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-[12.5px]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }} />
                  <span className="flex-1 text-gray-600">{c.name}</span>
                  <span className="font-semibold">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status breakdown */}
        <div className="sp-card p-5">
          <h3 className="text-[14px] font-semibold mb-5">Status Breakdown</h3>
          <div className="space-y-3.5">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="text-[13px] text-gray-500 w-24 flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(s.count / 20) * 100}%`, background: s.color }}
                  />
                </div>
                <span className="text-[12.5px] font-semibold text-gray-700 w-5 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Channel distribution */}
        <div className="sp-card p-5">
          <h3 className="text-[14px] font-semibold mb-5">Reports by Channel</h3>
          <div className="space-y-4">
            {channelData.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-[12.5px] mb-1.5">
                  <span className="text-gray-500">{c.name}</span>
                  <span className="font-medium">{c.pct}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${c.pct}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
