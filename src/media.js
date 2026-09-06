const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...extra}});

export async function storeMedia(env,key,body,contentType="application/octet-stream"){
  if(!env.MEDIA)throw new Error("MEDIA binding is not configured");
  await env.MEDIA.put(key,body,{httpMetadata:{contentType,cacheControl:"public, max-age=31536000, immutable"}});
  return key;
}

export async function handleMediaApi(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith("/media/"))return null;
  if(request.method!=="GET"&&request.method!=="HEAD")return json({error:"Method Not Allowed"},405,{Allow:"GET, HEAD"});
  if(!env.MEDIA)return json({error:"Media storage unavailable"},503);
  const key=decodeURIComponent(url.pathname.slice("/media/".length));
  if(!key||key.includes(".."))return json({error:"Invalid media key"},400);
  const object=await env.MEDIA.get(key);
  if(!object)return json({error:"Not Found"},404);
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag",object.httpEtag);
  headers.set("cache-control",headers.get("cache-control")||"public, max-age=31536000, immutable");
  return request.method==="HEAD"?new Response(null,{headers}):new Response(object.body,{headers});
}
