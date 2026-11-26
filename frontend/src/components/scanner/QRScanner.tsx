"use client";

import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onClose?: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "html5qr-code-region";

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode(containerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            if (html5QrCode.isScanning) {
              html5QrCode.stop().catch(() => {});
            }
          },
          () => {}
        );
      } catch (err: any) {
        setCameraError(
          err?.message || "Tidak dapat mengakses kamera. Pastikan izin kamera aktif."
        );
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="p-4 rounded-xl bg-slate-950 border-2 border-emerald-500/40 space-y-3 shadow-tactile">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-white">
          <Camera className="w-4 h-4 text-emerald-400" />
          <span>Scanner Kamera Aktif (html5-qrcode)</span>
        </div>
        {onClose && (
          <button
            onClick={() => {
              if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(() => {});
              }
              onClose();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-mono"
          >
            <CameraOff className="w-3.5 h-3.5" />
            <span>Tutup Kamera</span>
          </button>
        )}
      </div>

      <div
        id={containerId}
        className="overflow-hidden rounded-lg border border-slate-700 bg-slate-900 w-full max-w-sm mx-auto"
      />

      {cameraError && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      <p className="text-[11px] text-slate-400 text-center font-mono">
        Arahkan QR Code pada tiket masuk ke sorotan kamera untuk scan otomatis
      </p>
    </div>
  );
}
