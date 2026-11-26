import type { Metadata } from "next";
import { Toaster } from "sonner";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parkir-Bozz | Sistem Manajemen & Gerbang Parkir",
  description: "Aplikasi POS & Manajemen Parkir Otomatis Terintegrasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-950 text-slate-100 min-h-screen">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
