import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_USERS } from "@/data/users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetManv = (body.targetManv || "").trim().toUpperCase();
    const requesterManv = (body.requesterManv || "").trim().toUpperCase();

    if (!targetManv || !requesterManv) {
      return NextResponse.json(
        { error: "Thiếu thông tin người yêu cầu hoặc nhân viên cần reset." },
        { status: 400 }
      );
    }

    // 1. Verify requester permissions
    let requesterUser: any = null;
    try {
      const { data } = await supabase
        .from("users")
        .select("manv, dept, title, role")
        .eq("manv", requesterManv)
        .maybeSingle();
      if (data) requesterUser = data;
    } catch (e) {
      console.warn("Error fetching requester from Supabase:", e);
    }

    if (!requesterUser) {
      requesterUser = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === requesterManv
      );
    }

    if (!requesterUser) {
      return NextResponse.json(
        { error: "Không xác định được danh tính người yêu cầu." },
        { status: 401 }
      );
    }

    const isAdmin = requesterUser.role === "Admin";
    const isHCManager =
      (requesterUser.dept || "").toUpperCase().includes("HÀNH CH") ||
      requesterManv.includes("HC");

    if (!isAdmin && !isHCManager) {
      return NextResponse.json(
        { error: "Bạn không có thẩm quyền đặt lại mật khẩu nhân viên." },
        { status: 403 }
      );
    }

    // 2. Fetch target user
    let targetUser: any = null;
    try {
      const { data } = await supabase
        .from("users")
        .select("manv, name, dept, title, role")
        .eq("manv", targetManv)
        .maybeSingle();
      if (data) targetUser = data;
    } catch (e) {
      console.warn("Error fetching target user from Supabase:", e);
    }

    if (!targetUser) {
      targetUser = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === targetManv
      );
    }

    if (!targetUser) {
      return NextResponse.json(
        { error: `Không tìm thấy nhân viên "${targetManv}".` },
        { status: 404 }
      );
    }

    // 3. Reset password to default "123"
    const { error: resetErr } = await supabase
      .from("users")
      .upsert({
        manv: targetUser.manv,
        name: targetUser.name,
        dept: targetUser.dept,
        title: targetUser.title || "NHÂN VIÊN",
        role: targetUser.role || "User",
        password: "123",
      });

    if (resetErr) {
      console.error("Failed to reset password in Supabase:", resetErr);
      return NextResponse.json(
        { error: "Lỗi cơ sở dữ liệu khi đặt lại mật khẩu." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Đã đặt lại mật khẩu cho ${targetUser.name} (${targetUser.manv}) về "123" thành công!`,
    });
  } catch (err: any) {
    console.error("Reset password API error:", err);
    return NextResponse.json(
      { error: err.message || "Lỗi xử lý đặt lại mật khẩu." },
      { status: 500 }
    );
  }
}
