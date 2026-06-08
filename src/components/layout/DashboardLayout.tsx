"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MapPin, Bell, BarChart2,
  Users, FileText, Settings, LogOut, Menu, X,
} from "lucide-react";
import { cn } from "@/utils";
import { useLogout } from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { Topbar } from "./Topbar";

const nav = [
  { label: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { label: "Incidents",    href: "/incidents",  icon: MapPin,  badge: "13" },
  { label: "Reports",      href: "/reports",    icon: FileText }, 
  { label: "Alerts",       href: "/alerts",     icon: Bell,    badge: "3" },
  { label: "Analytics",   href: "/analytics",  icon: BarChart2,  section: "Operations" },
  { label: "Team",         href: "/team",       icon: Users },
  { label: "Activity Log", href: "/activity",   icon: FileText },
  { label: "Settings",     href: "/settings",   icon: Settings, section: "Configuration" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const logout    = useLogout();
  const user      = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  // ✅ Now safe because first_name and last_name are always filled on signup
  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "SP"
    : "SP";

  // Display name
  {user?.first_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username ?? "User"
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed lg:relative inset-y-0 left-0 z-30",
          "w-[220px] min-w-[220px] bg-sidebar flex flex-col",
          "transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.07]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/safepulse-icon.png" alt="SafePulse" className="w-7 h-7 object-contain" />
          <span className="text-[15px] font-semibold text-white tracking-wide">
            SAFE<span className="text-white/40 font-normal">PULSE</span>
          </span>
          <button
            className="ml-auto lg:hidden text-white/50 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-3 overflow-y-auto space-y-0.5">
          {nav.map((item) => {
            const Icon    = item.icon;
            const active  = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <div key={item.href}>
                {item.section && (
                  <p className="text-[10px] font-medium text-white/30 tracking-[0.8px] uppercase px-2.5 pt-3 pb-1.5">
                    {item.section}
                  </p>
                )}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "nav-item",
                    active && "active"
                  )}
                >
                  <Icon size={16} className="flex-shrink-0 opacity-80" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* User + logout */}
        <div className="px-4 py-3.5 border-t border-white/[0.07] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-mid/60 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-white truncate">
              {user ? `${user.first_name} ${user.last_name}` : "Admin"}
            </p>
            <p className="text-[11px] text-white/40 truncate capitalize">
              {user?.role?.replace("_", " ") ?? "NGO Administrator"}
            </p>
          </div>
          <button
            onClick={() => logout.mutate()}
            className="text-white/30 hover:text-white/70 transition-colors"
            title="Sign out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-up">
          {children}
        </main>
      </div>
    </div>
  );
}
