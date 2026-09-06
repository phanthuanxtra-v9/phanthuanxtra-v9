import { analyzeVehicleImage } from "./vehicle-ai.js";
import { handleAiChat } from "./ai-chat.js";

const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});
const clean=v=>String(v??"").trim();
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sha256=async value=>{const b=new TextEncoder().encode(value),h=await crypto.subtle.digest("SHA-256",b);return[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,"0")).join("")};

async function tg(token,method,payload={}){
  if(!token)throw new Error("Telegram bot token is not configured");
  const r=await fetch(`https://api.telegram.org/bot${token}/${method}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.ok)throw new Error(clean(d.description)||`Telegram ${method} failed`);
  return d.result;
}
const pickPhoto=m=>Array.isArray(m?.photo)&&m.photo.length?m.photo[m.photo.length-1]:null;

async function processBundle(env,bundleKey,chatId){
  const rows=(await env.DB.prepare(`SELECT * FROM telegram_inbox WHERE bundle_key=? ORDER BY id ASC`).bind(bundleKey).all()).results||[];
  const photoRow=rows.find(r=>r.file_id);
  if(!photoRow)return;
  const text=rows.map(r=>clean(r.caption)).filter(Boolean).join("\n\n");
  await env.DB.prepare(`UPDATE telegram_inbox SET bundle_status='processing',updated_at=CURRENT_TIMESTAMP WHERE bundle_key=?`).bind(bundleKey).run();
  try{
    const file=await tg(env.TELEGRAM_BOT_TOKEN,"getFile",{file_id:photoRow.file_id});
    const filePath=clean(file?.file_path);
    const image=await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`);
    if(!image.ok)throw new Error(`Telegram file download failed: ${image.status}`);
    const bytes=await image.arrayBuffer();
    const contentType=image.headers.get("content-type")||"image/jpeg";
    const extension=contentType.includes("png")?"png":contentType.includes("webp")?"webp":"jpg";
    const mediaKey=`vehicles/inbox-${photoRow.id}-${bundleKey.slice(0,16)}.${extension}`;
    await env.MEDIA.put(mediaKey,bytes,{httpMetadata:{contentType,cacheControl:"public, max-age=31536000, immutable"}});
    const ai=await analyzeVehicleImage(env,bytes,contentType,text);
    const inboxId=Number(photoRow.id);
    await env.DB.prepare(`INSERT INTO vehicle_ai_drafts (inbox_id,status,ai_json,confidence,missing_fields_json,source_caption,source_file_path,created_at,updated_at) VALUES (?, 'draft', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(inbox_id) DO UPDATE SET ai_json=excluded.ai_json,confidence=excluded.confidence,missing_fields_json=excluded.missing_fields_json,source_caption=excluded.source_caption,source_file_path=excluded.source_file_path,error=NULL,status='draft',updated_at=CURRENT_TIMESTAMP`).bind(inboxId,JSON.stringify({...ai,media_key:mediaKey,bundle_key:bundleKey}),Number(ai.confidence||0),JSON.stringify(ai.missing_fields||[]),text,filePath).run();
    await env.DB.prepare(`UPDATE telegram_inbox SET status='analyzed',processed_image_url=?,bundle_status='done',caption=?,file_path=?,updated_at=CURRENT_TIMESTAMP WHERE bundle_key=?`).bind(`/media/${mediaKey}`,text,filePath,bundleKey).run();
    const label=[ai.brand,ai.model].filter(Boolean).join(" ")||"Chưa xác định tên xe";
    const reply=["✅ ĐÃ GHÉP ẢNH + THÔNG TIN XE",`📦 Inbox: ${inboxId}`,`🚗 Xe: ${label}`,ai.year?`📅 Năm: ${ai.year}`:null,ai.price!=null?`💰 Giá: ${ai.price}`:null,ai.mileage!=null?`🛣 ODO: ${ai.mileage}`:null,`🎯 AI: ${Math.round(Number(ai.confidence||0)*100)}%`,`🖼 /media/${mediaKey}`,"⏳ Đã tạo bản nháp AI, chưa tự đăng bán."].filter(Boolean).join("\n");
    await tg(env.TELEGRAM_BOT_TOKEN,"sendMessage",{chat_id:chatId,reply_to_message_id:Number(photoRow.message_id||0),text:reply});
  }catch(error){
    const msg=clean(error?.message||error);
    await env.DB.prepare(`UPDATE telegram_inbox SET status='failed',bundle_status='failed',error=?,updated_at=CURRENT_TIMESTAMP WHERE bundle_key=?`).bind(msg,bundleKey).run().catch(()=>{});
    await tg(env.TELEGRAM_BOT_TOKEN,"sendMessage",{chat_id:chatId,text:`❌ Không xử lý được gói ảnh + thông tin\n📦 Bundle: ${bundleKey}\n⚠️ ${msg}`}).catch(()=>{});
  }
}

