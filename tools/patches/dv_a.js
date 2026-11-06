/* ====================================================================== 0.27.0 PHÂN HỆ DỊCH VỤ: BẢNG KÊ VÀ BÁO GIÁ CHO BA PHÒNG
   Tách riêng khỏi luồng thí nghiệm: bộ sưu tập riêng (dv_gia, dv_cfg, dv_kh, dvbk_<yy>, dvbg_<yy>), không ghi vào samples_*, bangke_*.
   Phòng Kiểm định Hiệu chuẩn đo lường (mảng KĐHC và ATLĐ) và phòng Hóa sinh môi trường lập bảng kê trực tiếp từ bảng giá.
   Cả ba phòng (kể cả Cơ điện VLXD) lập báo giá. Bảng kê của Cơ điện vẫn chạy ở trang Thanh toán như cũ.
   Bảng kê: nhân viên lập, Thủ quỹ soát xét, Kế toán trưởng duyệt, rồi in, thu tiền (thủ quỹ xác nhận). Báo giá: Trưởng phòng của phòng duyệt. */
const DV_ROOM={
  kd:{ten:'Phòng Kiểm định Hiệu chuẩn đo lường',ngan:'Kiểm định Hiệu chuẩn đo lường',mang:['kdhc','atld']},
  hs:{ten:'Phòng thử nghiệm Hóa sinh môi trường',ngan:'Hóa sinh môi trường',mang:['hsmt']},
  co:{ten:'Phòng thử nghiệm Cơ điện vật liệu xây dựng',ngan:'Cơ điện vật liệu xây dựng',mang:['vlxd']}};
const DV_MANG={
  kdhc:{ten:'Kiểm định, hiệu chuẩn',room:'kd',bk:'BK.KĐHC.',bg:'BG.KĐHC.'},
  atld:{ten:'An toàn lao động',room:'kd',bk:'BK.ATLĐ.',bg:'BG.KĐHC.'},
  hsmt:{ten:'Hóa sinh, môi trường',room:'hs',bk:'BK.HSMT.',bg:'BG.HSMT.'},
  vlxd:{ten:'Cơ điện, vật liệu xây dựng',room:'co',bk:'',bg:'BG.VLXD.'}};
