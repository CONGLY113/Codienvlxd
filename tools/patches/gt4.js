/* ====================================================================== 0.11.0 XI MĂNG PCB30 (BM-XM-02), ĐO CHỐNG SÉT (BM-CS-01), SƠ ĐỒ VẼ TAY TRÊN ĐIỆN THOẠI */
const XM30_B64='@@XM30@@',CS_B64='@@CS@@';
/* ---- nhãn ô "nguồn gốc mẫu" theo loại: xi măng ghi số lô, đo chống sét ghi hạng mục đo */
const NGUON_LBL={XM_PCB40:{l:'Số lô',ph:'Ví dụ: Sông Gianh, lô 4B-QB0124093',hint:'Ghi số lô in trên bao hoặc phiếu xuất xưởng (kèm nhãn hiệu nếu cần). Số lô được đưa sang phiếu cấp phối bê tông.'},
  DO_CS:{l:'Khu vực đo',ph:'Ví dụ: Nhà lớp học A, hệ thống tiếp địa',hint:'Ghi khu vực hoặc hạng mục có hệ thống chống sét được đo (khác với Hạng mục của công trình).'}};
NGUON_LBL.XM_PCB30=NGUON_LBL.XM_PCB40;
const nguonLbl=loai=>NGUON_LBL[loai]||{l:'Nguồn gốc mẫu',ph:'Mỏ, bãi cung cấp',hint:'Ghi theo tên mỏ hoặc bãi.'};
/* ---- xi măng PCB30: cùng phương pháp thử với PCB40, khác mức yêu cầu cường độ (R3 ≥ 14, R28 ≥ 30) */
(function(){
  const X=GT.XM_PCB40,req={mjn:'≤ 10',bd:'≥ 45',kt:'≤ 420',on:'≤ 10',r3:'≥ 14,0',r28:'≥ 30,0'};
  const ok=r=>r.mjn<=10&&r.bd>=45&&r.kt<=420&&r.on<=10&&r.r3>=14&&r.r28>=30;
  const fixed=X.fixed.map(c=>c[0]==='B22'?['B22','Mức yêu cầu cường độ 3 ngày',14]:(c[0]==='B23'?['B23','Mức yêu cầu cường độ 28 ngày',30]:c));
  GT.XM_PCB30=Object.assign({},X,{code:'XM_PCB30',form:{code:'BM-XM-02',ver:'v1.0'},ten:'Xi măng PCB30',b64:()=>XM30_B64,fixed,
    table:r=>X.tests.map((t,i)=>[i+1,t.name,t.std,t.unit,r[t.key]==null?'':fnum(r[t.key],X.dp[t.key]),req[t.key]]),
    nhanXet:r=>(X.tests.every(t=>r[t.key]!=null)?('Mẫu xi măng trên có '+(ok(r)?'các chỉ tiêu đã kiểm tra đạt':'chỉ tiêu không đạt')+' yêu cầu loại xi măng PCB30 theo TCVN 6260:2009.'):'')});
})();
/* ---- sơ đồ vẽ tay: các nét lưu dạng vector gọn trong bản nháp, xuất ảnh PNG khi tạo hồ sơ */
const SK_COL=['#111111','#d00000','#0050c8'],SK_W=[2,4,8],SK_DIM={ngang:[1000,700],dung:[700,1000]};
const skNew=o=>{o=o||'ngang';return{v:1,o,w:SK_DIM[o][0],h:SK_DIM[o][1],ops:[]};};
function skOp(g,op){
  g.save();const col=SK_COL[op.c||0],w=SK_W[op.w==null?1:op.w];g.strokeStyle=col;g.fillStyle=col;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';const p=op.p;
  if(op.t==='p'){g.beginPath();g.moveTo(p[0],p[1]);if(p.length===2)g.lineTo(p[0]+0.1,p[1]);for(let i=2;i<p.length;i+=2)g.lineTo(p[i],p[i+1]);g.stroke();}
  else if(op.t==='l'||op.t==='a'){g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[2],p[3]);g.stroke();
    if(op.t==='a'){const an=Math.atan2(p[3]-p[1],p[2]-p[0]),L=14+w*2;g.beginPath();g.moveTo(p[2],p[3]);g.lineTo(p[2]-L*Math.cos(an-0.45),p[3]-L*Math.sin(an-0.45));g.lineTo(p[2]-L*Math.cos(an+0.45),p[3]-L*Math.sin(an+0.45));g.closePath();g.fill();}}
  else if(op.t==='r'){g.strokeRect(Math.min(p[0],p[2]),Math.min(p[1],p[3]),Math.abs(p[2]-p[0]),Math.abs(p[3]-p[1]));}
  else if(op.t==='o'){g.beginPath();g.ellipse((p[0]+p[2])/2,(p[1]+p[3])/2,Math.max(1,Math.abs(p[2]-p[0])/2),Math.max(1,Math.abs(p[3]-p[1])/2),0,0,Math.PI*2);g.stroke();}
  else if(op.t==='t'){g.font='bold '+(op.z||32)+'px Arial,Helvetica,sans-serif';g.textBaseline='middle';g.fillText(op.s,p[0],p[1]);}
  else if(op.t==='n'){g.beginPath();g.arc(p[0],p[1],22,0,Math.PI*2);g.fillStyle='#fff';g.fill();g.lineWidth=4;g.stroke();g.fillStyle=col;g.font='bold '+(String(op.n).length>1?20:26)+'px Arial,Helvetica,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(String(op.n),p[0],p[1]+1);}
  g.restore();}
