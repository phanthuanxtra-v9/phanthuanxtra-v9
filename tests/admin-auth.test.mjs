import test from "node:test";
import assert from "node:assert/strict";
import { issueAdminToken, verifyAdminToken } from "../src/admin-auth.js";

const env = { ADMIN_TOKEN: "unit-test-admin-secret" };

async function requestWith(token) {
  return new Request("https://phanthuanxtra.com/api/admin/dashboard", {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
}

test("issued admin token verifies", async () => {
  const token = await issueAdminToken(env);
  const result = await verifyAdminToken(await requestWith(token), env);
  assert.equal(result.ok, true);
  assert.ok(result.exp > Math.floor(Date.now() / 1000));
});

test("missing and malformed authorization are rejected", async () => {
  assert.equal((await verifyAdminToken(await requestWith(""), env)).ok, false);
  assert.equal((await verifyAdminToken(await requestWith("random"), env)).ok, false);
  assert.equal((await verifyAdminToken(await requestWith("ptx1.1.abc.def"), env)).ok, false);
});

test("tampering with a valid token is rejected", async () => {
  const token = await issueAdminToken(env);
  const parts = token.split(".");
  parts[1] = String(Number(parts[1]) + 1);
  const result = await verifyAdminToken(await requestWith(parts.join(".")), env);
  assert.equal(result.ok, false);
});

test("wrong signing secret is rejected", async () => {
  const token = await issueAdminToken(env);
  const result = await verifyAdminToken(await requestWith(token), { ADMIN_TOKEN: "different-secret" });
  assert.equal(result.ok, false);
});
