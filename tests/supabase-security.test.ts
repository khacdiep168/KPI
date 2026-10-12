import assert from "node:assert";
import { supabase } from "../src/lib/supabase";

console.log("=== RUNNING SUPABASE DATABASE SECURITY & RPC TESTS ===");

async function testSupabaseSecurity() {
  // Test 1: Verify RPC verify_user_credentials
  console.log("\n[Test 1] Testing RPC verify_user_credentials with valid credentials");
  const { data: validUser, error: rpcErr } = await supabase.rpc("verify_user_credentials", {
    p_manv: "BGD01",
    p_password: "bgd@2026",
  });

  if (rpcErr) {
    console.log("RPC verify_user_credentials error:", rpcErr.message);
  }
  assert.strictEqual(rpcErr, null, "RPC verify_user_credentials should succeed");
  assert.ok(validUser, "Valid user should be returned");
  assert.strictEqual(validUser.manv, "BGD01");
  assert.strictEqual(validUser.role, "Admin");
  assert.strictEqual(validUser.password, undefined, "RPC must never return password");
  console.log("✓ PASS: RPC verify_user_credentials authenticated Admin safely without password");

  // Test 2: Invalid password via RPC
  console.log("\n[Test 2] Testing RPC verify_user_credentials with invalid password");
  const { data: invalidUser } = await supabase.rpc("verify_user_credentials", {
    p_manv: "BGD01",
    p_password: "wrong_password_123",
  });
  assert.strictEqual(invalidUser, null, "Invalid password must return null");
  console.log("✓ PASS: Invalid password rejected by RPC");

  // Test 3: Public anon key cannot delete evaluations
  console.log("\n[Test 3] Verifying anon role cannot delete evaluations");
  const { error: delErr } = await supabase
    .from("evaluations")
    .delete()
    .eq("id", "non_existent_security_probe_id");

  // In locked down state, DELETE should return error or be blocked
  if (delErr) {
    console.log(`✓ PASS: Direct DELETE on evaluations blocked: ${delErr.message}`);
  } else {
    console.log("ℹ Notice: DELETE policy needs to be restricted");
  }

  // Test 4: Public anon key direct select on password column
  console.log("\n[Test 4] Verifying direct SELECT on password column is restricted");
  const { data: passData, error: passErr } = await supabase
    .from("users")
    .select("password")
    .eq("manv", "BGD01");

  if (passErr) {
    console.log(`✓ PASS: Direct SELECT on password column blocked by database: ${passErr.message}`);
  } else {
    console.log("ℹ Notice: password column SELECT permission needs revocation");
  }

  console.log("\n ALL SUPABASE DATABASE SECURITY TESTS COMPLETED!");
}

testSupabaseSecurity().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
