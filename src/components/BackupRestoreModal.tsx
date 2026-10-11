"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  exportSystemBackup, 
  importSystemBackup, 
  resetAllDataToDefault, 
  getUsers, 
  getEvaluations, 
  getPeriods 
} from "@/lib/storage";
import { getCompanyConfig } from "@/lib/companyConfig";
import { 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle, 
  FileJson, 
  X,
  Users,
  FileText,
  Calendar,
  Building2
} from "lucide-react";

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}

export default function BackupRestoreModal({
  isOpen,
  onClose,
  onRestoreSuccess,
}: BackupRestoreModalProps) {
  const [mounted, setMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Current system stats
  const [userCount, setUserCount] = useState(0);
  const [evalCount, setEvalCount] = useState(0);
  const [periodCount, setPeriodCount] = useState(0);
  const [companyName, setCompanyName] = useState("");

  // Restore file state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPayload, setParsedPayload] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState("");

  // Reset modal state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetInputKeyword, setResetInputKeyword] = useState("");

  // Notification message
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadStats = () => {
    setUserCount(getUsers().length);
    setEvalCount(getEvaluations().length);
    setPeriodCount(getPeriods().length);
    setCompanyName(getCompanyConfig().companyName || "Chưa cấu hình");
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      loadStats();
      setSelectedFile(null);
      setParsedPayload(null);
      setRestoreError("");
      setShowResetConfirm(false);
      setResetInputKeyword("");
      setNotification(null);
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // 1. Export backup JSON
  const handleExportBackup = () => {
    try {
      const backupData = exportSystemBackup();
      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);

      const d = new Date();
      const timeStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}_${String(d.getHours()).padStart(2, "0")}${String(d.getMinutes()).padStart(2, "0")}`;
      const fileName = `TKV_KPI_Backup_${timeStr}.json`;

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast("success", `Đã tải về thành công file sao lưu: ${fileName}`);
    } catch (err: any) {
      showToast("error", `Lỗi sao lưu: ${err.message}`);
    }
  };

  // 2. Select file for restore
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError("");
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const json = JSON.parse(text);
        if (!json || typeof json !== "object") {
          throw new Error("File không đúng cấu trúc JSON.");
        }
        if (!Array.isArray(json.users) && !Array.isArray(json.evaluations)) {
          throw new Error("File JSON không chứa dữ liệu nhân viên hoặc đánh giá KPI.");
        }
        setParsedPayload(json);
      } catch (err: any) {
        setRestoreError(`File không hợp lệ: ${err.message}`);
        setParsedPayload(null);
      }
    };
    reader.onerror = () => {
      setRestoreError("Không thể đọc tệp đã chọn.");
      setParsedPayload(null);
    };
    reader.readAsText(file);
  };

  // 3. Confirm restore
  const handleConfirmRestore = () => {
    if (!parsedPayload) return;

    try {
      const result = importSystemBackup(parsedPayload);
      if (result.success) {
        loadStats();
        showToast("success", `Khôi phục thành công! Đã nạp ${result.counts?.users || 0} nhân sự, ${result.counts?.evaluations || 0} đánh giá, ${result.counts?.periods || 0} kỳ.`);
        setParsedPayload(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (onRestoreSuccess) onRestoreSuccess();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast("error", result.message);
      }
    } catch (err: any) {
      showToast("error", `Lỗi khôi phục: ${err.message}`);
    }
  };

  // 4. Reset to default demo data
  const handleResetData = () => {
    if (resetInputKeyword.trim().toUpperCase() !== "RESET") {
      showToast("error", 'Vui lòng nhập chính xác chữ "RESET" để xác nhận!');
      return;
    }

    try {
      resetAllDataToDefault();
      loadStats();
      showToast("success", "Đã đặt lại toàn bộ hệ thống về dữ liệu mẫu mặc định!");
      setShowResetConfirm(false);
      setResetInputKeyword("");
      setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      showToast("error", `Lỗi đặt lại dữ liệu: ${err.message}`);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Sao Lưu & Phục Hồi Dữ Liệu Hệ Thống
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Quản lý an toàn dữ liệu nhân sự, đánh giá KPI và cấu hình doanh nghiệp
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Alert notification banner */}
        {notification && (
          <div
            className={`px-5 py-2.5 text-xs font-semibold flex items-center justify-between transition-all ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-b border-emerald-200"
                : "bg-rose-50 text-rose-800 border-b border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 text-xs ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
          {/* Current system stats card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-3">
              Hiện trạng dữ liệu trên thiết bị
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-semibold">Nhân sự</span>
                </div>
                <p className="text-lg font-black text-slate-900">{userCount}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-semibold">Phiếu KPI</span>
                </div>
                <p className="text-lg font-black text-slate-900">{evalCount}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-600" />
                  <span className="text-[11px] font-semibold">Kỳ đánh giá</span>
                </div>
                <p className="text-lg font-black text-slate-900">{periodCount}</p>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-500 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[11px] font-semibold">Doanh nghiệp</span>
                </div>
                <p className="text-xs font-bold text-slate-900 truncate" title={companyName}>
                  {companyName}
                </p>
              </div>
            </div>
          </div>

          {/* Section 1: Backup / Export */}
          <div className="p-4 sm:p-5 rounded-2xl border border-blue-100 bg-blue-50/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-blue-950 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  1. Sao Lưu Toàn Bộ Dữ Liệu (Backup JSON)
                </h3>
                <p className="text-slate-600 mt-1 leading-relaxed">
                  Xuất toàn bộ danh sách nhân viên (kèm mật khẩu), lịch sử đánh giá tất cả các kỳ, cấu hình công ty ra một tệp tin duy nhất dạng <b>.json</b> để lưu trữ an toàn hoặc chuyển sang máy tính khác.
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tải Bản Sao Lưu (.json) Về Máy</span>
              </button>
            </div>
          </div>

          {/* Section 2: Restore / Import */}
          <div className="p-4 sm:p-5 rounded-2xl border border-emerald-100 bg-emerald-50/40">
            <div>
              <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                2. Phục Hồi Dữ Liệu Từ File Sao Lưu (Restore JSON)
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Chọn tệp tin <b>.json</b> đã tải về từ trước đó để khôi phục lại dữ liệu nhân sự và lịch sử đánh giá.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 file:cursor-pointer"
              />

              {restoreError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{restoreError}</span>
                </div>
              )}

              {parsedPayload && (
                <div className="p-3.5 rounded-xl bg-white border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Tệp sao lưu hợp lệ: {selectedFile?.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                    <div>
                      Nhân sự: <b className="text-slate-900">{parsedPayload.users?.length || 0}</b>
                    </div>
                    <div>
                      Đánh giá: <b className="text-slate-900">{parsedPayload.evaluations?.length || 0}</b>
                    </div>
                    <div>
                      Kỳ: <b className="text-slate-900">{parsedPayload.periods?.length || 0}</b>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmRestore}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-98"
                  >
                    Xác Nhận Khôi Phục Dữ Liệu Ngay
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Reset demo data */}
          <div className="p-4 sm:p-5 rounded-2xl border border-rose-100 bg-rose-50/40">
            <div>
              <h3 className="font-extrabold text-rose-950 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                3. Đặt Lại Dữ Liệu Mẫu Ban Đầu (Reset Demo)
              </h3>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Chỉ sử dụng khi kiểm thử: Đưa toàn bộ hệ thống về danh sách 41 nhân sự mẫu ban đầu và xóa các phiếu đánh giá thử nghiệm.
              </p>
            </div>

            {!showResetConfirm ? (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Yêu Cầu Đặt Lại Dữ Liệu Mặc Định</span>
                </button>
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-white border border-rose-300 space-y-3">
                <p className="text-rose-700 font-bold">
                  CẢNH BÁO: Hành động này sẽ ghi đè toàn bộ dữ liệu hiện tại!
                </p>
                <div>
                  <label className="block text-slate-600 text-[11px] mb-1">
                    Nhập chữ <b>RESET</b> để xác nhận:
                  </label>
                  <input
                    type="text"
                    value={resetInputKeyword}
                    onChange={(e) => setResetInputKeyword(e.target.value)}
                    placeholder="Nhập RESET"
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 uppercase font-mono font-bold text-slate-900 focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetConfirm(false);
                      setResetInputKeyword("");
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleResetData}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs"
                  >
                    Xác Nhận Đặt Lại Toàn Bộ
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Khuyến cáo: Nên tải bản sao lưu định kỳ vào cuối mỗi tháng để lưu trữ an toàn.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
