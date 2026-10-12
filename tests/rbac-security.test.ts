import assert from "node:assert";
import { 
  getManagedDepartments, 
  canUserAddEmployees, 
  canUserManageAll,
  canUserAccessTab
} from "../src/lib/storage";
import { User } from "../src/types";

const mockUsers: Record<string, User> = {
  regularDTK: {
    manv: "TKV11",
    name: "Trịnh Thanh Thúy",
    dept: "ĐIỂM TẬP KẾT",
    title: "NHÂN VIÊN",
    role: "User",
  },
  regularKD: {
    manv: "TKV33",
    name: "Nguyễn Văn A",
    dept: "PHÒNG KINH DOANH",
    title: "NHÂN VIÊN",
    role: "User",
  },
  regularKT: {
    manv: "TKV01",
    name: "Trần Thị B",
    dept: "PHÒNG KẾ TOÁN",
    title: "NHÂN VIÊN",
    role: "User",
  },
  mgrDTK: {
    manv: "DTK01",
    name: "Quản lý Điểm Tập Kết",
    dept: "ĐIỂM TẬP KẾT",
    title: "QUẢN LÝ",
    role: "Manager",
  },
  mgrKD: {
    manv: "KD01",
    name: "Quản lý Kinh Doanh",
    dept: "PHÒNG KINH DOANH",
    title: "QUẢN LÝ",
    role: "Manager",
  },
  mgrKT: {
    manv: "KT01",
    name: "Quản lý Kế Toán",
    dept: "PHÒNG KẾ TOÁN",
    title: "QUẢN LÝ",
    role: "Manager",
  },
  mgrHC: {
    manv: "HC01",
    name: "Quản lý Hành Chính",
    dept: "HÀNH CHÍNH",
    title: "QUẢN LÝ",
    role: "Manager",
  },
  mgrIT: {
    manv: "TKV09",
    name: "Nguyễn Khắc Diệp",
    dept: "IT",
    title: "QUẢN LÝ IT",
    role: "Manager",
  },
  adminBGD: {
    manv: "BGD01",
    name: "Ban Giám Đốc",
    dept: "BAN GIÁM ĐỐC",
    title: "GIÁM ĐỐC",
    role: "Admin",
  },
};

console.log("=== RUNNING RBAC SECURITY TESTS ===");

// 1. Regular employees must NOT have managed departments
console.log("\n[Test 1] Regular employees must get empty managed departments");
const regularScopeDTK = getManagedDepartments(mockUsers.regularDTK);
assert.deepStrictEqual(
  regularScopeDTK, 
  [], 
  `Expected regular DTK user to have empty scope, but got: ${JSON.stringify(regularScopeDTK)}`
);

const regularScopeKD = getManagedDepartments(mockUsers.regularKD);
assert.deepStrictEqual(
  regularScopeKD, 
  [], 
  `Expected regular KD user to have empty scope, but got: ${JSON.stringify(regularScopeKD)}`
);

const regularScopeKT = getManagedDepartments(mockUsers.regularKT);
assert.deepStrictEqual(
  regularScopeKT, 
  [], 
  `Expected regular KT user to have empty scope, but got: ${JSON.stringify(regularScopeKT)}`
);
console.log("✓ PASS: Regular employees have empty managed scope");

// 2. Managers must have correct department scope
console.log("\n[Test 2] Managers have correct scope");
assert.deepStrictEqual(getManagedDepartments(mockUsers.mgrDTK), ["ĐIỂM TẬP KẾT"]);
assert.deepStrictEqual(getManagedDepartments(mockUsers.mgrKD), ["KHO", "CHMT", "PHÒNG KINH DOANH", "XUẤT NHẬP KHẨU"]);
assert.deepStrictEqual(getManagedDepartments(mockUsers.mgrKT), ["PHÒNG KẾ TOÁN"]);
assert.strictEqual(getManagedDepartments(mockUsers.mgrHC), "ALL");
assert.strictEqual(getManagedDepartments(mockUsers.mgrIT), "ALL");
assert.strictEqual(getManagedDepartments(mockUsers.adminBGD), "ALL");
console.log("✓ PASS: Managers and Admins have correct managed scopes");

// 3. Tab Access Guard (canUserAccessTab)
console.log("\n[Test 3] canUserAccessTab enforces RBAC");
assert.strictEqual(canUserAccessTab("admin", mockUsers.regularDTK), false, "Regular user must NOT access admin tab");
assert.strictEqual(canUserAccessTab("manager", mockUsers.regularDTK), false, "Regular user must NOT access manager tab");
assert.strictEqual(canUserAccessTab("evaluate", mockUsers.regularDTK), true, "Regular user can access evaluate tab");
assert.strictEqual(canUserAccessTab("history", mockUsers.regularDTK), true, "Regular user can access history tab");

assert.strictEqual(canUserAccessTab("admin", mockUsers.mgrKD), false, "Manager must NOT access admin tab");
assert.strictEqual(canUserAccessTab("manager", mockUsers.mgrKD), true, "Manager can access manager tab");

assert.strictEqual(canUserAccessTab("admin", mockUsers.adminBGD), true, "Admin can access admin tab");
assert.strictEqual(canUserAccessTab("manager", mockUsers.adminBGD), true, "Admin can access manager tab");
console.log("✓ PASS: Tab access strictly controlled by role");

// 4. canUserAddEmployees
console.log("\n[Test 4] canUserAddEmployees permissions");
assert.strictEqual(canUserAddEmployees(mockUsers.adminBGD), true, "Admin can add employees");
assert.strictEqual(canUserAddEmployees(mockUsers.mgrHC), true, "HC01 Manager can add employees");
assert.strictEqual(canUserAddEmployees(mockUsers.mgrKD), false, "KD01 Manager cannot add employees");
assert.strictEqual(canUserAddEmployees(mockUsers.regularDTK), false, "Regular employee cannot add employees");
console.log("✓ PASS: canUserAddEmployees verified");

console.log("\n ALL RBAC SECURITY TESTS PASSED!");
