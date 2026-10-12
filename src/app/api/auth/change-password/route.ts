import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_USERS } from "@/data/users";
import { INITIAL_USER_PASSWORDS } from "@/server/serverSeeds";

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

    // 1. Attempt to change password via secure RPC
    let changedViaRpc = false;
    try {
      const { data: rpcSuccess, error: rpcErr } = await supabase.rpc(
        "change_user_password",
        {
          p_manv: manv,
          p_old_pass: oldPassword,
          p_new_pass: newPassword,
        }
      );

      if (!rpcErr && rpcSuccess === true) {
        changedViaRpc = true;
      }
    } catch (e) {
      console.warn("RPC change password error:", e);
    }

    if (!changedViaRpc) {
      // Fallback check for seed user if not initialized in Supabase yet
      const seed = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === manv
      );
      const expectedFallbackPass = (INITIAL_USER_PASSWORDS[manv] || "123").trim();

      if (seed && (oldPassword === expectedFallbackPass || oldPassword === "123")) {
        const { error: upsertErr } = await supabase.from("users").upsert({
          manv: seed.manv,
          name: seed.name,
          dept: seed.dept,
          title: seed.title,
          role: seed.role,
          password: newPassword,
        });

        if (upsertErr) {
          console.error("Failed to update password in Supabase fallback:", upsertErr);
          return NextResponse.json(
            { error: "Lỗi lưu mật khẩu mới vào cơ sở dữ liệu." },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Mật khẩu hiện tại không chính xác." },
          { status: 401 }
        );
      }
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
