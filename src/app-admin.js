const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","X-Content-Type-Options":"nosniff","X-Frame-Options":"DENY","Referrer-Policy":"strict-origin-when-cross-origin","Strict-Transport-Security":"max-age=31536000; includeSubDomains; preload"}});
const text=(v,n)=>String(v??"").trim().slice(0,n);
const auth=(r,e)=>{const t=e.APP_API_TOKEN,a=r.headers.get("Authorization")||"";return !!t&&a.startsWith("Bearer ")&&a.slice(7)===t};
const deny=()=>json({error:"Unauthorized"},401);

export async function handleAppAdmin(request,env){
  const u=new URL(request.url);
  if(!u.pathname.startsWith("/api/app/v1/"))return null;
  if(u.pathname!=="/api/app/v1/dashboard"&&u.pathname!=="/api/app/v1/leads")return null;
  if(request.method!=="GET")return json({error:"Method Not Allowed"},405,{Allow:"GET"});
  if(!auth(request,env))return deny();
  if(!env.DB)return json({error:"D1 chưa được kết nối"},503);

  if(u.pathname==="/api/app/v1/leads"){
    const q=text(u.searchParams.get("q"),120);
    let sql="SELECT id,name,phone,car_id,message,created_at FROM leads";
    const args=[];
    if(q){sql+=" WHERE name LIKE ? OR phone LIKE ? OR car_id LIKE ? OR message LIKE ?";const x=`%${q}%`;args.push(x,x,x,x)}
    sql+=" ORDER BY created_at DESC,id DESC LIMIT 500";
    const result=await env.DB.prepare(sql).bind(...args).all();
    return json({leads:result.results||[],count:(result.results||[]).length,lead_status_supported:false});
  }

  const [carsN,leadsN,soldN,reservedN]=await Promise.all([
    env.DB.prepare("SELECT COUNT(*) n FROM cars").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM leads").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM cars WHERE status='sold'").first("n"),
    env.DB.prepare("SELECT COUNT(*) n FROM cars WHERE status='reserved'").first("n")
  ]);
  return json({stats:{cars:Number(carsN||0),leads:Number(leadsN||0),sold:Number(soldN||0),reserved:Number(reservedN||0),newLeads:null,leadStatusSupported:false}});
}
