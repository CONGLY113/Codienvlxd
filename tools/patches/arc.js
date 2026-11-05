/* ====================================================================== 0.12.0 LƯU GIỮ SAU 90 NGÀY (0.8.1) VÀ TRA CỨU HỒ SƠ LƯU BẰNG QR (0.8.2)
   Kỳ nửa tháng đã qua 90 ngày kể từ ngày cuối kỳ: đóng gói thành 1 file ZIP (mẫu, chi tiết, file Excel gốc, nhật ký, chỉ mục CSV, mã băm từng file).
   An toàn: chỉ xóa khỏi kho sau khi người dùng CHỌN LẠI file ZIP đã lưu và app kiểm tra đủ mã băm. Trước khi xóa, từng mẫu được đọc lại và so với bản trong gói.
   Sau khi xóa, kho giữ chỉ mục gọn archive/ix_<yymm>_<kỳ>_<lần>_<k> (150 dòng mỗi tài liệu) khóa theo THÁNG CỦA SỐ BÁO CÁO để QR tra được,
   và archive/run_<kỳ>_<lần> ghi tên gói, số mẫu, SHA-256 của gói. Mẫu cũ (id s_xxx, chưa chia kỳ) không thuộc phạm vi lưu giữ. */
const RETAIN_DAYS=90,ARC_FINAL=['da_phat_hanh','tu_choi'];
const arTe=new TextEncoder();
const perEnd=p=>{const y=2000+(+p.slice(0,2)),m=+p.slice(2,4);return y+'-'+pad(m)+'-'+(p.slice(4)==='a'?'15':pad(new Date(y,m,0).getDate()));};
const perStart=p=>'20'+p.slice(0,2)+'-'+p.slice(2,4)+'-'+(p.slice(4)==='a'?'01':'16');
const perDue=p=>perEnd(p)<addDays(todayISO(),-RETAIN_DAYS);
const perDueFrom=p=>addDays(perEnd(p),RETAIN_DAYS+1);
const matName=l=>{const x=MAT_TYPES.find(t=>t[0]===l);return x?x[1]:l;};
const arStable=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v);
const arSha=s=>sha256(arTe.encode(s));
const arSafe=s=>String(s||'x').replace(/[^A-Za-z0-9._-]+/g,'_');
const arYm=(...ss)=>{for(const s of ss){const m=/(\d{2})\.(\d{2})\.\d{2}\.\d+\s*$/.exec(String(s||''));if(m)return m[1]+m[2];}return null;};
async function arPool(items,n,fn){let i=0;await Promise.all(Array.from({length:Math.min(n,items.length)},async()=>{while(i<items.length){const k=i++;await fn(items[k],k);}}));}
const kbOf=n=>n>=1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';

/* kỳ còn dữ liệu trực tuyến (chỉ mẫu mới chia kỳ) */
function arcPeriods(){
  const m={};
  S.samples.filter(s=>isNew(s.id)).forEach(s=>{const p=perOfId(s.id),o=m[p]||(m[p]={p,n:0,fin:0});o.n++;if(ARC_FINAL.includes(s.status))o.fin++;});
  return Object.values(m).sort((a,b)=>a.p<b.p?-1:1);
}
const arcDueCount=()=>hasRole('tp')?arcPeriods().filter(x=>perDue(x.p)&&x.fin>0).length:0;

