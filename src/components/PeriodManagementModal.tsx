"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { KpiPeriod } from "@/types";
import { getPeriods, savePeriod, updatePeriod, deletePeriod } from "@/lib/storage";
import { 
  Calendar, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit, 
  X, 
  ToggleLeft, 
  ToggleRight,
  ShieldAlert,
  CalendarCheck
} from "lucide-react";

interface PeriodManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPeriodsChanged?: () => void;
}

export default function PeriodManagementModal({
  isOpen,
  onClose,
  onPeriodsChanged,
}: PeriodManagementModalProps) {
  const [mounted, setMounted] = useState(false);
  const [periods, setPeriods] = useState<KpiPeriod[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<KpiPeriod | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // New period form state
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [periodName, setPeriodName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isInitialOpen, setIsInitialOpen] = useState(true);

  // Edit period state
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = () => {
    const list = getPeriods();
    setPeriods(list);
  };

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      loadData();
      setShowAddForm(false);
      setEditingPeriod(null);
      setDeleteConfirmId(null);
      setNotification(null);
      resetNewForm(currentMonth, currentYear);
    }
  }, [isOpen]);

  const resetNewForm = (m: number, y: number) => {
    const mStr = String(m).padStart(2, "0");
    setPeriodName(`Kỳ đánh giá KPI Tháng ${mStr}/${y}`);
    const lastDay = new Date(y, m, 0).getDate();
    setStartDate(`${y}-${mStr}-01`);
    setEndDate(`${y}-${mStr}-${String(lastDay).padStart(2, "0")}`);
    setIsInitialOpen(true);
  };

  const handleMonthYearChange = (m: number, y: number) => {
    setSelectedMonth(m);
    setSelectedYear(y);
    resetNewForm(m, y);
  };

  if (!isOpen || !mounted || typeof document === "undefined") {
    return null;
  }

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3500);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    const mStr = String(selectedMonth).padStart(2, "0");
    const monthYear = `${mStr}-${selectedYear}`;
    const id = `p-${selectedYear}-${mStr}`;

    const newPeriod: KpiPeriod = {
      id,
      monthYear,
      name: periodName.trim(),
      isOpen: isInitialOpen,
      startDate: startDate,
      endDate: endDate,
    };

    try {
      savePeriod(newPeriod);
      loadData();
      if (onPeriodsChanged) onPeriodsChanged();
      setShowAddForm(false);
      showToast("success", `Tạo mới kỳ đánh giá "${newPeriod.name}" thành công!`);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi tạo kỳ đánh giá");
    }
  };

  const handleToggleOpen = (period: KpiPeriod) => {
    try {
      const updated = updatePeriod(period.id, { isOpen: !period.isOpen });
      loadData();
      if (onPeriodsChanged) onPeriodsChanged();
      const statusText = updated?.isOpen ? "ĐÃ MỞ" : "ĐÃ ĐÓNG";
      showToast("success", `Kỳ "${period.name}" hiện ${statusText} cho nhân viên chấm điểm!`);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi cập nhật trạng thái kỳ");
    }
  };

  const handleStartEdit = (p: KpiPeriod) => {
    setEditingPeriod(p);
    setEditName(p.name);
    setEditStartDate(p.startDate);
    setEditEndDate(p.endDate);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPeriod) return;

    try {
      updatePeriod(editingPeriod.id, {
        name: editName.trim(),
        startDate: editStartDate,
        endDate: editEndDate,
      });
      loadData();
      if (onPeriodsChanged) onPeriodsChanged();
      setEditingPeriod(null);
      showToast("success", `Cập nhật kỳ đánh giá "${editName}" thành công!`);
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi cập nhật kỳ");
    }
  };

  const handleDelete = (id: string) => {
    try {
      deletePeriod(id);
      loadData();
      if (onPeriodsChanged) onPeriodsChanged();
      setDeleteConfirmId(null);
      showToast("success", "Đã xóa kỳ đánh giá khỏi hệ thống!");
    } catch (err: any) {
      showToast("error", err.message || "Lỗi khi xóa kỳ");
    }
  };

  // Helper check deadline
  const getDeadlineStatus = (period: KpiPeriod) => {
    if (!period.endDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(period.endDate);
    end.setHours(23, 59, 59, 999);

    const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        isExpired: true,
        text: `Đã quá hạn ${Math.abs(diffDays)} ngày`,
        color: "text-rose-600 bg-rose-50 border-rose-200",
      };
    } else if (diffDays === 0) {
      return {
        isExpired: false,
        text: "Hôm nay là hạn chót",
        color: "text-amber-600 bg-amber-50 border-amber-200 font-bold",
      };
    } else {
      return {
        isExpired: false,
        text: `Còn ${diffDays} ngày đến hạn`,
        color: "text-blue-600 bg-blue-50 border-blue-200",
      };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 max-h-[92vh] flex flex-col z-10 overflow-hidden">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Quản Lý Kỳ Đánh Giá & Hạn Nộp (Deadline)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  {periods.length} kỳ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Thiết lập kỳ mở/đóng, thời hạn kết thúc chấm KPI cho toàn công ty
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

        {/* Action bar */}
        <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
              Đang Mở: <span className="text-emerald-600 font-bold">{periods.filter((p) => p.isOpen).length}</span>
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700">
              Đã Đóng: <span className="text-slate-500 font-bold">{periods.filter((p) => !p.isOpen).length}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? "Ẩn Form Thêm" : "Tạo Kỳ Mới"}</span>
          </button>
        </div>

        {/* Expandable Add New Period Form */}
        {showAddForm && (
          <div className="p-5 bg-purple-50/40 border-b border-purple-100 animate-in slide-in-from-top-2 duration-200">
            <h3 className="font-bold text-purple-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-purple-600" />
              Thiết lập kỳ đánh giá KPI mới
            </h3>
            <form onSubmit={handleCreatePeriod} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tháng / Năm</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={selectedMonth}
                    onChange={(e) => handleMonthYearChange(Number(e.target.value), selectedYear)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <option key={m} value={m}>
                        Tháng {m < 10 ? "0" + m : m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedYear}
                    onChange={(e) => handleMonthYearChange(selectedMonth, Number(e.target.value))}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                  >
                    {[2025, 2026, 2027, 2028].map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên Kỳ Đánh Giá</label>
                <input
                  type="text"
                  value={periodName}
                  onChange={(e) => setPeriodName(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ngày Bắt Đầu - Hạn Nộp (Deadline)</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-[11px]"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full px-2 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 text-[11px]"
                  />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 cursor-pointer pb-2 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={isInitialOpen}
                    onChange={(e) => setIsInitialOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Mở kỳ ngay</span>
                </label>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  Lưu Kỳ
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Periods List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
          {periods.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-600 text-sm">Chưa có kỳ đánh giá nào được cấu hình</p>
            </div>
          ) : (
            <div className="space-y-3">
              {periods.map((p) => {
                const deadline = getDeadlineStatus(p);

                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      p.isOpen
                        ? "bg-white border-emerald-200 shadow-xs hover:border-emerald-300"
                        : "bg-slate-50/70 border-slate-200 opacity-80"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                          {p.monthYear}
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm">{p.name}</h4>
                        {p.isOpen ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ĐANG MỞ CHẤM
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200 text-slate-600">
                            ĐÃ ĐÓNG KỲ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span>
                          Thời hạn: <span className="font-semibold text-slate-700">{p.startDate}</span> đến{" "}
                          <span className="font-semibold text-slate-700">{p.endDate}</span>
                        </span>

                        {deadline && p.isOpen && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] border ${deadline.color}`}>
                            <Clock className="w-3 h-3" />
                            {deadline.text}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Toggle Open/Close Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleOpen(p)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          p.isOpen
                            ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                        }`}
                        title={p.isOpen ? "Khóa kỳ lại (Nhân viên không thể chấm tiếp)" : "Mở kỳ ra cho nhân viên chấm điểm"}
                      >
                        {p.isOpen ? (
                          <>
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                            <span>Đóng Kỳ</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-4 h-4 text-slate-400" />
                            <span>Mở Kỳ</span>
                          </>
                        )}
                      </button>

                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => handleStartEdit(p)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                        title="Chỉnh sửa tên và hạn nộp của kỳ"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(p.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 transition-colors"
                        title="Xóa kỳ đánh giá này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div>
            Kỳ đã ĐÓNG sẽ không nhận thêm lượt tự đánh giá mới từ nhân viên.
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

      {/* Edit Period Dialog */}
      {editingPeriod && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-sm">
                Sửa Kỳ Đánh Giá: {editingPeriod.monthYear}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPeriod(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Tên Kỳ Đánh Giá
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Ngày Bắt Đầu
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Hạn Nộp (Deadline)
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPeriod(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-500/20 transition-colors"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Xóa Kỳ Đánh Giá Này?
            </h3>
            <p className="text-xs text-slate-600 mt-2">
              Bạn có chắc chắn muốn xóa kỳ đánh giá này khỏi hệ thống? Các bản ghi đánh giá đã chấm trong kỳ này vẫn sẽ được lưu trong lịch sử.
            </p>
            <div className="flex items-center justify-center gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-colors"
              >
                Xác Nhận Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
