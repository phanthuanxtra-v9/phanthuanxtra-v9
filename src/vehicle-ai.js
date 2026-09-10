const MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const schema = {
  type: "object",
  properties: {
    brand: { type: ["string", "null"] },
    model: { type: ["string", "null"] },
    year: { type: ["integer", "null"] },
    mileage: { type: ["integer", "null"] },
    price: { type: ["integer", "null"] },
    fuel: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    color: { type: ["string", "null"] },
    origin: { type: ["string", "null"] },
    origin_country: { type: ["string", "null"] },
    form_state: { type: "string", enum: ["original","facelift","up_form","modified","uncertain"] },
    form_notes: { type: ["string", "null"] },
    description: { type: ["string", "null"] },
    features: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    missing_fields: { type: "array", items: { type: "string" } },
    plate_visible: { type: ["boolean", "null"] },
    plate_bbox: { type: ["object", "null"], properties: { x: { type: "number" }, y: { type: "number" }, width: { type: "number" }, height: { type: "number" } }, required: ["x","y","width","height"] }
  },
  required: ["brand","model","year","mileage","price","fuel","category","color","origin","origin_country","form_state","form_notes","description","features","confidence","missing_fields","plate_visible","plate_bbox"]
};

function dataUrl(contentType, bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  return `data:${contentType || "image/jpeg"};base64,${btoa(binary)}`;
}
function parseResult(result) {
  const text = typeof result === "string" ? result : result?.response;
  if (!text) throw new Error("Workers AI returned no response");
  try { return JSON.parse(text); } catch { const match = text.match(/\{[\s\S]*\}/); if (!match) throw new Error("AI response is not valid JSON"); return JSON.parse(match[0]); }
}

export async function analyzeVehicleImage(env, fileBytes, contentType, caption = "") {
  if (!env.AI) throw new Error("Workers AI binding AI is not configured");
  const prompt = `Bạn là bộ phận nhập kho xe của Phan Thuần Xtra. Chỉ ghi dữ kiện nhìn thấy hoặc được cung cấp rõ ràng; không bịa. Không suy đoán năm sản xuất, ODO, giá, phiên bản, động cơ, option, màu hoặc xuất xứ. Nếu không đủ bằng chứng trả null và thêm trường vào missing_fields. origin/origin_country chỉ ghi khi có bằng chứng rõ từ caption, giấy tờ hoặc dữ kiện nhận dạng đáng tin cậy. Phân biệt form hiện tại với xe gốc: form_state=facelift nếu ngoại hình có dấu hiệu facelift nhưng không coi facelift là năm sản xuất; up_form nếu đã đổi ngoại hình sang form đời mới; modified nếu độ/chỉnh sửa; original nếu không thấy dấu hiệu; uncertain nếu thiếu bằng chứng. form_notes phải giải thích ngắn gọn bằng tiếng Việt khi khác original.

QUAN TRỌNG VỀ BIỂN SỐ: plate_visible=true CHỈ khi thực sự nhìn thấy biển số trong ảnh. Khi plate_visible=true, plate_bbox bắt buộc là vùng chuẩn hóa 0..1 theo ảnh gốc và phải bao trọn biển số. Nếu ảnh không có biển số nhìn thấy (ví dụ ảnh nội thất, khoang máy, góc không có biển), đặt plate_visible=false và plate_bbox=null. Nếu không đủ chắc chắn để kết luận có/không có biển số, đặt plate_visible=null và plate_bbox=null. Không được dùng plate_visible=false để che giấu một biển số khó nhìn.

Thông tin người dùng: ${caption || "(không có)"}`;
  const response = await env.AI.run(MODEL, { messages: [{ role: "system", content: "Bạn trích xuất dữ liệu xe ô tô chính xác, bảo thủ, không bịa dữ liệu. Tách xuất xứ và form hiện tại khỏi đời xe gốc. Phân loại sự hiện diện của biển số một cách bảo thủ." }, { role: "user", content: prompt }], image: dataUrl(contentType, new Uint8Array(fileBytes)), max_tokens: 1200, temperature: 0, response_format: { type: "json_schema", json_schema: schema } });
  const parsed = parseResult(response);
  if (parsed.plate_visible === true && !hasValidPlateBoxLocal(parsed.plate_bbox)) throw new Error("Workers AI marked plate visible without a valid plate bbox");
  if (parsed.plate_visible !== true) parsed.plate_bbox = null;
  return parsed;
}

function hasValidPlateBoxLocal(box) {
  if (!box || typeof box !== "object") return false;
  return [box.x, box.y, box.width, box.height].every(Number.isFinite) && box.x >= 0 && box.y >= 0 && box.width > 0 && box.height > 0 && box.x + box.width <= 1 && box.y + box.height <= 1;
}
