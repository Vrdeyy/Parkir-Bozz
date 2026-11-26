/**
 * Real-time Broadcast Channel untuk sinkronisasi seketika antara
 * Layar Kasir Petugas dan Layar Hadap Pengendara (Customer Display)
 * bekerja secara peer-to-peer antar tab / monitor tanpa delay.
 */

export type DisplayScreen = "masuk" | "keluar";

export type DisplayState = "standby" | "processing" | "scanned" | "payment" | "lunas";

export interface DisplayPayload {
  screen: DisplayScreen;
  state: DisplayState;
  plat_nomor?: string;
  jenis?: string;
  area?: string;
  kode_transaksi?: string;
  waktu_masuk?: string;
  waktu_keluar?: string;
  durasi_jam?: number | string;
  biaya_total?: number;
  metode?: "tunai" | "qris";
  jumlah_bayar?: number;
  kembalian?: number;
  qris_code?: string;
  pesan?: string;
}

const CHANNEL_NAME = "parkir_bozz_customer_display_v1";

class DisplayChannel {
  private channel: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
    }
  }

  emit(payload: DisplayPayload) {
    if (this.channel) {
      this.channel.postMessage(payload);
    }
    // Backup di localStorage untuk tab yang dibuka belakangan
    if (typeof window !== "undefined") {
      localStorage.setItem("latest_customer_display_payload", JSON.stringify(payload));
    }
  }

  subscribe(callback: (payload: DisplayPayload) => void): () => void {
    if (!this.channel) {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
      }
    }

    const handler = (event: MessageEvent<DisplayPayload>) => {
      if (event.data) {
        callback(event.data);
      }
    };

    if (this.channel) {
      this.channel.addEventListener("message", handler);
    }

    // Check saved state initially
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("latest_customer_display_payload");
      if (saved) {
        try {
          callback(JSON.parse(saved));
        } catch {}
      }
    }

    return () => {
      if (this.channel) {
        this.channel.removeEventListener("message", handler);
      }
    };
  }
}

export const displayChannel = new DisplayChannel();
