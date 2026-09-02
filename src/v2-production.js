export default {
  async fetch(r, env, ctx) { return handleRequest(r, env, ctx); },
  async scheduled(e, env, ctx) { ctx.waitUntil(scheduledHandler(e, env)); }
};

// === CONFIG ===
const AI_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast';
const SYS = `Tro ly cua anh Phan Thuan - PhanThuanXtra. 6 linh vuc: Xe Sang, Nang Luong Xanh, Du Thuyen, May Bay, Thuong Gia, Lai Thu. Tra loi tieng Viet, lich su, ngan gon. Hotline: 08 6699 7891. Neu hoi gia, huong dan de lai thong tin qua form.`;
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' };
const H = { ...CORS, 'Content-Type': 'application/json' };
const HTML_CT = { ...CORS, 'Content-Type': 'text/html;charset=UTF-8' };

// === HELPERS ===
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: H });
const getKV = async (env, ns, key) => { try { return env[ns] ? await env[ns].get(key) : null; } catch { return null; } };
const putKV = async (env, ns, key, val, ttl) => { try { if (env[ns]) await env[ns].put(key, val, ttl ? { expirationTtl: ttl } : undefined); } catch {} };

async function getTg(env) {
  let token = await getKV(env, 'LUXURY_UI_CACHE', 'tg_bot_token') || env.TELEGRAM_BOT_TOKEN || null;
  let chatId = await getKV(env, 'LUXURY_UI_CACHE', 'tg_chat_id') || env.TELEGRAM_CHAT_ID || null;
  return { token, chatId };
}

async function tgSend(env, chatId, text) {
  const { token } = await getTg(env);
  if (!token) return;
  await fetch('https://api.telegram.org/bot' + token + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }) });
}

function fallbackReply(msg) {
  const m = (msg || '').toLowerCase().trim();
  if (!m) return 'Vui long nhap cau hoi nhe!';
  if (/chao|hello|hi|hey/.test(m)) return 'Xin chao! Toi la Tro ly cua anh Phan Thuan. Toi giup gi cho ban?';
  if (/gia|bao gia|chi phi/.test(m)) return 'Anh Thuan se lien he bao gia. De lai thong tin qua form dang ky nhe!';
  if (/lien he|contact|phone|dien thoai/.test(m)) return 'Hotline: 08 6699 7891. De lai thong tin qua form!';
  if (/dang ky|register|dk/.test(m)) return 'Dien form dang ky lai thu xe ben duoi nhe!';
  return 'Cam on ban! Anh Phan Thuan se phan hoi som nhat. De lai thong tin qua form!';
}

async function aiReply(env, messages) {
  if (!env.AI) return null;
  try { const a = await env.AI.run(AI_MODEL, { messages }); return a.response || null; } catch { return null; }
}

async function apiHealth(env) {
  return json({
    ok: true,
    service: 'phanthuanxtra-v2',
    ai: !!env.AI,
    customer_data: !!env.CUSTOMER_DATA,
    luxury_ui_cache: !!env.LUXURY_UI_CACHE,
    timestamp: new Date().toISOString()
  });
}

