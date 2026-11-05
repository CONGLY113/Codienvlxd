/* ====================================================================== 0.26.0 THÔNG BÁO
   Mỗi người có hộp thông báo riêng: bộ sưu tập tb_<mã nhân sự>. Việc ghi thông báo không bao giờ làm hỏng thao tác chính.
   Tầng 1 (không tốn phí): chuông, đếm chưa đọc, âm báo, thông báo hệ điều hành khi trang đang mở hoặc chạy nền.
   Tầng 2 (tùy chọn, cần gói Blaze): đẩy nền qua Firebase Cloud Messaging khi đã tắt ứng dụng; bật khi firebase-config.js có FIREBASE_PUSH.vapidKey. */
const TB={uid:null,unsub:null,list:[],first:true,seen:new Set()};
const TB_PUSH=()=>!!(window.FIREBASE_PUSH&&window.FIREBASE_PUSH.vapidKey);
const tbPrefKey=k=>'ptn_tb_'+k+'_'+(SESSION?SESSION.id:'');
const tbPref=(k,def)=>{try{const v=localStorage.getItem(tbPrefKey(k));return v==null?def:v==='1';}catch(e){return def;}};
const tbSetPref=(k,v)=>{try{localStorage.setItem(tbPrefKey(k),v?'1':'0');}catch(e){}};
const tbUnread=()=>TB.list.filter(n=>!n.read_at).length;
const tbRole=r=>ACCOUNTS.filter(a=>a.roles.includes(r)).map(a=>a.id);
const tbShort=(t,n)=>{t=String(t||'');return t.length>n?t.slice(0,n-1)+'…':t;};
const tbSmp=s=>(s.ma_mau||s.id)+(s.du_an&&s.du_an.cong_trinh?' · '+tbShort(s.du_an.cong_trinh,48):'');

/* ghi thông báo cho một hay nhiều người (không gửi cho chính người thao tác) */
async function tbNotify(to,o){
  try{
    const ids=[...new Set([].concat(to||[]))].filter(x=>x&&(!SESSION||x!==SESSION.id)&&ACCOUNTS.some(a=>a.id===x));
    if(!ids.length)return;
    const at=new Date().toISOString();
    for(const uid of ids){
      const tid='n_'+rid();
      const doc={at,title:o.title||'Thông báo',body:o.body||'',link:o.link||'',kind:o.kind||'',sample:o.sample||'',by:SESSION?SESSION.name:'',read_at:null};
      await Data.set('tb_'+uid+'/'+tid,doc);
      if(TB_PUSH())await Data.set('pushq/'+tid,{to:uid,title:doc.title,body:doc.body,link:doc.link,tag:tid,at});
    }
  }catch(e){console.warn('thông báo',e);}
}
/* người cần soát xét một mẫu: Trưởng phòng TN (vai sx); nếu Trưởng phòng tự thử nghiệm thì Giám đốc (vai pd) */
const tbSxIds=s=>(tpTest(s)?tbRole('pd'):tbRole('sx')).filter(x=>!(s.giao&&s.giao.ma_nv===x));
const tbNotifySx=s=>tbNotify(tbSxIds(s),{title:'Chờ soát xét',body:tbSmp(s)+' · '+((s.giao&&s.giao.ten)||'')+' đã nộp kết quả',link:'soat-xet',kind:'soat_xet',sample:s.id});
const tbNotifyPd=s=>tbNotify(tbRole('pd'),{title:'Chờ phê duyệt',body:tbSmp(s),link:'soat-xet',kind:'phe_duyet',sample:s.id});

