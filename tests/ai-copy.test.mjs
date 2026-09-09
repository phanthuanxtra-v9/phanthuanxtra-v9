import test from "node:test";
import assert from "node:assert/strict";
import { generateVehicleSalesCopy } from "../src/ai-copy.js";

test("AI copy generator fails open when Workers AI is unavailable", async () => {
  const result = await generateVehicleSalesCopy({}, { brand: "Lexus", model: "LX600" });
  assert.equal(result, null);
});

test("AI copy generator accepts a Workers AI response", async () => {
  const env = { AI: { run: async () => ({ response: "🔥 Lexus LX600\n\nSUV cao cấp." }) } };
  const result = await generateVehicleSalesCopy(env, { brand: "Lexus", model: "LX600", features: [] });
  assert.match(result, /Lexus LX600/);
});
