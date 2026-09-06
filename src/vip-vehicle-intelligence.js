/**
 * VIP Vehicle Intelligence normalization/cross-validation core.
 *
 * This module intentionally does not assume an undocumented API contract for
 * the external ask-ai-agent Worker. The integration adapter can map its
 * response into the normalized source shape below.
 */

export const VIP_SOURCE_TYPES = Object.freeze([
  "vehicle_image",
  "registration_document",
  "inspection_document",
  "vin_identifier",
  "text",
  "ask_ai_agent"
]);

export const FORM_STATES = Object.freeze([
  "original",
  "facelift",
  "up_form",
  "modified",
  "uncertain"
]);

const text = (value) => (typeof value === "string" ? value.trim() : "");

export function normalizeVipSource(source = {}) {
  const type = text(source.type);
  if (!VIP_SOURCE_TYPES.includes(type)) {
    throw new Error(`Unsupported VIP source type: ${type || "empty"}`);
  }

  const claims = source.claims && typeof source.claims === "object"
    ? source.claims
    : {};

  return {
    type,
    confidence: Number.isFinite(Number(source.confidence))
      ? Math.max(0, Math.min(1, Number(source.confidence)))
      : null,
    claims: {
      brand: text(claims.brand) || null,
      model: text(claims.model) || null,
      variant: text(claims.variant) || null,
      model_year: Number.isInteger(Number(claims.model_year)) ? Number(claims.model_year) : null,
      production_year: Number.isInteger(Number(claims.production_year)) ? Number(claims.production_year) : null,
      plate: text(claims.plate) || null,
      vin: text(claims.vin) || null,
      chassis: text(claims.chassis) || null,
      engine: text(claims.engine) || null,
      form_state: FORM_STATES.includes(claims.form_state) ? claims.form_state : "uncertain",
      modifications: Array.isArray(claims.modifications)
        ? claims.modifications.map(text).filter(Boolean)
        : []
    },
    evidence: Array.isArray(source.evidence)
      ? source.evidence.map(text).filter(Boolean)
      : []
  };
}

function valuesFor(sources, key) {
  return sources
    .map((source) => source.claims[key])
    .filter((value) => value !== null && value !== "" && value !== undefined);
}

function unique(values) {
  return [...new Set(values.map((v) => String(v).toLowerCase()))];
}

export function crossValidateVipSources(inputSources = []) {
  const sources = inputSources.map(normalizeVipSource);
  const conflicts = [];

  for (const key of ["brand", "model", "variant", "model_year", "production_year", "vin", "chassis", "engine"]) {
    const vals = unique(valuesFor(sources, key));
    if (vals.length > 1) conflicts.push({ field: key, values: vals });
  }

  const documentYears = valuesFor(sources.filter((s) =>
    ["registration_document", "inspection_document", "vin_identifier"].includes(s.type)
  ), "production_year");
  const visualYears = valuesFor(sources.filter((s) => s.type === "vehicle_image"), "model_year");

  // Styling is evidence for the current form only. It must never override
  // documentary/VIN identity or establish the production year by itself.
  const currentForm = sources.find((s) => s.type === "vehicle_image")?.claims.form_state || "uncertain";
  const originalYear = documentYears[0] ?? null;

  const needsReview = conflicts.length > 0 || currentForm === "uncertain" ||
    (visualYears.length > 0 && originalYear !== null && Number(visualYears[0]) !== Number(originalYear));

  return {
    vehicle_identity: {
      brand: valuesFor(sources, "brand")[0] ?? null,
      model: valuesFor(sources, "model")[0] ?? null,
      variant: valuesFor(sources, "variant")[0] ?? null,
      production_year: originalYear,
      vin: valuesFor(sources, "vin")[0] ?? null,
      chassis: valuesFor(sources, "chassis")[0] ?? null,
      engine: valuesFor(sources, "engine")[0] ?? null
    },
    current_form: currentForm,
    modifications: [...new Set(sources.flatMap((s) => s.claims.modifications))],
    conflicts,
    needs_review: needsReview,
    confidence: sources.length
      ? Math.round((sources.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / sources.length) * 100) / 100
      : 0,
    sources: sources.map((s) => s.type)
  };
}

export function buildVipReport(inputSources = []) {
  const result = crossValidateVipSources(inputSources);
  let conclusion = "Không đủ dữ liệu để kết luận chắc chắn.";

  if (result.conflicts.length > 0) {
    conclusion = "Phát hiện mâu thuẫn dữ liệu; cần kiểm tra thủ công.";
  } else if (result.current_form === "up_form") {
    conclusion = "Xe có dấu hiệu up-form; không dùng ngoại hình hiện tại để xác định đời xe gốc.";
  } else if (result.current_form === "facelift") {
    conclusion = "Xe có dấu hiệu facelift; năm sản xuất phải lấy từ hồ sơ/định danh.";
  } else if (result.current_form === "modified") {
    conclusion = "Xe có dấu hiệu độ/chỉnh sửa; nhận dạng form hiện tại tách biệt với xe gốc.";
  } else if (result.vehicle_identity.brand && result.vehicle_identity.model && !result.needs_review) {
    conclusion = "Các nguồn hiện có phù hợp với cùng một nhận dạng xe.";
  }

  return { ...result, conclusion };
}

/**
 * Safe adapter boundary for the external ask-ai-agent Worker.
 * Pass only non-secret vehicle/document data. The concrete request contract
 * must be configured once the external Worker exposes a documented API.
 */
export function buildAskAiAgentRequest(input = {}) {
  return {
    source: "phanthuanxtra-vip-bot",
    task: "vehicle_intelligence",
    inputs: {
      text: text(input.text) || null,
      documents: Array.isArray(input.documents) ? input.documents : [],
      image_references: Array.isArray(input.image_references) ? input.image_references : []
    },
    rules: [
      "separate_original_vehicle_from_current_visual_form",
      "do_not_infer_production_year_from_styling_only",
      "report_conflicts",
      "allow_unknown_or_needs_review"
    ]
  };
}
