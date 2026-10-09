import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

function cleanFilename(str: string): string {
  if (!str) return "Bao_Cao_KPI.xlsx";
  const ascii = str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (m) => (m === "đ" ? "d" : "D"))
    .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    .replace(/_+/g, "_")
    .replace(/\.xlsx$/i, "");
  return `${ascii || "Bao_Cao_KPI"}.xlsx`;
}

export async function POST(req: NextRequest) {
  try {
    let payload: {
      filename: string;
      sheets: Array<{ name: string; data: any[][] }>;
    } | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const raw = formData.get("payload") as string;
      if (raw) {
        payload = JSON.parse(raw);
      }
    } else {
      payload = await req.json();
    }

    if (!payload || !payload.sheets || payload.sheets.length === 0) {
      return NextResponse.json({ error: "Missing sheets data" }, { status: 400 });
    }

    const filename = cleanFilename(payload.filename);
    const wb = XLSX.utils.book_new();

    for (const s of payload.sheets) {
      const ws = XLSX.utils.aoa_to_sheet(s.data);
      // Auto column widths
      if (s.data.length > 0) {
        const colCount = Math.max(...s.data.map((r) => (Array.isArray(r) ? r.length : 0)));
        const colWidths = [];
        for (let col = 0; col < colCount; col++) {
          let maxLen = 10;
          for (const row of s.data) {
            const val = row[col];
            if (val !== undefined && val !== null) {
              maxLen = Math.max(maxLen, String(val).length);
            }
          }
          colWidths.push({ wch: Math.min(Math.max(maxLen + 2, 12), 45) });
        }
        ws["!cols"] = colWidths;
      }
      XLSX.utils.book_append_sheet(wb, ws, s.name || "Sheet1");
    }

    // Write to Buffer
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("Export Excel error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate Excel" }, { status: 500 });
  }
}
