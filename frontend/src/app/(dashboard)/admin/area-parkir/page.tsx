"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AreaParkir } from "@/types";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Power,
  RefreshCw,
  X,
  AlertTriangle,
} from "lucide-react";

export default function AreaParkirPage() {
  const [areas, setAreas] = useState<AreaParkir[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [namaArea, setNamaArea] = useState("");
  const [kapasitas, setKapasitas] = useState<number | "">("");

  // Hard Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [konfirmasiText, setKonfirmasiText] = useState("");

  const fetchAreas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/area-parkir");
      setAreas(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data area parkir");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  const handleOpenModal = (area?: AreaParkir) => {
    if (area) {
      setEditId(area.id_area);
      setNamaArea(area.nama_area);
      setKapasitas(area.kapasitas);
    } else {
      setEditId(null);
      setNamaArea("");
      setKapasitas("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaArea.trim() || !kapasitas || Number(kapasitas) <= 0) {
      toast.error("Nama area dan kapasitas wajib diisi dengan valid!");
      return;
    }

    try {
      if (editId) {
        await api.patch(`/area-parkir/${editId}`, {
          nama_area: namaArea.trim(),
          kapasitas: Number(kapasitas),
        });
        toast.success("Area parkir berhasil diperbarui!");
      } else {
        await api.post("/area-parkir", {
          nama_area: namaArea.trim(),
          kapasitas: Number(kapasitas),
        });
        toast.success("Area parkir baru berhasil ditambahkan!");
      }
      setModalOpen(false);
      fetchAreas();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan area parkir";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleToggleStatus = async (area: AreaParkir) => {
    try {
      await api.patch(`/area-parkir/${area.id_area}/status`, {
        status_aktif: !area.status_aktif,
      });
      toast.success(
        `Area ${area.nama_area} berhasil di-${
          area.status_aktif ? "nonaktifkan" : "aktifkan"
        }!`
      );
      fetchAreas();
    } catch (err: any) {
      toast.error("Gagal mengubah status area");
    }
  };

  const handleHardDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteId) return;
    if (konfirmasiText !== "HAPUS_PERMANEN") {
      toast.error("Ketik 'HAPUS_PERMANEN' untuk konfirmasi penghapusan!");
      return;
    }

    try {
      await api.delete(`/area-parkir/${deleteId}`, {
        data: { konfirmasi: "HAPUS_PERMANEN" },
      });
      toast.success("Area parkir telah dihapus permanen!");
      setDeleteModalOpen(false);
      setDeleteId(null);
      setKonfirmasiText("");
      fetchAreas();
    } catch (err: any) {
      const msg =
        err.response?.data?.message || "Gagal menghapus area parkir";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-blue-500 inline-block" />
            Master Area Parkir
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi kapasitas slot, pemantauan kendaraan terisi, dan status aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAreas}
            className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Area</span>
          </button>
        </div>
      </div>

      {/* Tabel Area */}
      <div className="neu-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200/80">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Nama Area</th>
                <th className="p-4">Kapasitas</th>
                <th className="p-4">Terisi</th>
                <th className="p-4">Sisa Slot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Memuat data area parkir...
                  </td>
                </tr>
              ) : areas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-mono">
                    Belum ada area parkir yang didaftarkan.
                  </td>
                </tr>
              ) : (
                areas.map((a) => {
                  const sisa = Math.max(0, a.kapasitas - a.terisi);
                  return (
                    <tr key={a.id_area} className="hover:bg-blue-50/40">
                      <td className="p-4 font-mono font-bold text-slate-400">
                        #{a.id_area}
                      </td>
                      <td className="p-4 font-bold text-slate-900 text-sm">
                        {a.nama_area}
                      </td>
                      <td className="p-4 font-mono font-semibold">
                        {a.kapasitas}
                      </td>
                      <td className="p-4 font-mono font-semibold text-amber-600">
                        {a.terisi}
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-600">
                        {sisa}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wider uppercase font-mono ${
                            a.status_aktif
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          {a.status_aktif ? "AKTIF" : "NONAKTIF"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(a)}
                            className={`p-1.5 rounded-lg border text-xs transition-colors ${
                              a.status_aktif
                                ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                                : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={a.status_aktif ? "Nonaktifkan" : "Aktifkan"}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(a)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit Area"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteId(a.id_area);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4">
              {editId ? "Edit Area Parkir" : "Tambah Area Parkir Baru"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Area Parkir
                </label>
                <input
                  type="text"
                  required
                  value={namaArea}
                  onChange={(e) => setNamaArea(e.target.value)}
                  placeholder="Contoh: Area Motor Barat"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kapasitas Slot Maksimal
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={kapasitas}
                  onChange={(e) =>
                    setKapasitas(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Contoh: 50"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-3d-royal px-5 py-2 rounded-xl text-xs font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hard Delete */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-md p-6 shadow-2xl relative bg-white border border-rose-200">
            <h3 className="text-base font-bold text-rose-600 flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Hapus Permanen Area Parkir</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Area yang memiliki transaksi aktif tidak bisa dihapus. Ketik{" "}
              <strong className="text-slate-900 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                HAPUS_PERMANEN
              </strong>{" "}
              untuk melanjutkan.
            </p>

            <form onSubmit={handleHardDelete} className="space-y-4">
              <input
                type="text"
                required
                value={konfirmasiText}
                onChange={(e) => setKonfirmasiText(e.target.value)}
                placeholder="Ketik HAPUS_PERMANEN"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-rose-400 uppercase"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={konfirmasiText !== "HAPUS_PERMANEN"}
                  className="bg-rose-600 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-rose-700 transition-colors"
                >
                  Hapus Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