/* ---- đóng gói: đọc 3 bộ sưu tập của kỳ, ghi ZIP trong bộ nhớ */
async function arcBuild(p,opt,prog){
  opt=opt||{};prog=prog||(()=>{});
  const [ls,ds,bs]=await Promise.all([Data.getAll('samples_'+p),Data.getAll('detail_'+p),Data.getAll('blob_'+p)]);
  if(ls.length>=1000||ds.length>=1000||bs.length>=1000)throw new Error('Kỳ này có từ 1000 tài liệu trở lên, app chưa đọc hết một lần được. Báo người phát triển.');
  const dm=new Map(ds.map(d=>[d.id,d])),bm=new Map(bs.map(d=>[d.id,d]));
  const fin=ls.filter(x=>ARC_FINAL.includes(x.status)).sort((a,b)=>String(a.so_bao_cao||a.ma_mau)<String(b.so_bao_cao||b.ma_mau)?-1:1);
  if(!fin.length)throw new Error('Kỳ này chưa có mẫu đã phát hành hoặc bị từ chối để lưu giữ.');
  const zip=new JSZip(),rows=[],files={};
  const put=async(path,u8,store)=>{zip.file(path,u8,store?{compression:'STORE'}:undefined);return files[path]=await sha256(u8);};
  let k=0;
  for(const s of fin){
    prog('Đang gói '+(++k)+'/'+fin.length+' hồ sơ ...');
    const d=dm.get(s.id)||{id:s.id},b=bm.get(s.id),dir='ho-so/'+arSafe(s.so_bao_cao||s.ma_mau||s.id)+'_'+s.id+'/',sha={};
    sha.mau=await put(dir+'mau.json',arTe.encode(arStable(s)));
    sha.ct=await put(dir+'chi-tiet.json',arTe.encode(arStable(d)));
    if(b&&b.b64)sha.goc=await put(dir+'file-goc.xlsx',b64ToU8(b.b64),true);
    if(opt.phieu&&s.status==='da_phat_hanh'&&s.phieu){
      const had=DET.has(s.id);DET.set(s.id,d);
      try{const o=await phieuBytes(s);sha.phieu=await put(dir+'phieu.xlsx',o.bytes,true);}
      catch(e){console.warn(e);sha.phieu_loi=String(e.message||e);}
      finally{if(!had)DET.delete(s.id);}
    }
    rows.push({i:s.id,b:s.so_bao_cao||'',m:s.ma_mau||'',l:(s.mau&&s.mau.loai)||'CAT_XD',k:(s.khach&&s.khach.ten)||'',c:(s.du_an&&s.du_an.cong_trinh)||'',d:(s.phat_hanh_at||'').slice(0,10),h:(s.phieu&&s.phieu.hash)||'',n:(s.chi_tieu||[]).length,t:s.status==='da_phat_hanh'?'ph':'tc',dir,sha});
  }
  const esc=v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"';
  const csv='﻿'+[['Số báo cáo','Mã mẫu','Loại mẫu','Khách hàng','Công trình','Ngày phát hành','Số chỉ tiêu','Trạng thái','Thư mục']].concat(rows.map(r=>[r.b,r.m,matName(r.l),r.k,r.c,fd(r.d),r.n,r.t==='ph'?'Đã phát hành':'Từ chối',r.dir])).map(r=>r.map(esc).join(',')).join('\r\n');
  await put('chi-muc.csv',arTe.encode(csv));
  await put('DOC-TOI.txt',arTe.encode('GÓI LƯU GIỮ KỲ '+p+' ('+fd(perStart(p))+' đến '+fd(perEnd(p))+')\r\nTạo bởi app Quản lý mẫu thử nghiệm '+BUILD+'.\r\n- manifest.json: mã băm SHA-256 của mọi file trong gói; app kiểm tra khi mở lại.\r\n- chi-muc.csv: danh sách hồ sơ, mở bằng Excel.\r\n- ho-so/<số báo cáo>_<id>/: mau.json (yêu cầu, kết quả), chi-tiet.json (số liệu gốc, nhật ký, dữ liệu niêm phong), file-goc.xlsx (file cán bộ đã nộp), phieu.xlsx (nếu chọn kèm phiếu).\r\n- Xem lại hồ sơ: vào app, Hồ sơ lưu trữ, tab Đã lưu giữ, Mở file ZIP lưu giữ. Không sửa file trong gói.\r\n'));
  const goi='LUU_'+p+'_'+todayISO().replace(/-/g,'');
  const man={format:'ptn-luu-giu',v:1,per:p,goi,tao_luc:new Date().toISOString(),tao_boi:SESSION?SESSION.name:'',app:BUILD,so_mau:rows.length,con_lai_truc_tuyen:ls.length-fin.length,rows,files};
  zip.file('manifest.json',arTe.encode(JSON.stringify(man,null,1)));
  prog('Đang nén gói ZIP ...');
  const bytes=await zip.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}});
  return {bytes,man,name:goi+'.zip',sha:await sha256(bytes)};
}

