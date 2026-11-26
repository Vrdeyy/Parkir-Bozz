"use client";

import React from "react";
import { Transaksi } from "@/types";
import { formatDateTime, formatRupiah, formatDuration } from "@/lib/utils";
import { Printer, CheckCircle } from "lucide-react";

interface StrukKeluarPrintProps {
  transaksi: Transaksi;
  onPrintDone?: () => void;
}

export default function StrukKeluarPrint({
  transaksi,
  onPrintDone,
}: StrukKeluarPrintProps) {
  const handlePrint = () => {
    window.print();
    if (onPrintDone) onPrintDone();
  };

  return (
    <div>
      <button
        onClick={handlePrint}
        className="btn-3d btn-3d-emerald w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-tactile mb-4"
      >
        <Printer className="w-4 h-4" />
        <span>Cetak Struk Pembayaran (Print)</span>
      </button>

      <div
        id="thermal-print-area"
        className="mx-auto w-[300px] bg-white text-slate-950 p-5 rounded-lg shadow-2xl border border-slate-300 font-mono text-xs leading-relaxed"
      >
        <div className="text-center pb-3 border-b-2 border-dashed border-slate-900">
          <h2 className="font-black text-base tracking-widest uppercase">
            PARKIR-BOZZ
          </h2>
          <p className="text-[10px] text-slate-600">STRUK RESMI PEMBAYARAN PARKIR</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            --------------------------------
          </p>
          <div className="mt-1 font-bold text-xs bg-emerald-100 text-emerald-800 py-0.5 rounded flex items-center justify-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>LUNAS / BERHASIL</span>
          </div>
        </div>

        <div className="my-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-600">Kode:</span>
            <span className="font-bold">{transaksi.kode_transaksi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">No. Polisi:</span>
            <span className="font-black text-sm">{transaksi.kendaraan?.plat_nomor}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Jenis:</span>
            <span className="font-semibold uppercase">
              {transaksi.kendaraan?.jenis?.nama_jenis || "KENDARAAN"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Area:</span>
            <span>{transaksi.area?.nama_area}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Masuk:</span>
            <span className="text-right">{formatDateTime(transaksi.waktu_masuk)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Keluar:</span>
            <span className="text-right">{formatDateTime(transaksi.waktu_keluar)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Durasi:</span>
            <span className="font-semibold">{formatDuration(transaksi.durasi_jam)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Tarif/Jam:</span>
            <span>{formatRupiah(transaksi.tarif_per_jam_snapshot)}</span>
          </div>
        </div>

        <div className="py-2.5 border-t-2 border-b-2 border-dashed border-slate-900 space-y-1 text-xs">
          <div className="flex justify-between font-black text-sm">
            <span>TOTAL BIAYA:</span>
            <span>{formatRupiah(transaksi.biaya_total)}</span>
          </div>
          <div className="flex justify-between text-slate-700">
            <span>Metode Bayar:</span>
            <span className="font-bold uppercase">
              {transaksi.metode_pembayaran === "tunai" ? "TUNAI (CASH)" : "QRIS (NON-TUNAI)"}
            </span>
          </div>
          {transaksi.metode_pembayaran === "tunai" ? (
            <>
              <div className="flex justify-between text-slate-700">
                <span>Diterima:</span>
                <span>{formatRupiah(transaksi.jumlah_bayar)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900">
                <span>Kembalian:</span>
                <span>{formatRupiah(transaksi.kembalian)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-slate-700 text-[10px]">
              <span>Ref ID:</span>
              <span className="font-mono">{transaksi.referensi_pembayaran || "-"}</span>
            </div>
          )}
        </div>

        <div className="text-center pt-3 text-[10px] text-slate-600 space-y-0.5">
          <p>Petugas Kasir: {transaksi.user_keluar?.nama_lengkap || "Kasir 01"}</p>
          <p className="font-semibold text-slate-800 pt-1">
            SEMOGA PERJALANAN ANDA MENYENANGKAN
          </p>
          <p className="text-[9px] text-slate-400">Parkir-Bozz Automated Parking System</p>
        </div>
      </div>
    </div>
  );
}