function skDraw(g,sk,opt){
  opt=opt||{};g.save();g.fillStyle='#fff';g.fillRect(0,0,sk.w,sk.h);
  if(opt.grid){g.strokeStyle='#e8e8e8';g.lineWidth=1;g.beginPath();for(let x=50;x<sk.w;x+=50){g.moveTo(x,0);g.lineTo(x,sk.h);}for(let y=50;y<sk.h;y+=50){g.moveTo(0,y);g.lineTo(sk.w,y);}g.stroke();}
  (sk.ops||[]).forEach(op=>skOp(g,op));
  g.strokeStyle='#999';g.lineWidth=3;g.strokeRect(1.5,1.5,sk.w-3,sk.h-3);g.restore();}
function skPng(sk,text){return new Promise(res=>{try{const cv=document.createElement('canvas');cv.width=sk.w;cv.height=sk.h;const g=cv.getContext('2d');skDraw(g,sk,{});
  if(text){g.fillStyle='#888';g.font='28px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(text,sk.w/2,sk.h/2);}
  cv.toBlob(async b=>res(b?new Uint8Array(await b.arrayBuffer()):null),'image/png');}catch(e){res(null);}});}
const pngDims=u=>[((u[16]<<24)|(u[17]<<16)|(u[18]<<8)|u[19])>>>0,((u[20]<<24)|(u[21]<<16)|(u[22]<<8)|u[23])>>>0];
async function skNorm(u8){ /* đưa ảnh trong file về PNG gọn (tối đa 150 KB) để lưu và nhúng lại khi phát hành */
  const isPng=u8.length>24&&u8[0]===0x89&&u8[1]===0x50&&u8[2]===0x4E&&u8[3]===0x47;
  if(isPng&&u8.length<=150*1024){const d=pngDims(u8);return{b64:u8ToB64(u8),w:d[0],h:d[1]};}
  try{const bmp=await createImageBitmap(new Blob([u8]));const k=Math.min(1,1000/bmp.width),cv=document.createElement('canvas');cv.width=Math.round(bmp.width*k);cv.height=Math.round(bmp.height*k);
    const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.drawImage(bmp,0,0,cv.width,cv.height);
    const out=await new Promise(r=>cv.toBlob(async b=>r(b?new Uint8Array(await b.arrayBuffer()):null),'image/png'));
    if(!out||out.length>200*1024)return{err:'Ảnh sơ đồ quá lớn. Dùng ảnh nhỏ hơn hoặc vẽ trên điện thoại.'};
    return{b64:u8ToB64(out),w:cv.width,h:cv.height};}catch(e){return{err:'Không đọc được ảnh sơ đồ trong file.'};}}
/* tìm ảnh sơ đồ trong gói xlsx: ưu tiên hình tên SoDoViTri, nếu không thì ảnh lớn nhất (bỏ mã QR và ảnh giữ chỗ 2x2) */
async function skMedia(zip){
  const df=zip.file('xl/drawings/drawing1.xml'),rf=zip.file('xl/drawings/_rels/drawing1.xml.rels');if(!df||!rf)return null;
  const dr=await df.async('string'),rl=await rf.async('string'),rels={};
  (rl.match(/<Relationship\b[^>]*>/g)||[]).forEach(t=>{const i=/\bId="([^"]+)"/.exec(t),g=/Target="([^"]+)"/.exec(t);if(i&&g)rels[i[1]]=g[1];});
  const cand=[];
  for(const t of (dr.match(/<(?:xdr:)?pic>[\s\S]*?<\/(?:xdr:)?pic>/g)||[])){
    const nm=(/name="([^"]*)"/.exec(t)||[])[1]||'',em=/r:embed="([^"]+)"/.exec(t);if(!em||!rels[em[1]])continue;
    let tg=rels[em[1]];tg=tg.charAt(0)==='/'?tg.slice(1):'xl/'+tg.replace(/^\.\.\//,'');
    if(/qr/i.test(nm)||/\/qr\d*\.png$/i.test(tg))continue;const f=zip.file(tg);if(!f)continue;const b=await f.async('uint8array');if(b.length<400)continue;cand.push({nm,tg,b});}
  return cand.find(c=>c.nm==='SoDoViTri')||cand.sort((a,b)=>b.b.length-a.b.length)[0]||null;}
let SK_PH=null;
async function skFromFile(u8,G){
  try{const zip=await JSZip.loadAsync(u8),m=await skMedia(zip);if(!m)return null;
    if(!SK_PH){const z0=await JSZip.loadAsync(b64ToU8(G.b64())),m0=await skMedia(z0);SK_PH=m0?m0.b:new Uint8Array(0);}
    if(m.b.length===SK_PH.length&&m.b.every((x,i)=>x===SK_PH[i]))return null;
    return await skNorm(m.b);}catch(e){console.warn('skFromFile',e);return null;}}
async function skEmbed(zip,png,w,h_){
  const dpth='xl/drawings/drawing1.xml',rpth='xl/drawings/_rels/drawing1.xml.rels';if(!zip.file(dpth)||!zip.file(rpth))return false;
  const dr=await zip.file(dpth).async('string'),rl=await zip.file(rpth).async('string');
  const re=/<(?:xdr:)?oneCellAnchor>(?:(?!<\/(?:xdr:)?oneCellAnchor>)[\s\S])*?name="SoDoViTri"(?:(?!<\/(?:xdr:)?oneCellAnchor>)[\s\S])*<\/(?:xdr:)?oneCellAnchor>/;
  const m=re.exec(dr);if(!m)return false;const em=/r:embed="([^"]+)"/.exec(m[0]);if(!em)return false;
  const rm=new RegExp('<Relationship\\b[^>]*\\bId="'+em[1]+'"[^>]*>').exec(rl);if(!rm)return false;
  let tg=/Target="([^"]+)"/.exec(rm[0])[1];tg=tg.charAt(0)==='/'?tg.slice(1):'xl/'+tg.replace(/^\.\.\//,'');zip.file(tg,png);
  const land=w>=h_,cx=land?7429500:6096000,cy=Math.round(cx*h_/w),off=land?276225:942975;
  const a=m[0].replace(/<((?:xdr:)?)ext cx="\d+" cy="\d+"\/>/,(x,p)=>'<'+p+'ext cx="'+cx+'" cy="'+cy+'"/>').replace(/<((?:xdr:)?)colOff>\d+<\/(?:xdr:)?colOff>/,(x,p)=>'<'+p+'colOff>'+off+'</'+p+'colOff>');
  zip.file(dpth,dr.replace(m[0],()=>a));return true;}
