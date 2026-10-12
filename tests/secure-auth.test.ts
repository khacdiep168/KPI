import assert from "node:assert";
import { getUsers, resetUsersStorage } from "../src/lib/storage";

console.log("=== RUNNING SECURE AUTH & DATA SANITIZATION TESTS ===");

// 1. Verify that getUsers() never leaks password to the client
console.log("\n[Test 1] getUsers() must never expose password field");
const clientUsers = getUsers();
assert.ok(clientUsers.length > 0, "Users list should not be empty");

for (const user of clientUsers) {
  assert.strictEqual(
    (user as any).password,
    undefined,
    `Security violation: User ${user.manv} contains password in client data!`
  );
}
console.log(`✓ PASS: All ${clientUsers.length} users have NO password field in client storage`);

// 2. Verify that resetUsersStorage() also strips passwords
console.log("\n[Test 2] resetUsersStorage() strips password field");
const resetUsers = resetUsersStorage();
for (const user of resetUsers) {
  assert.strictEqual(
    (user as any).password,
    undefined,
    `Security violation: User ${user.manv} contains password after reset!`
  );
}
console.log("✓ PASS: resetUsersStorage() is clean of passwords");

// 2b. Verify that INITIAL_USERS in src/data/users has no passwords in client bundle
console.log("\n[Test 2b] INITIAL_USERS source contains NO plaintext password");
import { INITIAL_USERS } from "../src/data/users";
for (const u of INITIAL_USERS) {
  assert.strictEqual(
    u.password,
    undefined,
    `Security violation: INITIAL_USERS in src/data/users still contains password for ${u.manv}!`
  );
}
console.log("✓ PASS: INITIAL_USERS has NO plaintext password in client codebase");

// 3. Test Server Auth Login API Route logic directly
console.log("\n[Test 3] Testing /api/auth/login route handler");
import { POST as loginHandler } from "../src/app/api/auth/login/route";

async function testLoginRoute() {
  // 3a. Successful Admin Login
  const adminReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manv: "BGD01", password: "bgd@2026" }),
  });
  const adminRes = await loginHandler(adminReq as any);
  assert.strictEqual(adminRes.status, 200, "Admin login should return 200");
  const adminData = await adminRes.json();
  assert.strictEqual(adminData.success, true);
  assert.strictEqual(adminData.user.manv, "BGD01");
  assert.strictEqual(adminData.user.role, "Admin");
  assert.strictEqual(adminData.user.password, undefined, "Login response MUST NOT contain password!");
  console.log("✓ PASS: Admin login successful and password omitted from response");

  // 3b. Successful Regular Employee Login
  const empReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manv: "TKV11", password: "abc" }),
  });
  const empRes = await loginHandler(empReq as any);
  assert.strictEqual(empRes.status, 200, "Employee login should return 200");
  const empData = await empRes.json();
  assert.strictEqual(empData.success, true);
  assert.strictEqual(empData.user.manv, "TKV11");
  assert.strictEqual(empData.user.role, "User");
  assert.strictEqual(empData.user.password, undefined, "Login response MUST NOT contain password!");
  console.log("✓ PASS: Employee login successful and password omitted from response");

  // 3c. Failed Login with wrong password
  const failReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manv: "TKV11", password: "wrong-password-999" }),
  });
  const failRes = await loginHandler(failReq as any);
  assert.strictEqual(failRes.status, 401, "Wrong password should return 401");
  const failData = await failRes.json();
  assert.ok(failData.error.includes("Mật khẩu không chính xác"));
  console.log("✓ PASS: Wrong password rejected with 401 Unauthorized");

  // 3d. Non-existent employee
  const missingReq = new Request("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ manv: "UNKNOWN_MANV_99", password: "123" }),
  });
  const missingRes = await loginHandler(missingReq as any);
  assert.strictEqual(missingRes.status, 404, "Unknown MANV should return 404");
  console.log("✓ PASS: Unknown user rejected with 404 Not Found");
}

// 4. Test Server Reset Password API permissions
console.log("\n[Test 4] Testing /api/auth/reset-password permissions");
import { POST as resetHandler } from "../src/app/api/auth/reset-password/route";

async function testResetRoute() {
  // Unauthorized requester (regular user TKV11)
  const unauthReq = new Request("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetManv: "TKV33", requesterManv: "TKV11" }),
  });
  const unauthRes = await resetHandler(unauthReq as any);
  assert.strictEqual(unauthRes.status, 403, "Regular user should be rejected from resetting passwords");
  console.log("✓ PASS: Unauthorized requester rejected with 403 Forbidden");

  // Authorized Admin requester (BGD01)
  const authReq = new Request("http://localhost:3000/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetManv: "TKV33", requesterManv: "BGD01" }),
  });
  const authRes = await resetHandler(authReq as any);
  assert.strictEqual(authRes.status, 200, "Admin should be allowed to reset passwords");
  const authData = await authRes.json();
  assert.strictEqual(authData.success, true);
  console.log("✓ PASS: Authorized Admin requester successfully reset password");
}

async function run() {
  await testLoginRoute();
  await testResetRoute();
  console.log("\n ALL SECURE AUTH TESTS PASSED!");
}

run().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
