import test from 'node:test';
import assert from 'node:assert/strict';
import { handleVipTelegram, docType, safeExt, imageType, downloadTelegramFile } from '../src/vip-telegram.js';

test('VIP document classification handles Vietnamese registration and inspection captions',()=>{
  assert.equal(docType('Ảnh đăng ký xe'), 'registration_document');
  assert.equal(docType('Giấy đăng kiểm'), 'inspection_document');
  assert.equal(docType('VIN và ghi chú'), 'text');
});

test('VIP document extension is allowlisted and unsafe extensions become bin',()=>{
  assert.equal(safeExt('cavet.pdf'), '.pdf');
  assert.equal(safeExt('photo.JPG'), '.jpg');
  assert.equal(safeExt('payload.exe'), '.bin');
  assert.equal(safeExt('no-extension'), '.bin');
});

test('VIP image content types are restricted to supported image formats',()=>{
  assert.equal(imageType('image/jpeg'), true);
  assert.equal(imageType('image/png'), true);
  assert.equal(imageType('image/webp'), true);
  assert.equal(imageType('application/pdf'), false);
  assert.equal(imageType('image/svg+xml'), false);
});

test('VIP Telegram document download enforces 15 MB limit from content-length', async()=>{
  const originalFetch=global.fetch;
  let calls=0;
  global.fetch=async()=>{
    calls++;
    if(calls===1)return new Response(JSON.stringify({ok:true,result:{file_path:'documents/big.pdf'}}),{status:200,headers:{'content-type':'application/json'}});
    return new Response('too big',{status:200,headers:{'content-type':'application/pdf','content-length':String(15*1024*1024+1)}});
  };
  try{
    await assert.rejects(downloadTelegramFile({TELEGRAM_VIP_BOT_TOKEN:'test-token'},'file-1'),/exceeds 15 MB limit/);
    assert.equal(calls,2);
  }finally{global.fetch=originalFetch;}
});

test('VIP admin webhook endpoint advertises POST on method mismatch',async()=>{
  const response=await handleVipTelegram(new Request('https://example.com/api/admin/telegram/vip-webhook',{method:'GET'}),{});
  assert.equal(response.status,405);
  assert.equal(response.headers.get('Allow'),'POST');
});