/* ---- đọc và kiểm tra gói: đủ file, đúng mã băm */
async function arcRead(u8){
  let zip;try{zip=await JSZip.loadAsync(u8);}catch(e){return {ok:false,bad:['Không mở được file: không phải ZIP hoặc bị hỏng.']};}
  const mf=zip.file('manifest.json');if(!mf)return {ok:false,bad:['Không có manifest.json: đây không phải gói lưu giữ.']};
  let man;try{man=JSON.parse(await mf.async('string'));}catch(e){return {ok:false,bad:['manifest.json bị hỏng.']};}
  if(man.format!=='ptn-luu-giu'||!Array.isArray(man.rows)||!man.files)return {ok:false,bad:['Sai định dạng gói lưu giữ.']};
  const bad=[];
  for(const [path,h0] of Object.entries(man.files)){
    const f=zip.file(path);if(!f){bad.push('Thiếu file '+path);continue;}
    if(await sha256(await f.async('uint8array'))!==h0)bad.push('Sai mã băm '+path);
  }
  man.rows.forEach(r=>{['mau','ct'].forEach(k=>{if(!r.sha||man.files[r.dir+(k==='mau'?'mau.json':'chi-tiet.json')]!==r.sha[k])bad.push('Chỉ mục không khớp mã băm '+r.dir);});});
  return {ok:!bad.length,bad,man,zip,sha:await sha256(u8),size:u8.length};
}

/* ---- chuyển sang lưu giữ: ghi chỉ mục, xóa dữ liệu nặng, đóng kỳ nếu hết mẫu */
async function arcCommit(p,v,prog){
  prog=prog||(()=>{});
  if(!v||!v.ok||v.man.per!==p)throw new Error('Gói chưa được kiểm tra hoặc không đúng kỳ '+p+'.');
  const man=v.man,ok=[],skip=[];
  prog('Đang đối chiếu lại từng mẫu với gói ...');
  await arPool(man.rows,6,async r=>{
    const cur=await Data.get(sp(r.i));
    if(!cur){skip.push([r.b||r.m,'không còn trên hệ thống']);return;}
    const det=(await Data.get(dp(r.i)))||{id:r.i};
    if(await arSha(arStable(cur))!==r.sha.mau||await arSha(arStable(det))!==r.sha.ct){skip.push([r.b||r.m,'đã thay đổi sau khi tạo gói, giữ lại trực tuyến']);return;}
    ok.push(r);
  });
  const runId=Date.now().toString(36),at=new Date().toISOString(),byYm={};
  ok.forEach(r=>{const ym=arYm(r.b,r.m)||p.slice(0,4);(byYm[ym]=byYm[ym]||[]).push(r);});
  prog('Đang ghi chỉ mục lưu giữ ...');
  for(const [ym,arr] of Object.entries(byYm))
    for(let i=0;i<arr.length;i+=150)
      await Data.set('archive/ix_'+ym+'_'+p+'_'+runId+'_'+(i/150),{ym,per:p,zip:man.goi+'.zip',at,e:arr.slice(i,i+150).map(r=>({i:r.i,b:r.b,m:r.m,l:r.l,k:r.k,c:r.c,d:r.d,h:r.h,n:r.n,t:r.t}))});
  if(ok.length)await Data.set('archive/run_'+p+'_'+runId,{per:p,zip:man.goi+'.zip',so_mau:ok.length,at,by:SESSION?SESSION.name:'',sha_zip:v.sha||'',bytes:v.size||0});
  let n=0;
  await arPool(ok,6,async r=>{await Data.del(bp(r.i));await Data.del(dp(r.i));await Data.del(sp(r.i));DET.delete(r.i);prog('Đang xóa khỏi hệ thống '+(++n)+'/'+ok.length+' ...');});
  const left=await Data.ids('samples_'+p);let closed=false;
  if(!left.length){const cfg=Object.assign({},S.perCfg||{});delete cfg.id;cfg.open=openPeriods().filter(x=>x!==p);await Data.set('config/periods',cfg);closed=true;}
  AR.ix=null;AR.ids=null;
  return {archived:ok.length,skip,closed,runId,left:left.length};
}

