"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LogAktivitas } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { Activity, RefreshCw, Search, Shield, ChevronLeft, ChevronRight } from "lucide-react";

export default function LogAktivitasPage() {
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const limit = 20;

  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const params: any = { page: targetPage, limit };
      if (search.trim()) params.aktivitas = search.trim();
      if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
      if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;

      const res = await api.get("/log-aktivitas", { params });
      const data = res.data?.data || res.data || [];
      setLogs(Array.isArray(data) ? data : data.items || []);
      setTotalPages(res.data?.pagination?.total_pages || 1);
      setTotalLogs(res.data?.pagination?.total || (Array.isArray(data) ? data.length : 0));
    } catch (err: any) {
      toast.error("Gagal mengambil log aktivitas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (page !== 1) setPage(1);
    else fetchLogs(1);
  };

  const filtered = logs;

  const getRoleBadge = (r?: string) => {
    switch (r) {
      case "admin":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "owner":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "petugas":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      default:
        return "bg-slate-100 text-slate-500 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-rose-500 inline-block" />
            Audit Trail: Log Aktivitas Sistem
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Rekam jejak setiap aksi pengguna untuk keamanan dan audit operasional
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="neu-card rounded-3xl p-4">
        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2 relative">
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Kata Kunci Aktivitas
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari keyword aktivitas..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={tanggalSelesai}
                onChange={(e) => setTanggalSelesai(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400"
              />
            </div>
            <button
              type="submit"
              className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold self-end"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Logs */}
      <div className="neu-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Waktu Aktivitas</th>
                <th className="p-4">Pengguna</th>
                <th className="p-4">Role</th>
                <th className="p-4">Deskripsi Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                    Memuat log aktivitas...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-mono">
                    Belum ada rekaman log aktivitas.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id_log} className="hover:bg-blue-50/40">
                    <td className="p-4 font-mono text-slate-400">
                      #{log.id_log}
                    </td>
                    <td className="p-4 font-mono text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.waktu_aktivitas)}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {log.user?.nama_lengkap || `User #${log.id_user}`}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase ${getRoleBadge(log.user?.role)}`}>
                        {log.user?.role || "-"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">
                      {log.aktivitas}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div>
            Halaman {page} dari {totalPages} ({totalLogs} total log)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
