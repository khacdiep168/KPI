import assert from "node:assert";
import {
  parseCsvText,
  parseStaffCsv,
  parseManagerCsv,
  detectPeriod
} from "../src/lib/syncGoogleSheets";

console.log("=== RUNNING GOOGLE SHEETS SYNC TESTS ===");

// [Test 1] CSV Parser handles commas and quotes correctly
console.log("\n[Test 1] parseCsvText handles standard and quoted CSV text");
const sampleCsv = `Timestamp,Mã số nhân viên,Họ và tên,Bộ phận,"Bạn đánh giá cho ai\n( Ghi đầy đủ họ tên. )",Score
10/29/2026 10:21:33,TKV39,LÊ HỒNG THÁI,ĐIỂM TẬP KẾT,LÊ HỒNG THÁI,"84,0"`;

const rows = parseCsvText(sampleCsv);
assert.strictEqual(rows.length, 2, "Should have 2 rows (header + 1 data row)");
assert.strictEqual(rows[0][0], "Timestamp");
assert.strictEqual(rows[1][1], "TKV39");
assert.strictEqual(rows[1][2], "LÊ HỒNG THÁI");
assert.strictEqual(rows[1][3], "ĐIỂM TẬP KẾT");
console.log("✓ PASS: parseCsvText correctly parsed quoted and multiline fields");

// [Test 2] detectPeriod correctly extracts period MM-YYYY
console.log("\n[Test 2] detectPeriod parses dates into MM-YYYY format");
assert.strictEqual(detectPeriod("10/29/2026 10:21:33", "4-2026"), "10-2026");
assert.strictEqual(detectPeriod("2026-05-28T15:05:08", ""), "05-2026");
assert.strictEqual(detectPeriod("5/27/2026 4:41:39", ""), "05-2026");
console.log("✓ PASS: detectPeriod parses date string accurately");

// [Test 3] parseStaffCsv extracts 10 criteria and calculates scores
console.log("\n[Test 3] parseStaffCsv parses 10 criteria for staff evaluations");
const mockStaffHeader = [
  "Timestamp", "Mã số nhân viên", "Họ và tên", "Bộ phận", "Bạn đánh giá cho ai",
  "Desc 1", "8", "Desc 2", "9", "Desc 3", "8", "Desc 4", "27",
  "Desc 5", "8", "Desc 6", "9", "Desc 7", "4", "Desc 8", "4",
  "Desc 9", "4", "Desc 10", "3", "Ý kiến cá nhân", "Email", "84", "Giỏi", "4-2026"
];
const mockStaffRow = [
  "10/29/2026 10:21:33", "TKV39", "LÊ HỒNG THÁI", "ĐIỂM TẬP KẾT", "LÊ HỒNG THÁI",
  "C1 desc", "8", "C2 desc", "9", "C3 desc", "8", "C4 desc", "27",
  "C5 desc", "8", "C6 desc", "9", "C7 desc", "4", "C8 desc", "4",
  "C9 desc", "4", "C10 desc", "3", "Hoàn thành tốt", "thai@gmail.com", "84", "Giỏi", "4-2026"
];
const staffCsvContent = [mockStaffHeader.join(","), mockStaffRow.join(",")].join("\n");
const parsedStaff = parseStaffCsv(staffCsvContent);
assert.strictEqual(parsedStaff.length, 1);
const staffItem = parsedStaff[0];
assert.strictEqual(staffItem.evaluator_manv, "TKV39");
assert.strictEqual(staffItem.evaluation_type, "STAFF");
assert.strictEqual(staffItem.period, "10-2026");
assert.strictEqual(staffItem.q1, 8);
assert.strictEqual(staffItem.q2, 9);
assert.strictEqual(staffItem.q3, 8);
assert.strictEqual(staffItem.q4, 27);
assert.strictEqual(staffItem.q5, 8);
assert.strictEqual(staffItem.q6, 9);
assert.strictEqual(staffItem.q7, 4);
assert.strictEqual(staffItem.q8, 4);
assert.strictEqual(staffItem.q9, 4);
assert.strictEqual(staffItem.q10, 3);
assert.strictEqual(staffItem.self_total_score, 84);
assert.strictEqual(staffItem.self_classification, "Giỏi");
assert.strictEqual(staffItem.self_feedback, "Hoàn thành tốt");
assert.strictEqual(staffItem.status, "SUBMITTED");
console.log("✓ PASS: parseStaffCsv parsed staff evaluation properly");

