# Google Sheets Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm chức năng đồng bộ dữ liệu KPI tự động từ 2 Google Sheets (Nhân viên & Quản lý) vào database Supabase, chỉ hiển thị cho tài khoản Admin trong menu cài đặt của Navbar.

**Architecture:** 
- Tạo thư viện logic `src/lib/syncGoogleSheets.ts` để tải CSV từ Google Sheets, phân tích các dòng đánh giá nhân viên (10 câu) và quản lý (7 câu), trích xuất kỳ đánh giá, và so khớp với bảng `evaluations` trên Supabase để chỉ INSERT các bản ghi mới.
- Tạo API Route `src/app/api/sync-google-sheets/route.ts` xử lý đồng bộ phía server (tránh CORS và bảo mật).
- Tạo component `src/components/SyncSheetsModal.tsx` hiển thị giao diện đồng bộ, tiến trình và báo cáo chi tiết.
- Tích hợp nút kích hoạt vào menu tài khoản trên `src/components/Navbar.tsx` (chỉ hiển thị khi `isAdmin == true`).

**Tech Stack:** Next.js 15+ App Router, TypeScript, Tailwind CSS, Supabase REST API, Lucide React, tsx/Node test runner.

**Spec:** Yêu cầu từ người dùng: thêm nút trong menu tài khoản (hình chụp từ Navbar), chỉ Admin thấy, nhấn vào đồng bộ dữ liệu mới từ 2 link Google Sheets vào Database.

## Global Constraints
- Chỉ tài khoản quyền Admin mới được phép nhìn thấy nút và gọi API đồng bộ.
- Tự động bỏ qua các bản ghi đã tồn tại (dựa trên bộ key `period + evaluator_manv + evaluation_type` hoặc ID duy nhất) để không ghi đè điểm đã duyệt hay làm trùng dữ liệu.
- Mọi bản ghi mới insert phải tuân thủ đúng schema của bảng `evaluations`:
  - Nhân viên: `evaluation_type = 'STAFF'`, 10 câu hỏi (`q1` -> `q10`).
  - Quản lý: `evaluation_type = 'MANAGER'`, 7 câu hỏi (`q1` -> `q7`, `q8=0, q9=0, q10=0`).
  - Trạng thái mặc định: `'SUBMITTED'`.
- Codebase phải pass toàn bộ test suite (`npm test`) và type check (`npx tsc --noEmit`).

## Review Focus
- Bị trùng lặp đánh giá nếu nhân viên nộp lại form nhiều lần trong cùng kỳ: chọn bản ghi nộp mới nhất của kỳ đó nếu chưa duyệt, hoặc bỏ qua nếu đã có bản ghi trong DB.
- Định dạng ngày tháng trong Google Forms (`M/D/YYYY` vs `D/M/YYYY`): xử lý an toàn để trích xuất đúng kỳ tháng (e.g. `10-2026`).
- Lỗi kết nối mạng khi tải Google Sheets: xử lý lỗi êm ái, hiển thị thông báo rõ ràng cho Admin trên UI.

---

### Task 1: Module phân tích dữ liệu Google Sheets & Sync logic (`src/lib/syncGoogleSheets.ts`)

**Files:**
- Create: `src/lib/syncGoogleSheets.ts`
- Test: `tests/sync-google-sheets.test.ts`

- [x] **Step 1: Viết test case ban đầu cho bộ parser dữ liệu CSV**
- [x] **Step 2: Chạy test để xác nhận test thất bại (Red)**
- [x] **Step 3: Hiện thực `src/lib/syncGoogleSheets.ts`**
- [x] **Step 4: Chạy test xác nhận pass (Green)**

---

### Task 2: API Route đồng bộ phía Server (`src/app/api/sync-google-sheets/route.ts`)

**Files:**
- Create: `src/app/api/sync-google-sheets/route.ts`
- Modify: `tests/sync-google-sheets.test.ts`

- [x] **Step 1: Viết test cho API route handler**
- [x] **Step 2: Hiện thực API route**
- [x] **Step 3: Chạy test xác nhận API route hoạt động chính xác**

---

### Task 3: Modal giao diện Đồng bộ dữ liệu (`src/components/SyncSheetsModal.tsx`)

**Files:**
- Create: `src/components/SyncSheetsModal.tsx`

- [x] **Step 1: Xây dựng component `SyncSheetsModal`**

---

### Task 4: Tích hợp vào Menu Quản lý trong `src/components/Navbar.tsx`

**Files:**
- Modify: `src/components/Navbar.tsx`

- [x] **Step 1: Thêm nút menu trong Sheet thông tin tài khoản**
- [x] **Step 2: Render `SyncSheetsModal` trong `Navbar.tsx`**

---

### Task 5: Kiểm tra toàn diện & Regression Verification

**Files:**
- Modify: `package.json` (nếu cần thêm script test)

- [x] **Step 1: Chạy Typecheck toàn dự án**
- [x] **Step 2: Chạy toàn bộ Test suite của dự án**
- [x] **Step 3: Chạy thử tính năng đồng bộ thực tế qua API/kịch bản kiểm thử**
