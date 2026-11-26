"use client";

import React, { useEffect, useState, useRef } from "react";
import { getAuthUser, clearAuthSession } from "@/lib/auth";
import { User } from "@/types";
import { LogOut, ChevronDown, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [time, setTime] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(getAuthUser());
    const interval = setInterval(() => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "from-blue-500 to-indigo-600";
      case "owner":
        return "from-amber-500 to-orange-600";
      case "petugas":
        return "from-emerald-500 to-teal-600";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "owner":
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case "petugas":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40 shadow-[0_4px_20px_rgba(148,163,184,0.08)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_6px_14px_rgba(37,99,235,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] flex items-center justify-center font-black text-xl text-white">
          P
        </div>
        <div>
          <h1 className="font-black text-lg tracking-tight text-slate-900 flex items-center gap-2">
            PARKIR<span className="text-blue-600">BOZZ</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">Sistem Manajemen & Gerbang Parkir</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-slate-700 font-mono text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>{time || "--:--:--"}</span>
        </div>

        {user && (
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              {/* Avatar circle with gradient initials */}
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-br ${getRoleColor(
                  user.role
                )} flex items-center justify-center text-white text-xs font-black shadow-sm`}
              >
                {getInitials(user.nama_lengkap)}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-none">
                  {user.nama_lengkap}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  @{user.username}
                </div>
              </div>
              <span
                className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg ${getRoleBadge(
                  user.role
                )}`}
              >
                {user.role}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 neu-card rounded-2xl p-2 shadow-lg border border-slate-200/80 z-50 bg-white">
                <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRoleColor(
                        user.role
                      )} flex items-center justify-center text-white text-sm font-black shadow-sm`}
                    >
                      {getInitials(user.nama_lengkap)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        {user.nama_lengkap}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        @{user.username}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar dari Sistem</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