const DV_ST={nhap:['Nháp','warn'],cho_soat:['Chờ thủ quỹ soát xét','info'],da_soat:['Đã soát xét, chờ kế toán trưởng duyệt','info'],da_duyet:['Đã duyệt','info'],huy:['Đã hủy','neutral'],cho_duyet:['Chờ trưởng phòng duyệt','info']};
const DV_VAT=[0,5,8,10];
const DVS={tab:'bk',kind:'bk',draft:null,dirty:false,room:'',fil:{q:'',st:''},psel:new Set(),gq:'',cnTab:'',uid:null};
const DV={gia:{},cfg:{},kh:[]};
const DVBK={},DVBG={},DVW={};
/* ---- phân quyền theo phòng */
const dvAdmin=()=>hasRole('tp');
const dvLapRooms=()=>Object.keys(DV_ROOM).filter(r=>dvAdmin()||hasRole('dvl_'+r)||hasRole('dvt_'+r));
const dvTpRooms=()=>Object.keys(DV_ROOM).filter(r=>dvAdmin()||hasRole('dvt_'+r));
const dvViewRooms=()=>(dvAdmin()||hasRole('tq')||hasRole('ktt')||hasRole('pd'))?Object.keys(DV_ROOM):dvLapRooms();
const dvShow=()=>!!SESSION&&dvViewRooms().length>0;
const dvCanLap=r=>dvLapRooms().includes(r);
const dvCanTp=r=>dvTpRooms().includes(r);
const dvVai=()=>{if(hasRole('tq'))return 'Thủ quỹ';if(hasRole('ktt'))return 'Kế toán trưởng';if(dvAdmin())return 'Quản trị';if(Object.keys(DV_ROOM).some(r=>hasRole('dvt_'+r)))return 'Trưởng phòng';if(Object.keys(DV_ROOM).some(r=>hasRole('dvl_'+r)))return 'Cán bộ giao nhận mẫu';return hasRole('pd')?'Giám đốc':'';};
const dvRoomName=r=>(DV_ROOM[r]||{}).ten||r;
/* ---- dữ liệu */
const dvBkCol=y=>'dvbk_'+y,dvBgCol=y=>'dvbg_'+y;
function dvNorm(b){if(!Array.isArray(b.dong))b.dong=[];if(!Array.isArray(b.pay))b.pay=[];if(!Array.isArray(b.ls))b.ls=[];if(!b.khach)b.khach={ten:''};if(!b.giam)b.giam={kieu:'pct',gt:0};return b;}
function dvWatch(col,store){if(DVW[col])return;DVW[col]=Data.watch(col,list=>{store[col]=list.map(x=>dvNorm(Object.assign({col},x)));schedule();});}
function dvWatchInit(){
  const y=new Date().getFullYear()%100;[y-1,y].forEach(v=>{dvWatch(dvBkCol(pad(v)),DVBK);dvWatch(dvBgCol(pad(v)),DVBG);});
  Data.watch('dv_gia',list=>{DV.gia={};list.forEach(x=>{DV.gia[x.id]=x;});schedule();});
  Data.watch('dv_cfg',list=>{DV.cfg=list.find(x=>x.id==='main')||{};schedule();});
  Data.watch('dv_kh',list=>{DV.kh=list;schedule();});
}
const dvAll=(store)=>Object.keys(store).reduce((a,c)=>a.concat(store[c]),[]);
const dvAllBk=()=>dvAll(DVBK),dvAllBg=()=>dvAll(DVBG);
const dvVatDef=()=>{const v=DV.cfg&&DV.cfg.vat;return v==null||v===''?10:+v;};
/* ---- bảng giá: ưu tiên bản đã lưu trên hệ thống, không có thì dùng bản chuẩn nhúng sẵn (QĐ 29/QĐ-KTTĐC) */
const dvBook=m=>DV.gia[m]||DV_SEED[m]||{meta:{},items:[]};
const dvBookSrc=m=>DV.gia[m]?'hệ thống':'bản chuẩn nhúng sẵn';
const dvItemName=it=>[it.t,it.dt,it.pv].filter(Boolean).join(' – ');
const dvNorm1=t=>String(t==null?'':t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();
function dvFindItem(m,id){return dvBook(m).items.find(x=>x.id===id)||null;}
function dvLineFrom(it,m){return{id:rid(),g:it.id,mang:m,nhom:it.n||'',ten:dvItemName(it),u:it.u||'',sl:1,dg:+it.g||0,dg0:+it.g||0,khoa:true};}
/* ---- tính tiền: đơn giá chưa thuế; chiết khấu; thuế GTGT */
function dvTotals(b){
  const tong=(b.dong||[]).reduce((a,l)=>a+Math.round((+l.sl||0)*(+l.dg||0)),0);
  const g=b.giam||{},gt=Math.max(0,+g.gt||0),giam=g.kieu==='pct'?Math.round(tong*Math.min(100,gt)/100):Math.min(tong,Math.round(gt));
  const trc=tong-giam,vat=b.vat==null?dvVatDef():+b.vat||0,thue=Math.round(trc*vat/100);
  return{tong,giam,trc,vat,thue,tt:trc+thue};
}
function dvPay(b){
  const T=dvTotals(b).tt,p=b.pay||[],ok=p.filter(x=>x.tt==='da_xn'),da=bkSum(ok,x=>x.so_tien),cho=bkSum(p.filter(x=>x.tt==='cho_tq'),x=>x.so_tien),con=Math.max(0,T-da);
  const ngay=ok.map(x=>x.ngay_xn||x.ngay||'').filter(Boolean).sort().pop()||'';
  return{tt:T,da,cho,con,ngay,st:da<=0?'chua':(con<=0?'da':'mot')};
}
function dvStLabel(b,kind){
  if(kind==='bk'&&b.trang_thai==='da_duyet'){const P=dvPay(b);return P.st==='da'?['Đã thanh toán','ok']:P.st==='mot'?['Thanh toán một phần','info']:['Chưa thanh toán','warn'];}
  if(kind==='bg'&&b.trang_thai==='da_duyet')return['Đã duyệt, gửi khách','ok'];
  return DV_ST[b.trang_thai]||[b.trang_thai,'neutral'];
}
/* ---- số bảng kê, báo giá: <tiền tố><yy>.<mm>.<dd>.<STT trong ngày>, STT riêng theo từng tiền tố */
async function dvNumber(kind,m,iso){
  const yy=iso.slice(2,4),mm=iso.slice(5,7),dd=iso.slice(8,10),px=DV_MANG[m][kind]+yy+'.'+mm+'.'+dd+'.',st=kind==='bk'?DVBK:DVBG;let mx=0;
  dvAll(st).forEach(b=>{if(b.so&&b.so.startsWith(px)){const k=b.so.slice(px.length).match(/^(\d+)/);if(k)mx=Math.max(mx,+k[1]);}});
  return px+(await nextSeq('dv'+kind+DV_MANG[m][kind].replace(/[^A-Za-zĐđ]/g,'')+yy+mm+dd,mx));
}
function dvEmpty(kind,room,m){
  return{kind,so:'',phong:room,mang:m,ngay:todayISO(),khach:{ten:'',mst:'',dia_chi:'',lien_he:'',email:'',dt:''},cong_trinh:'',dong:[],giam:{kieu:'pct',gt:0},vat:dvVatDef(),ghi_chu:'',qr:true,trang_thai:'nhap',pay:[],ls:[]};
}
const dvKhId=k=>'k_'+dvNorm1((k.ten||'')+'|'+(k.mst||'')).replace(/[^a-z0-9|]/g,'').slice(0,60)+'_'+(function(s){let x=0;for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))>>>0;return x.toString(36);})(dvNorm1((k.ten||'')+'|'+(k.mst||'')));
async function dvSaveKh(k){if(!k||!(k.ten||'').trim())return;try{await Data.set('dv_kh/'+dvKhId(k),{ten:k.ten.trim(),mst:(k.mst||'').trim(),dia_chi:(k.dia_chi||'').trim(),lien_he:(k.lien_he||'').trim(),email:(k.email||'').trim(),dt:(k.dt||'').trim(),sua:{at:new Date().toISOString(),by:SESSION?SESSION.name:''}});}catch(e){}}
async function dvSave(b,quiet){
  const kind=b.kind||'bk',now=new Date().toISOString(),first=!b.id;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(b.ngay||''))b.ngay=todayISO();
  if(first){b.id=(kind==='bk'?'dbk_':'dbg_')+rid();b.col=(kind==='bk'?dvBkCol:dvBgCol)(b.ngay.slice(2,4));b.so=await dvNumber(kind,b.mang,b.ngay);
    b.tao={at:now,by:SESSION?SESSION.name:'',by_id:SESSION?SESSION.id:''};b.ls=(b.ls||[]).concat([{at:now,by:SESSION?SESSION.name:'',id:SESSION?SESSION.id:'',vai:dvVai(),hd:kind==='bk'?'Lập bảng kê':'Lập báo giá',ghi:''}]);}
  b.sua={at:now,by:SESSION?SESSION.name:''};dvWatch(b.col,kind==='bk'?DVBK:DVBG);
  const doc=JSON.parse(JSON.stringify(b));delete doc.id;delete doc.col;
  const ok=await safe(()=>Data.set(b.col+'/'+b.id,doc).then(()=>true),'Không lưu được '+(kind==='bk'?'bảng kê':'báo giá')+'.');
  if(ok){await dvSaveKh(b.khach);if(!quiet)await logAudit((first?'Lập ':'Sửa ')+(kind==='bk'?'bảng kê dịch vụ ':'báo giá ')+b.so,b.khach.ten+' · '+fmtN(dvTotals(b).tt)+' đ');}
  return ok;
}
/* đổi trạng thái: luôn lấy bản mới nhất, ghi lưu vết */
async function dvAct(b,hd,ghi,fn,msg){
  const kind=b.kind||'bk',st=kind==='bk'?DVBK:DVBG,c0=dvAll(st).find(x=>x.id===b.id&&x.col===b.col),cur=(c0&&((c0.sua||{}).at||'')>=((b.sua||{}).at||''))?c0:b,n=JSON.parse(JSON.stringify(cur));
  n.kind=kind;fn(n);n.ls=(n.ls||[]).concat([{at:new Date().toISOString(),by:SESSION.name,id:SESSION.id,vai:dvVai(),hd,ghi:ghi||''}]);
  const ok=await dvSave(n,true);if(!ok)return null;
  await logAudit(hd+' '+(kind==='bk'?'bảng kê dịch vụ ':'báo giá ')+n.so,n.khach.ten+(ghi?' · '+ghi:''));
  if(DVS.draft&&DVS.draft.id===n.id)DVS.draft=n;DVS.dirty=false;if(msg)toast(msg);return n;
}
/* ---- đọc file Excel (.xlsx) thành mảng dòng, dùng cho nhập dòng bảng kê và bảng giá */
async function dvReadXlsx(u8){
  const zip=await JSZip.loadAsync(u8),sst=await sstOf(zip);
  const wb=await zText(zip,'xl/workbook.xml')||'',rl=await zText(zip,'xl/_rels/workbook.xml.rels')||'';
  const sh=(wb.match(/<sheet\b[^>]*>/g)||[]).map(s=>({name:xdec((/name="([^"]*)"/.exec(s)||[])[1]||''),rid:(/r:id="([^"]*)"/.exec(s)||[])[1]}));
  const tgt={};(rl.match(/<Relationship\b[^>]*>/g)||[]).forEach(r=>{const i=/\bId="([^"]+)"/.exec(r),t=/\bTarget="([^"]+)"/.exec(r);if(i&&t)tgt[i[1]]=t[1];});
  const out={};
  for(const s of sh){let p=tgt[s.rid]||'';if(!p)continue;p=p.replace(/^\/?(xl\/)?/,'xl/');const x=await zText(zip,p);if(!x)continue;
    const rows=[];(x.match(/<row\b[\s\S]*?<\/row>/g)||[]).forEach(rw=>{const arr=[];(rw.match(/<c\b[\s\S]*?(<\/c>|\/>)/g)||[]).forEach(c=>{
      const ref=/\br="([A-Z]+)\d+"/.exec(c);if(!ref)return;let ci=0;ref[1].split('').forEach(ch=>{ci=ci*26+ch.charCodeAt(0)-64;});ci--;
      const t=(/\bt="([^"]*)"/.exec(c)||[])[1],v=(/<v>([\s\S]*?)<\/v>/.exec(c)||[])[1],is=(/<is>[\s\S]*?<\/is>/.exec(c)||[])[0];
      let val='';if(t==='s')val=sst[+v]||'';else if(t==='inlineStr'&&is)val=xdec((is.match(/<t[^>]*>([\s\S]*?)<\/t>/g)||[]).map(z=>z.replace(/<[^>]+>/g,'')).join(''));else if(v!=null)val=t==='str'||t==='b'?xdec(v):(isNaN(+v)?xdec(v):+v);
      arr[ci]=val;});rows.push(Array.from(arr,v=>v==null?'':v));});
    out[s.name]=rows;}
  return out;
}
function dvDate(v){
  if(v==null||v==='')return '';
  if(typeof v==='number'&&v>20000&&v<80000){const d=new Date(Date.UTC(1899,11,30)+Math.round(v)*86400000);return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate());}
  const s=String(v).trim(),m=s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);if(m)return m[3]+'-'+pad(+m[2])+'-'+pad(+m[1]);
  const k=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return k?k[0]:'';
}
