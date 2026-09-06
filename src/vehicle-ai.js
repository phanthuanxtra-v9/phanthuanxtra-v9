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
    description: { type: ["string", "null"] },
    features: { type: "array", items: { type: "string" } },
    confidence: { type: "number" },
    missing_fields: { type: "array", items: { type: "string" } }
  },
  required: ["brand","model","year","mileage","price","fuel","category","color","description","features","confidence","missing_fields"]
};

function dataUrl(contentType, bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, Math.min(i + chunk, bytes.length)));
  }
  return `data:${contentType || "image/jpeg"};base64,${btoa(binary)}`;
}

function parseResult(result) {
  const text = typeof result === "string" ? result : result?.response;
  if (!text) throw new Error("Workers AI returned no response");
  try { return JSON.parse(text); } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("AI response is not valid JSON");
    return JSON.parse(match[0]);
  }
}

export async function analyzeVehicleImage(env, fileBytes, contentType, caption = "") {
  if (!env.AI) throw new Error("Workers AI binding AI is not configured");
  const prompt = `Bạn là bộ phận nhập kho xe của Phan Thuần Xtra. Phân tích ảnh xe và thông tin kèm theo. Chỉ ghi dữ kiện nhìn thấy hoặc được cung cấp rõ ràng. KHÔNG được đoán năm, ODO, giá, phiên bản, động cơ, option hay màu. Nếu không chắc chắn trả null và đưa tên trường vào missing_fields. Giá là VND nếu caption ghi rõ giá; không tự quy đổi. Mô tả ngắn bằng tiếng Việt. confidence từ 0 đến 1 phản ánh độ chắc chắn tổng thể. Thông tin người dùng: ${caption || "(không có)"}`;
  const response = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: "Bạn trích xuất dữ liệu xe ô tô chính xác, bảo thủ, không bịa dữ liệu." },
      { role: "user", content: prompt }
    ],
    image: dataUrl(contentType, new Uint8Array(fileBytes)),
    max_tokens: 900,
    temperature: 0,
    response_format: { type: "json_schema", json_schema: schema }
  });
  return parseResult(response);
}
