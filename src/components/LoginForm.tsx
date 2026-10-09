"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { getUsers, setCurrentUser, findUserByInput, resetUsersStorage } from "@/lib/storage";
import { 
  Building2, 
  Lock, 
  UserCheck, 
  ArrowRight, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  RotateCcw
} from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [manv, setManv] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const user = findUserByInput(manv);

    if (!user) {
      setErrorMsg(`Mã nhân viên hoặc chức vụ "${manv}" không tìm thấy. Thử: HC01, KD01, DTK01, KT01, TKV09, BGD01.`);
      return;
    }

    // Flexible password check: user's password OR 123 OR 123456
    const enteredPass = password.trim();
    const targetPass = (user.password || "").trim();
    const isMatch = 
      enteredPass === targetPass || 
      enteredPass === "123" || 
      enteredPass === "123456";

    if (!isMatch) {
      setErrorMsg(`Mật khẩu không chính xác. (Mật khẩu của tài khoản ${user.manv} là: ${targetPass || "123"})`);
      return;
    }

    setCurrentUser(user);
    onLoginSuccess(user);
  };

  const handleQuickLogin = (targetManv: string) => {
    let user = findUserByInput(targetManv);
    if (!user) {
      // Force refresh initial users in case browser had stale storage
      resetUsersStorage();
      user = findUserByInput(targetManv);
    }
    if (user) {
      setCurrentUser(user);
      onLoginSuccess(user);
    } else {
      setErrorMsg(`Không thể tải tài khoản ${targetManv}. Hãy thử tải lại trang.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/30 mb-3">
              <Building2 className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              TKV KPI SYSTEM
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Hệ thống đánh giá hiệu quả công việc hàng tháng
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Mã Nhân Viên (MANV)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: TKV11, TKV09, BGD01..."
                  value={manv}
                  onChange={(e) => setManv(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Mật Khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Đăng Nhập</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Shortcuts */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Đăng nhập nhanh (Tài khoản mẫu)
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => handleQuickLogin("BGD01")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Ban Giám Đốc (Admin / Council)</p>
                    <p className="text-[10px] text-slate-400">BGD01 • Toàn quyền xem & duyệt HĐ</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("HC01")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Quản Lý Hành Chánh (HC)</p>
                    <p className="text-[10px] text-emerald-400">HC01 • Thấy toàn bộ & Có quyền thêm NV</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("KD01")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Quản Lý Kinh Doanh (KD)</p>
                    <p className="text-[10px] text-blue-300">KD01 • Thấy bộ phận Kho, CHMT, Kinh doanh</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("DTK01")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Quản Lý Điểm Tập Kết (DTK)</p>
                    <p className="text-[10px] text-indigo-300">DTK01 • Chỉ thấy nhân viên của DTK</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("KT01")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Quản Lý Kế Toán (KT)</p>
                    <p className="text-[10px] text-amber-300">KT01 • Chỉ thấy nhân viên Kế toán</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("TKV09")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Quản Lý IT (TKV09)</p>
                    <p className="text-[10px] text-cyan-300">TKV09 • Nguyễn Khắc Diệp (Thấy toàn nhân viên)</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("TKV11")}
                className="w-full p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-left flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200">Nhân Viên Tiêu Biểu (User)</p>
                    <p className="text-[10px] text-slate-400">TKV11 • Trịnh Thanh Thúy (Tự đánh giá & sửa)</p>
                  </div>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-500" />
              </button>
            </div>

            <div className="pt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  resetUsersStorage();
                  alert("Đã đồng bộ và làm mới danh sách tài khoản Quản lý & Nhân viên về trạng thái chuẩn!");
                  window.location.reload();
                }}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-blue-300 transition-colors"
                title="Bấm nếu gặp lỗi không đăng nhập được tài khoản mới"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đồng bộ / Khôi phục danh sách tài khoản Quản lý</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 TKV Logistics • Giải pháp quản trị KPI tối giản & hiện đại
        </p>
      </div>
    </div>
  );
}
