import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { INITIAL_USERS } from "@/data/users";
import { syncGoogleSheetsToSupabase } from "@/lib/syncGoogleSheets";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requesterManv = (body.requesterManv || "").trim().toUpperCase();

    if (!requesterManv) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập với tài khoản Admin để thực hiện đồng bộ." },
        { status: 401 }
      );
    }

    // 1. Xác thực quyền Admin
    let requesterUser: any = null;
    try {
      const { data } = await supabase
        .from("users")
        .select("manv, dept, title, role")
        .eq("manv", requesterManv)
        .maybeSingle();
      if (data) requesterUser = data;
    } catch (e) {
      console.warn("Không thể truy vấn user từ Supabase:", e);
    }

    if (!requesterUser) {
      requesterUser = INITIAL_USERS.find(
        (u) => u.manv.trim().toUpperCase() === requesterManv
      );
    }

    if (!requesterUser) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin tài khoản người yêu cầu." },
        { status: 401 }
      );
    }

    const isAdmin = requesterUser.role === "Admin";
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện chức năng này. Chỉ Admin mới được đồng bộ." },
        { status: 403 }
      );
    }

    // 2. Thực hiện đồng bộ
    const staffUrl = body.staffUrl?.trim() || undefined;
    const mgrUrl = body.mgrUrl?.trim() || undefined;
    const targetPeriod = body.targetPeriod?.trim() || undefined;

    const result = await syncGoogleSheetsToSupabase({
      staffUrl,
      mgrUrl,
      targetPeriod,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Lỗi khi đồng bộ Google Sheets:", error);
    return NextResponse.json(
      { error: error.message || "Đã xảy ra lỗi trong quá trình đồng bộ." },
      { status: 500 }
    );
  }
}
