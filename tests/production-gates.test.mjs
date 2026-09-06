import test from 'node:test';
import assert from 'node:assert/strict';
import { canAutoPublish } from '../src/telegram-ingest.js';
import { handleAiChat } from '../src/ai-chat.js';

function mockDb() {
  const rows = [];
  const unknown = [];
  return {
    prepare(sql) {
      return { bind(...args) {
        return {
          async run() {
            if (sql.includes('INSERT INTO ai_conversations')) rows.push({ type:'conversation', id:args[0] });
            if (sql.includes('INSERT INTO ai_messages')) rows.push({ type:'message', role:args[1], content:args[2] });
            if (sql.includes('INSERT INTO ai_unknown_questions')) unknown.push({ id:unknown.length+1, conversation_id:args[0], question:args[1], name:args[2], phone:args[3], status:'pending' });
          },
          async all() {
            if (sql.includes('FROM ai_messages')) return { results: rows.filter(x=>x.type==='message').slice(-12).map(x=>({role:x.role,content:x.content})) };
            return { results:[] };
          },
          async first() {
            if (sql.includes('FROM ai_unknown_questions')) return unknown.at(-1) || null;
            return null;
          }
        };
      }};
    },
    _rows: rows,
    _unknown: unknown
  };
}

const plate = { x:0.42, y:0.58, width:0.16, height:0.06 };

test('production gate: Telegram auto-publish requires identity + confidence >= 0.85, not PT Xtra plate detection', () => {
  assert.equal(canAutoPublish({ brand:'Lexus', model:'LX 600', confidence:0.85, plate_bbox:plate }), true);
  assert.equal(canAutoPublish({ brand:'Lexus', model:'LX 600', confidence:0.85, plate_bbox:null }), true);
  assert.equal(canAutoPublish({ brand:'Lexus', model:'LX 600', confidence:0.85 }), true);
  assert.equal(canAutoPublish({ brand:'Lexus', model:'LX 600', confidence:0.849, plate_bbox:plate }), false);
  assert.equal(canAutoPublish({ brand:'Lexus', model:null, confidence:0.99, plate_bbox:plate }), false);
  assert.equal(canAutoPublish({ brand:null, model:'LX 600', confidence:0.99, plate_bbox:plate }), false);
});

test('production gate: unknown AI Chat is handed to a human and AI is not called', async () => {
  const DB = mockDb();
  let aiCalled = false;
  const env = {
    DB,
    AI_SEARCH: { async search() { return { chunks:[] }; } },
    AI: { async run() { aiCalled = true; throw new Error('AI must not answer unknown production-gate question'); } }
  };
  const response = await handleAiChat(new Request('https://phanthuanxtra.com/api/ai-chat', {
    method:'POST', headers:{'content-type':'application/json'},
    body:JSON.stringify({ conversation_id:'production-unknown-gate', visitor_id:'production-unknown-gate', message:'Chính sách pháp lý ngoài dữ liệu PHAN THUẦN XTRA là gì?' })
  }), env);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.needs_human, true);
  assert.equal(aiCalled, false);
  assert.equal(DB._unknown.length, 1);
  assert.match(data.reply, /thông tin xác thực/);
});
