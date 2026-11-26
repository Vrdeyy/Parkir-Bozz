"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { JenisKendaraan, Tarif } from "@/types";
import { formatRupiah } from "@/lib/utils";
import { toast } from "sonner";
import { Tag, Plus, Edit2, Trash2, RefreshCw, X } from "lucide-react";

export default function TarifDanJenisPage() {
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [tarifList, setTarifList] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Jenis
  const [modalJenis, setModalJenis] = useState(false);
  const [namaJenis, setNamaJenis] = useState("");
  const [editJenisId, setEditJenisId] = useState<number | null>(null);

  // Modal Tarif
  const [modalTarif, setModalTarif] = useState(false);
  const [idJenisTarif, setIdJenisTarif] = useState<number | "">("");
  const [nominalTarif, setNominalTarif] = useState<number | "">("");
  const [editTarifId, setEditTarifId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resJenis, resTarif] = await Promise.all([
        api.get("/jenis-kendaraan"),
        api.get("/tarif"),
      ]);
      setJenisList(resJenis.data?.data || resJenis.data || []);
      setTarifList(resTarif.data?.data || resTarif.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data tarif & jenis kendaraan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveJenis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaJenis.trim()) return;

    try {
      if (editJenisId) {
        await api.patch(`/jenis-kendaraan/${editJenisId}`, {
          nama_jenis: namaJenis.trim(),
        });
        toast.success("Jenis kendaraan berhasil diperbarui!");
      } else {
        await api.post("/jenis-kendaraan", {
          nama_jenis: namaJenis.trim(),
        });
        toast.success("Jenis kendaraan baru berhasil ditambahkan!");
      }
      setModalJenis(false);
      setNamaJenis("");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan jenis kendaraan";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleSaveTarif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominalTarif || Number(nominalTarif) <= 0) return;

    try {
      if (editTarifId) {
        await api.patch(`/tarif/${editTarifId}`, {
          tarif_per_jam: Number(nominalTarif),
        });
        toast.success("Tarif berhasil diperbarui!");
      } else {
        if (!idJenisTarif) {
          toast.error("Pilih jenis kendaraan untuk tarif!");
          return;
        }
        await api.post("/tarif", {
          id_jenis: Number(idJenisTarif),
          tarif_per_jam: Number(nominalTarif),
        });
        toast.success("Tarif parkir berhasil ditambahkan!");
      }
      setModalTarif(false);
      setNominalTarif("");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan tarif parkir";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleDeleteJenis = async (id: number) => {
    if (!confirm("Hapus jenis kendaraan ini?")) return;
    try {
      await api.delete(`/jenis-kendaraan/${id}`);
      toast.success("Jenis kendaraan berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus jenis";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleDeleteTarif = async (id: number) => {
    if (!confirm("Hapus tarif parkir ini?")) return;
    try {
      await api.delete(`/tarif/${id}`);
      toast.success("Tarif parkir berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus tarif";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-emerald-500 inline-block" />
            Master Tarif & Jenis Kendaraan
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Setting kategori kendaraan dan tarif parkir per jam
          </p>
        </div>
        <button
          onClick={fetchData}
          className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 self-start border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Tabel Tarif Parkir */}
        <div className="lg:col-span-7 space-y-4">
          <div className="neu-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                <span>Daftar Tarif Parkir per Jam</span>
              </h3>
              <button
                onClick={() => {
                  setEditTarifId(null);
                  setIdJenisTarif("");
                  setNominalTarif("");
                  setModalTarif(true);
                }}
                className="btn-3d-royal px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tarif</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Jenis Kendaraan</th>
                    <th className="p-3">Tarif / Jam</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tarifList.map((t) => (
                    <tr key={t.id_tarif} className="hover:bg-blue-50/40">
                      <td className="p-3 font-mono text-slate-400">#{t.id_tarif}</td>
                      <td className="p-3 font-bold text-slate-900 text-sm">
                        {t.jenis?.nama_jenis || `Jenis #${t.id_jenis}`}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-600 text-sm">
                        {formatRupiah(t.tarif_per_jam)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditTarifId(t.id_tarif);
                              setNominalTarif(Number(t.tarif_per_jam));
                              setModalTarif(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit Tarif"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTarif(t.id_tarif)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus Tarif"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Tabel Jenis Kendaraan */}
        <div className="lg:col-span-5 space-y-4">
          <div className="neu-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900">
                Kategori Jenis Kendaraan
              </h3>
              <button
                onClick={() => {
                  setEditJenisId(null);
                  setNamaJenis("");
                  setModalJenis(true);
                }}
                className="btn-3d-royal px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Jenis</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nama Jenis</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jenisList.map((j) => (
                    <tr key={j.id_jenis} className="hover:bg-blue-50/40">
                      <td className="p-3 font-mono text-slate-400">#{j.id_jenis}</td>
                      <td className="p-3 font-bold text-slate-900 capitalize text-sm">
                        {j.nama_jenis}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditJenisId(j.id_jenis);
                              setNamaJenis(j.nama_jenis);
                              setModalJenis(true);
                            }}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            title="Edit Jenis"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJenis(j.id_jenis)}
                            className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                            title="Hapus Jenis"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah/Edit Jenis */}
      {modalJenis && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-sm p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setModalJenis(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {editJenisId ? "Edit Jenis Kendaraan" : "Tambah Jenis Kendaraan"}
            </h3>
            <form onSubmit={handleSaveJenis} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Jenis
                </label>
                <input
                  type="text"
                  required
                  value={namaJenis}
                  onChange={(e) => setNamaJenis(e.target.value)}
                  placeholder="Contoh: Motor / Mobil / Truk"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalJenis(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah/Edit Tarif */}
      {modalTarif && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="neu-card rounded-3xl w-full max-w-sm p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setModalTarif(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-slate-900 mb-4">
              {editTarifId ? "Edit Tarif Parkir" : "Tambah Tarif Parkir"}
            </h3>
            <form onSubmit={handleSaveTarif} className="space-y-4">
              {!editTarifId && (
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Pilih Jenis Kendaraan
                  </label>
                  <select
                    required
                    value={idJenisTarif}
                    onChange={(e) => setIdJenisTarif(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="">-- Pilih Jenis --</option>
                    {jenisList.map((j) => (
                      <option key={j.id_jenis} value={j.id_jenis}>
                        {j.nama_jenis}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tarif Parkir Per Jam (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={500}
                  step={500}
                  value={nominalTarif}
                  onChange={(e) =>
                    setNominalTarif(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  placeholder="Contoh: 3000"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalTarif(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Simpan Tarif
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
