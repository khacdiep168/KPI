"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  getCompanyConfig, 
  saveCompanyConfig, 
  CompanyConfig, 
  DEFAULT_COMPANY_CONFIG 
} from "@/lib/companyConfig";
import { pushCompanyConfigToSupabase } from "@/lib/supabaseSync";
import { 
  Building2, 
  Upload, 
  RotateCcw, 
  Check, 
  X, 
  Image as ImageIcon 
} from "lucide-react";

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: CompanyConfig) => void;
}

export default function CompanySettingsModal({
  isOpen,
  onClose,
  onSaved,
}: CompanySettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [companyForm, setCompanyForm] = useState<CompanyConfig>(DEFAULT_COMPANY_CONFIG);
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCompanyForm(getCompanyConfig());
      setCompanySaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveCompanyConfig(companyForm);
    pushCompanyConfigToSupabase(updated).catch(console.error);
    setCompanySaveSuccess(true);
    if (onSaved) onSaved(updated);
    setTimeout(() => {
      setCompanySaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleResetCompanyDefault = () => {
    if (confirm("Khôi phục thông tin doanh nghiệp về giá trị mặc định của CÔNG TY TNHH TM THẾ KỶ VÀNG?")) {
      setCompanyForm(DEFAULT_COMPANY_CONFIG);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Dung lượng logo không nên vượt quá 2MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCompanyForm((prev) => ({ ...prev, logoUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative bg-white rounded-3xl max-w-xl w-full p-5 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Cài Đặt Thông Tin Doanh Nghiệp
              </h3>
              <p className="text-xs text-slate-500">
                Cấu hình logo, tên công ty, địa chỉ và tiêu đề xuất báo cáo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        {companySaveSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">Đã lưu cấu hình doanh nghiệp thành công! Dữ liệu đã được cập nhật.</span>
          </div>
        )}

        <form onSubmit={handleSaveCompanyConfig} className="mt-5 space-y-4">
          {/* Tên công ty */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Tên Công Ty / Doanh Nghiệp <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={companyForm.companyName}
              onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
              placeholder="Ví dụ: CÔNG TY TNHH TM THẾ KỶ VÀNG"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-bold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tên chính thức in hoa trên đầu Báo Cáo Năm (PDF/In) và File Excel.
            </p>
          </div>

          {/* Đơn vị chủ quản / Tập đoàn */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Đơn Vị Chủ Quản / Tập Đoàn (Tùy chọn)
            </label>
            <input
              type="text"
              value={companyForm.parentOrg || ""}
              onChange={(e) => setCompanyForm({ ...companyForm, parentOrg: e.target.value })}
              placeholder="Để trống nếu là công ty độc lập (không thuộc tập đoàn)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Nếu để trống, dòng này sẽ được ẩn hoàn toàn trên mọi văn bản và báo cáo.
            </p>
          </div>

          {/* Tên viết tắt / Hệ thống */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tên Viết Tắt Hệ Thống
              </label>
              <input
                type="text"
                value={companyForm.shortName}
                onChange={(e) => setCompanyForm({ ...companyForm, shortName: e.target.value })}
                placeholder="Ví dụ: THẾ KỶ VÀNG"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Hiển thị trên thanh điều hướng & đăng nhập.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tỉnh / Thành Ký Văn Bản
              </label>
              <input
                type="text"
                value={companyForm.signatureLocation}
                onChange={(e) => setCompanyForm({ ...companyForm, signatureLocation: e.target.value })}
                placeholder="Ví dụ: Quảng Ninh, Hà Nội..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Dùng cho dòng: <em>"[Tỉnh/TP], ngày... tháng... năm..."</em>
              </p>
            </div>
          </div>

          {/* Địa chỉ trụ sở */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Địa Chỉ Trụ Sở Công Ty
            </label>
            <input
              type="text"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              placeholder="Ví dụ: Số 123 đường ABC, Thành phố Hạ Long, Tỉnh Quảng Ninh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Logo cấu hình */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Logo Công Ty
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-xs">
                {companyForm.logoUrl ? (
                  <img 
                    src={companyForm.logoUrl} 
                    alt="Logo Preview" 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImageIcon className="w-6 h-6 mx-auto mb-0.5" />
                    <span className="text-[9px] block">Chưa có logo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full">
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tải ảnh từ máy tính</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>

                  {companyForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setCompanyForm({ ...companyForm, logoUrl: "" })}
                      className="px-2.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors"
                    >
                      Xóa logo
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  value={companyForm.logoUrl || ""}
                  onChange={(e) => setCompanyForm({ ...companyForm, logoUrl: e.target.value })}
                  placeholder="Hoặc dán URL logo (https://...)"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetCompanyDefault}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors w-full sm:w-auto justify-center"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
