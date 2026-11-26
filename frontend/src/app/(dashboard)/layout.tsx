"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Sidebar from "@/components/ui/Sidebar";
import { getAuthUser, isAuthenticated } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  if (!mounted) {
    return (
      <div className="min-h-screen surface-ice flex items-center justify-center font-mono text-xs text-slate-500">
        Memverifikasi Sesi...
      </div>
    );
  }

  return (
    <div className="min-h-screen surface-ice text-slate-900 flex flex-col">
      <Navbar />
      <div className="flex flex-1 p-3 md:p-5 gap-5 max-w-[1440px] mx-auto w-full">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
