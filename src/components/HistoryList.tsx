"use client";

import React, { useState } from "react";
import { User, EvaluationRecord } from "@/types";
import { getEvaluations, getAllPeriods, exportEvaluationsToExcel, isEvaluationInCurrentMonth } from "@/lib/storage";
import { getBadgeColor, getStatusBadge } from "@/lib/utils";
import { KPI_CRITERIA, KPI_MANAGER_CRITERIA } from "@/data/criteria";
import { 
  FileText, 
  Calendar, 
  ChevronRight, 
  Eye, 
  Clock, 
  CheckCircle, 
  Award, 
  UserCircle,
  MessageSquare,
  ShieldCheck,
  Edit,
  Search,
  Filter, 
  FileSpreadsheet,
  Lock,
  Printer
} from "lucide-react";
import IndividualEvaluationPrintModal from "./IndividualEvaluationPrintModal";

interface HistoryListProps {
  currentUser: User;
  onEditEvaluation?: (targetManv: string, period?: string) => void;
}

export default function HistoryList({ currentUser, onEditEvaluation }: HistoryListProps) {
  const allEvaluations = getEvaluations();
  const availablePeriods = getAllPeriods();

  // Filter evaluations where currentUser is either evaluator or target
  const userEvaluations = allEvaluations.filter(
    (e) => e.evaluatorManv === currentUser.manv || e.targetManv === currentUser.manv
  );

  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRecord, setSelectedRecord] = useState<EvaluationRecord | null>(null);
  const [printRecord, setPrintRecord] = useState<EvaluationRecord | null>(null);

  const filteredList = userEvaluations.filter((e) => {
    if (selectedPeriod !== "ALL" && e.period !== selectedPeriod) return false;
    if (typeFilter === "SELF" && e.targetManv !== currentUser.manv) return false;
    if (typeFilter === "COLLEAGUE" && e.targetManv === currentUser.manv) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = e.targetName.toLowerCase().includes(q);
      const matchManv = e.targetManv.toLowerCase().includes(q);
      if (!matchName && !matchManv) return false;
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Lịch Sử Đánh Giá KPI Cá Nhân
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Theo dõi điểm số tự chấm, đánh giá của Quản lý bộ phận và phê duyệt từ Ban Giám Đốc.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const fname = `Lich_Su_KPI_${currentUser.manv}_${selectedPeriod !== "ALL" ? selectedPeriod : "Tat_Ca"}.xlsx`;
              exportEvaluationsToExcel(filteredList, fname);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Xuất lịch sử đánh giá cá nhân ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (.xlsx)</span>
          </button>
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
            {filteredList.length} / {userEvaluations.length} phiếu hiển thị
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
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

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-700"
          >
            <option value="ALL">Tất cả đối tượng</option>
            <option value="SELF">Bản thân tự đánh giá</option>
            <option value="COLLEAGUE">Đánh giá cho đồng nghiệp</option>
          </select>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy bản ghi phù hợp</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Không có kết quả nào phù hợp với bộ lọc kỳ đánh giá hoặc từ khóa tìm kiếm đã chọn.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredList.map((item) => {
            const statusInfo = getStatusBadge(item.status);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900">
                        Kỳ {item.period}
                      </span>
                      {item.evaluationType === "MANAGER" || item.scores.q8 === undefined ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          👔 Cấp Quản Lý
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                          👤 Nhân Viên
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Đối tượng: <strong className="text-slate-900">{item.targetName}</strong> ({item.targetDept})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ngày nộp: {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* Scores Summary: 3 Tiers */}
                <div className="grid grid-cols-3 gap-2 sm:gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  {/* Tự chấm */}
                  <div className="px-2">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Tự Chấm</p>
                    <p className="text-base font-extrabold text-slate-900">{item.selfTotalScore}</p>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${getBadgeColor(item.selfClassification)}`}>
                      {item.selfClassification}
                    </span>
                  </div>

                  {/* Quản lý */}
                  <div className="px-2 border-x border-slate-200">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Quản Lý</p>
                    <p className="text-base font-extrabold text-blue-700">
                      {item.managerScore !== undefined && item.managerScore !== null ? item.managerScore : "--"}
                    </p>
                    {item.managerClassification ? (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${getBadgeColor(item.managerClassification)}`}>
                        {item.managerClassification}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Chờ duyệt</span>
                    )}
                  </div>

                  {/* Hội đồng */}
                  <div className="px-2">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Hội Đồng</p>
                    <p className="text-base font-extrabold text-purple-700">
                      {item.councilScore !== undefined && item.councilScore !== null ? item.councilScore : "--"}
                    </p>
                    {item.councilClassification ? (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${getBadgeColor(item.councilClassification)}`}>
                        {item.councilClassification}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Chờ duyệt</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {item.evaluatorManv === currentUser.manv &&
                    (item.managerScore === null || item.managerScore === undefined) && (
                      isEvaluationInCurrentMonth(item.period) ? (
                        <button
                          onClick={() => onEditEvaluation && onEditEvaluation(item.targetManv, item.period)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                          title="Trong tháng: Quản lý chưa chấm, bấm để sửa lại đánh giá"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Sửa Đánh Giá</span>
                        </button>
                      ) : (
                        <button
                          disabled={true}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs font-medium cursor-not-allowed border border-slate-200/80 opacity-70"
                          title={`Kỳ ${item.period} đã qua tháng đánh giá. Không thể chỉnh sửa.`}
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Sửa Đánh Giá</span>
                        </button>
                      )
                    )}

                  <button
                    onClick={() => setPrintRecord(item)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors shrink-0 cursor-pointer"
                    title="In hoặc xuất file PDF phiếu đánh giá cá nhân chuẩn A4"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">In Phiếu (A4)</span>
                  </button>

                  <button
                    onClick={() => setSelectedRecord(item)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Evaluation Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Chi Tiết Phiếu Đánh Giá KPI
                </h3>
                <p className="text-xs text-slate-500">
                  Kỳ {selectedRecord.period} - Đối tượng: {selectedRecord.targetName} ({selectedRecord.targetDept})
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Score Comparison Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500">Tự Đánh Giá</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{selectedRecord.selfTotalScore}</p>
                <div className="mt-2">
                  <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getBadgeColor(selectedRecord.selfClassification)}`}>
                    {selectedRecord.selfClassification}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-200">
                <span className="text-[11px] font-semibold text-blue-700">Quản Lý Thẩm Định</span>
                <p className="text-2xl font-black text-blue-900 mt-1">
                  {selectedRecord.managerScore ?? "--"}
                </p>
                <div className="mt-2">
                  {selectedRecord.managerClassification ? (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getBadgeColor(selectedRecord.managerClassification)}`}>
                      {selectedRecord.managerClassification}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa chấm</span>
                  )}
                </div>
                {selectedRecord.managerFeedback && (
                  <p className="text-xs text-blue-900/80 mt-2 italic bg-blue-100/50 p-2 rounded-lg">
                    "{selectedRecord.managerFeedback}"
                  </p>
                )}
              </div>

              <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-200">
                <span className="text-[11px] font-semibold text-purple-700">Hội Đồng Phê Duyệt</span>
                <p className="text-2xl font-black text-purple-900 mt-1">
                  {selectedRecord.councilScore ?? "--"}
                </p>
                <div className="mt-2">
                  {selectedRecord.councilClassification ? (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${getBadgeColor(selectedRecord.councilClassification)}`}>
                      {selectedRecord.councilClassification}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Chưa duyệt</span>
                  )}
                </div>
                {selectedRecord.councilFeedback && (
                  <p className="text-xs text-purple-900/80 mt-2 italic bg-purple-100/50 p-2 rounded-lg">
                    "{selectedRecord.councilFeedback}"
                  </p>
                )}
              </div>
            </div>

            {/* Criteria Breakdown Table */}
            {(() => {
              const isManagerRec =
                selectedRecord.evaluationType === "MANAGER" ||
                (selectedRecord.scores.q8 === undefined && selectedRecord.evaluationType !== "STAFF");
              const criteriaList = isManagerRec ? KPI_MANAGER_CRITERIA : KPI_CRITERIA;

              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Chi tiết {criteriaList.length} tiêu chí đã chấm
                    </h4>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {isManagerRec ? "👔 Cấp Quản Lý (QĐ 11/QĐ-TKV)" : "👤 Nhân Viên (10 Tiêu Chí)"}
                    </span>
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {criteriaList.map((crit) => {
                      const scoreVal = selectedRecord.scores[crit.id as keyof typeof selectedRecord.scores];
                      return (
                        <div key={crit.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <span className="font-semibold text-slate-800">{crit.title}</span>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{crit.description}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-slate-900 text-sm">{scoreVal}đ</span>
                            <span className="text-slate-400 text-[11px]">/ {crit.maxScore}đ</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}

            {/* Self Feedback */}
            {selectedRecord.selfFeedback && (
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1">Ý kiến cá nhân người đánh giá:</span>
                <p className="text-slate-600 italic">{selectedRecord.selfFeedback}</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setPrintRecord(selectedRecord)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Đánh Giá (A4 / PDF)</span>
              </button>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Đóng
              </button>
            </div>
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
