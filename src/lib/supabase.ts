import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  if (typeof window !== "undefined") {
    console.warn("Cảnh báo: Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc NEXT_PUBLIC_SUPABASE_ANON_KEY trong môi trường cấu hình.");
  }
}

export const supabase = createClient(
  SUPABASE_URL || "https://jaewyxazjvqtvqifdmlw.supabase.co",
  SUPABASE_ANON_KEY || "missing-anon-key"
);
