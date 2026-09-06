import { analyzeVehicleImage } from "./vehicle-ai.js";

const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra}});
const clean=v=>String(v??"").trim();
const sha256=async value=>{const bytes=new TextEncoder().encode(value),hash=await crypto.subtle.digest("SHA-256",bytes);return[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,"0")).join("")};

async function tg(env,method,payload={}){
  if(!env.TELEGRAM_BOT_TOKEN)throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  const r=await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
  const d=await r.json().catch(()=>({}));
  if(!r.ok||!d.ok)throw new Error(clean(d.description)||`Telegram ${method} failed`);
  return d.result;
}

function pickPhoto(message){const photos=Array.isArray(message?.photo)?message.photo:[];return photos.length?photos[photos.length-1]:null;}
function authorized(request,env){const h=request.headers.get("Authorization")||"";return Boolean(env.ADMIN_TOKEN&&h===`Bearer ${env.ADMIN_TOKEN}`)}

async function processInbox(env,inboxId,filePath,caption,sourceHash){
  try{
    if(!env.MEDIA)throw new Error("MEDIA binding is not configured");
    const imageResponse=await fetch(`https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${filePath}`);
    if(!imageResponse.ok)throw new Error(`Telegram file download failed: ${imageResponse.status}`);
    const bytes=await imageResponse.arrayBuffer();
    const contentType=imageResponse.headers.get("content-type")||"image/jpeg";
    const extension=contentType.includes("png")?"png":contentType.includes("webp")?"webp":"jpg";
    const mediaKey=`vehicles/inbox-${inboxId}-${sourceHash.slice(0,16)}.${extension}`;
    await env.MEDIA.put(mediaKey,bytes,{httpMetadata:{contentType,cacheControl:"public, max-age=31536000, immutable"}});
    const ai=await analyzeVehicleImage(env,bytes,contentType,caption);
    await env.DB.prepare(`INSERT INTO vehicle_ai_drafts (inbox_id,status,ai_json,confidence,missing_fields_json,source_caption,source_file_path,created_at,updated_at) VALUES (?, 'draft', ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT(inbox_id) DO UPDATE SET ai_json=excluded.ai_json,confidence=excluded.confidence,missing_fields_json=excluded.missing_fields_json,source_caption=excluded.source_caption,source_file_path=excluded.source_file_path,error=NULL,status='draft',updated_at=CURRENT_TIMESTAMP`).bind(inboxId,JSON.stringify({...ai,media_key:mediaKey}),Number(ai.confidence||0),JSON.stringify(ai.missing_fields||[]),caption,filePath).run();
    await env.DB.prepare(`UPDATE telegram_inbox SET status='analyzed',processed_image_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(`/media/${mediaKey}`,inboxId).run();
  }catch(error){
    await env.DB.prepare(`UPDATE telegram_inbox SET status='failed',error=?,updated_at=CURRENT_TIMESTAMP WHERE id=?`).bind(clean(error?.message||error),inboxId).run().catch(()=>{});
  }
}

export async function handleTelegramIngest(request,env,ctx){
  const url=new URL(request.url);
  if(url.pathname==="/api/admin/telegram/webhook"){
    if(request.method!=="POST")return json({error:"Method Not Allowed"},405,{Allow:"POST"});
    if(!authorized(request,env))return json({error:"Unauthorized"},401,{"WWW-Authenticate":"Bearer"});
    const result=await setTelegramWebhook(env,`${url.origin}/api/telegram/webhook`);
    return json({ok:true,webhook:result});
  }
  if(url.pathname!=="/api/telegram/webhook")return null;
  if(request.method!=="POST")return json({error:"Method Not Allowed"},405,{Allow:"POST"});
  const secret=env.TELEGRAM_WEBHOOK_SECRET;
  if(secret&&request.headers.get("X-Telegram-Bot-Api-Secret-Token")!==secret)return json({error:"Unauthorized"},401);
  const update=await request.json().catch(()=>null);
  const message=update?.message||update?.channel_post||null;
  if(!message)return json({ok:true,ignored:true});
  if(!env.DB)return json({ok:false,error:"D1 chưa được kết nối"},500);
  const photo=pickPhoto(message);
  const caption=clean(message.caption||message.text);
  if(!photo&&!caption)return json({ok:true,ignored:true});
  const fileId=photo?.file_id||"";
  let filePath="";
  if(photo){
    const file=await tg(env,"getFile",{file_id:photo.file_id});
    filePath=clean(file?.file_path);
    if(!filePath)throw new Error("Telegram không trả file_path");
  }
  const sourceHash=await sha256(`${message.chat?.id||""}:${message.message_id}:${photo?.file_unique_id||fileId||caption}`);
  await env.DB.prepare(`INSERT INTO telegram_inbox (source_hash,chat_id,message_id,file_id,file_unique_id,file_path,caption,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'received',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(source_hash) DO NOTHING`).bind(sourceHash,String(message.chat?.id||""),Number(message.message_id||0),fileId,photo?.file_unique_id||"",filePath,caption).run();
  const inbox=await env.DB.prepare(`SELECT id FROM telegram_inbox WHERE source_hash=? LIMIT 1`).bind(sourceHash).first();
  if(inbox?.id&&photo&&ctx)ctx.waitUntil(processInbox(env,Number(inbox.id),filePath,caption,sourceHash));
  return json({ok:true,received:true,source_hash:sourceHash,inbox_id:inbox?.id||null,queued:Boolean(photo&&ctx)});
}

export async function setTelegramWebhook(env,webhookUrl){
  const payload={url:webhookUrl,allowed_updates:["message","channel_post"]};
  if(env.TELEGRAM_WEBHOOK_SECRET)payload.secret_token=env.TELEGRAM_WEBHOOK_SECRET;
  return tg(env,"setWebhook",payload);
}
