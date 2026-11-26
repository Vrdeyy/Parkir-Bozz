"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaParkir, JenisKendaraan, Transaksi } from "@/types";
import { toast } from "sonner";
import TiketMasukPrint from "@/components/print/TiketMasukPrint";
import { displayChannel } from "@/lib/broadcast";
import WordReveal from "@/components/motion/WordReveal";
import AnimatedCard from "@/components/motion/AnimatedCard";
import {
  Car,
  Bike,
  PlusCircle,
  MapPin,
  CheckCircle2,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";

export default function GateMasukPage() {
  const [platNomor, setPlatNomor] = useState("");
  const [idJenis, setIdJenis] = useState<number | "">("");
  const [idArea, setIdArea] = useState<number | "">("");
  const [warna, setWarna] = useState("");
  const [pemilik, setPemilik] = useState("");

  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [ticketResult, setTicketResult] = useState<Transaksi | null>(null);

  const fetchMasterData = async () => {
    setLoadingMaster(true);
    try {
      const [resArea, resJenis] = await Promise.allSettled([
        api.get("/area-parkir"),
        api.get("/jenis-kendaraan"),
      ]);

      if (resArea.status === "fulfilled") {
        setAreas(resArea.value.data || []);
        if (resArea.value.data?.length > 0 && !idArea) {
          setIdArea(resArea.value.data[0].id_area);
        }
      } else {
        setAreas([
          { id_area: 1, nama_area: "Area Motor A", kapasitas: 50, terisi: 12, status_aktif: true },
          { id_area: 2, nama_area: "Area Mobil B", kapasitas: 30, terisi: 8, status_aktif: true },
        ]);
        if (!idArea) setIdArea(1);
      }

      if (resJenis.status === "fulfilled") {
        setJenisList(resJenis.value.data || []);
        if (resJenis.value.data?.length > 0 && !idJenis) {
          setIdJenis(resJenis.value.data[0].id_jenis);
        }
      } else {
        setJenisList([
          { id_jenis: 1, nama_jenis: "Motor" },
          { id_jenis: 2, nama_jenis: "Mobil" },
        ]);
        if (!idJenis) setIdJenis(1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMaster(false);
    }
  };

  useEffect(() => {
    fetchMasterData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPlat = platNomor.trim().toUpperCase();

    if (!cleanPlat) {
      toast.error("Nomor plat kendaraan wajib diisi!");
      return;
    }
    if (!idJenis) {
      toast.error("Pilih jenis kendaraan!");
      return;
    }
    if (!idArea) {
      toast.error("Pilih area parkir!");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/transaksi/masuk", {
        plat_nomor: cleanPlat,
        id_jenis: Number(idJenis),
        id_area: Number(idArea),
        warna: warna.trim() || undefined,
        pemilik: pemilik.trim() || undefined,
      });

      const dataTransaksi = res.data?.data || res.data;
      setTicketResult(dataTransaksi);
      toast.success(`Kendaraan ${cleanPlat} berhasil didaftarkan!`);

      displayChannel.emit({
        screen: "masuk",
        state: "processing",
        plat_nomor: cleanPlat,
        jenis: jenisList.find((j) => j.id_jenis === Number(idJenis))?.nama_jenis,
        area: areas.find((a) => a.id_area === Number(idArea))?.nama_area,
        kode_transaksi: dataTransaksi.kode_transaksi,
        waktu_masuk: dataTransaksi.waktu_masuk,
      });

      setTimeout(() => {
        window.print();
      }, 350);

      fetchMasterData();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal memproses pendaftaran kendaraan masuk";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setPlatNomor("");
    setWarna("");
    setPemilik("");
    setTicketResult(null);
    displayChannel.emit({ screen: "masuk", state: "standby" });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-blue-500 inline-block" />
            <WordReveal
              text="Gate Masuk: Pendaftaran & Tiket Parkir"
              className="text-xl font-black tracking-tight text-slate-900"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Input plat nomor dan pilih area parkir untuk mencetak tiket QR kendaraan masuk
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/display"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start text-blue-600 border border-slate-200 bg-white hover:bg-blue-50 transition-colors"
            title="Buka Layar Pengendara di tab/layar baru"
          >
            <span>Buka Customer Display</span>
          </a>
          <button
            onClick={fetchMasterData}
            disabled={loadingMaster}
            className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingMaster ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Form Input */}
        <AnimatedCard delay={0.1} className="lg:col-span-7">
          <div className="neu-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-blue-500" />
                <span>Formulir Pendaftaran Kendaraan</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Mode Kasir Cepat
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Plat Nomor */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Nomor Polisi (Plat Nomor) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={platNomor}
                    onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                    placeholder="CONTOH: B 1234 ABC"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-xl font-mono font-black tracking-widest focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 uppercase transition-all"
                  />
                  <div className="absolute right-3.5 top-3.5 text-xs font-mono text-slate-400">
                    [ENTER]
                  </div>
                </div>
              </div>

              {/* Jenis Kendaraan Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Pilih Jenis Kendaraan <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {jenisList.map((j) => {
                    const isSelected = Number(idJenis) === j.id_jenis;
                    return (
                      <button
                        type="button"
                        key={j.id_jenis}
                        onClick={() => setIdJenis(j.id_jenis)}
                        className={`p-3 rounded-xl border text-left transition-all duration-75 select-none ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-500 shadow-md"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono font-bold">
                            #{j.id_jenis}
                          </span>
                          {j.nama_jenis.toLowerCase().includes("motor") ? (
                            <Bike className="w-4 h-4" />
                          ) : (
                            <Car className="w-4 h-4" />
                          )}
                        </div>
                        <div className="font-bold text-sm tracking-tight capitalize">
                          {j.nama_jenis}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Area Parkir Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Pilih Area Parkir <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {areas.map((a) => {
                    const isSelected = Number(idArea) === a.id_area;
                    const sisa = Math.max(0, a.kapasitas - a.terisi);
                    const isFull = sisa <= 0;

                    return (
                      <button
                        type="button"
                        key={a.id_area}
                        disabled={isFull}
                        onClick={() => setIdArea(a.id_area)}
                        className={`p-3 rounded-xl border text-left transition-all duration-75 select-none relative ${
                          isFull
                            ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200"
                            : isSelected
                            ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:border-emerald-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs">{a.nama_area}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-lg font-mono font-bold ${
                              isFull
                                ? "bg-rose-50 text-rose-500 border border-rose-200"
                                : isSelected
                                ? "bg-emerald-500/30 text-white"
                                : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            }`}
                          >
                            {isFull ? "PENUH" : `Sisa ${sisa} Slot`}
                          </span>
                        </div>
                        <div className={`text-[11px] mt-1 font-mono ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                          Terisi: {a.terisi} / {a.kapasitas} Kapasitas
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Warna & Pemilik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Warna Kendaraan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={warna}
                    onChange={(e) => setWarna(e.target.value)}
                    placeholder="Contoh: Hitam, Putih, Merah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Nama Pemilik (Opsional)
                  </label>
                  <input
                    type="text"
                    value={pemilik}
                    onChange={(e) => setPemilik(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn-3d-royal w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 mt-6"
              >
                {submitting ? (
                  <span>Mendaftarkan Kendaraan...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Daftarkan Kendaraan & Buat Tiket Masuk</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </AnimatedCard>

        {/* Kolom Kanan: Tiket / Status Area */}
        <AnimatedCard delay={0.2} className="lg:col-span-5 space-y-6">
          {ticketResult ? (
            <div className="neu-card rounded-3xl p-6 border border-blue-200 relative">
              <button
                onClick={handleResetForm}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-blue-50"
                title="Tutup / Tiket Baru"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-sm text-emerald-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Tiket Berhasil Dibuat!</span>
              </h3>
              <TiketMasukPrint
                transaksi={ticketResult}
                onPrintDone={handleResetForm}
              />
            </div>
          ) : (
            <div className="neu-card rounded-3xl p-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                <span>Status Kapasitas Area Parkir Fisik</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Visualisasi persentase okupansi kendaraan di setiap zona
              </p>

              <div className="space-y-4">
                {areas.map((a) => {
                  const sisa = Math.max(0, a.kapasitas - a.terisi);
                  const persentase =
                    a.kapasitas > 0 ? Math.round((a.terisi / a.kapasitas) * 100) : 0;
                  return (
                    <div
                      key={a.id_area}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-xs text-slate-900">
                          {a.nama_area}
                        </span>
                        <span className="text-xs font-mono font-semibold text-slate-500">
                          {a.terisi}/{a.kapasitas} ({persentase}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            persentase > 90
                              ? "bg-rose-500"
                              : persentase > 70
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, persentase)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                        <span>Tersedia: {sisa} slot</span>
                        <span>{a.status_aktif ? "ZONA AKTIF" : "NONAKTIF"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
  );
}
