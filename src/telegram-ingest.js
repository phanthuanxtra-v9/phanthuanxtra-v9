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

export async function handleTelegramIngest(request,env){
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
  const photo=pickPhoto(message);
  if(!message||!photo)return json({ok:true,ignored:true});
  if(!env.DB)return json({ok:false,error:"D1 chưa được kết nối"},500);
  const caption=clean(message.caption);
  const file=await tg(env,"getFile",{file_id:photo.file_id});
  const filePath=clean(file?.file_path);
  if(!filePath)throw new Error("Telegram không trả file_path");
  const sourceHash=await sha256(`${message.chat?.id||""}:${message.message_id}:${photo.file_unique_id||photo.file_id}`);
  await env.DB.prepare(`INSERT INTO telegram_inbox (source_hash,chat_id,message_id,file_id,file_unique_id,file_path,caption,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'received',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP) ON CONFLICT(source_hash) DO NOTHING`).bind(sourceHash,String(message.chat?.id||""),Number(message.message_id||0),photo.file_id,photo.file_unique_id||"",filePath,caption).run();
  return json({ok:true,received:true,source_hash:sourceHash,file_path:filePath});
}

export async function setTelegramWebhook(env,webhookUrl){
  const payload={url:webhookUrl,allowed_updates:["message","channel_post"]};
  if(env.TELEGRAM_WEBHOOK_SECRET)payload.secret_token=env.TELEGRAM_WEBHOOK_SECRET;
  return tg(env,"setWebhook",payload);
}
