"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Transaksi } from "@/types";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { formatRupiah, formatDateTime, formatDuration } from "@/lib/utils";
import StrukKeluarPrint from "@/components/print/StrukKeluarPrint";
import QRScanner from "@/components/scanner/QRScanner";
import { displayChannel } from "@/lib/broadcast";
import WordReveal from "@/components/motion/WordReveal";
import AnimatedCard from "@/components/motion/AnimatedCard";
import {
  ScanLine,
  QrCode,
  Search,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock,
  Car,
  Receipt,
  X,
  Sparkles,
  Camera,
} from "lucide-react";

export default function GateKeluarKasirPage() {
  const [tokenInput, setTokenInput] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [loadingScan, setLoadingScan] = useState(false);

  const [tagihan, setTagihan] = useState<any | null>(null);
  const [metode, setMetode] = useState<"tunai" | "qris">("tunai");
  const [jumlahBayar, setJumlahBayar] = useState<number | "">("");
  const [loadingBayar, setLoadingBayar] = useState(false);
  const [qrisData, setQrisData] = useState<any | null>(null);
  const [pollingStatus, setPollingStatus] = useState<string>("menunggu");
  const [loadingQris, setLoadingQris] = useState(false);
  const [strukResult, setStrukResult] = useState<Transaksi | null>(null);

  const handleCariTiket = async (identifierOverride?: string) => {
    const identitas = (identifierOverride || tokenInput).trim();
    if (!identitas) {
      toast.error("Masukkan QR Token atau Kode Transaksi tiket!");
      return;
    }

    setLoadingScan(true);
    setTagihan(null);
    setQrisData(null);
    setStrukResult(null);

    try {
      const res = await api.post("/transaksi/keluar/scan", {
        identitas_tiket: identitas,
        qr_token: identitas,
      });

      const dataTagihan = res.data?.data || res.data;
      setTagihan(dataTagihan);
      setJumlahBayar(Number(dataTagihan.biaya_total || 0));
      toast.success("Tiket valid! Kalkulasi tarif berhasil didapatkan.");

      displayChannel.emit({
        screen: "keluar",
        state: "scanned",
        plat_nomor: dataTagihan.kendaraan?.plat_nomor || dataTagihan.plat_nomor || identitas,
        kode_transaksi: dataTagihan.kode_transaksi,
        biaya_total: Number(dataTagihan.biaya_total || 0),
        durasi_jam: dataTagihan.durasi_jam,
        waktu_masuk: dataTagihan.waktu_masuk,
        waktu_keluar: dataTagihan.waktu_keluar || new Date().toISOString(),
        metode: "tunai",
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || "Tiket tidak ditemukan atau sudah keluar";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoadingScan(false);
    }
  };

  const hitungKembalian = () => {
    if (!tagihan || jumlahBayar === "" || isNaN(Number(jumlahBayar))) return 0;
    const biaya = Number(tagihan.biaya_total || 0);
    const bayar = Number(jumlahBayar);
    return Math.max(0, bayar - biaya);
  };

  const handleBayarTunai = async () => {
    if (!tagihan) return;
    const biaya = Number(tagihan.biaya_total || 0);
    const bayar = Number(jumlahBayar);

    if (bayar < biaya) {
      toast.error("Nominal uang yang dibayarkan kurang dari total tagihan!");
      return;
    }

    setLoadingBayar(true);
    try {
      const res = await api.post("/transaksi/keluar/bayar-tunai", {
        qr_token: tagihan.qr_token || tokenInput,
        jumlah_bayar: bayar,
      });

      const transaksiLunas = res.data?.data || res.data;
      setStrukResult(transaksiLunas);

      displayChannel.emit({
        screen: "keluar",
        state: "lunas",
        plat_nomor: transaksiLunas.kendaraan?.plat_nomor || tagihan?.kendaraan?.plat_nomor || tagihan?.plat_nomor,
        biaya_total: Number(transaksiLunas.biaya_total || tagihan?.biaya_total || 0),
        metode: "tunai",
        kembalian: hitungKembalian(),
      });

      setTagihan(null);
      toast.success("Pembayaran tunai berhasil ditutup!");
      setTimeout(() => window.print(), 350);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal memproses pembayaran tunai";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoadingBayar(false);
    }
  };

  const handleRequestQris = async () => {
    if (!tagihan) return;
    setLoadingQris(true);
    try {
      const res = await api.post("/transaksi/keluar/bayar-qris", {
        qr_token: tagihan.qr_token || tokenInput,
      });
      const dataQris = res.data?.data || res.data;
      setQrisData(dataQris);
      setPollingStatus("menunggu");

      displayChannel.emit({
        screen: "keluar",
        state: "payment",
        plat_nomor: tagihan.kendaraan?.plat_nomor || tagihan.plat_nomor,
        kode_transaksi: tagihan.kode_transaksi,
        biaya_total: Number(tagihan.biaya_total || 0),
        metode: "qris",
        qris_code: dataQris.qr_string || dataQris.qr_url || `QRIS-MIDTRANS-${tagihan.qr_token}`,
      });

      toast.success("Dynamic QRIS berhasil dibuat. Menunggu scan pembeli...");
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal membuat kode QRIS";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    } finally {
      setLoadingQris(false);
    }
  };

  const handleSimulasiQrisLunas = async () => {
    if (!tagihan) return;
    const identifier = tagihan.qr_token || tokenInput;
    try {
      const res = await api.post(
        `/transaksi/keluar/simulasi-qris-lunas/${identifier}`
      );
      const dataLunas = res.data?.data || res.data;
      setStrukResult(dataLunas);

      displayChannel.emit({
        screen: "keluar",
        state: "lunas",
        plat_nomor: dataLunas.kendaraan?.plat_nomor || tagihan?.kendaraan?.plat_nomor,
        biaya_total: Number(dataLunas.biaya_total || 0),
        metode: "qris",
        kembalian: 0,
      });

      setTagihan(null);
      setQrisData(null);
      toast.success("Simulasi QRIS Lunas Berhasil!");
      setTimeout(() => window.print(), 350);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal simulasi QRIS lunas";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (metode === "qris" && qrisData && tagihan && !strukResult) {
      const identifier = tagihan.qr_token || tokenInput;
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/transaksi/status-pembayaran/${identifier}`);
          const status = res.data?.status_pembayaran || res.data?.data?.status_pembayaran;

          if (status === "lunas") {
            setPollingStatus("lunas");
            clearInterval(interval);
            toast.success("Pembayaran QRIS Dikonfirmasi LUNAS!");
            const txLunas = res.data?.data || res.data;
            setStrukResult(txLunas);

            displayChannel.emit({
              screen: "keluar",
              state: "lunas",
              plat_nomor: txLunas.kendaraan?.plat_nomor || tagihan?.kendaraan?.plat_nomor,
              biaya_total: Number(txLunas.biaya_total || tagihan?.biaya_total || 0),
              metode: "qris",
              kembalian: 0,
            });

            setTagihan(null);
            setTimeout(() => window.print(), 350);
          }
        } catch {
          // ignore polling network glitches
        }
      }, 2500);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [metode, qrisData, tagihan, tokenInput, strukResult]);

  const handleResetKasir = () => {
    setTokenInput("");
    setTagihan(null);
    setQrisData(null);
    setStrukResult(null);
    setJumlahBayar("");
    displayChannel.emit({ screen: "keluar", state: "standby" });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-emerald-500 inline-block" />
            <WordReveal
              text="Gate Keluar & Kasir Pembayaran"
              className="text-xl font-black tracking-tight text-slate-900"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scan tiket QR atau masukkan kode transaksi untuk hitung biaya dan proses pembayaran
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/display"
            target="_blank"
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start text-emerald-600 border border-slate-200 bg-white hover:bg-emerald-50 transition-colors"
            title="Buka Layar Pengendara di tab/layar baru"
          >
            <span>Buka Customer Display</span>
          </a>
          {tagihan && (
            <button
              onClick={handleResetKasir}
              className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Batal / Transaksi Baru</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Scan & Tagihan */}
        <AnimatedCard delay={0.1} className="lg:col-span-6 space-y-6">
          {/* Box Scan Tiket */}
          <div className="neu-card rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ScanLine className="w-4 h-4 text-emerald-500" />
                <span>Identifikasi Tiket Keluar</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowScanner(!showScanner)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 border transition-colors ${
                  showScanner
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{showScanner ? "Tutup Kamera" : "Scan Kamera (html5-qrcode)"}</span>
              </button>
            </div>

            {showScanner && (
              <QRScanner
                onScanSuccess={(decodedText) => {
                  setTokenInput(decodedText);
                  handleCariTiket(decodedText);
                  setShowScanner(false);
                }}
                onClose={() => setShowScanner(false)}
              />
            )}

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCariTiket();
                  }}
                  placeholder="Tempel / Ketik Token QR atau Kode Tiket..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-sm font-mono font-medium focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200"
                />
              </div>

              <button
                onClick={() => handleCariTiket()}
                disabled={loadingScan}
                className="btn-3d-royal px-5 py-3 rounded-xl font-bold text-xs flex items-center gap-2"
              >
                {loadingScan ? (
                  <span>Mengecek...</span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Periksa</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              💡 Arahkan QR ke kamera atau ketik kode tiket & tekan [Enter].
            </p>
          </div>

          {/* Rincian Tagihan */}
          {tagihan && (
            <div className="neu-card rounded-3xl p-6 border-2 border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold text-sm text-slate-900">
                    Rincian Tagihan Parkir
                  </span>
                </div>
                <span className="font-mono text-xs bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-600 border border-slate-200">
                  {tagihan.kode_transaksi}
                </span>
              </div>

              {/* Plat Nomor */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center mb-4">
                <div className="text-[11px] font-mono text-slate-400 uppercase">
                  Nomor Polisi Teridentifikasi
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-slate-900 mt-1">
                  {tagihan.kendaraan?.plat_nomor || tagihan.plat_nomor || "-"}
                </div>
                <div className="text-xs text-blue-600 font-semibold mt-1">
                  {tagihan.kendaraan?.jenis?.nama_jenis || "KENDARAAN"} • Area {tagihan.area?.nama_area || "-"}
                </div>
              </div>

              {/* Rincian */}
              <div className="grid grid-cols-2 gap-3 mb-5 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">WAKTU MASUK</span>
                  <span className="font-semibold text-slate-700">
                    {formatDateTime(tagihan.waktu_masuk)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">WAKTU KELUAR</span>
                  <span className="font-semibold text-slate-700">
                    {formatDateTime(tagihan.waktu_keluar || new Date().toISOString())}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">DURASI PARKIR</span>
                  <span className="font-bold text-emerald-600">
                    {formatDuration(tagihan.durasi_jam)} ({tagihan.durasi_jam} Jam)
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">TARIF PER JAM</span>
                  <span className="font-semibold text-slate-700">
                    {formatRupiah(tagihan.tarif_per_jam_snapshot || tagihan.tarif?.tarif_per_jam)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <span className="font-black text-sm text-emerald-700">
                  TOTAL TAGIHAN:
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600">
                  {formatRupiah(tagihan.biaya_total)}
                </span>
              </div>
            </div>
          )}
        </AnimatedCard>

        {/* Kolom Kanan: Kasir / Struk */}
        <AnimatedCard delay={0.2} className="lg:col-span-6 space-y-6">
          {strukResult ? (
            <div className="neu-card rounded-3xl p-6 border border-emerald-200 relative">
              <button
                onClick={handleResetKasir}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-blue-50"
                title="Tutup / Transaksi Baru"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="font-bold text-sm text-emerald-600 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Transaksi Parkir Selesai (Lunas)</span>
              </h3>
              <StrukKeluarPrint
                transaksi={strukResult}
                onPrintDone={handleResetKasir}
              />
            </div>
          ) : tagihan ? (
            <div className="neu-card rounded-3xl p-6">
              <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-blue-500" />
                <span>Pilih Metode Pembayaran Kasir</span>
              </h3>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => setMetode("tunai")}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    metode === "tunai"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tunai (Cash)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMetode("qris");
                    if (!qrisData) handleRequestQris();
                  }}
                  className={`py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    metode === "qris"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QRIS Midtrans</span>
                </button>
              </div>

              {/* Tunai */}
              {metode === "tunai" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Jumlah Uang Diterima (Rp)
                    </label>
                    <input
                      type="number"
                      value={jumlahBayar}
                      onChange={(e) =>
                        setJumlahBayar(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-xl font-mono font-bold focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Uang Pas", val: Number(tagihan.biaya_total) },
                      { label: "10.000", val: 10000 },
                      { label: "20.000", val: 20000 },
                      { label: "50.000", val: 50000 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => setJumlahBayar(item.val)}
                        className="px-2 py-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-xs text-slate-700 font-mono font-semibold transition-colors"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">
                      Uang Kembalian:
                    </span>
                    <span className="text-xl font-black font-mono text-amber-600">
                      {formatRupiah(hitungKembalian())}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleBayarTunai}
                    disabled={
                      loadingBayar ||
                      Number(jumlahBayar) < Number(tagihan.biaya_total)
                    }
                    className="btn-3d-royal w-full py-3.5 rounded-xl font-bold text-sm"
                  >
                    {loadingBayar ? (
                      <span>Memproses Kasir...</span>
                    ) : (
                      <span>Konfirmasi Bayar Tunai & Buka Palang</span>
                    )}
                  </button>
                </div>
              )}

              {/* QRIS */}
              {metode === "qris" && (
                <div className="space-y-4 text-center">
                  {loadingQris ? (
                    <div className="py-12 text-xs font-mono text-slate-400">
                      Meminta QRIS ke Midtrans...
                    </div>
                  ) : qrisData ? (
                    <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center">
                      <div className="p-3 bg-white rounded-xl shadow-md mb-3 border border-slate-100">
                        <QRCodeSVG
                          value={
                            qrisData.qr_string ||
                            qrisData.qr_url ||
                            `QRIS-MIDTRANS-${tagihan.qr_token}`
                          }
                          size={180}
                          level="H"
                        />
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Scan QRIS untuk Membayar
                      </div>
                      <div className="text-lg font-black font-mono text-emerald-600 my-1">
                        {formatRupiah(tagihan.biaya_total)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Menunggu callback pembayaran Midtrans...</span>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200 w-full">
                        <button
                          type="button"
                          onClick={handleSimulasiQrisLunas}
                          className="w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Simulasi QRIS Lunas (Demo / Uprak)</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRequestQris}
                      className="btn-3d-royal px-6 py-3 rounded-xl font-bold text-xs"
                    >
                      Generate Dynamic QRIS
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="neu-card rounded-3xl p-8 text-center text-slate-400 font-mono text-xs">
              <Car className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <span>Belum ada tiket yang diperiksa.</span>
              <p className="text-[11px] text-slate-400 mt-1">
                Ketik QR token atau scan tiket di sebelah kiri untuk memulai pembayaran.
              </p>
            </div>
          )}
        </AnimatedCard>
      </div>
    </div>
  );
}