/* nghe hộp thông báo của người đang đăng nhập */
function tbSync(){
  const id=SESSION?SESSION.id:null;
  if(TB.uid===id)return;
  if(TB.unsub){try{TB.unsub();}catch(e){}TB.unsub=null;}
  TB.uid=id;TB.list=[];TB.first=true;TB.seen=new Set();tbBadge();
  if(!id)return;
  TB.unsub=Data.watch('tb_'+id,list=>{
    if(TB.uid!==id)return;
    list=list.slice().sort((a,b)=>String(b.at)<String(a.at)?-1:String(b.at)>String(a.at)?1:0);
    const fresh=list.filter(n=>!n.read_at&&!TB.seen.has(n.id));
    TB.list=list;
    if(TB.first){
      TB.first=false;list.forEach(n=>TB.seen.add(n.id));
      const u=tbUnread();if(u)toast('Bạn có '+u+' thông báo chưa đọc.');
      tbPrune(list);
    }else{
      fresh.forEach(n=>{if(Date.now()-new Date(n.at).getTime()<10*60000)tbAlert(n);});
      list.forEach(n=>TB.seen.add(n.id));
    }
    tbBadge();schedule();
  });
  /* đã cấp quyền và phòng bật đẩy nền: làm mới mã thiết bị mỗi lần vào */
  try{if(TB_PUSH()&&window.__fbPushEnable&&('Notification' in window)&&Notification.permission==='granted')window.__fbPushEnable(id);}catch(e){}
}
/* dọn thông báo cũ: đã đọc quá 30 ngày hoặc bất kỳ quá 90 ngày */
async function tbPrune(list){
  try{const now=Date.now();let n=0;
    for(const x of list){if(n>=20)break;const age=now-new Date(x.at).getTime();
      if(age>90*864e5||(x.read_at&&age>30*864e5)){await Data.del('tb_'+TB.uid+'/'+x.id);n++;}}
  }catch(e){}
}
function tbBadge(){
  const n=tbUnread();
  try{const base=document.title.replace(/^\(\d+\)\s*/,'');document.title=(n?'('+n+') ':'')+base;}catch(e){}
  try{if(navigator.setAppBadge){(n?navigator.setAppBadge(n):navigator.clearAppBadge()).catch(()=>{});}}catch(e){}
}
function tbBeep(){
  if(!tbPref('sound',true))return;
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;const c=new AC(),t=c.currentTime;
    [[880,0],[1175,0.16]].forEach(([f,d])=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=f;o.type='sine';o.connect(g);g.connect(c.destination);
      g.gain.setValueAtTime(0.0001,t+d);g.gain.exponentialRampToValueAtTime(0.18,t+d+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t+d+0.28);o.start(t+d);o.stop(t+d+0.3);});
    setTimeout(()=>{try{c.close();}catch(e){}},900);}catch(e){}
}
async function tbOS(n){
  if(!('Notification' in window)||Notification.permission!=='granted'||!tbPref('os',true))return;
  const opt={body:n.body||'',tag:n.id,data:{link:n.link||''}};
  if(document.querySelector('link[rel=manifest]')){opt.icon='icons/icon-192.png';opt.badge='icons/favicon-32.png';}
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg&&reg.showNotification){await reg.showNotification(n.title,opt);return;}}catch(e){}
  try{const x=new Notification(n.title,opt);x.onclick=()=>{try{window.focus();}catch(e){}location.hash=n.link||'thong-bao';x.close();};}catch(e){}
}
function tbAlert(n){
  toast(n.title+': '+n.body);tbBeep();
  if(document.hidden)tbOS(n);
}
async function tbRead(n){
  if(!n||n.read_at)return;
  try{await Data.update('tb_'+TB.uid+'/'+n.id,{read_at:new Date().toISOString()});}catch(e){}
}
async function tbReadAll(){
  const L=TB.list.filter(n=>!n.read_at);
  for(const n of L)await tbRead(n);
}
/* xin quyền thông báo (phải do người dùng bấm nút) và đăng ký đẩy nền nếu phòng đã bật */
async function tbEnable(){
  if(!('Notification' in window))return {ok:false,msg:'Trình duyệt này không hỗ trợ thông báo. Trên iPhone, hãy cài web app lên màn hình chính trước (xem hướng dẫn).'};
  let p=Notification.permission;
  if(p==='default'){try{p=await Notification.requestPermission();}catch(e){p='denied';}}
  if(p!=='granted')return {ok:false,msg:p==='denied'?'Thông báo đang bị chặn. Mở cài đặt trang web của trình duyệt, cho phép Thông báo rồi thử lại.':'Chưa cấp quyền thông báo.'};
  tbSetPref('os',true);
  if(TB_PUSH()&&window.__fbPushEnable){const r=await window.__fbPushEnable(SESSION.id);if(!r.ok)return {ok:true,msg:'Đã bật thông báo khi đang mở ứng dụng. Chưa đăng ký được thông báo nền: '+r.msg};return {ok:true,msg:'Đã bật thông báo, kể cả khi đã tắt ứng dụng.'};}
  return {ok:true,msg:'Đã bật thông báo khi ứng dụng đang mở hoặc chạy nền.'};
}
function tbState(){
  if(!('Notification' in window))return ['Không hỗ trợ trên trình duyệt này','muted'];
  const p=Notification.permission;
  if(p==='granted')return [TB_PUSH()?'Đã bật (kể cả khi tắt ứng dụng)':'Đã bật (khi ứng dụng đang mở hoặc chạy nền)','ok'];
  if(p==='denied')return ['Đang bị chặn trong trình duyệt','bad'];
  return ['Chưa bật','warn'];
}
const tbLinkable=l=>!!l&&!!pages[String(l).split('/')[0]];
function tbOpen(n){tbRead(n);if(tbLinkable(n.link))location.hash=n.link;}
const tbKindName={giao:'Giao việc',tra_lai:'Trả lại',soat_xet:'Soát xét',phe_duyet:'Phê duyệt',sua_phieu:'Sửa phiếu',thu:'Thử'};

