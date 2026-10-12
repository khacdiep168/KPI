# Storage Quota Management & Supabase Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản lý an toàn hạn mức 5MB của LocalStorage (nén logo tự động, đo lường dung lượng lưu trữ) và kích hoạt bảo mật cơ sở dữ liệu Supabase (chặn lộ password, chặn xóa đánh giá trái phép, dùng RPC functions).

**Architecture:**
- Phía Client: Bổ sung module `storageQuota.ts` đo lường dung lượng LocalStorage và bọc `safeSetLocalStorage`; bổ sung `imageCompression.ts` nén logo tự động qua HTML5 Canvas xuống dưới 50KB trước khi lưu.
- Phía Supabase: Tạo migration SQL chứa các hàm RPC `SECURITY DEFINER` (`verify_user_credentials`, `change_user_password`, `admin_reset_password`); thu hồi quyền `SELECT (password)` và `UPDATE (role, password)` từ role `anon`; chặn quyền `DELETE` tùy tiện trên bảng `evaluations`.
- Phía Server API: Cập nhật các route `/api/auth/*` gọi RPC bảo mật và an toàn.

**Tech Stack:** Next.js 16 (App Router), TypeScript, HTML5 Canvas API, Supabase PostgreSQL, Row Level Security (RLS).

**Spec:** [CLAUDE.md](file:///e:/Vibe%20Coding/KPT_TKV/CLAUDE.md) & User Security Hardening Step 3 requirements.

## Global Constraints
- Tuân thủ Next.js 16 App Router & Turbopack.
- Không làm gãy chức năng offline/fallback khi Supabase gián đoạn.
- Không để lộ mật khẩu qua PostgREST client `anon` key.
- Mọi hình ảnh logo nén phải giữ độ sắc nét trên màn hình và trang in PDF Báo cáo năm.

## Review Focus
1. Người dùng tải ảnh logo dung lượng lớn (>2MB, độ phân giải cao 4K) không được làm tràn bộ nhớ LocalStorage 5MB.
2. Kiểm tra `localStorage.setItem` khi đạt giới hạn hạn mức phải trả về cảnh báo an toàn, không được gây lỗi ứng dụng (Unhandled QuotaExceededError).
3. Người dùng vãng lai sử dụng anon key trên trình duyệt để `supabase.from('users').select('password')` phải nhận lỗi `permission denied for column password`.
4. Người dùng không thể gửi lệnh `supabase.from('evaluations').delete()` để xóa sạch 764 đánh giá hiện có.
5. `pushUserToSupabase` trong `supabaseSync.ts` khi cập nhật chức danh/phòng ban không được ghi đè giá trị `NULL` vào cột `password`.

---

### Task 1: Client Storage Quota Management & Automatic Image Compression

**Files:**
- Create: `src/lib/storageQuota.ts`
- Create: `src/lib/imageCompression.ts`
- Modify: `src/lib/companyConfig.ts`
- Modify: `src/components/CompanySettingsModal.tsx`
- Test: `tests/storage-quota.test.ts`

**Interfaces:**
- Produces `getLocalStorageUsage(): { usedBytes: number; usedFormatted: string; percentUsed: number }`
- Produces `safeSetLocalStorage(key: string, value: string): { success: boolean; error?: string }`
- Produces `compressImageFile(file: File, maxWidth?: number, maxHeight?: number, quality?: number): Promise<string>`

- [x] **Step 1: Write the failing test for storage quota and safe storage**
  Tạo `tests/storage-quota.test.ts` kiểm tra việc tính toán dung lượng byte, định dạng KB/MB và xử lý `safeSetLocalStorage`.
- [x] **Step 2: Run test to verify it fails**
  Chạy `npx tsx tests/storage-quota.test.ts` -> Thất bại vì `storageQuota.ts` chưa tồn tại.
- [x] **Step 3: Implement `src/lib/storageQuota.ts` and `src/lib/imageCompression.ts`**
  - Triển khai `getLocalStorageUsage()` và `safeSetLocalStorage()` trong `src/lib/storageQuota.ts`.
  - Triển khai `compressImageFile()` trong `src/lib/imageCompression.ts` dùng Canvas resize và WebP/JPEG compression.
- [x] **Step 4: Update `companyConfig.ts` and `CompanySettingsModal.tsx`**
  - Cập nhật `saveCompanyConfig` dùng `safeSetLocalStorage`.
  - Cập nhật `CompanySettingsModal` gọi `compressImageFile` khi người dùng chọn logo, hiển thị dung lượng trước/sau khi nén và thanh dung lượng lưu trữ LocalStorage.
- [x] **Step 5: Run tests and verify passing**
  Chạy `npx tsx tests/storage-quota.test.ts` -> PASS.
- [x] **Step 6: Commit**
  `git commit -m "feat(storage): add quota manager, safeSetLocalStorage, and client logo compression"`

---

### Task 2: Supabase Security Hardening & RPC Authentication

**Files:**
- Create: `supabase/migrations/20261012_security_hardening.sql`
- Modify: `src/app/api/auth/login/route.ts`
- Modify: `src/app/api/auth/change-password/route.ts`
- Modify: `src/app/api/auth/reset-password/route.ts`
- Modify: `src/lib/supabaseSync.ts`
- Test: `tests/supabase-security.test.ts`

**Interfaces:**
- Produces Postgres RPC `public.verify_user_credentials(p_manv text, p_password text)`
- Produces Postgres RPC `public.change_user_password(p_manv text, p_old_pass text, p_new_pass text)`
- Produces Postgres RPC `public.admin_reset_password(p_target_manv text)`
- Enforces Column Privileges: `REVOKE SELECT (password) ON public.users FROM anon;`
- Enforces Action Privileges: `REVOKE UPDATE (role, password) ON public.users FROM anon;` và `REVOKE DELETE ON public.evaluations FROM anon;`

- [x] **Step 1: Write failing test verifying column restriction and RPC auth**
  Tạo `tests/supabase-security.test.ts` kiểm tra:
  - Query `users` trực tiếp lấy `password` qua anon key bị lỗi phân quyền.
  - Gọi RPC `verify_user_credentials` trả về user hợp lệ nhưng không chứa mật khẩu.
- [x] **Step 2: Run test to verify initial state / failure**
  Chạy `npx tsx --env-file=.env.local tests/supabase-security.test.ts`.
- [x] **Step 3: Create and apply Supabase SQL Migration**
  - Viết `supabase/migrations/20261012_security_hardening.sql`.
  - Áp dụng migration lên database qua MCP `execute_sql`.
- [x] **Step 4: Update Server Auth Routes & `supabaseSync.ts`**
  - Cập nhật `/api/auth/login/route.ts` gọi RPC `verify_user_credentials`.
  - Cập nhật `/api/auth/change-password/route.ts` gọi RPC `change_user_password`.
  - Cập nhật `/api/auth/reset-password/route.ts` gọi RPC `admin_reset_password`.
  - Cập nhật `pushUserToSupabase` trong `supabaseSync.ts` không gửi cột `password` nếu `password` là undefined.
- [x] **Step 5: Run tests and verify passing**
  Chạy `npx tsx --env-file=.env.local tests/supabase-security.test.ts` -> PASS.
  Chạy `npm test` -> Toàn bộ các bộ test đều PASS.
- [x] **Step 6: Commit**
  `git commit -m "feat(db): enforce column permissions, lock evaluation deletion, and implement auth RPCs"`

---

### Task 3: Full Integration, Build & Browser Verification

**Files:**
- Modify: `package.json` (thêm test runner cho toàn bộ suites)
- Test: All tests (`npm test`), `npx tsc --noEmit`, `npm run build`
- Browser Validation: Kiểm tra giao diện Cài đặt Doanh nghiệp (upload logo, xem dung lượng storage).

- [x] **Step 1: Run full test suite & TypeScript check**
  - `npm test`
  - `npx tsc --noEmit`
- [x] **Step 2: Run production build**
  - `npm run build`
- [x] **Step 3: Browser Agent verification**
  - Mở trang web tại `http://localhost:3001`, đăng nhập Admin, mở modal Cài đặt thông tin doanh nghiệp, kiểm tra hiển thị dung lượng lưu trữ và tải ảnh logo.
- [x] **Step 4: Final commit & summary report**
  - `git commit -m "chore(release): complete step 3 security hardening and storage optimization"`
