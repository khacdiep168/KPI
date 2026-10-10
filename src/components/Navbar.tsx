"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { logout } from "@/lib/storage";
import { 
  Building2, 
  LogOut, 
  UserCheck, 
  ShieldAlert, 
  Briefcase, 
  FileText, 
  LayoutDashboard, 
  History, 
  Users2,
  ChevronDown,
  BarChart3,
  KeyRound,
  X,
  ChevronRight,
  User as UserIcon
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

interface NavbarProps {
  currentUser: User;
  activeTab: "evaluate" | "history" | "manager" | "admin" | "annual-report";
  onTabChange: (tab: "evaluate" | "history" | "manager" | "admin" | "annual-report") => void;
  onUserSwitch: (user: User) => void;
}

export default function Navbar({
  currentUser,
  activeTab,
  onTabChange,
}: NavbarProps) {
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <ShieldAlert className="w-3 h-3 text-purple-600" />
            Hội Đồng / Admin
          </span>
        );
      case "Manager":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Briefcase className="w-3 h-3 text-blue-600" />
            Quản Lý Bộ Phận
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3 h-3 text-emerald-600" />
            Nhân Viên
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">TKV KPI</span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-700 rounded-md">
                  V2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">Đánh giá hiệu quả công việc hàng tháng</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onTabChange("evaluate")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "evaluate"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <FileText className="w-4 h-4" />
              Tự Đánh Giá
            </button>

            <button
              onClick={() => onTabChange("history")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "history"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <History className="w-4 h-4" />
              Lịch Sử Cá Nhân
            </button>

            {(currentUser.role === "Manager" || currentUser.role === "Admin" || (currentUser.title && currentUser.title.toUpperCase().includes("QUẢN LÝ"))) && (
              <button
                onClick={() => onTabChange("manager")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "manager"
                    ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Users2 className="w-4 h-4" />
                Duyệt Bộ Phận
              </button>
            )}

            {currentUser.role === "Admin" && (
              <button
                onClick={() => onTabChange("admin")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "admin"
                    ? "bg-purple-50 text-purple-700 font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Hội Đồng & Báo Cáo
              </button>
            )}

            <button
              onClick={() => onTabChange("annual-report")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === "annual-report"
                  ? "bg-blue-50 text-blue-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Báo Cáo Năm (12 Kỳ)
            </button>
          </nav>

          {/* Right: User Profile & Actions (Luôn hiển thị rõ nét trên cả máy tính & điện thoại) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Nút Đổi Mật Khẩu (Chìa khóa 🔑 rõ ràng) */}
            <button
              onClick={() => setShowChangePassModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              title="Đổi mật khẩu cá nhân"
            >
              <KeyRound className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Đổi Mật Khẩu</span>
            </button>

            {/* Nút Hồ Sơ Người Dùng / Avatar */}
            <button
              onClick={() => setShowProfileSheet(true)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left cursor-pointer active:scale-95"
              title="Xem hồ sơ nhân viên"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-xs">
                {currentUser.name.slice(0, 2)}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-900 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                  <span>[{currentUser.manv}]</span>
                </div>
              </div>
            </button>

            {/* Nút Đăng Xuất (Nổi bật màu đỏ) */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 transition-colors cursor-pointer active:scale-95"
              title="Đăng xuất tài khoản"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-bold hidden md:inline">Đăng Xuất</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Sheet Modal (Mở khi bấm vào Avatar hoặc bấm tab 'Tài Khoản' ở thanh đáy) */}
      {showProfileSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowProfileSheet(false)} 
          />

          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-100 z-10 max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {/* Header thông tin nhân viên */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white text-base font-black shadow-md shadow-blue-500/20 shrink-0">
                  {currentUser.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-extrabold text-slate-900 truncate">
                    {currentUser.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono font-bold mt-0.5">
                    [{currentUser.manv}] - {currentUser.dept}
                  </p>
                  <div className="mt-1">
                    {getRoleBadge(currentUser.role)}
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setShowProfileSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Các nút bấm thao tác lớn dành cho nhân viên trên điện thoại */}
            <div className="py-4 space-y-3">
              {/* Nút Đổi mật khẩu cá nhân */}
              <button
                type="button"
                onClick={() => {
                  setShowProfileSheet(false);
                  setShowChangePassModal(true);
                }}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-950 font-bold text-sm flex items-center justify-between transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-blue-950 text-sm">Đổi Mật Khẩu Cá Nhân</p>
                    <p className="text-xs text-blue-700/80 font-normal mt-0.5">Cập nhật mật khẩu bảo mật tài khoản</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-500 shrink-0" />
              </button>

              {/* Nút Đăng xuất tài khoản */}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full p-3.5 sm:p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-950 font-bold text-sm flex items-center justify-between transition-all cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25 shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-extrabold text-rose-950 text-sm">Đăng Xuất Tài Khoản</p>
                    <p className="text-xs text-rose-700/80 font-normal mt-0.5">Thoát khỏi phiên làm việc hiện tại</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-rose-500 shrink-0" />
              </button>
            </div>

            {/* Nút Đóng */}
            <button
              type="button"
              onClick={() => setShowProfileSheet(false)}
              className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Mobile Fixed Bottom App Navigation Bar (Chuẩn Giao Diện App Di Động Hiện Đại) */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 pt-1 pb-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Tự Đánh Giá */}
          <button
            onClick={() => onTabChange("evaluate")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "evaluate"
                ? "text-blue-600 font-bold"
                : "text-slate-500 font-medium hover:text-slate-800"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === "evaluate" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105" 
                : "bg-slate-100 text-slate-600"
            }`}>
              <FileText className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Đánh Giá</span>
          </button>

          {/* 2. Lịch Sử Cá Nhân */}
          <button
            onClick={() => onTabChange("history")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "history"
                ? "text-blue-600 font-bold"
                : "text-slate-500 font-medium hover:text-slate-800"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === "history" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105" 
                : "bg-slate-100 text-slate-600"
            }`}>
              <History className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Lịch Sử</span>
          </button>

          {/* 3. Báo Cáo Năm (12 Kỳ) */}
          <button
            onClick={() => onTabChange("annual-report")}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
              activeTab === "annual-report"
                ? "text-blue-600 font-bold"
                : "text-slate-500 font-medium hover:text-slate-800"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              activeTab === "annual-report" 
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105" 
                : "bg-slate-100 text-slate-600"
            }`}>
              <BarChart3 className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight">Báo Cáo Năm</span>
          </button>

          {/* 4. Duyệt Bộ Phận (chỉ Quản lý / Admin) */}
          {(currentUser.role === "Manager" || currentUser.role === "Admin" || (currentUser.title && currentUser.title.toUpperCase().includes("QUẢN LÝ"))) && (
            <button
              onClick={() => onTabChange("manager")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                activeTab === "manager"
                  ? "text-blue-600 font-bold"
                  : "text-slate-500 font-medium hover:text-slate-800"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "manager" 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 scale-105" 
                : "bg-slate-100 text-slate-600"
              }`}>
                <Users2 className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-1 tracking-tight">Duyệt KPI</span>
            </button>
          )}

          {/* 5. Hội Đồng & Quản Trị (chỉ Admin) */}
          {currentUser.role === "Admin" && (
            <button
              onClick={() => onTabChange("admin")}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                activeTab === "admin"
                  ? "text-purple-600 font-bold"
                  : "text-slate-500 font-medium hover:text-slate-800"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${
                activeTab === "admin" 
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/30 scale-105" 
                  : "bg-slate-100 text-slate-600"
              }`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span className="text-[10px] mt-1 tracking-tight">Hội Đồng</span>
            </button>
          )}

          {/* 6. Tài Khoản & Cài Đặt (Dành riêng cho người dùng điện thoại) */}
          <button
            onClick={() => setShowProfileSheet(true)}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all duration-200 active:scale-95 text-slate-600 hover:text-slate-900"
          >
            <div className="p-1.5 rounded-xl bg-slate-100 text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600">
              <UserIcon className="w-4 h-4" />
            </div>
            <span className="text-[10px] mt-1 tracking-tight font-semibold">Tài Khoản</span>
          </button>
        </div>
      </nav>

      {/* Change Password Modal */}
      <ChangePasswordModal
        currentUser={currentUser}
        isOpen={showChangePassModal}
        onClose={() => setShowChangePassModal(false)}
      />
    </header>
  );
}
