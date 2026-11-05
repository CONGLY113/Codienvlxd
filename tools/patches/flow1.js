/* ====================================================================== 0.18.0 BẢNG KÊ: quy trình 2 giai đoạn, thủ quỹ, QR thanh toán
   Giai đoạn 1: kế toán/quản trị lập, gửi soát xét; thủ quỹ soát xét số lượng mẫu và đơn giá; ký duyệt, đóng dấu bản giấy; lưu vết.
   Giai đoạn 2: kế toán chọn bảng kê khách đã thanh toán (chuyển khoản hoặc tiền mặt), thủ quỹ xác nhận đã thanh toán, có thể nhiều đợt. */
const BANK_DEF={stk:'3800201005127',bank:'Agribank Việt Nam',bin:'970405',ten:''};
const BANKS=[['970405','Agribank Việt Nam'],['970436','Vietcombank'],['970415','VietinBank'],['970418','BIDV'],['970422','MB Bank'],['970407','Techcombank']];
const bkBank=()=>Object.assign({},BANK_DEF,S.bankCfg||{});
const bkAscii=t=>String(t==null?'':t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^A-Za-z0-9 .\-]/g,'').replace(/\s+/g,' ').trim();
function emvCrc(str){let c=0xFFFF;for(let i=0;i<str.length;i++){c^=str.charCodeAt(i)<<8;for(let k=0;k<8;k++){c=(c&0x8000)?((c<<1)^0x1021):(c<<1);c&=0xFFFF;}}return c.toString(16).toUpperCase().padStart(4,'0');}
const emvT=(id,v)=>id+String(v.length).padStart(2,'0')+v;
function vietQrText(o){
  const acc=emvT('00','A000000727')+emvT('01',emvT('00',o.bin)+emvT('01',o.stk))+emvT('02','QRIBFTTA');
  const amt=Math.round(+o.amount||0);
  const p=emvT('00','01')+emvT('01',amt>0?'12':'11')+emvT('38',acc)+emvT('53','704')+(amt>0?emvT('54',String(amt)):'')+emvT('58','VN')+(o.nd?emvT('62',emvT('08',o.nd)):'')+'6304';
  return p+emvCrc(p);
}
const bkSum=(a,f)=>a.reduce((x,y)=>x+(+f(y)||0),0);
function bkPay(b){
  const T=bkTotals(b).tt,p=(b.pay||[]),ok=p.filter(x=>x.tt==='da_xn'),da=bkSum(ok,x=>x.so_tien),cho=bkSum(p.filter(x=>x.tt==='cho_tq'),x=>x.so_tien),con=Math.max(0,T-da);
  const ngay=ok.map(x=>x.ngay_xn||x.ngay||'').filter(Boolean).sort().pop()||'';
  return{tt:T,da,cho,con,ngay,st:da<=0?'chua':(con<=0?'da':'mot')};
}
function bkStLabel(b){
  if(b.trang_thai==='da_duyet'){const P=bkPay(b);return P.st==='da'?['Đã thanh toán','ok']:P.st==='mot'?['Thanh toán một phần','info']:['Chưa thanh toán','warn'];}
  return BK_ST[b.trang_thai]||[b.trang_thai,'neutral'];
}
function bkNormDoc(b){
  if(b.trang_thai==='da_gui'){b.trang_thai='da_duyet';b.gui_khach=b.gui_khach||{by:'',at:(b.sua||{}).at||''};b.duyet=b.duyet||{by:'(bản 0.16.0)',at:(b.sua||{}).at||'',ghi:'Chuyển từ trạng thái Đã gửi khách'};}
  if(b.trang_thai==='da_thu'){const th=b.thu||{};b.trang_thai='da_duyet';b.duyet=b.duyet||{by:'(bản 0.16.0)',at:th.at||'',ghi:'Chuyển từ trạng thái Đã thanh toán'};
    if(!(b.pay&&b.pay.length))b.pay=[{id:'cu',ngay:(th.at||'').slice(0,10),so_tien:+th.so_tien||bkTotals(b).tt,ht:'tm',ct:'Ghi nhận ở bản 0.16.0',tt:'da_xn',de:{by:th.by||'',at:th.at||''},xn:{by:th.by||'',at:th.at||''},ngay_xn:(th.at||'').slice(0,10)}];}
  if(!Array.isArray(b.pay))b.pay=[];if(!Array.isArray(b.ls))b.ls=[];
  return b;
}
const bkVai=()=>{const r=['tq','kt','tp','ktt','pd'].find(x=>hasRole(x));return r?(r==='tp'?'Quản trị':ROLE_NAME[r]):'';};
const bkLap=()=>hasRole('kt')||hasRole('tp');
const bkQrNd=b=>{const so=b.so||'',k=bkAscii((b.khach||{}).ten).toUpperCase();return((so?so+' ':'')+k).slice(0,25).trim();};
const bkQrText=b=>{const B=bkBank(),P=bkPay(b);return vietQrText({bin:B.bin,stk:B.stk,amount:P.con,nd:bkQrNd(b)});};
function bkQrPng(text){return new Promise(res=>{try{
  if(!window.qrcode||!text)return res(null);
  const q=qrcode(0,'M');q.addData(text);q.make();
  const n=q.getModuleCount(),k=6,m=3,cv=document.createElement('canvas');cv.width=cv.height=(n+2*m)*k;
  const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.fillStyle='#000';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))g.fillRect((c+m)*k,(r+m)*k,k,k);
  cv.toBlob(async x=>res(x?new Uint8Array(await x.arrayBuffer()):null),'image/png');
}catch(e){res(null);}});}
/* QR của một bảng kê: null nếu tắt hoặc đã thanh toán đủ */
async function bkQr(b){const P=bkPay(b);if(b.qr===false||P.con<=0)return null;const text=bkQrText(b),png=await bkQrPng(text);return{text,png,B:bkBank(),P,nd:bkQrNd(b)};}
/* ---- thay đổi trạng thái bảng kê: luôn lấy bản mới nhất, ghi lưu vết */
async function bkAct(b,hd,ghi,fn,msg){
  const cur=bkAll().find(x=>x.id===b.id&&x.col===b.col)||b,n=JSON.parse(JSON.stringify(cur));
  fn(n);n.ls=(n.ls||[]).concat([{at:new Date().toISOString(),by:SESSION.name,id:SESSION.id,vai:bkVai(),hd,ghi:ghi||''}]);
  const ok=await bkSave(n,true);if(!ok)return null;
  await logAudit(hd+' bảng kê '+n.so,n.khach.ten+(ghi?' · '+ghi:''));
  if(BK.draft&&BK.draft.id===n.id)BK.draft=n;BK.dirty=false;if(msg)toast(msg);return n;
}
const bkF=(l,el)=>h('div',{class:'field'},h('label',null,l),el);
const HT_L={ck:'Chuyển khoản',tm:'Tiền mặt'};
function bkPayDlg(list){
  const rows=list.map(b=>{const P=bkPay(b),i=h('input',{type:'number',min:'0',step:'1000',inputmode:'numeric','aria-label':'Số tiền đề nghị '+b.so,style:'max-width:160px'});i.value=Math.max(0,P.con-P.cho);return{b,P,i};});
  const ht=h('select',{'aria-label':'Hình thức thanh toán'},h('option',{value:'ck'},'Chuyển khoản về tài khoản cơ quan'),h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ'));
  const ngay=h('input',{type:'date',value:todayISO(),'aria-label':'Ngày tiền về hoặc ngày nộp'}),ct=h('input',{type:'text','aria-label':'Chứng từ hoặc ghi chú',placeholder:'Số giao dịch, người nộp tiền'});
  const m=openModal({title:'Đề nghị thủ quỹ xác nhận thanh toán',sub:'Chọn hình thức, ngày tiền về hoặc ngày nộp, rồi nhập số tiền khách đã trả cho từng bảng kê. Thủ quỹ đối chiếu rồi bấm Đã thanh toán.',wide:true,body:[
    h('div',{class:'grid3'},bkF('Hình thức',ht),bkF('Ngày tiền về, ngày nộp',ngay),bkF('Chứng từ, ghi chú',ct)),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số bảng kê','Khách hàng','Còn lại','Số tiền đề nghị (đ)'].map(x=>h('th',null,x)))),
      h('tbody',null,rows.map(r=>h('tr',null,h('td',null,r.b.so),h('td',null,r.b.khach.ten),h('td',{class:'num'},fmtN(r.P.con-r.P.cho)+' đ'),h('td',null,r.i))))))],
    actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'pay-send',onclick:async function(){
      const act=rows.map(r=>({b:r.b,v:Math.round(+r.i.value||0),max:r.P.con-r.P.cho})).filter(x=>x.v>0);
      if(!act.length){toast('Nhập số tiền cho ít nhất một bảng kê.','bad');return;}
      const bad=act.find(x=>x.v>x.max);if(bad){toast('Số tiền vượt phần còn lại của '+bad.b.so+'.','bad');return;}
      if(!/^\d{4}-\d{2}-\d{2}$/.test(ngay.value)){toast('Chọn ngày tiền về hoặc ngày nộp.','bad');return;}
      this.disabled=true;let n=0;
      for(const x of act){const r=await bkAct(x.b,'Đề nghị thủ quỹ xác nhận thanh toán',fmtN(x.v)+' đ · '+HT_L[ht.value]+(ct.value.trim()?' · '+ct.value.trim():''),d=>{d.pay.push({id:rid(),ngay:ngay.value,so_tien:x.v,ht:ht.value,ct:ct.value.trim(),tt:'cho_tq',de:{by:SESSION.name,at:new Date().toISOString()}});});if(r)n++;}
      m.close();BK.psel&&BK.psel.clear();if(n)toast('Đã gửi '+n+' đề nghị cho thủ quỹ xác nhận.');render();}},'Gửi thủ quỹ')]});
}
function bkTextDlg(title,sub,label,required,okLabel,onOk,extra){
  const t=h('textarea',{rows:'3','aria-label':label});
  const m=openModal({title,sub,body:[(extra||[]),bkF(label+(required?' (bắt buộc)':''),t)].flat(),actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'dlg-ok',onclick:async function(){const v=t.value.trim();if(required&&!v){toast('Nhập '+label.toLowerCase()+'.','bad');return;}this.disabled=true;const r=await onOk(v);if(r===false){this.disabled=false;return;}m.close();}},okLabel)]});
  return m;
}
function bkConfirmPay(b,p){
  const ngay=h('input',{type:'date',value:p.ngay||todayISO(),'aria-label':'Ngày nhận tiền'});
  bkTextDlg('Xác nhận đã thanh toán','Bảng kê '+b.so+' · '+b.khach.ten+' · '+fmtN(p.so_tien)+' đ · '+HT_L[p.ht||'ck']+'. Chỉ bấm khi tiền đã về tài khoản cơ quan hoặc đã nhận tiền mặt.','Ghi chú của thủ quỹ',false,'Đã thanh toán',async v=>{
    const d=ngay.value||todayISO();
    const n=await bkAct(b,'Thủ quỹ xác nhận đã thanh toán',fmtN(p.so_tien)+' đ · '+HT_L[p.ht||'ck']+(v?' · '+v:''),x=>{const e=x.pay.find(y=>y.id===p.id);if(!e)return;e.tt='da_xn';e.xn={by:SESSION.name,at:new Date().toISOString(),ghi:v};e.ngay_xn=d;});
    if(!n)return false;if(bkPay(n).con<=0)await bkSyncPaid(n,true);toast('Đã ghi nhận thanh toán '+fmtN(p.so_tien)+' đ cho '+b.so+'.');render();},[bkF('Ngày nhận tiền',ngay)]);
}
function bkPayFlow(b,p,kind){
  const cfg={tra:['Trả lại đề nghị thanh toán','Lý do trả lại',true,'Trả lại','Thủ quỹ trả lại đề nghị thanh toán',x=>{x.tt='tra';}],
    rut:['Rút lại đề nghị thanh toán','Lý do rút lại',false,'Rút lại','Rút lại đề nghị thanh toán',x=>{x.tt='huy';}],
    thu:['Thu hồi xác nhận thanh toán','Lý do thu hồi',true,'Thu hồi','Thu hồi xác nhận thanh toán',x=>{x.tt='tra';x.thu_hoi={by:SESSION.name,at:new Date().toISOString()};}]}[kind];
  bkTextDlg(cfg[0],'Bảng kê '+b.so+' · '+fmtN(p.so_tien)+' đ',cfg[1],cfg[2],cfg[3],async v=>{
    const n=await bkAct(b,cfg[4],fmtN(p.so_tien)+' đ'+(v?' · '+v:''),d=>{const e=d.pay.find(y=>y.id===p.id);if(e){cfg[5](e);if(v)e.ly_do=v;}});
    if(!n)return false;if(kind==='thu'&&bkPay(n).con>0)await bkSyncPaid(n,false);render();});
}
