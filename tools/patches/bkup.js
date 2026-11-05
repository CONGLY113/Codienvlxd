/* ====== 0.24.0 SAO LƯU: XUẤT TOÀN BỘ DỮ LIỆU RA EXCEL ======
   Một file .xlsx gồm: các sheet đọc được (Mau, Ket_qua, So_lieu_goc, Bang_ke, Nhat_ky, Thiet_bi...) và sheet DuLieu_Tho
   chứa JSON đầy đủ của từng tài liệu (cắt phần, mỗi ô tối đa 30.000 ký tự) để khôi phục hoặc đối chiếu khi cần.
   Ghi file bằng JSZip, không phụ thuộc thư viện ngoài; đọc dữ liệu theo từng bộ sưu tập, nhường luồng giao diện giữa các bước. */
const BKUP_CELL=30000,BKUP_MAXROWS=1000000,BKUP_MAXCHARS=120e6,BKUP_LONG=20000;
const xlEsc=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const xlClean=v=>String(v).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g,'');
const xlRef=(c,r)=>{let s='',n=c+1;while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s+r;};
const xlHead='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
async function xlSheetXml(sh,first){
  const head=sh.head||null,rows=sh.rows||[],W=sh.widths||[],nc=head?head.length:(sh.ncol||1);
  const o=[xlHead+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"'+(first?' tabSelected="1"':'')+'>'
    +(head?'<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A2" sqref="A2"/>':'')+'</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>'];
  if(W.length)o.push('<cols>'+W.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols>');
  o.push('<sheetData>');
  let r=0;
  const line=(vals,sty)=>{r++;let x='<row r="'+r+'">';
    for(let c=0;c<vals.length;c++){let v=vals[c];if(v===null||v===undefined||v==='')continue;const ref=xlRef(c,r),st=sty(c),sa=st?' s="'+st+'"':'';
      if(typeof v==='number'){if(isFinite(v)){x+='<c r="'+ref+'"'+sa+'><v>'+v+'</v></c>';continue;}v=String(v);}
      if(typeof v==='boolean')v=v?'Đúng':'Sai';
      x+='<c r="'+ref+'"'+sa+' t="inlineStr"><is><t xml:space="preserve">'+xlEsc(xlClean(v).slice(0,32000))+'</t></is></c>';}
    o.push(x+'</row>');};
  if(head)line(head,()=>1);
  let k=0;
  for(const row of rows){
    if(Array.isArray(row))line(row,sh.cs||(()=>0));else line(row.v,c=>(row.s&&row.s[c])||0);
    if(++k%1200===0)await sleep(0);
  }
  o.push('</sheetData>');
  if(head&&rows.length)o.push('<autoFilter ref="A1:'+xlRef(nc-1,r)+'"/>');
  o.push('</worksheet>');
  return o.join('');
}
async function xlBook(sheets,prog){
  const zip=new JSZip(),names=[],seen=new Set();
  sheets.forEach(s=>{let n=String(s.name).replace(/[\[\]:*?\/\\]/g,'_').slice(0,31),i=2;while(seen.has(n.toLowerCase())){const suf='_'+i++;n=n.slice(0,31-suf.length)+suf;}seen.add(n.toLowerCase());names.push(n);});
  const NS='http://schemas.openxmlformats.org/';
  zip.file('[Content_Types].xml',xlHead+'<Types xmlns="'+NS+'package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'+sheets.map((s,i)=>'<Override PartName="/xl/worksheets/sheet'+(i+1)+'.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('')+'</Types>');
  zip.file('_rels/.rels',xlHead+'<Relationships xmlns="'+NS+'package/2006/relationships"><Relationship Id="rId1" Type="'+NS+'officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml',xlHead+'<workbook xmlns="'+NS+'spreadsheetml/2006/main" xmlns:r="'+NS+'officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>'+names.map((n,i)=>'<sheet name="'+xlEsc(n)+'" sheetId="'+(i+1)+'" r:id="rId'+(i+1)+'"/>').join('')+'</sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels',xlHead+'<Relationships xmlns="'+NS+'package/2006/relationships">'+sheets.map((s,i)=>'<Relationship Id="rId'+(i+1)+'" Type="'+NS+'officeDocument/2006/relationships/worksheet" Target="worksheets/sheet'+(i+1)+'.xml"/>').join('')+'<Relationship Id="rId'+(sheets.length+1)+'" Type="'+NS+'officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('xl/styles.xml',xlHead+'<styleSheet xmlns="'+NS+'spreadsheetml/2006/main"><fonts count="4"><font><sz val="11"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="14"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><name val="Calibri"/><family val="2"/></font></fonts>'
    +'<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0B5A7C"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
    +'<cellXfs count="5"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top"/></xf><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>');
  for(let i=0;i<sheets.length;i++){
    if(prog)prog('Đang ghi sheet '+names[i]+' ('+(i+1)+'/'+sheets.length+') ...');
    zip.file('xl/worksheets/sheet'+(i+1)+'.xml',await xlSheetXml(sheets[i],i===0));await sleep(0);
  }
  if(prog)prog('Đang nén file Excel ...');
  return zip.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}},m=>{if(prog&&Math.round(m.percent)%10===0)prog('Đang nén file Excel '+Math.round(m.percent)+'% ...');});
}
/* ---- đọc dữ liệu */
const bkupIso=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v);
const bkupVal=v=>{
  if(v===null||v===undefined)return '';
  if(bkupIso(v))return fdt(v);
  if(typeof v==='string')return bkupBin(v)?'[đã bỏ '+v.length+' ký tự]':v;
  if(typeof v==='number'||typeof v==='boolean')return v;
  if(Array.isArray(v))return v.every(x=>x===null||['string','number','boolean'].includes(typeof x))?v.map(x=>bkupVal(x)).join('; '):JSON.stringify(v).slice(0,2000);
  return JSON.stringify(v).slice(0,2000);
};
const bkupBin=v=>typeof v==='string'&&v.length>BKUP_LONG&&/^(data:[^,]{0,80},)?[A-Za-z0-9+\/=\r\n]+$/.test(v);   /* chuỗi base64 hoặc data URL dài: file nhị phân */
function bkupStrip(v,full){
  if(full||v===null||typeof v!=='object'){return (!full&&bkupBin(v))?'[đã bỏ '+v.length+' ký tự dữ liệu nhị phân]':v;}
  if(Array.isArray(v))return v.map(x=>bkupStrip(x,full));
  const o={};for(const k of Object.keys(v))o[k]=bkupStrip(v[k],full);return o;
}
function bkupFlat(v,path,out,depth){
  if(v===null||v===undefined||path==='sketch'||/(^|\.)(sketch|b64)$/.test(path))return;
  if(typeof v==='object'){
    if(depth>7){out.push([path,JSON.stringify(v).slice(0,300)]);return;}
    if(Array.isArray(v))v.forEach((x,i)=>bkupFlat(x,path+'['+(i+1)+']',out,depth+1));
    else Object.keys(v).forEach(k=>bkupFlat(v[k],path?path+'.'+k:k,out,depth+1));
    return;
  }
  out.push([path,typeof v==='string'&&v.length>300?v.slice(0,300)+'…':v]);
}
/* bảng chung cho bộ sưu tập nhỏ: cột = hợp các khóa ở mức trên cùng */
function bkupTable(docs,first,skip){
  skip=new Set(skip||[]);const cnt=new Map();
  docs.forEach(d=>Object.keys(d).forEach(k=>{if(k!=='id'&&!skip.has(k))cnt.set(k,(cnt.get(k)||0)+1);}));
  const keys=Array.from(cnt.keys()).sort((a,b)=>(first.includes(a)?-1:0)-(first.includes(b)?-1:0)||(first.includes(a)&&first.includes(b)?first.indexOf(a)-first.indexOf(b):cnt.get(b)-cnt.get(a))).slice(0,40);
  return {head:['Mã tài liệu'].concat(keys),rows:docs.map(d=>[d.id].concat(keys.map(k=>bkupVal(d[k])))),widths:[26].concat(keys.map(()=>20))};
}
async function bkupCollect(opt,prog){
  const warn=[],data={},per=new Set(openPeriods());
  S.samples.forEach(s=>{const p=perOfId(s.id);if(p)per.add(p);});
  const cols=['samples'];Array.from(per).sort().forEach(p=>cols.push('samples_'+p,'detail_'+p,'blob_'+p));
  const yy=new Date().getFullYear()%100;for(let y=24;y<=yy;y++)cols.push(BK_COL(pad(y)));
  ['audit','errors','config','counters','mauh','mauv','devcal','archive','files'].forEach(c=>cols.push(c));
  /* mặc định không tải các bộ sưu tập chứa file nhị phân (file đã nộp, phiếu lưu cũ, bản biểu mẫu): nặng, đọc tốn hạn mức, phiếu tạo lại được */
  const isBin=c=>/^blob_/.test(c)||c==='files'||c==='mauv';
  const skipped=opt.full?[]:cols.filter(isBin);
  if(!opt.full)for(let i=cols.length-1;i>=0;i--)if(isBin(cols[i]))cols.splice(i,1);
  const cached=c=>{if(PARTS[c])return PARTS[c];if(c==='audit'&&S.audit&&S.audit.length)return S.audit;if(c==='errors'&&S.errors&&S.errors.length)return S.errors;if(c==='mauh'&&S.mauh&&S.mauh.length)return S.mauh;return null;};
  let done=0;
  await arPool(cols,4,async c=>{
    try{const hit=cached(c);data[c]=hit?hit.map(x=>Object.assign({},x)):await Data.readAll(c);}
    catch(e){console.warn('sao lưu',c,e);data[c]=[];warn.push('Không đọc được '+c+' ('+((e&&e.code)||(e&&e.message)||'lỗi')+')');}
    prog('Đã đọc '+(++done)+'/'+cols.length+' bộ sưu tập ...');
  });
  return {data,cols,warn,skipped,per:Array.from(per).sort()};
}
/* ---- dựng các sheet */
async function bkupSheets(C,opt,prog){
  const D=C.data,sheets=[],stat=[];
  const put=(name,head,rows,widths)=>{
    for(let i=0,p=1;i<Math.max(rows.length,1);i+=BKUP_MAXROWS,p++)sheets.push({name:p>1?name+'_'+p:name,head,rows:rows.slice(i,i+BKUP_MAXROWS),widths});
  };
  const samples=[],detail=new Map();
  C.cols.forEach(c=>{
    if(c==='samples'||/^samples_/.test(c))D[c].forEach(x=>samples.push({s:x,per:c==='samples'?'cũ':c.slice(8)}));
    if(/^detail_/.test(c))D[c].forEach(x=>detail.set(x.id,x));
  });
  samples.sort((a,b)=>String(a.s.so_bao_cao||a.s.ma_mau||a.s.id)<String(b.s.so_bao_cao||b.s.ma_mau||b.s.id)?-1:1);
  const full=samples.map(({s,per})=>({s,per,d:detail.get(s.id)||null}));
  /* 1. Mau */
  const oth=(o,skip)=>Object.keys(o||{}).filter(k=>!skip.includes(k)&&o[k]!==''&&o[k]!==null&&typeof o[k]!=='object').map(k=>k+': '+bkupVal(o[k])).join('; ');
  prog('Đang dựng sheet Mau ...');
  put('Mau',['Kỳ','ID','Mã mẫu','Số yêu cầu','Số giao việc','Số báo cáo','Trạng thái','Loại mẫu','Tên mẫu','Quy cách','Nguồn gốc / số lô','Ngày nhận mẫu','Khách hàng','Người liên hệ','Điện thoại','MST','Công trình','Hạng mục','Đơn vị thi công','Thông tin khác của dự án','Số chỉ tiêu','Mã chỉ tiêu','Cán bộ thử','Giao lúc','Hạn trả','Soát xét bởi','Phát hành lúc','Mã băm phiếu','Đơn giá','Thanh toán','Bản giấy','Đã gửi khách','Kênh','Tạo lúc','Thao tác gần nhất'],
    full.map(({s,per})=>{const k=s.khach||{},d=s.du_an||{},m=s.mau||{},g=s.giao||{},t=s.tt||{};return [per,s.id,s.ma_mau,s.so_yc,g.ma_gv,s.so_bao_cao,(ST[s.status]||[s.status])[0],matName(loaiOf(s)),m.ten,m.quy_cach,m.nguon_goc,fd(m.ngay_nhan),k.ten,k.lien_he,k.dien_thoai,k.mst,d.cong_trinh,d.hang_muc,d.thi_cong,oth(d,['cong_trinh','hang_muc','thi_cong']),(s.chi_tieu||[]).length,(s.chi_tieu||[]).join('; '),g.ten||g.ma_nv,bkupVal(g.at),fd(s.han_tra),(s.soat_xet&&s.soat_xet.by)||'',bkupVal(s.phat_hanh_at),(s.phieu&&s.phieu.hash)||'',+t.don_gia||'',bkupVal(t.thanh_toan),bkupVal(t.ban_giay),bkupVal(t.da_gui),s.kenh||'',bkupVal(s.created_at),[s.last_action,s.last_by,bkupVal(s.last_at)].filter(Boolean).join(' · ')];}),
    [8,26,16,16,16,18,16,18,26,18,24,13,28,20,14,14,30,22,22,28,9,26,20,16,12,20,16,22,12,14,12,12,10,16,34]);
  stat.push(['Mau',full.length]);
  /* 2. Ket_qua, 3. So_lieu_goc */
  prog('Đang dựng sheet Ket_qua và So_lieu_goc ...');
  const kq=[],sl=[];let k=0;
  for(const {s,per,d} of full){
    const base=[s.so_bao_cao||'',s.ma_mau||'',matName(loaiOf(s))],nop=s.nop||{};
    const res=[];bkupFlat(nop.results,'',res,0);res.forEach(([p,v])=>kq.push(base.concat([p,v])));
    ['raw','sieve','checks','devs'].forEach(part=>{const src=(d&&d[part]!==undefined)?d[part]:nop[part];if(src===undefined||src===null)return;const f=[];bkupFlat(src,'',f,0);f.forEach(([p,v])=>sl.push(base.concat([part,p,v])));});
    if(++k%300===0)await sleep(0);
  }
  put('Ket_qua',['Số báo cáo','Mã mẫu','Loại mẫu','Chỉ tiêu (mã kết quả)','Giá trị'],kq,[18,16,22,34,20]);
  put('So_lieu_goc',['Số báo cáo','Mã mẫu','Loại mẫu','Nhóm','Đường dẫn số liệu','Giá trị'],sl,[18,16,22,10,44,22]);
  stat.push(['Ket_qua',kq.length],['So_lieu_goc',sl.length]);
  /* 4. Bảng kê */
  prog('Đang dựng sheet Bang_ke ...');
  const bks=[];C.cols.filter(c=>/^bangke_/.test(c)).forEach(c=>D[c].forEach(x=>bks.push(Object.assign({col:c},x))));
  bks.sort((a,b)=>String(a.so||a.id)<String(b.so||b.id)?-1:1);
  const bkRows=[],bkLn=[];
  bks.forEach(b=>{
    const n=bkNormDoc(JSON.parse(JSON.stringify(b))),T=bkTotals(n),daThu=(n.pay||[]).filter(p=>p.tt==='da_xn').reduce((a,p)=>a+(+p.so_tien||0),0);
    bkRows.push([n.so,fd(n.ngay),(n.khach&&n.khach.ten)||'',(BK_ST[n.trang_thai]||[n.trang_thai])[0],(n.dong||[]).length,T.tong,T.giam,T.tt,daThu,(n.pay||[]).length,(n.tao&&n.tao.by)||'',bkupVal(n.tao&&n.tao.at),bkupVal(n.sua&&n.sua.at),n.id,n.col]);
    (n.dong||[]).forEach((l,i)=>bkLn.push([n.so,i+1,l.ten||'',l.loai||'',l.n||'',l.sl,l.don_gia,Math.round((+l.sl||0)*(+l.don_gia||0)),(l.ma||[]).join('; '),l.tay?'Thêm tay':'']));
  });
  put('Bang_ke',['Số bảng kê','Ngày','Khách hàng','Trạng thái','Số dòng','Cộng tiền','Giảm','Phải thanh toán','Đã thu (xác nhận)','Số lần thu','Người lập','Lập lúc','Sửa lúc','ID','Bộ sưu tập'],bkRows,[14,12,30,24,9,14,12,16,16,9,20,16,16,24,14]);
  put('Bang_ke_dong',['Số bảng kê','STT','Nội dung','Loại mẫu','Số mẫu','Số lượng','Đơn giá','Thành tiền','Mã mẫu','Ghi chú'],bkLn,[14,6,50,16,9,10,12,14,40,10]);
  stat.push(['Bang_ke',bkRows.length]);
  /* 5. Nhật ký: toàn cục + nhật ký trong chi tiết mẫu */
  prog('Đang dựng sheet Nhat_ky ...');
  const au=[];
  (D.audit||[]).forEach(a=>au.push([a.at||'',a.by,a.by_id,a.action,a.ma_mau,a.note,a.sample,'Nhật ký chung']));
  detail.forEach(d=>(d.log||[]).forEach(a=>{const sm=samples.find(x=>x.s.id===(d.sample||d.id));au.push([a.at||'',a.by,a.by_id,a.action,sm?sm.s.ma_mau:'',a.note,d.sample||d.id,'Chi tiết mẫu']);}));
  au.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0);
  put('Nhat_ky',['Lúc','Người thực hiện','Mã nhân sự','Thao tác','Mã mẫu','Ghi chú','ID mẫu','Nguồn'],au.map(r=>[fdt(r[0]),r[1],r[2],r[3],r[4],r[5],r[6],r[7]]),[17,22,11,44,16,50,26,14]);
  stat.push(['Nhat_ky',au.length]);
  /* 6. Thiết bị */
  const dc=new Map((D.devcal||[]).map(x=>[x.id,x]));
  put('Thiet_bi',['Mã thiết bị','Tên thiết bị','Số máy','Loại (HC/KT)','Hiệu chuẩn lần cuối (gốc)','Người phụ trách','Hiệu chuẩn lần cuối (đã cập nhật)','Tình trạng'],
    DEV.map(d=>{const c=dc.get(d.id),last=(c&&c.last)||d.last,x=Object.assign({},d,{last});return [d.id,d.name,d.sn||'',d.mode||'',d.last||'',d.mgr||'',(c&&c.last)||'',DEV_TXT[devStatus(x)][0]];}),[11,46,12,12,18,22,22,16]);
  /* 7. Cấu hình (không gồm file) */
  const cf=[];(D.config||[]).forEach(d=>{const f=[];bkupFlat(Object.assign({},d,{id:undefined}),'',f,0);f.forEach(([p,v])=>cf.push([d.id,p,v]));});
  put('Cau_hinh',['Tài liệu cấu hình','Đường dẫn','Giá trị'],cf,[22,40,60]);
  /* 8. Biểu mẫu (lịch sử) */
  const mh=bkupTable(D.mauh||[],['code','rev','action','by','at','note','chg'],['b64']);
  put('Bieu_mau_lich_su',mh.head,mh.rows,mh.widths);
  /* 9. Lưu giữ (chỉ mục) */
  const ix=[],runs=[];(D.archive||[]).forEach(d=>{if(Array.isArray(d.e))d.e.forEach(e=>ix.push([d.per,d.zip,e.b,e.m,matName(e.l),e.k,e.c,fd(e.d),e.n,e.t==='ph'?'Đã phát hành':'Từ chối',e.h,e.i]));else runs.push(d);});
  put('Luu_giu_chi_muc',['Kỳ','Gói ZIP','Số báo cáo','Mã mẫu','Loại mẫu','Khách hàng','Công trình','Ngày phát hành','Số chỉ tiêu','Trạng thái','Mã băm phiếu','ID mẫu'],ix,[8,26,18,16,20,30,30,13,9,14,22,26]);
  const rn=bkupTable(runs,['per','zip','so_mau','at','by','bytes','sha_zip'],[]);
  put('Luu_giu_goi',rn.head,rn.rows,rn.widths);
  /* 10. Bộ đếm số, lỗi hệ thống */
  const ct=bkupTable(D.counters||[],['n'],[]);put('Bo_dem_so',ct.head,ct.rows,ct.widths);
  const er=bkupTable(D.errors||[],['at','by','screen','where','msg','build'],[]);put('Loi_he_thong',er.head,er.rows,er.widths);
  return {sheets,stat};
}
/* cắt JSON thành các phần tối đa BKUP_CELL ký tự, không cắt giữa một cặp thay thế UTF-16 */
function bkupRawRows(list){
  const out=[];
  for(const [c,id,js] of list){
    const parts=[];let a=0;
    while(a<js.length||!parts.length){let b=Math.min(js.length,a+BKUP_CELL);if(b<js.length&&/[\uD800-\uDBFF]/.test(js[b-1]))b--;parts.push(js.slice(a,b));a=b;if(a>=js.length)break;}
    parts.forEach((p,i)=>out.push([c,id,i+1,parts.length,p]));
  }
  return out;
}
async function bkupRun(opt,prog){
  const t0=Date.now();
  prog('Đang chuẩn bị ...');
  const C=await bkupCollect(opt,prog);
  const R=await bkupBuild(C,opt,prog);
  prog('Đang ghi file Excel ...');
  const bytes=await xlBook(R.sheets,prog);
  const now=new Date(),name='PTN_SaoLuu_'+now.getFullYear()+pad(now.getMonth()+1)+pad(now.getDate())+'_'+pad(now.getHours())+pad(now.getMinutes())+'.xlsx';
  return {bytes,name,ndoc:R.ndoc,warn:C.warn,secs:Math.round((Date.now()-t0)/1000),sheets:R.sheets.map(s=>[s.name,s.rows.length])};
}
async function bkupBuild(C,opt,prog){
  const R=await bkupSheets(C,opt,prog),D=C.data;
  prog('Đang dựng sheet DuLieu_Tho ...');
  const list=[];let chars=0;
  let yy=0;
  for(const c of C.cols){for(const d of (D[c]||[])){if(++yy%250===0)await sleep(0);const o=Object.assign({},d);delete o.id;const js=JSON.stringify(bkupStrip(o,opt.full));chars+=js.length;
    if(chars>BKUP_MAXCHARS)throw new Error('Dữ liệu kèm file đính kèm quá lớn để gói trong một file Excel. Bỏ chọn "Kèm cả nội dung file Excel đã nộp" rồi xuất lại.');list.push([c,d.id,js]);}await sleep(0);}
  const rawRows=bkupRawRows(list);
  for(let i=0,p=1;i<Math.max(rawRows.length,1);i+=BKUP_MAXROWS,p++)R.sheets.push({name:p>1?'DuLieu_Tho_'+p:'DuLieu_Tho',head:['Bộ sưu tập','Mã tài liệu','Phần','Tổng số phần','Nội dung JSON (ghép các phần theo thứ tự)'],rows:rawRows.slice(i,i+BKUP_MAXROWS),widths:[18,28,7,9,100]});
  const info=[];
  const L=(a,b,st)=>info.push({v:[a,b],s:[4,st||2]});
  info.push({v:['SAO LƯU DỮ LIỆU · PHÒNG THÍ NGHIỆM VLXD'],s:[3]});
  info.push({v:[''],s:[0]});
  L('Xuất lúc',fdt(new Date().toISOString()));L('Người xuất',SESSION?SESSION.name:'');L('Bản web app',BUILD);
  L('Nguồn dữ liệu',DB?'Kho dữ liệu dùng chung (Firebase/Firestore)':'Bộ nhớ trình duyệt này (chưa kết nối kho dùng chung)');
  L('Kèm nội dung file đính kèm',opt.full?'Có':'Không. Không tải các nhóm dữ liệu file nhị phân: file Excel cán bộ đã nộp (blob_*), phiếu lưu bản cũ (files), các bản biểu mẫu tùy chỉnh (mauv). Phiếu phát hành tạo lại được từ dữ liệu niêm phong; muốn có các file này hãy xuất lại và chọn "Kèm cả nội dung file Excel đã nộp".');
  L('Số tài liệu đã xuất',R.ndoc+' tài liệu trong '+C.cols.filter(c=>(D[c]||[]).length).length+' bộ sưu tập');
  if(C.warn.length)L('CẢNH BÁO',C.warn.join('\n'));
  info.push({v:[''],s:[0]});
  info.push({v:['CÁC SHEET'],s:[3]});
  [['Mau','Mỗi dòng một mẫu (cả mẫu cũ và các kỳ nửa tháng đang trực tuyến): mã, khách hàng, công trình, trạng thái, cán bộ, ngày phát hành, mã băm phiếu, đơn giá.'],
   ['Ket_qua','Kết quả tính toán của từng mẫu (dạng dọc: một dòng một chỉ tiêu). Cột "Chỉ tiêu" là mã kết quả trong hệ thống.'],
   ['So_lieu_goc','Số liệu gốc cán bộ thử nghiệm đã nhập, bảng sàng, kiểm tra, thiết bị dùng, ở dạng dọc.'],
   ['Bang_ke, Bang_ke_dong','Bảng kê thanh toán: tiêu đề và từng dòng; có tổng tiền, giảm giá, đã thu.'],
   ['Nhat_ky','Nhật ký chung và nhật ký trong chi tiết từng mẫu, xếp theo thời gian.'],
   ['Thiet_bi','Danh mục thiết bị, lần hiệu chuẩn gần nhất và tình trạng.'],
   ['Cau_hinh','Đơn giá, ngân hàng, kỳ đang mở, ngưỡng chênh lệch, link web app.'],
   ['Bieu_mau_lich_su','Lịch sử chỉnh sửa biểu mẫu báo cáo (ai, lúc nào, thay đổi gì).'],
   ['Luu_giu_chi_muc, Luu_giu_goi','Chỉ mục các hồ sơ đã chuyển lưu giữ. Nội dung hồ sơ nằm trong các file ZIP lưu giữ, không nằm trong file này.'],
   ['Bo_dem_so, Loi_he_thong','Bộ đếm số mã mẫu và nhật ký lỗi hệ thống.'],
   ['DuLieu_Tho','JSON đầy đủ của từng tài liệu trong kho (mỗi tài liệu một hoặc nhiều dòng, mỗi ô tối đa '+BKUP_CELL+' ký tự). Ghép các dòng cùng "Mã tài liệu" theo cột "Phần" để được nguyên văn tài liệu, dùng khi cần khôi phục hoặc đối chiếu.']].forEach(a=>L(a[0],a[1]));
  info.push({v:[''],s:[0]});
  info.push({v:['LƯU Ý'],s:[3]});
  ['Chỉ gồm dữ liệu đang trực tuyến. Hồ sơ đã chuyển lưu giữ nằm trong file ZIP, hãy giữ cả hai.','File này chứa thông tin khách hàng, công trình và nhật ký: bảo quản ở nơi an toàn, không gửi ra ngoài.','Không sửa trực tiếp trong file rồi mong hệ thống tự nhận lại: đây là bản sao lưu, không phải file nhập.'].forEach(t=>info.push({v:['•',t],s:[0,2]}));
  R.sheets.unshift({name:'Doc_toi',head:null,ncol:2,rows:info,widths:[28,110]});
  R.ndoc=list.length;
  return R;
}
/* ---- khung giao diện trong Cài đặt */
function bkupCard(){
  const st=h('p',{class:'small muted',role:'status','aria-live':'polite',style:'min-height:18px;margin:0'});
  const full=h('input',{type:'checkbox',id:'bk-full'});
  const go=h('button',{class:'btn primary',onclick:async()=>{
    go.disabled=true;full.disabled=true;
    try{
      const r=await bkupRun({full:full.checked},t=>{st.textContent=t;});
      st.textContent='Đang lưu file ...';
      const ok=await saveBytes(r.name,r.bytes);
      if(ok){
        st.textContent='Đã xuất '+r.ndoc+' tài liệu, '+r.sheets.length+' sheet, '+kbOf(r.bytes.length)+', mất '+r.secs+' giây.'+(r.warn.length?' Có '+r.warn.length+' cảnh báo, xem sheet Doc_toi.':'');
        await safe(()=>Data.set('config/sao_luu',{at:new Date().toISOString(),by:SESSION?SESSION.name:'',n:r.ndoc,bytes:r.bytes.length,name:r.name,build:BUILD,full:!!full.checked}).then(()=>true));
        await logAudit('Xuất sao lưu toàn bộ dữ liệu ra Excel',r.ndoc+' tài liệu · '+kbOf(r.bytes.length));
        toast('Đã xuất file sao lưu.','ok');
      }else st.textContent='Chưa lưu file.';
    }catch(e){console.warn(e);logErr('sao-luu',e);st.textContent='';toast('Không xuất được: '+String((e&&e.message)||e).slice(0,200),'bad');}
    go.disabled=false;full.disabled=false;
  }},'Xuất toàn bộ dữ liệu ra Excel');
  const lastEl=()=>{const l=S.saoLuu;return l?h('p',{class:'small'},'Lần sao lưu gần nhất: ',h('b',null,fdt(l.at)),' · '+(l.by||'')+' · '+(l.n||0)+' tài liệu'+(l.bytes?' · '+kbOf(l.bytes):'')):h('p',{class:'small',style:'color:#B45309'},'Chưa có lần sao lưu nào được ghi nhận.');};
  return h('div',{class:'card stack'},h('h2',null,'Sao lưu dữ liệu ra Excel'),
    h('p',{class:'muted small'},'Xuất toàn bộ dữ liệu đang trực tuyến thành một file Excel: mẫu, kết quả, số liệu gốc, bảng kê, nhật ký, thiết bị, cấu hình, kèm sheet DuLieu_Tho chứa nguyên văn từng tài liệu. Nên làm mỗi tuần một lần và cất file ở nơi an toàn (Google Drive của phòng, ổ cứng ngoài). Việc đọc dữ liệu tính vào hạn mức đọc hằng ngày của Firebase (mỗi tài liệu một lượt đọc); với một phòng nhỏ là không đáng kể.'),
    lastEl(),
    h('label',{class:'chk',for:'bk-full'},full,h('span',null,'Kèm cả nội dung file Excel đã nộp (rất nặng, thường không cần vì phiếu tạo lại được từ dữ liệu)')),
    h('div',null,go),st);
}
function bkupDueDays(){const l=S.saoLuu;if(!l||!l.at)return null;return Math.floor((Date.now()-new Date(l.at).getTime())/864e5);}
