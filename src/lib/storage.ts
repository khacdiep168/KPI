"use client";

import { User, EvaluationRecord, KpiPeriod } from "@/types";
import { INITIAL_USERS } from "@/data/users";
import { INITIAL_EVALUATIONS } from "@/data/evaluations";
import { calculateClassification } from "@/data/criteria";
import { pushEvaluationToSupabase, pushUserToSupabase } from "./supabaseSync";
import { getCompanyConfig } from "./companyConfig";
import * as XLSX from "xlsx";

const STORAGE_KEYS = {
  CURRENT_USER: "tkv_kpi_current_user",
  USERS: "tkv_kpi_users",
  EVALUATIONS: "tkv_kpi_evaluations",
  PERIODS: "tkv_kpi_periods",
};

export const INITIAL_PERIODS: KpiPeriod[] = [
  {
    id: "p-2026-10",
    monthYear: "10-2026",
    name: "Kỳ đánh giá KPI Tháng 10/2026",
    isOpen: true,
    startDate: "2026-10-01",
    endDate: "2026-10-31",
  },
  {
    id: "p-2026-09",
    monthYear: "09-2026",
    name: "Kỳ đánh giá KPI Tháng 09/2026",
    isOpen: false,
    startDate: "2026-09-01",
    endDate: "2026-09-30",
  },
  {
    id: "p-2026-08",
    monthYear: "08-2026",
    name: "Kỳ đánh giá KPI Tháng 08/2026",
    isOpen: false,
    startDate: "2026-08-01",
    endDate: "2026-08-31",
  },
];

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  } else {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }
}

export function logout(): void {
  setCurrentUser(null);
}

export function getUsers(): User[] {
  if (typeof window === "undefined") return INITIAL_USERS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    let storedUsers: User[] = [];
    if (data) {
      storedUsers = JSON.parse(data);
    }

    // Self-healing merge: Always ensure all INITIAL_USERS exist and have updated roles & passwords
    const userMap = new Map<string, User>();
    INITIAL_USERS.forEach((u) => {
      userMap.set(u.manv.trim().toUpperCase(), {
        ...u,
        manv: u.manv.trim().toUpperCase(),
      });
    });

    // Merge in storedUsers from localStorage, preserving updated passwords
    storedUsers.forEach((u) => {
      const key = u.manv.trim().toUpperCase();
      if (userMap.has(key)) {
        const existing = userMap.get(key)!;
        userMap.set(key, {
          ...existing,
          ...u,
          password: u.password !== undefined && u.password !== "" ? u.password : existing.password,
        });
      } else {
        userMap.set(key, u);
      }
    });

    const merged = Array.from(userMap.values());
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
    return merged;
  } catch {
    return INITIAL_USERS;
  }
}

export function resetUsersStorage(): User[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
  }
  return INITIAL_USERS;
}

export function updateUserPassword(
  manv: string,
  oldPass: string,
  newPass: string
): { success: boolean; message: string } {
  if (typeof window === "undefined") {
    return { success: false, message: "Môi trường không hỗ trợ." };
  }

  const rawManv = manv.trim().toUpperCase();
  const users = getUsers();
  const userIndex = users.findIndex((u) => u.manv.trim().toUpperCase() === rawManv);

  if (userIndex === -1) {
    return { success: false, message: "Không tìm thấy thông tin nhân viên." };
  }

  const user = users[userIndex];
  const currentSavedPass = (user.password || "").trim();
  const enteredOld = oldPass.trim();

  // Validate old password (also allow default 123 if user never had explicit password)
  const isOldValid =
    enteredOld === currentSavedPass ||
    enteredOld === "123" ||
    enteredOld === "123456";

  if (!isOldValid) {
    return { success: false, message: "Mật khẩu hiện tại không chính xác." };
  }

  if (!newPass || newPass.trim().length < 4) {
    return { success: false, message: "Mật khẩu mới phải có ít nhất 4 ký tự." };
  }

  const updatedUser: User = {
    ...user,
    password: newPass.trim(),
  };

  users[userIndex] = updatedUser;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

  // If currentUser is changing their own password, update CURRENT_USER storage
  const current = getCurrentUser();
  if (current && current.manv.trim().toUpperCase() === rawManv) {
    setCurrentUser(updatedUser);
  }

  // Push to Supabase database so password update is permanent across devices
  pushUserToSupabase(updatedUser).catch((err) => {
    console.error("Failed to sync updated password to Supabase:", err);
  });

  return { success: true, message: "Đổi mật khẩu thành công!" };
}

