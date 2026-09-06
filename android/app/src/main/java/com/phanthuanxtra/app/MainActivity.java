package com.phanthuanxtra.app;

import android.app.*;import android.os.*;import android.content.*;import android.net.Uri;import android.provider.OpenableColumns;import android.view.*;import android.widget.*;import org.json.*;import java.io.*;import java.net.*;import java.util.*;

public class MainActivity extends Activity {
  static final String BASE="https://phanthuanxtra.com/api/app/v1";
  EditText token; TextView output; Button inventory,add;
  final int PICK=7;
  @Override public void onCreate(Bundle b){super.onCreate(b); build();}
  TextView tv(String s){TextView v=new TextView(this);v.setText(s);v.setTextSize(16);v.setPadding(8,8,8,8);return v;}
  void build(){LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setPadding(24,24,24,24);
    root.addView(tv("PHAN THUẦN XTRA\nAPP MVP"));
    token=new EditText(this);token.setHint("APP API token");token.setInputType(129);root.addView(token);
    Button save=new Button(this);save.setText("LƯU TOKEN");save.setOnClickListener(v->getPreferences(0).edit().putString("token",token.getText().toString().trim()).apply());root.addView(save);
    Button dash=new Button(this);dash.setText("DASHBOARD");dash.setOnClickListener(v->call("GET","/dashboard",null,null));root.addView(dash);
    inventory=new Button(this);inventory.setText("KHO XE");inventory.setOnClickListener(v->call("GET","/cars",null,null));root.addView(inventory);
    add=new Button(this);add.setText("THÊM XE + AI");add.setOnClickListener(v->startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("image/*").addCategory(Intent.CATEGORY_OPENABLE),PICK));root.addView(add);
    output=tv("Sẵn sàng.");ScrollView sv=new ScrollView(this);sv.addView(output);root.addView(sv,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);
    token.setText(getPreferences(0).getString("token",""));
  }
  String auth(){String t=token.getText().toString().trim();return t.isEmpty()?getPreferences(0).getString("token",""):t;}
  void call(String method,String path,String json,byte[] raw){new Thread(()->{try{String r=request(method,BASE+path,json,raw,raw==null?"application/json":"image/jpeg");runOnUiThread(()->output.setText(r));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi: "+e.getMessage()));}}).start();}
  String request(String method,String url,String json,byte[] raw,String type)throws Exception{HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setRequestMethod(method);c.setConnectTimeout(20000);c.setReadTimeout(60000);c.setRequestProperty("Authorization","Bearer "+auth());c.setRequestProperty("Accept","application/json");if(raw!=null||json!=null){c.setDoOutput(true);c.setRequestProperty("Content-Type",type);try(OutputStream o=c.getOutputStream()){if(raw!=null)o.write(raw);else o.write(json.getBytes("UTF-8"));}}int code=c.getResponseCode();InputStream in=code>=400?c.getErrorStream():c.getInputStream();String s=read(in);return code+"\n"+s;}
  String read(InputStream in)throws Exception{if(in==null)return "";StringBuilder s=new StringBuilder();try(BufferedReader r=new BufferedReader(new InputStreamReader(in,"UTF-8"))){String x;while((x=r.readLine())!=null)s.append(x).append('\n');}return s.toString();}
  @Override protected void onActivityResult(int req,int result,Intent data){super.onActivityResult(req,result,data);if(req!=PICK||result!=RESULT_OK||data==null)return;Uri u=data.getData();new Thread(()->processImage(u)).start();}
  void processImage(Uri u){try{byte[] bytes=readUri(u);String type=getContentResolver().getType(u);if(type==null)type="image/jpeg";String analysis=request("POST",BASE+"/vehicle/analyze",null,bytes,type);JSONObject wrapper=new JSONObject(analysis.substring(analysis.indexOf('{')));JSONObject a=wrapper.optJSONObject("analysis");if(a==null)throw new Exception("AI không trả analysis");String brand=a.optString("brand","");String model=a.optString("model","");if(brand.isEmpty()||model.isEmpty())throw new Exception("AI chưa xác định được hãng/mẫu; không tự bịa dữ liệu.");String id=(brand+"-"+model+"-"+System.currentTimeMillis()).toLowerCase(Locale.US).replaceAll("[^a-z0-9-]","-");JSONObject car=new JSONObject();car.put("id",id);car.put("brand",brand);car.put("model",model);put(car,"year",a,"year");put(car,"mileage",a,"mileage");put(car,"price",a,"price");put(car,"fuel",a,"fuel");put(car,"category",a,"category");put(car,"color",a,"color");put(car,"description",a,"description");car.put("features",a.optJSONArray("features")==null?new JSONArray():a.optJSONArray("features"));car.put("status","available");String saved=request("POST",BASE+"/cars",car.toString(),null,"application/json");String up=request("POST",BASE+"/media",null,bytes,type);runOnUiThread(()->output.setText("AI:\n"+a.toString(2)+"\n\nXe:\n"+saved+"\n\nẢnh:\n"+up));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi AI/nhập xe: "+e.getMessage()));}}
  void put(JSONObject out,String key,JSONObject in,String src)throws Exception{Object v=in.opt(src);if(v!=null&&v!=JSONObject.NULL)out.put(key,v);}
  byte[] readUri(Uri u)throws Exception{try(InputStream in=getContentResolver().openInputStream(u);ByteArrayOutputStream o=new ByteArrayOutputStream()){byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){if(o.size()+n>12*1024*1024)throw new Exception("Ảnh vượt 12MB");o.write(b,0,n);}return o.toByteArray();}}
}