const skBlock=s=>{const k=s&&s.nop&&s.nop.sketch;return k&&k.b64?h('div',{class:'card flat'},h('h3',null,'Sơ đồ vị trí các điểm đo (mặt sau phiếu)'),h('img',{src:'data:image/png;base64,'+k.b64,alt:'Sơ đồ vị trí các điểm đo',style:'display:block;max-width:100%;border:1px solid var(--line);border-radius:6px'})):null;};
(function(){const st=document.createElement('style');st.textContent=
'.sk-ov{position:fixed;inset:0;z-index:400;background:#1b2a2e;display:flex;flex-direction:column;touch-action:none;user-select:none;-webkit-user-select:none}'+
'.sk-top,.sk-bot{display:flex;flex-wrap:wrap;gap:6px;padding:8px;background:#fff;align-items:center;justify-content:center}'+
'.sk-top{border-bottom:1px solid var(--line)}.sk-bot{border-top:1px solid var(--line);padding-bottom:calc(8px + env(safe-area-inset-bottom,0px))}'+
'.sk-wrap{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:6px;overflow:hidden}'+
'.sk-cv{background:#fff;touch-action:none;box-shadow:0 2px 12px rgba(0,0,0,.4);cursor:crosshair}'+
'.sk-b{min-width:44px;min-height:44px;padding:4px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);font:inherit;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}'+
'.sk-b[aria-pressed=true]{background:var(--accent);color:#fff;border-color:var(--accent)}.sk-b:disabled{opacity:.4}'+
'.sk-col{width:44px;height:44px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px var(--line);padding:0;cursor:pointer}.sk-col[aria-pressed=true]{box-shadow:0 0 0 3px var(--accent)}'+
'.sk-msg{font-size:12px;color:var(--ink-2);min-width:120px;text-align:center}'+
'.sk-txt{position:absolute;left:50%;top:28%;transform:translateX(-50%);background:#fff;padding:12px;border-radius:10px;display:flex;gap:8px;box-shadow:0 8px 30px rgba(0,0,0,.45);z-index:2}'+
'.sk-prev{width:100%;height:auto;border:1px solid var(--line);border-radius:8px;background:#fff;display:block;margin:8px 0}';
document.head.append(st);})();
const skSeg=(px,py,a,b,c,d)=>{const dx=c-a,dy=d-b,L=dx*dx+dy*dy;let t=L?((px-a)*dx+(py-b)*dy)/L:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-(a+t*dx),py-(b+t*dy));};
function skDist(op,x,y){const p=op.p;
  if(op.t==='p'){if(p.length===2)return Math.hypot(x-p[0],y-p[1]);let m=1e9;for(let i=0;i+3<p.length;i+=2)m=Math.min(m,skSeg(x,y,p[i],p[i+1],p[i+2],p[i+3]));return m;}
  if(op.t==='l'||op.t==='a')return skSeg(x,y,p[0],p[1],p[2],p[3]);
  if(op.t==='r'){const a=Math.min(p[0],p[2]),b=Math.min(p[1],p[3]),c=Math.max(p[0],p[2]),d=Math.max(p[1],p[3]);return Math.min(skSeg(x,y,a,b,c,b),skSeg(x,y,c,b,c,d),skSeg(x,y,c,d,a,d),skSeg(x,y,a,d,a,b));}
  if(op.t==='o'){const cx=(p[0]+p[2])/2,cy=(p[1]+p[3])/2,rx=Math.max(1,Math.abs(p[2]-p[0])/2),ry=Math.max(1,Math.abs(p[3]-p[1])/2);return Math.abs(Math.hypot((x-cx)/rx,(y-cy)/ry)-1)*Math.min(rx,ry);}
  if(op.t==='n')return Math.max(0,Math.hypot(x-p[0],y-p[1])-22);
  if(op.t==='t'){const z=op.z||32,wv=(op.s||'').length*z*0.6;return(x>=p[0]-6&&x<=p[0]+wv+6&&Math.abs(y-p[1])<=z*0.7)?0:1e9;}
  return 1e9;}
