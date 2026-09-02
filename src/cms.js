const MAX_BODY_BYTES = 1024 * 1024;
const CAR_STATUSES = new Set(["available", "reserved", "sold", "hidden"]);
const LEAD_STATUSES = new Set(["new", "contacted", "qualified", "won", "lost"]);

const SEC = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Cache-Control": "no-store"
};

const response = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...SEC, ...headers }
});

const text = (value, max = 1000) => String(value ?? "").trim().slice(0, max);
const integer = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const bool = value => value === true || value === 1 || value === "1" || value === "true";
const safeId = value => /^[a-z0-9][a-z0-9_-]{2,80}$/i.test(String(value ?? ""));

function authorized(request, env) {
  const key = env.CMS_API_KEY;
  if (!key) return false;
  const auth = request.headers.get("Authorization") || "";
  return auth.startsWith("Bearer ") && auth.slice(7) === key;
}

async function readJson(request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > MAX_BODY_BYTES) throw new Error("Request body quá lớn.");
  return request.json().catch(() => null);
}

async function initCmsDb(db) {
  // Production schema is managed separately.
  // Do not CREATE/ALTER tables automatically on API requests.
  return db;
}

async function audit(db, action, resource, resourceId, summary) {
  await db.prepare("INSERT INTO cms_audit_log (actor,action,resource,resource_id,summary) VALUES (?,?,?,?,?)")
    .bind("chatgpt-cms", action, resource, text(resourceId, 100), text(summary, 500)).run();
}

