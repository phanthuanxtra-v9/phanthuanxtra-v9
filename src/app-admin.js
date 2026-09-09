const SEC={"X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY","Referrer-Policy":"strict-origin-when-cross-origin","Permissions-Policy":"camera=(), microphone=(), geolocation=()","Cross-Origin-Opener-Policy":"same-origin","Cross-Origin-Resource-Policy":"same-origin","Strict-Transport-Security":"max-age=31536000; includeSubDomains; preload"};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...SEC,...headers}});
const text=(v,n)=>String(v??"").trim().slice(0,n);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const LEAD_STATUSES=new Set(["new","contacted","qualified","won","lost"]);
const auth=(r,e)=>{const t=e.APP_API_TOKEN,a=r.headers.get("Authorization")||"";return !!t&&a.startsWith("Bearer ")&&a.slice(7)===t};
const deny=()=>json({error:"Unauthorized"},401,{"WWW-Authenticate":"Bearer"});
async function handleLeads(request,env,u){
  if(request.method!=='GET'&&request.method!=='PUT'&&request.method!=='DELETE')return json({error:"Method Not Allowed"},405,{Allow:"GET,PUT,DELETE"});
  if(!env.DB)return json({error:"D1 chưa được kết nối"},503);
  if(request.method==='GET'){
    const q=text(u.searchParams.get("q"),120),status=text(u.searchParams.get("status"),30);
    if(status&&!LEAD_STATUSES.has(status))return json({error:"Trạng thái lead không hợp lệ"},400);
    let sql="SELECT id,name,phone,car_id,message,status,note,created_at,updated_at FROM leads",args=[],where=[];
    if(q){where.push("(name LIKE ? OR phone LIKE ? OR car_id LIKE ? OR message LIKE ? OR note LIKE ?)");const x=`%${q}%`;args.push(x,x,x,x,x)}
    if(status){where.push("status=?");args.push(status)}
    if(where.length)sql+=` WHERE ${where.join(' AND ')}`;
    sql+=" ORDER BY created_at DESC,id DESC LIMIT 500";
    const result=await env.DB.prepare(sql).bind(...args).all();
    return json({leads:result.results||[],count:(result.results||[]).length,statuses:[...LEAD_STATUSES]});
  }
  const raw=await request.json().catch(()=>null),id=num(raw?.id);
  if(!Number.isInteger(id)||id<1)return json({error:"ID lead không hợp lệ"},400);
  if(request.method==='PUT'){
    const status=text(raw?.status||'new',30),note=text(raw?.note,3000);
    if(!LEAD_STATUSES.has(status))return json({error:"Trạng thái lead không hợp lệ"},400);
    const result=await env.DB.prepare("UPDATE leads SET status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?").bind(status,note,id).run();
    if(Number(result?.meta?.changes||0)!==1)return json({error:"Không tìm thấy lead"},404);
    return json({ok:true,id,status,note});
  }
  const result=await env.DB.prepare("DELETE FROM leads WHERE id=?").bind(id).run();
  if(Number(result?.meta?.changes||0)!==1)return json({error:"Không tìm thấy lead"},404);
  return json({ok:true,id,deleted:true});
}
export async function handleAppAdmin(request,env){
  const u=new URL(request.url);
  if(!u.pathname.startsWith("/api/app/v1/"))return null;
  const isDashboard=u.pathname==="/api/app/v1/dashboard";
  const isLeads=u.pathname==="/api/app/v1/leads";
  if(!isDashboard&&!isLeads)return null;
  if(!auth(request,env))return deny();
  if(isLeads)return handleLeads(request,env,u);
  if(request.method!=="GET")return json({error:"Method Not Allowed"},405,{Allow:"GET"});
  if(!env.DB)return json({error:"D1 chưa được kết nối"},503);
  const [carsN,leadsN,soldN,reservedN,newLeadsN]=await Promise.all([
    env.DB.prepare("SELECT COUNT(*) n FROM cars").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM leads").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM cars WHERE status='sold'").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM cars WHERE status='reserved'").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM leads WHERE status='new'").first("n")
  ]);
  return json({stats:{cars:Number(carsN||0),leads:Number(leadsN||0),sold:Number(soldN||0),reserved:Number(reservedN||0),newLeads:Number(newLeadsN||0),leadStatusSupported:true}});
}