/* bảng vẽ toàn màn hình; onDone(sk) khi bấm Xong, onDone(null) khi Hủy */
function skOpen(sk0,onDone){
  const sk=JSON.parse(JSON.stringify(sk0&&sk0.ops?sk0:skNew('ngang')));
  let tool='p',col=0,wd=1,grid=true,cur=null,erasing=false,hist=[],redo=[],nextN=sk.ops.reduce((m,o)=>o.t==='n'?Math.max(m,o.n):m,0)+1;
  const cv=h('canvas',{class:'sk-cv',width:String(sk.w),height:String(sk.h),'aria-label':'Bảng vẽ sơ đồ'}),g=cv.getContext('2d'),wrap=h('div',{class:'sk-wrap'},cv);
  const msg=h('span',{class:'sk-msg'},'Vẽ bằng ngón tay hoặc bút'),say=t=>{msg.textContent=t;};
  const redraw=()=>{skDraw(g,sk,{grid});if(cur)skOp(g,cur);};
  const fit=()=>{const W=wrap.clientWidth-12,H=wrap.clientHeight-12;if(W<=0||H<=0)return;const k=Math.min(W/sk.w,H/sk.h);cv.style.width=Math.floor(sk.w*k)+'px';cv.style.height=Math.floor(sk.h*k)+'px';};
  const snap=()=>{hist.push(JSON.stringify(sk.ops));if(hist.length>80)hist.shift();redo.length=0;};
  const pt=e=>{const r=cv.getBoundingClientRect();return[Math.max(0,Math.min(sk.w,Math.round((e.clientX-r.left)*sk.w/r.width))),Math.max(0,Math.min(sk.h,Math.round((e.clientY-r.top)*sk.h/r.height)))];};
  const eraseAt=(x,y)=>{for(let i=sk.ops.length-1;i>=0;i--){if(skDist(sk.ops[i],x,y)<=22){snap();sk.ops.splice(i,1);redraw();upd();return;}}};
  const tools=[['p','Bút'],['l','Đường'],['a','Mũi tên'],['r','Khung'],['o','Elip'],['t','Chữ'],['n','Số'],['x','Gôm']];
  const tb=tools.map(([k,l])=>h('button',{class:'sk-b','data-tool':k,type:'button','aria-pressed':String(k===tool),onclick:()=>{tool=k;upd();say(k==='n'?'Chạm để đặt số điểm đo, trùng STT trong bảng':k==='x'?'Chạm vào nét để xóa':k==='t'?'Chạm vào chỗ cần ghi chữ':'');}},l));
  const cb=SK_COL.map((c,i)=>h('button',{class:'sk-col','data-col':String(i),type:'button','aria-label':'Màu '+(i+1),style:'background:'+c,'aria-pressed':String(i===col),onclick:()=>{col=i;upd();}}));
  const wb=['Mảnh','Vừa','Dày'].map((l,i)=>h('button',{class:'sk-b','data-w':String(i),type:'button','aria-pressed':String(i===wd),onclick:()=>{wd=i;upd();}},l));
  const bUndo=h('button',{class:'sk-b',type:'button',onclick:()=>{if(!hist.length)return;redo.push(JSON.stringify(sk.ops));sk.ops=JSON.parse(hist.pop());redraw();upd();}},'Hoàn tác');
  const bRedo=h('button',{class:'sk-b',type:'button',onclick:()=>{if(!redo.length)return;hist.push(JSON.stringify(sk.ops));sk.ops=JSON.parse(redo.pop());redraw();upd();}},'Làm lại');
  let clrT=0;const bClr=h('button',{class:'sk-b','data-act':'clear',type:'button',onclick:()=>{if(!sk.ops.length)return;if(!clrT){say('Bấm lần nữa để xóa hết');bClr.textContent='Xóa hết?';clrT=setTimeout(()=>{clrT=0;bClr.textContent='Xóa hết';},2500);return;}clearTimeout(clrT);clrT=0;bClr.textContent='Xóa hết';snap();sk.ops=[];nextN=1;redraw();upd();}},'Xóa hết');
  const bGrid=h('button',{class:'sk-b',type:'button',onclick:()=>{grid=!grid;redraw();upd();}},'Lưới');
  const bOri=h('button',{class:'sk-b','data-act':'ori',type:'button',onclick:()=>{if(sk.ops.length){say('Chỉ đổi khổ giấy khi chưa vẽ. Bấm Xóa hết rồi đổi.');return;}sk.o=sk.o==='ngang'?'dung':'ngang';sk.w=SK_DIM[sk.o][0];sk.h=SK_DIM[sk.o][1];cv.width=sk.w;cv.height=sk.h;fit();redraw();upd();}},'');
  const nLbl=h('span',{style:'min-width:46px;text-align:center;font-weight:600'}),bNm=h('button',{class:'sk-b',type:'button','aria-label':'Giảm số',onclick:()=>{nextN=Math.max(1,nextN-1);upd();}},'−'),bNp=h('button',{class:'sk-b',type:'button','aria-label':'Tăng số',onclick:()=>{nextN=Math.min(99,nextN+1);upd();}},'+');
  const bOk=h('button',{class:'sk-b','data-act':'ok',type:'button',style:'background:var(--accent);color:#fff;border-color:var(--accent)',onclick:()=>close(sk)},'Xong'),bCancel=h('button',{class:'sk-b','data-act':'cancel',type:'button',onclick:()=>close(null)},'Hủy');
  const ov=h('div',{class:'sk-ov',role:'dialog','aria-label':'Vẽ sơ đồ vị trí các điểm đo'},h('div',{class:'sk-top'},bCancel,bUndo,bRedo,bClr,msg,bOk),wrap,h('div',{class:'sk-bot'},tb,h('span',{style:'display:inline-flex;gap:4px;align-items:center'},bNm,nLbl,bNp),cb,wb,bGrid,bOri));
  function upd(){tb.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));cb.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===col)));wb.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===wd)));
    bUndo.disabled=!hist.length;bRedo.disabled=!redo.length;bGrid.setAttribute('aria-pressed',String(grid));bOri.textContent='Khổ: '+(sk.o==='ngang'?'ngang':'đứng');nLbl.textContent='Số '+nextN;}
  function askText(x,y){if(ov.querySelector('.sk-txt'))return;
    const inp=h('input',{type:'text',maxlength:'40',placeholder:'Nội dung chữ',style:'font-size:16px;padding:8px;border:1px solid var(--line);border-radius:6px;min-width:0;width:200px'});
    const box=h('div',{class:'sk-txt'},inp,h('button',{class:'sk-b','data-act':'txt-ok',type:'button',onclick:ok},'Thêm'),h('button',{class:'sk-b',type:'button',onclick:()=>box.remove()},'Hủy'));
    function ok(){const s=inp.value.trim();box.remove();if(!s)return;snap();sk.ops.push({t:'t',c:col,z:[24,32,44][wd],p:[x,y],s});redraw();upd();}
    inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();ok();}});ov.append(box);setTimeout(()=>inp.focus(),30);}
  cv.addEventListener('pointerdown',e=>{if(e.button>0)return;e.preventDefault();const[x,y]=pt(e);
    if(tool==='t'){askText(x,y);return;}
    if(tool==='n'){snap();sk.ops.push({t:'n',c:col,p:[x,y],n:nextN});nextN=Math.min(99,nextN+1);redraw();upd();return;}
    if(tool==='x'){erasing=true;try{cv.setPointerCapture(e.pointerId);}catch(_){}eraseAt(x,y);return;}
    try{cv.setPointerCapture(e.pointerId);}catch(_){}
    cur=tool==='p'?{t:'p',c:col,w:wd,p:[x,y]}:{t:tool,c:col,w:wd,p:[x,y,x,y]};redraw();});
  cv.addEventListener('pointermove',e=>{if(erasing){const[x,y]=pt(e);eraseAt(x,y);return;}if(!cur)return;e.preventDefault();const[x,y]=pt(e);
    if(cur.t==='p'){const p=cur.p;if(Math.hypot(x-p[p.length-2],y-p[p.length-1])>=3)p.push(x,y);}else{cur.p[2]=x;cur.p[3]=y;}redraw();});
  const up=()=>{erasing=false;if(!cur)return;const o=cur;cur=null;if(o.t!=='p'&&Math.hypot(o.p[2]-o.p[0],o.p[3]-o.p[1])<6){redraw();return;}snap();sk.ops.push(o);redraw();upd();};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  const onKey=e=>{if(e.key==='Escape'&&!ov.querySelector('.sk-txt'))close(null);};
  window.addEventListener('resize',fit);window.addEventListener('keydown',onKey);
  function close(res){window.removeEventListener('resize',fit);window.removeEventListener('keydown',onKey);document.body.style.overflow=prevOv;ov.remove();onDone(res);}
  const prevOv=document.body.style.overflow;document.body.style.overflow='hidden';document.body.append(ov);fit();redraw();upd();
  return{sk,close};}
