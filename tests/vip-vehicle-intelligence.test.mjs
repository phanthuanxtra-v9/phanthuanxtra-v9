import assert from "node:assert/strict";
import { buildAskAiAgentRequest, buildVipReport, normalizeVipSource } from "../src/vip-vehicle-intelligence.js";

const report=buildVipReport([
  {type:"registration_document",confidence:.99,claims:{brand:"Mercedes-Benz",model:"G63",production_year:2021,vin:"W1N12345678901234"}},
  {type:"vehicle_image",confidence:.93,claims:{brand:"Mercedes-Benz",model:"G63",model_year:2026,form_state:"up_form",modifications:["front bumper","grille","headlights"]}}
]);
assert.equal(report.vehicle_identity.production_year,2021);
assert.equal(report.current_form,"up_form");
assert.equal(report.needs_review,true);
assert.match(report.conclusion,/up-form/);

const conflict=buildVipReport([
  {type:"registration_document",confidence:.99,claims:{brand:"BMW",model:"X5",production_year:2022}},
  {type:"vehicle_image",confidence:.9,claims:{brand:"Mercedes-Benz",model:"G63",form_state:"modified"}}
]);
assert.equal(conflict.needs_review,true);
assert.ok(conflict.conflicts.some(x=>x.field==="brand"));

assert.throws(()=>normalizeVipSource({type:"unknown"}),/Unsupported VIP source type/);
const request=buildAskAiAgentRequest({text:"VIN W1N12345678901234",documents:["registration"],image_references:["media-key"]});
assert.equal(request.task,"vehicle_intelligence");
assert.equal(request.rules.includes("do_not_infer_production_year_from_styling_only"),true);
assert.equal(JSON.stringify(request).includes("TELEGRAM_BOT_TOKEN"),false);
console.log("vip vehicle intelligence tests passed");
