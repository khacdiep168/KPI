"use client";

import React, { useState } from "react";
import { User, EvaluationRecord, Classification } from "@/types";
import { 
  getEvaluations, 
  updateEvaluation, 
  getDepartments, 
  getManagedDepartments, 
  getAllPeriods,
  exportEvaluationsToExcel
} from "@/lib/storage";
import { getBadgeColor, getStatusBadge } from "@/lib/utils";
import { calculateClassification } from "@/data/criteria";
import { 
  Users2, 
  Search, 
  Filter, 
  CheckCircle, 
  Edit3, 
  Award, 
  MessageSquare,
  AlertCircle,
  ShieldCheck,
  Building,
  Check,
  Calendar,
  FileSpreadsheet,
  Printer
} from "lucide-react";
import IndividualEvaluationPrintModal from "./IndividualEvaluationPrintModal";

interface ManagerReviewProps {
  currentUser: User;
}

export default function ManagerReview({ currentUser }: ManagerReviewProps) {
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(getEvaluations());
  const allDepartments = getDepartments();
  const managedScope = getManagedDepartments(currentUser);
  const availablePeriods = getAllPeriods();

  // Departments this manager is permitted to view
  const permittedDepts = managedScope === "ALL" ? allDepartments : managedScope;

  // Filter states
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [printRecord, setPrintRecord] = useState<EvaluationRecord | null>(null);

  // Editing evaluation state
  const [editingRecord, setEditingRecord] = useState<EvaluationRecord | null>(null);
  const [mgrScore, setMgrScore] = useState<number>(80);
  const [mgrFeedback, setMgrFeedback] = useState<string>("");

  const filteredList = evaluations.filter((item) => {
    // 0. Period Filter
    if (selectedPeriod !== "ALL" && item.period !== selectedPeriod) {
      return false;
    }
    // 1. Strict Department Access Control
    if (managedScope !== "ALL") {
      const normalizedScope = managedScope.map((d) => d.trim().toUpperCase());
      if (!normalizedScope.includes((item.targetDept || "").trim().toUpperCase())) {
        return false;
      }
    }
    // 2. Selected Dept filter
    if (selectedDept !== "ALL" && (item.targetDept || "").trim().toUpperCase() !== selectedDept.trim().toUpperCase()) {
      return false;
    }
    // 3. Status filter
    if (statusFilter !== "ALL" && item.status !== statusFilter) {
      return false;
    }
    // 4. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.targetName.toLowerCase().includes(q);
      const matchManv = item.targetManv.toLowerCase().includes(q);
      if (!matchName && !matchManv) return false;
    }
    return true;
  });

  const handleOpenEdit = (rec: EvaluationRecord) => {
    setEditingRecord(rec);
    setMgrScore(rec.managerScore ?? rec.selfTotalScore);
    setMgrFeedback(rec.managerFeedback ?? "");
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const classification = calculateClassification(mgrScore);
    const updated = updateEvaluation(editingRecord.id, {
      managerScore: mgrScore,
      managerClassification: classification,
      managerFeedback: mgrFeedback.trim(),
      managerManv: currentUser.manv,
      managerReviewedAt: new Date().toISOString(),
      status: "MANAGER_REVIEWED",
    });

    if (updated) {
      setEvaluations(getEvaluations());
      setEditingRecord(null);
    }
  };

  // Scope label text for manager badge
  const getScopeDescription = () => {
    if (managedScope === "ALL") {
      return "Toàn bộ công ty (Tất cả bộ phận)";
    }
    return managedScope.join(", ");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-800 uppercase tracking-wider">
              {currentUser.dept} • {currentUser.title}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
              Phạm vi quản lý: <strong className="text-blue-900">{getScopeDescription()}</strong>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Thẩm Định & Chấm Điểm Quản Lý
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Chỉ hiển thị và chấm điểm cho các nhân viên thuộc phạm vi phân quyền quản lý của bạn.
          </p>
        </div>

        <div className="flex items-center gap-2.5">

          <button
            onClick={() => {
              const fname = `Bao_Cao_Duyet_KPI_${selectedDept !== "ALL" ? selectedDept : "Bo_Phan"}_${selectedPeriod !== "ALL" ? selectedPeriod : "Tat_Ca"}.xlsx`;
              exportEvaluationsToExcel(filteredList, fname);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Xuất danh sách đánh giá của bộ phận ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          <span className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 font-semibold text-xs border border-blue-100">
            {filteredList.length} nhân viên hiển thị
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã NV..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Period Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            >
              <option value="ALL">Tất cả kỳ đánh giá</option>
              {availablePeriods.map((p) => (
                <option key={p.monthYear} value={p.monthYear}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter (restricted to permitted departments) */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">
                {managedScope === "ALL" ? "Tất cả bộ phận" : "Tất cả bộ phận phụ trách"}
              </option>
              {permittedDepts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="SUBMITTED">Chờ Quản Lý Chấm</option>
            <option value="MANAGER_REVIEWED">Quản Lý Đã Chấm</option>
            <option value="APPROVED">Hội Đồng Đã Phê Duyệt</option>
          </select>
        </div>
      </div>

      {/* Evaluations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Không có bản ghi đánh giá nào phù hợp với bộ lọc trong phạm vi quản lý của bạn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Mã NV</th>
                  <th className="py-3.5 px-4">Họ và Tên</th>
                  <th className="py-3.5 px-4">Bộ Phận</th>
                  <th className="py-3.5 px-4 text-center">Tự Chấm</th>
                  <th className="py-3.5 px-4 text-center">Điểm Quản Lý</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((rec) => {
                  const statusInfo = getStatusBadge(rec.status);
                  const isManagerReviewed = rec.managerScore !== undefined && rec.managerScore !== null;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {rec.targetManv}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-900">{rec.targetName}</p>
                          {rec.evaluationType === "MANAGER" || rec.scores.q8 === undefined ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              👔 Quản lý
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              👤 NV
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">Kỳ {rec.period}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {rec.targetDept}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-extrabold text-slate-900 text-sm">{rec.selfTotalScore}</span>
                        <span className={`block mt-0.5 text-[10px] font-bold ${getBadgeColor(rec.selfClassification)}`}>
                          {rec.selfClassification}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isManagerReviewed ? (
                          <div>
                            <span className="font-black text-blue-700 text-sm">{rec.managerScore}</span>
                            <span className={`block mt-0.5 text-[10px] font-bold ${getBadgeColor(rec.managerClassification)}`}>
                              {rec.managerClassification}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Chưa chấm</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[10px] border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPrintRecord(rec)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer"
                            title="In phiếu đánh giá cá nhân (A4 / PDF)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(rec)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                              isManagerReviewed
                                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                                : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>{isManagerReviewed ? "Sửa Điểm" : "Chấm Điểm"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manager Scoring Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Quản Lý Chấm Điểm KPI
                </h3>
                <p className="text-xs text-slate-500">
                  Nhân viên: <strong className="text-slate-800">{editingRecord.targetName}</strong> ({editingRecord.targetManv} - {editingRecord.targetDept})
                </p>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Self score summary */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Nhân viên tự chấm:</span>
                <p className="text-2xl font-black text-slate-900">{editingRecord.selfTotalScore}đ</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getBadgeColor(editingRecord.selfClassification)}`}>
                Xếp loại: {editingRecord.selfClassification}
              </span>
            </div>

            {editingRecord.selfFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                <span className="font-semibold not-italic block mb-0.5 text-slate-700">Ý kiến của nhân viên:</span>
                "{editingRecord.selfFeedback}"
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Điểm Quản Lý Đánh Giá (0 - 100 điểm)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={mgrScore}
                    onChange={(e) => setMgrScore(Number(e.target.value))}
                    required
                    className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 block">Xếp loại quản lý:</span>
                    <span className={`inline-block mt-0.5 px-3 py-1 rounded-lg text-xs font-bold border ${getBadgeColor(calculateClassification(mgrScore))}`}>
                      {calculateClassification(mgrScore)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ý Kiến & Nhận Xét Của Quản Lý
                </label>
                <textarea
                  rows={3}
                  value={mgrFeedback}
                  onChange={(e) => setMgrFeedback(e.target.value)}
                  placeholder="Ghi nhận ưu điểm, hạn chế và chỉ đạo định hướng cải thiện..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md shadow-blue-500/20"
                >
                  Lưu Đánh Giá Quản Lý
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Individual Evaluation Print Modal */}
      <IndividualEvaluationPrintModal
        isOpen={printRecord !== null}
        onClose={() => setPrintRecord(null)}
        evaluation={printRecord}
      />
    </div>
  );
}
