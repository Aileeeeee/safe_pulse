"use client";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/utils";
import { PageHeader } from "@/components/ui";
import { useAuthStore } from "@/store/auth.store";

type Tab = "profile" | "organization" | "security" | "notifications" | "appearance";

const TABS: { label: string; value: Tab }[] = [
  { label: "Profile",        value: "profile" },
  { label: "Organisation",   value: "organization" },
  { label: "Security",       value: "security" },
  { label: "Notifications",  value: "notifications" },
  { label: "Appearance",     value: "appearance" },
];

// Toggle component
function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => { setOn((v) => !v); toast.success("Preference updated"); }}
      className={cn(
        "w-10 h-6 rounded-full relative transition-colors flex-shrink-0",
        on ? "bg-emerald-mid" : "bg-gray-200"
      )}
    >
      <span className={cn(
        "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
        on ? "left-5" : "left-1"
      )} />
    </button>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border-[1.5px] border-gray-200 rounded-[9px] text-[14px] outline-none focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10 transition-all bg-white";

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("profile");
  const user = useAuthStore((s) => s.user);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Configure your account and platform preferences" />

      <div className="grid grid-cols-[200px_1fr] gap-4">
        {/* Sidebar nav */}
        <div className="sp-card p-2 h-fit">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "w-full text-left px-3.5 py-2.5 rounded-lg text-[13.5px] transition-all",
                tab === t.value
                  ? "bg-emerald-light text-emerald-sp font-medium"
                  : "text-gray-500 hover:bg-surface-secondary hover:text-gray-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="sp-card p-6">
          {tab === "profile" && (
            <div>
              <h2 className="text-[16px] font-semibold mb-1">Profile Settings</h2>
              <p className="text-[13px] text-gray-400 mb-5 pb-4 border-b border-gray-100">Manage your personal account information</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">First name</label>
                  <input className={inputCls} defaultValue={user?.first_name ?? "Admin"} />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Last name</label>
                  <input className={inputCls} defaultValue={user?.last_name ?? "User"} />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Email address</label>
                <input className={inputCls} type="email" defaultValue={user?.email ?? "admin@safepulse.ng"} />
              </div>
              <div className="mb-6">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Organisation Role</label>
                <input className={cn(inputCls, "bg-surface-secondary text-gray-400")} defaultValue={user?.role?.replace("_", " ") ?? "NGO Administrator"} readOnly />
              </div>
              <button onClick={() => toast.success("Profile saved")} className="px-5 py-2.5 bg-sidebar text-white text-[13.5px] font-medium rounded-[9px] hover:bg-emerald-sp transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {tab === "organization" && (
            <div>
              <h2 className="text-[16px] font-semibold mb-1">Organisation Settings</h2>
              <p className="text-[13px] text-gray-400 mb-5 pb-4 border-b border-gray-100">Manage your NGO profile and operational details</p>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Organisation name</label>
                <input className={inputCls} defaultValue="SafeSpace Nigeria" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Region</label>
                  <input className={inputCls} defaultValue="Lagos, Nigeria" />
                </div>
                <div>
                  <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Contact phone</label>
                  <input className={inputCls} defaultValue="+234 801 234 5678" />
                </div>
              </div>
              <button onClick={() => toast.success("Organisation settings saved")} className="px-5 py-2.5 bg-sidebar text-white text-[13.5px] font-medium rounded-[9px] hover:bg-emerald-sp transition-colors">
                Save Changes
              </button>
            </div>
          )}

          {tab === "security" && (
            <div>
              <h2 className="text-[16px] font-semibold mb-1">Security</h2>
              <p className="text-[13px] text-gray-400 mb-5 pb-4 border-b border-gray-100">Manage password, sessions, and access controls</p>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Current password</label>
                <input className={inputCls} type="password" placeholder="Enter current password" />
              </div>
              <div className="mb-4">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">New password</label>
                <input className={inputCls} type="password" placeholder="Enter new password" />
              </div>
              <div className="mb-6">
                <label className="block text-[12.5px] font-medium text-gray-700 mb-1.5">Confirm new password</label>
                <input className={inputCls} type="password" placeholder="Repeat new password" />
              </div>
              <button onClick={() => toast.success("Password updated")} className="px-5 py-2.5 bg-sidebar text-white text-[13.5px] font-medium rounded-[9px] hover:bg-emerald-sp transition-colors">
                Update Password
              </button>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <h2 className="text-[16px] font-semibold mb-1">Notification Preferences</h2>
              <p className="text-[13px] text-gray-400 mb-5 pb-4 border-b border-gray-100">Control how and when you receive alerts</p>
              <div className="space-y-0">
                {[
                  { label: "New Incident Alerts",  desc: "Notify when new incidents are reported",       on: true },
                  { label: "Escalation Alerts",    desc: "Notify when cases are escalated",               on: true },
                  { label: "Team Activity",        desc: "Notify on team assignment changes",             on: false },
                  { label: "Daily Summary",        desc: "Receive a daily digest of operations",         on: true },
                  { label: "SOS Emergency Pulses", desc: "Immediate alert for SOS panic button triggers", on: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-[13.5px] font-medium text-gray-800">{n.label}</p>
                      <p className="text-[12px] text-gray-400 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle defaultOn={n.on} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "appearance" && (
            <div>
              <h2 className="text-[16px] font-semibold mb-1">Appearance</h2>
              <p className="text-[13px] text-gray-400 mb-5 pb-4 border-b border-gray-100">Customise your dashboard appearance</p>
              <p className="text-[13px] font-medium text-gray-700 mb-3">Theme</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Light", sidebarBg: "#1c3a2e", mainBg: "#f0ede8", active: true },
                  { label: "Dark",  sidebarBg: "#0d2419", mainBg: "#1a1a18", active: false },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={() => toast.info(`${t.label} mode — coming soon`)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border-[2px] transition-all",
                      t.active ? "border-emerald-mid" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex gap-1">
                      <div className="w-8 h-8 rounded-md" style={{ background: t.sidebarBg }} />
                      <div className="w-14 h-8 rounded-md" style={{ background: t.mainBg }} />
                    </div>
                    <span className="text-[13px] font-medium">{t.label}</span>
                    {t.active && <span className="ml-auto text-[11px] text-emerald-mid font-medium">Active</span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
