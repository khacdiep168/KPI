"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { setCurrentUser, findUserByInput } from "@/lib/storage";
import { getCompanyConfig, CompanyConfig } from "@/lib/companyConfig";
import { 
  Building2, 
  Lock, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ShieldCheck 
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

interface LoginFormProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(getCompanyConfig());
  const [manv, setManv] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showChangePassModal, setShowChangePassModal] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const user = findUserByInput(manv);

    if (!user) {
      setErrorMsg(`Mã nhân viên "${manv}" không tìm thấy trong hệ thống.`);
      return;
    }

    // Flexible password check: user's password OR default 123 / 123456
    const enteredPass = password.trim();
    const targetPass = (user.password || "").trim();
    const isMatch = 
      enteredPass === targetPass || 
      enteredPass === "123" || 
      enteredPass === "123456";

    if (!isMatch) {
      setErrorMsg("Mật khẩu không chính xác. Vui lòng thử lại.");
      return;
    }

    setCurrentUser(user);
    onLoginSuccess(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 via-slate-950 to-black text-slate-100">
      <div className="w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/40">
          <div className="text-center mb-6">
            {companyConfig.logoUrl ? (
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 overflow-hidden">
                <img 
                  src={companyConfig.logoUrl} 
                  alt="Logo" 
                  className="w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/30 mb-3">
                <Building2 className="w-7 h-7" />
              </div>
            )}
            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              {companyConfig.shortName || "THẾ KỶ VÀNG"} KPI
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {companyConfig.companyName}
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
                  placeholder="Nhập mã nhân viên (VD: TKV11, HC01...)"
                  value={manv}
                  onChange={(e) => setManv(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Mật Khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(true)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Đổi mật khẩu?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
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

          {/* Quick Change Password Action */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => setShowChangePassModal(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-blue-300 transition-colors"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>Nhân viên đổi mật khẩu tại đây</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-600 mt-6">
          © 2026 TKV Logistics • Giải pháp quản trị KPI tối giản & hiện đại
        </p>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassModal}
        onClose={() => setShowChangePassModal(false)}
      />
    </div>
  );
}
