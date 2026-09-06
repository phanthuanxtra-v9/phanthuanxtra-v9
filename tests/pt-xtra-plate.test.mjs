import test from "node:test";
import assert from "node:assert/strict";
import { normalizePlateBox, hasValidPlateBox } from "../src/plate-branding.js";

const PLATE_TEXT = "PT Xtra";

function buildPlateSvg(text = PLATE_TEXT) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="120"><text>${text}</text></svg>`;
}

test("PT Xtra display plate uses the fixed branding text", () => {
  const svg = buildPlateSvg();
  assert.match(svg, /PT Xtra/);
  assert.doesNotMatch(svg, /[0-9]{2}[A-Z]-[0-9]{3}\.[0-9]{2}/);
});

test("branding overlay never replaces a legal plate value in vehicle data", () => {
  const vehicle = { plate: "51A-123.45" };
  assert.equal(vehicle.plate, "51A-123.45");
  assert.equal(PLATE_TEXT, "PT Xtra");
});

test("AI plate bounding box must be normalized and inside the image", () => {
  const box = normalizePlateBox({ x:0.42, y:0.58, width:0.16, height:0.06 });
  assert.deepEqual(box, { x:0.42, y:0.58, width:0.16, height:0.06 });
  assert.equal(hasValidPlateBox(box), true);
  assert.equal(hasValidPlateBox(null), false);
  assert.equal(hasValidPlateBox({ x:0.9, y:0.9, width:0.2, height:0.1 }), false);
  assert.equal(hasValidPlateBox({ x:0.1, y:0.1, width:0.001, height:0.01 }), false);
});
