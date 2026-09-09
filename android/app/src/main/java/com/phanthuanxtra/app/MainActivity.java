package com.phanthuanxtra.app;

import android.app.*;
import android.os.*;
import android.content.*;
import android.net.Uri;
import android.view.*;
import android.widget.*;
import org.json.*;
import java.io.*;
import java.util.*;

public class MainActivity extends Activity {
  static final String BASE="https://phanthuanxtra.com/api/app/v1";
  static final String SITE="https://phanthuanxtra.com/";
  EditText token;
  TextView output;
  EditText carId;
  final int PICK=7;
  AuthStore authStore;
  ApiClient api;

  @Override public void onCreate(Bundle b){
    super.onCreate(b);
    authStore=new AuthStore(this);
    api=new ApiClient(BASE,authStore);
    build();
  }

  TextView tv(String s){TextView v=new TextView(this);v.setText(s);v.setTextSize(16);v.setPadding(8,8,8,8);return v;}
  Button btn(String label,View.OnClickListener l){Button b=new Button(this);b.setText(label);b.setOnClickListener(l);return b;}

  void build(){
    LinearLayout root=new LinearLayout(this);
    root.setOrientation(LinearLayout.VERTICAL);
    root.setPadding(24,24,24,24);
    root.addView(tv("PHAN THUẦN XTRA\nQUẢN LÝ PHANTHUANXTRA.COM"));
    token=new EditText(this);
    token.setHint("APP API token");
    token.setInputType(129);
    root.addView(token);
    root.addView(btn("LƯU TOKEN",v->saveToken()));
    root.addView(btn("XÓA TOKEN",v->{authStore.clear();token.setText("");output.setText("Đã xóa token khỏi thiết bị.");}));
    root.addView(btn("KIỂM TRA KẾT NỐI",v->callPublic("GET","/health")));
    root.addView(btn("DASHBOARD",v->call("GET","/dashboard",null,null,null)));
    root.addView(btn("KHO XE",v->call("GET","/cars",null,null,null)));
    root.addView(btn("TÌM XE",v->searchCars()));
    carId=new EditText(this);carId.setHint("ID xe để xem / sửa / xóa");root.addView(carId);
    root.addView(btn("CHI TIẾT XE",v->getCar()));
    root.addView(btn("ĐỔI TRẠNG THÁI",v->changeStatus()));
    root.addView(btn("BẬT / TẮT NỔI BẬT",v->toggleFeatured()));
    root.addView(btn("XÓA XE",v->confirmDelete()));
    root.addView(btn("KHÁCH HÀNG / LEADS",v->call("GET","/leads",null,null,null)));
    root.addView(btn("THÊM XE + AI",v->startActivityForResult(new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("image/*").addCategory(Intent.CATEGORY_OPENABLE),PICK)));
    root.addView(btn("MỞ PHANTHUANXTRA.COM",v->startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(SITE)))));
    output=tv("Sẵn sàng.");
    ScrollView sv=new ScrollView(this);sv.addView(output);root.addView(sv,new LinearLayout.LayoutParams(-1,0,1));
    setContentView(root);
    token.setText(authStore.get());
  }

  void saveToken(){
    try { authStore.save(token.getText().toString()); output.setText("Đã lưu token an toàn trên thiết bị."); }
    catch(Exception e){ output.setText("Không thể lưu token: "+e.getMessage()); }
  }

  String auth(){return authStore.get();}

  void call(String method,String path,String json,byte[] raw,String type){
    new Thread(()->{try{String r=api.request(method,path,json,raw,type==null?"application/json":type);runOnUiThread(()->output.setText(r));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi: "+e.getMessage()));}}).start();
  }
  void callPublic(String method,String path){
    new Thread(()->{try{String r=api.request(method,path,null,null,"application/json");runOnUiThread(()->output.setText(r));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi kết nối: "+e.getMessage()));}}).start();
  }
  void searchCars(){final EditText q=new EditText(this);q.setHint("Hãng / mẫu / ID");new AlertDialog.Builder(this).setTitle("Tìm xe").setView(q).setPositiveButton("TÌM",(d,w)->call("GET","/cars?q="+Uri.encode(q.getText().toString().trim()),null,null,null)).setNegativeButton("HỦY",null).show();}
  String selectedId(){String id=carId==null?"":carId.getText().toString().trim();if(id.isEmpty()){Toast.makeText(this,"Nhập ID xe trước",Toast.LENGTH_SHORT).show();return null;}return id;}
  void getCar(){String id=selectedId();if(id!=null)call("GET","/cars/"+Uri.encode(id),null,null,null);}
  void changeStatus(){String id=selectedId();if(id==null)return;final String[] values={"available","reserved","sold"};new AlertDialog.Builder(this).setTitle("Trạng thái xe").setItems(values,(d,which)->updateCarField(id,"status",values[which]));}
  void toggleFeatured(){String id=selectedId();if(id==null)return;new Thread(()->{try{String r=api.request("GET","/cars/"+Uri.encode(id),null,null,"application/json");JSONObject c=new JSONObject(r.substring(r.indexOf('{'))).optJSONObject("car");if(c==null)throw new Exception("Không đọc được xe");boolean next=!c.optBoolean("featured",false);JSONObject body=carPayload(c);body.put("featured",next);String saved=api.request("PUT","/cars/"+Uri.encode(id),body.toString(),null,"application/json");runOnUiThread(()->output.setText(saved));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi nổi bật: "+e.getMessage()));}}).start();}
  void updateCarField(String id,String key,String value){new Thread(()->{try{String r=api.request("GET","/cars/"+Uri.encode(id),null,null,"application/json");JSONObject c=new JSONObject(r.substring(r.indexOf('{'))).optJSONObject("car");if(c==null)throw new Exception("Không đọc được xe");JSONObject body=carPayload(c);body.put(key,value);String saved=api.request("PUT","/cars/"+Uri.encode(id),body.toString(),null,"application/json");runOnUiThread(()->output.setText(saved));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi cập nhật: "+e.getMessage()));}}).start();}
  JSONObject carPayload(JSONObject c)throws Exception{JSONObject b=new JSONObject();b.put("id",c.optString("id"));b.put("brand",c.optString("brand"));b.put("model",c.optString("model"));if(c.has("year"))b.put("year",c.opt("year"));if(c.has("mileage"))b.put("mileage",c.opt("mileage"));if(c.has("price"))b.put("price",c.opt("price"));b.put("fuel",c.optString("fuel"));b.put("category",c.optString("category","suv"));b.put("color",c.optString("color"));b.put("status",c.optString("status","available"));b.put("description",c.optString("description"));b.put("features",c.optJSONArray("features")==null?new JSONArray():c.optJSONArray("features"));b.put("featured",c.optBoolean("featured",false));b.put("cover_image",c.optString("cover_image"));JSONArray imgs=new JSONArray();JSONArray source=c.optJSONArray("images");if(source!=null)for(int i=0;i<source.length();i++){JSONObject x=source.optJSONObject(i);if(x!=null)imgs.put(x.optString("url"));else if(source.optString(i,null)!=null)imgs.put(source.optString(i));}b.put("images",imgs);return b;}
  void confirmDelete(){String id=selectedId();if(id==null)return;new AlertDialog.Builder(this).setTitle("Xóa xe?").setMessage("Xóa vĩnh viễn xe "+id+" khỏi kho. Không thể hoàn tác.").setNegativeButton("HỦY",null).setPositiveButton("XÓA",(d,w)->call("DELETE","/cars/"+Uri.encode(id),null,null,null)).show();}

  @Override protected void onActivityResult(int req,int result,Intent data){super.onActivityResult(req,result,data);if(req==PICK&&result==RESULT_OK&&data!=null){Uri u=data.getData();new Thread(()->processImage(u)).start();}}
  void processImage(Uri u){try{byte[] bytes=readUri(u);String type=getContentResolver().getType(u);if(type==null)type="image/jpeg";String analysis=api.request("POST","/vehicle/analyze",null,bytes,type);JSONObject wrapper=new JSONObject(analysis.substring(analysis.indexOf('{')));JSONObject a=wrapper.optJSONObject("analysis");if(a==null)throw new Exception("AI không trả analysis");String brand=a.optString("brand","");String model=a.optString("model","");if(brand.isEmpty()||model.isEmpty())throw new Exception("AI chưa xác định được hãng/mẫu; không tự bịa dữ liệu.");String up=api.request("POST","/media",null,bytes,type);JSONObject uo=new JSONObject(up.substring(up.indexOf('{')));String image=uo.optString("url","");JSONObject car=new JSONObject();String id=(brand+"-"+model+"-"+System.currentTimeMillis()).toLowerCase(Locale.US).replaceAll("[^a-z0-9-]","-");car.put("id",id);car.put("brand",brand);car.put("model",model);put(car,"year",a,"year");put(car,"mileage",a,"mileage");put(car,"price",a,"price");put(car,"fuel",a,"fuel");put(car,"category",a,"category");put(car,"color",a,"color");put(car,"description",a,"description");car.put("features",a.optJSONArray("features")==null?new JSONArray():a.optJSONArray("features"));car.put("status","available");if(!image.isEmpty()){JSONArray imgs=new JSONArray();imgs.put(image);car.put("images",imgs);car.put("cover_image",image);}String saved=api.request("POST","/cars",car.toString(),null,"application/json");runOnUiThread(()->output.setText("AI:\n"+a.toString()+"\n\nUPLOAD:\n"+up+"\n\nXE:\n"+saved));}catch(Exception e){runOnUiThread(()->output.setText("Lỗi AI/nhập xe: "+e.getMessage()));}}
  void put(JSONObject out,String key,JSONObject in,String src)throws Exception{Object v=in.opt(src);if(v!=null&&v!=JSONObject.NULL)out.put(key,v);}
  byte[] readUri(Uri u)throws Exception{try(InputStream in=getContentResolver().openInputStream(u);ByteArrayOutputStream o=new ByteArrayOutputStream()){if(in==null)throw new Exception("Không mở được ảnh");byte[] b=new byte[8192];int n;while((n=in.read(b))!=-1){if(o.size()+n>12*1024*1024)throw new Exception("Ảnh vượt 12MB");o.write(b,0,n);}return o.toByteArray();}}
}
