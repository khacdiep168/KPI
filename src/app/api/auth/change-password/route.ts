import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_USERS } from "@/data/users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const manv = (body.manv || "").trim().toUpperCase();
    const oldPassword = (body.oldPassword || "").trim();
    const newPassword = (body.newPassword || "").trim();

    if (!manv) {
      return NextResponse.json(
        { error: "Vui lòng nhập Mã nhân viên (MANV)." },
        { status: 400 }
      );
    }

    if (!oldPassword) {
      return NextResponse.json(
        { error: "Vui lòng nhập mật khẩu hiện tại." },
        { status: 400 }
      );
    }

    if (!newPassword || newPassword.length < 4) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 4 ký tự." },
        { status: 400 }
      );
    }

    if (newPassword === oldPassword) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải khác với mật khẩu hiện tại." },
        { status: 400 }
      );
    }

    // 1. Fetch current password from Supabase
    let matchedUser: any = null;
    let savedPass = "";

    try {
      const { data, error } = await supabase
        .from("users")
        .select("manv, name, dept, title, role, password")
        .eq("manv", manv)
        .maybeSingle();

      if (!error && data) {
        matchedUser = data;
        savedPass = (data.password || "").trim();
      }
    } catch (dbErr) {
      console.warn("Supabase check error:", dbErr);
    }

    // Fallback to seed user if not in Supabase yet
    if (!matchedUser) {
      const seed = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === manv
      );
      if (seed) {
        matchedUser = seed;
        savedPass = (seed.password || "").trim();
      }
    }

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin nhân viên." },
        { status: 404 }
      );
    }

    // 2. Validate old password
    const isOldValid = savedPass
      ? oldPassword === savedPass
      : oldPassword === "123" || oldPassword === "123456";

    if (!isOldValid) {
      return NextResponse.json(
        { error: "Mật khẩu hiện tại không chính xác." },
        { status: 401 }
      );
    }

    // 3. Update password in Supabase
    const { error: updateErr } = await supabase
      .from("users")
      .upsert({
        manv: matchedUser.manv,
        name: matchedUser.name,
        dept: matchedUser.dept,
        title: matchedUser.title,
        role: matchedUser.role,
        password: newPassword,
      });

    if (updateErr) {
      console.error("Failed to update password in Supabase:", updateErr);
      return NextResponse.json(
        { error: "Lỗi lưu mật khẩu mới vào cơ sở dữ liệu." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (err: any) {
    console.error("Change password API error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi xử lý đổi mật khẩu." },
      { status: 500 }
    );
  }
}
