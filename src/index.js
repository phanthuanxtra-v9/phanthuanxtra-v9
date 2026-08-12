const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extraHeaders
    }
  });

const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Origin-Agent-Cluster": "?1",
  "X-Robots-Tag": "index, follow",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload"
};

function applySecurityHeaders(response) {
  const out = new Response(response.body, response);
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) out.headers.set(key, value);
  return out;
}

async function getStaticCars(env, request) {
  const asset = await env.ASSETS.fetch(new Request(new URL("/data/cars.json", request.url)));
  if (!asset.ok) throw new Error(`Static cars asset failed: ${asset.status}`);
  const cars = await asset.json();
  if (!Array.isArray(cars)) throw new Error("Static cars data is not an array");
  return cars;
}

function normalizeDbCar(car) {
  let images = [];
  let features = [];
  try { images = JSON.parse(car.images_json || "[]"); } catch {}
  try { features = JSON.parse(car.features_json || "[]"); } catch {}

  return {
    id: car.id,
    brand: car.brand || "",
    name: car.model || car.id || "Xe",
    category: car.category || "other",
    year: car.year == null ? "" : String(car.year),
    odo: car.mileage == null ? "Liên hệ" : `${Number(car.mileage).toLocaleString("vi-VN")} km`,
    seats: car.seats || "Liên hệ",
    engine: car.engine || car.fuel || "Liên hệ",
    drive: car.drive || "Liên hệ",
    price: car.price ? `${Number(car.price).toLocaleString("vi-VN")} đ` : "Liên hệ",
    tag: car.status === "available" ? "AVAILABLE" : String(car.status || "").toUpperCase(),
    page: car.page || `car-${String(car.id || "").toLowerCase()}.html`,
    imageClass: car.imageClass || "",
    contact: "0866997891",
    color: car.color || "",
    description: car.description || "",
    images,
    features
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/health") {
        return json({
          ok: true,
          version: "V9.5 Production",
          site: "https://phanthuanxtra.com",
          runtime: "Cloudflare Workers",
          timestamp: new Date().toISOString()
        }, 200, SECURITY_HEADERS);
      }

      if (url.pathname === "/api/cars") {
        if (request.method !== "GET") {
          return json({ error: "Method Not Allowed" }, 405, { ...SECURITY_HEADERS, Allow: "GET" });
        }

        if (env.DB) {
          try {
            const result = await env.DB.prepare(
              "SELECT * FROM cars ORDER BY created_at DESC"
            ).all();
            const rows = Array.isArray(result.results) ? result.results : [];

            // Only use D1 when it actually contains compatible inventory.
            // An empty/new D1 must not make the public catalogue disappear.
            if (rows.length > 0) {
              return json({ source: "d1", cars: rows.map(normalizeDbCar) }, 200, SECURITY_HEADERS);
            }
          } catch (err) {
            console.error("D1 cars error:", err);
          }
        }

        return json({ source: "static", cars: await getStaticCars(env, request) }, 200, SECURITY_HEADERS);
      }

      if (url.pathname === "/api/leads") {
        if (request.method !== "POST") {
          return json({ error: "Method Not Allowed" }, 405, { ...SECURITY_HEADERS, Allow: "POST" });
        }

        const contentType = request.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          return json({ error: "Content-Type phải là application/json." }, 415, SECURITY_HEADERS);
        }

        const body = await request.json().catch(() => null);
        const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
        const digits = phone.replace(/\D/g, "");

        if (digits.length < 9 || digits.length > 15) {
          return json({ error: "Số điện thoại không hợp lệ." }, 400, SECURITY_HEADERS);
        }

        const name = typeof body.name === "string" ? body.name.trim().slice(0, 120) : "";
        const carId = typeof body.car_id === "string" ? body.car_id.trim().slice(0, 100) : "";
        const message = typeof body.message === "string" ? body.message.trim().slice(0, 2000) : "";

        if (!env.DB) {
          return json({ ok: true, stored: false, message: "Demo mode: D1 chưa được kết nối." }, 200, SECURITY_HEADERS);
        }

        await env.DB.prepare(
          `INSERT INTO leads (name, phone, car_id, message) VALUES (?, ?, ?, ?)`
        ).bind(name, phone, carId, message).run();

        return json({ ok: true, stored: true }, 200, SECURITY_HEADERS);
      }

      const response = await env.ASSETS.fetch(request);
      const out = applySecurityHeaders(response);

      if (/\.(css|js|png|jpg|jpeg|svg|webp|ico|woff|woff2)$/i.test(url.pathname)) {
        out.headers.set("Cache-Control", "public, max-age=31536000, immutable");
      }

      if (url.pathname === "/" || url.pathname.endsWith(".html")) {
        out.headers.set("Cache-Control", "no-cache");
      }

      return out;
    } catch (err) {
      console.error("Worker error:", err);
      return json({ ok: false, error: "Internal Server Error" }, 500, SECURITY_HEADERS);
    }
  }
};
