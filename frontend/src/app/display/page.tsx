"use client";

import React, { useEffect, useState } from "react";
import { displayChannel, DisplayPayload } from "@/lib/broadcast";
import { QRCodeSVG } from "qrcode.react";
import { formatRupiah, formatDateTime, formatDuration } from "@/lib/utils";
import WordReveal from "@/components/motion/WordReveal";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  Clock,
  CheckCircle2,
  QrCode,
  Banknote,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Maximize2,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function CustomerDisplayPage() {
  const [payload, setPayload] = useState<DisplayPayload>({
    screen: "keluar",
    state: "standby",
  });

  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    // Jam digital real-time
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }, 1000);

    // Langganan pesan broadcast dari layar petugas
    const unsubscribe = displayChannel.subscribe((newPayload) => {
      setPayload(newPayload);

      // Jika lunas, reset otomatis ke standby setelah 8 detik
      if (newPayload.state === "lunas") {
        setTimeout(() => {
          setPayload({
            screen: newPayload.screen,
            state: "standby",
          });
        }, 8000);
      }
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  // Demo helper untuk pengujian langsung tanpa tab kedua
  const triggerDemo = (type: "scan" | "qris" | "lunas" | "masuk" | "reset") => {
    if (type === "scan") {
      setPayload({
        screen: "keluar",
        state: "scanned",
        plat_nomor: "B 1234 ABC",
        jenis: "Mobil",
        area: "Area Mobil Gedung B",
        kode_transaksi: "PKR-DEMO-9901",
        waktu_masuk: new Date(Date.now() - 7200000).toISOString(),
        waktu_keluar: new Date().toISOString(),
        durasi_jam: 2.0,
        biaya_total: 10000,
      });
    } else if (type === "qris") {
      setPayload({
        screen: "keluar",
        state: "payment",
        plat_nomor: "B 1234 ABC",
        jenis: "Mobil",
        durasi_jam: 2.0,
        biaya_total: 10000,
        metode: "qris",
        qris_code: "00020101021226600016ID.CO.MIDTRANS0108PARKIRB12345",
      });
    } else if (type === "lunas") {
      setPayload({
        screen: "keluar",
        state: "lunas",
        plat_nomor: "B 1234 ABC",
        biaya_total: 10000,
        metode: "qris",
        pesan: "Pembayaran Berhasil Dikonfirmasi Lunas!",
      });
      setTimeout(() => {
        setPayload({ screen: "keluar", state: "standby" });
      }, 7000);
    } else if (type === "masuk") {
      setPayload({
        screen: "masuk",
        state: "processing",
        plat_nomor: "B 9999 BOS",
        jenis: "Mobil",
        area: "Area Mobil Gedung B",
        kode_transaksi: "PKR-DEMO-IN-01",
        waktu_masuk: new Date().toISOString(),
      });
      setTimeout(() => {
        setPayload({ screen: "masuk", state: "standby" });
      }, 6000);
    } else {
      setPayload({ screen: "keluar", state: "standby" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-blue-600 relative overflow-hidden">
      {/* Background Lighting Grid Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Top Header Bar: Display Signage */}
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 border-b-4 border-blue-900 shadow-tactile flex items-center justify-center font-black text-2xl text-white">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                PARKIR<span className="text-blue-500">BOZZ</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Layar Informasi Transparan Pengendara
            </p>
          </div>
        </div>

        {/* Jam & Tanggal Digital Besar */}
        <div className="text-right font-mono">
          <div className="text-2xl sm:text-3xl font-black text-white tracking-widest leading-none">
            {currentTime || "12:00:00"}
          </div>
          <div className="text-xs text-slate-400 font-medium mt-1">
            {currentDate}
          </div>
        </div>
      </header>

      {/* MAIN SCREEN AREA (TRANSISI STATE REAL-TIME) */}
      <main className="relative z-10 my-auto py-6">
        <AnimatePresence mode="wait">
          {/* STATE 1: STANDBY GERBANG KELUAR */}
          {payload.state === "standby" && (
            <motion.div
              key="standby"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4 }}
              className="max-w-3xl mx-auto text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-slate-900 border-2 border-slate-800 shadow-tactile-lg text-blue-400 mb-2">
                <Car className="w-12 h-12 animate-pulse" />
              </div>

              <div>
                <WordReveal
                  text={
                    payload.screen === "masuk"
                      ? "SELAMAT DATANG DI PARKIR BOZZ"
                      : "POS KASIR PEMBAYARAN KELUAR"
                  }
                  className="justify-center text-3xl sm:text-5xl font-black text-white tracking-tight uppercase"
                  wordClassName="text-slate-100"
                />
                <p className="text-sm sm:text-lg text-slate-400 mt-3 font-medium">
                  {payload.screen === "masuk"
                    ? "Silakan maju ke depan gerbang untuk pengambilan tiket parkir"
                    : "Silakan serahkan tiket parkir fisik Anda kepada petugas kasir"}
                </p>
              </div>

              {/* Status Palang Pintu */}
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-tactile font-mono text-sm">
                <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                <span className="text-slate-300">STATUS GERBANG:</span>
                <span className="text-amber-400 font-bold uppercase">
                  STANDBY MENUNGGU KENDARAAN
                </span>
              </div>
            </motion.div>
          )}

          {/* STATE 2: GERBANG MASUK - TIKET SEDANG DICETAK */}
          {payload.state === "processing" && (
            <motion.div
              key="masuk-processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto card-tactile p-8 bg-slate-900/95 border-2 border-blue-500/50 shadow-2xl text-center space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KENDARAAN TERDAFTAR</span>
              </div>

              {/* Plat Nomor Fisik Berbingkai */}
              <div className="p-5 rounded-2xl bg-black border-4 border-slate-200 shadow-2xl inline-block px-10">
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-widest text-white">
                  {payload.plat_nomor || "B 1234 ABC"}
                </div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  INDONESIA • {payload.jenis || "KENDARAAN"}
                </div>
              </div>

              <div className="text-lg font-bold text-slate-200 font-mono">
                AREA TUJUAN: <span className="text-emerald-400">{payload.area || "Area Gedung"}</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-300 text-sm font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Tiket Sedang Dicetak. Silakan Ambil Tiket Anda & Palang Terbuka!</span>
              </div>
            </motion.div>
          )}

          {/* STATE 3: TAGIHAN DI KASIR KELUAR (SCANNED / HITUNG BIAYA) */}
          {(payload.state === "scanned" || (payload.state === "payment" && payload.metode === "tunai")) && (
            <motion.div
              key="tagihan-keluar"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto card-tactile p-6 sm:p-8 bg-slate-900/95 border-2 border-slate-800 shadow-2xl space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Rincian Tagihan Parkir Anda
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-slate-800 px-3 py-1 rounded-lg">
                  {payload.kode_transaksi || "TRANSAKSI AKTIF"}
                </span>
              </div>

              {/* Plat Nomor & Total Tagihan Jumbo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="p-5 rounded-2xl bg-black border-2 border-slate-700 text-center">
                  <div className="text-[11px] font-mono text-slate-400 uppercase">
                    Nomor Polisi
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-white mt-1">
                    {payload.plat_nomor || "-"}
                  </div>
                  <div className="text-xs text-blue-400 font-semibold mt-1">
                    {payload.jenis || "KENDARAAN"} • {payload.area || "Area Parkir"}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-950/30 border-2 border-emerald-500/50 text-center">
                  <div className="text-[11px] font-mono text-emerald-400 uppercase font-bold">
                    Total Biaya Parkir
                  </div>
                  <div className="text-3xl sm:text-5xl font-black font-mono text-emerald-400 mt-1">
                    {formatRupiah(payload.biaya_total || 0)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-1">
                    Durasi: {formatDuration(payload.durasi_jam)}
                  </div>
                </div>
              </div>

              {/* Rincian Durasi Jam Masuk & Keluar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WAKTU MASUK</span>
                  <span className="text-slate-200 font-semibold">
                    {formatDateTime(payload.waktu_masuk)}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">WAKTU KELUAR</span>
                  <span className="text-slate-200 font-semibold">
                    {formatDateTime(payload.waktu_keluar || new Date().toISOString())}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px]">METODE</span>
                  <span className="text-amber-400 font-bold uppercase">
                    {payload.metode ? payload.metode.toUpperCase() : "MENUNGGU PILIHAN KASIR"}
                  </span>
                </div>
              </div>

              {/* Rincian Tunai Jika Ada */}
              {payload.metode === "tunai" && payload.jumlah_bayar !== undefined && (
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center font-mono">
                  <div>
                    <span className="text-xs text-slate-400 block">Uang Diterima:</span>
                    <span className="text-base font-bold text-white">
                      {formatRupiah(payload.jumlah_bayar)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Uang Kembalian:</span>
                    <span className="text-xl font-black text-amber-400">
                      {formatRupiah(payload.kembalian || 0)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* STATE 4: PEMBAYARAN QRIS NON-TUNAI DI LAYAR PENGENDARA */}
          {payload.state === "payment" && payload.metode === "qris" && (
            <motion.div
              key="qris-display"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md mx-auto card-tactile p-8 bg-slate-900 border-2 border-emerald-500/60 shadow-2xl text-center space-y-4"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                <QrCode className="w-4 h-4" />
                <span>SCAN QRIS UNTUK MEMBAYAR</span>
              </div>

              <div className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-slate-300">
                <QRCodeSVG
                  value={
                    payload.qris_code ||
                    `QRIS-PARKIRBOZZ-${payload.kode_transaksi || "123"}`
                  }
                  size={240}
                  level="H"
                />
              </div>

              <div>
                <div className="text-xs text-slate-400 font-mono">Total Tagihan Parkir:</div>
                <div className="text-3xl font-black font-mono text-emerald-400 mt-0.5">
                  {formatRupiah(payload.biaya_total || 0)}
                </div>
                <div className="text-xs text-slate-300 font-semibold mt-1">
                  Plat: {payload.plat_nomor || "-"} • Durasi: {formatDuration(payload.durasi_jam)}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>Buka aplikasi m-Banking / E-Wallet dan scan QR di atas</span>
              </div>
            </motion.div>
          )}

          {/* STATE 5: PEMBAYARAN LUNAS (SELESAI & PALANG DIBUKA) */}
          {payload.state === "lunas" && (
            <motion.div
              key="lunas-screen"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-3xl mx-auto card-tactile p-10 bg-emerald-950/40 border-4 border-emerald-500 text-center space-y-6 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="w-24 h-24 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto shadow-tactile-lg"
              >
                <CheckCircle2 className="w-14 h-14" />
              </motion.div>

              <div>
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-emerald-400 uppercase">
                  PEMBAYARAN LUNAS
                </h1>
                <p className="text-lg sm:text-2xl font-bold text-white mt-2">
                  Terima Kasih Atas Kunjungan Anda!
                </p>
                <p className="text-sm text-emerald-200/80 font-mono mt-1">
                  Palang Pintu Terbuka. Hati-hati di jalan dan semoga selamat sampai tujuan.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/40 font-mono text-sm text-slate-300">
                <span>Plat: <strong className="text-white">{payload.plat_nomor || "-"}</strong></span>
                <span>•</span>
                <span>Total: <strong className="text-emerald-400">{formatRupiah(payload.biaya_total || 0)}</strong></span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
