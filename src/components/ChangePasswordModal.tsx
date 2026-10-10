"use client";

import React, { useState } from "react";
import { User } from "@/types";
import { updateUserPassword } from "@/lib/storage";
import { 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  X,
  ShieldCheck
} from "lucide-react";

interface ChangePasswordModalProps {
  currentUser?: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [manv, setManv] = useState<string>(currentUser?.manv || "");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [showOldPass, setShowOldPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync manv when currentUser changes
  React.useEffect(() => {
    if (currentUser?.manv) {
      setManv(currentUser.manv);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetManv = (manv || currentUser?.manv || "").trim().toUpperCase();
    if (!targetManv) {
      setErrorMsg("Vui lòng nhập Mã Nhân Viên (MANV).");
      return;
    }

    if (!oldPassword.trim()) {
      setErrorMsg("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }

    if (!newPassword.trim() || newPassword.trim().length < 4) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 4 ký tự.");
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setErrorMsg("Mật khẩu mới và mật khẩu xác nhận không trùng khớp.");
      return;
    }

    if (newPassword.trim() === oldPassword.trim()) {
      setErrorMsg("Mật khẩu mới phải khác với mật khẩu hiện tại.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = updateUserPassword(targetManv, oldPassword, newPassword);
      if (!result.success) {
        setErrorMsg(result.message);
      } else {
        setSuccessMsg("Đổi mật khẩu thành công! Mật khẩu mới đã được lưu và đồng bộ.");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setSuccessMsg("");
        }, 1500);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi khi đổi mật khẩu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-400/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Đổi Mật Khẩu Cá Nhân
              </h2>
              <p className="text-xs text-blue-200/80 mt-0.5">
                Cập nhật mật khẩu để bảo mật tài khoản KPI của bạn
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div className="text-slate-300">
                Nhân viên: <strong className="text-white">{currentUser.name}</strong>
              </div>
              <span className="font-mono text-[11px] text-blue-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-400/30">
                [{currentUser.manv}]
              </span>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!currentUser && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mã Nhân Viên (MANV)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: TKV11, HC01..."
                  value={manv}
                  onChange={(e) => setManv(e.target.value.toUpperCase())}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm uppercase text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            )}

            {/* Mật khẩu cũ */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật Khẩu Hiện Tại
              </label>
              <div className="relative">
                <input
                  type={showOldPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu đang dùng..."
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Xác Nhận Mật Khẩu Mới
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Đang lưu..." : "Lưu Mật Khẩu"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
