const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store"}});

export async function handleMediaApi(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith("/media/"))return null;
  if(!env.MEDIA)return json({ok:false,error:"MEDIA binding is not configured"},503);
  const key=decodeURIComponent(url.pathname.slice("/media/".length));
  if(!key)return json({ok:false,error:"Not Found"},404);
  const object=await env.MEDIA.get(key);
  if(!object)return json({ok:false,error:"Not Found"},404);
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("cache-control","public, max-age=31536000, immutable");
  return new Response(object.body,{headers});
}
