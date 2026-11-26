"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuthUser, clearAuthSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { User, AreaParkir } from "@/types";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  MapPin,
  Tag,
  Users,
  Car,
  History,
  FileText,
  Activity,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Monitor,
  ParkingSquare,
  MoreHorizontal,
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUser(getAuthUser());
    api
      .get("/area-parkir")
      .then((res) => {
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) setAreas(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCollapsed(false);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    if (user.role === "petugas") {
      return [
        {
          title: "Gate Masuk",
          href: "/petugas/masuk",
          icon: <LogIn className="w-4 h-4" />,
        },
        {
          title: "Gate Keluar",
          href: "/petugas/keluar",
          icon: <LogOut className="w-4 h-4" />,
        },
      ];
    }

    if (user.role === "owner") {
      return [
        {
          title: "Dashboard",
          href: "/owner",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          title: "Laporan Omzet",
          href: "/admin/laporan",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          title: "Transaksi",
          href: "/admin/transaksi",
          icon: <History className="w-4 h-4" />,
        },
      ];
    }

    return [
      {
        title: "Dashboard",
        href: "/admin",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        title: "Laporan",
        href: "/admin/laporan",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        title: "Area Parkir",
        href: "/admin/area-parkir",
        icon: <MapPin className="w-4 h-4" />,
        badge: areas.length > 0 ? areas.length : undefined,
      },
      {
        title: "Tarif & Jenis",
        href: "/admin/tarif",
        icon: <Tag className="w-4 h-4" />,
      },
      {
        title: "Kelola User",
        href: "/admin/users",
        icon: <Users className="w-4 h-4" />,
      },
      {
        title: "Kendaraan",
        href: "/admin/kendaraan",
        icon: <Car className="w-4 h-4" />,
      },
      {
        title: "Transaksi",
        href: "/admin/transaksi",
        icon: <History className="w-4 h-4" />,
      },
      {
        title: "Log Audit",
        href: "/admin/logs",
        icon: <Activity className="w-4 h-4" />,
      },
      {
        title: "Gate Masuk",
        href: "/petugas/masuk",
        icon: <LogIn className="w-4 h-4" />,
      },
      {
        title: "Gate Keluar",
        href: "/petugas/keluar",
        icon: <LogOut className="w-4 h-4" />,
      },
    ];
  };

  const menuItems = getMenuItems();
  const filteredItems = searchQuery.trim()
    ? menuItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menuItems;

  const activeItem =
    menuItems.find((m) => m.href === pathname) || menuItems[0];

  const totalKapasitas = areas.reduce((acc, a) => acc + (a.kapasitas || 0), 0);
  const totalTerisi = areas.reduce((acc, a) => acc + (a.terisi || 0), 0);
  const okupansiPersen =
    totalKapasitas > 0 ? Math.round((totalTerisi / totalKapasitas) * 100) : 0;

  const getInitials = (name?: string) => {
    if (!name) return "PB";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  const dotColors = [
    "bg-amber-400",
    "bg-emerald-400",
    "bg-sky-400",
    "bg-rose-400",
  ];

  // Compact rail-only view when collapsed
  if (collapsed) {
    return (
      <aside className="w-16 rounded-[32px] bg-white border border-slate-200/90 shadow-[0_18px_40px_rgba(37,99,235,0.16)] p-2.5 flex flex-col items-center justify-between shrink-0 self-start sticky top-20 min-h-[540px]">
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            onClick={() => setCollapsed(false)}
            className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_6px_16px_rgba(37,99,235,0.35)] flex items-center justify-center hover:scale-105 transition-transform"
            title="Perluas Sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="w-8 h-px bg-slate-200" />
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.title}
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300 py-3 select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {activeItem?.title || "PARKIR"}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[288px] rounded-[34px] border border-white/70 shadow-[0_22px_50px_rgba(37,99,235,0.22),0_4px_12px_rgba(15,23,42,0.08)] overflow-hidden flex shrink-0 self-start sticky top-20 bg-white">
      {/* Left Main Panel (Royal-Blue to Deep-Blue gradient) */}
      <div className="flex-1 min-w-0 bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#172554] text-white flex flex-col justify-between py-4 pl-3.5 pr-0 relative">
        <div>
          {/* Top Brand / Workspace Header */}
          <div className="flex items-center justify-between pr-3.5 mb-3.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/40 via-blue-300/30 to-blue-900/40 border border-white/35 shadow-[inset_0_2px_4px_rgba(255,255,255,0.45),0_6px_14px_rgba(15,23,42,0.2)] flex items-center justify-center shrink-0">
                <ParkingSquare className="w-5 h-5 text-white drop-shadow" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm tracking-tight text-white truncate">
                  Parkir-Bozz
                </div>
                <div className="text-[11px] text-blue-100/80 truncate capitalize">
                  {user?.role ? `${user.role} workspace` : "Parking workspace"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 flex items-center justify-center text-white/90 transition-colors shrink-0"
              title="Perkecil Sidebar"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search Pill */}
          <div className="pr-3.5 mb-3.5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/12 border border-white/20 shadow-[inset_0_1px_2px_rgba(255,255,255,0.18)] focus-within:bg-white/20 transition-colors">
              <Search className="w-3.5 h-3.5 text-blue-100/80 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs text-white placeholder-blue-100/70 focus:outline-none w-full min-w-0"
              />
              <span className="text-[10px] font-mono text-blue-100/75 bg-white/10 px-1.5 py-0.5 rounded-md shrink-0">
                ⌘K
              </span>
            </div>
          </div>

          {/* Main Nav Pills */}
          <nav className="space-y-1.5">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className={isActive ? "relative" : "pr-3.5"}>
                  <Link
                    href={item.href}
                    className={`relative flex items-center justify-between gap-2.5 px-3.5 py-2.5 text-xs font-semibold transition-all duration-150 select-none ${
                      isActive
                        ? "bg-white text-blue-700 font-bold rounded-l-full rounded-r-none shadow-[-4px_4px_14px_rgba(15,23,42,0.12)] z-10"
                        : "rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-blue-50 shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]"
                    }`}
                  >
                    {/* Concave inverse rounded fillets connecting active tab to white right rail */}
                    {isActive && (
                      <>
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -top-4 right-0 w-4 h-4 rounded-br-2xl shadow-[6px_6px_0_4px_#ffffff]"
                        />
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-4 right-0 w-4 h-4 rounded-tr-2xl shadow-[6px_-6px_0_4px_#ffffff]"
                        />
                      </>
                    )}

                    <span className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={
                          isActive ? "text-blue-600 shrink-0" : "text-blue-100 shrink-0"
                        }
                      >
                        {item.icon}
                      </span>
                      <span className="truncate">{item.title}</span>
                    </span>

                    {item.badge !== undefined && (
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-amber-400 text-slate-900"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

          {/* Secondary Section: Live Area Parkir (like PROJECTS in reference) */}
          {areas.length > 0 && (
            <div className="mt-5 pr-3.5">
              <div className="flex items-center justify-between px-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-200/75">
                  Area Parkir
                </span>
                {user?.role === "admin" && (
                  <Link
                    href="/admin/area-parkir"
                    className="w-5 h-5 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
                    title="Kelola Area Parkir"
                  >
                    <Plus className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div className="space-y-1.5">
                {areas.slice(0, 3).map((area, idx) => (
                  <Link
                    key={area.id_area}
                    href={user?.role === "petugas" ? "/petugas/masuk" : "/admin/area-parkir"}
                    className="flex items-center justify-between gap-2 px-3 py-2 rounded-full bg-white/8 hover:bg-white/15 border border-white/10 transition-colors"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          dotColors[idx % dotColors.length]
                        }`}
                      />
                      <span className="text-[11px] font-medium text-blue-50 truncate">
                        {area.nama_area}
                      </span>
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-white/12 text-blue-100 shrink-0">
                      {area.terisi}/{area.kapasitas}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Occupancy + Profile Card */}
        <div className="mt-5 pr-3.5 space-y-2.5">
          {/* Occupancy / Display Pill (matches Go Pro pill in reference) */}
          <div className="flex items-center justify-between gap-2 p-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-full bg-blue-400/20 border border-blue-300/40 flex items-center justify-center text-amber-300 shrink-0">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-bold text-white leading-tight truncate">
                  Okupansi
                </div>
                <div className="text-[10px] text-blue-200/80 leading-tight">
                  {okupansiPersen}% terisi
                </div>
              </div>
            </div>
            <Link
              href="/display"
              target="_blank"
              className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 text-[10px] font-extrabold shadow-sm transition-colors shrink-0"
            >
              Display
            </Link>
          </div>

          {/* User Profile Row */}
          {user && (
            <div className="flex items-center justify-between gap-2 px-1.5 pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 text-slate-900 font-black text-xs flex items-center justify-center shadow-sm">
                    {getInitials(user.nama_lengkap)}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#172554]" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate leading-tight">
                    {user.nama_lengkap}
                  </div>
                  <div className="text-[10px] text-blue-200/75 truncate leading-tight">
                    @{user.username}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar dari sistem"
                className="p-1.5 rounded-full text-blue-200/80 hover:text-white hover:bg-white/15 transition-colors shrink-0"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Narrow White Rail (matches white vertical rail in reference) */}
      <div className="w-[52px] bg-white flex flex-col items-center justify-between py-4 px-1.5 shrink-0">
        <div className="flex flex-col items-center gap-2.5">
          {/* Top Royal-Blue Square-Rounded Action Button */}
          <Link
            href={user?.role === "owner" ? "/admin/laporan" : "/petugas/masuk"}
            title={user?.role === "owner" ? "Laporan" : "Gate Masuk"}
            className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-[0_6px_14px_rgba(37,99,235,0.35)] flex items-center justify-center hover:scale-105 transition-transform"
          >
            <ParkingSquare className="w-4 h-4" />
          </Link>

          {/* Soft Circular Action Buttons */}
          <Link
            href={user?.role === "owner" ? "/admin/transaksi" : "/petugas/masuk"}
            title="Tambah / Gate Masuk"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <Plus className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/display"
            target="_blank"
            title="Customer Display"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 flex items-center justify-center transition-colors shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)]"
          >
            <Monitor className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Vertical Rotated Active Page Label */}
        <div
          className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-300 py-2 select-none"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {activeItem?.title || "DASHBOARD"}
        </div>
      </div>
    </aside>
  );
}
