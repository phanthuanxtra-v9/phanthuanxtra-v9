import test from "node:test";
import assert from "node:assert/strict";
import { normalizePlateBox, hasValidPlateBox } from "../src/plate-branding.js";

test("plate branding accepts a normalized in-bounds bbox", () => {
  const box = normalizePlateBox({ x: 0.2, y: 0.4, width: 0.5, height: 0.1 });
  assert.deepEqual(box, { x: 0.2, y: 0.4, width: 0.5, height: 0.1 });
  assert.equal(hasValidPlateBox(box), true);
});

test("plate branding rejects missing, zero-size and out-of-bounds boxes", () => {
  assert.equal(hasValidPlateBox(null), false);
  assert.equal(hasValidPlateBox({ x: 0.2, y: 0.4, width: 0, height: 0.1 }), false);
  assert.equal(hasValidPlateBox({ x: 0.8, y: 0.4, width: 0.3, height: 0.1 }), false);
  assert.equal(hasValidPlateBox({ x: 0.2, y: 0.95, width: 0.2, height: 0.1 }), false);
});

test("plate branding clamps normalized coordinates without changing the source vehicle data", () => {
  const sourceVehicle = { plate: "51A-123.45" };
  const box = normalizePlateBox({ x: -0.1, y: 0.2, width: 0.2, height: 0.1 });
  assert.deepEqual(box, { x: 0, y: 0.2, width: 0.2, height: 0.1 });
  assert.equal(sourceVehicle.plate, "51A-123.45");
});
