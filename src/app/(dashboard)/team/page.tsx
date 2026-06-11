"use client";
import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/utils";
import { PageHeader, Skeleton, EmptyState } from "@/components/ui";
import { useTeam } from "@/hooks";
import { useAuthStore } from "@/store/auth.store";

const STATUS_STYLE = {
  online:  "bg-emerald-light text-emerald-mid",
  offline: "bg-gray-100 text-gray-400",
  busy:    "bg-orange-50 text-orange-500",
};

// For admin — system team roles (not NGO roles)
const SYSTEM_ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Mobile Developer",
  "Product Designer",
  "Product Manager",
  "Data Analyst",
  "NGO Coordinator",
  "Field Staff",
];

export default function TeamPage() {
  const { data: team = [], isLoading } = useTeam();
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === "ADMIN";

  return (
    <div>
      <PageHeader
        title="Team"
        subtitle={isAdmin
          ? "Manage system administrators and team members"
          : "Field staff in your organisation"}
        action={
          <button
            onClick={() => toast.info("Invite flow — connect your backend invite endpoint")}
            className="flex items-center gap-2 px-4 py-2.5 bg-sidebar text-white text-[13px] font-medium rounded-[9px] hover:bg-emerald-sp transition-colors"
          >
            <UserPlus size={15} /> Invite Member
          </button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} className="h-36 rounded-[12px]" />)}
        </div>
      ) : team.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Invite field staff to join your organisation"
          icon={<UserPlus size={24} />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {team.map((member) => {
            const initials = member.first_name
              ? `${member.first_name[0]}${member.last_name?.[0] ?? ""}`.toUpperCase()
              : member.username.slice(0, 2).toUpperCase();

            const displayName = member.first_name
              ? `${member.first_name} ${member.last_name}`
              : member.username;

            const displayRole = isAdmin
              ? member.role?.replace("_", " ")
              : "Field Staff";

            return (
              <div key={member.id} className="bg-white border border-gray-100 rounded-[12px] shadow-card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-emerald-mid/70 flex items-center justify-center text-white text-[15px] font-semibold flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-[12px] text-gray-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-gray-500 capitalize">
                    {displayRole?.toLowerCase()}
                  </span>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 text-[11.5px] font-medium px-2.5 py-1 rounded-full",
                    STATUS_STYLE.online
                  )}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-mid" />
                    Active
                  </span>
                </div>

                {/* Admin can see organisation */}
                {isAdmin && member.organisation && (
                  <p className="text-[11.5px] text-gray-400 mt-2 pt-2 border-t border-gray-50">
                    {member.organisation_name}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