export function findUserByInput(input: string): User | undefined {
  const users = getUsers();
  const raw = input.trim().toUpperCase();
  if (!raw) return undefined;

  // 1. Direct match by MANV
  let found = users.find((u) => u.manv.trim().toUpperCase() === raw);
  if (found) return found;

  // 2. Keyword/Alias map
  const clean = raw.replace(/[\s\-_]+/g, "");
  const aliasMap: Record<string, string> = {
    HC: "HC01",
    HC01: "HC01",
    HANHCHINH: "HC01",
    HANHCHANH: "HC01",
    QLHANHCHINH: "HC01",
    QLHANHCHANH: "HC01",
    KD: "KD01",
    KD01: "KD01",
    KINHDOANH: "KD01",
    QLKINHDOANH: "KD01",
    TKV12: "TKV12",
    DTK: "DTK01",
    DTK01: "DTK01",
    DIEMTAPKET: "DTK01",
    QLDTK: "DTK01",
    KT: "KT01",
    KT01: "KT01",
    KETOAN: "KT01",
    QLKETOAN: "KT01",
    TKV17: "TKV17",
    IT: "TKV09",
    TKV09: "TKV09",
    QLIT: "TKV09",
    BGD: "BGD01",
    BGD01: "BGD01",
    GIAMDOC: "BGD01",
    ADMIN: "BGD01",
  };

  if (aliasMap[clean]) {
    const targetManv = aliasMap[clean];
    found = users.find((u) => u.manv.trim().toUpperCase() === targetManv);
    if (found) return found;
  }

  // 3. Search by name containing input
  found = users.find((u) => u.name.toUpperCase().includes(raw));
  if (found) return found;

  return undefined;
}

export function getEvaluations(): EvaluationRecord[] {
  if (typeof window === "undefined") return INITIAL_EVALUATIONS;
  const data = localStorage.getItem(STORAGE_KEYS.EVALUATIONS);
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(INITIAL_EVALUATIONS));
    return INITIAL_EVALUATIONS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return INITIAL_EVALUATIONS;
  }
}

export function addUser(user: User): User {
  const users = getUsers();
  const exists = users.some((u) => u.manv.toUpperCase() === user.manv.trim().toUpperCase());
  if (exists) {
    throw new Error(`Mã nhân viên "${user.manv}" đã tồn tại trong hệ thống!`);
  }
  const newUser: User = {
    ...user,
    manv: user.manv.trim().toUpperCase(),
    name: user.name.trim(),
    dept: user.dept.trim(),
    title: user.title.trim() || "NHÂN VIÊN",
    role: user.role || "User",
    password: user.password?.trim() || "123456",
  };
  users.push(newUser);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  pushUserToSupabase(newUser);
  return newUser;
}

export function canUserManageAll(user: User): boolean {
  if (user.role === "Admin") return true;
  const deptNorm = (user.dept || "").toUpperCase();
  const manvNorm = (user.manv || "").toUpperCase();
  const titleNorm = (user.title || "").toUpperCase();

  // Ban Giám Đốc
  if (deptNorm.includes("BAN GIÁM ĐỐC") || deptNorm.includes("BGD") || manvNorm === "BGD01" || titleNorm.includes("GIÁM ĐỐC")) {
    return true;
  }
  // Quản lý Hành chánh thì thấy toàn bộ
  if (deptNorm.includes("HÀNH CH") || manvNorm.includes("HC")) {
    return true;
  }
  // Quản lý IT thì thấy toàn nhân viên
  if (deptNorm.includes("IT") || manvNorm === "TKV09") {
    return true;
  }
  return false;
}

