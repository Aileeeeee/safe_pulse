"use client";
import { Bell, Menu, Search } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAuthStore((s) => s.user);
  
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
    <header className="h-[58px] bg-bg border-b border-gray-200/60 flex items-center px-6 gap-4 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-gray-500 hover:text-gray-800 transition-colors"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-[400px] relative">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search incidents, locations or reports…"
          className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10 transition-all"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3.5 ml-auto">
        {/* Notifications */}
        <Link
          href="/alerts"
          className="relative w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-emerald-mid transition-all"
        >
          <Bell size={16} />
          <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
            4
          </span>
        </Link>

        {/* User */}
        <Link href="/settings" className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 rounded-full bg-emerald-mid/70 flex items-center justify-center text-white text-[13px] font-semibold">
            {initials}
          </div>
          <div className="hidden sm:block">
            <p className="text-[13px] font-medium text-gray-900 group-hover:text-emerald-sp transition-colors">
              {user ? `${user.first_name} ${user.last_name}` : "Admin"}
            </p>
            <p className="text-[11px] text-gray-400 capitalize">
              {user?.role?.replace("_", " ") ?? "NGO Administrator"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
