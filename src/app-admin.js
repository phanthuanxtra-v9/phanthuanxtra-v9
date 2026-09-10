const SEC={
  "X-Content-Type-Options":"nosniff",
  "X-Frame-Options":"DENY",
  "Referrer-Policy":"strict-origin-when-cross-origin",
  "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy":"same-origin",
  "Cross-Origin-Resource-Policy":"same-origin",
  "Strict-Transport-Security":"max-age=31536000; includeSubDomains; preload"
};

const json=(data,status=200,headers={})=>
 new Response(JSON.stringify(data),{
  status,
  headers:{
   "content-type":"application/json; charset=utf-8",
   "cache-control":"no-store",
   ...SEC,
   ...headers
  }
 });

const text=(v,n)=>String(v??"").trim().slice(0,n);
const num=v=>Number.isFinite(Number(v))?Number(v):0;

const LEAD_STATUSES=new Set([
 "new",
 "contacted",
 "qualified",
 "won",
 "lost"
]);


/* LOGIN PASSWORD */
async function adminLogin(request,env){

 const body=await request.json().catch(()=>({}));
 const password=String(body.password||"").trim();

 if(!env.ADMIN_PASSWORD){
  return json({
   error:"ADMIN_PASSWORD missing"
  },500);
 }

 if(password!==env.ADMIN_PASSWORD){
  return json({
   error:"Sai mật khẩu"
  },401);
 }

 const token=
  crypto.randomUUID().replaceAll("-","")+
  crypto.randomUUID().replaceAll("-","");

 return json({
  ok:true,
  token
 });
}


/* TOKEN AUTH */
const auth=(request)=>{
 const h=request.headers.get("Authorization")||"";
 return h.startsWith("Bearer ");
};

const deny=()=>
 json({
  error:"Unauthorized"
 },401,{
  "WWW-Authenticate":"Bearer"
 });


async function handleLeads(request,env,u){

 if(
  request.method!=="GET" &&
  request.method!=="PUT" &&
  request.method!=="DELETE"
 )
 return json({
  error:"Method Not Allowed"
 },405);


 if(!env.DB)
 return json({
  error:"D1 chưa kết nối"
 },503);


 if(request.method==="GET"){

  const q=text(u.searchParams.get("q"),120);
  const status=text(u.searchParams.get("status"),30);

  let sql=
  "SELECT id,name,phone,car_id,message,status,note,created_at,updated_at FROM leads";

  let args=[];
  let where=[];


  if(q){
   where.push(
    "(name LIKE ? OR phone LIKE ? OR car_id LIKE ? OR message LIKE ? OR note LIKE ?)"
   );

   const x=`%${q}%`;
   args.push(x,x,x,x,x);
  }


  if(status && LEAD_STATUSES.has(status)){
   where.push("status=?");
   args.push(status);
  }


  if(where.length)
   sql+=" WHERE "+where.join(" AND ");


  sql+=" ORDER BY created_at DESC LIMIT 500";


  const result=
   await env.DB.prepare(sql)
   .bind(...args)
   .all();


  return json({
   leads:result.results||[],
   count:(result.results||[]).length
  });
 }


 const raw=
  await request.json().catch(()=>null);

 const id=num(raw?.id);


 if(!id)
 return json({
  error:"ID không hợp lệ"
 },400);


 if(request.method==="PUT"){

  const status=
   text(raw.status||"new",30);

  const note=
   text(raw.note,3000);


  await env.DB.prepare(
   "UPDATE leads SET status=?,note=?,updated_at=CURRENT_TIMESTAMP WHERE id=?"
  )
  .bind(status,note,id)
  .run();


  return json({
   ok:true
  });
 }


 await env.DB.prepare(
  "DELETE FROM leads WHERE id=?"
 )
 .bind(id)
 .run();


 return json({
  ok:true,
  deleted:true
 });
}



/* MAIN ADMIN */
export async function handleAppAdmin(request,env){

 const u=new URL(request.url);


 /*
  PASSWORD LOGIN
 */
 if(
  request.method==="POST" &&
  u.pathname==="/api/admin/login"
 ){
  return adminLogin(request,env);
 }



 if(
  !u.pathname.startsWith("/api/admin/")
 )
 return null;



 if(!auth(request))
 return deny();



 if(
  u.pathname==="/api/admin/leads"
 )
 {
  return handleLeads(request,env,u);
 }



 if(
  u.pathname==="/api/admin/dashboard"
 ){

  if(request.method!=="GET")
  return json({
   error:"Method Not Allowed"
  },405);



  if(!env.DB)
  return json({
   error:"D1 missing"
  },503);



  const [
   carsN,
   leadsN,
   soldN,
   reservedN,
   newLeadsN
  ]=
  await Promise.all([

   env.DB.prepare(
    "SELECT COUNT(*) n FROM cars"
   ).first("n"),

   env.DB.prepare(
    "SELECT COUNT(*) n FROM leads"
   ).first("n"),

   env.DB.prepare(
    "SELECT COUNT(*) n FROM cars WHERE status='sold'"
   ).first("n"),

   env.DB.prepare(
    "SELECT COUNT(*) n FROM cars WHERE status='reserved'"
   ).first("n"),

   env.DB.prepare(
    "SELECT COUNT(*) n FROM leads WHERE status='new'"
   ).first("n")

  ]);


  return json({
   stats:{
    cars:Number(carsN||0),
    leads:Number(leadsN||0),
    sold:Number(soldN||0),
    reserved:Number(reservedN||0),
    newLeads:Number(newLeadsN||0)
   }
  });
 }


 return null;
}