/* khối trong form điện thoại: xem trước, nút vẽ/sửa/xóa */
function skNode(d,again){
  const sk=d.sk&&d.sk.ops&&d.sk.ops.length?d.sk:null,box=h('div',{class:'sk-node'});
  if(sk){const pv=h('canvas',{class:'sk-prev',width:String(sk.w),height:String(sk.h),'aria-label':'Xem trước sơ đồ'});skDraw(pv.getContext('2d'),sk,{});box.append(pv);}
  else box.append(h('p',{class:'small muted'},'Chưa có sơ đồ. Vẽ nhanh vị trí các điểm đo (khối nhà, cọc tiếp địa, khoảng cách) rồi đánh số trùng với số thứ tự trong bảng. Ảnh được đưa vào mặt sau của file báo cáo.'));
  box.append(h('div',{class:'row'},h('button',{class:'btn primary','data-act':'sk-open',type:'button',onclick:()=>skOpen(d.sk,r=>{if(r){d.sk=r.ops.length?r:null;}again();})},sk?'Sửa sơ đồ':'Vẽ sơ đồ'),sk?h('button',{class:'btn ghost','data-act':'sk-del',type:'button',onclick:()=>{d.sk=null;again();}},'Xóa sơ đồ'):null,sk?h('span',{class:'small muted'},sk.ops.length+' nét'):null));
  return box;}