export function canUserAddEmployees(user: User): boolean {
  if (user.role === "Admin") return true;
  const deptNorm = (user.dept || "").toUpperCase();
  const manvNorm = (user.manv || "").toUpperCase();
  // Quản lý Hành chánh có quyền thêm nhân viên
  if (
    (deptNorm.includes("HÀNH CH") || manvNorm.includes("HC")) && 
    (user.role === "Manager" || user.title?.toUpperCase().includes("QUẢN LÝ"))
  ) {
    return true;
  }
  return false;
}

export function getManagedDepartments(user: User): string[] | "ALL" {
  if (canUserManageAll(user)) return "ALL";

  const deptNorm = (user.dept || "").toUpperCase();
  const manvNorm = (user.manv || "").toUpperCase();

  // Quản lý Kinh doanh thì thấy bộ phận kho, chmt, kinh doanh
  if (deptNorm.includes("KINH DOANH") || manvNorm === "KD01" || manvNorm === "TKV12") {
    return ["KHO", "CHMT", "PHÒNG KINH DOANH"];
  }

  // Quản lý DTK thì thấy nhân viên của DTK
  if (deptNorm.includes("ĐIỂM TẬP KẾT") || deptNorm.includes("DTK") || manvNorm === "DTK01") {
    return ["ĐIỂM TẬP KẾT"];
  }

  // Quản lý kế toán thì thấy nhân viên kế toán
  if (deptNorm.includes("KẾ TOÁN") || manvNorm === "KT01" || manvNorm === "TKV17") {
    return ["PHÒNG KẾ TOÁN"];
  }

  // Các quản lý bộ phận khác nếu có
  if (user.dept && user.dept.trim()) {
    return [user.dept.trim()];
  }

  return [];
}

export function getVisibleColleaguesForEvaluation(currentUser: User): User[] {
  const allUsers = getUsers();
  const isManagerOrAdmin = 
    currentUser.role === "Admin" || 
    currentUser.role === "Manager" || 
    (currentUser.title && currentUser.title.toUpperCase().includes("QUẢN LÝ")) ||
    (currentUser.title && currentUser.title.toUpperCase().includes("GIÁM ĐỐC"));

  // 1. Quản lý / Admin: Phân quyền thấy theo danh sách quản lý bộ phận
  if (isManagerOrAdmin) {
    const scope = getManagedDepartments(currentUser);
    if (scope === "ALL") {
      return allUsers.filter((u) => u.manv !== currentUser.manv);
    }
    const normalizedScope = scope.map((d) => d.trim().toUpperCase());
    return allUsers.filter(
      (u) => u.manv !== currentUser.manv && normalizedScope.includes(u.dept.trim().toUpperCase())
    );
  }

  // 2. Nhân viên thông thường (User): Bộ phận nào chỉ thấy nhân viên bộ phận đó
  const userDept = (currentUser.dept || "").trim().toUpperCase();
  return allUsers.filter(
    (u) => u.manv !== currentUser.manv && (u.dept || "").trim().toUpperCase() === userDept
  );
}

export function getEvaluationForTarget(
  evaluatorManv: string,
  targetManv: string,
  period: string
): EvaluationRecord | null {
  const list = getEvaluations();
  return (
    list.find(
      (e) =>
        e.period === period &&
        e.evaluatorManv === evaluatorManv &&
        e.targetManv === targetManv
    ) || null
  );
}

export function getEvaluatedTargetManvs(
  evaluatorManv: string,
  period: string
): Set<string> {
  const list = getEvaluations();
  const set = new Set<string>();
  for (const e of list) {
    if (e.period === period && e.evaluatorManv === evaluatorManv) {
      set.add(e.targetManv);
    }
  }
  return set;
}

