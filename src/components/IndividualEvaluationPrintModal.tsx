"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { EvaluationRecord, User } from "@/types";
import { KPI_CRITERIA } from "@/data/criteria";
import { getCompanyConfig, CompanyConfig } from "@/lib/companyConfig";
import { getUsers } from "@/lib/storage";
import { Printer, X, FileText, CheckCircle2 } from "lucide-react";

interface IndividualEvaluationPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  evaluation: EvaluationRecord | null;
}

export default function IndividualEvaluationPrintModal({
  isOpen,
  onClose,
  evaluation,
}: IndividualEvaluationPrintModalProps) {
  const [mounted, setMounted] = useState(false);
  const [companyConfig, setCompanyConfig] = useState<CompanyConfig>(getCompanyConfig());
  const [targetUser, setTargetUser] = useState<User | null>(null);

  useEffect(() => {
    setMounted(true);
    setCompanyConfig(getCompanyConfig());
  }, [isOpen]);

  useEffect(() => {
    if (evaluation) {
      const users = getUsers();
      const u = users.find(
        (x) => x.manv.trim().toUpperCase() === evaluation.targetManv.trim().toUpperCase()
      );
      setTargetUser(u || null);
    } else {
      setTargetUser(null);
    }
  }, [evaluation]);

  if (!isOpen || !evaluation || !mounted || typeof document === "undefined") {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "..... / ..... / 20.....";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatSignatureDate = (dateStr?: string | null) => {
    if (!dateStr) {
      return `ngày ..... tháng ..... năm 20...`;
    }
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return `ngày ..... tháng ..... năm 20...`;
      return `ngày ${d.getDate()} tháng ${d.getMonth() + 1} năm ${d.getFullYear()}`;
    } catch {
      return `ngày ..... tháng ..... năm 20...`;
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Background backdrop click */}
      <div className="fixed inset-0 no-print" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] overflow-y-auto z-10 flex flex-col my-auto">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="no-print sticky top-0 z-20 bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between rounded-t-2xl shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Phiếu Đánh Giá Cá Nhân KPI (Chuẩn In A4)
              </h3>
              <p className="text-[11px] text-slate-300">
                {evaluation.targetName} ({evaluation.targetManv}) - Kỳ {evaluation.period}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu (A4 / PDF)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas (A4 Standard Format) */}
        <div className="p-6 sm:p-10 bg-white text-slate-900 font-sans text-xs sm:text-[13px] leading-relaxed print-container">
          {/* Header row: Left: Company Info, Right: Quốc hiệu */}
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-300">
            {/* Left Header */}
            <div className="text-center sm:text-left space-y-0.5">
              {companyConfig.parentOrg && (
                <p className="font-semibold text-slate-600 uppercase text-[10px] sm:text-[11px] tracking-wide">
                  {companyConfig.parentOrg}
                </p>
              )}
              <p className="font-extrabold text-slate-900 uppercase text-[11px] sm:text-xs">
                {companyConfig.companyName}
              </p>
              <p className="font-bold text-slate-800 text-[10px] sm:text-[11px]">
                BỘ PHẬN: {evaluation.targetDept.toUpperCase()}
              </p>
              <div className="w-24 sm:w-28 h-[1px] bg-slate-400 mx-auto sm:mx-0 my-1"></div>
            </div>

            {/* Right Header */}
            <div className="text-center space-y-0.5">
              <p className="font-extrabold uppercase text-[11px] sm:text-xs tracking-wider text-slate-900">
                CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
              </p>
              <p className="font-bold text-[11px] sm:text-xs text-slate-800">
                Độc lập - Tự do - Hạnh phúc
              </p>
              <div className="w-28 sm:w-36 h-[1px] bg-slate-800 mx-auto my-1"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-5">
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-900">
              PHIẾU ĐÁNH GIÁ HIỆU QUẢ CÔNG VIỆC CÁ NHÂN (KPI)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
              Kỳ đánh giá: Tháng {evaluation.period.includes("-") ? evaluation.period.replace("-", "/") : evaluation.period}
            </p>
            <p className="text-[11px] text-slate-500 italic mt-0.5">
              (Kèm theo Quy chế đánh giá hiệu quả công việc định kỳ của Công ty)
            </p>
          </div>

          {/* Employee Information Block */}
          <div className="bg-slate-50/70 p-3.5 sm:p-4 rounded-xl border border-slate-200 mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <span className="font-bold text-slate-700">Họ và tên nhân sự: </span>
                <span className="font-black text-slate-900 uppercase">{evaluation.targetName}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Mã số nhân viên: </span>
                <span className="font-mono font-bold text-slate-900">{evaluation.targetManv}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Bộ phận / Phòng ban: </span>
                <span className="font-semibold text-slate-900">{evaluation.targetDept}</span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Chức vụ / Vị trí: </span>
                <span className="font-semibold text-slate-900">
                  {targetUser?.title || "Nhân viên"}
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Người thực hiện chấm: </span>
                <span className="text-slate-900 font-semibold">
                  {evaluation.evaluatorName} ({evaluation.evaluatorManv})
                </span>
              </div>
              <div>
                <span className="font-bold text-slate-700">Ngày lập phiếu: </span>
                <span className="text-slate-900">{formatDate(evaluation.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* 10 Criteria Breakdown Table */}
          <div className="mb-5 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-400 text-[11px] sm:text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-900 font-bold text-center">
                  <th className="border border-slate-400 p-2 w-10">STT</th>
                  <th className="border border-slate-400 p-2 text-left">Nội Dung Tiêu Chí Đánh Giá</th>
                  <th className="border border-slate-400 p-2 w-16">Điểm Chuẩn</th>
                  <th className="border border-slate-400 p-2 w-20 bg-slate-50">Tự Chấm</th>
                  <th className="border border-slate-400 p-2 w-20 bg-blue-50/60">Trưởng BP</th>
                  <th className="border border-slate-400 p-2 w-20 bg-purple-50/60">Hội Đồng</th>
                </tr>
              </thead>
              <tbody>
                {KPI_CRITERIA.map((item, idx) => {
                  const scoreVal = evaluation.scores[item.id as keyof typeof evaluation.scores] ?? 0;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="border border-slate-400 p-1.5 text-center font-semibold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="border border-slate-400 p-1.5">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] sm:text-[11px] text-slate-600 leading-tight mt-0.5">
                          {item.description}
                        </p>
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold text-slate-700">
                        {item.maxScore}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-black text-slate-900 bg-slate-50/50">
                        {scoreVal}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-medium text-slate-700 bg-blue-50/30">
                        {/* Manager criterion breakdown if recorded, or general placeholder */}
                        {evaluation.managerScore !== null && evaluation.managerScore !== undefined
                          ? scoreVal // in standard app, manager adjusts total or mirrors breakdown
                          : "--"}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-medium text-slate-700 bg-purple-50/30">
                        {evaluation.councilScore !== null && evaluation.councilScore !== undefined
                          ? scoreVal
                          : "--"}
                      </td>
                    </tr>
                  );
                })}

                {/* Tổng Điểm Row */}
                <tr className="bg-slate-100/80 font-black text-slate-900">
                  <td colSpan={2} className="border border-slate-400 p-2 text-right uppercase">
                    TỔNG ĐIỂM ĐÁNH GIÁ (THANG 100)
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-blue-700">
                    100
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-sm font-black text-slate-900 bg-slate-50">
                    {evaluation.selfTotalScore}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-sm font-black text-blue-800 bg-blue-50/60">
                    {evaluation.managerScore !== null && evaluation.managerScore !== undefined
                      ? evaluation.managerScore
                      : "--"}
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-sm font-black text-purple-800 bg-purple-50/60">
                    {evaluation.councilScore !== null && evaluation.councilScore !== undefined
                      ? evaluation.councilScore
                      : "--"}
                  </td>
                </tr>

                {/* Xếp Loại Row */}
                <tr className="font-extrabold text-slate-900 bg-white">
                  <td colSpan={2} className="border border-slate-400 p-2 text-right uppercase">
                    KẾT QUẢ XẾP LOẠI KPI
                  </td>
                  <td className="border border-slate-400 p-2 text-center text-slate-400">
                    --
                  </td>
                  <td className="border border-slate-400 p-2 text-center font-black text-slate-800">
                    {evaluation.selfClassification}
                  </td>
                  <td className="border border-slate-400 p-2 text-center font-black text-blue-700">
                    {evaluation.managerClassification || "--"}
                  </td>
                  <td className="border border-slate-400 p-2 text-center font-black text-purple-700">
                    {evaluation.councilClassification || "--"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Opinions and Remarks Box */}
          <div className="space-y-2.5 mb-6">
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50/50">
              <span className="font-bold text-slate-800 block text-xs">
                1. Ý kiến tự nhận xét của Người lao động:
              </span>
              <p className="italic text-slate-700 mt-1 min-h-[20px]">
                {evaluation.selfFeedback || "Hoàn thành nhiệm vụ công việc được giao trong kỳ."}
              </p>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-blue-50/30">
              <span className="font-bold text-blue-900 block text-xs">
                2. Ý kiến nhận xét, đánh giá của Quản lý bộ phận:
              </span>
              <p className="italic text-blue-950 mt-1 min-h-[20px]">
                {evaluation.managerFeedback || (
                  <span className="text-slate-400 italic">
                    {evaluation.managerScore !== null && evaluation.managerScore !== undefined
                      ? "Đồng ý với kết quả đánh giá."
                      : "Chưa có nhận xét."}
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 border border-slate-300 rounded-lg bg-purple-50/30">
              <span className="font-bold text-purple-900 block text-xs">
                3. Kết luận của Hội đồng đánh giá / Ban Giám Đốc:
              </span>
              <p className="italic text-purple-950 mt-1 min-h-[20px]">
                {evaluation.councilFeedback || (
                  <span className="text-slate-400 italic">
                    {evaluation.councilScore !== null && evaluation.councilScore !== undefined
                      ? "Phê duyệt kết quả đánh giá KPI kỳ này."
                      : "Chưa có kết luận phê duyệt."}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Date & Signatures Section (3 Columns A4 Standard) */}
          <div className="mt-8 pt-4">
            <div className="text-right text-xs italic text-slate-700 mb-4">
              {companyConfig.signatureLocation || "Quảng Ninh"}, {formatSignatureDate(evaluation.updatedAt || evaluation.createdAt)}
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-black uppercase text-slate-900">NGƯỜI LAO ĐỘNG</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-20 sm:h-24 flex items-end justify-center pb-2">
                  <p className="font-bold uppercase text-slate-900 text-xs">
                    {evaluation.targetName}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-black uppercase text-slate-900">TRƯỞNG BỘ PHẬN</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, ghi rõ họ tên)</p>
                <div className="h-20 sm:h-24 flex items-end justify-center pb-2">
                  <p className="font-bold uppercase text-slate-700 text-xs">
                    {evaluation.managerManv ? `[Đã xác nhận]` : ""}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-black uppercase text-slate-900">CHỦ TỊCH HỘI ĐỒNG / GIÁM ĐỐC</p>
                <p className="text-[10px] text-slate-500 italic mt-0.5">(Ký, đóng dấu)</p>
                <div className="h-20 sm:h-24 flex items-end justify-center pb-2">
                  <p className="font-bold uppercase text-slate-700 text-xs">
                    {evaluation.councilApprovedAt ? `[Đã phê duyệt]` : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer button for mobile/desktop (hidden when printing) */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl">
          <p className="text-xs text-slate-500">
            Khuyến nghị: Chọn "Lưu dưới dạng PDF" hoặc chọn máy in cỡ A4, căn lề "Mặc định".
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu A4</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>

      {/* Global Print CSS to ensure only the modal sheet prints nicely on A4 */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm 12mm 15mm 12mm;
          }
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: white !important;
            color: black !important;
            font-size: 11pt !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
