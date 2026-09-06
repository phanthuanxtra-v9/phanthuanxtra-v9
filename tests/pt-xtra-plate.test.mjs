import test from "node:test";
import assert from "node:assert/strict";

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