// === ROUTER ===
async function handleRequest(r, env, ctx) {
  const u = new URL(r.url), p = u.pathname, m = r.method;
  if (m === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

  if (p.startsWith('/api/') || p === '/test') {
    try {
      switch (true) {
        case p === '/api/ai' && m === 'POST': return await apiAI(r, env, ctx);
        case p === '/api/contact' && m === 'POST': return await apiContact(r, env, ctx);
        case p === '/api/stats' && m === 'GET': return await apiStats(env);
        case p === '/api/telegram' && m === 'POST': return await apiTelegram(r, env);
        case p === '/api/telegram/config' && m === 'POST': return await apiTgConfig(r, env);
        case p === '/api/telegram/setup' && m === 'GET': return await apiTgSetup(env, u);
        case p === '/api/telegram/daily' && m === 'GET': return await apiTgDaily(env);
        case p === '/api/html' && m === 'POST': return await apiHtml(r, env);
        case p === '/api/health' && m === 'GET': return await apiHealth(env);
        case p === '/test' && m === 'GET': return await apiTest(env);
        default: return json({ error: 'Not found' }, 404);
      }
    } catch (e) { return json({ error: e.message }, 500); }
  }

  let html = await getKV(env, 'LUXURY_UI_CACHE', 'index_html');
  if (!html) html = getHTML();
  return new Response(html, { headers: HTML_CT });
}

// === API HANDLERS ===
async function apiAI(r, env, ctx) {
  const { msg, sid } = await r.json();
  if (!msg) return json({ reply: 'Vui long nhap cau hoi.' });
  const key = 'chat_' + (sid || 'default');
  let h = [];
  const saved = await getKV(env, 'CUSTOMER_DATA', key);
  if (saved) h = JSON.parse(saved);
  h.push({ role: 'user', content: msg });
  const reply = await aiReply(env, [{ role: 'system', content: SYS }, ...h.slice(-20)]) || fallbackReply(msg);
  h.push({ role: 'assistant', content: reply });
  await putKV(env, 'CUSTOMER_DATA', key, JSON.stringify(h), 86400);
  const { chatId } = await getTg(env);
  if (chatId) ctx.waitUntil(tgSend(env, chatId, 'Chat: ' + msg));
  return json({ reply, sid: sid || 'default', name: 'Tro ly cua anh Phan Thuan' });
}

async function apiContact(r, env, ctx) {
  const d = await r.json();
  const { name, phone, email, car, date, message } = d;
  if (!name || !phone) return json({ success: false, error: 'Vui long nhap ho ten va so dien thoai.' }, 400);
  const id = 'c_' + Date.now();
  const record = { id, name, phone, email: email || '', car: car || '', date: date || '', message: message || '', created_at: new Date().toISOString() };
  await putKV(env, 'CUSTOMER_DATA', id, JSON.stringify(record), 2592000);
  await putKV(env, 'LUXURY_UI_CACHE', 'last_contact', JSON.stringify(record));
  const { chatId } = await getTg(env);
  if (chatId) ctx.waitUntil(tgSend(env, chatId, `Dang ky: ${name} - ${phone}${email ? ' - ' + email : ''}${car ? ' - ' + car : ''}${date ? ' - ' + date : ''}${message ? ' - ' + message : ''}`));
  return json({ success: true, id });
}

async function apiStats(env) {
  let lastContact = null;
  const lc = await getKV(env, 'LUXURY_UI_CACHE', 'last_contact');
  if (lc) lastContact = JSON.parse(lc);
  let regCount = 0;
  if (env.CUSTOMER_DATA) { const list = await env.CUSTOMER_DATA.list({ prefix: 'c_' }); regCount = list.keys?.length || 0; }
  return json({ success: true, registrations: regCount, lastContact });
}

async function apiTelegram(r, env) {
  const body = await r.json();
  const tgMsg = body.message;
  if (!tgMsg?.text) return json({ ok: true });
  const chatId = tgMsg.chat.id;
  const text = tgMsg.text;
  const key = 'tg_' + chatId;
  let log = [];
  const ex = await getKV(env, 'CUSTOMER_DATA', key);
  if (ex) log = JSON.parse(ex);
  log.push({ from: 'user', text, time: new Date().toISOString() });
  const msgs = [{ role: 'system', content: SYS }, ...log.slice(-20).map(l => ({ role: l.from === 'user' ? 'user' : 'assistant', content: l.text }))];
  const reply = await aiReply(env, msgs) || fallbackReply(text);
  log.push({ from: 'bot', text: reply, time: new Date().toISOString() });
  await putKV(env, 'CUSTOMER_DATA', key, JSON.stringify(log), 604800);
  await tgSend(env, chatId, reply);
  return json({ ok: true });
}

async function apiTgConfig(r, env) {
  const { bot_token, chat_id } = await r.json();
  if (!bot_token || !chat_id) return json({ success: false, error: 'Thieu bot_token hoac chat_id' }, 400);
  await putKV(env, 'LUXURY_UI_CACHE', 'tg_bot_token', bot_token);
  await putKV(env, 'LUXURY_UI_CACHE', 'tg_chat_id', String(chat_id));
  return json({ success: true, message: 'Telegram config saved.' });
}

async function apiTgSetup(env, u) {
  const { token } = await getTg(env);
  if (!token) return json({ ok: false, error: 'Chua co token. POST /api/telegram/config truoc.' });
  const res = await fetch('https://api.telegram.org/bot' + token + '/setWebhook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: u.origin + '/api/telegram' }) });
  return json(await res.json());
}

async function apiTgDaily(env) { await dailyReport(env); return json({ success: true }); }

async function apiHtml(r, env) {
  const { html } = await r.json();
  if (!html) return json({ success: false, error: 'Thieu html' }, 400);
  await putKV(env, 'LUXURY_UI_CACHE', 'index_html', html);
  return json({ success: true, size: html.length });
}

async function apiTest(env) {
  const { token, chatId } = await getTg(env);
  const t = [];
  try { const d = await (await fetch('https://api.telegram.org/bot' + token + '/getMe')).json(); t.push({ name: 'Telegram', ok: d.ok, detail: d.ok ? '@' + d.result.username : 'err' }); } catch (e) { t.push({ name: 'Telegram', ok: false, detail: e.message }); }
  t.push({ name: 'AI', ok: !!env.AI, detail: env.AI ? 'ready' : 'not bound' });
  t.push({ name: 'LUXURY_UI_CACHE', ok: !!env.LUXURY_UI_CACHE, detail: env.LUXURY_UI_CACHE ? 'ready' : 'not bound' });
  t.push({ name: 'CUSTOMER_DATA', ok: !!env.CUSTOMER_DATA, detail: env.CUSTOMER_DATA ? 'ready' : 'not bound' });
  t.push({ name: 'TG_Token', ok: !!token, detail: token ? 'configured' : 'missing' });
  t.push({ name: 'TG_ChatID', ok: !!chatId, detail: chatId ? 'configured' : 'missing' });
  return json({ ok: t.every(x => x.ok), tests: t });
}

async function dailyReport(env) {
  const { token, chatId } = await getTg(env);
  if (!env.CUSTOMER_DATA || !token || !chatId) return;
  const list = await env.CUSTOMER_DATA.list({ prefix: 'c_' });
  const count = list.keys?.length || 0;
  let lastInfo = '';
  const lc = await getKV(env, 'LUXURY_UI_CACHE', 'last_contact');
  if (lc) { const d = JSON.parse(lc); lastInfo = '\nGan nhat: ' + d.name + ' - ' + d.phone; }
  await tgSend(env, chatId, 'Bao cao hang ngay\nTong dang ky: ' + count + lastInfo);
}

// === HTML UI ===
function getHTML() {
  return `<!DOCTYPE html><html lang="vi"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PhanThuanXtra — Xe Sang | Nang Luong Xanh | Du Thuyen | May Bay | Thuong Gia</title>
<meta name="description" content="PhanThuanXtra - Dich vu cao cap: Xe Sang, Nang Luong Xanh, Du Thuyen, May Bay, Thuong Gia, Lai Thu. Hotline: 08 6699 7891">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--gold:#c5a55a;--gold-d:#9a7e3e;--dark:#0a0a0f;--dark2:#14141c;--dark3:#1c1c28;--light:#f5f5f7;--gray:#8a8a9a;--r:16px;--sh:0 20px 60px rgba(0,0,0,.5)}
*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}
body{font-family:'Inter',sans-serif;background:var(--dark);color:var(--light);overflow-x:hidden}
h1,h2,h3,h4{font-family:'Playfair Display',serif;font-weight:700}
a{text-decoration:none;color:inherit}
section{padding:80px 20px;max-width:1200px;margin:0 auto}
.btn{display:inline-block;padding:14px 36px;border-radius:50px;border:none;cursor:pointer;font-size:15px;letter-spacing:.5px;transition:.3s;text-transform:uppercase}
.btn-g{background:linear-gradient(135deg,var(--gold),var(--gold-d));color:var(--dark);font-weight:700}
.btn-g:hover{transform:translateY(-2px);box-shadow:0 10px 30px rgba(197,165,90,.4)}
.btn-o{border:2px solid var(--gold);color:var(--gold);font-weight:600;background:transparent}
.btn-o:hover{background:var(--gold);color:var(--dark)}
nav{position:fixed;top:0;width:100%;z-index:1000;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;transition:.4s}
nav.scrolled{background:rgba(10,10,15,.95);backdrop-filter:blur(20px);padding:12px 40px;border-bottom:1px solid rgba(197,165,90,.15)}
.logo{font-family:'Playfair Display',serif;font-size:24px;font-weight:900;color:var(--gold);letter-spacing:1px}.logo span{color:var(--light)}
.nav-links{display:flex;gap:30px;list-style:none}.nav-links a{color:var(--light);font-size:14px;font-weight:500;transition:.3s;position:relative}.nav-links a:hover{color:var(--gold)}
.nav-links a::after{content:'';position:absolute;bottom:-4px;left:0;width:0;height:2px;background:var(--gold);transition:.3s}.nav-links a:hover::after{width:100%}
.nav-cta{display:none}@media(min-width:768px){.nav-cta{display:inline-block}}
.menu-toggle{display:none;font-size:24px;color:var(--gold);cursor:pointer;background:none;border:none}
.hero{min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;position:relative;overflow:hidden;padding-top:60px}
.hero::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(197,165,90,.12),transparent 60%),linear-gradient(180deg,var(--dark),var(--dark2))}
.hero-bg{position:absolute;inset:0;opacity:.06;background-image:linear-gradient(rgba(197,165,90,.1) 1px,transparent 1px),linear-gradient(90deg,rgba(197,165,90,.1) 1px,transparent 1px);background-size:60px 60px}
.hero-content{position:relative;z-index:2;max-width:800px}
.hero-badge{display:inline-block;padding:8px 24px;border:1px solid rgba(197,165,90,.3);border-radius:50px;color:var(--gold);font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px}
.hero h1{font-size:clamp(36px,6vw,68px);line-height:1.1;margin-bottom:20px;background:linear-gradient(135deg,var(--light) 30%,var(--gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.hero p{font-size:clamp(15px,2vw,19px);color:var(--gray);max-width:600px;margin:0 auto 36px;line-height:1.7}
.hero-buttons{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.scroll-indicator{position:absolute;bottom:30px;left:50%;transform:translateX(-50%);color:var(--gold);font-size:24px;animation:bounce 2s infinite}
@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(10px)}}
.section-title{text-align:center;margin-bottom:50px}.section-title .label{color:var(--gold);font-size:13px;letter-spacing:3px;text-transform:uppercase;display:block;margin-bottom:12px}
.section-title h2{font-size:clamp(28px,4vw,44px);margin-bottom:16px}.section-title p{color:var(--gray);max-width:600px;margin:0 auto}
.services-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;margin-top:40px}
.service-card{background:var(--dark2);border:1px solid rgba(255,255,255,.06);border-radius:var(--r);padding:36px 28px;transition:.4s;position:relative;overflow:hidden}
.service-card::before{content:'';position:absolute;top:0;left:0;width:100%;height:3px;background:linear-gradient(90deg,var(--gold),transparent);transform:scaleX(0);transform-origin:left;transition:.4s}
.service-card:hover{transform:translateY(-8px);border-color:rgba(197,165,90,.2);box-shadow:var(--sh)}
.service-card:hover::before{transform:scaleX(1)}
.service-icon{width:60px;height:60px;border-radius:14px;background:linear-gradient(135deg,rgba(197,165,90,.15),rgba(197,165,90,.05));display:flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:20px}
.service-card h3{font-size:22px;margin-bottom:12px;color:var(--light)}.service-card p{color:var(--gray);font-size:14px;line-height:1.7;margin-bottom:16px}
.service-card .tag{display:inline-block;padding:4px 14px;border-radius:50px;font-size:12px;color:var(--gold);border:1px solid rgba(197,165,90,.2)}
.stats{background:var(--dark2);border-radius:var(--r);padding:50px 30px;text-align:center}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:30px}
.stat-item{text-align:center}.stat-num{font-family:'Playfair Display',serif;font-size:clamp(32px,5vw,48px);color:var(--gold);font-weight:900}
.stat-label{color:var(--gray);font-size:13px;text-transform:uppercase;letter-spacing:1px;margin-top:6px}
.form-section{background:var(--dark2);border-radius:var(--r);padding:50px;border:1px solid rgba(197,165,90,.1)}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.form-group{margin-bottom:16px}.form-group.full{grid-column:1/-1}
.form-group label{display:block;font-size:13px;color:var(--gold);margin-bottom:6px;font-weight:600;letter-spacing:.5px}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:14px 16px;background:var(--dark3);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:var(--light);font-family:'Inter',sans-serif;font-size:14px;transition:.3s}
.form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:var(--gold);box-shadow:0 0 0 3px rgba(197,165,90,.1)}
.form-group textarea{resize:vertical;min-height:100px}
.form-msg{margin-top:16px;padding:12px 20px;border-radius:10px;font-size:14px;display:none}
.form-msg.success{display:block;background:rgba(34,197,94,.1);color:#4ade80;border:1px solid rgba(34,197,94,.2)}
.form-msg.error{display:block;background:rgba(239,68,68,.1);color:#f87171;border:1px solid rgba(239,68,68,.2)}
@media(max-width:640px){.form-grid{grid-template-columns:1fr}.form-section{padding:30px 20px}}
.chat-widget{position:fixed;bottom:24px;right:24px;z-index:999}
.chat-toggle{width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,var(--gold),var(--gold-d));border:none;cursor:pointer;font-size:26px;color:var(--dark);box-shadow:0 8px 30px rgba(197,165,90,.4);transition:.3s;display:flex;align-items:center;justify-content:center}
.chat-toggle:hover{transform:scale(1.1)}
.chat-box{position:absolute;bottom:80px;right:0;width:360px;max-width:calc(100vw - 48px);background:var(--dark2);border-radius:var(--r);border:1px solid rgba(197,165,90,.15);box-shadow:var(--sh);display:none;flex-direction:column;height:480px;overflow:hidden}
.chat-box.open{display:flex}
.chat-header{padding:16px 20px;background:linear-gradient(135deg,var(--gold-d),var(--gold));color:var(--dark);font-weight:700;display:flex;justify-content:space-between;align-items:center}
.chat-header .close{cursor:pointer;font-size:22px;background:none;border:none;color:var(--dark)}
.chat-messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.chat-msg{max-width:80%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5}
.chat-msg.bot{background:var(--dark3);align-self:flex-start;border-bottom-left-radius:4px}
.chat-msg.user{background:linear-gradient(135deg,var(--gold),var(--gold-d));color:var(--dark);align-self:flex-end;border-bottom-right-radius:4px;font-weight:500}
.chat-typing{align-self:flex-start;color:var(--gray);font-size:13px;padding:8px 14px}
.chat-input{display:flex;padding:12px;gap:8px;border-top:1px solid rgba(255,255,255,.06)}
.chat-input input{flex:1;padding:10px 14px;background:var(--dark3);border:1px solid rgba(255,255,255,.08);border-radius:10px;color:var(--light);font-size:14px}
.chat-input input:focus{outline:none;border-color:var(--gold)}
.chat-input button{padding:0 18px;background:var(--gold);border:none;border-radius:10px;color:var(--dark);cursor:pointer;font-size:18px;font-weight:700}
footer{background:var(--dark2);padding:50px 20px 30px;border-top:1px solid rgba(197,165,90,.1)}
.footer-content{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:30px}
.footer-col h4{color:var(--gold);margin-bottom:16px;font-size:16px}
.footer-col p,.footer-col a{color:var(--gray);font-size:14px;line-height:1.8;display:block}.footer-col a:hover{color:var(--gold)}
.footer-bottom{text-align:center;margin-top:30px;padding-top:20px;border-top:1px solid rgba(255,255,255,.05);color:var(--gray);font-size:13px}
@media(max-width:768px){.nav-links{display:none;position:absolute;top:100%;left:0;width:100%;background:var(--dark2);flex-direction:column;padding:20px;gap:16px}.nav-links.open{display:flex}.menu-toggle{display:block}nav{padding:14px 20px}}
</style></head><body>
<nav id="nav"><div class="logo">PHAN<span>THUAN</span>XTRA</div>
<ul class="nav-links" id="navLinks"><li><a href="#home">Trang Chu</a></li><li><a href="#services">Dich Vu</a></li><li><a href="#stats">Thong Ke</a></li><li><a href="#register">Dang Ky</a></li><li><a href="#contact">Lien He</a></li></ul>
<button class="btn btn-g nav-cta" onclick="document.getElementById('register').scrollIntoView()">Dang Ky Lai Thu</button>
<button class="menu-toggle" onclick="document.getElementById('navLinks').classList.toggle('open')">☰</button></nav>
<section class="hero" id="home"><div class="hero-bg"></div><div class="hero-content">
<span class="hero-badge">★ PhanThuanXtra Premium ★</span>
<h1>Trai Nghiem Dang Cap<br>Phong Cach Thuong Luu</h1>
<p>Xe Sang · Nang Luong Xanh · Du Thuyen · May Bay · Thuong Gia · Lai Thu — Tat ca trong mot nen tang dich vu cao cap danh cho khach hang tinh te.</p>
<div class="hero-buttons"><button class="btn btn-g" onclick="document.getElementById('register').scrollIntoView()">Dang Ky Lai Thu</button><button class="btn btn-o" onclick="document.getElementById('services').scrollIntoView()">Kham Pha Dich Vu</button></div>
</div><div class="scroll-indicator">⌄</div></section>
<section id="services"><div class="section-title"><span class="label">Dich Vu Cao Cap</span><h2>Sau Linh Vuc Dang Cap</h2><p>Moi dich vu duoc thiet ke rieng cho khach hang thuong luu, mang den trai nghiem hoan hao va doc quyen.</p></div>
<div class="services-grid">
<div class="service-card"><div class="service-icon">🚗</div><h3>Xe Sang</h3><p>So huu va trai nghiem nhung dong xe hang sang danh tieng nhat the gioi. Tu van chon xe theo phong cach va nhu cau.</p><span class="tag">Luxury Cars</span></div>
<div class="service-card"><div class="service-icon">⚡</div><h3>Nang Luong Xanh</h3><p>Giai phap xe dien va nang luong tai tao. Xe hybrid, xe dien cao cap voi cong nghe than thien moi truong.</p><span class="tag">Green Energy</span></div>
<div class="service-card"><div class="service-icon">🛥️</div><h3>Du Thuyen</h3><p>Thue va so huu du thuyen rieng. Trai nghiem bien ca dang cap voi dich vu VIP tron goi.</p><span class="tag">Yacht</span></div>
<div class="service-card"><div class="service-icon">✈️</div><h3>May Bay</h3><p>Cho thue may bay tu nhan, jet charter. Dich vu bay dang cap cho doanh nhan va khach VIP.</p><span class="tag">Private Jet</span></div>
<div class="service-card"><div class="service-icon">💼</div><h3>Thuong Gia</h3><p>Goi dich vu VIP cho doanh nhan: xe dua don san bay, phong cho thuong gia, tro ly rieng 24/7.</p><span class="tag">Business Class</span></div>
<div class="service-card"><div class="service-icon">🏁</div><h3>Lai Thu</h3><p>Dang ky lai thu xe sang tai dai ly. Trai nghiem thuc te truoc khi ra quyet dinh so huu.</p><span class="tag">Test Drive</span></div>
</div></section>
<section id="stats"><div class="stats"><div class="section-title" style="margin-bottom:30px"><span class="label">Thong Ke</span><h2>Con So Noi Len Tat Ca</h2></div>
<div class="stats-grid"><div class="stat-item"><div class="stat-num" id="statReg">0</div><div class="stat-label">Dang Ky</div></div><div class="stat-item"><div class="stat-num">6</div><div class="stat-label">Linh Vuc</div></div><div class="stat-item"><div class="stat-num">24/7</div><div class="stat-label">Ho Tro</div></div><div class="stat-item"><div class="stat-num">100%</div><div class="stat-label">Hai Long</div></div></div></div></section>
<section id="register"><div class="section-title"><span class="label">Dang Ky</span><h2>Dang Ky Lai Thu Xe Sang</h2><p>De lai thong tin, anh Phan Thuan se lien he voi ban trong thoi gian som nhat.</p></div>
<div class="form-section"><form id="regForm"><div class="form-grid">
<div class="form-group"><label>Ho va Ten *</label><input type="text" name="name" required placeholder="Nguyen Van A"></div>
<div class="form-group"><label>So Dien Thoai *</label><input type="tel" name="phone" required placeholder="09xx xxx xxx"></div>
<div class="form-group"><label>Email</label><input type="email" name="email" placeholder="email@example.com"></div>
<div class="form-group"><label>Xe Quan Tam</label><select name="car"><option value="">-- Chon --</option><option>Xe Sang</option><option>Nang Luong Xanh</option><option>Du Thuyen</option><option>May Bay</option><option>Thuong Gia</option><option>Lai Thu</option></select></div>
<div class="form-group"><label>Ngay Mong Muon</label><input type="date" name="date"></div>
<div class="form-group"><label>Loi Nhan</label><textarea name="message" placeholder="Noi dung ban muon trao doi..."></textarea></div>
</div><div style="margin-top:20px;text-align:center"><button type="submit" class="btn btn-g" style="width:100%;max-width:300px">Gui Dang Ky</button></div>
<div class="form-msg" id="formMsg"></div></form></div></section>
<section id="contact"><div class="section-title"><span class="label">Lien He</span><h2>Ket Noi Voi Chung Toi</h2><p>Hotline: 08 6699 7891 — San sang phuc vu 24/7</p></div>
<div class="form-section" style="text-align:center"><p style="font-size:18px;color:var(--gray);margin-bottom:20px">De lai thong tin hoac goi truc tiep hotline, anh Phan Thuan se tu van tan tinh.</p>
<a href="tel:0866997891" class="btn btn-g">📞 Goi Ngay: 08 6699 7891</a></div></section>
<footer><div class="footer-content">
<div class="footer-col"><h4>PhanThuanXtra</h4><p>Nen tang dich vu cao cap hang dau Viet Nam — Xe Sang, Nang Luong Xanh, Du Thuyen, May Bay, Thuong Gia.</p></div>
<div class="footer-col"><h4>Dich Vu</h4><a href="#services">Xe Sang</a><a href="#services">Nang Luong Xanh</a><a href="#services">Du Thuyen</a><a href="#services">May Bay</a><a href="#services">Thuong Gia</a></div>
<div class="footer-col"><h4>Lien Ket</h4><a href="#home">Trang Chu</a><a href="#register">Dang Ky</a><a href="#stats">Thong Ke</a><a href="#contact">Lien He</a></div>
<div class="footer-col"><h4>Lien He</h4><p>📞 Hotline: 08 6699 7891</p><p>🌐 phanthuanxtra.com</p><p>📍 Viet Nam</p></div>
</div><div class="footer-bottom">© 2026 PhanThuanXtra. All Rights Reserved.</div></footer>
<div class="chat-widget"><div class="chat-box" id="chatBox">
<div class="chat-header"><span>💬 Tro Ly Anh Phan Thuan</span><button class="close" onclick="document.getElementById('chatBox').classList.remove('open')">✕</button></div>
<div class="chat-messages" id="chatMessages"><div class="chat-msg bot">Xin chao! Toi la Tro ly cua anh Phan Thuan. Toi co the giup gi cho ban? 😊</div></div>
<div class="chat-input"><input type="text" id="chatInput" placeholder="Nhap cau hoi..." onkeypress="if(event.key==='Enter')sendChat()"><button onclick="sendChat()">➤</button></div>
</div><button class="chat-toggle" onclick="document.getElementById('chatBox').classList.toggle('open')">💬</button></div>
<script>
const sid=Math.random().toString(36).substr(2,9);
addEventListener('scroll',()=>{const n=document.getElementById('nav');n.classList.toggle('scrolled',scrollY>50)});
fetch('/api/stats').then(r=>r.json()).then(d=>{if(d.success)document.getElementById('statReg').textContent=d.registrations||0}).catch(()=>{});
document.getElementById('regForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.target,m=document.getElementById('formMsg'),d={name:f.name.value,phone:f.phone.value,email:f.email.value,car:f.car.value,date:f.date.value,message:f.message.value};m.className='form-msg';m.textContent='Dang gui...';m.style.display='block';try{const r=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});const j=await r.json();if(j.success){m.className='form-msg success';m.textContent='✅ Dang ky thanh cong! Anh Phan Thuan se lien he som nhat.';f.reset()}else{m.className='form-msg error';m.textContent='❌ '+(j.error||'Co loi xay ra')}}catch{m.className='form-msg error';m.textContent='❌ Loi ket noi. Thu lai.'}}});
async function sendChat(){const i=document.getElementById('chatInput'),msg=i.value.trim();if(!msg)return;i.value='';const ms=document.getElementById('chatMessages'),d=document.createElement('div');d.className='chat-msg user';d.textContent=msg;ms.appendChild(d);ms.scrollTop=ms.scrollHeight;const t=document.createElement('div');t.className='chat-typing';t.textContent='Dang go...';ms.appendChild(t);ms.scrollTop=ms.scrollHeight;try{const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({msg,sid})});const j=await r.json();t.remove();const b=document.createElement('div');b.className='chat-msg bot';b.textContent=j.reply||'Xin loi, khong the tra loi.';ms.appendChild(b);ms.scrollTop=ms.scrollHeight}catch{t.remove();const b=document.createElement('div');b.className='chat-msg bot';b.textContent='Loi ket noi. Thu lai.';ms.appendChild(b);ms.scrollTop=ms.scrollHeight}}
</script></body></html>`;
}
