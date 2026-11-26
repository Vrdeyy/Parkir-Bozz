"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { User } from "@/types";
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
} from "lucide-react";

interface MenuItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  const getMenuItems = (): MenuItem[] => {
    if (!user) return [];

    // Role Petugas: Hanya fokus operasional Gate Masuk & Kasir Keluar
    if (user.role === "petugas") {
      return [
        {
          title: "Gate Masuk (Tiket)",
          href: "/petugas/masuk",
          icon: <LogIn className="w-4 h-4" />,
        },
        {
          title: "Gate Keluar & Kasir",
          href: "/petugas/keluar",
          icon: <LogOut className="w-4 h-4" />,
        },
      ];
    }

    // Role Owner: Fokus pemantauan omzet, laporan keuangan, dan riwayat transaksi
    if (user.role === "owner") {
      return [
        {
          title: "Dashboard Owner",
          href: "/owner",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          title: "Laporan & Grafik Omzet",
          href: "/admin/laporan",
          icon: <FileText className="w-4 h-4" />,
        },
        {
          title: "Riwayat Transaksi",
          href: "/admin/transaksi",
          icon: <History className="w-4 h-4" />,
        },
      ];
    }

    // Role Admin: Pengelola Master Data, Laporan Finansial, dan Operasional
    return [
      {
        title: "Dashboard Overview",
        href: "/admin",
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        title: "Laporan & Rekap",
        href: "/admin/laporan",
        icon: <FileText className="w-4 h-4" />,
      },
      {
        title: "Area Parkir",
        href: "/admin/area-parkir",
        icon: <MapPin className="w-4 h-4" />,
      },
      {
        title: "Tarif & Jenis",
        href: "/admin/tarif",
        icon: <Tag className="w-4 h-4" />,
      },
      {
        title: "Kelola Petugas / User",
        href: "/admin/users",
        icon: <Users className="w-4 h-4" />,
      },
      {
        title: "Master Kendaraan",
        href: "/admin/kendaraan",
        icon: <Car className="w-4 h-4" />,
      },
      {
        title: "Riwayat Transaksi",
        href: "/admin/transaksi",
        icon: <History className="w-4 h-4" />,
      },
      {
        title: "Log Audit Sistem",
        href: "/admin/logs",
        icon: <Activity className="w-4 h-4" />,
      },
      {
        title: "Gate Masuk (Petugas)",
        href: "/petugas/masuk",
        icon: <LogIn className="w-4 h-4" />,
      },
      {
        title: "Gate Keluar (Petugas)",
        href: "/petugas/keluar",
        icon: <LogOut className="w-4 h-4" />,
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <aside className="w-64 rounded-3xl neu-card p-4 flex flex-col justify-between shrink-0 self-start sticky top-20">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 px-3">
          {user?.role === "petugas"
            ? "Operasional Gerbang"
            : user?.role === "owner"
              ? "Menu Owner"
              : "Menu Utama"}
        </div>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm transition-all duration-150 select-none ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)]"
                    : "text-slate-600 hover:text-blue-700 hover:bg-blue-50/70"
                }`}
              >
                <span className={isActive ? "text-white" : "text-slate-400"}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
