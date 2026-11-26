import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") return "Rp 0";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatTimeOnly(dateString: string | null | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    timeStyle: "medium",
  }).format(date);
}

export function formatDuration(jamDesimal: number | string | null | undefined): string {
  if (jamDesimal === null || jamDesimal === undefined) return "0 Jam";
  const num = typeof jamDesimal === "string" ? parseFloat(jamDesimal) : jamDesimal;
  if (isNaN(num)) return "0 Jam";
  
  const totalMenit = Math.round(num * 60);
  const jam = Math.floor(totalMenit / 60);
  const menit = totalMenit % 60;
  
  if (jam === 0) return `${menit} Menit`;
  if (menit === 0) return `${jam} Jam`;
  return `${jam} Jam ${menit} Menit`;
}
