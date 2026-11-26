"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Transaksi } from "@/types";
import { formatDateTime } from "@/lib/utils";
import { Printer } from "lucide-react";

interface TiketMasukPrintProps {
  transaksi: Transaksi;
  onPrintDone?: () => void;
}

export default function TiketMasukPrint({
  transaksi,
  onPrintDone,
}: TiketMasukPrintProps) {
  const handlePrint = () => {
    window.print();
    if (onPrintDone) onPrintDone();
  };

  // Sesuai dokumen alur logic: Front-End mengolah kode_transaksi menjadi bentuk QR Code
  const qrValue = transaksi.kode_transaksi || transaksi.qr_token;

  return (
    <div>
      {/* Tombol Cetak Layar */}
      <button
        onClick={handlePrint}
        className="btn-3d btn-3d-blue w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm shadow-tactile mb-4"
      >
        <Printer className="w-4 h-4" />
        <span>Cetak Ulang Tiket (Print)</span>
      </button>

      {/* Visualisasi Tiket Fisik & Area Thermal Print */}
      <div
        id="thermal-print-area"
        className="mx-auto w-[300px] bg-white text-slate-950 p-5 rounded-lg shadow-2xl border border-slate-300 font-mono text-xs leading-relaxed"
      >
        <div className="text-center pb-3 border-b-2 border-dashed border-slate-900">
          <h2 className="font-black text-base tracking-widest uppercase">
            PARKIR-BOZZ
          </h2>
          <p className="text-[10px] text-slate-600">
            Sistem Parkir Otomatis & Terintegrasi
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            --------------------------------
          </p>
          <div className="mt-1 font-bold text-sm bg-slate-100 py-1 rounded">
            TIKET PARKIR MASUK
          </div>
        </div>

        <div className="my-3 space-y-1.5 text-[11px]">
          <div className="flex justify-between">
            <span className="text-slate-600">No. Tiket:</span>
            <span className="font-bold">{transaksi.kode_transaksi}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">No. Polisi:</span>
            <span className="font-black text-sm bg-slate-950 text-white px-2 py-0.5 rounded">
              {transaksi.kendaraan?.plat_nomor || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Jenis:</span>
            <span className="font-semibold uppercase">
              {transaksi.kendaraan?.jenis?.nama_jenis || "KENDARAAN"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Area:</span>
            <span className="font-semibold">
              {transaksi.area?.nama_area || "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Waktu Masuk:</span>
            <span className="font-semibold text-right">
              {formatDateTime(transaksi.waktu_masuk)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Petugas Gate:</span>
            <span className="font-semibold">
              {transaksi.user_masuk?.nama_lengkap || "Petugas 01"}
            </span>
          </div>
        </div>

        {/* QR Code Section (mengolah kode_transaksi) */}
        <div className="py-4 border-t-2 border-b-2 border-dashed border-slate-900 flex flex-col items-center justify-center bg-slate-50 rounded">
          <QRCodeSVG
            value={qrValue}
            size={140}
            level="H"
            includeMargin={false}
          />
          <span className="mt-2 text-[10px] font-bold text-slate-800 tracking-wider font-mono">
            {transaksi.kode_transaksi}
          </span>
        </div>

        <div className="text-center pt-3 space-y-1 text-[10px] text-slate-600">
          <p className="font-bold text-slate-800">
            SIMPAN TIKET INI DENGAN BAIK
          </p>
          <p>Scan QR code ini pada kamera petugas di pintu keluar.</p>
          <p className="text-[9px] text-slate-400">
            Kehilangan tiket dikenakan denda sesuai peraturan.
          </p>
          <p className="font-bold pt-1">Terima Kasih Atas Kunjungan Anda</p>
        </div>
      </div>
    </div>
  );
}