async function imagesFor(db, carId) {
  const q = await db.prepare("SELECT id,url,sort_order,is_cover FROM car_images WHERE car_id=? ORDER BY sort_order,id").bind(carId).all();
  return q.results || [];
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  return images.slice(0, 30).map((item, index) => {
    if (typeof item === "string") return { url: text(item, 200000), sort_order: index, is_cover: index === 0 };
    return { url: text(item?.url, 200000), sort_order: integer(item?.sort_order, index), is_cover: bool(item?.is_cover) };
  }).filter(x => /^https?:\/\//i.test(x.url));
}

async function replaceImages(db, carId, images) {
  await db.prepare("DELETE FROM car_images WHERE car_id=?").bind(carId).run();
  const list = normalizeImages(images);
  if (!list.length) return;
  const coverIndex = list.findIndex(x => x.is_cover);
  await db.batch(list.map((item, index) => db.prepare(
    "INSERT INTO car_images (car_id,url,sort_order,is_cover) VALUES (?,?,?,?)"
  ).bind(carId, item.url, index, coverIndex === -1 ? (index === 0 ? 1 : 0) : (index === coverIndex ? 1 : 0))));
}

function carPayload(body, existing = {}) {
  const brand = text(body?.brand ?? existing.brand, 100);
  const model = text(body?.model ?? existing.model, 160);
  const status = text(body?.status ?? existing.status ?? "available", 30).toLowerCase();
  if (!brand || !model) return { error: "brand và model là bắt buộc" };
  if (!CAR_STATUSES.has(status)) return { error: `status phải là: ${[...CAR_STATUSES].join(", ")}` };
  return { value: {
    brand, model,
    year: body?.year === null ? null : integer(body?.year ?? existing.year, 0) || null,
    mileage: integer(body?.mileage ?? existing.mileage, 0),
    price: integer(body?.price ?? existing.price, 0),
    fuel: text(body?.fuel ?? existing.fuel, 100),
    category: text(body?.category ?? existing.category, 40),
    color: text(body?.color ?? existing.color, 80),
    status,
    description: text(body?.description ?? existing.description, 10000),
    features: Array.isArray(body?.features) ? body.features.slice(0, 80).map(x => text(x, 300)) : (existing.features_json ? JSON.parse(existing.features_json || "[]") : []),
    featured: bool(body?.featured ?? existing.featured),
    cover_image: text(body?.cover_image ?? existing.cover_image, 200000)
  }};
}

async function listCars(db, url) {
  const limit = Math.min(Math.max(integer(url.searchParams.get("limit"), 50), 1), 200);
  const offset = Math.max(integer(url.searchParams.get("offset"), 0), 0);
  const status = text(url.searchParams.get("status"), 30).toLowerCase();
  const search = text(url.searchParams.get("q"), 120);
  let sql = "SELECT * FROM cars WHERE 1=1";
  const params = [];
  if (status) { sql += " AND status=?"; params.push(status); }
  if (search) { sql += " AND (brand LIKE ? OR model LIKE ? OR id LIKE ?)"; const s = `%${search}%`; params.push(s, s, s); }
  sql += " ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);
  const q = await db.prepare(sql).bind(...params).all();
  return Promise.all((q.results || []).map(async car => ({ ...car, images: await imagesFor(db, car.id) })));
}

async function handleCars(request, env, parts) {
  const db = env.DB;
  const id = parts[0] || "";
  if (request.method === "GET") {
    if (id) {
      if (!safeId(id)) return response({ error: "ID không hợp lệ" }, 400);
      const car = await db.prepare("SELECT * FROM cars WHERE id=?").bind(id).first();
      if (!car) return response({ error: "Không tìm thấy xe" }, 404);
      return response({ car: { ...car, images: await imagesFor(db, id) } });
    }
    return response({ cars: await listCars(db, new URL(request.url)) });
  }

  if (request.method === "DELETE") {
    if (!id || !safeId(id)) return response({ error: "ID không hợp lệ" }, 400);
    if ((request.headers.get("X-CMS-Confirm") || "").toLowerCase() !== "delete") return response({ error: "Thiếu X-CMS-Confirm: delete" }, 428);
    const existing = await db.prepare("SELECT id,brand,model FROM cars WHERE id=?").bind(id).first();
    if (!existing) return response({ error: "Không tìm thấy xe" }, 404);
    await db.batch([
      db.prepare("DELETE FROM car_images WHERE car_id=?").bind(id),
      db.prepare("DELETE FROM cars WHERE id=?").bind(id)
    ]);
    await audit(db, "delete", "car", id, `${existing.brand} ${existing.model}`);
    return response({ ok: true, deleted: id });
  }

  if (request.method !== "POST" && request.method !== "PUT") return response({ error: "Method Not Allowed" }, 405, { Allow: "GET,POST,PUT,DELETE" });
  const body = await readJson(request);
  if (!body) return response({ error: "JSON không hợp lệ" }, 400);
  let existing = {};
  if (request.method === "PUT") {
    if (!id || !safeId(id)) return response({ error: "ID không hợp lệ" }, 400);
    existing = await db.prepare("SELECT * FROM cars WHERE id=?").bind(id).first();
    if (!existing) return response({ error: "Không tìm thấy xe" }, 404);
  }
  const parsed = carPayload(body, existing);
  if (parsed.error) return response({ error: parsed.error }, 400);
  const v = parsed.value;
  const carId = request.method === "POST" ? text(body.id, 81) : id;
  if (request.method === "POST" && !safeId(carId)) return response({ error: "id phải gồm 3-81 ký tự, chỉ chữ/số/-/_" }, 400);

  try {
    if (request.method === "POST") {
      await db.prepare(`INSERT INTO cars (id,brand,model,year,mileage,price,fuel,category,color,status,description,features_json,featured,cover_image) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(carId, v.brand, v.model, v.year, v.mileage, v.price, v.fuel, v.category, v.color, v.status, v.description, JSON.stringify(v.features), v.featured ? 1 : 0, v.cover_image).run();
      await audit(db, "create", "car", carId, `${v.brand} ${v.model}`);
    } else {
      await db.prepare(`UPDATE cars SET brand=?,model=?,year=?,mileage=?,price=?,fuel=?,category=?,color=?,status=?,description=?,features_json=?,featured=?,cover_image=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`)
        .bind(v.brand, v.model, v.year, v.mileage, v.price, v.fuel, v.category, v.color, v.status, v.description, JSON.stringify(v.features), v.featured ? 1 : 0, v.cover_image, carId).run();
      await audit(db, "update", "car", carId, `${v.brand} ${v.model}`);
    }
    if (Object.prototype.hasOwnProperty.call(body, "images")) await replaceImages(db, carId, body.images);
    return response({ ok: true, id: carId, car: { ...(await db.prepare("SELECT * FROM cars WHERE id=?").bind(carId).first()), images: await imagesFor(db, carId) } }, request.method === "POST" ? 201 : 200);
  } catch (error) {
    if (String(error?.message || error).includes("UNIQUE")) return response({ error: "ID bài đăng đã tồn tại" }, 409);
    console.error(error);
    return response({ error: "Không thể lưu bài xe" }, 500);
  }
}

async function handleLeads(request, env, parts) {
  const db = env.DB;
  const id = parts[0] ? integer(parts[0]) : 0;
  if (request.method === "GET") {
    const limit = Math.min(Math.max(integer(new URL(request.url).searchParams.get("limit"), 100), 1), 500);
    const q = await db.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT ?").bind(limit).all();
    return response({ leads: q.results || [] });
  }
  if (!id) return response({ error: "ID lead không hợp lệ" }, 400);
  if (request.method === "DELETE") {
    if ((request.headers.get("X-CMS-Confirm") || "").toLowerCase() !== "delete") return response({ error: "Thiếu X-CMS-Confirm: delete" }, 428);
    await db.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
    await audit(db, "delete", "lead", String(id), "lead deleted");
    return response({ ok: true, deleted: id });
  }
  if (request.method !== "PUT") return response({ error: "Method Not Allowed" }, 405, { Allow: "GET,PUT,DELETE" });
  const body = await readJson(request);
  const status = text(body?.status, 30).toLowerCase();
  if (!LEAD_STATUSES.has(status)) return response({ error: `status phải là: ${[...LEAD_STATUSES].join(", ")}` }, 400);
  await db.prepare("UPDATE leads SET status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status, text(body?.note, 3000), id).run();
  await audit(db, "update", "lead", String(id), `status=${status}`);
  return response({ ok: true, id });
}

async function dashboard(db) {
  const rows = await Promise.all([
    ["cars", "SELECT COUNT(*) n FROM cars"],
    ["featured", "SELECT COUNT(*) n FROM cars WHERE featured=1"],
    ["available", "SELECT COUNT(*) n FROM cars WHERE status='available'"],
    ["reserved", "SELECT COUNT(*) n FROM cars WHERE status='reserved'"],
    ["sold", "SELECT COUNT(*) n FROM cars WHERE status='sold'"],
    ["hidden", "SELECT COUNT(*) n FROM cars WHERE status='hidden'"],
    ["leads", "SELECT COUNT(*) n FROM leads"],
    ["newLeads", "SELECT COUNT(*) n FROM leads WHERE status='new'"],
    ["wonLeads", "SELECT COUNT(*) n FROM leads WHERE status='won'"],
    ["auditEvents", "SELECT COUNT(*) n FROM cms_audit_log"]
  ].map(async ([key, sql]) => [key, Number((await db.prepare(sql).first("n")) || 0)]));
  return Object.fromEntries(rows);
}

async function handleAudit(request, env) {
  if (request.method !== "GET") return response({ error: "Method Not Allowed" }, 405, { Allow: "GET" });
  const q = await env.DB.prepare("SELECT id,actor,action,resource,resource_id,summary,created_at FROM cms_audit_log ORDER BY created_at DESC LIMIT 200").all();
  return response({ events: q.results || [] });
}

export async function handleCmsApi(request, env) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/cms/v1")) return null;
  if (!authorized(request, env)) return response({ error: "Unauthorized" }, 401, { "WWW-Authenticate": "Bearer" });
  if (!env.DB) return response({ error: "D1 chưa được kết nối" }, 503);
  try {
    await initCmsDb(env.DB);
    const rest = url.pathname.replace(/^\/api\/cms\/v1\/?/, "").split("/").filter(Boolean);
    const resource = rest[0] || "";
    const parts = rest.slice(1);
    if (resource === "health" && request.method === "GET") return response({ ok: true, service: "phanthuanxtra-cms", version: "1.0" });
    if (resource === "dashboard") return response({ stats: await dashboard(env.DB) });
    if (resource === "audit") return handleAudit(request, env);
    if (resource === "cars") return handleCars(request, env, parts);
    if (resource === "leads") return handleLeads(request, env, parts);
    return response({ error: "CMS endpoint not found" }, 404);
  } catch (error) {
    console.error("CMS API error", error);
    return response({ error: "Internal Server Error" }, 500);
  }
}