/* ---- đo điện trở tiếp đất (chống sét) BM-CS-01 */
const CS_N=15;
function rcCS(r){
  const n=nzn,rows=[];
  for(let i=0;i<CS_N;i++){
    const vt=r['vt_'+i],a=n(r['l1_'+i]),b=n(r['l2_'+i]),c=n(r['l3_'+i]);
    if(![vt,a,b,c].some(x=>x!=null&&x!==''))continue;
    rows.push({i,vt:vt||'',a,b,c,tb:(a!=null&&b!=null&&c!=null)?(a+b+c)/3:null});}
  const m=rows.map(x=>x.tb).filter(x=>x!=null),yc=n(r.yc);
  const o={rows,n:m.length,max:m.length?Math.max(...m):null,min:m.length?Math.min(...m):null,yc};
  o.bad=yc!=null?rows.filter(x=>x.tb!=null&&x.tb>yc).length:null;
  o.kl=(yc==null||!o.n)?'CHƯA XÉT':(o.max<=yc?'ĐẠT':'KHÔNG ĐẠT');
  return o;}
const csKeys=i=>['vt_'+i,'l1_'+i,'l2_'+i,'l3_'+i];
function csSections(d){
  const n=d.n||2,out=[sec1('Yêu cầu kỹ thuật (nhập nếu có)','Điện trở nối đất tối đa theo hồ sơ thiết kế. Để trống thì phiếu không kết luận đạt hay không đạt.',[['',[['yc','Điện trở tối đa cho phép (Ω)']]]],d=>{const r=rcCS(d);return r.n?['Kết luận tạm',r.kl,r.yc!=null?'Lớn nhất '+fnum(r.max,2)+' Ω':'',r.kl==='KHÔNG ĐẠT']:null;})];
  for(let i=0;i<n;i++)out.push(sec1('Điểm đo '+(i+1),'Đo 3 lần, hệ thống tính trung bình.',[['',[['vt_'+i,'Vị trí điểm đo'],['l1_'+i,'Lần đo 1 (Ω)'],['l2_'+i,'Lần đo 2 (Ω)'],['l3_'+i,'Lần đo 3 (Ω)']]]],d=>{const x=rcCS(d).rows.find(y=>y.i===i);return(!x||x.tb==null)?null:['Trung bình',fnum(x.tb,2)+' Ω','',d.yc!=null&&x.tb>d.yc];}));
  return out;}