/* ---- tra cứu chỉ mục lưu giữ theo số báo cáo (QR) */
const AR={ix:null,runs:[],loading:false,err:false,q:'',max:100,ids:null,idsAt:0};
async function arIds(){if(AR.ids&&Date.now()-AR.idsAt<30000)return AR.ids;AR.ids=await Data.ids('archive');AR.idsAt=Date.now();return AR.ids;}
const AR_LK=new Map();
function arLookup(slug){
  if(AR_LK.has(slug))return AR_LK.get(slug);
  const pr=(async()=>{
    const m=/^tc-BC(\d{2})-(\d{2})-/.exec(slug||'');if(!m)return null;
    const pre='ix_'+m[1]+m[2]+'_',ids=(await arIds()).filter(i=>i.startsWith(pre));
    for(const id of ids){const d=await Data.get('archive/'+id);const e=d&&(d.e||[]).find(x=>x.b&&bcSlug(x.b)===slug);if(e)return Object.assign({},e,{per:d.per,z:d.zip});}
    return null;
  })().catch(e=>{console.warn(e);return null;});
  AR_LK.set(slug,pr);pr.then(v=>{if(!v)setTimeout(()=>AR_LK.delete(slug),15000);});return pr;
}
async function arLoadAll(force){
  if(AR.loading||(AR.ix&&!force))return;AR.loading=true;AR.err=false;
  try{
    AR.ids=null;const ids=await arIds(),ix=[],runs=[];
    await arPool(ids,6,async id=>{const d=await Data.get('archive/'+id);if(!d)return;
      if(id.startsWith('ix_'))(d.e||[]).forEach(e=>ix.push(Object.assign({},e,{per:d.per,z:d.zip})));
      else if(id.startsWith('run_'))runs.push(d);});
    ix.sort((a,b)=>(b.d||'')<(a.d||'')?-1:(b.d||'')>(a.d||'')?1:0);AR.ix=ix;AR.runs=runs.sort((a,b)=>(b.at||'')<(a.at||'')?-1:1);
  }catch(e){console.warn(e);AR.ix=[];AR.err=true;toast('Không đọc được chỉ mục lưu giữ.','bad');}
  finally{AR.loading=false;}
  if((location.hash||'').replace(/^#/,'')==='luu-tru')render();
}

/* ---- giao diện */
let arTab='online';
function arTabBar(){
  const due=arcDueCount();
  return h('div',{class:'tabs',role:'tablist',style:'margin-bottom:12px'},[['online','Đang lưu trực tuyến'],['arch','Đã lưu giữ'],['pack','Gói lưu giữ'+(due?' ('+due+' đến hạn)':'')]].map(([k,l])=>
    h('button',{role:'tab','aria-selected':arTab===k,'data-tab':k,onclick:()=>{arTab=k;render();}},l)));
}
function arcPick(label,cb,cls){
  const inp=h('input',{type:'file',accept:'.zip,application/zip',style:'display:none','aria-label':label,onchange:e=>{const f=e.target.files[0];e.target.value='';if(f)cb(f);}});
  return h('span',null,h('button',{class:cls||'btn',onclick:()=>inp.click()},label),inp);
}
function arTabs(root){
  root.append(pageHead('Hồ sơ lưu trữ','Hồ sơ giữ trực tuyến '+RETAIN_DAYS+' ngày kể từ cuối kỳ nửa tháng, sau đó đóng gói thành file ZIP lưu ngoài hệ thống. Chỉ mục gọn vẫn ở lại để tra cứu bằng mã QR.'),arTabBar());
  if(arTab==='arch')arArch(root);else arPack(root);
}
function arArch(root){
  if(!AR.ix){arLoadAll();root.append(h('p',{class:'muted'},'Đang đọc chỉ mục lưu giữ ...'));return;}
  const tbl=h('div');
  const draw=()=>{
    const q=AR.q.toLowerCase(),all=AR.ix.filter(e=>!q||[e.b,e.m,e.k,e.c,matName(e.l),e.z].join(' ').toLowerCase().includes(q)),list=all.slice(0,AR.max);
    tbl.replaceChildren(list.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số báo cáo','Mã mẫu','Loại mẫu','Khách hàng','Công trình','Ngày phát hành','Gói lưu giữ',''].map(x=>h('th',null,x)))),
      h('tbody',null,list.map(e=>h('tr',null,h('td',null,code(e.b||'(từ chối)')),h('td',null,code(e.m)),h('td',null,matName(e.l)),h('td',null,e.k),h('td',null,e.c),h('td',{class:'small'},fd(e.d)),h('td',{class:'small mono'},e.z),
        h('td',{class:'r'},h('button',{class:'btn sm','data-act':'arc-row',onclick:()=>arcRowModal(e)},'Xem'))))))):
      emptyState(AR.ix.length?'Không tìm thấy hồ sơ':'Chưa có hồ sơ nào được lưu giữ','Hồ sơ vào đây sau khi Trưởng phòng TN đóng gói kỳ đã quá '+RETAIN_DAYS+' ngày.'));
    if(all.length>AR.max)tbl.append(h('button',{class:'btn',style:'margin-top:10px',onclick:()=>{AR.max+=100;draw();}},'Hiển thị thêm ('+(all.length-AR.max)+' hồ sơ)'));
  };
  const search=h('input',{type:'text',placeholder:'Tìm theo số báo cáo, mã mẫu, khách, công trình',value:AR.q,oninput:e=>{AR.q=e.target.value;AR.max=100;draw();},style:'max-width:380px','aria-label':'Tìm hồ sơ lưu giữ'});
  root.append(h('div',{class:'card flat row',style:'justify-content:space-between'},h('div',null,h('b',null,AR.ix.length+' hồ sơ đã lưu giữ · '+AR.runs.length+' gói'),h('div',{class:'muted small'},'Đây là chỉ mục gọn. Muốn xem toàn bộ phiếu, mở lại file ZIP đã lưu.')),
    h('div',{class:'row'},search,arcPick('Mở file ZIP lưu giữ',f=>arOpenZip(f),'btn primary'))),tbl);
  if(AR.runs.length)root.append(h('div',{class:'card'},h('h3',null,'Các gói đã lưu giữ'),h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Kỳ','Tên gói','Số hồ sơ','Dung lượng','Ngày lưu giữ','Người thực hiện','SHA-256 của gói'].map(x=>h('th',null,x)))),
    h('tbody',null,AR.runs.map(r=>h('tr',null,h('td',null,r.per),h('td',{class:'mono small'},r.zip),h('td',null,String(r.so_mau)),h('td',null,kbOf(r.bytes||0)),h('td',{class:'small'},fdt(r.at)),h('td',null,r.by),h('td',{class:'mono small'},(r.sha_zip||'').slice(0,20)+'…'))))))));
  draw();
}
function arcRowModal(e){
  const m=openModal({title:'Số báo cáo '+(e.b||'(từ chối)'),sub:'Hồ sơ đã chuyển sang lưu giữ',
    body:[kv([['Mã mẫu',e.m],['Loại mẫu',matName(e.l)],['Khách hàng',e.k],['Công trình',e.c],['Ngày phát hành',fd(e.d)],['Số chỉ tiêu',String(e.n)],['SHA-256 phiếu',e.h],['Kỳ',e.per],['Gói lưu giữ',e.z]]),
      h('p',{class:'small muted'},'Chọn đúng file '+e.z+' (hoặc bản sao) để xem phiếu, số liệu gốc, nhật ký và tải lại phiếu A4.')],
    actions:[arcPick('Chọn file ZIP để xem phiếu',f=>{m.close();arOpenZip(f,e.i);},'btn primary'),h('button',{class:'btn',onclick:()=>m.close()},'Đóng')]});
}
function arcPublicCard(e){
  const kids=[h('h2',null,'Số báo cáo '+e.b),h('div',null,tonePill('Hồ sơ đã chuyển sang lưu giữ','info')),
    kv([['Mã mẫu',e.m],['Loại mẫu',matName(e.l)],['Khách hàng',e.k],['Công trình',e.c],['Ngày phát hành',fd(e.d)],['Số chỉ tiêu',String(e.n)],['SHA-256 phiếu',e.h],['Gói lưu giữ',e.z]]),
    h('p',{class:'muted small'},'Phiếu này đã quá thời hạn giữ trực tuyến nên được đóng gói lưu giữ. Mã băm trên là mã niêm phong lúc phát hành, đối chiếu được với mã in trên phiếu giấy. Muốn xem toàn bộ phiếu, hãy liên hệ phòng thí nghiệm.')];
  if(SESSION)kids.push(h('div',{class:'row'},arcPick('Mở file ZIP lưu giữ để xem toàn bộ phiếu',f=>arOpenZip(f,e.i),'btn primary')));
  return kids;
}
async function arOpenZip(file,focusId){
  try{
    const v=await arcRead(new Uint8Array(await file.arrayBuffer()));
    if(!v.ok){const m=openModal({title:'Gói lưu giữ không hợp lệ',body:[h('div',{class:'banner','data-tone':'bad'},h('div',null,'File này không đạt kiểm tra, không dùng để xóa hay xem hồ sơ.')),h('ul',null,v.bad.slice(0,10).map(x=>h('li',{class:'small'},x)))],actions:[h('button',{class:'btn primary',onclick:()=>m.close()},'Đóng')]});return;}
    if(focusId){const r=v.man.rows.find(x=>x.i===focusId);if(r)return arcView(v,r);toast('File này không chứa hồ sơ cần tìm. Hãy chọn đúng gói '+'(kỳ '+v.man.per+').','bad');}
    arcList(v);
  }catch(e){console.warn(e);logErr('arOpenZip',e);toast('Không đọc được file: '+(e.message||e),'bad');}
}
function arcList(v){
  const man=v.man,tb=h('div'),q={t:''};
  const draw=()=>{const t=q.t.toLowerCase(),rows=man.rows.filter(r=>!t||[r.b,r.m,r.k,r.c].join(' ').toLowerCase().includes(t));
    tb.replaceChildren(h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số báo cáo','Mã mẫu','Loại mẫu','Khách hàng','Công trình','Ngày phát hành',''].map(x=>h('th',null,x)))),
      h('tbody',null,rows.slice(0,200).map(r=>h('tr',null,h('td',null,code(r.b||'(từ chối)')),h('td',null,code(r.m)),h('td',null,matName(r.l)),h('td',null,r.k),h('td',null,r.c),h('td',{class:'small'},fd(r.d)),h('td',{class:'r'},h('button',{class:'btn sm','data-act':'arc-open',onclick:()=>arcView(v,r)},'Mở'))))))));};
  const m=openModal({title:'Gói lưu giữ kỳ '+man.per,sub:man.so_mau+' hồ sơ · tạo '+fdt(man.tao_luc)+' bởi '+man.tao_boi+' · '+man.app,wide:true,
    body:[h('div',{class:'banner','data-tone':'ok'},h('div',null,'Gói nguyên vẹn: '+Object.keys(man.files).length+' file khớp mã băm. SHA-256 của gói: '+(v.sha||'').slice(0,24)+'…')),
      h('input',{type:'text',placeholder:'Tìm trong gói',oninput:e=>{q.t=e.target.value;draw();},style:'max-width:320px','aria-label':'Tìm trong gói'}),tb],
    actions:[h('button',{class:'btn primary',onclick:()=>m.close()},'Đóng')]});
  draw();
}
async function arcView(v,r){
  try{
    const rd=async n=>JSON.parse(await v.zip.file(r.dir+n).async('string'));
    const s0=await rd('mau.json'),d=await rd('chi-tiet.json');
    if(!DET.has(s0.id))DET.set(s0.id,d);
    const s=applyDet(s0),okH=s.phieu?(await arSha(d.snap||''))===s.phieu.hash:null;
    const log=(d.log||[]).slice().sort((a,b)=>a.at<b.at?-1:1);
    const m=openModal({title:s.so_bao_cao||s.ma_mau,sub:'Mã mẫu '+s.ma_mau+' · '+((s.khach&&s.khach.ten)||'')+' · mở từ gói lưu giữ kỳ '+v.man.per,wide:true,
      body:[okH==null?h('div',{class:'banner','data-tone':'warn'},h('div',null,'Mẫu bị từ chối, không có phiếu.')):h('div',{class:'banner','data-tone':okH?'ok':'bad'},h('div',null,okH?'Nguyên vẹn: mã băm dữ liệu niêm phong khớp mã băm ghi lúc phát hành.':'KHÔNG KHỚP: dữ liệu niêm phong khác mã băm ghi lúc phát hành.')),
        h('div',{class:'card flat'},h('h3',null,'Nhật ký thao tác'),h('div',{class:'tbl-wrap'},h('table',null,h('tbody',null,log.map(a=>h('tr',null,h('td',{class:'mono'},fdt(a.at)),h('td',null,a.by),h('td',null,a.action),h('td',{class:'muted'},a.note))))))),
        s.phieu?h('div',{class:'card flat'},h('h3',null,'Phiếu kết quả'),renderPhieu(s)):null,
        h('div',{class:'card flat'},h('h3',null,'Số liệu gốc'),rawTable(s.nop&&s.nop.raw),h('p',{class:'small muted'},'File gốc: '+((s.nop&&s.nop.file_name)||'')+' · SHA-256 '+((s.nop&&s.nop.sha256)||'')))],
      actions:[h('button',{class:'btn primary','data-act':'arc-phieu',disabled:!s.phieu,onclick:()=>downloadPhieu(s)},'Tải phiếu A4 (Excel)'),
        h('button',{class:'btn','data-act':'arc-goc',onclick:async()=>{const f=v.zip.file(r.dir+'file-goc.xlsx');if(f)saveBytes((s.so_bao_cao||s.ma_mau)+'_'+((s.nop&&s.nop.file_name)||'file-goc.xlsx'),await f.async('uint8array'));else toast('Gói không có file gốc của hồ sơ này.','bad');}},'Tải file Excel gốc'),
        h('button',{class:'btn primary',onclick:()=>m.close()},'Đóng')]});
  }catch(e){console.warn(e);logErr('arcView',e);toast('Không mở được hồ sơ từ gói: '+(e.message||e),'bad');}
}
function arPack(root){
  if(!hasRole('tp')){root.append(emptyState('Chỉ Trưởng phòng TN được lưu giữ','Cần tài khoản Trưởng phòng TN để đóng gói và chuyển hồ sơ sang lưu giữ.'));return;}
  if(!AR.ix)arLoadAll();
  const per=arcPeriods(),cut=addDays(todayISO(),-RETAIN_DAYS);
  root.append(h('div',{class:'card flat'},h('b',null,'Quy trình 3 bước'),h('ol',{class:'small',style:'margin:6px 0 0 18px'},
    h('li',null,'Tạo gói ZIP và lưu file ra máy (sao lưu thêm một bản sang ổ khác).'),h('li',null,'Chọn lại chính file ZIP vừa lưu để app kiểm tra mã băm từng file.'),h('li',null,'Chỉ khi gói đạt, app mới ghi chỉ mục gọn và xóa hồ sơ nặng khỏi hệ thống.')),
    h('p',{class:'small muted',style:'margin-top:8px'},'Mốc hiện tại: kỳ có ngày cuối trước '+fd(cut)+' đã đến hạn. Mẫu chưa phát hành hoặc từ chối trong kỳ được giữ lại trực tuyến.')));
  root.append(h('div',{class:'card'},h('h3',null,'Các kỳ đang giữ trực tuyến'),per.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Kỳ','Từ ngày','Đến ngày','Số mẫu','Xong (phát hành, từ chối)','Chưa xong','Đến hạn từ','Trạng thái',''].map(x=>h('th',null,x)))),
    h('tbody',null,per.map(x=>{const due=perDue(x.p);return h('tr',{'data-per':x.p},h('td',null,code(x.p)),h('td',null,fd(perStart(x.p))),h('td',null,fd(perEnd(x.p))),h('td',null,String(x.n)),h('td',null,String(x.fin)),h('td',null,String(x.n-x.fin)),h('td',null,fd(perDueFrom(x.p))),
      h('td',null,due?(x.fin?tonePill('Đến hạn','warn'):tonePill('Đến hạn, chưa có mẫu xong','neutral')):tonePill('Còn '+Math.max(0,Math.round((new Date(perDueFrom(x.p))-new Date(todayISO()))/864e5))+' ngày','ok')),
      h('td',{class:'r'},h('button',{class:'btn sm primary','data-act':'arc-start',disabled:!due||!x.fin,onclick:()=>arcWizard(x.p)},'Lưu giữ kỳ này')));})))):
    emptyState('Chưa có kỳ nào','Chưa có mẫu mới (chia kỳ) trong dữ liệu đang mở.')));
  if(AR.runs.length)root.append(h('div',{class:'card'},h('h3',null,'Gói đã tạo'),h('div',{class:'tbl-wrap'},h('table',null,h('tbody',null,AR.runs.slice(0,10).map(r=>h('tr',null,h('td',null,r.per),h('td',{class:'mono small'},r.zip),h('td',null,r.so_mau+' hồ sơ'),h('td',{class:'small'},fdt(r.at)),h('td',null,r.by))))))));
}
function arcWizard(p){
  const st={built:null,ver:null,busy:false,armed:false,done:false};
  const per=arcPeriods().find(x=>x.p===p)||{n:0,fin:0};
  const optPhieu=h('input',{type:'checkbox',id:'arc-phieu-opt'}),prog1=h('div',{class:'small mono muted','data-role':'prog1'}),res2=h('div',{class:'small','data-role':'res2'}),prog3=h('div',{class:'small mono muted','data-role':'prog3'});
  const b1=h('button',{class:'btn primary','data-act':'arc-build'},'Tạo và tải gói ZIP');
  const b3=h('button',{class:'btn danger','data-act':'arc-commit',disabled:true},'Chuyển sang lưu giữ và xóa khỏi hệ thống');
  b1.onclick=async()=>{
    if(st.busy||st.done)return;st.busy=true;b1.disabled=true;
    try{
      const o=await arcBuild(p,{phieu:optPhieu.checked},t=>{prog1.textContent=t;});
      const saved=await saveBytes(o.name,o.bytes);st.built=o;
      prog1.textContent=(saved?'Đã tạo và lưu ':'Đã tạo nhưng bạn chưa lưu ')+o.name+' ('+kbOf(o.bytes.length)+', '+o.man.so_mau+' hồ sơ'+(o.man.con_lai_truc_tuyen?', còn '+o.man.con_lai_truc_tuyen+' mẫu chưa xong giữ trực tuyến':'')+'). SHA-256 '+o.sha.slice(0,20)+'…'+(saved?' Hãy chép sang nơi an toàn rồi làm bước 2.':' Bấm lại để lưu file.');
    }catch(e){console.warn(e);logErr('arcBuild',e);prog1.textContent='Lỗi: '+(e.message||e);}
    finally{st.busy=false;b1.disabled=false;}
  };
  const pick=arcPick('Chọn lại file ZIP đã lưu',async f=>{
    if(st.busy||st.done)return;res2.textContent='Đang kiểm tra '+f.name+' ...';st.ver=null;b3.disabled=true;
    try{
      const v=await arcRead(new Uint8Array(await f.arrayBuffer()));
      if(!v.ok){res2.replaceChildren(h('b',{style:'color:var(--bad)'},'Không đạt: '),v.bad.slice(0,6).join('; '));return;}
      if(v.man.per!==p){res2.replaceChildren(h('b',{style:'color:var(--bad)'},'Không đạt: '),'gói này của kỳ '+v.man.per+', cần kỳ '+p+'.');return;}
      st.ver=v;res2.replaceChildren(h('b',{style:'color:var(--ok,#2a7)'},'Đạt: '),Object.keys(v.man.files).length+' file khớp mã băm, '+v.man.so_mau+' hồ sơ, '+kbOf(v.size)+'. SHA-256 '+v.sha.slice(0,20)+'…');b3.disabled=false;
    }catch(e){console.warn(e);res2.textContent='Lỗi: '+(e.message||e);}
  },'btn');
  b3.onclick=async()=>{
    if(!st.ver||st.busy||st.done)return;
    if(!st.armed){st.armed=true;b3.textContent='Bấm lần nữa để xóa '+st.ver.man.so_mau+' hồ sơ khỏi hệ thống';setTimeout(()=>{if(!st.done&&!st.busy){st.armed=false;b3.textContent='Chuyển sang lưu giữ và xóa khỏi hệ thống';}},7000);return;}
    st.busy=true;b3.disabled=true;b1.disabled=true;
    try{
      const r=await arcCommit(p,st.ver,t=>{prog3.textContent=t;});st.done=true;
      prog3.textContent='Xong: đã lưu giữ '+r.archived+' hồ sơ'+(r.skip.length?', bỏ qua '+r.skip.length+' ('+r.skip.slice(0,3).map(x=>x[0]+': '+x[1]).join('; ')+')':'')+(r.closed?'. Kỳ '+p+' đã đóng, không còn dữ liệu trực tuyến.':'. Kỳ '+p+' còn '+r.left+' mẫu trực tuyến.');
      b3.textContent='Đã hoàn tất';toast('Đã chuyển '+r.archived+' hồ sơ sang lưu giữ.','ok');arLoadAll(true);
    }catch(e){console.warn(e);logErr('arcCommit',e);prog3.textContent='Lỗi: '+(e.message||e)+'. Dữ liệu chưa mất; kiểm tra rồi làm lại bước 3.';st.busy=false;b3.disabled=false;st.armed=false;b3.textContent='Chuyển sang lưu giữ và xóa khỏi hệ thống';}
    finally{st.busy=false;}
  };
  const m=openModal({title:'Lưu giữ kỳ '+p,sub:fd(perStart(p))+' đến '+fd(perEnd(p))+' · '+per.fin+' hồ sơ xong trên '+per.n+' mẫu',wide:true,sticky:true,
    body:[h('div',{class:'card flat stack'},h('h3',null,'Bước 1. Tạo gói ZIP'),h('label',{class:'chk','for':'arc-phieu-opt'},optPhieu,h('span',null,'Kèm file phiếu A4 (Excel) từng báo cáo, chậm hơn nhưng mở được ngay bằng Excel')),h('div',{class:'row'},b1),prog1),
      h('div',{class:'card flat stack'},h('h3',null,'Bước 2. Kiểm tra lại file đã lưu'),h('div',{class:'row'},pick),res2),
      h('div',{class:'card flat stack'},h('h3',null,'Bước 3. Chuyển sang lưu giữ'),h('p',{class:'small muted'},'Sau bước này kho chỉ còn chỉ mục gọn. Muốn xem lại phiếu phải mở file ZIP. Mỗi mẫu được đọc lại và so với gói trước khi xóa; mẫu nào đã đổi sẽ được giữ lại.'),h('div',{class:'row'},b3),prog3)],
    actions:[h('button',{class:'btn primary',onclick:()=>{m.close();render();}},'Đóng')]});
}
