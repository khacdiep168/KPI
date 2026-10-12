# Secure Authentication & Supabase Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

## Overview
Transform the client-side plaintext authentication and storage model into a secure, server-side authenticated architecture:
1. Prevent plaintext password exposure in `localStorage` and client DevTools.
2. Implement server-side authentication API routes (`/api/auth/login`, `/api/auth/change-password`, `/api/auth/reset-password`).
3. Sanitize `supabaseSync.ts` user synchronization to omit the `password` column completely.
4. Clean hardcoded JWT tokens in `src/lib/supabase.ts`.

---

## Tasks

### Task 1: Create Server-Side Auth API Endpoints
- [ ] Create `src/app/api/auth/login/route.ts` validating credentials server-side and returning sanitized user profile.
- [ ] Create `src/app/api/auth/change-password/route.ts` verifying old password and persisting new password.
- [ ] Create `src/app/api/auth/reset-password/route.ts` verifying requester role before resetting passwords to default "123".

### Task 2: Sanitize Client-Side User Data & Sync
- [ ] Update `src/lib/supabaseSync.ts` so `syncFromSupabase` queries only `manv, name, dept, title, role, status` and never the `password` field.
- [ ] Update `src/lib/storage.ts` so `updateUserPassword` and `resetUserPasswordToDefault` call the server API routes.
- [ ] Sanitize `src/data/users.ts` so client seed lists do not expose company passwords in browser source maps.

### Task 3: Update Login & Password Modals
- [ ] Update `src/components/LoginForm.tsx` to authenticate against `/api/auth/login` asynchronously with loading indicator and error feedback.
- [ ] Update `src/components/ChangePasswordModal.tsx` to call `/api/auth/change-password` asynchronously.
- [ ] Clean hardcoded JWT token string from `src/lib/supabase.ts`.

### Task 4: Automated Testing & Verification
- [ ] Create automated test `tests/secure-auth.test.ts` verifying server auth routes, credential validation, and password omission.
- [ ] Run test suite with `npx tsx tests/secure-auth.test.ts`.
- [ ] Run `npx tsc --noEmit` and `npm run build`.
- [ ] Verify in browser via Browser Agent that login, change password, and admin features work seamlessly.
