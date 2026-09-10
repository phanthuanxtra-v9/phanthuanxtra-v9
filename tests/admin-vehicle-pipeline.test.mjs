import test from "node:test";
import assert from "node:assert/strict";
import { handleAdminVehiclePipeline, isTrusted } from "../src/admin-vehicle-pipeline.js";

test("trusted PT Xtra publish artifacts are recognized", () => {
  assert.equal(isTrusted("https://phanthuanxtra.com/media/vehicles/publish-inbox-12-abcd.jpg"), true);
  assert.equal(isTrusted("https://phanthuanxtra.com/media/vehicles/publish-admin-lx600-abc.jpg"), true);
  assert.equal(isTrusted("https://example.com/car.jpg"), false);
});

test("Admin publish is blocked when no images are supplied", async () => {
  const request = new Request("https://phanthuanxtra.com/api/admin/cars", {
    method: "POST",
    headers: { Authorization: "Bearer secret", "content-type": "application/json" },
    body: JSON.stringify({ id: "lx600", brand: "Lexus", model: "LX600" })
  });
  const response = await handleAdminVehiclePipeline(request, { ADMIN_TOKEN: "secret" });
  assert.equal(response.status, 400);
});
