"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { User, Role } from "@/types";
import { toast } from "sonner";
import {
  Users,
  UserPlus,
  Power,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  Shield,
} from "lucide-react";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [namaLengkap, setNamaLengkap] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("petugas");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data?.data || res.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditId(user.id_user);
      setNamaLengkap(user.nama_lengkap);
      setUsername(user.username);
      setPassword("");
      setRole(user.role);
    } else {
      setEditId(null);
      setNamaLengkap("");
      setUsername("");
      setPassword("");
      setRole("petugas");
    }
    setModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaLengkap.trim() || !username.trim()) {
      toast.error("Nama lengkap dan username wajib diisi!");
      return;
    }
    if (!editId && !password) {
      toast.error("Password wajib diisi untuk user baru!");
      return;
    }

    try {
      if (editId) {
        const payload: any = {
          nama_lengkap: namaLengkap.trim(),
          role,
        };
        if (password) payload.password = password;
        await api.patch(`/users/${editId}`, payload);
        toast.success("Data user berhasil diperbarui!");
      } else {
        await api.post("/users", {
          nama_lengkap: namaLengkap.trim(),
          username: username.trim(),
          password,
          role,
          status_aktif: true,
        });
        toast.success("User baru berhasil dibuat!");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menyimpan user";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.patch(`/users/${user.id_user}/status`, {
        status_aktif: !user.status_aktif,
      });
      toast.success(
        `User ${user.nama_lengkap} berhasil di-${
          user.status_aktif ? "nonaktifkan" : "aktifkan"
        }!`
      );
      fetchUsers();
    } catch (err: any) {
      toast.error("Gagal mengubah status user");
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm("Hapus user ini secara permanen?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User berhasil dihapus permanen!");
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Gagal menghapus user";
      toast.error(Array.isArray(msg) ? msg.join(", ") : msg);
    }
  };

  const getRoleBadge = (r: string) => {
    switch (r) {
      case "admin":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "owner":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-6 rounded bg-amber-500 inline-block" />
            Manajemen Pengguna & Hak Akses
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Kelola akun petugas kasir, administrator, dan pemilik sistem
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-blue-50 text-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="btn-3d-royal px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah User</span>
          </button>
        </div>
      </div>

      {/* Tabel Users */}
      <div className="neu-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-mono uppercase border-b border-slate-200/80">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Username</th>
                <th className="p-4">Role Akses</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Memuat daftar pengguna...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-mono">
                    Belum ada pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id_user} className="hover:bg-blue-50/40">
                    <td className="p-4 font-mono font-bold text-slate-400">
                      #{u.id_user}
                    </td>
                    <td className="p-4 font-bold text-slate-900 text-sm">
                      {u.nama_lengkap}
                    </td>
                    <td className="p-4 font-mono text-slate-500">
                      @{u.username}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono tracking-wider uppercase ${getRoleBadge(u.role)}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono ${
                          u.status_aktif
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : "bg-slate-100 text-slate-500 border border-slate-200"
                        }`}
                      >
                        {u.status_aktif ? "AKTIF" : "NONAKTIF"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            u.status_aktif
                              ? "border-amber-200 text-amber-600 hover:bg-amber-50"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={u.status_aktif ? "Nonaktifkan" : "Aktifkan"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id_user)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors"
                          title="Hapus Permanen"
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

      {/* Modal Tambah/Edit User */}
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
              {editId ? "Edit Profil Pengguna" : "Tambah Pengguna Baru"}
            </h3>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Rian Gunawan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editId}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: petugas03"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-400 disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password {editId ? "(Kosongkan jika tidak diubah)" : ""}
                </label>
                <input
                  type="password"
                  required={!editId}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Role Akses
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:outline-none focus:border-blue-400"
                >
                  <option value="petugas">Petugas (Operasional Gate & Kasir)</option>
                  <option value="owner">Owner (Pemilik - Pantau Omzet & Laporan)</option>
                  <option value="admin">Administrator (Akses Penuh Master Data)</option>
                </select>
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
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