async function autoWebhook(request,env,ctx){
  if(!env.DB||!env.MEDIA)return json({ok:false,error:"D1/MEDIA chưa được kết nối"},503);
  const secret=env.TELEGRAM_WEBHOOK_SECRET;
  if(secret&&request.headers.get("X-Telegram-Bot-Api-Secret-Token")!==secret)return json({error:"Unauthorized"},401);
  const update=await request.json().catch(()=>null);
  const message=update?.message||update?.channel_post;
  if(!message?.chat?.id)return json({ok:true,ignored:true});
  const photo=pickPhoto(message);
  const caption=clean(message.caption||message.text);
  if(!photo&&!caption)return json({ok:true,ignored:true});
  const chatId=String(message.chat.id);
  const sourceHash=await sha256(`${chatId}:${message.message_id}:${photo?.file_unique_id||caption}`);
  const bundleKey=`${chatId}:${Math.floor(Number(message.date||Date.now()/1000)/15)}`;
  await env.DB.prepare(`INSERT INTO telegram_inbox (source_hash,chat_id,message_id,file_id,file_unique_id,file_path,caption,status,bundle_key,bundle_status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'received',?,'pending',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(source_hash) DO NOTHING`).bind(sourceHash,chatId,Number(message.message_id||0),photo?.file_id||"",photo?.file_unique_id||"","",caption,bundleKey).run();
  const rows=(await env.DB.prepare(`SELECT id,file_id,caption FROM telegram_inbox WHERE bundle_key=? ORDER BY id`).bind(bundleKey).all()).results||[];
  const hasPhoto=rows.some(r=>r.file_id);
  const hasText=rows.some(r=>clean(r.caption));
  if(hasPhoto&&hasText){
    await tg(env.TELEGRAM_BOT_TOKEN,"sendMessage",{chat_id:chatId,reply_to_message_id:Number(message.message_id||0),text:"📥 ĐÃ GHÉP ẢNH + THÔNG TIN XE\n⏳ Đang phân tích AI..."}).catch(()=>{});
    if(ctx)ctx.waitUntil((async()=>{await sleep(1200);await processBundle(env,bundleKey,chatId)})());
  }else{
    await tg(env.TELEGRAM_BOT_TOKEN,"sendMessage",{chat_id:chatId,reply_to_message_id:Number(message.message_id||0),text:photo?"📥 Đã nhận ảnh. Chờ phần thông tin xe để ghép tự động.":"📥 Đã nhận thông tin. Chờ ảnh xe để ghép tự động."}).catch(()=>{});
  }
  return json({ok:true,received:true,bundle_key:bundleKey,has_photo:hasPhoto,has_text:hasText});
}

async function aiWebhook(request,env){
  if(!env.TELEGRAM_CHAT_BOT_TOKEN)return json({ok:false,error:"TELEGRAM_CHAT_BOT_TOKEN is not configured"},503);
  const secret=env.TELEGRAM_CHAT_WEBHOOK_SECRET;
  if(secret&&request.headers.get("X-Telegram-Chat-Bot-Api-Secret-Token")!==secret)return json({error:"Unauthorized"},401);
  const update=await request.json().catch(()=>null);
  const message=update?.message||update?.edited_message;
  if(!message?.chat?.id)return json({ok:true,ignored:true});
  const text=clean(message.text||message.caption);
  if(!text)return json({ok:true,ignored:true});
  const chatId=String(message.chat.id);
  const aiRequest=new Request(new URL("/api/ai-chat",request.url),{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message:text,conversation_id:`telegram:${chatId}`,visitor_id:`telegram:${chatId}`,channel:"telegram"})});
  const aiResponse=await handleAiChat(aiRequest,env);
  const result=await aiResponse.json().catch(()=>({ok:false}));
  if(result.reply)await tg(env.TELEGRAM_CHAT_BOT_TOKEN,"sendMessage",{chat_id:chatId,reply_to_message_id:Number(message.message_id||0),text:clean(result.reply,4000)});
  return json({ok:true,conversation_id:result.conversation_id,replied:Boolean(result.reply)});
}

export async function handleTelegramRouter(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==="/api/telegram/webhook"&&request.method==="POST")return autoWebhook(request,env,ctx);
  if(url.pathname==="/api/telegram/ai-webhook"&&request.method==="POST")return aiWebhook(request,env);
  return null;
}

export async function setTelegramAiWebhook(env,webhookUrl){
  const result=await tg(env.TELEGRAM_CHAT_BOT_TOKEN,"setWebhook",{url:webhookUrl,allowed_updates:["message","edited_message"],...(env.TELEGRAM_CHAT_WEBHOOK_SECRET?{secret_token:env.TELEGRAM_CHAT_WEBHOOK_SECRET}:{})});
  return result;
}
