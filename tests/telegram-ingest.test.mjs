import assert from "node:assert/strict";
import { claimInbox, canAutoPublish } from "../src/telegram-ingest.js";

function dbWithChanges(changes){
  return { prepare(sql){
    assert.match(sql,/UPDATE telegram_inbox SET status='processing'/);
    return { bind(id){ assert.equal(id,42); return { async run(){ return { meta:{ changes } }; } }; } };
  } };
}

const brandedPlate = { x:0.1, y:0.7, width:0.2, height:0.1 };
assert.equal(await claimInbox({DB:dbWithChanges(1)},42),true,"a received row must be claimed exactly once");
assert.equal(await claimInbox({DB:dbWithChanges(0)},42),false,"a duplicate/concurrent delivery must not be claimed");
assert.equal(canAutoPublish({brand:"BMW",model:"X5",confidence:.85,plate_bbox:brandedPlate}),true);
assert.equal(canAutoPublish({brand:"BMW",model:"X5",confidence:.849,plate_bbox:brandedPlate}),false);
assert.equal(canAutoPublish({brand:"BMW",model:"",confidence:.99,plate_bbox:brandedPlate}),false);
assert.equal(canAutoPublish({brand:"BMW",model:"X5",confidence:.99,plate_bbox:null}),false);
console.log("telegram ingest single-flight + branding gate tests passed");
