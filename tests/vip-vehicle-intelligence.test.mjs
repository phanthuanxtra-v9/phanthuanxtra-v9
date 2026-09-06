import assert from "node:assert/strict";
import test from "node:test";
import { buildAskAiAgentRequest, buildVipReport, crossValidateVipSources } from "../src/vip-vehicle-intelligence.js";

test("separates documentary identity from current up-form", () => {
  const result = buildVipReport([
    { type: "registration_document", confidence: 0.99, claims: { brand: "Lexus", model: "LX600", production_year: 2021, vin: "VIN-1" } },
    { type: "inspection_document", confidence: 0.98, claims: { brand: "Lexus", model: "LX600", production_year: 2021, vin: "VIN-1" } },
    { type: "vehicle_image", confidence: 0.9, claims: { brand: "Lexus", model: "LX600", model_year: 2026, form_state: "up_form", modifications: ["front bumper", "headlamps"] } }
  ]);

  assert.equal(result.vehicle_identity.production_year, 2021);
  assert.equal(result.current_form, "up_form");
  assert.match(result.conclusion, /up-form/i);
  assert.equal(result.needs_review, true);
});

test("reports conflicting identity instead of choosing silently", () => {
  const result = crossValidateVipSources([
    { type: "registration_document", confidence: 1, claims: { brand: "BMW", model: "X5", production_year: 2021 } },
    { type: "vehicle_image", confidence: 0.8, claims: { brand: "BMW", model: "X6", form_state: "modified" } }
  ]);

  assert.equal(result.needs_review, true);
  assert.ok(result.conflicts.some((c) => c.field === "model"));
});

test("builds an external-agent request without secrets", () => {
  const request = buildAskAiAgentRequest({ text: "Lexus LX600", documents: [{ kind: "registration" }], image_references: ["r2:key"] });
  assert.equal(request.source, "phanthuanxtra-vip-bot");
  assert.equal(request.task, "vehicle_intelligence");
  assert.equal("token" in request, false);
  assert.ok(request.rules.includes("do_not_infer_production_year_from_styling_only"));
});
