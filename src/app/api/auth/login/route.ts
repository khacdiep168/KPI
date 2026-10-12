import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_USERS } from "@/data/users";
import { INITIAL_USER_PASSWORDS } from "@/server/serverSeeds";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const manv = (body.manv || "").trim().toUpperCase();
    const password = (body.password || "").trim();

    if (!manv) {
      return NextResponse.json(
        { error: "Vui lòng nhập Mã nhân viên (MANV)." },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu." },
        { status: 400 }
      );
    }

    // 1. Try querying Supabase
    let matchedUser: any = null;
    let savedPass = "";

    try {
      const { data, error } = await supabase
        .from("users")
        .select("manv, name, dept, title, role, status, password")
        .eq("manv", manv)
        .maybeSingle();

      if (!error && data) {
        matchedUser = data;
        savedPass = (data.password || "").trim();
      }
    } catch (dbErr) {
      console.warn("Supabase auth lookup failed, checking seed users:", dbErr);
    }

    // 2. Fallback to INITIAL_USERS if not found in Supabase
    if (!matchedUser) {
      const seed = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === manv
      );
      if (seed) {
        matchedUser = seed;
        savedPass = (INITIAL_USER_PASSWORDS[manv] || "123").trim();
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: `Mã nhân viên "${manv}" không tìm thấy trong hệ thống.` },
        { status: 404 }
      );
    }

    // Check if account is inactive / locked
    if (matchedUser.status === "INACTIVE") {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ Quản trị viên." },
        { status: 403 }
      );
    }

    // 3. Verify password
    const isMatch = savedPass
      ? password === savedPass
      : password === "123" || password === "123456";

    if (!isMatch) {
      return NextResponse.json(
        { error: "Mật khẩu không chính xác. Vui lòng thử lại." },
        { status: 401 }
      );
    }

    // 4. Return sanitized user profile (NEVER include password)
    const sanitizedUser = {
      manv: matchedUser.manv.trim().toUpperCase(),
      name: matchedUser.name,
      dept: matchedUser.dept,
      title: matchedUser.title || "NHÂN VIÊN",
      role: matchedUser.role || "User",
      status: matchedUser.status || "ACTIVE",
    };

    return NextResponse.json({
      success: true,
      user: sanitizedUser,
    });
  } catch (err: any) {
    console.error("Auth login API error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi xử lý đăng nhập hệ thống." },
      { status: 500 }
    );
  }
}