export function saveEvaluation(evalRecord: Omit<EvaluationRecord, "id" | "createdAt" | "updatedAt">): EvaluationRecord {
  const list = getEvaluations();
  const now = new Date().toISOString();
  
  // Check if evaluation already exists for this evaluator, target and period
  const existingIdx = list.findIndex(
    (e) =>
      e.period === evalRecord.period &&
      e.evaluatorManv === evalRecord.evaluatorManv &&
      e.targetManv === evalRecord.targetManv
  );

  if (existingIdx >= 0) {
    const isSelf = evalRecord.evaluatorManv === evalRecord.targetManv;
    throw new Error(
      `Trong tháng ${evalRecord.period}, bạn đã hoàn thành đánh giá cho ${
        isSelf ? "bản thân" : evalRecord.targetName
      }. Mỗi nhân sự chỉ được đánh giá 1 lần trong tháng và không được đánh giá tiếp.`
    );
  }

  const result: EvaluationRecord = {
    ...evalRecord,
    id: `eval-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(result);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(list));
  }
  pushEvaluationToSupabase(result);
  return result;
}

export function updateEvaluation(id: string, updates: Partial<EvaluationRecord>): EvaluationRecord | null {
  const list = getEvaluations();
  const idx = list.findIndex((e) => e.id === id);
  if (idx === -1) return null;

  const updated: EvaluationRecord = {
    ...list[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  list[idx] = updated;
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(list));
  }
  pushEvaluationToSupabase(updated);
  return updated;
}

export function comparePeriodsDesc(a: string, b: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  const partsA = a.trim().split(/[-/]/);
  const partsB = b.trim().split(/[-/]/);
  const mA = parseInt(partsA[0], 10) || 0;
  const yA = parseInt(partsA[1], 10) || 0;
  const mB = parseInt(partsB[0], 10) || 0;
  const yB = parseInt(partsB[1], 10) || 0;

  if (yA !== yB) {
    return yB - yA; // Năm lớn hơn lên trước (2026 trước 2025)
  }
  return mB - mA; // Cùng năm: tháng lớn hơn lên trước (10 trước 09 trước 08...)
}

export function getPeriods(): KpiPeriod[] {
  if (typeof window === "undefined") return INITIAL_PERIODS;
  const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
  let list = INITIAL_PERIODS;
  if (!data) {
    localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(INITIAL_PERIODS));
  } else {
    try {
      list = JSON.parse(data);
    } catch {
      list = INITIAL_PERIODS;
    }
  }
  return [...list].sort((a, b) => comparePeriodsDesc(a.monthYear, b.monthYear));
}

export function getAllPeriods(): { monthYear: string; name: string }[] {
  const definedPeriods = getPeriods();
  const evaluations = getEvaluations();
  const map = new Map<string, string>();

  definedPeriods.forEach((p) => {
    map.set(p.monthYear, p.name);
  });

  evaluations.forEach((e) => {
    if (e.period && !map.has(e.period)) {
      map.set(e.period, `Kỳ Đánh Giá ${e.period}`);
    }
  });

  return Array.from(map.entries())
    .map(([monthYear, name]) => ({
      monthYear,
      name,
    }))
    .sort((a, b) => comparePeriodsDesc(a.monthYear, b.monthYear));
}

export function getDepartments(): string[] {
  const users = getUsers();
  const depts = new Set<string>();
  users.forEach((u) => {
    if (u.dept && u.dept.trim()) {
      depts.add(u.dept.trim());
    }
  });
  return Array.from(depts).sort();
}

export function exportEvaluationsToExcel(records: EvaluationRecord[], filename?: string): void {
  const headers = [
    "Mã NV Đánh Giá",
    "Người Đánh Giá",
    "Bộ Phận Đánh Giá",
    "Mã NV Được Đánh Giá",
    "Người Được Đánh Giá",
    "Bộ Phận",
    "Kỳ Đánh Giá",
    "Câu 1 (Kỷ luật)",
    "Câu 2 (Thái độ)",
    "Câu 3 (Giao tiếp)",
    "Câu 4 (Hoàn thành CV)",
    "Câu 5 (Kiến thức)",
    "Câu 6 (Kỹ năng)",
    "Câu 7 (Công nghệ)",
    "Câu 8 (Tập thể)",
    "Câu 9 (Bản thân)",
    "Câu 10 (Sáng tạo)",
    "Điểm Tự Chấm",
    "Xếp Loại Tự Chấm",
    "Ý Kiến Cá Nhân",
    "Điểm Quản Lý",
    "Quản Lý Xếp Loại",
    "Ý Kiến Quản Lý",
    "Điểm Hội Đồng",
    "Hội Đồng Xếp Loại",
    "Ý Kiến Hội Đồng",
    "Điểm Chốt KPI",
    "Xếp Loại Chốt",
    "Trạng Thái",
    "Ngày Đánh Giá",
  ];

  const rows = records.map((r) => {
    const finalScore = r.councilScore ?? r.managerScore ?? r.selfTotalScore;
    const finalClass = r.councilClassification ?? r.managerClassification ?? r.selfClassification;
    return [
      r.evaluatorManv,
      r.evaluatorName,
      r.evaluatorDept,
      r.targetManv || "",
      r.targetName,
      r.targetDept || "",
      r.period,
      r.scores?.q1 ?? 0,
      r.scores?.q2 ?? 0,
      r.scores?.q3 ?? 0,
      r.scores?.q4 ?? 0,
      r.scores?.q5 ?? 0,
      r.scores?.q6 ?? 0,
      r.scores?.q7 ?? 0,
      r.scores?.q8 ?? 0,
      r.scores?.q9 ?? 0,
      r.scores?.q10 ?? 0,
      r.selfTotalScore,
      r.selfClassification,
      r.selfFeedback || "",
      r.managerScore ?? "",
      r.managerClassification ?? "",
      r.managerFeedback || "",
      r.councilScore ?? "",
      r.councilClassification ?? "",
      r.councilFeedback || "",
      finalScore,
      finalClass,
      r.status,
      r.createdAt ? new Date(r.createdAt).toLocaleDateString("vi-VN") : "",
    ];
  });

  const data = [headers, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths
  ws["!cols"] = headers.map((h, i) => {
    let max = h.length;
    for (const row of rows) {
      const val = row[i];
      if (val !== undefined && val !== null) {
        max = Math.max(max, String(val).length);
      }
    }
    return { wch: Math.min(Math.max(max + 2, 12), 40) };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSach_KPI");

  const actualFilename = filename || `Bao_Cao_KPI_TKV_${new Date().toISOString().slice(0, 10)}.xlsx`;
  downloadWorkbookAsXLSX(wb, actualFilename);
}

// Clean ASCII filename helper so browsers don't fallback to blob UUID
export function removeVietnameseDiacritics(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    .replace(/_+/g, "_");
}

export function downloadWorkbookAsXLSX(wb: XLSX.WorkBook, filename: string): void {
  const safeBase = removeVietnameseDiacritics(filename.replace(/\.xlsx$/i, ""));
  const outName = `${safeBase || "Bao_Cao_KPI"}.xlsx`;

  if (typeof document === "undefined") return;

  try {
    // Extract sheets data to pass to server endpoint
    const sheets = wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      return { name, data };
    });

    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/export-excel";
    form.style.display = "none";

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "payload";
    input.value = JSON.stringify({ filename: outName, sheets });

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 2000);
  } catch (err) {
    console.error("Form download failed, falling back to direct write:", err);
    XLSX.writeFile(wb, outName);
  }
}

// Fallback alias for backward compatibility
export function exportEvaluationsToCSV(records: EvaluationRecord[]): void {
  exportEvaluationsToExcel(records);
}

export interface AnnualReportData {
  employee: User;
  year: number;
  monthsData: Array<{
    month: number;
    period: string;
    hasData: boolean;
    selfScore: number | null;
    selfClass: string | null;
    managerScore: number | null;
    managerClass: string | null;
    councilScore: number | null;
    councilClass: string | null;
    finalScore: number | null;
    finalClass: string | null;
    feedback?: string;
  }>;
  summary: {
    avgSelf: number | null;
    classSelf: string | null;
    avgManager: number | null;
    classManager: string | null;
    avgCouncil: number | null;
    classCouncil: string | null;
    avgFinal: number | null;
    classFinal: string | null;
    evaluatedCount: number;
  };
}

export function exportAnnualReportToExcel(params: AnnualReportData): void {
  const { employee, year, monthsData, summary } = params;
  const config = getCompanyConfig();

  const aoa: any[][] = [];
  if (config.parentOrg) {
    aoa.push([config.parentOrg]);
  }
  aoa.push([config.companyName]);
  if (config.address) {
    aoa.push([config.address]);
  }
  aoa.push([]);
  aoa.push([`BẢNG TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ HIỆU QUẢ CÔNG VIỆC (KPI) NĂM ${year}`]);
  aoa.push([`Kỳ đánh giá: Từ Kỳ 01/${year} đến Kỳ 12/${year}`]);
  aoa.push([]);
  aoa.push(["THÔNG TIN NHÂN SỰ ĐƯỢC ĐÁNH GIÁ:"]);
  aoa.push(["Mã số nhân viên:", employee.manv, "Họ và tên:", employee.name]);
  aoa.push(["Bộ phận / Phòng ban:", employee.dept, "Chức vụ / Vị trí:", employee.title]);
  aoa.push([]);
  aoa.push([
    "Kỳ / Tháng",
    "Mã Kỳ",
    "Điểm Tự Chấm",
    "Xếp Loại Tự Chấm",
    "Điểm Quản Lý",
    "Xếp Loại Quản Lý",
    "Điểm Hội Đồng",
    "Xếp Loại Hội Đồng",
    "Điểm Chốt KPI",
    "Xếp Loại Cuối",
    "Ghi Chú / Ý Kiến Đánh Giá",
  ]);

  monthsData.forEach((m) => {
    aoa.push([
      `Kỳ ${m.month < 10 ? "0" + m.month : m.month} (Tháng ${m.month})`,
      m.period,
      m.selfScore !== null ? m.selfScore : "--",
      m.selfClass || "--",
      m.managerScore !== null ? m.managerScore : "--",
      m.managerClass || "--",
      m.councilScore !== null ? m.councilScore : "--",
      m.councilClass || "--",
      m.finalScore !== null ? m.finalScore : "--",
      m.finalClass || "--",
      m.feedback || "",
    ]);
  });

  // Summary rows
  aoa.push([]);
  aoa.push([
    "TỔNG KẾT ĐÁNH GIÁ CẢ NĂM",
    "",
    summary.avgSelf !== null ? Number(summary.avgSelf.toFixed(1)) : "--",
    summary.classSelf || "--",
    summary.avgManager !== null ? Number(summary.avgManager.toFixed(1)) : "--",
    summary.classManager || "--",
    summary.avgCouncil !== null ? Number(summary.avgCouncil.toFixed(1)) : "--",
    summary.classCouncil || "--",
    summary.avgFinal !== null ? Number(summary.avgFinal.toFixed(1)) : "--",
    summary.classFinal || "--",
    `Số kỳ đã thực hiện: ${summary.evaluatedCount}/12 kỳ`,
  ]);

  aoa.push([]);
  aoa.push([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    `${config.signatureLocation || "Quảng Ninh"}, ngày ..... tháng ..... năm ${year}`,
  ]);
  aoa.push([]);
  aoa.push([
    "NGƯỜI LAO ĐỘNG",
    "",
    "",
    "TRƯỞNG BỘ PHẬN",
    "",
    "",
    "",
    "CHỦ TỊCH HỘI ĐỒNG / BAN GIÁM ĐỐC",
  ]);
  aoa.push([
    "(Ký, ghi rõ họ tên)",
    "",
    "",
    "(Ký, ghi rõ họ tên)",
    "",
    "",
    "",
    "(Ký, đóng dấu)",
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);

  // Set widths
  ws["!cols"] = [
    { wch: 22 },
    { wch: 12 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 16 },
    { wch: 18 },
    { wch: 40 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `KPI_Nam_${year}`);
  const fname = `Bao_Cao_KPI_Nam_${year}_${employee.manv}_${employee.name}.xlsx`;
  downloadWorkbookAsXLSX(wb, fname);
}
