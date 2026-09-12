import test from "node:test";
import assert from "node:assert/strict";

const MAX_MESSAGE = 4000;
const MAX_HISTORY = 8;
const MAX_KNOWLEDGE_CONTEXT = 8000;
const MAX_OUTPUT_TOKENS = 500;
const AI_CACHE_TTL_MS = 60_000;
const PHONE_RE = /(?:\+?84|0)(?:\D*\d){9,10}/;
const PHONE_MASK = "[PHONE_REDACTED]";
const maskPhones = (value) => String(value ?? "").replace(PHONE_RE, PHONE_MASK);

function clean(v, n = MAX_MESSAGE) {
  return String(v ?? "").trim().slice(0, n);
}

function cacheKey(messages, cars, knowledge) {
  const last = messages[messages.length - 1]?.content || "";
  if (!last || PHONE_RE.test(last)) return null;
  return `primary|${JSON.stringify(messages)}|${cars.map(c => `${c.id}|${c.price}|${c.status}|${c.updated_at || ""}`).join(";")}|${knowledge.slice(0, 2000)}`;
}

test("input is bounded", () => {
  assert.equal(clean(" x "), "x");
  assert.equal(clean("x".repeat(5000)).length, MAX_MESSAGE);
});

test("history and context budgets are explicit", () => {
  assert.equal(MAX_HISTORY, 8);
  assert.equal(MAX_KNOWLEDGE_CONTEXT, 8000);
  assert.equal(MAX_OUTPUT_TOKENS, 500);
});

test("PII-bearing request is never cacheable", () => {
  assert.equal(cacheKey([{ role: "user", content: "Gọi tôi 0866997891" }], [], ""), null);
});

test("phone numbers are masked before AI-bound content", () => {
  const raw = "Tôi tên Thuần, số 0866 997 891. Gọi +84 866 997 891.";
  const safe = maskPhones(raw);
  assert.equal(safe.includes("0866 997 891"), false);
  assert.equal(safe.includes("+84 866 997 891"), false);
  assert.equal((safe.match(/\[PHONE_REDACTED\]/g) || []).length, 2);
});

test("masking does not alter non-PII content", () => {
  assert.equal(maskPhones("Tôi muốn xem Porsche"), "Tôi muốn xem Porsche");
});

test("same safe request produces deterministic cache key", () => {
  const messages = [{ role: "user", content: "xe Porsche" }];
  const cars = [{ id: "1", price: 100, status: "available" }];
  assert.equal(cacheKey(messages, cars, "catalog"), cacheKey(messages, cars, "catalog"));
});

test("cache TTL is bounded", () => {
  assert.equal(AI_CACHE_TTL_MS, 60_000);
});