pages['thong-bao']={render(root){
  const st=tbState(),msg=h('p',{class:'small muted',id:'tb-msg'},'');
  const L=TB.list,un=tbUnread();
  const enable=h('button',{class:'btn primary','data-act':'tb-enable',onclick:async()=>{const r=await tbEnable();toast(r.msg,r.ok?'':'bad');render();}},'Bật thông báo trên thiết bị này');
  const test=h('button',{class:'btn','data-act':'tb-test',onclick:()=>{tbAlert({id:'test_'+rid(),title:'Thông báo thử',body:'Nếu bạn thấy dòng này thì thiết bị nhận được thông báo.',link:'thong-bao'});if(!document.hidden)tbOS({id:'test_'+rid(),title:'Thông báo thử',body:'Thiết bị này nhận được thông báo.',link:'thong-bao'});}},'Gửi thông báo thử');
  const snd=h('input',{type:'checkbox',id:'tb-snd',checked:tbPref('sound',true),onchange:e=>{tbSetPref('sound',e.target.checked);}});
  const os=h('input',{type:'checkbox',id:'tb-os',checked:tbPref('os',true),onchange:e=>{tbSetPref('os',e.target.checked);}});
  root.append(pageHead('Thông báo','Việc giao cho bạn, mẫu bị trả lại, hồ sơ chờ soát xét hoặc phê duyệt.',
    h('div',{class:'row'},h('button',{class:'btn','data-act':'tb-readall',disabled:!un,onclick:async()=>{await tbReadAll();}},'Đánh dấu đã đọc tất cả'))));
  root.append(h('div',{class:'card stack'},
    h('h3',null,'Nhận thông báo trên thiết bị này'),
    h('div',{class:'row'},h('span',null,'Trạng thái: '),tonePill(st[0],st[1])),
    h('div',{class:'row'},enable,test),
    h('label',{class:'chk',for:'tb-snd'},snd,h('span',null,'Phát âm báo khi có thông báo mới')),
    h('label',{class:'chk',for:'tb-os'},os,h('span',null,'Hiện thông báo của hệ điều hành khi tôi đang ở cửa sổ khác')),
    msg,
    h('p',{class:'small muted'},'Mỗi thiết bị bật riêng. Trên iPhone, thông báo chỉ hoạt động khi web app đã được cài lên màn hình chính. '+(TB_PUSH()?'Phòng đã bật dịch vụ đẩy nền nên vẫn nhận được khi đã tắt ứng dụng.':'Thông báo nền khi đã tắt hẳn ứng dụng cần phòng bật dịch vụ đẩy (xem hướng dẫn triển khai Firebase).'))));
  if(!L.length){root.append(h('div',{class:'card'},h('p',{class:'muted'},'Chưa có thông báo nào.')));return;}
  root.append(h('div',{class:'card flat'},h('div',{class:'stack'},L.slice(0,60).map(n=>
    h('div',{class:'tb-item','data-unread':n.read_at?'0':'1','data-id':n.id},
      h('div',{class:'tb-main'},h('b',null,n.title),h('div',null,n.body),h('div',{class:'small muted'},fdt(n.at)+(n.by?' · '+n.by:''))),
      h('div',{class:'row'},tbLinkable(n.link)?h('button',{class:'btn sm','data-act':'tb-open',onclick:()=>tbOpen(n)},'Mở'):null,
        n.read_at?null:h('button',{class:'btn sm ghost','data-act':'tb-read',onclick:()=>tbRead(n)},'Đã đọc')))))));
}};
