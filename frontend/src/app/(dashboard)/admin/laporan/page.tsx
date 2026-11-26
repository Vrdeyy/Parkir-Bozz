"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatRupiah, formatDateTime, formatDuration } from "@/lib/utils";
import WordReveal from "@/components/motion/WordReveal";
import AnimatedCard from "@/components/motion/AnimatedCard";
import { toast } from "sonner";
import {
  Printer,
  DollarSign,
  Banknote,
  QrCode,
  Calendar,
  RefreshCw,
  BarChart3,
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

export default function LaporanRekapAdminPage() {
  const [laporan, setLaporan] = useState<any | null>(null);
  const [grafikData, setGrafikData] = useState<any[]>([]);
  const [tipeGrafik, setTipeGrafik] = useState<"harian" | "bulanan">("harian");
  const [loading, setLoading] = useState(true);

  // Filters
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [metode, setMetode] = useState("");
  const [idArea, setIdArea] = useState("");
  const [areas, setAreas] = useState<any[]>([]);

  useEffect(() => {
    api.get("/area-parkir")
      .then((res) => setAreas(res.data?.data || res.data || []))
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (tanggalMulai) params.tanggal_mulai = tanggalMulai;
      if (tanggalSelesai) params.tanggal_selesai = tanggalSelesai;
      if (metode) params.metode_pembayaran = metode;
      if (idArea) params.id_area = Number(idArea);

      const grafikParams: any = { interval: tipeGrafik };
      if (tanggalMulai) grafikParams.tanggal_mulai = tanggalMulai;
      if (tanggalSelesai) grafikParams.tanggal_selesai = tanggalSelesai;
      if (idArea) grafikParams.id_area = Number(idArea);

      const [resLaporan, resGrafik] = await Promise.allSettled([
        api.get("/dashboard/laporan-rekap", { params }),
        api.get("/dashboard/grafik-pendapatan", { params: grafikParams }),
      ]);

      if (resLaporan.status === "fulfilled") {
        setLaporan(resLaporan.value.data);
      }
      if (resGrafik.status === "fulfilled") {
        setGrafikData(resGrafik.value.data?.data || resGrafik.value.data || []);
      }
    } catch (err: any) {
      toast.error("Gagal mengambil data laporan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [metode, idArea, tipeGrafik]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handlePrint = () => {
    window.print();
  };

  const ringkasan = laporan?.ringkasan || {
    grand_total: 0,
    total_pendapatan: 0,
    total_tunai: 0,
    total_non_tunai: 0,
    total_transaksi: 0,
  };
  const totalPendapatan =
    ringkasan.grand_total ?? ringkasan.pemasukan ?? ringkasan.total_pendapatan ?? 0;

  const listTransaksi = Array.isArray(laporan?.data)
    ? laporan.data
    : laporan?.transaksi?.items || laporan?.transaksi || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <AnimatedCard delay={0}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-6 rounded bg-emerald-500 inline-block" />
              <WordReveal text="Laporan Finansial & Rekapitulasi Pendapatan" tag="span" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Audit keuangan pendapatan tunai (cash laci kasir) dan non-tunai (QRIS)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Rekap Laporan</span>
            </button>
          </div>
        </div>
      </AnimatedCard>

      {/* Ringkasan Finansial Rekap */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AnimatedCard delay={0.1}>
          <div className="neu-card rounded-3xl p-5 h-full">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Total Pendapatan Terfilter
              </span>
              <DollarSign className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black font-mono text-emerald-600">
              {formatRupiah(totalPendapatan)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Total {ringkasan.total_transaksi} Transaksi Lunas
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <div className="neu-card rounded-3xl p-5 h-full">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pembayaran Tunai (Cash)
              </span>
              <Banknote className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black font-mono text-blue-600">
              {formatRupiah(ringkasan.total_tunai)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Uang fisik di laci kasir petugas
            </div>
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <div className="neu-card rounded-3xl p-5 h-full">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider">
                Pembayaran QRIS Midtrans
              </span>
              <QrCode className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black font-mono text-amber-600">
              {formatRupiah(ringkasan.total_non_tunai)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Settlement digital rekening
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Grafik Tren Pendapatan Recharts */}
      <AnimatedCard delay={0.1}>
        <div className="neu-card rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-sm text-slate-900">
              Grafik Tren Omzet Pendapatan
            </h3>
          </div>

          <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start">
            <button
              onClick={() => setTipeGrafik("harian")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tipeGrafik === "harian"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Harian (Minggu Ini)
            </button>
            <button
              onClick={() => setTipeGrafik("bulanan")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                tipeGrafik === "bulanan"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Bulanan (Tahun Ini)
            </button>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grafikData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="periode"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => `Rp ${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e2e8f0",
                  borderRadius: "0.75rem",
                  fontSize: "12px",
                  color: "#1e293b",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}
                formatter={(value: any) => [formatRupiah(value), "Pendapatan"]}
              />
              <Bar
                dataKey="pemasukan"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
        </AnimatedCard>

      {/* Filter Form */}
      <AnimatedCard delay={0.1}>
        <div className="neu-card rounded-3xl p-5">
        <form
          onSubmit={handleFilterSubmit}
          className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={tanggalMulai}
              onChange={(e) => setTanggalMulai(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={tanggalSelesai}
              onChange={(e) => setTanggalSelesai(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Metode Pembayaran
            </label>
            <select
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-400"
            >
              <option value="">Semua Metode</option>
              <option value="tunai">Tunai (Cash)</option>
              <option value="non_tunai">Non-Tunai (QRIS)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Area Parkir
            </label>
            <select
              value={idArea}
              onChange={(e) => setIdArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-400"
            >
              <option value="">Semua Area</option>
              {areas.map((a) => (
                <option key={a.id_area} value={a.id_area}>
                  {a.nama_area}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-3d-royal py-2.5 rounded-xl text-xs font-bold"
          >
            Terapkan Filter
          </button>
        </form>
      </div>
        </AnimatedCard>

      {/* Tabel Data Rekap (Printable) */}
      <AnimatedCard delay={0.1}>
        <div
          id="thermal-print-area"
          className="neu-card rounded-3xl overflow-hidden"
        >
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 uppercase font-mono">
            Rincian Seluruh Transaksi Parkir
          </span>
          <span className="text-xs font-mono text-slate-500">
            {listTransaksi.length} Data Ditampilkan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
              <tr>
                <th className="p-4">Kode</th>
                <th className="p-4">Plat Nomor</th>
                <th className="p-4">Waktu Masuk</th>
                <th className="p-4">Waktu Keluar</th>
                <th className="p-4">Durasi</th>
                <th className="p-4">Metode</th>
                <th className="p-4 text-right">Biaya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Memuat data laporan...
                  </td>
                </tr>
              ) : listTransaksi.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Tidak ada transaksi pada rentang filter ini.
                  </td>
                </tr>
              ) : (
                listTransaksi.map((item: any) => (
                  <tr key={item.id_transaksi} className="hover:bg-blue-50/40">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {item.kode_transaksi}
                    </td>
                    <td className="p-4 font-black font-mono text-sm tracking-wider text-slate-900">
                      {item.kendaraan?.plat_nomor}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatDateTime(item.waktu_masuk)}
                    </td>
                    <td className="p-4 text-slate-500 font-mono">
                      {formatDateTime(item.waktu_keluar)}
                    </td>
                    <td className="p-4 font-mono">
                      {formatDuration(item.durasi_jam)}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {item.metode_pembayaran || "-"}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-emerald-600 text-sm">
                      {formatRupiah(item.biaya_total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </AnimatedCard>
    </div>
  );
}
