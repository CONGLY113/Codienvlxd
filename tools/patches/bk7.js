/* ====================================================================== 0.16.0 BẢNG KÊ THANH TOÁN
   Mỗi phiếu yêu cầu (hoặc nhiều phiếu của cùng khách) lập một bảng kê: TT, tên mẫu, số lượng, đơn giá, thành tiền, chiết khấu (% hoặc số tiền).
   Mẫu chưa hoàn thành vẫn lập được (tạm tính). Số bảng kê: BK<yy>.<mm>.<dd>.<STT>, mốc ngày = ngày tạo phiếu (sửa được).
   Lưu ở bộ sưu tập bangke_<yy> (mỗi năm một bộ), tải sẵn năm nay và năm trước. */
const BK_COL=y=>'bangke_'+y;
const BKS={},BK_W={};
const bkAll=()=>Object.keys(BKS).reduce((a,c)=>a.concat(BKS[c]),[]);
function bkWatch(col){if(BK_W[col])return;BK_W[col]=Data.watch(col,list=>{BKS[col]=list.map(x=>Object.assign({col},x));schedule();});}
function bkWatchInit(){const y=new Date().getFullYear()%100;[y,y-1].forEach(v=>bkWatch(BK_COL(pad(v))));}
const BK_ST={nhap:['Nháp, tạm tính','warn'],da_gui:['Đã gửi khách','info'],da_thu:['Đã thanh toán','ok'],huy:['Đã hủy','neutral']};
const fmtN=n=>(+n||0).toLocaleString('vi-VN');
const typeNameOf=s=>(s.mau&&s.mau.ten)||((MAT_TYPES.find(x=>x[0]===loaiOf(s))||[])[1])||'Mẫu thử nghiệm';
function ycGroups(){
  const m=new Map();
  S.samples.forEach(s=>{if(!s.so_yc||s.status==='tu_choi')return;const k=ycKey(s);let e=m.get(k);
    if(!e){e={key:k,so_yc:s.so_yc,khach:s.khach||{},cong_trinh:(s.du_an&&s.du_an.cong_trinh)||'',ngay:'',mau:[]};m.set(k,e);}
    e.mau.push(s);const d=s.created_at?todayISO(new Date(s.created_at)):'';if(d&&(!e.ngay||d<e.ngay))e.ngay=d;});
  m.forEach(e=>{if(!e.ngay)e.ngay=e.mau.map(s=>(s.mau&&s.mau.ngay_nhan)||'').filter(Boolean).sort()[0]||todayISO();e.xong=e.mau.filter(s=>s.status==='da_phat_hanh').length;});
  return Array.from(m.values()).sort((a,b)=>a.so_yc<b.so_yc?1:a.so_yc>b.so_yc?-1:0);
}
/* gom mẫu thành các dòng theo loại mẫu và tên mẫu; giữ đơn giá, tên, dòng nhập tay của bản cũ khi cập nhật */
function bkLines(groups,chiXong,old){
  const mp=new Map();
  groups.forEach(e=>e.mau.forEach(s=>{
    const done=s.status==='da_phat_hanh';if(chiXong&&!done)return;
    const k=loaiOf(s)+'|'+typeNameOf(s);let l=mp.get(k);
    if(!l){l={k,ten:typeNameOf(s),loai:loaiOf(s),sl:0,n:0,xong:0,don_gia:0,ma:[],_dg:[]};mp.set(k,l);}
    l.sl++;l.n++;l.ma.push(s.ma_mau);if(done)l.xong++;l._dg.push(+((s.tt||{}).don_gia)||0);}));
  const out=Array.from(mp.values()).map(l=>{
    const o=(old||[]).find(x=>x.k===l.k&&!x.tay);
    const dgs=l._dg.filter(x=>x>0),legacy=dgs.length&&dgs.every(x=>x===dgs[0])?dgs[0]:0;
    l.don_gia=o?o.don_gia:((S.bgia&&+S.bgia[l.loai])||legacy||0);if(o)l.ten=o.ten;delete l._dg;return l;});
  (old||[]).filter(x=>x.tay).forEach(x=>out.push(x));
  return out;
}
function bkTotals(b){
  const tong=(b.dong||[]).reduce((a,l)=>a+Math.round((+l.sl||0)*(+l.don_gia||0)),0);
  const g=b.giam||{};const gt=Math.max(0,+g.gt||0);
  const giam=g.kieu==='pct'?Math.round(tong*Math.min(100,gt)/100):Math.min(tong,Math.round(gt));
  return{tong,giam,tt:tong-giam};
}
const bkTam=b=>(b.dong||[]).some(l=>!l.tay&&l.xong<l.n);
function docSo(n){
  n=Math.round(+n||0);if(n<=0)return 'Không đồng';
  const D=['không','một','hai','ba','bốn','năm','sáu','bảy','tám','chín'],U=['','nghìn','triệu','tỷ','nghìn tỷ','triệu tỷ'];
  const ba=(x,full)=>{let t='';const tr=Math.floor(x/100),ch=Math.floor(x%100/10),dv=x%10;
    if(tr>0||full)t=D[tr]+' trăm';
    if(ch>1){t+=(t?' ':'')+D[ch]+' mươi';if(dv===1)t+=' mốt';else if(dv===4)t+=' tư';else if(dv===5)t+=' lăm';else if(dv>0)t+=' '+D[dv];}
    else if(ch===1){t+=(t?' ':'')+'mười';if(dv===5)t+=' lăm';else if(dv>0)t+=' '+D[dv];}
    else if(dv>0)t+=(t?' lẻ ':'')+D[dv];
    return t;};
  const g=[];while(n>0){g.push(n%1000);n=Math.floor(n/1000);}
  const parts=[];
  for(let i=g.length-1;i>=0;i--){if(g[i]===0)continue;const full=i<g.length-1;parts.push(ba(g[i],full)+(U[i]?' '+U[i]:''));}
  const t=parts.join(' ');return t.charAt(0).toUpperCase()+t.slice(1)+' đồng';
}
const bkTitle=b=>'BẢNG KÊ THANH TOÁN'+(bkTam(b)?' (TẠM TÍNH)':'');
const bkNoteTam=b=>{const c=(b.dong||[]).filter(l=>!l.tay).reduce((a,l)=>a+(l.n-l.xong),0);return c?'Bảng kê tạm tính: còn '+c+' mẫu chưa hoàn thành, số tiền có thể thay đổi khi chốt.':'';};
/* so sánh bảng kê nháp với dữ liệu hiện tại của các phiếu */
function bkDelta(b){
  if(!['nhap','da_gui'].includes(b.trang_thai))return null;
  const gs=ycGroups().filter(e=>(b.ycKeys||[]).includes(e.key));
  const cur=bkLines(gs,!!b.chi_xong,[]),have=new Set();(b.dong||[]).forEach(l=>(l.ma||[]).forEach(x=>have.add(x)));
  const now=new Set();cur.forEach(l=>l.ma.forEach(x=>now.add(x)));
  let them=0;now.forEach(x=>{if(!have.has(x))them++;});
  const xong=cur.reduce((a,l)=>a+l.xong,0),xongCu=(b.dong||[]).filter(l=>!l.tay).reduce((a,l)=>a+l.xong,0);
  return(them||xong!==xongCu)?{them,xong:xong-xongCu}:null;
}
async function bkNumber(iso){
  const yy=iso.slice(2,4),mm=iso.slice(5,7),dd=iso.slice(8,10),pre='BK'+yy+'.'+mm+'.'+dd+'.';let mx=0;
  bkAll().forEach(b=>{if(b.so&&b.so.startsWith(pre)){const m=b.so.slice(pre.length).match(/^(\d+)/);if(m)mx=Math.max(mx,+m[1]);}});
  return pre+(await nextSeq('bk'+yy+mm+dd,mx));
}
function bkDraftFrom(gs,chiXong){
  const kh=gs[0].khach||{},cts=Array.from(new Set(gs.map(e=>e.cong_trinh).filter(Boolean)));
  const b={so:'',ngay:gs.map(e=>e.ngay).sort()[0]||todayISO(),khach:{ten:kh.ten||'',lien_he:kh.lien_he||'',email:kh.email||''},cong_trinh:cts.join('; '),
    yc:gs.map(e=>e.so_yc),ycKeys:gs.map(e=>e.key),chi_xong:!!chiXong,giam:{kieu:'pct',gt:0},ghi_chu:'',trang_thai:'nhap',dong:[]};
  b.dong=bkLines(gs,b.chi_xong,[]);return b;
}
async function bkSave(b){
  const now=new Date().toISOString(),first=!b.id;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(b.ngay||''))b.ngay=todayISO();
  if(first){b.id='bk_'+rid();b.col=BK_COL(b.ngay.slice(2,4));b.so=await bkNumber(b.ngay);b.tao={at:now,by:SESSION?SESSION.name:'',by_id:SESSION?SESSION.id:''};}
  b.sua={at:now,by:SESSION?SESSION.name:''};bkWatch(b.col);
  const doc=JSON.parse(JSON.stringify(b));delete doc.id;delete doc.col;
  const ok=await safe(()=>Data.set(b.col+'/'+b.id,doc).then(()=>true),'Không lưu được bảng kê.');
  if(ok)await logAudit((first?'Lập':'Sửa')+' bảng kê '+b.so,b.khach.ten+' · '+fmtN(bkTotals(b).tt)+' đ');
  return ok;
}
async function bkSyncPaid(b,paid){
  const set=new Set();(b.dong||[]).forEach(l=>(l.ma||[]).forEach(x=>set.add(x)));
  for(const s of S.samples){if(s.status==='da_phat_hanh'&&set.has(s.ma_mau)){if(((s.tt||{}).thanh_toan==='da')!==paid)await setTT(s,{thanh_toan:paid?'da':'chua'});}}
}
/* ---- xuất Excel (có công thức) */
function xe(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
async function bkXlsx(b){
  const T=bkTotals(b),L=b.dong||[],cols='ABCDE';
  const rows=[],merges=[];let r=0;
  const S_={n:0,bc:1,tt:2,th:3,tl:4,tc:5,tm:6,lb:7,bm:8,it:9,rl:10,pc:11,tr:12,sm:13,kv:14};
  const cell=(c,rr,v,st,kind,f)=>{const ref=c+rr;
    if(kind==='n')return '<c r="'+ref+'" s="'+st+'">'+(f?'<f>'+xe(f)+'</f>':'')+'<v>'+(+v||0)+'</v></c>';
    return '<c r="'+ref+'" s="'+st+'" t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>';};
  const row=(h_,arr)=>{r++;rows.push('<row r="'+r+'"'+(h_?' ht="'+h_+'" customHeight="1"':'')+'>'+arr.join('')+'</row>');return r;};
  const mg=(a,bb)=>merges.push('<mergeCell ref="'+a+':'+bb+'"/>');
  const full=(txt,st,h_)=>{const rr=row(h_,[cell('A',r+1,txt,st)].concat(['B','C','D','E'].map(c=>cell(c,r+1,'',st))));mg('A'+rr,'E'+rr);return rr;};
  full('TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG',S_.bc);
  full('PHÒNG THÍ NGHIỆM CHUYÊN NGÀNH XÂY DỰNG',S_.bc);
  full('23 Phan Huy Chú, phường Đồng Hới, tỉnh Quảng Trị',S_.sm);
  row(6,[]);
  full(bkTitle(b),S_.tt,26);
  full('Số: '+b.so+' · Ngày '+fd(b.ngay),S_.sm);
  row(6,[]);
  const kv=(lab,val)=>{const rr=row(0,[cell('A',r+1,lab,S_.lb),cell('B',r+1,'',S_.lb),cell('C',r+1,val,S_.kv)].concat(['D','E'].map(c=>cell(c,r+1,'',S_.kv))));mg('A'+rr,'B'+rr);mg('C'+rr,'E'+rr);};
  kv('Tên khách hàng:',b.khach.ten);kv('Tên công trình:',b.cong_trinh||'');kv('Phiếu yêu cầu:',(b.yc||[]).join(', '));
  row(6,[]);
  row(32,['TT','Tên mẫu','Số lượng','Đơn giá (đồng)','Thành tiền (đồng)'].map((t,i)=>cell(cols[i],r+1,t,S_.th)));
  const first=r+1;
  L.forEach((l,i)=>{const rr=r+1;const sl=+l.sl||0,dg=+l.don_gia||0;
    row(0,[cell('A',rr,i+1,S_.tc,'n'),cell('B',rr,l.ten,S_.tl),cell('C',rr,sl,S_.tc,'n'),cell('D',rr,dg,S_.tm,'n'),cell('E',rr,Math.round(sl*dg),S_.tm,'n','ROUND(C'+rr+'*D'+rr+',0)')]);});
  const last=r;
  const tot=r+1;
  row(0,[cell('A',tot,'Tổng cộng',S_.rl),cell('B',tot,'',S_.rl),cell('C',tot,'',S_.rl),cell('D',tot,'',S_.rl),cell('E',tot,T.tong,S_.bm,'n',L.length?'SUM(E'+first+':E'+last+')':null)]);mg('A'+tot,'D'+tot);
  const g=b.giam||{},pct=g.kieu==='pct';const dc=r+1;
  row(0,[cell('A',dc,pct?'Chiết khấu (% trên tổng cộng):':'Chiết khấu (giảm trừ nhập trực tiếp)',S_.rl),cell('B',dc,'',S_.rl),cell('C',dc,pct?Math.min(100,Math.max(0,+g.gt||0)):'',pct?S_.pc:S_.rl,pct?'n':null),cell('D',dc,'',S_.rl),
    cell('E',dc,T.giam,S_.bm,'n',pct?'ROUND(E'+tot+'*C'+dc+'/100,0)':null)]);mg('A'+dc,'B'+dc);
  const ck=r+1;
  row(0,[cell('A',ck,'THÀNH TIỀN SAU CHIẾT KHẤU',S_.rl),cell('B',ck,'',S_.rl),cell('C',ck,'',S_.rl),cell('D',ck,'',S_.rl),cell('E',ck,T.tt,S_.bm,'n','E'+tot+'-E'+dc)]);mg('A'+ck,'D'+ck);
  full('Bằng chữ: '+docSo(T.tt),S_.it,20);
  const nt=bkNoteTam(b);if(nt)full(nt,S_.it,20);
  if(b.ghi_chu)full('Ghi chú: '+b.ghi_chu,S_.it,20);
  row(10,[]);
  const sg=row(0,[cell('A',r+1,'Đại diện khách hàng',S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,'',S_.bc),cell('D',r+1,'Người lập bảng kê',S_.bc),cell('E',r+1,'',S_.bc)]);mg('A'+sg,'B'+sg);mg('D'+sg,'E'+sg);
  const sg2=row(0,[cell('A',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('B',r+1,'',S_.sm),cell('C',r+1,'',S_.sm),cell('D',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('E',r+1,'',S_.sm)]);mg('A'+sg2,'B'+sg2);mg('D'+sg2,'E'+sg2);
  row(60,[]);
  const font=(sz,bold,it)=>'<font>'+(bold?'<b/>':'')+(it?'<i/>':'')+'<sz val="'+sz+'"/><name val="Times New Roman"/><family val="1"/></font>';
  const bd='<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>';
  const xf=(num,fo,fi,bo,al)=>'<xf numFmtId="'+num+'" fontId="'+fo+'" fillId="'+fi+'" borderId="'+bo+'" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment '+al+'/></xf>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="1"><numFmt numFmtId="164" formatCode="0.##&quot;%&quot;"/></numFmts>'
    +'<fonts count="6">'+font(11)+font(11,1)+font(14,1)+font(11,0,1)+font(10,0,1)+font(11,1)+'</fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF0"/><bgColor indexed="64"/></patternFill></fill></fills>'
    +'<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'+bd+'</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="15">'
    +xf(0,0,0,0,'vertical="center"')                                   /*0 n*/
    +xf(0,1,0,0,'horizontal="center" vertical="center"')               /*1 bc*/
    +xf(0,2,0,0,'horizontal="center" vertical="center"')               /*2 tt*/
    +xf(0,1,2,1,'horizontal="center" vertical="center" wrapText="1"')  /*3 th*/
    +xf(0,0,0,1,'horizontal="left" vertical="center" wrapText="1"')    /*4 tl*/
    +xf(3,0,0,1,'horizontal="center" vertical="center"')               /*5 tc*/
    +xf(3,0,0,1,'horizontal="right" vertical="center"')                /*6 tm*/
    +xf(0,1,0,0,'horizontal="left" vertical="center"')                 /*7 lb*/
    +xf(3,5,0,1,'horizontal="right" vertical="center"')                /*8 bm*/
    +xf(0,3,0,0,'horizontal="left" vertical="center" wrapText="1"')    /*9 it*/
    +xf(0,5,0,1,'horizontal="right" vertical="center"')                /*10 rl*/
    +xf(164,0,0,1,'horizontal="center" vertical="center"')             /*11 pc*/
    +xf(0,0,0,0,'horizontal="left" vertical="center"')                 /*12 tr*/
    +xf(0,4,0,0,'horizontal="center" vertical="center"')               /*13 sm*/
    +xf(0,5,0,1,'horizontal=\"left\" vertical=\"center\" wrapText=\"1\"')      /*14 kv*/
    +'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/>'
    +'<cols><col min="1" max="1" width="7" customWidth="1"/><col min="2" max="2" width="46" customWidth="1"/><col min="3" max="3" width="11" customWidth="1"/><col min="4" max="4" width="17" customWidth="1"/><col min="5" max="5" width="20" customWidth="1"/></cols>'
    +'<sheetData>'+rows.join('')+'</sheetData><mergeCells count="'+merges.length+'">'+merges.join('')+'</mergeCells><pageMargins left="0.7" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="portrait" fitToWidth="1" fitToHeight="0"/></worksheet>';
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Bang_ke" sheetId="1" r:id="rId1"/></sheets><definedNames><definedName name="_xlnm.Print_Area" localSheetId="0">Bang_ke!$A$1:$E$'+r+'</definedName></definedNames><calcPr fullCalcOnLoad="1"/></workbook>');
  zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('xl/styles.xml',styles);zip.file('xl/worksheets/sheet1.xml',sheet);
  return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
/* ---- bản in (HTML) */
function bkPrint(b){
  const T=bkTotals(b),th=t=>h('th',{style:'border:1px solid #000;padding:4px 6px;background:#eee'},t),td=(t,al)=>h('td',{style:'border:1px solid #000;padding:4px 6px;text-align:'+(al||'left')},t);
  const g=b.giam||{},pct=g.kieu==='pct';
  const box=h('div',{class:'bk-print',style:'font-family:"Times New Roman",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},
    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG'),h('div',{style:'text-align:center;font-weight:bold'},'PHÒNG THÍ NGHIỆM CHUYÊN NGÀNH XÂY DỰNG'),
    h('div',{style:'text-align:center;font-size:11px;font-style:italic'},'23 Phan Huy Chú, phường Đồng Hới, tỉnh Quảng Trị'),
    h('h2',{style:'text-align:center;margin:14px 0 2px;font-size:18px'},bkTitle(b)),h('div',{style:'text-align:center;margin-bottom:10px'},'Số: '+b.so+' · Ngày '+fd(b.ngay)),
    h('div',null,h('b',null,'Tên khách hàng: '),b.khach.ten),h('div',null,h('b',null,'Tên công trình: '),b.cong_trinh||''),h('div',{style:'margin-bottom:10px'},h('b',null,'Phiếu yêu cầu: '),(b.yc||[]).join(', ')),
    h('table',{style:'border-collapse:collapse;width:100%'},h('thead',null,h('tr',null,th('TT'),th('Tên mẫu'),th('Số lượng'),th('Đơn giá (đồng)'),th('Thành tiền (đồng)'))),
      h('tbody',null,(b.dong||[]).map((l,i)=>h('tr',null,td(i+1,'center'),td(l.ten),td(fmtN(l.sl),'center'),td(fmtN(l.don_gia),'right'),td(fmtN(Math.round((+l.sl||0)*(+l.don_gia||0))),'right'))),
        h('tr',null,h('td',{colspan:4,style:'border:1px solid #000;padding:4px 6px;text-align:right;font-weight:bold'},'Tổng cộng'),td(fmtN(T.tong),'right')),
        h('tr',null,h('td',{colspan:4,style:'border:1px solid #000;padding:4px 6px;text-align:right;font-weight:bold'},pct?'Chiết khấu '+fmtN(Math.min(100,+g.gt||0))+' %':'Chiết khấu (giảm trừ)'),td(fmtN(T.giam),'right')),
        h('tr',null,h('td',{colspan:4,style:'border:1px solid #000;padding:4px 6px;text-align:right;font-weight:bold'},'THÀNH TIỀN SAU CHIẾT KHẤU'),h('td',{style:'border:1px solid #000;padding:4px 6px;text-align:right;font-weight:bold'},fmtN(T.tt))))),
    h('div',{style:'margin-top:8px;font-style:italic'},'Bằng chữ: '+docSo(T.tt)),
    bkNoteTam(b)?h('div',{style:'margin-top:4px;font-style:italic'},bkNoteTam(b)):null,b.ghi_chu?h('div',{style:'margin-top:4px'},'Ghi chú: '+b.ghi_chu):null,
    h('div',{style:'display:flex;justify-content:space-between;margin-top:22px;text-align:center'},h('div',null,h('b',null,'Đại diện khách hàng'),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên)')),h('div',null,h('b',null,'Người lập bảng kê'),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên)'))));
  return box;
}
function bkDoPrint(b){
  const box=bkPrint(b);document.body.append(box);document.documentElement.classList.add('printing-bk');
  const done=()=>{document.documentElement.classList.remove('printing-bk');box.remove();window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  try{window.print();}catch(e){done();toast('Máy không cho in trực tiếp. Bấm Tải Excel rồi in từ Excel.','bad');return;}
  setTimeout(()=>{if(document.documentElement.classList.contains('printing-bk'))done();},1500);
}
/* ---- trang */
const BK={tab:'bangke',draft:null,dirty:false,sel:new Set(),fil:{q:'',st:'',from:'',to:''}};
const ttSubHead=(t,sub,right)=>h('div',{class:'row',style:'justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px'},h('p',{class:'muted small',style:'margin:0'},sub),right||null);
function bkPrices(box,canEdit){
  const gia=Object.assign({},S.bgia||{}),inputs={};
  const rows=MAT_TYPES.map(([k,l])=>{const i=h('input',{type:'number',min:'0',step:'1000',inputmode:'numeric','aria-label':'Đơn giá '+l,disabled:!canEdit,style:'max-width:150px'});i.value=gia[k]||'';inputs[k]=i;return h('tr',null,h('td',null,l),h('td',null,i));});
  const save=h('button',{class:'btn primary',disabled:!canEdit,onclick:async()=>{const g={};Object.keys(inputs).forEach(k=>{const v=Math.max(0,Math.round(+inputs[k].value||0));if(v)g[k]=v;});
    const ok=await safe(()=>Data.set('config/bang_gia',{gia:g,by:SESSION.name,at:new Date().toISOString()}).then(()=>true),'Không lưu được bảng giá.');if(ok){S.bgia=g;await logAudit('Cập nhật bảng giá thử nghiệm','');toast('Đã lưu bảng giá. Bảng kê mới lấy đơn giá này.');}}},'Lưu bảng giá');
  box.append(h('div',{class:'card stack bk-prices'},h('h2',null,'Bảng giá theo loại mẫu'),h('p',{class:'muted small'},'Đơn giá cho 1 mẫu, đơn vị đồng. Bảng kê mới tự lấy giá ở đây, trong từng bảng kê vẫn sửa được. Để trống nghĩa là chưa có giá (bảng kê hiện 0, nhập tay).'),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,h('th',null,'Loại mẫu'),h('th',null,'Đơn giá (đ)'))),h('tbody',null,rows))),h('div',null,save)));
}
function bkPendingGroups(){
  const used=new Set();bkAll().forEach(b=>{if(b.trang_thai!=='huy')(b.ycKeys||[]).forEach(k=>used.add(k));});
  return ycGroups().filter(e=>!used.has(e.key));
}
function bkOpenDraft(b){BK.draft=b;BK.dirty=false;BK.tab='bangke';render();}
function bkList(box,canEdit){
  const f=BK.fil,all=bkAll().filter(b=>b.so).sort((a,b)=>a.so<b.so?1:-1);
  const live=all.filter(b=>b.trang_thai!=='huy'),sumT=l=>l.reduce((a,b)=>a+bkTotals(b).tt,0);
  const pend=bkPendingGroups(),ptam=live.filter(bkTam).length;
  box.append(h('div',{class:'pipe'},[['Bảng kê',live.length],['Tổng giá trị',fmtN(sumT(live))+' đ'],['Chưa thanh toán',fmtN(sumT(live.filter(b=>b.trang_thai!=='da_thu')))+' đ'],['Đã thanh toán',fmtN(sumT(live.filter(b=>b.trang_thai==='da_thu')))+' đ'],['Phiếu chưa lập bảng kê',pend.length]].map(([l,v])=>h('div',{class:'st','data-zero':'0','data-end':'0'},h('b',{style:'font-size:18px'},v),h('span',null,l)))));
  /* phiếu chưa lập bảng kê */
  const fr=h('input',{type:'date','aria-label':'Từ ngày tạo phiếu',value:f.from,style:'width:160px;max-width:160px',onchange:e=>{f.from=e.target.value;render();}}),to=h('input',{type:'date','aria-label':'Đến ngày tạo phiếu',value:f.to,style:'width:160px;max-width:160px',onchange:e=>{f.to=e.target.value;render();}});
  const pl=pend.filter(e=>(!f.from||e.ngay>=f.from)&&(!f.to||e.ngay<=f.to));
  const gk=new Map();pl.forEach(e=>{const k=(e.khach&&e.khach.ten)||'(chưa rõ khách)';(gk.get(k)||gk.set(k,[]).get(k)).push(e);});
  BK.sel=new Set(Array.from(BK.sel).filter(k=>pl.some(e=>e.key===k)));
  const pcard=h('div',{class:'card stack'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Phiếu yêu cầu chưa lập bảng kê'),h('p',{class:'muted small'},'Mẫu chưa hoàn thành vẫn lập được (tạm tính) để khách biết trước chi phí. Chọn một hoặc nhiều phiếu của cùng khách rồi bấm Lập bảng kê.')),
    h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},h('label',{class:'small muted'},'Ngày tạo phiếu từ '),fr,h('label',{class:'small muted'},' đến '),to,(f.from||f.to)?h('button',{class:'btn sm ghost',onclick:()=>{f.from='';f.to='';render();}},'Bỏ lọc'):null)));
  if(!pl.length)pcard.append(emptyState('Không có phiếu chờ lập bảng kê','Phiếu yêu cầu đã nhận mẫu sẽ hiện ở đây.'));
  Array.from(gk.keys()).sort().forEach(name=>{
    const es=gk.get(name);
    const mk=h('button',{class:'btn sm primary',disabled:!canEdit,onclick:()=>{const gs=es.filter(e=>BK.sel.has(e.key));if(!gs.length){toast('Chọn ít nhất một phiếu của khách này.','bad');return;}bkOpenDraft(bkDraftFrom(gs,false));}},'Lập bảng kê cho phiếu đã chọn');
    pcard.append(h('div',{class:'stack',style:'border-top:1px solid var(--line);padding-top:8px'},h('div',{class:'card-h'},h('b',null,name),mk),
      h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['','Số phiếu','Ngày tạo','Công trình','Mẫu (xong/tổng)',''].map(x=>h('th',null,x)))),
        h('tbody',null,es.map(e=>{const cb=h('input',{type:'checkbox','aria-label':'Chọn phiếu '+e.so_yc,checked:BK.sel.has(e.key),disabled:!canEdit,onchange:ev=>{ev.target.checked?BK.sel.add(e.key):BK.sel.delete(e.key);}});
          return h('tr',null,h('td',null,cb),h('td',null,code(e.so_yc)),h('td',null,fd(e.ngay)),h('td',null,e.cong_trinh),h('td',null,e.xong+'/'+e.mau.length+(e.xong<e.mau.length?' (tạm tính)':'')),
            h('td',null,h('button',{class:'btn sm',disabled:!canEdit,onclick:()=>bkOpenDraft(bkDraftFrom([e],false))},'Lập riêng')));}))))));
  });
  /* danh sách bảng kê */
  const q=h('input',{type:'text',placeholder:'Tìm số bảng kê, khách hàng, công trình, số phiếu','aria-label':'Tìm bảng kê',value:f.q,style:'width:280px;max-width:100%',oninput:e=>{f.q=e.target.value;lst.replaceChildren(...rowsOf());}});
  const st=h('select',{'aria-label':'Trạng thái bảng kê',style:'width:180px',onchange:e=>{f.st=e.target.value;lst.replaceChildren(...rowsOf());}},h('option',{value:''},'Mọi trạng thái'),Object.keys(BK_ST).map(k=>h('option',{value:k},BK_ST[k][0])));st.value=f.st;
  const rowsOf=()=>{const t=f.q.trim().toLowerCase();
    return all.filter(b=>(!f.st||b.trang_thai===f.st)&&(!t||[b.so,b.khach.ten,b.cong_trinh,(b.yc||[]).join(' ')].join(' ').toLowerCase().includes(t))).map(b=>{
      const T=bkTotals(b),dl=bkDelta(b),n=(b.dong||[]).reduce((a,l)=>a+(l.tay?0:l.n),0),x=(b.dong||[]).reduce((a,l)=>a+(l.tay?0:l.xong),0);
      return h('tr',null,h('td',null,code(b.so)),h('td',null,fd(b.ngay)),h('td',null,b.khach.ten),h('td',null,b.cong_trinh||''),h('td',null,x+'/'+n),h('td',{class:'num'},fmtN(T.tt)+' đ'),
        h('td',null,tonePill(BK_ST[b.trang_thai]?BK_ST[b.trang_thai][0]:b.trang_thai,BK_ST[b.trang_thai]?BK_ST[b.trang_thai][1]:'neutral'),bkTam(b)&&b.trang_thai!=='huy'?h('span',null,' ',tonePill('Tạm tính','warn')):null,dl?h('span',null,' ',tonePill('Phiếu đã đổi'+(dl.them?' (+'+dl.them+' mẫu)':''),'info')):null),
        h('td',null,h('button',{class:'btn sm',onclick:()=>bkOpenDraft(JSON.parse(JSON.stringify(b)))},'Mở')));});};
  const lst=h('tbody',null,rowsOf());
  box.append(pcard,h('div',{class:'card stack'},h('div',{class:'card-h'},h('h2',null,'Bảng kê đã lập'),h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},q,st,
    h('button',{class:'btn sm',disabled:!all.length,onclick:()=>csvSave('danh-sach-bang-ke.csv',['Số bảng kê','Ngày','Khách hàng','Công trình','Phiếu yêu cầu','Tổng cộng','Chiết khấu','Thành tiền','Trạng thái'],all.map(b=>{const T=bkTotals(b);return[b.so,fd(b.ngay),b.khach.ten,b.cong_trinh||'',(b.yc||[]).join(' '),T.tong,T.giam,T.tt,(BK_ST[b.trang_thai]||[b.trang_thai])[0]];}))},'Xuất danh sách (CSV)'))),
    all.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số bảng kê','Ngày','Khách hàng','Công trình','Mẫu (xong/tổng)','Thành tiền','Trạng thái',''].map(x=>h('th',null,x)))),lst)):emptyState('Chưa có bảng kê','Chọn phiếu ở trên rồi bấm Lập bảng kê.')));
}
function bkEditor(box,canEdit){
  const b=BK.draft,locked=!canEdit||b.trang_thai==='da_thu'||b.trang_thai==='huy';
  const mark=()=>{BK.dirty=true;dirt.hidden=false;};
  const dirt=h('span',{hidden:true},tonePill('Chưa lưu','warn'));
  const tot=h('div',{class:'stack',style:'align-items:flex-end'}),words=h('p',{class:'muted small'}),tamNote=h('div',{class:'banner','data-tone':'warn'});
  const body=h('tbody');
  const refresh=()=>{const T=bkTotals(b);
    tot.replaceChildren(h('div',null,'Tổng cộng: ',h('b',null,fmtN(T.tong)+' đ')),h('div',null,'Chiết khấu: ',h('b',null,'− '+fmtN(T.giam)+' đ')),h('div',{style:'font-size:17px'},'Thành tiền: ',h('b',null,fmtN(T.tt)+' đ')));
    words.textContent='Bằng chữ: '+docSo(T.tt);const nt=bkNoteTam(b);tamNote.replaceChildren(h('div',null,nt));tamNote.hidden=!nt;
    body.querySelectorAll('tr').forEach((tr,i)=>{const l=b.dong[i];if(l&&tr.lastChild)tr.querySelector('.bk-amt').textContent=fmtN(Math.round((+l.sl||0)*(+l.don_gia||0)))+' đ';});};
  const rowsBuild=()=>{body.replaceChildren(...b.dong.map((l,i)=>{
    const nm=h('input',{type:'text','aria-label':'Tên mẫu dòng '+(i+1),value:l.ten,disabled:locked,style:'min-width:200px',oninput:e=>{l.ten=e.target.value;mark();}});
    const sl=h('input',{type:'number',min:'0',step:'1',inputmode:'numeric','aria-label':'Số lượng dòng '+(i+1),value:l.sl,disabled:locked,style:'max-width:80px',oninput:e=>{l.sl=Math.max(0,Math.round(+e.target.value||0));mark();refresh();}});
    const dg=h('input',{type:'number',min:'0',step:'1000',inputmode:'numeric','aria-label':'Đơn giá dòng '+(i+1),value:l.don_gia||'',disabled:locked,style:'max-width:130px',oninput:e=>{l.don_gia=Math.max(0,Math.round(+e.target.value||0));mark();refresh();}});
    const del=h('button',{class:'btn sm ghost',disabled:locked,'aria-label':'Xóa dòng '+(i+1),onclick:()=>{b.dong.splice(i,1);mark();rowsBuild();refresh();}},'Xóa');
    return h('tr',null,h('td',null,i+1),h('td',null,nm,l.tay?null:h('div',{class:'muted small'},l.xong+'/'+l.n+' mẫu đã hoàn thành'+(l.sl!==l.n?' · số lượng đã sửa tay':''))),h('td',null,sl),h('td',null,dg),h('td',{class:'num bk-amt'},''),h('td',null,del));}));};
  const ten=h('input',{type:'text',id:'bk-kh',value:b.khach.ten,disabled:locked,oninput:e=>{b.khach.ten=e.target.value;mark();}}),ct=h('input',{type:'text',id:'bk-ct',value:b.cong_trinh||'',disabled:locked,oninput:e=>{b.cong_trinh=e.target.value;mark();}});
  const ng=h('input',{type:'date',id:'bk-ng',value:b.ngay,disabled:locked,onchange:e=>{b.ngay=e.target.value||b.ngay;mark();}});
  const cx=h('input',{type:'checkbox',id:'bk-cx',checked:!b.chi_xong,disabled:locked,onchange:e=>{b.chi_xong=!e.target.checked;b.dong=bkLines(ycGroups().filter(x=>(b.ycKeys||[]).includes(x.key)),b.chi_xong,b.dong);mark();rowsBuild();refresh();}});
  const kieu=h('select',{id:'bk-kieu','aria-label':'Cách tính chiết khấu',disabled:locked,style:'width:260px',onchange:e=>{b.giam.kieu=e.target.value;gt.step=e.target.value==='pct'?'0.5':'1000';mark();refresh();}},h('option',{value:'pct'},'Theo % trên tổng cộng'),h('option',{value:'amt'},'Giảm trừ theo số tiền (đồng)'));kieu.value=b.giam.kieu==='amt'?'amt':'pct';
  const gt=h('input',{type:'number',min:'0',step:b.giam.kieu==='amt'?'1000':'0.5',inputmode:'decimal','aria-label':'Giá trị chiết khấu',value:b.giam.gt||'',disabled:locked,style:'max-width:150px',oninput:e=>{b.giam.gt=Math.max(0,+e.target.value||0);mark();refresh();}});
  const gc=h('textarea',{id:'bk-gc',rows:'2',disabled:locked,oninput:e=>{b.ghi_chu=e.target.value;mark();}});gc.value=b.ghi_chu||'';
  const status=BK_ST[b.trang_thai]||['',''];
  const doSave=async()=>{if(!b.khach.ten.trim()){toast('Nhập tên khách hàng.','bad');return false;}if(!b.dong.length){toast('Bảng kê chưa có dòng nào.','bad');return false;}
    if(b.giam.kieu==='pct'&&+b.giam.gt>100){toast('Chiết khấu theo % không quá 100.','bad');return false;}
    const ok=await bkSave(b);if(ok){BK.dirty=false;dirt.hidden=true;toast('Đã lưu bảng kê '+b.so+'.');render();}return ok;};
  const setSt=async(tr,label,extra)=>{if(BK.dirty&&!(await doSave()))return;const was=b.trang_thai;b.trang_thai=tr;Object.assign(b,extra||{});const ok=await bkSave(b);
    if(!ok){b.trang_thai=was;return;}if(tr==='da_thu')await bkSyncPaid(b,true);if(was==='da_thu'&&tr!=='da_thu')await bkSyncPaid(b,false);await logAudit(label+' bảng kê '+b.so,b.khach.ten);toast(label+'.');render();};
  const askCancel=()=>{const m=openModal({title:'Hủy bảng kê '+b.so,sub:'Bảng kê hủy vẫn lưu để đối chiếu, phiếu yêu cầu quay lại danh sách chưa lập bảng kê.',body:[],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Không hủy'),h('button',{class:'btn primary',onclick:async()=>{m.close();await setSt('huy','Hủy');}},'Hủy bảng kê')]});};
  const bar=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},
    h('button',{class:'btn primary',disabled:locked,onclick:doSave},b.id?'Lưu bảng kê':'Lưu và cấp số bảng kê'),
    h('button',{class:'btn',disabled:locked||!b.id,title:b.id?'':'Lưu bảng kê trước',onclick:()=>{const gs=ycGroups().filter(x=>(b.ycKeys||[]).includes(x.key));if(!gs.length){toast('Không tìm thấy phiếu yêu cầu trong dữ liệu đang tải.','bad');return;}b.dong=bkLines(gs,!!b.chi_xong,b.dong);mark();rowsBuild();refresh();toast('Đã cập nhật số mẫu từ phiếu. Bấm Lưu để ghi.');}},'Cập nhật số mẫu từ phiếu'),
    h('button',{class:'btn',disabled:locked,onclick:()=>{b.dong.forEach(l=>{if(!l.tay)l.don_gia=(S.bgia&&+S.bgia[l.loai])||l.don_gia;});mark();rowsBuild();refresh();toast('Đã lấy lại đơn giá từ bảng giá.');}},'Lấy lại đơn giá từ bảng giá'),
    h('button',{class:'btn',disabled:locked,onclick:()=>{b.dong.push({k:'tay|'+rid(),ten:'',loai:'',sl:1,n:1,xong:1,don_gia:0,ma:[],tay:true});mark();rowsBuild();refresh();}},'Thêm dòng'),
    h('button',{class:'btn',disabled:!b.dong.length,onclick:async()=>{await saveBytes((b.so||'bang-ke-moi').replace(/[^A-Za-z0-9._-]/g,'_')+'.xlsx',await bkXlsx(b));}},'Tải Excel'),
    h('button',{class:'btn',disabled:!b.dong.length,onclick:()=>bkDoPrint(b)},'In'));
  const sbar=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},
    b.trang_thai==='nhap'?h('button',{class:'btn',disabled:!canEdit||!b.id,onclick:()=>setSt('da_gui','Đã gửi khách')},'Đánh dấu đã gửi khách'):null,
    (b.trang_thai==='nhap'||b.trang_thai==='da_gui')?h('button',{class:'btn',disabled:!canEdit||!b.id,onclick:()=>setSt('da_thu','Đã thanh toán',{thu:{at:new Date().toISOString(),by:SESSION.name,so_tien:bkTotals(b).tt}})},'Ghi nhận đã thanh toán'):null,
    b.trang_thai==='da_thu'?h('button',{class:'btn',disabled:!canEdit,onclick:()=>setSt('da_gui','Bỏ ghi nhận thanh toán',{thu:null})},'Bỏ ghi nhận thanh toán'):null,
    (b.trang_thai==='huy')?h('button',{class:'btn',disabled:!canEdit,onclick:()=>setSt('nhap','Khôi phục')},'Khôi phục bảng kê'):null,
    (b.id&&b.trang_thai!=='huy'&&b.trang_thai!=='da_thu')?h('button',{class:'btn ghost',disabled:!canEdit,onclick:askCancel},'Hủy bảng kê'):null,
    (b.khach.email||b.id)?h('button',{class:'btn ghost',disabled:!b.id,onclick:()=>bkMail(b)},'Soạn nội dung gửi khách'):null);
  box.append(h('div',{class:'card stack'},
    h('div',{class:'card-h'},h('div',null,h('h2',null,bkTitle(b)),h('p',{class:'muted small'},(b.so?'Số '+b.so:'Số bảng kê sẽ cấp khi lưu: BK'+b.ngay.slice(2,4)+'.'+b.ngay.slice(5,7)+'.'+b.ngay.slice(8,10)+'.STT')+' · phiếu '+(b.yc||[]).join(', '))),
      h('div',{class:'row'},status[0]?tonePill(status[0],status[1]):tonePill('Mới','info'),dirt,h('button',{class:'btn sm ghost',onclick:()=>{const go=()=>{BK.draft=null;BK.dirty=false;render();};if(!BK.dirty){go();return;}const m=openModal({title:'Chưa lưu bảng kê',sub:'Đóng sẽ mất các thay đổi chưa lưu.',body:[],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Quay lại sửa'),h('button',{class:'btn primary',onclick:()=>{m.close();go();}},'Đóng, bỏ thay đổi')]});}},'Đóng'))),
    locked&&b.trang_thai==='da_thu'?h('div',{class:'banner','data-tone':'info'},h('div',null,'Bảng kê đã ghi nhận thanh toán nên khóa sửa. Bấm Bỏ ghi nhận thanh toán nếu cần sửa.')):null,
    h('div',{class:'grid3'},h('div',{class:'field',style:'grid-column:span 2'},h('label',{for:'bk-kh'},'Tên khách hàng'),ten),h('div',{class:'field'},h('label',{for:'bk-ng'},'Ngày bảng kê (mặc định ngày tạo phiếu)'),ng)),
    h('div',{class:'field'},h('label',{for:'bk-ct'},'Tên công trình'),ct),
    h('label',{class:'chk'},cx,h('span',null,'Tính cả mẫu chưa hoàn thành (tạm tính). Bỏ chọn để chỉ tính mẫu đã phát hành phiếu kết quả.')),
    tamNote,
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['TT','Tên mẫu','Số lượng','Đơn giá (đ)','Thành tiền',''].map(x=>h('th',null,x)))),body)),
    h('div',{class:'row',style:'gap:12px;flex-wrap:wrap;align-items:flex-end'},h('div',{class:'field'},h('label',{for:'bk-kieu'},'Chiết khấu'),h('div',{class:'row',style:'gap:6px'},kieu,gt))),
    h('div',{class:'row',style:'justify-content:flex-end'},tot),words,
    h('div',{class:'field'},h('label',{for:'bk-gc'},'Ghi chú (in trên bảng kê)'),gc),
    bar,sbar));
  rowsBuild();refresh();
}
function bkMail(b){
  const T=bkTotals(b),k=b.khach;
  const subj='Bảng kê thanh toán '+b.so+' - '+k.ten;
  const body='Kính gửi '+(k.lien_he||k.ten)+',\n\nPhòng thí nghiệm gửi bảng kê thanh toán '+b.so+(bkTam(b)?' (tạm tính)':'')+' cho công trình '+(b.cong_trinh||'')+':\n\n'
    +(b.dong||[]).map((l,i)=>(i+1)+'. '+l.ten+': '+fmtN(l.sl)+' x '+fmtN(l.don_gia)+' = '+fmtN(Math.round((+l.sl||0)*(+l.don_gia||0)))+' đ').join('\n')
    +'\n\nTổng cộng: '+fmtN(T.tong)+' đ'+(T.giam?'\nChiết khấu: '+fmtN(T.giam)+' đ':'')+'\nThành tiền: '+fmtN(T.tt)+' đ ('+docSo(T.tt)+')\n'+(bkNoteTam(b)?'\n'+bkNoteTam(b)+'\n':'')+'\nTrân trọng,\nPhòng thí nghiệm';
  const ta=h('textarea',{rows:'14'});ta.value=body;
  const m=openModal({title:'Nội dung gửi khách',sub:b.so,wide:true,body:[h('div',{class:'field'},h('label',null,'Người nhận'),h('div',{class:'row'},h('input',{type:'text',readonly:true,value:k.email||''}),copyBtn(k.email||''))),h('div',{class:'field'},h('label',null,'Tiêu đề'),h('div',{class:'row'},h('input',{type:'text',readonly:true,value:subj}),copyBtn(subj))),h('div',{class:'field'},h('label',null,'Nội dung'),ta,h('div',null,copyBtn(body)))],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng')]});
}
pages['thanh-toan']={render(root){
  const canEdit=hasRole('kt')||hasRole('tp');bkWatchInit();
  root.append(pageHead('Thanh toán','Lập bảng kê theo phiếu yêu cầu, chiết khấu, theo dõi thanh toán. Phiếu kết quả trả cho khách ngay khi phát hành, khách thanh toán sau.'));
  root.append(h('div',{class:'tabs',role:'tablist',style:'margin-bottom:12px'},[['bangke','Bảng kê thanh toán'],['banggia','Bảng giá'],['phieu','Phiếu kết quả, bản giấy']].map(([k,l])=>h('button',{role:'tab','aria-selected':BK.tab===k,'data-tab':k,onclick:()=>{if(BK.draft&&BK.dirty&&k!=='bangke'){toast('Lưu hoặc đóng bảng kê đang sửa trước.','bad');return;}BK.tab=k;render();}},l))));
  const box=h('div',{class:'stack'});root.append(box);
  if(BK.tab==='banggia')bkPrices(box,canEdit);else if(BK.tab==='phieu')ttOldRender(box);else if(BK.draft)bkEditor(box,canEdit);else bkList(box,canEdit);
},update(){if(BK.draft)return;const a=document.activeElement;if(a&&a.closest&&a.closest('.pay,.bk-prices')&&/INPUT|SELECT/.test(a.tagName))return;if(a&&a.type==='text'&&a.placeholder)return;render();}};
