"use client";

import React, { useState, useMemo } from "react";
import { User, EvaluationRecord } from "@/types";
import { 
  getUsers, 
  getEvaluations, 
  getManagedDepartments, 
  canUserManageAll,
  exportAnnualReportToExcel,
  AnnualReportData
} from "@/lib/storage";
import { calculateClassification } from "@/data/criteria";
import { getBadgeColor, getStatusBadge } from "@/lib/utils";
import { 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  User as UserIcon, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Search,
  ChevronRight,
  Sparkles,
  BarChart3,
  LayoutGrid,
  Table
} from "lucide-react";

interface AnnualReportProps {
  currentUser: User;
}

export default function AnnualReport({ currentUser }: AnnualReportProps) {
  const allUsers = getUsers();
  const allEvaluations = getEvaluations();

  // Scope of employees current user can view
  const managedDepts = useMemo(() => getManagedDepartments(currentUser), [currentUser]);
  const isSuperManager = useMemo(() => canUserManageAll(currentUser), [currentUser]);

  const viewableUsers = useMemo(() => {
    if (isSuperManager || currentUser.role === "Admin") {
      return allUsers;
    }
    if (currentUser.role === "Manager" || (currentUser.title && currentUser.title.toUpperCase().includes("QUẢN LÝ"))) {
      return allUsers.filter(
        (u) => u.manv === currentUser.manv || managedDepts.includes(u.dept)
      );
    }
    // Regular employee can view themselves
    return allUsers.filter((u) => u.manv === currentUser.manv);
  }, [allUsers, currentUser, isSuperManager, managedDepts]);

  // Selected employee
  const [selectedManv, setSelectedManv] = useState<string>(currentUser.manv);
  const selectedUser = useMemo(() => {
    return viewableUsers.find((u) => u.manv === selectedManv) || viewableUsers[0] || currentUser;
  }, [viewableUsers, selectedManv, currentUser]);

  // Search employee query
  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState("");

  // Available years from evaluations data
  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>();
    // Default current/recent years
    yearsSet.add(2026);
    yearsSet.add(2025);
    allEvaluations.forEach((e) => {
      if (e.period) {
        const parts = e.period.split(/[-/]/);
        if (parts.length === 2) {
          const y = parseInt(parts[1], 10);
          if (!isNaN(y) && y > 2000) yearsSet.add(y);
        }
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [allEvaluations]);

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // Compile 12 months data for selected employee & year
  const annualData = useMemo(() => {
    const monthsData: AnnualReportData["monthsData"] = [];

    // Filter evaluations targeting this employee in the selected year
    const empEvals = allEvaluations.filter((e) => {
      const matchTarget = 
        e.targetManv?.toUpperCase() === selectedUser.manv.toUpperCase() ||
        (e.evaluatorManv?.toUpperCase() === selectedUser.manv.toUpperCase() && 
         (!e.targetManv || e.targetManv === e.evaluatorManv));
      
      if (!matchTarget) return false;
      const parts = e.period?.split(/[-/]/);
      if (!parts || parts.length !== 2) return false;
      const y = parseInt(parts[1], 10);
      return y === selectedYear;
    });

    for (let m = 1; m <= 12; m++) {
      const monthStr = m < 10 ? `0${m}` : `${m}`;
      const periodStr = `${monthStr}-${selectedYear}`;

      // Find record for this month
      const rec = empEvals.find((e) => {
        const parts = e.period?.split(/[-/]/);
        if (!parts || parts.length !== 2) return false;
        return parseInt(parts[0], 10) === m;
      });

      if (rec) {
        const selfScore = rec.selfTotalScore ?? null;
        const selfClass = rec.selfClassification || (selfScore !== null ? calculateClassification(selfScore) : null);
        const managerScore = rec.managerScore ?? null;
        const managerClass = rec.managerClassification || (managerScore !== null ? calculateClassification(managerScore) : null);
        const councilScore = rec.councilScore ?? null;
        const councilClass = rec.councilClassification || (councilScore !== null ? calculateClassification(councilScore) : null);
        const finalScore = councilScore ?? managerScore ?? selfScore;
        const finalClass = finalScore !== null ? calculateClassification(finalScore) : null;
        const feedback = rec.councilFeedback || rec.managerFeedback || rec.selfFeedback || "";

        monthsData.push({
          month: m,
          period: periodStr,
          hasData: true,
          selfScore,
          selfClass,
          managerScore,
          managerClass,
          councilScore,
          councilClass,
          finalScore,
          finalClass,
          feedback,
        });
      } else {
        monthsData.push({
          month: m,
          period: periodStr,
          hasData: false,
          selfScore: null,
          selfClass: null,
          managerScore: null,
          managerClass: null,
          councilScore: null,
          councilClass: null,
          finalScore: null,
          finalClass: null,
          feedback: "",
        });
      }
    }

    // Calculate annual summaries
    const evaluatedMonths = monthsData.filter((m) => m.hasData);
    const evaluatedCount = evaluatedMonths.length;

    // 1. Avg Self
    const selfMonths = evaluatedMonths.filter((m) => m.selfScore !== null);
    const avgSelf = selfMonths.length > 0 
      ? selfMonths.reduce((sum, m) => sum + (m.selfScore || 0), 0) / selfMonths.length
      : null;
    const classSelf = avgSelf !== null ? calculateClassification(avgSelf) : null;

    // 2. Avg Manager
    const mgrMonths = evaluatedMonths.filter((m) => m.managerScore !== null);
    const avgManager = mgrMonths.length > 0
      ? mgrMonths.reduce((sum, m) => sum + (m.managerScore || 0), 0) / mgrMonths.length
      : null;
    const classManager = avgManager !== null ? calculateClassification(avgManager) : null;

    // 3. Avg Council
    const councilMonths = evaluatedMonths.filter((m) => m.councilScore !== null);
    const avgCouncil = councilMonths.length > 0
      ? councilMonths.reduce((sum, m) => sum + (m.councilScore || 0), 0) / councilMonths.length
      : null;
    const classCouncil = avgCouncil !== null ? calculateClassification(avgCouncil) : null;

    // 4. Avg Final (Chốt KPI)
    const finalMonths = evaluatedMonths.filter((m) => m.finalScore !== null);
    const avgFinal = finalMonths.length > 0
      ? finalMonths.reduce((sum, m) => sum + (m.finalScore || 0), 0) / finalMonths.length
      : null;
    const classFinal = avgFinal !== null ? calculateClassification(avgFinal) : null;

    return {
      employee: selectedUser,
      year: selectedYear,
      monthsData,
      summary: {
        avgSelf,
        classSelf,
        avgManager,
        classManager,
        avgCouncil,
        classCouncil,
        avgFinal,
        classFinal,
        evaluatedCount,
      },
    };
  }, [allEvaluations, selectedUser, selectedYear]);

  // Export Excel handler
  const handleExportExcel = () => {
    exportAnnualReportToExcel(annualData);
  };

  // Print / Save PDF handler
  const handlePrintPDF = () => {
    window.print();
  };

  // Filter user list for dropdown
  const filteredUsers = useMemo(() => {
    if (!searchEmployeeQuery.trim()) return viewableUsers;
    const q = searchEmployeeQuery.toLowerCase();
    return viewableUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.manv.toLowerCase().includes(q) ||
        u.dept.toLowerCase().includes(q)
    );
  }, [viewableUsers, searchEmployeeQuery]);

  return (
    <div className="space-y-6">
      {/* Print CSS styles to ensure clean A4 output without app headers/buttons */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
          }
          header, footer, nav, .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
          }
          .printable-report {
            display: block !important;
            padding: 10mm 15mm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      {/* Control Bar (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Báo Cáo KPI Tổng Hợp Theo Năm (Kỳ 01 - Kỳ 12)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Tính điểm trung bình tự chấm, quản lý, hội đồng và xếp loại toàn diện cho nhân viên.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="Xuất bảng báo cáo năm sang file Excel (.xlsx) chuẩn"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất File Excel (.xlsx)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
            title="In hoặc lưu thành file PDF chuẩn khổ giấy A4"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo / Lưu PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Selector Bar (Hidden when printing) */}
      <div className="no-print bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Employee Selector */}
        {viewableUsers.length > 1 ? (
          <div className="flex-1 w-full">
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Chọn nhân viên xem báo cáo:
            </label>
            <div className="relative">
              <select
                value={selectedManv}
                onChange={(e) => setSelectedManv(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
              >
                {filteredUsers.map((u) => (
                  <option key={u.manv} value={u.manv}>
                    [{u.manv}] {u.name} — {u.dept} ({u.title || "Nhân viên"})
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="flex-1 w-full">
            <span className="block text-xs font-semibold text-slate-600 mb-1">Nhân viên:</span>
            <div className="px-3.5 py-2 text-xs font-bold text-slate-800 bg-slate-100 rounded-xl">
              [{selectedUser.manv}] {selectedUser.name} — {selectedUser.dept}
            </div>
          </div>
        )}

        {/* Year Selector */}
        <div className="w-full sm:w-44">
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Năm đánh giá:
          </label>
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main KPI Summary Metrics Cards (Visible on screen) */}
      <div className="no-print grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Self score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tự Chấm TB</span>
            <UserIcon className="w-4 h-4 text-slate-400" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">
              {annualData.summary.avgSelf !== null 
                ? annualData.summary.avgSelf.toFixed(1) 
                : "--"}
            </div>
            <div className="mt-1">
              {annualData.summary.classSelf ? (
                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeColor(annualData.summary.classSelf)}`}>
                  {annualData.summary.classSelf}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Chưa có điểm</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Manager score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Quản Lý TB</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-blue-700">
              {annualData.summary.avgManager !== null 
                ? annualData.summary.avgManager.toFixed(1) 
                : "--"}
            </div>
            <div className="mt-1">
              {annualData.summary.classManager ? (
                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeColor(annualData.summary.classManager)}`}>
                  {annualData.summary.classManager}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Chờ quản lý chấm</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Council score */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Hội Đồng TB</span>
            <ShieldCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div>
            <div className="text-2xl font-black text-purple-700">
              {annualData.summary.avgCouncil !== null 
                ? annualData.summary.avgCouncil.toFixed(1) 
                : "--"}
            </div>
            <div className="mt-1">
              {annualData.summary.classCouncil ? (
                <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold border ${getBadgeColor(annualData.summary.classCouncil)}`}>
                  {annualData.summary.classCouncil}
                </span>
              ) : (
                <span className="text-xs text-slate-400">Chờ HĐ phê duyệt</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 4: Final Annual KPI */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-950 rounded-2xl p-4 text-white shadow-md flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-blue-200 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">KPI Chốt Cả Năm</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="text-3xl font-black tracking-tight text-white">
              {annualData.summary.avgFinal !== null 
                ? annualData.summary.avgFinal.toFixed(1) 
                : "--"}
              <span className="text-xs text-blue-300 font-normal ml-1">/ 100</span>
            </div>
            <div className="mt-1">
              {annualData.summary.classFinal ? (
                <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                  ★ {annualData.summary.classFinal}
                </span>
              ) : (
                <span className="text-xs text-blue-300">Chưa xếp loại</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 5: Progress count */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Tiến Độ Hoàn Thành</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">
              {annualData.summary.evaluatedCount} <span className="text-xs text-slate-400 font-normal">/ 12 kỳ</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${(annualData.summary.evaluatedCount / 12) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Đạt {Math.round((annualData.summary.evaluatedCount / 12) * 100)}% chu kỳ năm
            </p>
          </div>
        </div>
      </div>

      {/* Printable Report Document (Used for both Screen and PDF Print) */}
      <div className="printable-report bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-4 sm:p-8">
        {/* Header Document (Standard Official Header for Print & Screen) */}
        <div className="border-b border-slate-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-center sm:text-left">
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-slate-500">
                TẬP ĐOÀN CÔNG NGHIỆP THAN - KHOÁNG SẢN VIỆT NAM (TKV)
              </p>
              <p className="text-sm font-bold text-slate-800">
                CÔNG TY CỔ PHẦN VẬN TẢI VÀ ĐƯA ĐÓN THỢ MỎ
              </p>
            </div>
            <div className="text-center sm:text-right w-full sm:w-auto">
              <p className="text-xs font-bold text-slate-700 uppercase">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="text-xs text-slate-500 italic">
                Độc lập - Tự do - Hạnh phúc
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              BẢNG TỔNG HỢP ĐÁNH GIÁ HIỆU QUẢ CÔNG VIỆC (KPI) NĂM {selectedYear}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              (Theo dõi kết quả đánh giá 12 kỳ từ Tháng 01/{selectedYear} đến Tháng 12/{selectedYear})
            </p>
          </div>

          {/* Employee Metadata */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Họ và tên nhân viên:</span>
              <span className="font-bold text-slate-900 text-sm">{selectedUser.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mã số nhân viên:</span>
              <span className="font-bold font-mono text-slate-900">{selectedUser.manv}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Bộ phận / Phòng ban:</span>
              <span className="font-bold text-slate-900">{selectedUser.dept}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Chức danh / Vị trí:</span>
              <span className="font-bold text-slate-900">{selectedUser.title || "Nhân viên"}</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle (Mobile Friendly) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 mb-4 pt-2">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "cards"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>📱 Dạng Thẻ (Dễ Xem)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>📊 Dạng Bảng (12 Kỳ)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500">
            {viewMode === "cards" ? "Hiển thị 12 tháng dễ đọc trên điện thoại" : "Bảng 12 cột đầy đủ để in / xuất Excel"}
          </span>
        </div>

        {/* 1. MOBILE CARDS VIEW (When viewMode === 'cards') */}
        <div className={`no-print ${viewMode === "cards" ? "block" : "hidden"} mb-6`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {annualData.monthsData.map((m) => (
              <div
                key={m.month}
                className={`rounded-2xl p-4 border transition-all ${
                  m.hasData
                    ? "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                    : "bg-slate-50/60 border-slate-200/60 opacity-75"
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-800 font-black text-xs flex items-center justify-center">
                      T{m.month < 10 ? `0${m.month}` : m.month}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">
                        Tháng {m.month < 10 ? `0${m.month}` : m.month}/{selectedYear}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Kỳ: {m.period}</p>
                    </div>
                  </div>
                  <div>
                    {m.hasData ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Đã Đánh Giá
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                        Chưa có phiếu
                      </span>
                    )}
                  </div>
                </div>

                {m.hasData ? (
                  <div className="mt-3 space-y-2.5">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Tự Chấm</p>
                        <p className="text-base font-black text-slate-900 mt-0.5">
                          {m.selfScore !== null ? `${m.selfScore}` : "--"}
                        </p>
                        {m.selfClass ? (
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border ${getBadgeColor(m.selfClass)}`}>
                            {m.selfClass}
                          </span>
                        ) : null}
                      </div>

                      <div className="bg-blue-50/50 rounded-xl p-2 border border-blue-100/60">
                        <p className="text-[10px] text-blue-600 font-semibold uppercase">Quản Lý</p>
                        <p className="text-base font-black text-blue-700 mt-0.5">
                          {m.managerScore !== null ? `${m.managerScore}` : "--"}
                        </p>
                        {m.managerClass ? (
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold border ${getBadgeColor(m.managerClass)}`}>
                            {m.managerClass}
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-400">Chờ duyệt</span>
                        )}
                      </div>

                      <div className="bg-indigo-50/70 rounded-xl p-2 border border-indigo-100">
                        <p className="text-[10px] text-indigo-700 font-black uppercase">Chốt KPI</p>
                        <p className="text-base font-black text-indigo-900 mt-0.5">
                          {m.finalScore !== null ? `${m.finalScore}` : "--"}
                        </p>
                        {m.finalClass ? (
                          <span className={`inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-black border ${getBadgeColor(m.finalClass)}`}>
                            ★ {m.finalClass}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {m.feedback ? (
                      <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl border border-slate-100 leading-snug">
                        &ldquo;{m.feedback}&rdquo;
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="py-5 text-center text-xs text-slate-400 italic">
                    Chưa thực hiện đánh giá cho kỳ này
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 2. TABLE VIEW (Shown when viewMode === 'table' OR when printing) */}
        <div className={`${viewMode === "table" ? "block" : "hidden print:block"}`}>
          {/* Mobile Swipe Notice */}
          <div className="no-print sm:hidden mb-2 px-3 py-1.5 flex items-center justify-between text-[11px] text-blue-700 font-medium bg-blue-50 rounded-xl border border-blue-200">
            <span>👉 Vuốt sang ngang để xem đủ 12 kỳ</span>
            <span className="font-bold text-blue-800">12 Kỳ</span>
          </div>

          {/* 12 Months Detailed Table */}
          <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-200">
                <th className="py-3 px-3 w-16 text-center">Kỳ</th>
                <th className="py-3 px-3 w-24">Mã Kỳ</th>
                <th className="py-3 px-3 text-center w-28">Tự Chấm</th>
                <th className="py-3 px-3 text-center w-28">Xếp Loại Tự</th>
                <th className="py-3 px-3 text-center w-28">Quản Lý Chấm</th>
                <th className="py-3 px-3 text-center w-28">QL Xếp Loại</th>
                <th className="py-3 px-3 text-center w-28">Hội Đồng</th>
                <th className="py-3 px-3 text-center w-28">HĐ Xếp Loại</th>
                <th className="py-3 px-3 text-center w-28 bg-blue-50/80 text-blue-900 font-black">
                  Điểm Chốt
                </th>
                <th className="py-3 px-3 text-center w-28 bg-blue-50/80 text-blue-900 font-black">
                  Xếp Loại Chốt
                </th>
                <th className="py-3 px-3 min-w-[160px]">Nhận Xét / Ý Kiến</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {annualData.monthsData.map((m) => (
                <tr 
                  key={m.month}
                  className={m.hasData ? "hover:bg-slate-50/80 transition-colors" : "bg-slate-50/40 text-slate-400"}
                >
                  <td className="py-3 px-3 text-center font-bold text-slate-600">
                    Kỳ {m.month < 10 ? `0${m.month}` : m.month}
                  </td>
                  <td className="py-3 px-3 font-mono font-semibold">
                    {m.period}
                  </td>
                  <td className="py-3 px-3 text-center font-bold">
                    {m.selfScore !== null ? m.selfScore : "--"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {m.selfClass ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeColor(m.selfClass)}`}>
                        {m.selfClass}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-blue-700">
                    {m.managerScore !== null ? m.managerScore : "--"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {m.managerClass ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeColor(m.managerClass)}`}>
                        {m.managerClass}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-purple-700">
                    {m.councilScore !== null ? m.councilScore : "--"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {m.councilClass ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${getBadgeColor(m.councilClass)}`}>
                        {m.councilClass}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-black text-sm bg-blue-50/50 text-blue-900">
                    {m.finalScore !== null ? m.finalScore : "--"}
                  </td>
                  <td className="py-3 px-3 text-center bg-blue-50/50">
                    {m.finalClass ? (
                      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold border ${getBadgeColor(m.finalClass)}`}>
                        {m.finalClass}
                      </span>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-600 italic truncate max-w-xs" title={m.feedback}>
                    {m.feedback || (m.hasData ? "Không có ý kiến" : "Chưa đánh giá")}
                  </td>
                </tr>
              ))}

              {/* ANNUAL SUMMARY ROW */}
              <tr className="bg-gradient-to-r from-slate-100 via-blue-50 to-indigo-100 text-slate-900 font-extrabold border-t-2 border-slate-300">
                <td colSpan={2} className="py-4 px-3 text-left font-black uppercase text-xs text-slate-800">
                  TỔNG KẾT NĂM {selectedYear}
                </td>
                <td className="py-4 px-3 text-center font-black text-sm text-slate-900">
                  {annualData.summary.avgSelf !== null 
                    ? annualData.summary.avgSelf.toFixed(1) 
                    : "--"}
                </td>
                <td className="py-4 px-3 text-center">
                  {annualData.summary.classSelf ? (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-black border ${getBadgeColor(annualData.summary.classSelf)}`}>
                      {annualData.summary.classSelf}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-4 px-3 text-center font-black text-sm text-blue-800">
                  {annualData.summary.avgManager !== null 
                    ? annualData.summary.avgManager.toFixed(1) 
                    : "--"}
                </td>
                <td className="py-4 px-3 text-center">
                  {annualData.summary.classManager ? (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-black border ${getBadgeColor(annualData.summary.classManager)}`}>
                      {annualData.summary.classManager}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-4 px-3 text-center font-black text-sm text-purple-800">
                  {annualData.summary.avgCouncil !== null 
                    ? annualData.summary.avgCouncil.toFixed(1) 
                    : "--"}
                </td>
                <td className="py-4 px-3 text-center">
                  {annualData.summary.classCouncil ? (
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-black border ${getBadgeColor(annualData.summary.classCouncil)}`}>
                      {annualData.summary.classCouncil}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-4 px-3 text-center font-black text-base text-blue-900 bg-blue-100/80">
                  {annualData.summary.avgFinal !== null 
                    ? annualData.summary.avgFinal.toFixed(1) 
                    : "--"}
                </td>
                <td className="py-4 px-3 text-center bg-blue-100/80">
                  {annualData.summary.classFinal ? (
                    <span className="inline-block px-3 py-1 rounded-md text-xs font-black bg-amber-400 text-slate-950 uppercase shadow-xs">
                      ★ {annualData.summary.classFinal}
                    </span>
                  ) : (
                    "--"
                  )}
                </td>
                <td className="py-4 px-3 text-xs font-semibold text-slate-600">
                  Đã thực hiện: {annualData.summary.evaluatedCount}/12 kỳ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

        {/* Signature Blocks for Print & Official PDF */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <div className="text-right text-xs text-slate-500 italic mb-4">
            Quảng Ninh, ngày ..... tháng ..... năm {selectedYear}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-900 uppercase">NGƯỜI LAO ĐỘNG</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
              <div className="h-20" />
              <p className="font-bold text-slate-800">{selectedUser.name}</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase">TRƯỞNG BỘ PHẬN</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
              <div className="h-20" />
              <p className="font-bold text-slate-800">................................................</p>
            </div>
            <div>
              <p className="font-bold text-slate-900 uppercase">HỘI ĐỒNG / BAN GIÁM ĐỐC</p>
              <p className="text-[11px] text-slate-500 italic mt-0.5">(Ký tên và đóng dấu)</p>
              <div className="h-20" />
              <p className="font-bold text-slate-800">................................................</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
