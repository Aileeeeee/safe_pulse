"use client";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils";
import { PageHeader } from "@/components/ui";

const TEAM = [
  { name: "Adaeze Okafor",  role: "Case Manager",      status: "online",  initials: "AO", color: "#2d6aa8", cases: 4 },
  { name: "Emeka Nwosu",    role: "Field Responder",   status: "busy",    initials: "EN", color: "#e07c2a", cases: 2 },
  { name: "Ngozi Eze",      role: "Volunteer",         status: "online",  initials: "NE", color: "#1c6e4e", cases: 1 },
  { name: "Chidi Obi",      role: "Moderator",         status: "offline", initials: "CO", color: "#888",    cases: 0 },
  { name: "Fatima Yusuf",   role: "Field Responder",   status: "online",  initials: "FY", color: "#c73535", cases: 3 },
  { name: "Samuel Adeyemi", role: "Case Manager",      status: "busy",    initials: "SA", color: "#7c3aed", cases: 2 },
];

const STATUS_STYLE = {
  online:  "bg-emerald-light text-emerald-mid",
  offline: "bg-gray-100 text-gray-400",
  busy:    "bg-warning-light text-warning",
};
const STATUS_DOT = {
  online: "bg-emerald-mid",
  offline: "bg-gray-300",
  busy: "bg-warning",
};

export default function TeamPage() {
  return (
    <div>
      <PageHeader
        title="Team"
        subtitle="Manage and monitor your response team"
        action={
          <button
            onClick={() => toast.info("Invite flow — connect your backend invite endpoint")}
            className="flex items-center gap-2 px-4 py-2.5 bg-sidebar text-white text-[13px] font-medium rounded-[9px] hover:bg-emerald-sp transition-colors"
          >
            <UserPlus size={15} /> Invite Member
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {TEAM.map((m) => (
          <div key={m.name} className="sp-card p-5 flex flex-col items-center text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[16px] font-semibold mb-3"
              style={{ background: m.color }}
            >
              {m.initials}
            </div>
            <p className="text-[14px] font-semibold text-gray-900 mb-0.5">{m.name}</p>
            <p className="text-[12px] text-gray-400 mb-3">{m.role}</p>
            <div className={cn("inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full mb-3", STATUS_STYLE[m.status])}>
              <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[m.status])} />
              {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
            </div>
            {m.cases > 0 && (
              <p className="text-[11.5px] text-gray-400">{m.cases} active case{m.cases > 1 ? "s" : ""}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
