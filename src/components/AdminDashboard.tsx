"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { User, EvaluationRecord } from "@/types";
import { getEvaluations, updateEvaluation, getDepartments, exportEvaluationsToExcel, getUsers, getAllPeriods } from "@/lib/storage";
import { getBadgeColor, getStatusBadge } from "@/lib/utils";
import { calculateClassification } from "@/data/criteria";
import { getCompanyConfig, saveCompanyConfig, CompanyConfig, DEFAULT_COMPANY_CONFIG } from "@/lib/companyConfig";
import { 
  LayoutDashboard, 
  Download, 
  CheckCheck, 
  Search, 
  Filter, 
  Award, 
  Users, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  Settings,
  Building2,
  Upload,
  RotateCcw,
  Check,
  X,
  Image as ImageIcon
} from "lucide-react";

interface AdminDashboardProps {
  currentUser: User;
}

export default function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const [mounted, setMounted] = useState(false);
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>(getEvaluations());
  const allUsers = getUsers();
  const departments = getDepartments();
  const availablePeriods = getAllPeriods();

  // Filters
  const [selectedPeriod, setSelectedPeriod] = useState<string>("ALL");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Council editing modal
  const [councilRecord, setCouncilRecord] = useState<EvaluationRecord | null>(null);
  const [councilScore, setCouncilScore] = useState<number>(85);
  const [councilFeedback, setCouncilFeedback] = useState<string>("");

  // Company Config modal
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [companyForm, setCompanyForm] = useState<CompanyConfig>(getCompanyConfig());
  const [companySaveSuccess, setCompanySaveSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenCompanySettings = () => {
    setCompanyForm(getCompanyConfig());
    setCompanySaveSuccess(false);
    setShowCompanyModal(true);
  };

  const handleSaveCompanyConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyConfig(companyForm);
    setCompanySaveSuccess(true);
    setTimeout(() => {
      setCompanySaveSuccess(false);
      setShowCompanyModal(false);
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

  // Filtered records for period stats
  const periodEvaluations = selectedPeriod === "ALL" 
    ? evaluations 
    : evaluations.filter((e) => e.period === selectedPeriod);

  // Statistics
  const totalEmployees = allUsers.length;
  const submittedCount = periodEvaluations.length;
  const managerReviewedCount = periodEvaluations.filter((e) => e.status === "MANAGER_REVIEWED" || e.status === "APPROVED").length;
  const approvedCount = periodEvaluations.filter((e) => e.status === "APPROVED").length;

  // Breakdown of final/current classifications
  const statsClassification = periodEvaluations.reduce((acc, cur) => {
    const cls = cur.councilClassification || cur.managerClassification || cur.selfClassification;
    acc[cls] = (acc[cls] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const filteredList = evaluations.filter((item) => {
    if (selectedPeriod !== "ALL" && item.period !== selectedPeriod) return false;
    if (selectedDept !== "ALL" && item.targetDept !== selectedDept) return false;
    if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.targetName.toLowerCase().includes(q);
      const matchManv = item.targetManv.toLowerCase().includes(q);
      if (!matchName && !matchManv) return false;
    }
    return true;
  });

  const handleOpenCouncilApprove = (rec: EvaluationRecord) => {
    setCouncilRecord(rec);
    setCouncilScore(rec.councilScore ?? rec.managerScore ?? rec.selfTotalScore);
    setCouncilFeedback(rec.councilFeedback ?? "");
  };

  const handleSaveCouncilApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!councilRecord) return;

    const classification = calculateClassification(councilScore);
    const updated = updateEvaluation(councilRecord.id, {
      councilScore: councilScore,
      councilClassification: classification,
      councilFeedback: councilFeedback.trim(),
      councilApprovedAt: new Date().toISOString(),
      status: "APPROVED",
    });

    if (updated) {
      setEvaluations(getEvaluations());
      setCouncilRecord(null);
    }
  };

  const handleBatchApprove = () => {
    if (!confirm("Bạn có chắc chắn muốn phê duyệt tất cả các phiếu đã qua bước Quản lý đánh giá?")) return;
    evaluations.forEach((rec) => {
      if (rec.status === "MANAGER_REVIEWED") {
        updateEvaluation(rec.id, {
          councilScore: rec.managerScore ?? rec.selfTotalScore,
          councilClassification: rec.managerClassification ?? rec.selfClassification,
          councilFeedback: "Hội đồng nhất trí thông qua đánh giá của Quản lý.",
          councilApprovedAt: new Date().toISOString(),
          status: "APPROVED",
        });
      }
    });
    setEvaluations(getEvaluations());
    alert("Đã phê duyệt hàng loạt thành công!");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
              Hội Đồng & Ban Giám Đốc
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Bảng Điều Khiển Quản Trị & Phê Duyệt KPI Toàn Công Ty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tổng quan tỷ lệ hoàn thành, thống kê xếp loại và phê duyệt kết quả cuối cùng.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCompanySettings}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition-colors shadow-xs"
            title="Cài đặt tên công ty, đơn vị chủ quản, địa chỉ và logo"
          >
            <Settings className="w-4 h-4 text-amber-400" />
            <span>Cài Đặt Doanh Nghiệp</span>
          </button>

          <button
            onClick={() =>
              exportEvaluationsToExcel(
                filteredList,
                selectedPeriod !== "ALL"
                  ? `Bao_Cao_KPI_TKV_Ky_${selectedPeriod}.xlsx`
                  : `Bao_Cao_KPI_TKV_Tat_Ca_${new Date().toISOString().slice(0, 10)}.xlsx`
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Xuất file Excel (.xlsx) chuẩn báo cáo KQDGNV"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Báo Cáo Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleBatchApprove}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Duyệt tất cả bản ghi đã được Quản lý chấm"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Duyệt Hàng Loạt</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng Nhân Sự</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalEmployees}</p>
          <p className="text-[11px] text-slate-400 mt-1">11 bộ phận công ty</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đã Nộp Đánh Giá</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{submittedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            Đạt {Math.round((submittedCount / totalEmployees) * 100)}% toàn công ty
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Quản Lý Đã Chấm</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{managerReviewedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Sẵn sàng chờ HĐ duyệt</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">HĐ Đã Phê Duyệt</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{approvedCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Kết quả chính thức</p>
        </div>
      </div>

      {/* Classification Breakdown Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Phân Bổ Xếp Loại KPI Toàn Công Ty
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-800">Giỏi (≥80đ)</p>
              <p className="text-xl font-black text-emerald-700 mt-0.5">{statsClassification["Giỏi"] || 0}</p>
            </div>
            <Award className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-800">Khá (65-79đ)</p>
              <p className="text-xl font-black text-blue-700 mt-0.5">{statsClassification["Khá"] || 0}</p>
            </div>
            <Award className="w-5 h-5 text-blue-500" />
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-800">Trung Bình (50-64đ)</p>
              <p className="text-xl font-black text-amber-700 mt-0.5">{statsClassification["Trung Bình"] || 0}</p>
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-rose-800">Yếu (&lt;50đ)</p>
              <p className="text-xl font-black text-rose-700 mt-0.5">{statsClassification["Yếu"] || 0}</p>
            </div>
            <Award className="w-5 h-5 text-rose-500" />
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm nhân viên theo tên hoặc mã NV..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Period Filter */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-700"
              >
                <option value="ALL">Tất cả kỳ đánh giá</option>
                {availablePeriods.map((p) => (
                  <option key={p.monthYear} value={p.monthYear}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
              >
                <option value="ALL">Tất cả bộ phận</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="SUBMITTED">Chờ Quản Lý Chấm</option>
              <option value="MANAGER_REVIEWED">Chờ HĐ Phê Duyệt</option>
              <option value="APPROVED">Đã Phê Duyệt Xong</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Mã NV</th>
                <th className="py-3.5 px-4">Họ và Tên</th>
                <th className="py-3.5 px-4">Bộ Phận</th>
                <th className="py-3.5 px-4 text-center">Tự Chấm</th>
                <th className="py-3.5 px-4 text-center">Quản Lý</th>
                <th className="py-3.5 px-4 text-center">Hội Đồng</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4 text-right">Phê Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((rec) => {
                const statusInfo = getStatusBadge(rec.status);
                const isApproved = rec.status === "APPROVED";

                return (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                      {rec.targetManv}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{rec.targetName}</p>
                      <p className="text-[11px] text-slate-400">Kỳ {rec.period}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {rec.targetDept}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-black text-slate-900 text-sm">{rec.selfTotalScore}</span>
                      <span className={`block mt-0.5 text-[10px] font-bold ${getBadgeColor(rec.selfClassification)}`}>
                        {rec.selfClassification}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {rec.managerScore !== undefined && rec.managerScore !== null ? (
                        <div>
                          <span className="font-black text-blue-700 text-sm">{rec.managerScore}</span>
                          <span className={`block mt-0.5 text-[10px] font-bold ${getBadgeColor(rec.managerClassification)}`}>
                            {rec.managerClassification}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {rec.councilScore !== undefined && rec.councilScore !== null ? (
                        <div>
                          <span className="font-black text-purple-700 text-sm">{rec.councilScore}</span>
                          <span className={`block mt-0.5 text-[10px] font-bold ${getBadgeColor(rec.councilClassification)}`}>
                            {rec.councilClassification}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Chưa chốt</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-md font-semibold text-[10px] border ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenCouncilApprove(rec)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                          isApproved
                            ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>{isApproved ? "Sửa Điểm HĐ" : "Chốt Điểm HĐ"}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Council Approval Modal (Rendered in Portal to avoid layering bugs) */}
      {mounted && councilRecord && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Hội Đồng & BGĐ Phê Duyệt Kết Quả
                </h3>
                <p className="text-xs text-slate-500">
                  Nhân viên: <strong className="text-slate-800">{councilRecord.targetName}</strong> ({councilRecord.targetManv} - {councilRecord.targetDept})
                </p>
              </div>
              <button
                onClick={() => setCouncilRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Comparison banner */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Tự chấm</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">{councilRecord.selfTotalScore}đ</p>
                <span className={`inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold ${getBadgeColor(councilRecord.selfClassification)}`}>
                  {councilRecord.selfClassification}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                <span className="text-[10px] text-blue-700 font-semibold uppercase">Quản lý chấm</span>
                <p className="text-xl font-black text-blue-800 mt-0.5">
                  {councilRecord.managerScore ?? "--"}đ
                </p>
                <span className={`inline-block mt-1 px-2 py-0.2 rounded text-[10px] font-bold ${getBadgeColor(councilRecord.managerClassification)}`}>
                  {councilRecord.managerClassification ?? "Chưa chấm"}
                </span>
              </div>
            </div>

            {councilRecord.managerFeedback && (
              <div className="mb-4 p-3 rounded-xl bg-blue-50/50 border border-blue-200 text-xs text-blue-900">
                <strong className="block mb-0.5">Ý kiến Quản lý bộ phận:</strong>
                "{councilRecord.managerFeedback}"
              </div>
            )}

            <form onSubmit={handleSaveCouncilApprove} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Điểm Phê Duyệt Hội Đồng (0 - 100 điểm)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={councilScore}
                    onChange={(e) => setCouncilScore(Number(e.target.value))}
                    required
                    className="w-32 px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <span className="text-xs text-slate-500 block">Xếp loại chính thức:</span>
                    <span className={`inline-block mt-0.5 px-3 py-1 rounded-lg text-xs font-bold border ${getBadgeColor(calculateClassification(councilScore))}`}>
                      {calculateClassification(councilScore)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Ý Kiến Phê Duyệt Của Hội Đồng / BGĐ
                </label>
                <textarea
                  rows={3}
                  value={councilFeedback}
                  onChange={(e) => setCouncilFeedback(e.target.value)}
                  placeholder="Nhận xét phê duyệt chính thức làm căn cứ khen thưởng, kỷ luật..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setCouncilRecord(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-md shadow-purple-500/20"
                >
                  Chốt & Phê Duyệt
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Company Settings Modal (Rendered in Portal to avoid layering bugs) */}
      {mounted && showCompanyModal && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Cài Đặt Thông Tin Doanh Nghiệp
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cấu hình logo, tên công ty, địa chỉ và tiêu đề xuất báo cáo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCompanyModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold transition-colors"
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
                    onClick={() => setShowCompanyModal(false)}
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
      )}
    </div>
  );
}