(function(){
  const csMap={yc:'B4'};
  for(let i=0;i<CS_N;i++){const r=8+i;Object.assign(csMap,{['vt_'+i]:'B'+r,['l1_'+i]:'C'+r,['l2_'+i]:'D'+r,['l3_'+i]:'E'+r});}
  const csTests=[{code:'CS_01',name:'Đo điện trở tiếp đất (chống sét)',std:'TCVN 9385:2012',unit:'Ω',key:'max'}];
  const ph={yc:'10',vt_0:'Điểm 1',l1_0:'4,36',l2_0:'4,58',l3_0:'4,88',vt_1:'Điểm 2',l1_1:'5,26',l2_1:'5,78',l3_1:'5,02'};
  GT.DO_CS={code:'DO_CS',form:{code:'BM-CS-01',ver:'v1.0'},ten:'Đo chống sét',b64:()=>CS_B64,map:csMap,textKeys:[],textPrefix:['vt_'],sketch:true,
    fixed:[['B11','Số chữ số thập phân điện trở',2],['B12','Số điểm đo tối đa trên một phiếu',CS_N]],
    tests:csTests,dp:{max:2,min:2,n:0},rc:rcCS,rkeys:['n','max','min'],
    cacheCells:{n:'C25',max:'C26',min:'C27'},
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{if(x.tb!=null)o['F'+(8+x.i)]=x.tb;});return o;},
    expect:rc=>Object.assign({n:rc.n,max:rc.max,min:rc.min},GT.DO_CS.rowCache(rc)),
    results:(rc)=>({n:rc.n,max:rc.max,min:rc.min,kl:rc.kl,yc:rc.yc,rows:rc.rows.map(x=>({vt:x.vt,a:x.a,b:x.b,c:x.c,tb:x.tb}))}),
    qr:[['max','R max (Ohm)'],['min','R min (Ohm)'],['n','So diem']],
    ph,defaults:{n:2},kind:k=>k.indexOf('vt_')===0?'text':'num',sections:d=>csSections(d),
    need:d=>{let c=0;for(let i=0;i<(d.n||2);i++){if(!d['vt_'+i])c++;['l1_','l2_','l3_'].forEach(p=>{if(typeof d[p+i]!=='number')c++;});}return c;},
    total:d=>(d.n||2)*4,
    valid:(d,rc)=>rc.n>0&&rc.rows.every(x=>x.vt&&x.tb!=null&&x.a>0&&x.b>0&&x.c>0),
    extra:(d,again)=>h('div',{class:'stack'},
      h('div',{class:'row'},h('button',{class:'btn','data-act':'cs-add',onclick:()=>{if((d.n||2)>=CS_N){toast('Tối đa '+CS_N+' điểm đo trên một phiếu. Hãy tách thành mẫu khác cùng phiếu yêu cầu.','bad');return;}d.n=(d.n||2)+1;again();}},'＋ Thêm điểm đo'),
        (d.n||2)>1?h('button',{class:'btn','data-act':'cs-del',onclick:()=>{const i=(d.n||2)-1;csKeys(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một điểm'):null),
      h('section',{class:'card mf-sec'},h('h3',null,'Sơ đồ vị trí các điểm đo'),h('span',{class:'small muted'},'Mặt sau phiếu kết quả'),skNode(d,again))),
    head:['TT','Vị trí các điểm đo','Đơn vị','Lần đo 1','Lần đo 2','Lần đo 3','Trung bình'],
    table:r=>(r.rows||[]).map((x,i)=>[i+1,x.vt,'Ω',fnum(x.a,2),fnum(x.b,2),fnum(x.c,2),fnum(x.tb,2)]),
    nhanXet:r=>!r.n?'':(r.kl==='ĐẠT'?'Điện trở nối đất tại các điểm đo nêu trên đạt yêu cầu (không lớn hơn '+fnum(r.yc,2)+' Ω).':(r.kl==='KHÔNG ĐẠT'?'Có điểm đo điện trở nối đất lớn hơn yêu cầu '+fnum(r.yc,2)+' Ω.':'Kết quả đo điện trở tiếp đất tại các điểm nêu trên.')),
    rawRows:raw=>{const out=[['Yêu cầu tối đa',raw.yc==null?'không nhập':fnum(raw.yc,2)+' Ω']];
      for(let i=0;i<CS_N;i++){if(!raw['vt_'+i]&&raw['l1_'+i]==null)continue;out.push(['Điểm '+(i+1)+' · '+(raw['vt_'+i]||''),[1,2,3].map(j=>fnum(raw['l'+j+'_'+i],2)).join(' / ')+' Ω']);}return out;}};
  GT.DO_CS.qt=()=>[['Kết quả tổng hợp',[QT_R('Số điểm đo','n',0),QT_R('R trung bình lớn nhất (Ω)','max',2),QT_R('R trung bình nhỏ nhất (Ω)','min',2)]],
    ['Số liệu từng điểm',ix_(CS_N).flatMap(i=>[QT_C('Đ'+(i+1)+' lần 1 (Ω)','l1_'+i,2),QT_C('Đ'+(i+1)+' lần 2 (Ω)','l2_'+i,2),QT_C('Đ'+(i+1)+' lần 3 (Ω)','l3_'+i,2)])]];
  csTests.forEach(t=>ALL_TESTS.push(t));
})();
