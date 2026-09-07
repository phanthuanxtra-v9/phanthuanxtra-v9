import assert from "node:assert/strict";
import { claimInbox, canAutoPublish } from "../src/telegram-ingest.js";

function dbWithChanges(changes){
  return { prepare(sql){
    assert.match(sql,/UPDATE telegram_inbox SET status='processing'/);
    return { bind(id){ assert.equal(id,42); return { async run(){ return { meta:{ changes } }; } }; } };
  } };
}

assert.equal(await claimInbox({DB:dbWithChanges(1)},42),true,"a received row must be claimed exactly once");
assert.equal(await claimInbox({DB:dbWithChanges(0)},42),false,"a duplicate/concurrent delivery must not be claimed");
assert.equal(canAutoPublish({brand:"BMW",model:"X5",confidence:.85}),true);
assert.equal(canAutoPublish({brand:"BMW",model:"X5",confidence:.849}),false);
assert.equal(canAutoPublish({brand:"BMW",model:"",confidence:.99}),false);
console.log("telegram ingest single-flight tests passed");
