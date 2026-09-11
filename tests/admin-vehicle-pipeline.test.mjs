import test from "node:test";
import assert from "node:assert/strict";
import { handleAdminVehiclePipeline, isTrusted } from "../src/admin-vehicle-pipeline.js";
import { issueAdminToken, verifyAdminToken } from "../src/admin-auth.js";

const env = { ADMIN_TOKEN: "unit-test-admin-secret" };

async function authHeader() {
  const token = await issueAdminToken(env);
  return { Authorization: `Bearer ${token}` };
}

test("trusted PT Xtra publish artifacts are recognized", () => {
  assert.equal(isTrusted("https://phanthuanxtra.com/media/vehicles/publish-inbox-12-abcd.jpg"), true);
  assert.equal(isTrusted("https://phanthuanxtra.com/media/vehicles/publish-admin-lx600-abc.jpg"), true);
  assert.equal(isTrusted("https://example.com/car.jpg"), false);
});

test("valid admin session is accepted", async () => {
  const headers = await authHeader();
  const request = new Request("https://phanthuanxtra.com/api/admin/cars", { method: "POST", headers });
  const result = await verifyAdminToken(request, env);
  assert.equal(result.ok, true);
});

test("random bearer token is rejected before any admin operation", async () => {
  const request = new Request("https://phanthuanxtra.com/api/admin/cars", {
    method: "POST",
    headers: { Authorization: "Bearer random-not-a-session", "content-type": "application/json" },
    body: JSON.stringify({ id: "lx600", brand: "Lexus", model: "LX600", images: ["https://example.com/car.jpg"] })
  });
  const response = await handleAdminVehiclePipeline(request, env);
  assert.equal(response.status, 401);
});

test("Admin publish is blocked when no images are supplied", async () => {
  const headers = await authHeader();
  headers["content-type"] = "application/json";
  const request = new Request("https://phanthuanxtra.com/api/admin/cars", {
    method: "POST",
    headers,
    body: JSON.stringify({ id: "lx600", brand: "Lexus", model: "LX600" })
  });
  const response = await handleAdminVehiclePipeline(request, env);
  assert.equal(response.status, 400);
});