// [Test 4] parseManagerCsv extracts 7 criteria, sets q8-q10=0, evaluation_type='MANAGER'
console.log("\n[Test 4] parseManagerCsv parses 7 criteria for manager evaluations");
const mockMgrHeader = [
  "Timestamp", "Mã số nhân viên", "Họ và Tên", "Bộ Phận", "Chức Vụ", "Bạn đánh giá cho ai",
  "Desc 1", "5", "Desc 2", "13", "Desc 3", "28", "Desc 4", "18",
  "Desc 5", "9", "Desc 6", "9", "Desc 7", "9", "Tổng điểm đánh giá", "Xếp Loại"
];
const mockMgrRow = [
  "10/29/2026 10:19:09", "TKV42", "LÂM TẤN ĐẠT", "ĐIỂM TẬP KẾT", "QUẢN LÝ", "LÂM TẤN ĐẠT",
  "Desc 1", "5", "Desc 2", "13", "Desc 3", "28", "Desc 4", "18",
  "Desc 5", "9", "Desc 6", "9", "Desc 7", "9", "91", "Giỏi"
];
const mgrCsvContent = [mockMgrHeader.join(","), mockMgrRow.join(",")].join("\n");
const parsedMgr = parseManagerCsv(mgrCsvContent);
assert.strictEqual(parsedMgr.length, 1);
const mgrItem = parsedMgr[0];
assert.strictEqual(mgrItem.evaluator_manv, "TKV42");
assert.strictEqual(mgrItem.evaluation_type, "MANAGER");
assert.strictEqual(mgrItem.period, "10-2026");
assert.strictEqual(mgrItem.q1, 5);
assert.strictEqual(mgrItem.q2, 13);
assert.strictEqual(mgrItem.q3, 28);
assert.strictEqual(mgrItem.q4, 18);
assert.strictEqual(mgrItem.q5, 9);
assert.strictEqual(mgrItem.q6, 9);
assert.strictEqual(mgrItem.q7, 9);
assert.strictEqual(mgrItem.q8, 0);
assert.strictEqual(mgrItem.q9, 0);
assert.strictEqual(mgrItem.q10, 0);
assert.strictEqual(mgrItem.self_total_score, 91);
assert.strictEqual(mgrItem.self_classification, "Giỏi");
console.log("✓ PASS: parseManagerCsv parsed manager evaluation properly");

// [Test 5] API Route /api/sync-google-sheets permission checks
console.log("\n[Test 5] /api/sync-google-sheets route enforces Admin role");
import { POST as syncRouteHandler } from "../src/app/api/sync-google-sheets/route";
import { NextRequest } from "next/server";

async function testApiRoute() {
  // 5a. Missing requester -> 401
  const reqMissing = new NextRequest("http://localhost:3000/api/sync-google-sheets", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const respMissing = await syncRouteHandler(reqMissing);
  assert.strictEqual(respMissing.status, 401);
  console.log("✓ PASS: Missing requester rejected with 401");

  // 5b. Regular employee requester (TKV11) -> 403 Forbidden
  const reqEmployee = new NextRequest("http://localhost:3000/api/sync-google-sheets", {
    method: "POST",
    body: JSON.stringify({ requesterManv: "TKV11" }),
  });
  const respEmployee = await syncRouteHandler(reqEmployee);
  assert.strictEqual(respEmployee.status, 403);
  console.log("✓ PASS: Non-admin requester rejected with 403 Forbidden");

  console.log("\n🎉 ALL GOOGLE SHEETS SYNC TESTS PASSED!");
}

testApiRoute().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
