"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { logout, setCurrentUser, getUsers } from "@/lib/storage";
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
  Sparkles,
  BarChart3,
  KeyRound
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
  onUserSwitch,
}: NavbarProps) {
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const allUsers = getUsers();

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
            Quản Lý
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">TKV KPI</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-blue-100 text-blue-700 rounded-md">
                  V2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Đánh giá hiệu quả công việc hàng tháng</p>
            </div>
          </div>

          {/* Navigation Tabs */}
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

          {/* Right: User Profile & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
                title="Bấm để đổi nhanh tài khoản thử nghiệm"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs uppercase border border-slate-200">
                  {currentUser.name.slice(0, 2)}
                </div>
                <div className="hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 max-w-[130px] truncate">
                      {currentUser.name}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="font-mono text-[10px] text-slate-400">[{currentUser.manv}]</span>
                    <span>{currentUser.dept}</span>
                  </div>
                </div>
              </button>

              {/* Demo User Switcher Menu */}
              {showSwitchMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowSwitchMenu(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-40 divide-y divide-slate-100 animate-in fade-in-50 zoom-in-95">
                    <div className="px-4 py-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Đang đăng nhập</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{currentUser.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {getRoleBadge(currentUser.role)}
                        <span className="text-xs text-slate-500">{currentUser.dept}</span>
                      </div>
                    </div>

                    <div className="py-2 max-h-72 overflow-y-auto">
                      <div className="px-4 py-1 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Chuyển vai trò mẫu:</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      </div>

                      {/* Admin demo account */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "BGD01") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-purple-700">Ban Giám Đốc (BGD01)</p>
                          <p className="text-slate-500 text-[10px]">Toàn quyền duyệt HĐ & xuất báo cáo</p>
                        </div>
                        {currentUser.manv === "BGD01" && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </button>

                      {/* Quản lý Hành Chánh */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "HC01") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-emerald-700">Quản Lý Hành Chánh (HC01)</p>
                          <p className="text-slate-500 text-[10px]">Thấy toàn bộ & Có quyền thêm NV</p>
                        </div>
                        {currentUser.manv === "HC01" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </button>

                      {/* Quản lý Kinh Doanh */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "KD01") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-blue-700">Quản Lý Kinh Doanh (KD01)</p>
                          <p className="text-slate-500 text-[10px]">Thấy bộ phận: Kho, CHMT, Kinh doanh</p>
                        </div>
                        {currentUser.manv === "KD01" && (
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </button>

                      {/* Quản lý DTK */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "DTK01") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-indigo-700">Quản Lý DTK (DTK01)</p>
                          <p className="text-slate-500 text-[10px]">Chỉ thấy nhân viên của Điểm Tập Kết</p>
                        </div>
                        {currentUser.manv === "DTK01" && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        )}
                      </button>

                      {/* Quản lý Kế Toán */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "KT01") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-amber-700">Quản Lý Kế Toán (KT01)</p>
                          <p className="text-slate-500 text-[10px]">Chỉ thấy nhân viên Phòng Kế Toán</p>
                        </div>
                        {currentUser.manv === "KT01" && (
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                        )}
                      </button>

                      {/* Quản lý IT */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "TKV09") || allUsers[0];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-cyan-700">Quản Lý IT (TKV09)</p>
                          <p className="text-slate-500 text-[10px]">Nguyễn Khắc Diệp (Thấy toàn nhân viên)</p>
                        </div>
                        {currentUser.manv === "TKV09" && (
                          <span className="w-2 h-2 rounded-full bg-cyan-600" />
                        )}
                      </button>

                      {/* Regular Employee demo account */}
                      <button
                        onClick={() => {
                          const u = allUsers.find((x) => x.manv === "TKV11") || allUsers[1];
                          setCurrentUser(u);
                          onUserSwitch(u);
                          setShowSwitchMenu(false);
                        }}
                        className="w-full px-4 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">Nhân Viên (TKV11)</p>
                          <p className="text-slate-500 text-[10px]">Trịnh Thanh Thúy (Tự đánh giá & sửa)</p>
                        </div>
                        {currentUser.manv === "TKV11" && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                      </button>
                    </div>

                    <div className="pt-2 px-2 space-y-1">
                      <button
                        onClick={() => {
                          setShowSwitchMenu(false);
                          setShowChangePassModal(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                        Đổi mật khẩu cá nhân
                      </button>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Change Password icon */}
            <button
              onClick={() => setShowChangePassModal(true)}
              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Đổi mật khẩu cá nhân"
            >
              <KeyRound className="w-4 h-4" />
            </button>

            {/* Logout icon */}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom App Navigation Bar (Chuẩn Giao Diện App Di Động Hiện Đại) */}
      <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 pt-1 pb-3">
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
