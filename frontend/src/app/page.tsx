"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthUser, isAuthenticated } from "@/lib/auth";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const user = getAuthUser();
    if (user?.role === "petugas") {
      router.replace("/petugas/masuk");
    } else if (user?.role === "owner") {
      router.replace("/owner");
    } else {
      router.replace("/admin");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-sm">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 rounded-full bg-blue-500 animate-ping" />
        <span>Memuat Parkir-Bozz...</span>
      </div>
    </div>
  );
}
