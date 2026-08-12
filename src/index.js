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
  "Strict-Transport-Security":
    "max-age=31536000; includeSubDomains; preload"
};

function applySecurityHeaders(response) {
  const out = new Response(response.body, response);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    out.headers.set(key, value);
  }

  return out;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {

      // ==========================
      // HEALTH CHECK
      // ==========================
      if (url.pathname === "/api/health") {
        return json(
          {
            ok: true,
            version: "V9.5 Production",
            site: "https://phanthuanxtra.com",
            runtime: "Cloudflare Workers",
            timestamp: new Date().toISOString()
          },
          200,
          SECURITY_HEADERS
        );
      }

      // ==========================
      // CARS API
      // ==========================
      if (url.pathname === "/api/cars" && request.method === "GET") {

        if (env.DB) {
          try {

            const result = await env.DB
              .prepare(
                "SELECT * FROM cars ORDER BY created_at DESC"
              )
              .all();

            return json(
              {
                source: "d1",
                cars: result.results
              },
              200,
              SECURITY_HEADERS
            );

          } catch (err) {
            console.error("D1 Error:", err);
          }
        }

        const asset = await env.ASSETS.fetch(
          new Request(
            new URL("/data/cars.json", request.url)
          )
        );

        const cars = await asset.json();

        return json(
          {
            source: "static",
            cars
          },
          200,
          SECURITY_HEADERS
        );
      }

      // ==========================
      // LEADS API
      // ==========================
      if (
        url.pathname === "/api/leads" &&
        request.method === "POST"
      ) {

        const body =
          await request.json().catch(() => null);

        if (
          !body ||
          typeof body.phone !== "string" ||
          body.phone.replace(/\D/g, "").length < 9
        ) {
          return json(
            {
              error: "Số điện thoại không hợp lệ."
            },
            400,
            SECURITY_HEADERS
          );
        }

        if (!env.DB) {
          return json(
            {
              ok: true,
              stored: false,
              message:
                "Demo mode: D1 chưa được kết nối."
            },
            200,
            SECURITY_HEADERS
          );
        }

        await env.DB
          .prepare(
            `INSERT INTO leads
            (name, phone, car_id, message)
            VALUES (?, ?, ?, ?)`
          )
          .bind(
            body.name || "",
            body.phone,
            body.car_id || "",
            body.message || ""
          )
          .run();

        return json(
          {
            ok: true,
            stored: true
          },
          200,
          SECURITY_HEADERS
        );
      }

      // ==========================
      // STATIC ASSETS
      // ==========================
      const response = await env.ASSETS.fetch(request);

      const out = applySecurityHeaders(response);

      // Long cache cho file tĩnh
      if (
        /\.(css|js|png|jpg|jpeg|svg|webp|ico|woff|woff2)$/i.test(
          url.pathname
        )
      ) {
        out.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      }

      // HTML luôn lấy phiên bản mới
      if (
        url.pathname === "/" ||
        url.pathname.endsWith(".html")
      ) {
        out.headers.set(
          "Cache-Control",
          "no-cache"
        );
      }

      return out;

    } catch (err) {

      console.error(err);

      return json(
        {
          ok: false,
          error: "Internal Server Error"
        },
        500,
        SECURITY_HEADERS
      );
    }
  }
};