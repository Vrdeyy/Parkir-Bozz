"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Kendaraan, JenisKendaraan } from "@/types";
import { toast } from "sonner";
import { Car, Search, RefreshCw, Trash2, Edit2, Plus, X } from "lucide-react";

export default function MasterKendaraanPage() {
  const [kendaraanList, setKendaraanList] = useState<Kendaraan[]>([]);
  const [jenisList, setJenisList] = useState<JenisKendaraan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [platNomor, setPlatNomor] = useState("");
  const [idJenis, setIdJenis] = useState<number | "">("");
  const [warna, setWarna] = useState("");
  const [pemilik, setPemilik] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resKendaraan, resJenis] = await Promise.all([
        api.get("/kendaraan"),
        api.get("/jenis-kendaraan"),
      ]);
      setKendaraanList(resKendaraan.data?.data || resKendaraan.data || []);
      const jenisData = resJenis.data?.data || resJenis.data || [];
      setJenisList(jenisData);
      if (jenisData.length > 0 && !idJenis) {
        setIdJenis(jenisData[0].id_jenis);
      }
    } catch (err: any) {
      toast.error("Gagal mengambil data kendaraan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (k?: Kendaraan) => {
    if (k) {
      setEditId(k.id_kendaraan);
      setPlatNomor(k.plat_nomor);
      setIdJenis(k.id_jenis);
      setWarna(k.warna || "");
      setPemilik(k.pemilik || "");
    } else {
      setEditId(null);
      setPlatNomor("");
      setIdJenis(jenisList[0]?.id_jenis || "");
      setWarna("");
      setPemilik("");
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platNomor.trim() || !idJenis) {
      toast.error("Plat nomor dan jenis kendaraan wajib diisi!");
      return;
    }

    const payload: any = {
      plat_nomor: platNomor.trim().toUpperCase(),
      id_jenis: Number(idJenis),
    };
    if (warna.trim()) payload.warna = warna.trim();
    if (pemilik.trim()) payload.pemilik = pemilik.trim();

    try {
      if (editId) {
        await api.patch(`/kendaraan/${editId}`, payload);
        toast.success("Data kendaraan berhasil diperbarui!");
      } else {
        await api.post("/kendaraan", payload);
        toast.success("Kendaraan baru berhasil ditambahkan!");
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan kendaraan";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus data kendaraan ini?")) return;
    try {
      await api.delete(`/kendaraan/${id}`);
      toast.success("Kendaraan berhasil dihapus!");
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus kendaraan";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const filtered = kendaraanList.filter(
    (k) =>
      k.plat_nomor.toLowerCase().includes(search.toLowerCase()) ||
      (k.pemilik && k.pemilik.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-purple-500 inline-block" />
            Master Kendaraan Terdaftar
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Daftar seluruh kendaraan yang pernah terdaftar dalam transaksi parkir
          </p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <button
            onClick={fetchData}
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
            <span>Tambah Kendaraan</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="neu-card rounded-3xl p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari Plat Nomor atau Nama Pemilik..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-mono focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Tabel Kendaraan */}
      <div className="neu-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Plat Nomor</th>
                <th className="p-4">Jenis</th>
                <th className="p-4">Warna</th>
                <th className="p-4">Pemilik</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Memuat data kendaraan...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Tidak ada kendaraan ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((k) => (
                  <tr key={k.id_kendaraan} className="hover:bg-blue-50/40">
                    <td className="p-4 font-mono text-slate-400">
                      #{k.id_kendaraan}
                    </td>
                    <td className="p-4 font-black font-mono text-sm tracking-wider text-slate-900">
                      {k.plat_nomor}
                    </td>
                    <td className="p-4 font-semibold text-slate-600 capitalize">
                      {k.jenis?.nama_jenis || `Jenis #${k.id_jenis}`}
                    </td>
                    <td className="p-4 text-slate-500">
                      {k.warna || "-"}
                    </td>
                    <td className="p-4 text-slate-600">
                      {k.pemilik || "-"}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenModal(k)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit Kendaraan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(k.id_kendaraan)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Hapus Kendaraan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah/Edit Kendaraan */}
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
              {editId ? "Edit Data Kendaraan" : "Tambah Kendaraan Baru"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Plat Nomor
                </label>
                <input
                  type="text"
                  required
                  value={platNomor}
                  onChange={(e) => setPlatNomor(e.target.value.toUpperCase())}
                  placeholder="Contoh: B 1234 XYZ"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono uppercase focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Jenis Kendaraan
                </label>
                <select
                  value={idJenis}
                  onChange={(e) => setIdJenis(Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
                >
                  {jenisList.map((j) => (
                    <option key={j.id_jenis} value={j.id_jenis}>
                      {j.nama_jenis}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Warna (Opsional)
                </label>
                <input
                  type="text"
                  value={warna}
                  onChange={(e) => setWarna(e.target.value)}
                  placeholder="Contoh: Hitam"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Pemilik (Opsional)
                </label>
                <input
                  type="text"
                  value={pemilik}
                  onChange={(e) => setPemilik(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
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
                  Simpan Kendaraan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
