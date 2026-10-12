import assert from "node:assert";
import {
  getLocalStorageUsage,
  safeSetLocalStorage,
  formatBytes,
} from "../src/lib/storageQuota";

console.log("=== RUNNING STORAGE QUOTA & SAFE STORAGE TESTS ===");

// 1. Test formatBytes
console.log("\n[Test 1] formatBytes formats byte sizes accurately");
assert.strictEqual(formatBytes(0), "0 B");
assert.strictEqual(formatBytes(1024), "1.0 KB");
assert.strictEqual(formatBytes(1024 * 1024), "1.0 MB");
assert.strictEqual(formatBytes(2.5 * 1024 * 1024), "2.5 MB");
console.log("✓ PASS: formatBytes formats sizes correctly");

// 2. Test in Node.js environment (where window / localStorage is mocked or handled gracefully)
console.log("\n[Test 2] Storage functions handle non-browser / mock environment safely");
const usageInitial = getLocalStorageUsage();
assert.ok(typeof usageInitial.usedBytes === "number");
assert.ok(typeof usageInitial.percentUsed === "number");
assert.ok(typeof usageInitial.usedFormatted === "string");
console.log(`✓ PASS: Initial usage reported: ${usageInitial.usedFormatted} (${usageInitial.percentUsed.toFixed(1)}%)`);

// Mock window & localStorage to test quota calculations
const store = new Map<string, string>();
(global as any).window = {};
(global as any).localStorage = {
  getItem: (key: string) => store.get(key) || null,
  setItem: (key: string, val: string) => store.set(key, val),
  removeItem: (key: string) => store.delete(key),
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: (index: number) => Array.from(store.keys())[index] || null,
};

console.log("\n[Test 3] safeSetLocalStorage stores items and tracks byte consumption");
const testPayload = "A".repeat(1000); // 1000 characters
const saveRes = safeSetLocalStorage("test_key", testPayload);
assert.strictEqual(saveRes.success, true);
assert.strictEqual(store.get("test_key"), testPayload);

const usageAfter = getLocalStorageUsage();
// Key (8 chars) + Value (1000 chars) in UTF-16 = 2016 bytes
assert.ok(usageAfter.usedBytes >= 1000, `Expected usedBytes >= 1000, got ${usageAfter.usedBytes}`);
console.log(`✓ PASS: Storage usage measured: ${usageAfter.usedFormatted}`);

console.log("\n[Test 4] safeSetLocalStorage catches quota exceeded errors gracefully");
(global as any).localStorage.setItem = () => {
  const err = new Error("QuotaExceededError");
  err.name = "QuotaExceededError";
  throw err;
};

const quotaRes = safeSetLocalStorage("huge_key", "huge_payload");
assert.strictEqual(quotaRes.success, false);
assert.ok(quotaRes.error && quotaRes.error.includes("vượt quá dung lượng"), `Error message should mention quota: ${quotaRes.error}`);
console.log("✓ PASS: QuotaExceededError trapped safely without throwing uncaught exception");

console.log("\n ALL STORAGE QUOTA TESTS PASSED!");
