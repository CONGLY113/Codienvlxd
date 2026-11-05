async function mauSave(patch){const doc=Object.assign({b64:'',name:'',at:'',by:'',hash:'',opts:{}},S.mau||{},patch);delete doc.id;
  const ok=await safe(()=>Data.set('config/mau_kq',doc).then(()=>true),'Không lưu được biểu mẫu.');if(ok){S.mau=doc;}return ok;}
const MAU_CAN=()=>hasRole('tp')||hasRole('ql')||hasRole('tn');
const MAU_ACT={tai_len:'Nạp bản chỉnh',khoi_phuc:'Khôi phục bản cũ',ve_goc:'Quay về bản gốc'};
/* ghi một lần đổi biểu mẫu: bản hiện hành (config/mauf_*), lịch sử (mauh) và nội dung từng bản (mauv) */
async function mauApply(code,u8,o){
  o=o||{};if(!SESSION)return false;
  const at=new Date().toISOString(),gocLike=o.action==='ve_goc';
  const hs=(S.mauh||[]).filter(x=>x.code===code);const rev=hs.reduce((m,x)=>Math.max(m,x.rev||0),0)+1;
  const prev=mauOv(code);const hid='h_'+code+'_'+rev+'_'+rid();
  const hash=gocLike?'goc':await sha256(u8);
  const meta={code,ten:mauName(code),rev,action:o.action||'tai_len',name:o.name||'',size:gocLike?0:u8.length,hash,prev_hash:prev?(prev.hash||'legacy'):'goc',at,by:SESSION.name,by_id:SESSION.id,note:o.note||'',chg:(o.chg||[]).slice(0,10),from_rev:o.from_rev||0};
  const ok=await safe(async()=>{
    if(!gocLike)await Data.set('mauv/'+hid,{code,rev,b64:u8ToB64(u8)});
    await Data.set('config/mauf_'+code,Object.assign({},meta,{hid,b64:gocLike?'':u8ToB64(u8)}));
    await Data.set('mauh/'+hid,meta);return true;},'Không lưu được biểu mẫu.');
  if(!ok)return false;
  if(code==='CAT_XD'&&S.mau&&S.mau.b64)await mauSave({b64:'',name:'',hash:''});
  await logAudit((MAU_ACT[meta.action]||'Chỉnh')+' biểu mẫu '+mauName(code)+' (bản '+rev+')',(o.note||'')+(meta.chg.length?' · '+meta.chg.join('; '):''));
  return rev;
}
async function mauBytes(code,hid){ /* nội dung một bản trong lịch sử */
  const d=await safe(()=>Data.get('mauv/'+hid));return d&&d.b64?b64ToU8(d.b64):null;}
