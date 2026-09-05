import fs from "node:fs";

const input = process.argv[2] || "data/cars-import.json";
const apply = process.argv.includes("--apply");

const CAR_STATUSES = new Set(["available", "reserved", "sold", "hidden"]);
const CATEGORIES = new Set(["suv", "sport", "sedan", "other"]);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function text(v, max) {
  return String(v ?? "").trim().slice(0, max);
}

function integer(v, fallback = 0) {
  return Number.isFinite(Number(v)) ? Number(v) : fallback;
}

if (!fs.existsSync(input)) {
  fail(`Khong tim thay file: ${input}`);
}

let cars;
try {
  cars = JSON.parse(fs.readFileSync(input, "utf8"));
} catch (e) {
  fail(`JSON khong hop le: ${e.message}`);
}

if (!Array.isArray(cars) || cars.length === 0) {
  fail("Catalog import phai la mot mang va phai co it nhat 1 xe.");
}

const ids = new Set();

for (const [i, car] of cars.entries()) {
  const n = i + 1;

  if (!/^[a-z0-9][a-z0-9_-]{2,80}$/i.test(String(car.id ?? ""))) {
    fail(`Xe #${n}: id khong hop le.`);
  }

  if (ids.has(car.id)) {
    fail(`Xe #${n}: trung id ${car.id}.`);
  }
  ids.add(car.id);

  if (!text(car.brand, 100) || !text(car.model, 160)) {
    fail(`Xe #${n}: brand va model la bat buoc.`);
  }

  if (!CATEGORIES.has(String(car.category ?? "").toLowerCase())) {
    fail(`Xe #${n}: category phai la suv|sport|sedan|other.`);
  }

  if (!CAR_STATUSES.has(String(car.status ?? "").toLowerCase())) {
    fail(`Xe #${n}: status phai la available|reserved|sold|hidden.`);
  }

  if (integer(car.year, 0) !== 0 && (integer(car.year) < 1900 || integer(car.year) > 2100)) {
    fail(`Xe #${n}: year khong hop le.`);
  }

  if (integer(car.mileage) < 0) {
    fail(`Xe #${n}: mileage khong duoc am.`);
  }

  if (integer(car.price) < 0) {
    fail(`Xe #${n}: price khong duoc am.`);
  }

  if (!Array.isArray(car.features)) {
    fail(`Xe #${n}: features phai la array.`);
  }

  if (!Array.isArray(car.images)) {
    fail(`Xe #${n}: images phai la array.`);
  }

  for (const [j, url] of car.images.entries()) {
    if (!/^https?:\/\/.+/i.test(String(url ?? ""))) {
      fail(`Xe #${n}, anh #${j + 1}: URL khong hop le.`);
    }
  }

  if (car.cover_image && !/^https?:\/\/.+/i.test(String(car.cover_image))) {
    fail(`Xe #${n}: cover_image khong hop le.`);
  }
}

console.log("=== CONTROLLED CATALOG IMPORT ===");
console.log(`File: ${input}`);
console.log(`So xe: ${cars.length}`);
console.log(`IDs: ${[...ids].join(", ")}`);
console.log("Schema validation: PASS");

if (!apply) {
  console.log("");
  console.log("DRY-RUN ONLY: khong ghi D1.");
  console.log("Khi co du lieu xe that va da kiem tra, dung --apply de tao SQL import.");
  process.exit(0);
}

const esc = v => String(v ?? "").replaceAll("'", "''");

const statements = [];

for (const car of cars) {
  const features = JSON.stringify(car.features ?? []);
  const cover = text(car.cover_image, 200000);

  statements.push(
    `INSERT INTO cars (id,brand,model,year,mileage,price,fuel,category,color,status,description,features_json,featured,cover_image) VALUES ('${esc(car.id)}','${esc(car.brand)}','${esc(car.model)}',${car.year == null ? "NULL" : integer(car.year)},${integer(car.mileage)},${integer(car.price)},'${esc(text(car.fuel,100))}','${esc(text(car.category,40))}','${esc(text(car.color,80))}','${esc(text(car.status,30).toLowerCase())}','${esc(text(car.description,10000))}','${esc(features)}',${car.featured ? 1 : 0},'${esc(cover)}');`
  );
}

fs.writeFileSync("data/cars-import.sql", statements.join("\n") + "\n", "utf8");

console.log("");
console.log("SQL generated: data/cars-import.sql");
console.log("D1 CHUA DUOC GHI.");
