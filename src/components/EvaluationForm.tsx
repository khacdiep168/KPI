"use client";

import React, { useState, useMemo, useEffect } from "react";
import { User, EvaluationRecord } from "@/types";
import { KPI_CRITERIA, calculateClassification, CriteriaOption } from "@/data/criteria";
import { 
  saveEvaluation, 
  getUsers, 
  getPeriods, 
  getEvaluationForTarget, 
  getVisibleColleaguesForEvaluation,
  getManagedDepartments,
  canUserManageAll,
  getEvaluatedTargetManvs
} from "@/lib/storage";
import { getBadgeColor } from "@/lib/utils";
import confetti from "canvas-confetti";
import { 
  CheckCircle2, 
  HelpCircle, 
  Send, 
  Award, 
  AlertCircle, 
  Calendar, 
  UserCheck2,
  Sparkles,
  ArrowRight,
  Lock,
  Edit,
  Info
} from "lucide-react";

interface EvaluationFormProps {
  currentUser: User;
  initialTargetManv?: string;
  onSuccess: (evaluation: EvaluationRecord) => void;
}

export default function EvaluationForm({ 
  currentUser, 
  initialTargetManv,
  onSuccess 
}: EvaluationFormProps) {
  const allUsers = getUsers();
  const periods = getPeriods();
  const [selectedPeriodMonthYear, setSelectedPeriodMonthYear] = useState<string>(
    (periods.find((p) => p.isOpen) || periods[0]).monthYear
  );
  const activePeriod = periods.find((p) => p.monthYear === selectedPeriodMonthYear) || periods[0];

  // Colleagues filtered by department & manager scope
  const colleagues = useMemo(() => {
    return getVisibleColleaguesForEvaluation(currentUser);
  }, [currentUser, allUsers]);

  const isManagerOrAdmin = 
    currentUser.role === "Admin" || 
    currentUser.role === "Manager" || 
    (currentUser.title && currentUser.title.toUpperCase().includes("QUẢN LÝ")) ||
    (currentUser.title && currentUser.title.toUpperCase().includes("GIÁM ĐỐC"));

  const managedScope = getManagedDepartments(currentUser);

  const groupLabel = useMemo(() => {
    if (managedScope === "ALL") {
      return "--- Toàn bộ nhân sự công ty ---";
    }
    if (isManagerOrAdmin) {
      return `--- Nhân sự thuộc phạm vi quản lý (${Array.isArray(managedScope) ? managedScope.join(", ") : ""}) ---`;
    }
    return `--- Đồng nghiệp cùng bộ phận (${currentUser.dept}) ---`;
  }, [managedScope, isManagerOrAdmin, currentUser.dept]);

  // Target employee (defaults to initialTargetManv or current user)
  const [targetManv, setTargetManv] = useState<string>(() => {
    if (initialTargetManv) {
      if (initialTargetManv === currentUser.manv) return currentUser.manv;
      const allowed = colleagues.some((c) => c.manv === initialTargetManv);
      if (allowed) return initialTargetManv;
    }
    return currentUser.manv;
  });
  const targetUser = allUsers.find((u) => u.manv === targetManv) || currentUser;

  // Selected scores for 10 questions
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<EvaluationRecord | null>(null);

  // Status regarding previous submission
  const [existingRecord, setExistingRecord] = useState<EvaluationRecord | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  // Set of targets already evaluated in this period
  const evaluatedManvs = useMemo(() => {
    return getEvaluatedTargetManvs(currentUser.manv, activePeriod.monthYear);
  }, [currentUser.manv, activePeriod.monthYear, existingRecord, submittedRecord]);

  // Check if evaluation exists when targetManv or activePeriod changes
  useEffect(() => {
    const existing = getEvaluationForTarget(currentUser.manv, targetManv, activePeriod.monthYear);
    if (existing) {
      setExistingRecord(existing);
      setScores(existing.scores || {});
      setFeedback(existing.selfFeedback || "");
      // In this month, if already evaluated, lock it (cannot evaluate again)
      setIsLocked(true);
    } else {
      setExistingRecord(null);
      // If period is closed, lock it in view-only mode
      setIsLocked(!activePeriod.isOpen);
      setScores({});
      setFeedback("");
    }
  }, [targetManv, currentUser.manv, activePeriod.monthYear, activePeriod.isOpen]);

  // Calculate realtime total score
  const totalScore = useMemo(() => {
    return Object.values(scores).reduce((sum, val) => sum + (val || 0), 0);
  }, [scores]);

  const classification = useMemo(() => {
    return calculateClassification(totalScore);
  }, [totalScore]);

  const answeredCount = useMemo(() => {
    return KPI_CRITERIA.filter((c) => scores[c.id] !== undefined).length;
  }, [scores]);

  const handleSelectOption = (questionId: string, points: number) => {
    if (isLocked) return;
    setScores((prev) => ({
      ...prev,
      [questionId]: points,
    }));
  };

  const handleCardClick = (questionId: string, option: CriteriaOption) => {
    if (isLocked) return;
    const currentScore = scores[questionId];
    // If already scored within this option's range, retain the current score
    if (option.range && option.range.includes(currentScore)) {
      return;
    }
    // Otherwise default to the top score of the selected range
    const defaultPoints = option.range ? option.range[option.range.length - 1] : option.points;
    handleSelectOption(questionId, defaultPoints);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked || existingRecord) {
      alert(
        `Trong tháng ${activePeriod.name}, bạn đã hoàn thành đánh giá cho ${
          targetUser.manv === currentUser.manv ? "bản thân" : targetUser.name
        }. Mỗi nhân sự chỉ được đánh giá 1 lần trong tháng và không được gửi đánh giá tiếp.`
      );
      return;
    }

    if (answeredCount < KPI_CRITERIA.length) {
      alert("Vui lòng trả lời đầy đủ 10 tiêu chí trước khi gửi đánh giá.");
      return;
    }

    setSubmitting(true);

    try {
      const record = saveEvaluation({
        period: activePeriod.monthYear,
        evaluatorManv: currentUser.manv,
        evaluatorName: currentUser.name,
        evaluatorDept: currentUser.dept,
        targetManv: targetUser.manv,
        targetName: targetUser.name,
        targetDept: targetUser.dept,
        scores: {
          q1: scores["q1"] || 0,
          q2: scores["q2"] || 0,
          q3: scores["q3"] || 0,
          q4: scores["q4"] || 0,
          q5: scores["q5"] || 0,
          q6: scores["q6"] || 0,
          q7: scores["q7"] || 0,
          q8: scores["q8"] || 0,
          q9: scores["q9"] || 0,
          q10: scores["q10"] || 0,
        },
        selfTotalScore: totalScore,
        selfClassification: classification,
        selfFeedback: feedback.trim(),
        status: "SUBMITTED",
      });

      // Confetti effect
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmittedRecord(record);
      setExistingRecord(record);
      setIsLocked(true);
      onSuccess(record);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đã xảy ra lỗi khi lưu đánh giá. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-200 font-semibold flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Kỳ đánh giá:
              </span>
              <select
                value={selectedPeriodMonthYear}
                onChange={(e) => setSelectedPeriodMonthYear(e.target.value)}
                className="bg-blue-950/80 border border-blue-400/40 text-blue-200 text-xs rounded-xl px-3 py-1 font-bold focus:ring-2 focus:ring-blue-400 focus:outline-hidden cursor-pointer"
              >
                {periods.map((p) => (
                  <option key={p.monthYear} value={p.monthYear} className="bg-slate-900 text-white">
                    {p.name} {p.isOpen ? " (Đang mở)" : " (Đã đóng)"}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-xs text-slate-400">
              Hạn nộp: <strong className="text-slate-200">{new Date(activePeriod.endDate).toLocaleDateString("vi-VN")}</strong>
              {!activePeriod.isOpen && (
                <span className="ml-2 text-rose-400 font-bold bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-800">
                  Đã Đóng
                </span>
              )}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Phiếu Đánh Giá KPI Hàng Tháng
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
            Hoàn thiện 10 tiêu chí đánh giá để xác định kết quả hiệu quả công việc cá nhân. Điểm số tối đa là 100 điểm.
          </p>

          {/* Evaluator and Target Selection */}
          <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Người thực hiện đánh giá */}
            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                NV
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Người đánh giá</p>
                <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 font-mono">[{currentUser.manv}] - {currentUser.dept}</p>
              </div>
            </div>

            {/* Người được đánh giá */}
            <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                <UserCheck2 className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Đánh giá cho</p>
                <select
                  value={targetManv}
                  onChange={(e) => setTargetManv(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value={currentUser.manv}>
                    👤 Bản thân: {currentUser.name} ({currentUser.manv}) {evaluatedManvs.has(currentUser.manv) ? " - [✓ Đã đánh giá]" : " - [⏳ Chưa đánh giá]"}
                  </option>
                  {colleagues.length > 0 && (
                    <optgroup label={groupLabel}>
                      {colleagues.map((u) => {
                        const isDone = evaluatedManvs.has(u.manv);
                        return (
                          <option key={u.manv} value={u.manv}>
                            {u.name} ({u.manv} - {u.dept}) {isDone ? " - [✓ Đã đánh giá]" : " - [⏳ Chưa đánh giá]"}
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Status Notice when already evaluated */}
      {isLocked && existingRecord && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
          <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold flex items-center gap-2">
              <span>ĐÃ HOÀN TẤT ĐÁNH GIÁ THÁNG NÀY</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-amber-200 text-amber-900 font-extrabold">
                ĐÃ KHÓA
              </span>
            </p>
            <p className="text-amber-800 mt-1 leading-relaxed">
              Bạn đã nộp phiếu đánh giá cho{" "}
              <strong>
                {existingRecord.targetManv === currentUser.manv
                  ? "Bản thân"
                  : `${existingRecord.targetName} (${existingRecord.targetManv})`}
              </strong>{" "}
              trong {activePeriod.name} (Điểm đã tự chấm: <strong>{existingRecord.selfTotalScore}đ</strong>).
              Theo quy định: <strong>Mỗi nhân sự chỉ được đánh giá 1 lần trong tháng và không được đánh giá tiếp</strong>.
            </p>
            {existingRecord.managerScore !== null && existingRecord.managerScore !== undefined && (
              <p className="mt-1.5 text-emerald-800 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Quản lý đã chấm thẩm định: <strong>{existingRecord.managerScore} điểm</strong> ({existingRecord.managerClassification}).
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Sticky Realtime Score Bar */}
      <div className="sticky top-14 sm:top-16 z-30 mb-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-lg shadow-slate-200/40">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Progress */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 shadow-xs transition-colors ${
              answeredCount === KPI_CRITERIA.length 
                ? "bg-emerald-600 text-white" 
                : "bg-blue-50 text-blue-700 border border-blue-200/60"
            }`}>
              {answeredCount === KPI_CRITERIA.length ? "✓" : `${answeredCount}/10`}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-[11px] sm:text-xs font-bold text-slate-700">
                  {answeredCount === KPI_CRITERIA.length ? "Đã xong 10/10" : `Đã làm ${answeredCount}/10`}
                </p>
                <span className="text-[10px] text-slate-400 hidden sm:inline">tiêu chí</span>
              </div>
              <div className="w-20 sm:w-36 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    answeredCount === KPI_CRITERIA.length ? "bg-emerald-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${(answeredCount / KPI_CRITERIA.length) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Realtime Score & Classification */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-right">
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tổng điểm</p>
              <div className="flex items-baseline justify-end gap-0.5 sm:gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{totalScore}</span>
                <span className="text-[11px] sm:text-xs text-slate-400 font-semibold">/100đ</span>
              </div>
            </div>

            <div className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-black ring-1 ${getBadgeColor(classification)}`}>
              {classification}
            </div>
          </div>

          {/* Quick Submit button */}
          <button
            onClick={handleSubmit}
            disabled={answeredCount < KPI_CRITERIA.length || submitting || isLocked}
            className={`hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 ${
              isLocked
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                : answeredCount === KPI_CRITERIA.length && !submitting
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 cursor-pointer hover:scale-[1.02] active:scale-95"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
            }`}
          >
            {submitting ? (
              <span>Đang gửi...</span>
            ) : isLocked ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Đã Nộp</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Nộp Phiếu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* The 10 Criteria Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {KPI_CRITERIA.map((criteria) => {
          const currentScore = scores[criteria.id];
          const isAnswered = currentScore !== undefined;

          return (
            <div
              key={criteria.id}
              className={`rounded-2xl p-4 sm:p-6 transition-all duration-200 border ${
                isAnswered
                  ? "bg-white border-blue-200 shadow-sm"
                  : "bg-white border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 mt-0.5 transition-all ${
                    isAnswered 
                      ? "bg-emerald-600 text-white shadow-xs" 
                      : "bg-slate-100 text-slate-700 font-bold"
                  }`}>
                    {isAnswered ? "✓" : criteria.number}
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-slate-900 leading-snug">
                      {criteria.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                      {criteria.description}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200 text-[11px] sm:text-xs font-semibold">
                  <span className="hidden sm:inline">Tối đa:</span>
                  <span className="font-bold text-slate-900">{criteria.maxScore}đ</span>
                </div>
              </div>

              {/* Options Grid */}
              <div className="mt-3.5 grid grid-cols-1 gap-2.5">
                {criteria.options.map((option, idx) => {
                  const isSelected = option.range 
                    ? option.range.includes(currentScore)
                    : currentScore === option.points;

                  const hasRange = Boolean(option.range && option.range.length > 1);

                  return (
                    <div
                      key={idx}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleCardClick(criteria.id, option)}
                      className={`relative flex flex-col p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm transition-all touch-manipulation select-none ${
                        isLocked
                          ? "cursor-default opacity-85"
                          : "cursor-pointer active:scale-[0.99]"
                      } ${
                        isSelected
                          ? "bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/30 shadow-xs"
                          : "bg-slate-50/60 hover:bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        {/* Custom Radio Circle */}
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "border-blue-600 bg-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className={`leading-relaxed text-xs sm:text-sm ${isSelected ? "font-bold text-blue-950" : "text-slate-700"}`}>
                            {option.text}
                          </span>
                        </div>

                        {/* Points pill badge */}
                        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-200/80 text-slate-700"
                        }`}>
                          {isSelected 
                            ? `+${currentScore}đ` 
                            : hasRange && option.range
                            ? `${option.range[0]} - ${option.range[option.range.length - 1]}đ`
                            : `+${option.points}đ`}
                        </span>
                      </div>

                      {/* Sub-score point selector when option has multiple points (e.g. 9 or 10) */}
                      {hasRange && option.range && (
                        <div 
                          className={`mt-3 pt-2.5 border-t flex flex-wrap items-center justify-between gap-2 transition-all ${
                            isSelected ? "border-blue-200/90" : "border-slate-200/60"
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`text-xs ${isSelected ? "font-bold text-blue-950" : "text-slate-500"}`}>
                              {isSelected ? "👉 Chọn mức điểm:" : "Mức điểm:"}
                            </span>
                            <div className="flex items-center gap-2">
                              {option.range.map((pt) => {
                                const isPointActive = currentScore === pt;
                                return (
                                  <button
                                    key={pt}
                                    type="button"
                                    disabled={isLocked}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleSelectOption(criteria.id, pt);
                                    }}
                                    className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation ${
                                      isLocked ? "cursor-default" : "cursor-pointer active:scale-95"
                                    } ${
                                      isPointActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-300 scale-105"
                                        : isSelected
                                        ? "bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 hover:border-blue-400"
                                        : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300"
                                    }`}
                                  >
                                    {pt} điểm
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="text-[11px] font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                              Đang chọn: <strong className="text-blue-950">{currentScore} điểm</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Question 11: Personal Feedback / Suggestions */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
              11
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Ý kiến cá nhân & Đề xuất cải tiến (Không bắt buộc)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mb-4">
            Ghi nhận ý kiến, khó khăn vướng mắc hoặc đề xuất giải pháp của bạn tới cấp quản lý và công ty.
          </p>
          <textarea
            disabled={isLocked}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder={isLocked ? "Không thể chỉnh sửa ý kiến sau khi Quản lý đã chấm điểm" : "Nhập ý kiến cá nhân của bạn tại đây..."}
            className={`w-full rounded-xl border border-slate-200 p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
              isLocked ? "bg-slate-50 cursor-not-allowed text-slate-500" : ""
            }`}
          />
        </div>

        {/* Bottom Submit Area */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span className="text-base font-bold text-slate-900">
                Tổng điểm: {totalScore} / 100 điểm
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeColor(classification)}`}>
                Xếp loại: {classification}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {isLocked
                ? "Trong tháng này bạn đã hoàn tất đánh giá cho nhân sự này. Theo quy định không được đánh giá tiếp."
                : answeredCount === KPI_CRITERIA.length
                ? "Bạn đã hoàn thành đủ 10/10 tiêu chí. Sẵn sàng gửi bài."
                : `Còn thiếu ${KPI_CRITERIA.length - answeredCount} tiêu chí chưa hoàn thành.`}
            </p>
          </div>

          <button
            type="submit"
            disabled={answeredCount < KPI_CRITERIA.length || submitting || isLocked}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              isLocked
                ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                : answeredCount === KPI_CRITERIA.length && !submitting
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-[1.02]"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span>Đang lưu...</span>
            ) : isLocked ? (
              <>
                <Lock className="w-4 h-4" />
                <span>Đã Hoàn Tất (Không Thể Đánh Giá Tiếp)</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Nộp Phiếu Đánh Giá KPI</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {submittedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Gửi Đánh Giá KPI Thành Công!
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Phiếu đánh giá cho <strong>{submittedRecord.targetName}</strong> kỳ <strong>{submittedRecord.period}</strong> đã được lưu thành công và khóa lại theo quy định (mỗi nhân sự đánh giá 1 lần trong tháng).
            </p>

            <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500">Người đánh giá:</span>
                <span className="font-semibold text-slate-800">{submittedRecord.evaluatorName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500">Đối tượng:</span>
                <span className="font-semibold text-slate-800">{submittedRecord.targetName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60 text-xs">
                <span className="text-slate-500">Tổng điểm tự đánh giá:</span>
                <span className="font-black text-slate-900 text-sm">{submittedRecord.selfTotalScore} / 100</span>
              </div>
              <div className="flex justify-between items-center pt-2 text-xs">
                <span className="text-slate-500">Xếp loại sơ bộ:</span>
                <span className={`px-2 py-0.5 rounded-md font-bold text-xs ${getBadgeColor(submittedRecord.selfClassification)}`}>
                  {submittedRecord.selfClassification}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSubmittedRecord(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setSubmittedRecord(null);
                  window.location.hash = "#history";
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Xem Lịch Sử</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
