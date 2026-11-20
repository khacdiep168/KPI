/**
 * syncGoogleSheets.ts
 * Module xử lý đồng bộ dữ liệu đánh giá KPI từ Google Sheets vào Supabase
 */

export const DEFAULT_STAFF_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1b-79L51AyhW38egwSCzlcXffoAlDuzFrDkXQ7Xz4rAQ/export?format=csv&gid=118973536";

export const DEFAULT_MGR_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/13Tu2Z3vGxbRoRT-L9OzEUFU3oX5RFJ9LDokdOZRcKWQ/export?format=csv&gid=520415395";

export interface ParsedEvaluation {
  id: string;
  period: string;
  evaluation_type: "STAFF" | "MANAGER";
  evaluator_manv: string;
  evaluator_name: string;
  evaluator_dept: string;
  target_manv: string;
  target_name: string;
  target_dept: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number;
  q6: number;
  q7: number;
  q8: number;
  q9: number;
  q10: number;
  self_total_score: number;
  self_classification: string;
  self_feedback: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SyncSummary {
  totalStaffScanned: number;
  newStaffInserted: number;
  totalMgrScanned: number;
  newMgrInserted: number;
  totalExistingSkipped: number;
}

export interface SyncResult {
  success: boolean;
  message: string;
  summary: SyncSummary;
  insertedRecords: Array<{
    id: string;
    period: string;
    evaluator_manv: string;
    evaluator_name: string;
    evaluator_dept: string;
    evaluation_type: "STAFF" | "MANAGER";
    self_total_score: number;
    self_classification: string;
  }>;
}

/**
 * Trình phân tích CSV nâng cao hỗ trợ ngoặc kép, dấu phẩy và xuống dòng lồng nhau
 */
export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // Bỏ qua ký tự escape
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      currentRow.push(currentField);
      currentField = "";
      // Chỉ push dòng có ít nhất 1 trường không rỗng
      if (currentRow.some((f) => f.trim() !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField !== "" || currentRow.length > 0) {
    currentRow.push(currentField);
    if (currentRow.some((f) => f.trim() !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Làm sạch chuỗi thành số
 */
export function cleanNum(val: unknown, defaultVal = 0): number {
  if (val === null || val === undefined || val === "") return defaultVal;
  if (typeof val === "number") return isNaN(val) ? defaultVal : val;
  const str = String(val).replace(/,/g, ".").trim();
  const match = str.match(/[\d.]+/);
  if (!match) return defaultVal;
  const num = parseFloat(match[0]);
  return isNaN(num) ? defaultVal : num;
}

/**
 * Xác định kỳ đánh giá MM-YYYY
 * Ưu tiên trích xuất từ Timestamp M/D/YYYY hoặc YYYY-MM-DD (chính xác theo tháng nộp)
 */
export function detectPeriod(tsStr: string, quyStr?: string): string {
  const ts = String(tsStr || "").trim();

  // 1. Parse từ Timestamp M/D/YYYY H:M:S
  const mDateSlash = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mDateSlash) {
    const mm = parseInt(mDateSlash[1], 10);
    const yyyy = parseInt(mDateSlash[3], 10);
    if (mm >= 1 && mm <= 12) {
      return `${String(mm).padStart(2, "0")}-${yyyy}`;
    }
  }

  // 2. Parse từ ISO YYYY-MM-DD
  const mIso = ts.match(/^(\d{4})[-/](\d{1,2})/);
  if (mIso) {
    const yyyy = parseInt(mIso[1], 10);
    const mm = parseInt(mIso[2], 10);
    if (mm >= 1 && mm <= 12) {
      return `${String(mm).padStart(2, "0")}-${yyyy}`;
    }
  }

  // 3. Fallback kiểm tra cột Quý / Kỳ nếu có định dạng MM-YYYY
  if (quyStr) {
    const mQuy = String(quyStr).trim().match(/(\d{1,2})[-/](\d{4})/);
    if (mQuy) {
      const mm = parseInt(mQuy[1], 10);
      const yyyy = parseInt(mQuy[2], 10);
      if (mm >= 1 && mm <= 12) {
        return `${String(mm).padStart(2, "0")}-${yyyy}`;
      }
    }
  }

  return "10-2026";
}

/**
 * Parse chuỗi ngày thành định dạng ISO với timezone +07:00
 */
export function parseIsoTimestamp(tsStr: string): string {
  if (!tsStr) return new Date().toISOString();
  const ts = String(tsStr).trim();
  
  // Format M/D/YYYY H:M:S
  const match = ts.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (match) {
    const m = parseInt(match[1], 10);
    const d = parseInt(match[2], 10);
    const y = parseInt(match[3], 10);
    const hh = match[4] ? parseInt(match[4], 10) : 0;
    const mm = match[5] ? parseInt(match[5], 10) : 0;
    const ss = match[6] ? parseInt(match[6], 10) : 0;

    const pad = (n: number) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:${pad(ss)}+07:00`;
  }

  try {
    const d = new Date(ts);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {
    // ignore
  }

  return new Date().toISOString();
}

/**
 * Phân loại xếp loại theo tổng điểm (nếu sheet chưa có hoặc cần tự chuẩn hóa)
 */
export function getClassification(score: number): string {
  if (score >= 80) return "Giỏi";
  if (score >= 65) return "Khá";
  if (score >= 50) return "Trung Bình";
  return "Yếu";
}

/**
 * Phân tích dữ liệu CSV đánh giá Nhân viên (10 câu hỏi)
 */
export function parseStaffCsv(csvText: string): ParsedEvaluation[] {
  const rows = parseCsvText(csvText);
  if (rows.length < 2) return [];

  const results: ParsedEvaluation[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rawManv = r[1];
    if (!rawManv || rawManv.trim() === "") continue;

    const manv = String(rawManv).replace(/\u00a0/g, "").trim().toUpperCase();
    const name = String(r[2] || "").trim();
    const dept = String(r[3] || "").trim();
    const targetName = String(r[4] || "").trim() || name;

    const q1 = cleanNum(r[6]);
    const q2 = cleanNum(r[8]);
    const q3 = cleanNum(r[10]);
    const q4 = cleanNum(r[12]);
    const q5 = cleanNum(r[14]);
    const q6 = cleanNum(r[16]);
    const q7 = cleanNum(r[18]);
    const q8 = cleanNum(r[20]);
    const q9 = cleanNum(r[22]);
    const q10 = cleanNum(r[24]);

    const sumScore = q1 + q2 + q3 + q4 + q5 + q6 + q7 + q8 + q9 + q10;
    const declaredScore = cleanNum(r[27]);
    const totalScore = declaredScore > 0 ? declaredScore : sumScore;

    const rawCls = String(r[28] || "").trim();
    const classification = rawCls || getClassification(totalScore);

    const feedback = String(r[25] || "").trim();
    const quy = String(r[29] || "").trim();
    const period = detectPeriod(r[0], quy);
    const createdAt = parseIsoTimestamp(r[0]);

    results.push({
      id: `eval-staff-${period}-${manv.toLowerCase()}`,
      period,
      evaluation_type: "STAFF",
      evaluator_manv: manv,
      evaluator_name: name,
      evaluator_dept: dept,
      target_manv: manv,
      target_name: targetName,
      target_dept: dept,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      self_total_score: totalScore,
      self_classification: classification,
      self_feedback: feedback,
      status: "SUBMITTED",
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return results;
}

/**
 * Phân tích dữ liệu CSV đánh giá Quản lý (7 câu hỏi)
 */
export function parseManagerCsv(csvText: string): ParsedEvaluation[] {
  const rows = parseCsvText(csvText);
  if (rows.length < 2) return [];

  const results: ParsedEvaluation[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const rawManv = r[1];
    if (!rawManv || rawManv.trim() === "") continue;

    const manv = String(rawManv).replace(/\u00a0/g, "").trim().toUpperCase();
    const name = String(r[2] || "").trim();
    const dept = String(r[3] || "").trim();
    const targetName = String(r[5] || "").trim() || name;

    const q1 = cleanNum(r[7]);
    const q2 = cleanNum(r[9]);
    const q3 = cleanNum(r[11]);
    const q4 = cleanNum(r[13]);
    const q5 = cleanNum(r[15]);
    const q6 = cleanNum(r[17]);
    const q7 = cleanNum(r[19]);

    const sumScore = q1 + q2 + q3 + q4 + q5 + q6 + q7;
    const declaredScore = cleanNum(r[20]);
    const totalScore = declaredScore > 0 ? declaredScore : sumScore;

    const rawCls = String(r[21] || "").trim();
    const classification = rawCls || getClassification(totalScore);

    const period = detectPeriod(r[0]);
    const createdAt = parseIsoTimestamp(r[0]);

    results.push({
      id: `eval-mgr-${period}-${manv.toLowerCase()}`,
      period,
      evaluation_type: "MANAGER",
      evaluator_manv: manv,
      evaluator_name: name,
      evaluator_dept: dept,
      target_manv: manv,
      target_name: targetName,
      target_dept: dept,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8: 0,
      q9: 0,
      q10: 0,
      self_total_score: totalScore,
      self_classification: classification,
      self_feedback: "",
      status: "SUBMITTED",
      created_at: createdAt,
      updated_at: createdAt,
    });
  }

  return results;
}

/**
 * Tải nội dung CSV qua HTTP với User-Agent tránh bị chặn
 */
export async function fetchCsv(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    cache: "no-store",
  });

  if (!resp.ok) {
    throw new Error(`Không thể tải Google Sheet (Mã lỗi ${resp.status}: ${resp.statusText})`);
  }

  return await resp.text();
}

export interface SyncOptions {
  staffUrl?: string;
  mgrUrl?: string;
  supabaseUrl?: string;
  anonKey?: string;
  targetPeriod?: string; // Optional: chỉ đồng bộ kỳ cụ thể nếu truyền
}

/**
 * Hàm thực thi toàn bộ luồng đồng bộ từ 2 liên kết Google Sheets về Supabase
 */
export async function syncGoogleSheetsToSupabase(options: SyncOptions = {}): Promise<SyncResult> {
  const staffUrl = options.staffUrl || DEFAULT_STAFF_SHEET_URL;
  const mgrUrl = options.mgrUrl || DEFAULT_MGR_SHEET_URL;

  const supabaseUrl =
    options.supabaseUrl ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://jaewyxazjvqtvqifdmlw.supabase.co";
  const anonKey =
    options.anonKey ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphZXd5eGF6anZxdHZxaWZkbWx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0Mzg0MTgsImV4cCI6MjEwNzAxNDQxOH0.vXxjYEdEvK7HCefzPuKXgcguB4KPRjGkJhHcPF9uW00";

  // 1. Tải cả 2 file CSV đồng thời
  const [staffCsv, mgrCsv] = await Promise.all([
    fetchCsv(staffUrl),
    fetchCsv(mgrUrl),
  ]);

  // 2. Parse dữ liệu
  const allStaff = parseStaffCsv(staffCsv);
  const allMgr = parseManagerCsv(mgrCsv);

  // Lọc theo targetPeriod nếu được truyền
  const filterStaff = options.targetPeriod
    ? allStaff.filter((e) => e.period === options.targetPeriod)
    : allStaff;
  const filterMgr = options.targetPeriod
    ? allMgr.filter((e) => e.period === options.targetPeriod)
    : allMgr;

  // 3. Khử trùng lặp trong chính danh sách sheet (ưu tiên bản ghi nộp sau cùng)
  const staffMap = new Map<string, ParsedEvaluation>();
  for (const s of filterStaff) {
    const key = `${s.period}::${s.evaluator_manv}::${s.evaluation_type}`;
    staffMap.set(key, s);
  }

  const mgrMap = new Map<string, ParsedEvaluation>();
  for (const m of filterMgr) {
    const key = `${m.period}::${m.evaluator_manv}::${m.evaluation_type}`;
    mgrMap.set(key, m);
  }

  const uniqueStaff = Array.from(staffMap.values());
  const uniqueMgr = Array.from(mgrMap.values());

  // 4. Lấy danh sách đánh giá đã có trên Supabase để so khớp
  const existingKeys = new Set<string>();
  try {
    const checkResp = await fetch(
      `${supabaseUrl}/rest/v1/evaluations?select=id,period,evaluator_manv,evaluation_type`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
        cache: "no-store",
      }
    );
    if (checkResp.ok) {
      const existing = await checkResp.json();
      for (const e of existing) {
        if (e.period && e.evaluator_manv) {
          const evalType = e.evaluation_type || "STAFF";
          existingKeys.add(`${e.period}::${e.evaluator_manv.toUpperCase()}::${evalType}`);
        }
      }
    }
  } catch (err) {
    console.warn("Không thể tải danh sách đánh giá hiện tại từ Supabase:", err);
  }

  // 5. Lọc những bản ghi thực sự mới
  const newStaffToInsert = uniqueStaff.filter((s) => {
    const key = `${s.period}::${s.evaluator_manv}::${s.evaluation_type}`;
    return !existingKeys.has(key);
  });

  const newMgrToInsert = uniqueMgr.filter((m) => {
    const key = `${m.period}::${m.evaluator_manv}::${m.evaluation_type}`;
    return !existingKeys.has(key);
  });

  const allNewToInsert = [...newStaffToInsert, ...newMgrToInsert];

  // 6. Thực hiện INSERT các bản ghi mới vào Supabase
  const insertedSummaryList: SyncResult["insertedRecords"] = [];

  if (allNewToInsert.length > 0) {
    const insertResp = await fetch(`${supabaseUrl}/rest/v1/evaluations`, {
      method: "POST",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(allNewToInsert),
    });

    if (!insertResp.ok) {
      const errText = await insertResp.text();
      throw new Error(`Lỗi khi insert vào Supabase (${insertResp.status}): ${errText}`);
    }

    const insertedData: ParsedEvaluation[] = await insertResp.json();
    for (const item of insertedData) {
      insertedSummaryList.push({
        id: item.id,
        period: item.period,
        evaluator_manv: item.evaluator_manv,
        evaluator_name: item.evaluator_name,
        evaluator_dept: item.evaluator_dept,
        evaluation_type: item.evaluation_type,
        self_total_score: item.self_total_score,
        self_classification: item.self_classification,
      });
    }
  }

  const summary: SyncSummary = {
    totalStaffScanned: allStaff.length,
    newStaffInserted: newStaffToInsert.length,
    totalMgrScanned: allMgr.length,
    newMgrInserted: newMgrToInsert.length,
    totalExistingSkipped:
      allStaff.length + allMgr.length - (newStaffToInsert.length + newMgrToInsert.length),
  };

  const message =
    allNewToInsert.length > 0
      ? `Đã đồng bộ thành công ${allNewToInsert.length} bản ghi mới (${newStaffToInsert.length} nhân viên, ${newMgrToInsert.length} quản lý).`
      : "Dữ liệu đã đồng bộ mới nhất. Không có bản ghi mới nào cần chèn thêm.";

  return {
    success: true,
    message,
    summary,
    insertedRecords: insertedSummaryList,
  };
}
