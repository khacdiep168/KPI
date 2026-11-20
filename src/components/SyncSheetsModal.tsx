"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  FileSpreadsheet, 
  X, 
  ShieldCheck, 
  ArrowRight,
  Database
} from "lucide-react";
import { syncFromSupabase } from "@/lib/supabaseSync";
import { User } from "@/types";

interface SyncSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSyncSuccess?: () => void;
}

export default function SyncSheetsModal({
  isOpen,
  onClose,
  currentUser,
  onSyncSuccess,
}: SyncSheetsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    summary: {
      scannedStaff: number;
      scannedManager: number;
      newStaff: number;
      newManager: number;
      alreadyExisting: number;
      totalEvaluationsInDb: number;
    };
    inserted: Array<{
      manv: string;
      period: string;
      evaluation_type: string;
      final_score: number;
      classification: string;
    }>;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setResult(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleStartSync = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/sync-google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requesterManv: currentUser.manv,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Có lỗi xảy ra trong quá trình đồng bộ.");
      }

      setResult(data);

      // Cập nhật lại client localStorage từ Supabase
      try {
        await syncFromSupabase();
      } catch (syncErr) {
        console.warn("Lỗi đồng bộ local cache:", syncErr);
      }

      if (onSyncSuccess) {
        onSyncSuccess();
      }
    } catch (err: any) {
      console.error("Lỗi khi đồng bộ Google Sheets:", err);
      setError(err?.message || "Không thể kết nối đến máy chủ hoặc Google Sheets.");
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-linear-to-r from-teal-700 via-teal-800 to-emerald-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-teal-200 shadow-inner">
              <RefreshCw className={`w-6 h-6 ${loading ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                Đồng Bộ Dữ Liệu Google Sheets
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-200 border border-teal-300/30">
                  Admin
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-teal-100/90 font-medium mt-0.5">
                Quét và nạp dữ liệu đánh giá mới từ 2 biểu mẫu Google Form vào Supabase
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-700 text-sm">
          {/* Nguồn liên kết Google Sheets */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-teal-600" />
              Nguồn Biểu Mẫu Google Sheets Đang Kết Nối
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sheet Nhân viên */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100 text-teal-800">
                      Nhân Viên (10 câu)
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1.5">
                      Bảng Đánh Giá Nhân Viên
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sheet: Form Responses 1
                    </p>
                  </div>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1b-79L51AyhW38egwSCzlcXffoAlDuzFrDkXQ7Xz4rAQ/edit?gid=118973536#gid=118973536"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                    title="Mở Google Sheets"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Sheet Quản lý */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Cấp Quản Lý (7 câu)
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 mt-1.5">
                      Bảng Đánh Giá Quản Lý
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sheet: Trang tính 1
                    </p>
                  </div>
                  <a
                    href="https://docs.google.com/spreadsheets/d/13Tu2Z3vGxbRoRT-L9OzEUFU3oX5RFJ9LDokdOZRcKWQ/edit?gid=520415395#gid=520415395"
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                    title="Mở Google Sheets"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Quy tắc an toàn dữ liệu */}
          <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 text-xs text-teal-900 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-teal-800">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              Cơ chế bảo vệ dữ liệu tự động:
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-teal-900/90 pl-1">
              <li>Hệ thống tự động so khớp theo <b>Kỳ đánh giá + Mã nhân viên + Loại đánh giá</b>.</li>
              <li>Các bản ghi đã tồn tại trong database sẽ được <b>bỏ qua an toàn</b>, không làm mất điểm đã duyệt hoặc ghi đè kết quả.</li>
              <li>Chỉ những phản hồi mới nhất chưa có trong hệ thống mới được INSERT.</li>
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Đồng bộ không thành công</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Sync Result Report */}
          {result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Đồng Bộ Hoàn Tất Thành Công!</span>
                </div>
                <p className="text-xs text-emerald-700 mt-1">
                  {result.message}
                </p>

                {/* Thống kê chi tiết */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-emerald-200/60 text-center">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-slate-500 font-medium">Nhân viên mới</div>
                    <div className="text-lg font-black text-emerald-700">+{result.summary.newStaff}</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-slate-500 font-medium">Quản lý mới</div>
                    <div className="text-lg font-black text-emerald-700">+{result.summary.newManager}</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-slate-500 font-medium">Đã có (Bỏ qua)</div>
                    <div className="text-lg font-black text-slate-600">{result.summary.alreadyExisting}</div>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <div className="text-[11px] text-slate-500 font-medium">Tổng trong DB</div>
                    <div className="text-lg font-black text-teal-800">{result.summary.totalEvaluationsInDb}</div>
                  </div>
                </div>
              </div>

              {/* Danh sách bản ghi mới thêm vào */}
              {result.inserted && result.inserted.length > 0 ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center justify-between">
                    <span>Chi Tiết Các Bản Ghi Mới Vừa Nạp ({result.inserted.length})</span>
                  </h4>
                  <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
                    {result.inserted.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                            {item.manv}
                          </span>
                          <span className="text-slate-600 font-medium">
                            Kỳ {item.period}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.evaluation_type === "MANAGER"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-teal-100 text-teal-700"
                          }`}>
                            {item.evaluation_type === "MANAGER" ? "Quản Lý" : "Nhân Viên"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">
                            {item.final_score} đ
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            item.classification === "Giỏi"
                              ? "bg-emerald-100 text-emerald-800"
                              : item.classification === "Khá"
                              ? "bg-blue-100 text-blue-800"
                              : item.classification === "Trung Bình"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}>
                            {item.classification}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 text-slate-500 text-center text-xs">
                  Tất cả phản hồi từ Google Sheets đã có đầy đủ trong cơ sở dữ liệu. Không có bản ghi mới cần bổ sung.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Tài khoản thực hiện: <b className="text-slate-800">{currentUser.name} ({currentUser.manv})</b>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleStartSync}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Đang đồng bộ..." : "Bắt Đầu Đồng Bộ"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
