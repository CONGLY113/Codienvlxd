/* ---- danh sách bảng kê, báo giá */
const dvRoomsFor=(kind)=>dvViewRooms().filter(r=>kind==='bg'||r!=='co');
const dvScope=(kind)=>{const rs=dvRoomsFor(kind);return DVS.room&&rs.includes(DVS.room)?[DVS.room]:rs;};
function dvMine(kind){
  const L=kind==='bk'?dvAllBk():dvAllBg(),rs=dvRoomsFor(kind),out=[];
  L.filter(b=>b.so&&rs.includes(b.phong)).forEach(b=>{
    if(b.trang_thai==='nhap'&&dvCanLap(b.phong))out.push([b,b.tra_lai?'Bị trả lại, cần sửa':'Nháp, chưa gửi']);
    if(kind==='bk'){if(b.trang_thai==='cho_soat'&&hasRole('tq'))out.push([b,'Chờ bạn soát xét']);
      if(b.trang_thai==='da_soat'&&hasRole('ktt'))out.push([b,'Chờ bạn duyệt']);
      if(b.trang_thai==='da_duyet'&&hasRole('tq')&&(b.pay||[]).some(p=>p.tt==='cho_tq'))out.push([b,'Có đề nghị thanh toán chờ xác nhận']);}
    else if(b.trang_thai==='cho_duyet'&&dvCanTp(b.phong))out.push([b,'Chờ bạn duyệt báo giá']);});
  return out;
}
const dvMineCount=()=>{if(!dvShow())return 0;return dvMine('bk').length+dvMine('bg').length;};
function dvList(box,kind){
  const f=DVS.fil,rs=dvScope(kind),all=(kind==='bk'?dvAllBk():dvAllBg()).filter(b=>b.so&&rs.includes(b.phong)).sort((a,b)=>a.so<b.so?1:a.so>b.so?-1:0);
  const mine=dvMine(kind).filter(([b])=>rs.includes(b.phong));
  const canNew=dvLapRooms().filter(r=>kind==='bg'||r!=='co').length>0;
  const sumT=a=>bkSum(a,b=>dvTotals(b).tt);
  box.append(h('div',{class:'pipe'},[[kind==='bk'?'Bảng kê':'Báo giá',all.length],['Tổng giá trị',fmtN(sumT(all.filter(b=>b.trang_thai!=='huy')))+' đ'],kind==='bk'?['Chưa thanh toán',fmtN(bkSum(all.filter(b=>b.trang_thai==='da_duyet'),b=>dvPay(b).con))+' đ']:['Chờ trưởng phòng duyệt',all.filter(b=>b.trang_thai==='cho_duyet').length]].map(([k,v])=>h('div',null,h('b',null,v),h('span',null,k)))));
  if(mine.length)box.append(h('div',{class:'card stack','data-sec':'work'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Việc cần làm'),h('p',{class:'muted small'},'Các '+(kind==='bk'?'bảng kê':'báo giá')+' đang chờ bạn.'))),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số','Khách hàng','Giá trị','Việc cần làm',''].map(x=>h('th',null,x)))),h('tbody',null,mine.map(([b,why])=>h('tr',null,h('td',null,b.so),h('td',null,b.khach.ten),h('td',{class:'num'},fmtN(dvTotals(b).tt)+' đ'),h('td',null,why),h('td',null,h('button',{class:'btn sm primary','data-act':'dv-open',onclick:()=>dvOpen(b)},'Mở')))))))));
  const q=h('input',{type:'text',placeholder:'Tìm số, khách hàng, mã số thuế, nội dung','aria-label':'Tìm',value:f.q,style:'width:260px;max-width:100%',oninput:e=>{f.q=e.target.value;lst.replaceChildren(...rowsOf());}});
  const st=h('select',{'aria-label':'Trạng thái',style:'width:210px',onchange:e=>{f.st=e.target.value;lst.replaceChildren(...rowsOf());}},h('option',{value:''},'Mọi trạng thái'),...Object.keys(DV_ST).filter(k=>kind==='bk'?k!=='cho_duyet':k!=='cho_soat'&&k!=='da_soat').map(k=>h('option',{value:k},DV_ST[k][0])),...(kind==='bk'?[h('option',{value:'chua'},'Đã duyệt, chưa thanh toán'),h('option',{value:'da'},'Đã thanh toán đủ')]:[]));st.value=f.st;
  const rowsOf=()=>{const t=dvNorm1(f.q);return all.filter(b=>{if(f.st==='chua')return b.trang_thai==='da_duyet'&&dvPay(b).st!=='da';if(f.st==='da')return b.trang_thai==='da_duyet'&&dvPay(b).st==='da';return !f.st||b.trang_thai===f.st;})
    .filter(b=>!t||dvNorm1([b.so,b.khach.ten,b.khach.mst,b.cong_trinh].concat(b.dong.map(l=>l.ten)).join(' ')).includes(t)).map(b=>{const sl=dvStLabel(b,kind);
      return h('tr',null,h('td',null,b.so),h('td',null,fd(b.ngay)),h('td',null,b.khach.ten),h('td',null,dvRoomName(b.phong).replace(/^Phòng (thử nghiệm )?/,''),h('div',{class:'muted small'},DV_MANG[b.mang].ten)),h('td',{class:'num'},fmtN(dvTotals(b).tt)),h('td',null,tonePill(sl[0],sl[1])),h('td',null,h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>dvOpen(b)},'Mở')));});};
  const lst=h('tbody',null,rowsOf());
  box.append(h('div',{class:'card stack'},h('div',{class:'card-h'},h('h2',null,kind==='bk'?'Bảng kê đã lập':'Báo giá đã lập'),h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},q,st,
      canNew?h('button',{class:'btn primary','data-act':'dv-new',onclick:()=>dvNewDlg(kind)},kind==='bk'?'Lập bảng kê mới':'Lập báo giá mới'):null,
      h('button',{class:'btn',disabled:!all.length,onclick:()=>csvSave(kind==='bk'?'danh-sach-bang-ke-dich-vu.csv':'danh-sach-bao-gia.csv',['Số','Ngày','Khách hàng','Mã số thuế','Phòng','Mảng','Giá trị (đ)','Trạng thái'],all.map(b=>[b.so,fd(b.ngay),b.khach.ten,b.khach.mst||'',dvRoomName(b.phong),DV_MANG[b.mang].ten,dvTotals(b).tt,dvStLabel(b,kind)[0]]))},'Tải CSV'))),
    all.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số','Ngày','Khách hàng','Phòng, mảng','Giá trị (đ)','Trạng thái',''].map(x=>h('th',null,x)))),lst)):emptyState('Chưa có '+(kind==='bk'?'bảng kê':'báo giá'),canNew?'Bấm Lập '+(kind==='bk'?'bảng kê':'báo giá')+' mới để bắt đầu.':'Chưa có dữ liệu thuộc phòng của bạn.')));
}
/* ---- công nợ theo phòng */
const dvDays=(a,b)=>Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/86400000);
function dvDebtData(room){
  const today=todayISO(),m=new Map();
  dvAllBk().filter(b=>b.phong===room&&b.trang_thai==='da_duyet').forEach(b=>{const P=dvPay(b);if(P.con<=0)return;
    const k=dvNorm1(b.khach.ten)+'|'+(b.khach.mst||''),d0=(b.duyet&&b.duyet.at||'').slice(0,10)||b.ngay,age=Math.max(0,dvDays(d0,today));
    let e=m.get(k);if(!e){e={ten:b.khach.ten,mst:b.khach.mst||'',bk:[],tong:0,da:0,con:0,b:[0,0,0,0],old:0};m.set(k,e);}
    e.bk.push({b,P,age});e.tong+=P.tt;e.da+=P.da;e.con+=P.con;e.b[age<=30?0:age<=60?1:age<=90?2:3]+=P.con;e.old=Math.max(e.old,age);});
  return Array.from(m.values()).sort((a,b)=>b.con-a.con);
}
function dvDebt(box){
  const rs=dvScope('bk');
  if(!rs.length){box.append(emptyState('Chưa có phòng','Bạn chưa thuộc phòng nào lập bảng kê dịch vụ.'));return;}
  rs.forEach(room=>{
    const L=dvDebtData(room),T=L.reduce((a,e)=>({tong:a.tong+e.tong,da:a.da+e.da,con:a.con+e.con,b:a.b.map((v,i)=>v+e.b[i])}),{tong:0,da:0,con:0,b:[0,0,0,0]}),open=new Set();
    const body=h('tbody');
    const draw=()=>body.replaceChildren(...L.flatMap(e=>{const k=e.ten+'|'+e.mst,o=open.has(k);
      const r=[h('tr',{class:'bk-grp'},h('td',null,h('button',{class:'btn sm ghost','aria-expanded':o,'aria-label':'Chi tiết '+e.ten,onclick:()=>{o?open.delete(k):open.add(k);draw();}},o?'−':'+')),h('td',null,h('b',null,e.ten),e.mst?h('div',{class:'muted small'},'MST '+e.mst):null),h('td',null,e.bk.length),h('td',{class:'num'},fmtN(e.tong)),h('td',{class:'num'},fmtN(e.da)),h('td',{class:'num'},h('b',null,fmtN(e.con))),...e.b.map(v=>h('td',{class:'num'},v?fmtN(v):'')),h('td',{class:'num'},e.old+' ngày'))];
      if(o)e.bk.forEach(x=>r.push(h('tr',null,h('td'),h('td',{colspan:'2'},x.b.so,h('div',{class:'muted small'},fd(x.b.ngay)+(x.b.cong_trinh?' · '+x.b.cong_trinh:''))),h('td',{class:'num'},fmtN(x.P.tt)),h('td',{class:'num'},fmtN(x.P.da)),h('td',{class:'num'},fmtN(x.P.con)),h('td',{colspan:'4'},x.age+' ngày'),h('td',null,h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>dvOpen(x.b)},'Mở')))));
      return r;}));
    draw();
    box.append(h('div',{class:'card stack','data-sec':'debt-'+room},h('div',{class:'card-h'},h('div',null,h('h2',null,'Công nợ · '+dvRoomName(room)),h('p',{class:'muted small'},'Bảng kê đã duyệt còn thu thiếu, nhóm theo khách hàng; tuổi nợ tính từ ngày duyệt.')),
      h('button',{class:'btn','data-act':'dv-debt-xlsx',disabled:!L.length,onclick:async()=>saveBytes('Cong_no_'+room+'_'+todayISO()+'.xlsx',await bkTblXlsx('CÔNG NỢ · '+dvRoomName(room).toUpperCase(),'Tính đến '+fd(todayISO())+' · bảng kê đã duyệt còn thu thiếu',['TT','Khách hàng','Mã số thuế','Số bảng kê','Tổng giá trị','Đã thu','Còn lại','Nợ đến 30 ngày','31–60 ngày','61–90 ngày','Trên 90 ngày'],L.map((e,i)=>[i+1,e.ten,e.mst,e.bk.length,e.tong,e.da,e.con].concat(e.b)),{widths:[6,40,16,10,16,16,16,16,16,16,16],num:[3,4,5,6,7,8,9,10],sum:[3,4,5,6,7,8,9,10],sheet:'Cong_no'}))},'Tải Excel')),
      h('div',{class:'pipe'},[['Khách còn nợ',L.length],['Tổng phải thu',fmtN(T.tong)+' đ'],['Đã thu',fmtN(T.da)+' đ'],['Còn lại',fmtN(T.con)+' đ'],['Quá 90 ngày',fmtN(T.b[3])+' đ']].map(([k,v])=>h('div',null,h('b',null,v),h('span',null,k)))),
      L.length?h('div',{class:'tbl-wrap'},h('table',{class:'bk-sum'},h('thead',null,h('tr',null,['','Khách hàng','Số BK','Tổng giá trị','Đã thu','Còn lại','≤ 30 ngày','31–60','61–90','> 90','Lâu nhất'].map(x=>h('th',null,x)))),body)):emptyState('Không có công nợ','Mọi bảng kê đã duyệt của phòng này đều đã thanh toán đủ.')));});
}
/* ---- giấy chứng nhận: tra cứu theo số */
function dvCert(box){
  const rs=dvScope('bk'),today=todayISO();
  const rows=[];dvAllBk().filter(b=>rs.includes(b.phong)&&b.trang_thai!=='huy').forEach(b=>b.dong.forEach(l=>{if(l.cc&&l.cc.so)rows.push({b,l,c:l.cc,left:l.cc.het_han?dvDays(today,l.cc.het_han):null});}));
  rows.sort((a,b)=>(a.c.het_han||'9999')<(b.c.het_han||'9999')?-1:1);
  const q=h('input',{type:'text',placeholder:'Tìm số giấy chứng nhận, khách hàng, thiết bị','aria-label':'Tìm giấy chứng nhận',value:DVS.gq,style:'width:300px;max-width:100%',oninput:e=>{DVS.gq=e.target.value;fill();}});
  const cb=h('input',{type:'checkbox','aria-label':'Chỉ sắp hết hạn',checked:DVS.cnSoon,onchange:e=>{DVS.cnSoon=e.target.checked;fill();}});
  const body=h('tbody');
  function fill(){const t=dvNorm1(DVS.gq);const L=rows.filter(r=>(!t||dvNorm1([r.c.so,r.b.khach.ten,r.l.ten,r.b.so].join(' ')).includes(t))&&(!DVS.cnSoon||(r.left!=null&&r.left<=60)));
    body.replaceChildren(...L.map(r=>h('tr',null,h('td',null,h('b',null,r.c.so)),h('td',null,fd(r.c.ngay_cap)),h('td',null,fd(r.c.het_han),r.left!=null?h('div',{class:'small'},r.left<0?tonePill('Hết hạn '+(-r.left)+' ngày','bad'):r.left<=60?tonePill('Còn '+r.left+' ngày','warn'):h('span',{class:'muted'},'Còn '+r.left+' ngày')):null),h('td',null,r.b.khach.ten),h('td',null,r.l.ten),h('td',null,r.b.so),h('td',null,r.c.lk?h('a',{href:/^https?:/i.test(r.c.lk)?r.c.lk:null,target:'_blank',rel:'noopener'},/^https?:/i.test(r.c.lk)?'Mở liên kết':r.c.lk):null),h('td',null,h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>dvOpen(r.b)},'Mở')))));
    if(!L.length)body.replaceChildren(h('tr',null,h('td',{colspan:'8',class:'muted'},'Không có giấy chứng nhận phù hợp.')));}
  fill();
  box.append(h('div',{class:'card stack','data-sec':'cert'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Giấy chứng nhận kiểm định, hiệu chuẩn'),h('p',{class:'muted small'},'Chỉ lưu số, ngày cấp, hạn hiệu lực và liên kết. Gắn số trong từng dòng bảng kê.')),
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},q,h('label',{class:'chk'},cb,' Sắp hết hạn (60 ngày)'),h('button',{class:'btn',disabled:!rows.length,onclick:()=>csvSave('giay-chung-nhan.csv',['Số','Ngày cấp','Hạn hiệu lực','Khách hàng','Nội dung','Số bảng kê','Liên kết'],rows.map(r=>[r.c.so,fd(r.c.ngay_cap),fd(r.c.het_han),r.b.khach.ten,r.l.ten,r.b.so,r.c.lk||'']))},'Tải CSV'))),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số giấy chứng nhận','Ngày cấp','Hạn hiệu lực','Khách hàng','Nội dung','Bảng kê','Liên kết',''].map(x=>h('th',null,x)))),body))));
}
/* ---- bảng giá */
function dvPrices(box){
  const rs=dvViewRooms(),mangs=rs.flatMap(r=>DV_ROOM[r].mang),adm=dvAdmin();
  if(!mangs.includes(DVS.pm))DVS.pm=mangs[0];
  const sel=h('select',{'aria-label':'Mảng',onchange:e=>{DVS.pm=e.target.value;DVS.pq='';DVS.pg='';render();}},mangs.map(m=>h('option',{value:m},DV_MANG[m].ten+' · '+dvRoomName(DV_MANG[m].room).replace(/^Phòng (thử nghiệm )?/,''))));sel.value=DVS.pm;
  const bk=dvBook(DVS.pm),meta=bk.meta||{};
  const q=h('input',{type:'text',placeholder:'Tìm trong bảng giá','aria-label':'Tìm trong bảng giá',value:DVS.pq||'',style:'width:260px;max-width:100%',oninput:e=>{DVS.pq=e.target.value;fill();}});
  const body=h('tbody');
  function fill(){const ws=dvNorm1(DVS.pq||'').split(' ').filter(Boolean),L=bk.items.filter(it=>!ws.length||ws.every(w=>dvNorm1([it.n,it.tt,it.t,it.dt,it.pv,it.u].join(' ')).includes(w)));
    body.replaceChildren(...L.slice(0,300).map(it=>h('tr',null,h('td',{class:'muted small'},it.id),h('td',{class:'small'},it.n||''),h('td',null,dvItemName(it),it.ghi?h('div',{class:'muted small'},it.ghi):null),h('td',null,it.u||''),h('td',{class:'num'},fmtN(it.g)))));
    info.textContent=L.length+' / '+bk.items.length+' mục'+(L.length>300?' (hiện 300 mục đầu)':'');}
  const info=h('div',{class:'muted small'});
  const vat=h('select',{'aria-label':'Thuế GTGT mặc định',disabled:!adm,onchange:async e=>{await safe(()=>Data.set('dv_cfg/main',Object.assign({},DV.cfg,{id:undefined,vat:+e.target.value,sua:{at:new Date().toISOString(),by:SESSION.name}})),'Không lưu được cấu hình.');toast('Đã lưu thuế GTGT mặc định. Chỉ áp dụng cho bảng kê, báo giá lập mới.');}},DV_VAT.map(v=>h('option',{value:v},v+' %')));vat.value=String(dvVatDef());
  const fileIn=h('input',{type:'file',accept:'.xlsx',hidden:true,onchange:async e=>{const f=e.target.files[0];e.target.value='';if(f)await dvImportPrices(DVS.pm,f);}});
  box.append(h('div',{class:'card stack','data-sec':'prices'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Bảng giá dịch vụ'),h('p',{class:'muted small'},'Đơn giá ban hành, chưa gồm thuế GTGT. Bảng kê đã lập giữ nguyên đơn giá lúc lập khi có giá mới.')),h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},sel,q)),
    h('div',{class:'muted small'},(meta.ten||'')+' · '+(meta.qd||'')+(meta.ngay_hl?' · hiệu lực '+fd(meta.ngay_hl):'')+' · nguồn: '+dvBookSrc(DVS.pm)+(bk.ver?' · phiên bản '+bk.ver:'')),info,
    h('div',{class:'tbl-wrap',style:'max-height:55vh;overflow:auto'},h('table',null,h('thead',null,h('tr',null,['Mã','Nhóm','Dịch vụ, chỉ tiêu','ĐVT','Đơn giá (đ)'].map(x=>h('th',null,x)))),body)),
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;align-items:center'},h('button',{class:'btn',onclick:async()=>saveBytes('Bang_gia_'+DVS.pm+'.xlsx',await dvPriceXlsx([DVS.pm]))},'Tải bảng giá (Excel có mã)'),
      adm?[h('button',{class:'btn primary','data-act':'dv-price-imp',onclick:()=>fileIn.click()},'Nhập bảng giá mới từ Excel'),DV.gia[DVS.pm]?h('button',{class:'btn ghost',onclick:()=>bkTextDlg('Khôi phục bảng giá chuẩn','Xóa bảng giá đã nhập, dùng lại bản chuẩn nhúng sẵn trong ứng dụng. Bảng kê đã lập không đổi.','Ghi chú',false,'Khôi phục',async()=>{await Data.del('dv_gia/'+DVS.pm);await logAudit('Khôi phục bảng giá chuẩn',DV_MANG[DVS.pm].ten);render();})},'Khôi phục bản chuẩn'):null,fileIn]:null,
      h('label',{class:'row',style:'gap:6px;margin-left:auto'},'Thuế GTGT mặc định',vat))));
  fill();
}
async function dvImportPrices(m,file){
  let sheets;try{sheets=await dvReadXlsx(new Uint8Array(await file.arrayBuffer()));}catch(e){toast('Không đọc được file Excel này.','bad');return;}
  const rows=sheets[Object.keys(sheets)[0]]||[],hi=rows.findIndex(r=>r.some(c=>dvNorm1(c)==='ma')&&r.some(c=>dvNorm1(c).startsWith('don gia')));
  if(hi<0){toast('Không thấy dòng tiêu đề (Mã, Dịch vụ, Đơn giá). Hãy dùng file tải từ chức năng Tải bảng giá.','bad');return;}
  const head=rows[hi],c=k=>dvFindCol(head,k),cI=c(['ma']),cN=c(['nhom']),cT=c(['tt']),cD=c(['dich vu']),cDt=c(['dac trung']),cP=c(['pham vi']),cU=c(['dvt']),cG=c(['don gia']),cK=c(['ghi chu']);
  const items=[],err=[],ids=new Set();let mx=0;
  rows.slice(hi+1).forEach((r,i)=>{if(!String(r[cD]||'').trim())return;const g=Math.round(+String(r[cG]).replace(/\./g,'').replace(',','.'));if(!(g>0)){err.push('Dòng '+(hi+i+2)+': đơn giá không hợp lệ.');return;}
    let id=String(r[cI]||'').trim();if(id){if(ids.has(id)){err.push('Dòng '+(hi+i+2)+': mã '+id+' bị trùng.');return;}ids.add(id);const k=id.match(/(\d+)$/);if(k)mx=Math.max(mx,+k[1]);}
    items.push({id,n:String(r[cN]||'').trim(),tt:String(r[cT]||'').trim(),t:String(r[cD]).trim(),dt:String(r[cDt]||'').trim(),pv:String(r[cP]||'').trim(),u:String(r[cU]||'').trim(),g,ghi:String(r[cK]||'').trim()});});
  items.forEach(it=>{if(!it.id){mx++;it.id=m+'-'+String(mx).padStart(4,'0');}Object.keys(it).forEach(k=>{if(it[k]===''||it[k]==null)delete it[k];});});
  if(err.length||!items.length){openModal({title:'Không nhập được bảng giá',body:[h('div',{class:'banner','data-tone':'bad'},h('div',null,err.slice(0,20).map(e=>h('div',null,e)),!items.length?h('div',null,'File không có dòng hợp lệ.'):null))],actions:[]});return;}
  const old=dvBook(m),oldN=old.items.length,qd=h('input',{type:'text',value:'',placeholder:'Ví dụ: Quyết định số .../QĐ-KTTĐC ngày ...','aria-label':'Căn cứ ban hành'}),hl=h('input',{type:'date','aria-label':'Ngày hiệu lực'});
  const dlg=openModal({title:'Nhập bảng giá mới · '+DV_MANG[m].ten,sub:'Bảng giá hiện tại có '+oldN+' mục; file mới có '+items.length+' mục. Bảng kê, báo giá đã lập giữ nguyên đơn giá.',body:[bkF('Căn cứ ban hành',qd),bkF('Ngày hiệu lực',hl)],actions:[h('button',{class:'btn',onclick:()=>dlg.close()},'Đóng'),h('button',{class:'btn primary','data-act':'price-ok',onclick:async()=>{
    const doc={meta:{ten:(old.meta||{}).ten||DV_MANG[m].ten,qd:qd.value.trim()||(old.meta||{}).qd||'',ngay_hl:hl.value},ver:(old.ver||0)+1,items,sua:{at:new Date().toISOString(),by:SESSION.name}};
    const ok=await safe(()=>Data.set('dv_gia/'+m,doc).then(()=>true),'Không lưu được bảng giá.');if(ok){await logAudit('Nhập bảng giá '+DV_MANG[m].ten,items.length+' mục · '+doc.meta.qd);toast('Đã lưu bảng giá mới ('+items.length+' mục).');dlg.close();render();}}},'Lưu bảng giá')]});
}
/* ---- trang */
pages['dich-vu']={render(root){
  if(DVS.uid!==(SESSION&&SESSION.id)){DVS.uid=SESSION&&SESSION.id;DVS.draft=null;DVS.dirty=false;DVS.tab='bk';DVS.room='';}
  dvWatchInit();
  const bkOk=dvRoomsFor('bk').length>0,tabs=[].concat(bkOk?[['bk','Bảng kê']]:[],[['bg','Báo giá']],bkOk?[['no','Công nợ'],['cn','Giấy chứng nhận']]:[],[['gia','Bảng giá']]);
  if(!tabs.some(t=>t[0]===DVS.tab))DVS.tab=tabs[0][0];
  root.append(pageHead('Bảng kê và báo giá dịch vụ','Phòng Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường lập bảng kê trực tiếp; cả ba phòng lập báo giá. Bảng kê: thủ quỹ soát xét, kế toán trưởng duyệt. Báo giá: trưởng phòng duyệt.'));
  const rs=dvViewRooms();
  if(rs.length>1&&!DVS.draft){const sel=h('select',{'aria-label':'Phòng',style:'max-width:320px',onchange:e=>{DVS.room=e.target.value;render();}},h('option',{value:''},'Tất cả các phòng'),rs.map(r=>h('option',{value:r},dvRoomName(r))));sel.value=DVS.room;root.append(h('div',{class:'row',style:'margin-bottom:8px'},sel));}
  root.append(h('div',{class:'tabs',role:'tablist',style:'margin-bottom:12px'},tabs.map(([k,l])=>h('button',{role:'tab','aria-selected':DVS.tab===k,'data-tab':k,onclick:()=>{
    if(DVS.draft&&DVS.dirty){toast('Lưu hoặc đóng văn bản đang sửa trước.','bad');return;}
    DVS.tab=k;DVS.draft=null;render();}},l))));
  const box=h('div',{class:'stack'});root.append(box);
  if(DVS.draft&&(DVS.tab==='bk'||DVS.tab==='bg')&&DVS.draft.kind===DVS.tab)dvEditor(box);
  else if(DVS.tab==='bk'||DVS.tab==='bg')dvList(box,DVS.tab);
  else if(DVS.tab==='no')dvDebt(box);else if(DVS.tab==='cn')dvCert(box);else dvPrices(box);
},update(){
  if(DVS.draft){if(!DVS.dirty&&DVS.draft.id){const st=DVS.draft.kind==='bk'?DVBK:DVBG,cur=dvAll(st).find(x=>x.id===DVS.draft.id&&x.col===DVS.draft.col);
    if(cur&&((cur.sua||{}).at!==(DVS.draft.sua||{}).at)&&!document.querySelector('#modal-root .overlay')){DVS.draft=JSON.parse(JSON.stringify(cur));DVS.draft.kind=DVS.draft.kind||DVS.tab;render();}}return;}
  if(document.querySelector('#modal-root .overlay'))return;
  const a=document.activeElement;if(a&&a.type==='text'&&a.placeholder)return;if(a&&/INPUT|SELECT/.test(a.tagName)&&a.closest&&a.closest('#view,main,.main'))return;render();}};
