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

    // 1. Authenticate via secure RPC function verify_user_credentials
    let matchedUser: any = null;

    try {
      const { data: rpcUser, error: rpcErr } = await supabase.rpc(
        "verify_user_credentials",
        {
          p_manv: manv,
          p_password: password,
        }
      );

      if (!rpcErr && rpcUser) {
        matchedUser = rpcUser;
      }
    } catch (rpcErr) {
      console.warn("Supabase RPC auth lookup failed, checking fallback:", rpcErr);
    }

    // 2. Fallback to seed users if RPC did not match (offline or unmigrated user)
    if (!matchedUser) {
      let userProfile: any = null;
      let dbReachable = false;
      try {
        const { data: dbUser, error: dbErr } = await supabase
          .from("users")
          .select("manv, name, dept, title, role, status")
          .eq("manv", manv)
          .maybeSingle();
        if (!dbErr) {
          dbReachable = true;
          if (dbUser) userProfile = dbUser;
        }
      } catch (e) {
        // Ignore db query failure
      }

      // If database is reachable but user was not found, the user does not exist (or was deleted).
      // Only fall back to seed users if the database is offline/unreachable.
      if (!userProfile && !dbReachable) {
        const seed = INITIAL_USERS.find(
          (u) => u.manv.trim().toUpperCase() === manv
        );
        if (seed) userProfile = seed;
      }

      if (!userProfile) {
        return NextResponse.json(
          { error: `Mã nhân viên "${manv}" không tìm thấy trong hệ thống.` },
          { status: 404 }
        );
      }

      const expectedFallbackPass = (INITIAL_USER_PASSWORDS[manv] || "123").trim();
      if (password === expectedFallbackPass) {
        matchedUser = userProfile;
      } else {
        return NextResponse.json(
          { error: "Mật khẩu không chính xác. Vui lòng thử lại." },
          { status: 401 }
        );
      }
    }

    // Check if account is inactive / locked
    if (matchedUser.status === "INACTIVE") {
      return NextResponse.json(
        { error: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động. Vui lòng liên hệ Quản trị viên." },
        { status: 403 }
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
