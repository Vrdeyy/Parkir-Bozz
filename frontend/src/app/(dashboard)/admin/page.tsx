"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DashboardSummary } from "@/types";
import { formatRupiah } from "@/lib/utils";
import WordReveal from "@/components/motion/WordReveal";
import AnimatedCard from "@/components/motion/AnimatedCard";
import {
  DollarSign,
  Car,
  TrendingUp,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Users,
  Tag,
  History,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const RING_COLORS = ["#3b66f5", "#6366f1", "#10b981", "#f59e0b"];

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [grafikData, setGrafikData] = useState<any[]>([]);
  const [tipeGrafik, setTipeGrafik] = useState<"harian" | "bulanan">("harian");
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resSummary, resGrafik] = await Promise.allSettled([
        api.get("/dashboard/summary"),
        api.get("/dashboard/grafik-pendapatan", { params: { interval: tipeGrafik } }),
      ]);
      if (resSummary.status === "fulfilled") {
        setSummary(resSummary.value.data?.data || resSummary.value.data);
      }
      if (resGrafik.status === "fulfilled") {
        setGrafikData(resGrafik.value.data?.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [tipeGrafik]);

  const areas = summary?.area_parkir || [];
  const totalTerisi = areas.reduce((s, a) => s + (a.terisi || 0), 0);
  const totalKapasitas = areas.reduce((s, a) => s + (a.kapasitas || 0), 0);
  const overallPct =
    totalKapasitas > 0 ? Math.round((totalTerisi / totalKapasitas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <WordReveal
            text="Dashboard Administrator"
            className="text-2xl font-black tracking-tight text-slate-900"
          />
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Ringkasan omzet real-time, okupansi parkir, dan manajemen operasional
          </p>
        </div>
        <button
          onClick={fetchAll}
          disabled={loading}
          className="neu-card px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 hover:text-blue-600 flex items-center gap-2 self-start transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Bento Grid Atas: 2x2 KPI Kiri + Okupansi Concentric Ring Kanan (ala Gambar 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 2x2 KPI Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Featured Royal Blue Hero Card */}
          <AnimatedCard delay={0.05}>
            <div className="rounded-3xl p-5 bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white shadow-[0_16px_32px_-8px_rgba(37,99,235,0.45)] h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400 text-slate-950">
                  +{summary?.transaksi_keluar_hari_ini || 0} Lunas
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-blue-100">
                  Omzet Hari Ini
                </div>
                <div className="text-2xl font-black font-mono tracking-tight mt-1">
                  {formatRupiah(summary?.omzet_hari_ini || 0)}
                </div>
                <div className="text-[11px] text-blue-100/80 mt-1">
                  Pendapatan terkonfirmasi hari ini
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Card 2: Omzet Bulan Ini */}
          <AnimatedCard delay={0.1}>
            <div className="neu-card rounded-3xl p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Bulan Ini
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Total Omzet Bulanan
                </div>
                <div className="text-2xl font-black font-mono text-slate-900 tracking-tight mt-1">
                  {formatRupiah(summary?.omzet_bulan_ini || 0)}
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-1">
                  Minggu ini: {formatRupiah(summary?.omzet_minggu_ini || 0)}
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Card 3: Kendaraan Aktif */}
          <AnimatedCard delay={0.15}>
            <div className="neu-card rounded-3xl p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <Car className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Di Dalam
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Kendaraan Aktif
                </div>
                <div className="text-2xl font-black font-mono text-slate-900 tracking-tight mt-1">
                  {summary?.kendaraan_aktif || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Belum keluar gerbang
                </div>
              </div>
            </div>
          </AnimatedCard>

          {/* Card 4: Check-In Hari Ini */}
          <AnimatedCard delay={0.2}>
            <div className="neu-card rounded-3xl p-5 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Hari Ini
                </span>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500">
                  Total Check-In
                </div>
                <div className="text-2xl font-black font-mono text-slate-900 tracking-tight mt-1">
                  {summary?.total_transaksi_hari_ini || 0}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Kendaraan masuk gate
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        {/* Right Card: Concentric Rings Okupansi Area Parkir */}
        <AnimatedCard delay={0.25} className="lg:col-span-5">
          <div className="neu-card rounded-3xl p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Okupansi Area Parkir
                </h3>
                <p className="text-xs text-slate-400">
                  Keterisian slot gerbang secara real-time
                </p>
              </div>
              <Link
                href="/admin/area-parkir"
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Kelola
              </Link>
            </div>

            <div className="flex items-center gap-6 my-2">
              {/* Concentric SVG Rings */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {(areas.length > 0 ? areas.slice(0, 3) : [{ persentase_okupansi: 0 }]).map(
                    (area, idx) => {
                      const r = 48 - idx * 12;
                      const c = 2 * Math.PI * r;
                      const pct = Math.min(100, Math.max(0, area.persentase_okupansi || 0));
                      const offset = c - (pct / 100) * c;
                      return (
                        <g key={idx}>
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="none"
                            stroke="#e2e8f0"
                            strokeWidth="7"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r={r}
                            fill="none"
                            stroke={RING_COLORS[idx % RING_COLORS.length]}
                            strokeWidth="7"
                            strokeLinecap="round"
                            strokeDasharray={c}
                            strokeDashoffset={offset}
                          />
                        </g>
                      );
                    }
                  )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black font-mono text-slate-900">
                    {overallPct}%
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    Terisi
                  </span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 min-w-0">
                <div className="text-2xl font-black font-mono text-slate-900">
                  {totalTerisi}
                  <span className="text-sm font-semibold text-slate-400">
                    {" "}
                    / {totalKapasitas} slot
                  </span>
                </div>
                {areas.slice(0, 3).map((area, idx) => (
                  <div
                    key={area.id_area}
                    className="flex items-center justify-between text-xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: RING_COLORS[idx % RING_COLORS.length] }}
                      />
                      <span className="font-semibold text-slate-700 truncate">
                        {area.nama_area}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 shrink-0">
                      {area.terisi}/{area.kapasitas}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Bento Grid Bawah: Grafik Omzet Kiri + Menu Pintasan Kanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Grafik Tren Pendapatan */}
        <AnimatedCard delay={0.3} className="lg:col-span-8">
          <div className="neu-card rounded-3xl p-6 h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Grafik Tren Pendapatan
                </h3>
                <p className="text-xs text-slate-400">
                  Data transaksi lunas langsung dari sistem kasir
                </p>
              </div>
              <div className="flex gap-1 p-1 rounded-2xl bg-slate-100 border border-slate-200 self-start">
                <button
                  onClick={() => setTipeGrafik("harian")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipeGrafik === "harian"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setTipeGrafik("bulanan")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    tipeGrafik === "bulanan"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Bulanan
                </button>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={grafikData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="periode"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "1rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [formatRupiah(value), "Pemasukan"]}
                  />
                  <Bar
                    dataKey="pemasukan"
                    fill="#3b66f5"
                    radius={[10, 10, 10, 10]}
                    maxBarSize={36}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </AnimatedCard>

        {/* Pintasan Manajemen */}
        <AnimatedCard delay={0.35} className="lg:col-span-4">
          <div className="neu-card rounded-3xl p-6 h-full">
            <h3 className="font-bold text-base text-slate-900 mb-4">
              Akses Cepat Manajemen
            </h3>
            <div className="space-y-2.5">
              <Link
                href="/admin/laporan"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Laporan & Rekap
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Audit tunai & QRIS
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/tarif"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Tarif & Jenis
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Atur tarif per jam
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/users"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Kelola Pengguna
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Admin, Owner & Petugas
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>

              <Link
                href="/admin/transaksi"
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Riwayat Transaksi
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Data parkir masuk/keluar
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </div>
        </AnimatedCard>
      </div>
    </div>
  );
}
