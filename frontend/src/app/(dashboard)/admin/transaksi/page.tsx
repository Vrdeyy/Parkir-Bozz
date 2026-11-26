"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Transaksi } from "@/types";
import { formatRupiah, formatDateTime, formatDuration } from "@/lib/utils";
import { toast } from "sonner";
import WordReveal from "@/components/motion/WordReveal";
import AnimatedCard from "@/components/motion/AnimatedCard";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
} from "lucide-react";

export default function RiwayatTransaksiPage() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter params
  const [status, setStatus] = useState<string>("");
  const [platNomor, setPlatNomor] = useState<string>("");
  const [tanggalMulai, setTanggalMulai] = useState<string>("");
  const [tanggalSelesai, setTanggalSelesai] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalData, setTotalData] = useState<number>(0);

  // Detail Modal
  const [selectedTx, setSelectedTx] = useState<Transaksi | null>(null);

  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (status) params.status = status;
      if (platNomor.trim()) params.plat_nomor = platNomor.trim();
      if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
      if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;

      const res = await api.get("/transaksi", { params });
      const data = res.data?.data || res.data;

      if (Array.isArray(data)) {
        setTransaksiList(data);
        setTotalData(data.length);
      } else if (data?.items) {
        setTransaksiList(data.items);
        setTotalData(data.total || data.items.length);
      }
    } catch (err: any) {
      toast.error("Gagal mengambil data transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransaksi();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedCard delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded bg-purple-500 inline-block" />
              <WordReveal text="Riwayat Seluruh Transaksi Parkir" tag="span" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data audit transaksi masuk, keluar, dan pembayaran kendaraan
            </p>
          </div>
          <button
            onClick={fetchTransaksi}
            className="btn-3d-royal px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </AnimatedCard>

      {/* Filter Bar */}
      <AnimatedCard delay={0.1}>
        <div className="neu-card rounded-3xl p-4">
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3 items-center"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={platNomor}
              onChange={(e) => setPlatNomor(e.target.value)}
              placeholder="Cari berdasarkan Plat Nomor..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono uppercase focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div className="w-full sm:w-44">
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-400"
            >
              <option value="">Semua Status Transaksi</option>
              <option value="masuk">Sedang Parkir (Masuk)</option>
              <option value="keluar">Selesai (Keluar)</option>
            </select>
          </div>

          <input
            type="date"
            value={tanggalMulai}
            onChange={(e) => setTanggalMulai(e.target.value)}
            title="Dari Tanggal"
            className="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400"
          />

          <input
            type="date"
            value={tanggalSelesai}
            onChange={(e) => setTanggalSelesai(e.target.value)}
            title="Sampai Tanggal"
            className="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400"
          />

          <button
            type="submit"
            className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold w-full sm:w-auto"
          >
            Terapkan Filter
          </button>
        </form>
      </div>
        </AnimatedCard>

      {/* Tabel Transaksi */}
      <AnimatedCard delay={0.15}>
        <div className="neu-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
              <tr>
                <th className="p-4">Kode Tiket</th>
                <th className="p-4">No. Polisi</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Waktu Masuk</th>
                <th className="p-4">Durasi</th>
                <th className="p-4">Total Biaya</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : transaksiList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                    Tidak ada transaksi parkir yang cocok.
                  </td>
                </tr>
              ) : (
                transaksiList.map((tx) => (
                  <tr key={tx.id_transaksi} className="hover:bg-blue-50/40">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {tx.kode_transaksi}
                    </td>
                    <td className="p-4 font-black font-mono text-sm tracking-wider text-slate-900">
                      {tx.kendaraan?.plat_nomor}
                    </td>
                    <td className="p-4 text-slate-600 capitalize font-medium">
                      {tx.kendaraan?.jenis?.nama_jenis || "-"}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatDateTime(tx.waktu_masuk)}
                    </td>
                    <td className="p-4 font-mono">
                      {tx.status === "keluar"
                        ? formatDuration(tx.durasi_jam)
                        : "Masih Parkir"}
                    </td>
                    <td className="p-4 font-mono font-bold text-emerald-600 text-sm">
                      {formatRupiah(tx.biaya_total)}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase ${
                          tx.status === "keluar"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-amber-50 text-amber-600 border border-amber-200"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
          <div>Halaman {page}</div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={transaksiList.length < limit}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
        </AnimatedCard>

      {/* Modal Detail Transaksi */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-lg p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setSelectedTx(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Detail Transaksi #{selectedTx.id_transaksi}</span>
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              {[
                ["Kode Transaksi", selectedTx.kode_transaksi, "text-slate-900 font-bold"],
                ["Plat Nomor", selectedTx.kendaraan?.plat_nomor, "text-blue-600 font-bold text-sm"],
                ["Area Parkir", selectedTx.area?.nama_area, "text-slate-700"],
                ["Waktu Masuk", formatDateTime(selectedTx.waktu_masuk), "text-slate-700"],
                ["Waktu Keluar", formatDateTime(selectedTx.waktu_keluar), "text-slate-700"],
                ["Durasi", formatDuration(selectedTx.durasi_jam), "text-amber-600 font-bold"],
                ["Total Biaya", formatRupiah(selectedTx.biaya_total), "text-emerald-600 font-bold text-sm"],
                ["Metode Bayar", (selectedTx.metode_pembayaran || "-").toUpperCase(), "text-slate-900 font-bold uppercase"],
                ["Petugas Masuk", selectedTx.user_masuk?.nama_lengkap || "-", "text-slate-700"],
                ["Petugas Keluar", selectedTx.user_keluar?.nama_lengkap || "-", "text-slate-700"],
              ].map(([label, value, cls]) => (
                <div key={label as string} className="flex justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500">{label}:</span>
                  <span className={cls as string}>{value as string}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setSelectedTx(null)}
                className="btn-3d-royal px-5 py-2 rounded-xl text-xs font-bold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
