import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAiChat } from '../src/ai-chat.js';

function mockDb() {
  const rows = [];
  return {
    prepare(sql) {
      return {
        bind(...args) {
          return {
            async run() {
              if (sql.includes('INSERT INTO ai_conversations')) rows.push({type:'conversation',id:args[0]});
              if (sql.includes('INSERT INTO ai_messages')) rows.push({type:'message',role:args[1],content:args[2]});
            },
            async all() {
              if (sql.includes('FROM ai_messages')) return {results: rows.filter(x=>x.type==='message').slice(-12).map(x=>({role:x.role,content:x.content}))};
              return {results:[]};
            },
            async first() { return null; }
          };
        }
      };
    },
    _rows: rows
  };
}

test('website AI chat creates a conversation, calls AI and persists reply', async () => {
  const DB = mockDb();
  const env = {
    DB,
    AI: { async run(model, payload) {
      assert.equal(model, '@cf/meta/llama-3.1-8b-instruct');
      assert.equal(payload.messages.at(-1).content, 'Tôi muốn tìm Lexus');
      return { response: 'Tôi có thể hỗ trợ anh tìm Lexus phù hợp.' };
    } }
  };
  const request = new Request('https://phanthuanxtra.com/api/ai-chat', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({conversation_id:'test-conversation',visitor_id:'test-visitor',message:'Tôi muốn tìm Lexus'})
  });
  const response = await handleAiChat(request, env);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.conversation_id, 'test-conversation');
  assert.match(data.reply, /Lexus/);
  assert.ok(DB._rows.some(x=>x.type==='message' && x.role==='user'));
  assert.ok(DB._rows.some(x=>x.type==='message' && x.role==='assistant'));
});

test('Phan Thuần identity knowledge is present when AI Search is unavailable', async () => {
  const DB = mockDb();
  const env = {
    DB,
    AI: { async run(model, payload) {
      const system = payload.messages.find(x => x.role === 'system')?.content || '';
      assert.match(system, /Tên được sử dụng: Phan Thuần/);
      assert.match(system, /Phan Thuần là người mà trợ lý PHAN THUẦN XTRA đang đại diện hỗ trợ/);
      assert.match(system, /Phan Thuần là ai/);
      return { response: 'Phan Thuần là người mà trợ lý PHAN THUẦN XTRA đang đại diện hỗ trợ và là tên gắn với thương hiệu PHAN THUẦN XTRA.' };
    } }
  };
  const request = new Request('https://phanthuanxtra.com/api/ai-chat', {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify({conversation_id:'identity-test',visitor_id:'identity-test',message:'Phan Thuần là ai'})
  });
  const response = await handleAiChat(request, env);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.match(data.reply, /Phan Thuần/);
});

test('website AI chat rejects empty messages', async () => {
  const response = await handleAiChat(new Request('https://phanthuanxtra.com/api/ai-chat', {
    method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({message:'   '})
  }), {DB:mockDb()});
  assert.equal(response.status, 400);
});
