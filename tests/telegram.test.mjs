import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCaption } from '../src/telegram.js';

test('Telegram caption keeps Vietnamese Unicode and real vehicle fields',()=>{
  const caption=buildCaption({
    id:'lx600-urban',brand:'Lexus',model:'LX 600 Urban',year:2024,mileage:12000,
    color:'Trắng ngọc trai',interior:'Đen',engine:'V6 3.5 Twin Turbo',transmission:'10AT',
    seats:7,origin:'Nhật Bản',price:8650000000,status:'available',
    features_json:JSON.stringify(['Mark Levinson','Camera 360','Cửa sổ trời']),description:'Xe thực tế tại showroom.'
  });
  assert.match(caption,/Lexus LX 600 Urban/);
  assert.match(caption,/12\.000 km/);
  assert.match(caption,/Trắng ngọc trai/);
  assert.match(caption,/Mark Levinson/);
  assert.match(caption,/PHAN THUẦN|Phan Thuần Xtra/);
});

test('Telegram caption omits fields that are not present instead of inventing data',()=>{
  const caption=buildCaption({id:'porsche-718',brand:'Porsche',model:'718 Boxster',features_json:'[]',status:'available'});
  assert.match(caption,/Porsche 718 Boxster/);
  assert.doesNotMatch(caption,/2025/);
  assert.doesNotMatch(caption,/ODO:/);
  assert.doesNotMatch(caption,/Twin Turbo/);
});
