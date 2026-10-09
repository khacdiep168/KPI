import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBadgeColor(classification?: string | null) {
  switch (classification) {
    case "Xuất sắc":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20";
    case "Giỏi":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
    case "Khá":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20";
    case "Trung Bình":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
    case "Yếu":
      return "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20";
  }
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        label: "HĐ Đã Phê Duyệt",
        color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      };
    case "MANAGER_REVIEWED":
      return {
        label: "Quản Lý Đã Chấm",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      };
    case "SUBMITTED":
    default:
      return {
        label: "Chờ Quản Lý Duyệt",
        color: "bg-amber-100 text-amber-800 border-amber-300",
      };
  }
}
