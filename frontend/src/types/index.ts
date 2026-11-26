export type Role = 'admin' | 'petugas' | 'owner';

export type StatusTransaksi = 'masuk' | 'keluar';

export type MetodePembayaran = 'tunai' | 'non_tunai';

export type StatusPembayaran = 'belum_bayar' | 'menunggu' | 'lunas' | 'gagal' | 'kedaluwarsa';

export interface User {
  id_user: number;
  nama_lengkap: string;
  username: string;
  role: Role;
  status_aktif: boolean;
}

export interface JenisKendaraan {
  id_jenis: number;
  nama_jenis: string;
  tarif?: Tarif;
}

export interface Tarif {
  id_tarif: number;
  tarif_per_jam: number | string;
  id_jenis: number;
  updated_at?: string;
  jenis?: JenisKendaraan;
}

export interface AreaParkir {
  id_area: number;
  nama_area: string;
  kapasitas: number;
  terisi: number;
  status_aktif: boolean;
  updated_at?: string;
}

export interface Kendaraan {
  id_kendaraan: number;
  plat_nomor: string;
  warna?: string | null;
  pemilik?: string | null;
  id_jenis: number;
  id_user?: number | null;
  jenis?: JenisKendaraan;
}

export interface Transaksi {
  id_transaksi: number;
  kode_transaksi: string;
  id_kendaraan: number;
  waktu_masuk: string;
  waktu_keluar?: string | null;
  id_tarif: number;
  durasi_jam: number | string;
  biaya_total: number | string;
  status: StatusTransaksi;
  id_area: number;
  jumlah_bayar?: number | string | null;
  kembalian?: number | string | null;
  metode_pembayaran?: MetodePembayaran | null;
  status_pembayaran: StatusPembayaran;
  tarif_per_jam_snapshot: number | string;
  qr_token: string;
  referensi_pembayaran?: string | null;
  waktu_bayar?: string | null;
  kendaraan?: Kendaraan;
  area?: AreaParkir;
  tarif?: Tarif;
  user_masuk?: User;
  user_keluar?: User;
}

export interface DashboardSummary {
  omzet_hari_ini: number;
  omzet_minggu_ini: number;
  omzet_bulan_ini: number;
  total_transaksi_hari_ini: number;
  kendaraan_aktif: number;
  transaksi_keluar_hari_ini: number;
  area_parkir: {
    id_area: number;
    nama_area: string;
    kapasitas: number;
    terisi: number;
    persentase_okupansi: number;
  }[];
}

export interface LogAktivitas {
  id_log: number;
  id_user: number;
  aktivitas: string;
  waktu_aktivitas: string;
  user?: {
    id_user: number;
    nama_lengkap: string;
    username: string;
    role: Role;
  };
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
