const MODEL = "@cf/google/gemma-4-26b-a4b-it";
const clean = (v, n = 4000) => String(v ?? "").trim().slice(0, n);

function parseText(result) {
  const text = typeof result === "string" ? result : result?.response ?? result?.choices?.[0]?.message?.content;
  return clean(text, 5000);
}

export async function generateVehicleSalesCopy(env, car) {
  if (!env.AI) return null;
  const features = Array.isArray(car?.features) ? car.features.map(x => clean(x, 180)).filter(Boolean).slice(0, 12) : [];
  const prompt = [
    "Viết nội dung đăng bán ô tô cho Phan Thuần Xtra bằng tiếng Việt.",
    "Chỉ dùng dữ kiện được cung cấp; tuyệt đối không bịa option, năm sản xuất, nguồn gốc, giá, ODO hoặc tình trạng.",
    "Giọng chuyên nghiệp, cao cấp, ngắn gọn, dễ đọc trên Telegram/Facebook.",
    "Không dùng Markdown table, không HTML, không hashtag quá mức.",
    "Cấu trúc: tiêu đề hấp dẫn; 3-6 điểm nổi bật; mô tả ngắn; lời kêu gọi liên hệ.",
    "Không nhắc hoặc suy đoán biển số thật. Nếu có dữ kiện biển số, bỏ qua dữ kiện đó.",
    `Hãng: ${clean(car?.brand, 100)}`,
    `Mẫu: ${clean(car?.model, 160)}`,
    `Năm: ${car?.year ?? "Chưa xác định"}`,
    `ODO: ${car?.mileage ?? "Chưa xác định"}`,
    `Màu: ${clean(car?.color, 80)}`,
    `Động cơ/nhiên liệu: ${clean(car?.engine || car?.fuel, 100)}`,
    `Xuất xứ: ${clean(car?.origin, 120)}`,
    `Giá: ${car?.price ?? "Liên hệ"}`,
    `Tình trạng: ${clean(car?.status, 40)}`,
    `Thông tin đã có: ${clean(car?.description, 2500)}`,
    `Option nổi bật: ${features.join("; ") || "Chưa có dữ kiện"}`
  ].join("\n");
  try {
    const result = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: "Bạn là copywriter bán ô tô cao cấp của Phan Thuần Xtra. Trung thực dữ kiện, không bịa." },
        { role: "user", content: prompt }
      ],
      max_completion_tokens: 700,
      temperature: 0.35
    });
    const text = parseText(result);
    return text || null;
  } catch (error) {
    console.error("vehicle_sales_copy_ai_failed", String(error?.message || error));
    return null;
  }
}