let MAU_Q='',MAU_TARGET=null;
function mauCur(code){const o=mauOv(code);return o?(o.legacy?'Tùy chỉnh (bản nạp trước 0.21.0)':'Bản chỉnh số '+o.rev):('Bản gốc '+mauFormOf(code).ver);}
function mauHistory(code){
  const canEdit=MAU_CAN();const list=(S.mauh||[]).filter(x=>x.code===code).sort((a,b)=>(b.rev||0)-(a.rev||0));const cur=mauOv(code);
  const rows=list.map(x=>{const isCur=cur&&cur.hid===x.id;
    return h('tr',null,h('td',{class:'num'},'#'+x.rev,isCur?h('span',{class:'pill','data-tone':'ok',style:'margin-left:6px'},'Đang dùng'):(!cur&&x.action==='ve_goc'&&list[0]===x?h('span',{class:'pill','data-tone':'ok',style:'margin-left:6px'},'Đang dùng'):null)),
      h('td',null,fdt(x.at)),h('td',null,x.by||''),h('td',null,MAU_ACT[x.action]||x.action,x.from_rev?(' #'+x.from_rev):''),
      h('td',null,h('div',null,x.note||''),(x.chg&&x.chg.length)?h('ul',{class:'muted small',style:'margin:4px 0 0 16px;padding:0'},x.chg.map(c=>h('li',null,c))):null),
      h('td',{class:'mono small'},x.name?x.name+' · '+Math.round((x.size||0)/1024)+' KB':'',h('br'),h('span',{class:'muted'},x.hash&&x.hash!=='goc'?x.hash.slice(0,10):'')),
      h('td',null,h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},
        x.action!=='ve_goc'?h('button',{class:'btn sm',onclick:async()=>{const u=await mauBytes(code,x.id);if(!u)return toast('Không đọc được nội dung bản này.','bad');await saveBytes(mauFile(code,'ban',x.rev),u);}},'Tải'):null,
        canEdit&&!isCur&&x.action!=='ve_goc'?h('button',{class:'btn sm',onclick:async e=>{e.currentTarget.disabled=true;const u=await mauBytes(code,x.id);if(!u){toast('Không đọc được nội dung bản này.','bad');e.currentTarget.disabled=false;return;}
          const r=await mauApply(code,u,{action:'khoi_phuc',name:x.name,note:'Khôi phục bản #'+x.rev,from_rev:x.rev});if(r){toast('Đã khôi phục bản #'+x.rev+'.');m.close();render();}else e.currentTarget.disabled=false;}},'Khôi phục'):null)));});
  const gocRow=h('tr',null,h('td',{class:'num'},'Gốc',!cur?h('span',{class:'pill','data-tone':'ok',style:'margin-left:6px'},'Đang dùng'):null),h('td',null,'Phát hành cùng hệ thống'),h('td',null,'Hệ thống'),h('td',null,'Bản gốc '+mauFormOf(code).ver),h('td',null,''),h('td',null,''),
    h('td',null,h('button',{class:'btn sm',onclick:()=>saveBytes(mauFile(code,'goc'),b64ToU8(origB64(code)))},'Tải')));
  const m=openModal({title:'Lịch sử biểu mẫu: '+mauName(code),sub:mauFormOf(code).code+' · mọi lần nạp, khôi phục, quay về bản gốc đều được ghi lại, không xóa được.',wide:true,
    body:h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Bản','Thời gian','Người thực hiện','Thao tác','Nội dung chỉnh sửa','File',''].map(x=>h('th',null,x)))),h('tbody',null,rows,gocRow)))});
  return m;
}
function mauCheckDlg(code,u8,fname){
  const canEdit=MAU_CAN();let ready=false;
  const note=h('textarea',{rows:'3',placeholder:'Ví dụ: Mở rộng cột Kết quả, đổi cỡ chữ tiêu đề, thêm dòng ghi chú mẫu',style:'width:100%',id:'mau-note'});
  const body=h('div',{class:'stack'},h('p',{class:'muted'},'Đang kiểm tra '+fname+'…'));
  const btn=h('button',{class:'btn primary',disabled:true,onclick:async e=>{
    const n=note.value.trim();if(n.length<3){toast('Hãy ghi nội dung chỉnh sửa (ít nhất 3 ký tự) để lưu vết.','bad');note.focus();return;}
    e.currentTarget.disabled=true;
    const prev=b64ToU8(activeB64(code));
    const chg=await mauDiff(prev,u8,code);
    const r=await mauApply(code,u8,{action:'tai_len',name:fname,note:n,chg});
    if(r){toast('Đã áp dụng biểu mẫu '+mauName(code)+' (bản #'+r+'). Phiếu tải từ giờ dùng bản này.');m.close();render();}else e.currentTarget.disabled=false;}},'Áp dụng biểu mẫu này');
  const m=openModal({title:'Nạp biểu mẫu: '+mauName(code),sub:mauFormOf(code).code+' · '+fname,wide:true,body,actions:[h('button',{class:'btn ghost',onclick:()=>m.close()},'Hủy'),btn]});
  (async()=>{
    const v=await validateTemplate(u8,code);const chg=v.E.length?[]:await mauDiff(b64ToU8(activeB64(code)),u8,code);
    const li=(L,tone,tx)=>h('div',{class:'row',style:'align-items:flex-start;gap:8px'},h('span',{class:'pill','data-tone':tone},L),h('span',null,tx));
    body.replaceChildren(...[h('h3',null,v.E.length?'Không đạt, chưa được nạp ('+v.E.length+' lỗi)':'Đạt, có thể áp dụng'),
      ...v.E.map(x=>li('Lỗi','bad',x)),...v.W.map(x=>li('Cảnh báo','warn',x)),
      v.E.length?null:h('div',{class:'stack'},h('b',null,'Khác với bản đang dùng'),chg.length?h('ul',{style:'margin:0 0 0 18px;padding:0'},chg.map(c=>h('li',null,c))):h('p',{class:'muted small'},'Không phát hiện khác biệt trên Phieu_KQ.')),
      v.E.length?null:h('div',{class:'field'},h('label',{for:'mau-note'},'Nội dung chỉnh sửa (bắt buộc, lưu vào lịch sử)'),note),
      canEdit?null:h('span',{class:'hint'},'Bạn chưa có quyền nạp biểu mẫu.')].filter(Boolean));
    btn.disabled=!!v.E.length||!canEdit;ready=!v.E.length;
  })();
  return m;
}
pages['mau-bieu']={render(root){
  const canEdit=MAU_CAN();const o=mauOpts();
  const fIn=h('input',{type:'file',accept:'.xlsx',hidden:true,id:'mau-file',onchange:async e=>{const f=e.target.files[0];e.target.value='';if(!f||!MAU_TARGET)return;
    const u8=new Uint8Array(await f.arrayBuffer());mauCheckDlg(MAU_TARGET,u8,f.name);}});
  const q=h('input',{type:'search',id:'mau-q',placeholder:'Tìm loại mẫu hoặc mã biểu mẫu',value:MAU_Q,'aria-label':'Tìm biểu mẫu',style:'max-width:320px',oninput:e=>{MAU_Q=e.target.value;draw();}});
  const tbl=h('div');
  const nchg=c=>(S.mauh||[]).filter(x=>x.code===c).length;
  function draw(){
    const k=bkNorm(MAU_Q.trim());
    const codes=mauCodes().filter(c=>!k||bkNorm(mauName(c)+' '+mauFormOf(c).code+' '+c).includes(k));
    tbl.replaceChildren(h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Loại mẫu','Mã biểu mẫu','Đang dùng','Chỉnh gần nhất','Thao tác'].map(x=>h('th',null,x)))),
      h('tbody',null,codes.map(c=>{const ov=mauOv(c),f=mauFormOf(c),n=nchg(c);
        return h('tr',null,h('td',null,h('b',null,mauName(c))),h('td',{class:'mono'},f.code),
          h('td',null,ov?h('span',{class:'pill','data-tone':'warn'},mauCur(c)):h('span',{class:'pill','data-tone':'neutral'},mauCur(c))),
          h('td',{class:'small'},ov&&ov.at?(fdt(ov.at)+' · '+(ov.by||'')):h('span',{class:'muted'},'Chưa chỉnh')),
          h('td',null,h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},
            h('button',{class:'btn sm',onclick:()=>saveBytes(mauFile(c,ov?'dang_dung':'goc'),b64ToU8(activeB64(c)))},ov?'Tải bản đang dùng':'Tải biểu mẫu'),
            ov?h('button',{class:'btn sm',onclick:()=>saveBytes(mauFile(c,'goc'),b64ToU8(origB64(c)))},'Tải bản gốc'):null,
            h('button',{class:'btn sm primary',disabled:!canEdit,onclick:()=>{MAU_TARGET=c;fIn.click();}},'Nạp bản chỉnh'),
            h('button',{class:'btn sm',onclick:()=>mauHistory(c)},'Lịch sử'+(n?' ('+n+')':'')),
            ov&&canEdit?h('button',{class:'btn sm ghost',onclick:()=>{const ok=h('button',{class:'btn primary',onclick:async()=>{ok.disabled=true;const r=await mauApply(c,new Uint8Array(0),{action:'ve_goc',name:'',note:nt.value.trim()||'Quay về bản gốc'});if(r){toast('Đã quay về biểu mẫu gốc.');mm.close();render();}else ok.disabled=false;}},'Quay về bản gốc');
              const nt=h('input',{type:'text',placeholder:'Lý do (không bắt buộc)',style:'width:100%'});
              const mm=openModal({title:'Quay về bản gốc: '+mauName(c),sub:'Bản đang dùng vẫn nằm trong lịch sử, có thể khôi phục.',body:[nt],actions:[h('button',{class:'btn ghost',onclick:()=>mm.close()},'Hủy'),ok]});}},'Dùng lại bản gốc'):null)));}))),
      codes.length?null:h('p',{class:'muted',style:'padding:12px'},'Không có biểu mẫu khớp.')));
  }
  draw();
  const zipAll=async which=>{if(!window.JSZip)return toast('Chưa tải được thư viện nén.','bad');const z=new JSZip();mauCodes().forEach(c=>z.file(mauFile(c,which==='goc'?'goc':(mauOv(c)?'dang_dung':'goc')),b64ToU8(which==='goc'?origB64(c):activeB64(c))));
    await saveBytes(which==='goc'?'Bieu_mau_goc_he_thong.zip':'Bieu_mau_dang_dung.zip',await z.generateAsync({type:'uint8array',compression:'DEFLATE'}));};
  const tpU=h('input',{type:'text',id:'mau-tpu',value:o.tp_uni}),tpV=h('input',{type:'text',id:'mau-tpv',value:o.tp_vw,placeholder:'Để trống: tự đổi từ Unicode',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});
  const gdU=h('input',{type:'text',id:'mau-gdu',value:o.gd_uni}),gdV=h('input',{type:'text',id:'mau-gdv',value:o.gd_vw,placeholder:'Để trống: tự đổi từ Unicode',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});
  const sel=(i)=>{const s=h('select',{id:'mau-w'+i},[[0.75,'Nhạt'],[1.5,'Vừa'],[2.25,'Đậm'],[3.5,'Rất đậm']].map(([v,l])=>h('option',{value:v},l+' ('+v+' pt)')));s.value=String(o.w[i]);if(!s.value)s.value='1.5';return s;};
  const ws=[0,1,2].map(sel),cs=[0,1,2].map(i=>h('input',{type:'color',id:'mau-c'+i,value:o.c[i]}));
  const saveOpts=async()=>{const ok=await mauSave({opts:{tp_uni:tpU.value.trim(),tp_vw:tpV.value.trim(),gd_uni:gdU.value.trim(),gd_vw:gdV.value.trim(),w:ws.map(x=>+x.value),c:cs.map(x=>x.value)}});if(ok){await logAudit('Cập nhật tên người ký, nét biểu đồ biểu mẫu','');toast('Đã lưu. Áp dụng cho biểu mẫu tải từ giờ.');}};
  root.append(pageHead('Biểu mẫu báo cáo','Toàn bộ biểu mẫu gốc của các loại mẫu. Tải về, chỉnh bố cục sheet Phieu_KQ (phiếu kết quả), nạp lại. Hệ thống kiểm tra từng bản, ghi lại ai sửa, sửa gì, lúc nào.'),
    h('div',{class:'card stack'},h('h2',null,'1. Biểu mẫu theo loại mẫu'),
      h('p',{class:'muted small'},'Trưởng phòng, quản lý chất lượng và cán bộ thử nghiệm đều được nạp bản chỉnh. Mỗi lần nạp tạo một bản mới trong Lịch sử (không ghi đè, không xóa); bản cũ khôi phục được. Biểu mẫu nạp xong áp dụng ngay cho mọi phiếu và file Excel tải từ sau đó.'),
      h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;align-items:center'},q,h('button',{class:'btn',onclick:()=>zipAll('dang')},'Tải tất cả bản đang dùng (.zip)'),h('button',{class:'btn',onclick:()=>zipAll('goc')},'Tải tất cả bản gốc (.zip)'),h('button',{class:'btn ghost',onclick:()=>mauLog()},'Nhật ký chỉnh sửa chung')),
      fIn,tbl,
      h('p',{class:'muted small'},'Được sửa trên Phieu_KQ: độ rộng cột, chiều cao hàng, ô gộp, chữ, đường kẻ, biểu đồ, dòng ghi chú. Không được: đổi các sheet khác, xóa tên vùng, đổi công thức nối số liệu, đổi khổ A4 và lề của biểu mẫu gốc, bỏ biểu đồ, thêm macro.'),
      canEdit?null:h('span',{class:'hint'},'Chỉ trưởng phòng, quản lý chất lượng hoặc cán bộ thử nghiệm được nạp.')),
    h('div',{class:'card stack'},h('h2',null,'2. Tên người ký'),
      h('p',{class:'muted small'},'Tên người ký trong mọi biểu mẫu dùng font VNshelleyAllegro cỡ 16, bảng mã VietwareX. Hệ thống tự đổi tên Unicode sang VietwareX nên chỉ cần gõ tên tiếng Việt bình thường; tên Cán bộ thử nghiệm lấy theo người đăng nhập. Chỉ dán vào ô VietwareX khi muốn ghi đè (ví dụ tên viết khác).'),
      h('div',{class:'grid3'},h('div',{class:'field'},h('label',{for:'mau-tpu'},'Trưởng phòng TN (Unicode)'),tpU),h('div',{class:'field',style:'grid-column:span 2'},h('label',{for:'mau-tpv'},'Trưởng phòng TN (mã VietwareX)'),tpV),
        h('div',{class:'field'},h('label',{for:'mau-gdu'},'Giám đốc (Unicode)'),gdU),h('div',{class:'field',style:'grid-column:span 2'},h('label',{for:'mau-gdv'},'Giám đốc (mã VietwareX)'),gdV))),
    h('div',{class:'card stack'},h('h2',null,'3. Đường trên biểu đồ thành phần hạt'),
      h('div',{class:'grid3'},['Vùng 1: cát hạt thô','Vùng 2: cát hạt mịn','Mẫu thử'].map((l,i)=>h('div',{class:'field'},h('label',{for:'mau-w'+i},l),ws[i],cs[i]))),
      h('div',null,h('button',{class:'btn primary',disabled:!canEdit,onclick:saveOpts},'Lưu tên người ký và nét biểu đồ'))));
}};
function mauLog(){
  const list=(S.mauh||[]).slice().sort((a,b)=>String(b.at).localeCompare(String(a.at))).slice(0,200);
  openModal({title:'Nhật ký chỉnh sửa biểu mẫu',sub:'Mới nhất trước. Tối đa 200 dòng gần nhất.',wide:true,
    body:list.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Thời gian','Loại mẫu','Bản','Thao tác','Người','Nội dung'].map(x=>h('th',null,x)))),
      h('tbody',null,list.map(x=>h('tr',null,h('td',null,fdt(x.at)),h('td',null,x.ten||mauName(x.code)),h('td',{class:'num'},'#'+x.rev),h('td',null,MAU_ACT[x.action]||x.action),h('td',null,x.by||''),h('td',null,x.note||'',(x.chg&&x.chg.length)?h('div',{class:'muted small'},x.chg.join('; ')):null)))))):h('p',{class:'muted'},'Chưa có lần chỉnh sửa nào.')});
}
