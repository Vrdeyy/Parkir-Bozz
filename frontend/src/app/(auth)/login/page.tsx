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
  const [introPhase, setIntroPhase] = useState<"drop" | "explode" | "done">("drop");

  // 3D Particle shards untuk efek ledakan logo P (GPU-accelerated)
  const explosionShards = React.useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const distance = 150 + (i % 3) * 65;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          size: 14 + (i % 3) * 8,
          rotX: (i % 2 === 0 ? 1 : -1) * (140 + i * 18),
          rotY: (i % 3 === 0 ? 1 : -1) * (160 + i * 15),
          isCube: i % 3 === 0,
        };
      }),
    []
  );

  useEffect(() => {
    const saved = localStorage.getItem("parkir_bozz_remember_username");
    if (saved) {
      setUsername(saved);
    }

    const explodeTimer = setTimeout(() => setIntroPhase("explode"), 920);
    const doneTimer = setTimeout(() => setIntroPhase("done"), 1850);
    return () => {
      clearTimeout(explodeTimer);
      clearTimeout(doneTimer);
    };
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
      }, 2050);
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

      {/* INTRO ANIMASI 3D: LOGO P JATUH -> MELEDAK -> MASUK KE LOGIN */}
      <AnimatePresence>
        {introPhase !== "done" && (
          <motion.div
            key="intro-3d-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setIntroPhase("done")}
            style={{ perspective: "1200px" }}
            className="fixed inset-0 z-50 surface-ice flex items-center justify-center overflow-hidden cursor-pointer select-none"
          >
            {/* Bayangan 3D di Lantai saat Logo P jatuh */}
            <motion.div
              initial={{ scale: 0.25, opacity: 0 }}
              animate={
                introPhase === "drop"
                  ? { scale: 1, opacity: 0.28 }
                  : { scale: 2.6, opacity: 0 }
              }
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-28 h-7 rounded-full bg-blue-900/25 blur-md translate-y-20 will-change-transform"
            />

            {/* Shockwave Rings 3D saat Meledak */}
            {introPhase === "explode" && (
              <>
                <motion.div
                  initial={{ scale: 0.3, opacity: 0.85, rotateX: 65 }}
                  animate={{ scale: 5.2, opacity: 0, rotateX: 65 }}
                  transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-36 h-36 rounded-full border-[3px] border-blue-500/75 will-change-transform"
                />
                <motion.div
                  initial={{ scale: 0.2, opacity: 0.75, rotateX: 65 }}
                  animate={{ scale: 4.0, opacity: 0, rotateX: 65 }}
                  transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-32 h-32 rounded-full border-[3px] border-sky-300/85 will-change-transform"
                />
                {/* Kilatan Cahaya Ledakan */}
                <motion.div
                  initial={{ scale: 0.4, opacity: 0.8 }}
                  animate={{ scale: 4.2, opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-blue-500/80 via-sky-300/70 to-white will-change-transform"
                />

                {/* Pecahan Partikel 3D Berhamburan */}
                {explosionShards.map((shard) => (
                  <motion.div
                    key={shard.id}
                    initial={{ x: 0, y: 0, scale: 0.9, opacity: 0.95, rotateX: 0, rotateY: 0 }}
                    animate={{
                      x: shard.x,
                      y: shard.y,
                      scale: 0.15,
                      opacity: 0,
                      rotateX: shard.rotX,
                      rotateY: shard.rotY,
                    }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      width: shard.size,
                      height: shard.size,
                      transformStyle: "preserve-3d",
                    }}
                    className={`absolute will-change-transform ${
                      shard.isCube ? "rounded-lg" : "rounded-full"
                    } bg-gradient-to-br from-white via-blue-400 to-indigo-600 border border-white/80 shadow-md`}
                  />
                ))}
              </>
            )}

            {/* Logo P 3D yang Jatuh, Memantul, lalu Meledak */}
            <motion.div
              initial={{
                y: -360,
                scale: 1.45,
                rotateX: 40,
                rotateY: -35,
                rotateZ: -12,
                opacity: 0,
              }}
              animate={
                introPhase === "drop"
                  ? {
                      y: 0,
                      scale: 1,
                      rotateX: 0,
                      rotateY: 0,
                      rotateZ: 0,
                      opacity: 1,
                    }
                  : {
                      scale: [1, 1.25, 0],
                      rotateY: 180,
                      rotateX: 20,
                      opacity: [1, 0.9, 0],
                    }
              }
              transition={
                introPhase === "drop"
                  ? {
                      type: "spring",
                      stiffness: 170,
                      damping: 16,
                      mass: 0.9,
                    }
                  : {
                      duration: 0.42,
                      ease: [0.22, 1, 0.36, 1],
                    }
              }
              style={{ transformStyle: "preserve-3d" }}
              className="relative z-10 w-28 h-28 rounded-[32px] neu-card p-3.5 flex items-center justify-center shadow-[0_25px_60px_rgba(37,99,235,0.4)] will-change-transform"
            >
              <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-blue-400 via-blue-600 to-indigo-800 shadow-[0_12px_28px_rgba(37,99,235,0.5),inset_0_2px_6px_rgba(255,255,255,0.6)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute -top-5 -left-5 w-14 h-14 rounded-full bg-white/30 blur-sm" />
                <span className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_4px_10px_rgba(15,23,42,0.35)]">
                  P
                </span>
                <span className="absolute bottom-2.5 right-2.5 w-5 h-1.5 rounded-full bg-amber-300 shadow" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Card Utama (muncul halus dari ledakan 3D) */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.85, rotateX: 14 }}
        animate={
          introPhase === "drop"
            ? { opacity: 0, y: 20, scale: 0.85, rotateX: 14 }
            : { opacity: 1, y: 0, scale: 1, rotateX: 0 }
        }
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 22,
          mass: 0.85,
        }}
        style={{ perspective: "1200px" }}
        className="relative z-10 w-full max-w-[400px] will-change-transform"
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 surface-ice flex flex-col items-center justify-center p-6 overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-xl h-48 neu-card rounded-3xl overflow-hidden flex items-end px-8 pb-6 will-change-transform"
            >
              {/* Background langit & awan soft */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-50/85 via-sky-50/50 to-slate-100/70" />
              <motion.div
                animate={{ x: [0, -24, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-5 left-12 w-20 h-5 rounded-full bg-white/75 shadow-sm"
              />
              <motion.div
                animate={{ x: [0, -18, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-9 right-20 w-14 h-4 rounded-full bg-white/65 shadow-sm"
              />

              {/* Pos & Palang Pintu Parkir */}
              <div className="relative z-10 flex items-end ml-auto mr-16 mb-1">
                {/* Tiang Palang 3D */}
                <div className="w-6 h-22 rounded-t-xl bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-800 shadow-[0_8px_18px_rgba(37,99,235,0.35),inset_0_1px_2px_rgba(255,255,255,0.5)] flex flex-col items-center pt-2 pb-12">
                  <motion.span
                    initial={{ backgroundColor: "#f59e0b", boxShadow: "0 0 8px #f59e0b" }}
                    animate={{ backgroundColor: "#34d399", boxShadow: "0 0 14px #34d399" }}
                    transition={{ duration: 0.4, delay: 0.35 }}
                    className="w-2.5 h-2.5 rounded-full"
                  />
                </div>
                {/* Lengan Palang Terangkat Smooth */}
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: -82 }}
                  transition={{
                    type: "spring",
                    stiffness: 110,
                    damping: 15,
                    delay: 0.3,
                  }}
                  style={{ transformOrigin: "left center" }}
                  className="w-32 h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-white to-rose-500 border border-slate-300/80 shadow-md -ml-1 mb-14 will-change-transform"
                />
              </div>

              {/* Aspal Jalan + Marka Jalan */}
              <div className="absolute bottom-0 inset-x-0 h-9 bg-gradient-to-b from-slate-800 to-slate-900 border-t-2 border-slate-700 flex items-center justify-around px-6 overflow-hidden">
                <span className="w-10 h-1 rounded-full bg-amber-300/75" />
                <span className="w-10 h-1 rounded-full bg-amber-300/75" />
                <span className="w-10 h-1 rounded-full bg-amber-300/75" />
                <span className="w-10 h-1 rounded-full bg-amber-300/75" />
                <span className="w-10 h-1 rounded-full bg-amber-300/75" />
              </div>

              {/* Motor Melaju Smooth: Mendekat -> Palang Buka -> Gas Lewat */}
              <motion.div
                initial={{ x: -130, y: 0, rotate: 1 }}
                animate={{
                  x: [-130, 175, 200, 680],
                  y: [0, 0, -1, 0],
                  rotate: [1, 0, -3.5, -1.5],
                }}
                transition={{
                  duration: 1.75,
                  times: [0, 0.34, 0.46, 1],
                  ease: ["easeOut", "easeInOut", [0.42, 0, 0.58, 1]],
                }}
                className="absolute bottom-8 left-0 z-20 flex items-end will-change-transform"
              >
                {/* Efek Angin / Speed Streaks */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0.4 }}
                  animate={{ opacity: [0, 0.25, 0.9, 0.6], scaleX: [0.4, 0.6, 1.25, 1] }}
                  transition={{ duration: 1.75, times: [0, 0.34, 0.6, 1] }}
                  className="flex flex-col gap-1.5 mb-3.5 mr-1 origin-right"
                >
                  <span className="w-9 h-0.5 rounded-full bg-gradient-to-r from-transparent to-blue-500/80" />
                  <span className="w-14 h-0.5 rounded-full bg-gradient-to-r from-transparent to-sky-400/75" />
                  <span className="w-7 h-0.5 rounded-full bg-gradient-to-r from-transparent to-indigo-400/70" />
                </motion.div>

                {/* SVG Motor Sport Modern 3D-Shaded dengan Roda Berputar */}
                <div className="relative flex items-center">
                  <svg
                    width="112"
                    height="62"
                    viewBox="0 0 112 62"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_6px_10px_rgba(15,23,42,0.28)]"
                  >
                    <defs>
                      <linearGradient id="motoBody" x1="20" y1="18" x2="88" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="50%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#1e3a8a" />
                      </linearGradient>
                      <linearGradient id="riderJacket" x1="42" y1="14" x2="64" y2="32" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#1d4ed8" />
                      </linearGradient>
                    </defs>

                    {/* Knalpot */}
                    <path d="M18 40 L36 37 L38 41 L20 44 Z" fill="#64748b" />

                    {/* Roda Belakang Berputar */}
                    <motion.g
                      animate={{ rotate: 1080 }}
                      transition={{ duration: 1.75, ease: "easeInOut" }}
                      style={{ transformOrigin: "26px 46px" }}
                    >
                      <circle cx="26" cy="46" r="11" fill="#0f172a" />
                      <circle cx="26" cy="46" r="6.5" fill="#cbd5e1" />
                      <line x1="26" y1="39.5" x2="26" y2="52.5" stroke="#475569" strokeWidth="1.5" />
                      <line x1="19.5" y1="46" x2="32.5" y2="46" stroke="#475569" strokeWidth="1.5" />
                      <circle cx="26" cy="46" r="2.2" fill="#2563eb" />
                    </motion.g>

                    {/* Roda Depan Berputar */}
                    <motion.g
                      animate={{ rotate: 1080 }}
                      transition={{ duration: 1.75, ease: "easeInOut" }}
                      style={{ transformOrigin: "84px 46px" }}
                    >
                      <circle cx="84" cy="46" r="11" fill="#0f172a" />
                      <circle cx="84" cy="46" r="6.5" fill="#cbd5e1" />
                      <line x1="84" y1="39.5" x2="84" y2="52.5" stroke="#475569" strokeWidth="1.5" />
                      <line x1="77.5" y1="46" x2="90.5" y2="46" stroke="#475569" strokeWidth="1.5" />
                      <circle cx="84" cy="46" r="2.2" fill="#2563eb" />
                    </motion.g>

                    {/* Shock Depan */}
                    <path d="M72 23 L84 46" stroke="#94a3b8" strokeWidth="3.5" strokeLinecap="round" />

                    {/* Bodi Motor Sleek */}
                    <path
                      d="M16 34 C22 29 36 28 48 28 L68 20 C75 20 82 25 84 34 L70 43 L32 43 Z"
                      fill="url(#motoBody)"
                    />
                    {/* Jok & Tangki */}
                    <path d="M32 29 C38 25 48 26 54 29 L48 33 L30 33 Z" fill="#0f172a" />
                    {/* Windshield */}
                    <path d="M68 20 L77 15 L79 22 Z" fill="#bae6fd" opacity="0.85" />

                    {/* Pengendara + Helm */}
                    <path d="M44 19 C49 16 57 18 62 26 L51 30 L42 26 Z" fill="url(#riderJacket)" />
                    <path d="M56 22 L68 23" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="53" cy="12" r="6.5" fill="#0f172a" />
                    <path d="M54 9.5 H60 C60 12.5 58 14 54 14 Z" fill="#38bdf8" />

                    {/* Lampu Depan */}
                    <circle cx="83" cy="27" r="3" fill="#fde047" />
                  </svg>
                  {/* Sorot Lampu Depan */}
                  <div className="w-20 h-7 -ml-5 mb-2 rounded-r-full bg-gradient-to-r from-amber-200/50 to-transparent pointer-events-none" />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
