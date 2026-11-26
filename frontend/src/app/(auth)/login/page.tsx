"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  KeyRound,
  User as UserIcon,
  ShieldAlert,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [enteringUser, setEnteringUser] = useState<{
    nama_lengkap: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("parkir_bozz_remember_username");
    if (saved) {
      setUsername(saved);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast.error("Username dan password wajib diisi");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/auth/login", { username, password });
      const { access_token, user } = res.data;

      if (rememberMe) {
        localStorage.setItem("parkir_bozz_remember_username", username);
      } else {
        localStorage.removeItem("parkir_bozz_remember_username");
      }

      setAuthSession(access_token, user);
      toast.success(`Selamat datang, ${user.nama_lengkap}!`);
      setEnteringUser({
        nama_lengkap: user.nama_lengkap,
        role: user.role,
      });

      const targetPath =
        user.role === "petugas"
          ? "/petugas/masuk"
          : user.role === "owner"
            ? "/owner"
            : "/admin";

      setTimeout(() => {
        router.push(targetPath);
      }, 1450);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Gagal login. Periksa username dan password, serta pastikan backend menyala.";
      setErrorMsg(Array.isArray(message) ? message.join(", ") : message);
      toast.error("Login gagal!");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-ice relative overflow-hidden flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Dekorasi 3D Floating Spheres & Rings (ala Soft-3D Neumorphism) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-white/95 via-blue-100/80 to-blue-400/50 border border-white/80 shadow-[20px_25px_50px_rgba(59,102,245,0.22)]"
        />
        <motion.div
          animate={{ y: [0, 16, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-14 w-36 h-36 rounded-full bg-gradient-to-br from-white via-blue-100 to-blue-400/70 border border-white/90 shadow-[12px_18px_36px_rgba(59,102,245,0.25)]"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-28 -left-16 w-64 h-64 rounded-full bg-gradient-to-tr from-blue-300/50 via-blue-100/70 to-white/95 border border-white/80 shadow-[15px_-10px_40px_rgba(59,102,245,0.18)]"
        />
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-32 -right-24 w-80 h-80 rounded-full bg-gradient-to-tl from-blue-200/60 via-slate-100/80 to-white/95 border border-white/90 shadow-[-15px_-15px_45px_rgba(148,163,184,0.25)]"
        />
      </div>

      {/* Login Card Utama */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="relative z-10 w-full max-w-[400px]"
      >
        {/* 3D Squircle Parking Emblem */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-[28px] neu-card flex items-center justify-center p-3">
            <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 shadow-[0_10px_22px_rgba(37,99,235,0.45),inset_0_2px_4px_rgba(255,255,255,0.5)] flex items-center justify-center relative overflow-hidden">
              {/* Gloss highlight */}
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-white/25 blur-sm" />
              <span className="text-4xl font-black text-white tracking-tighter drop-shadow">
                P
              </span>
              {/* Mini barrier stripe accent */}
              <span className="absolute bottom-2 right-2 w-4 h-1.5 rounded-full bg-amber-300 shadow" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">
            Selamat Datang
          </h1>
          <p className="text-xs font-medium tracking-wider uppercase text-slate-500 mt-1.5">
            Masuk ke Sistem <span className="text-blue-600 font-bold">PARKIRBOZZ</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2 shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {/* Username Pill Input */}
          <div className="neu-inset rounded-full px-4 py-1 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/40">
            <UserIcon className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full py-3 bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none"
              disabled={loading}
            />
          </div>

          {/* Password Pill Input */}
          <div className="neu-inset rounded-full px-4 py-1 flex items-center gap-3 transition-all focus-within:ring-2 focus-within:ring-blue-500/40">
            <KeyRound className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full py-3 bg-transparent text-slate-800 placeholder-slate-400 text-sm font-medium focus:outline-none"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between px-2 pt-1">
            <button
              type="button"
              onClick={() => setRememberMe(!rememberMe)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 select-none"
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  rememberMe
                    ? "bg-blue-600 text-white shadow-[0_3px_10px_rgba(37,99,235,0.4)]"
                    : "neu-inset text-transparent"
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </span>
              <span>Ingat Username</span>
            </button>
            <span className="text-[11px] font-semibold text-blue-600/80">
              Admin • Owner • Petugas
            </span>
          </div>

          {/* 3D Royal-Blue Pill Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-3d-royal w-full py-3.5 px-5 rounded-full mt-4 text-base flex items-center justify-center relative"
          >
            <span>{loading ? "Membuka Gerbang..." : "Masuk"}</span>
            <span className="absolute right-2.5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-white" />
            </span>
          </button>
        </form>
      </motion.div>

      {/* ANIMASI MOTOR MELAJU LEWAT PALANG PINTU SAAT LOGIN SUKSES */}
      <AnimatePresence>
        {enteringUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 surface-ice flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-xs font-bold mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                AKSES DITERIMA • GERBANG TERBUKA
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Selamat Datang, {enteringUser.nama_lengkap}
              </h2>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-1">
                Menuju Panel {enteringUser.role}...
              </p>
            </motion.div>

            {/* Stage Jalan + Palang Parkir + Motor Lewat */}
            <div className="relative w-full max-w-xl h-44 neu-card rounded-3xl overflow-hidden flex items-end px-8 pb-6">
              {/* Background langit soft */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/70 to-slate-100/60" />

              {/* Pos & Palang Pintu Parkir */}
              <div className="relative z-10 flex items-end ml-auto mr-12 mb-1">
                {/* Tiang Palang */}
                <div className="w-5 h-20 rounded-t-lg bg-gradient-to-b from-blue-600 to-indigo-700 shadow-md flex flex-col items-center pt-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                </div>
                {/* Lengan Palang Terangkat */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -78 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  style={{ transformOrigin: "left center" }}
                  className="w-28 h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-white to-rose-500 border border-slate-300 shadow -ml-1 mb-14"
                />
              </div>

              {/* Aspal Jalan */}
              <div className="absolute bottom-0 inset-x-0 h-8 bg-slate-800 border-t-2 border-slate-700 flex items-center justify-around px-6">
                <span className="w-10 h-1 rounded-full bg-amber-300/70" />
                <span className="w-10 h-1 rounded-full bg-amber-300/70" />
                <span className="w-10 h-1 rounded-full bg-amber-300/70" />
                <span className="w-10 h-1 rounded-full bg-amber-300/70" />
              </div>

              {/* Motor Melaju Dari Kiri Ke Kanan */}
              <motion.div
                initial={{ x: -160 }}
                animate={{ x: 640 }}
                transition={{ duration: 1.15, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-7 left-0 z-20 flex items-end gap-1"
              >
                {/* Speed Lines */}
                <div className="flex flex-col gap-1.5 mb-3 mr-1">
                  <span className="w-8 h-0.5 rounded-full bg-blue-500/70" />
                  <span className="w-12 h-0.5 rounded-full bg-blue-400/50" />
                  <span className="w-6 h-0.5 rounded-full bg-indigo-400/60" />
                </div>

                {/* SVG Motor Sport/Skuter Modern */}
                <svg
                  width="96"
                  height="56"
                  viewBox="0 0 96 56"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-md"
                >
                  {/* Roda Belakang */}
                  <circle cx="20" cy="42" r="10" fill="#1e293b" />
                  <circle cx="20" cy="42" r="5" fill="#94a3b8" />
                  {/* Roda Depan */}
                  <circle cx="74" cy="42" r="10" fill="#1e293b" />
                  <circle cx="74" cy="42" r="5" fill="#94a3b8" />
                  {/* Bodi Motor Royal Blue */}
                  <path
                    d="M16 36 L34 26 L56 26 L68 18 L74 36 L62 40 L26 40 Z"
                    fill="#2563eb"
                  />
                  <path
                    d="M36 26 L54 26 L50 18 L34 20 Z"
                    fill="#1e40af"
                  />
                  {/* Pengendara + Helm */}
                  <circle cx="48" cy="11" r="6" fill="#0f172a" />
                  <path
                    d="M49 9 H54 V13 H49 Z"
                    fill="#60a5fa"
                  />
                  <path
                    d="M42 18 L52 17 L58 26 L44 28 Z"
                    fill="#3b82f6"
                  />
                  {/* Lampu Depan */}
                  <circle cx="73" cy="24" r="3" fill="#fde047" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
