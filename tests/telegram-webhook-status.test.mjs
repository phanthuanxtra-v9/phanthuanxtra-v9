import assert from "node:assert/strict";

const clean = v => String(v ?? "").trim();
const safeWebhookInfo = (info, expectedUrl) => {
  const actual = clean(info?.url);
  return {
    ok: true,
    configured: Boolean(actual),
    url_configured: Boolean(actual),
    url_matches_expected: actual === expectedUrl,
    expected_url: expectedUrl,
    has_custom_certificate: Boolean(info?.has_custom_certificate),
    pending_update_count: Number(info?.pending_update_count || 0),
    last_error_date: info?.last_error_date || null,
    last_error_message: clean(info?.last_error_message, 500) || null,
    last_synchronization_error_date: info?.last_synchronization_error_date || null,
    max_connections: info?.max_connections || null,
    ip_address: info?.ip_address || null
  };
};

const expected = "https://phanthuanxtra.com/api/telegram/webhook";
const token = "123456:SECRET_MUST_NOT_APPEAR_IN_STATUS";
const status = safeWebhookInfo({
  url: expected,
  pending_update_count: 2,
  last_error_message: "Conflict: another webhook is set"
}, expected);

assert.equal(status.ok, true);
assert.equal(status.url_matches_expected, true);
assert.equal(status.pending_update_count, 2);
assert.equal(status.last_error_message, "Conflict: another webhook is set");
assert.equal(JSON.stringify(status).includes(token), false);
assert.equal(JSON.stringify(status).includes("SECRET_MUST_NOT_APPEAR"), false);

const mismatch = safeWebhookInfo({ url: "https://wrong.example/webhook", pending_update_count: 0 }, expected);
assert.equal(mismatch.url_matches_expected, false);
assert.equal(mismatch.expected_url, expected);

const missing = safeWebhookInfo({}, expected);
assert.equal(missing.configured, false);
assert.equal(missing.url_matches_expected, false);

console.log("telegram webhook status tests passed");
