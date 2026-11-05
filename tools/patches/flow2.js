/* ---- bảng Excel đơn giản (tổng hợp thanh toán) */
async function bkTblXlsx(title,sub,head,rows,o){
  const colL=i=>String.fromCharCode(65+i),W=o.widths||[],num=new Set(o.num||[]),sum=o.sum||[];let r=0;const rs=[],merges=[];
  const c=(i,v,st,isNum,f)=>{const ref=colL(i)+r;return isNum?(v===''||v==null?'<c r="'+ref+'" s="'+st+'"/>':'<c r="'+ref+'" s="'+st+'">'+(f?'<f>'+xe(f)+'</f>':'')+'<v>'+(+v||0)+'</v></c>'):'<c r="'+ref+'" s="'+st+'" t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>';};
  const add=(cells,ht)=>{r++;rs.push('<row r="'+r+'"'+(ht?' ht="'+ht+'" customHeight="1"':'')+'>'+cells.map(a=>c(a[0],a[1],a[2],a[3],a[4])).join('')+'</row>');return r;};
  const N=head.length,full=(txt,st,ht)=>{const rr=add([[0,txt,st]].concat(head.slice(1).map((x,i)=>[i+1,'',st])),ht);merges.push('A'+rr+':'+colL(N-1)+rr);};
  full(title,1,26);full(sub,9,22);add([],6);
  add(head.map((x,i)=>[i,x,2]),32);const first=r+1;
  rows.forEach(row=>add(row.map((v,i)=>num.has(i)?[i,v,4,true]:[i,v,(i===0?7:3)])));
  const last=r;
  if(sum.length&&rows.length){add(head.map((x,i)=>sum.includes(i)?[i,rows.reduce((a,x)=>a+(+x[i]||0),0),6,true,'SUM('+colL(i)+first+':'+colL(i)+last+')']:[i,i===1?'Tổng cộng':'',5]));}
  const font=(sz,bold,it)=>'<font>'+(bold?'<b/>':'')+(it?'<i/>':'')+'<sz val="'+sz+'"/><name val="Times New Roman"/><family val="1"/></font>';
  const xf=(num,fo,fi,bo,al)=>'<xf numFmtId="'+num+'" fontId="'+fo+'" fillId="'+fi+'" borderId="'+bo+'" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment '+al+'/></xf>';
  const bd='<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="4">'+font(11)+font(11,1)+font(14,1)+font(10,0,1)+'</fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF0"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'+bd+'</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="10">'
    +xf(0,0,0,0,'vertical="center"')+xf(0,2,0,0,'horizontal="center" vertical="center"')+xf(0,1,2,1,'horizontal="center" vertical="center" wrapText="1"')
    +xf(0,0,0,1,'horizontal="left" vertical="center" wrapText="1"')+xf(3,0,0,1,'horizontal="right" vertical="center"')
    +xf(0,1,2,1,'horizontal="left" vertical="center" wrapText="1"')+xf(3,1,2,1,'horizontal="right" vertical="center"')
    +xf(0,0,0,1,'horizontal="center" vertical="center"')+xf(0,1,0,0,'horizontal="left" vertical="center"')+xf(0,3,0,0,'horizontal="center" vertical="center"')
    +'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols>'+W.map((w,i)=>'<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+w+'" customWidth="1"/>').join('')+'</cols><sheetData>'+rs.join('')+'</sheetData><mergeCells count="'+merges.length+'">'+merges.join('')+'</mergeCells><pageMargins left="0.5" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/></worksheet>';
  const zip=new JSZip(),sn=o.sheet||'Tong_hop';
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+sn+'" sheetId="1" r:id="rId1"/></sheets><calcPr fullCalcOnLoad="1"/></workbook>');
  zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('xl/styles.xml',styles);zip.file('xl/worksheets/sheet1.xml',sheet);
  return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
/* ---- tổng hợp thanh toán */
const SUM_ST=[['','Đã duyệt, mọi tình trạng thanh toán'],['chua','Chưa thanh toán'],['mot','Thanh toán một phần'],['da','Đã thanh toán đủ'],['cho_xn','Đang chờ thủ quỹ xác nhận'],['chua_duyet','Chưa duyệt (nháp, chờ soát xét, chờ ký)'],['tat_ca','Tất cả bảng kê']];
function bkSumRows(f){
  const t=(f.q||'').trim().toLowerCase();
  return bkAll().filter(b=>b.so&&b.trang_thai!=='huy').filter(b=>{const P=bkPay(b),du=b.trang_thai==='da_duyet';
    if(f.st==='')return du;if(f.st==='tat_ca')return true;if(f.st==='chua_duyet')return!du;
    if(!du)return false;if(f.st==='cho_xn')return P.cho>0;return P.st===f.st;})
    .filter(b=>(!f.from||b.ngay>=f.from)&&(!f.to||b.ngay<=f.to)&&(!t||[b.so,b.khach.ten,b.cong_trinh,(b.yc||[]).join(' ')].join(' ').toLowerCase().includes(t)))
    .sort((a,b)=>a.so<b.so?1:-1);
}
const bkSumTbl=l=>l.map(b=>{const P=bkPay(b);return[b.khach.ten,b.cong_trinh||'',b.so,P.tt,P.da,P.con,fd(b.ngay),P.ngay?fd(P.ngay):'',(bkStLabel(b)||[''])[0]];});
function bkPendingPays(){const out=[];bkAll().forEach(b=>{if(b.trang_thai==='da_duyet')(b.pay||[]).forEach(p=>{if(p.tt==='cho_tq')out.push({b,p});});});return out.sort((x,y)=>(x.p.de&&x.p.de.at||'')<(y.p.de&&y.p.de.at||'')?-1:1);}
function bkSummary(box,lap,tq){
  const f=BK.sf||(BK.sf={q:'',st:'',from:'',to:''});BK.psel=BK.psel||new Set();
  const du=bkAll().filter(b=>b.so&&b.trang_thai==='da_duyet'),P=du.map(bkPay),tot=bkSum(P,x=>x.tt),da=bkSum(P,x=>x.da),pend=bkPendingPays();
  box.append(h('div',{class:'pipe'},[['Bảng kê đã duyệt',du.length],['Tổng giá trị',fmtN(tot)+' đ'],['Đã thanh toán',fmtN(da)+' đ'],['Còn lại',fmtN(tot-da)+' đ'],['Chờ thủ quỹ xác nhận',pend.length]].map(([l,v])=>h('div',{class:'st','data-zero':'0','data-end':'0'},h('b',{style:'font-size:18px'},v),h('span',null,l)))));
  if(pend.length)box.append(h('div',{class:'card stack','data-sec':'pend'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Đề nghị thanh toán chờ thủ quỹ xác nhận'),h('p',{class:'muted small'},'Kế toán đã ghi nhận khách thanh toán. Thủ quỹ đối chiếu tiền về tài khoản cơ quan hoặc tiền mặt rồi bấm Đã thanh toán.'))),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số bảng kê','Khách hàng','Hình thức','Ngày','Số tiền','Ghi chú','Người đề nghị',''].map(x=>h('th',null,x)))),
      h('tbody',null,pend.map(({b,p})=>h('tr',null,h('td',null,code(b.so)),h('td',null,b.khach.ten),h('td',null,HT_L[p.ht]||''),h('td',null,fd(p.ngay)),h('td',{class:'num'},fmtN(p.so_tien)+' đ'),h('td',null,p.ct||''),h('td',null,(p.de&&p.de.by)||''),
        h('td',null,h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},
          tq?h('button',{class:'btn sm primary','data-act':'pay-ok',onclick:()=>bkConfirmPay(b,p)},'Đã thanh toán'):null,
          tq?h('button',{class:'btn sm','data-act':'pay-ret',onclick:()=>bkPayFlow(b,p,'tra')},'Trả lại'):null,
          lap?h('button',{class:'btn sm ghost','data-act':'pay-rut',onclick:()=>bkPayFlow(b,p,'rut')},'Rút lại'):null,
          h('button',{class:'btn sm ghost',onclick:()=>{BK.tab='bangke';bkOpenDraft(JSON.parse(JSON.stringify(b)));}},'Mở')))))))))); 
  const q=h('input',{type:'text',placeholder:'Tìm khách hàng, công trình, số bảng kê','aria-label':'Tìm trong tổng hợp',value:f.q,style:'width:260px;max-width:100%',oninput:e=>{f.q=e.target.value;fill();}});
  const st=h('select',{'aria-label':'Tình trạng',style:'width:260px',onchange:e=>{f.st=e.target.value;BK.psel.clear();fill();}},SUM_ST.map(([k,l])=>h('option',{value:k},l)));st.value=f.st;
  const fr=h('input',{type:'date','aria-label':'Từ ngày lập',value:f.from,style:'width:150px',onchange:e=>{f.from=e.target.value;fill();}}),to=h('input',{type:'date','aria-label':'Đến ngày lập',value:f.to,style:'width:150px',onchange:e=>{f.to=e.target.value;fill();}});
  const body=h('tbody'),foot=h('tfoot'),btnSend=h('button',{class:'btn primary',disabled:true,'data-act':'sum-send',onclick:()=>{const l=bkSumRows(f).filter(b=>BK.psel.has(b.id));if(!l.length)return;bkPayDlg(l);}},'Khách đã thanh toán, gửi thủ quỹ xác nhận');
  const elig=b=>b.trang_thai==='da_duyet'&&(()=>{const P=bkPay(b);return P.con-P.cho>0;})();
  function fill(){
    const l=bkSumRows(f);BK.psel=new Set(Array.from(BK.psel).filter(id=>l.some(b=>b.id===id&&elig(b))));
    body.replaceChildren(...l.map((b,i)=>{const P=bkPay(b),sl=bkStLabel(b),cb=h('input',{type:'checkbox','aria-label':'Chọn '+b.so,checked:BK.psel.has(b.id),disabled:!lap||!elig(b),onchange:e=>{e.target.checked?BK.psel.add(b.id):BK.psel.delete(b.id);btnSend.disabled=!BK.psel.size;}});
      const ds=(b.pay||[]).filter(x=>x.tt==='da_xn').map(x=>fd(x.ngay_xn||x.ngay)+': '+fmtN(x.so_tien)+' đ').join('\n');
      return h('tr',null,h('td',null,lap?cb:null),h('td',null,i+1),h('td',null,b.khach.ten),h('td',null,b.cong_trinh||''),h('td',null,code(b.so)),h('td',{class:'num'},fmtN(P.tt)),h('td',{class:'num'},fmtN(P.da)),h('td',{class:'num'},fmtN(P.con)),h('td',null,fd(b.ngay)),h('td',{title:ds},P.ngay?fd(P.ngay):''),
        h('td',null,tonePill(sl[0],sl[1]),P.cho>0?h('span',null,' ',tonePill('Chờ xác nhận','warn')):null),h('td',null,h('button',{class:'btn sm',onclick:()=>{BK.tab='bangke';bkOpenDraft(JSON.parse(JSON.stringify(b)));}},'Mở')));}));
    foot.replaceChildren(l.length?h('tr',{class:'bk-grp'},h('td',{colspan:'5',style:'text-align:right'},h('b',null,'Cộng '+l.length+' bảng kê')),h('td',{class:'num','data-label':'Giá trị (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).tt)))),h('td',{class:'num','data-label':'Đã thanh toán (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).da)))),h('td',{class:'num','data-label':'Còn lại (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).con)))),h('td',{colspan:'4'})):h('tr',null,h('td',{colspan:'12',class:'muted'},'Không có bảng kê nào phù hợp.')));
    btnSend.disabled=!BK.psel.size;
  }
  const xl=h('button',{class:'btn','data-act':'sum-xlsx',onclick:async()=>{const l=bkSumRows(f);if(!l.length){toast('Không có dòng nào để xuất.','bad');return;}
    const rows=bkSumTbl(l).map((r,i)=>[i+1].concat(r));
    await saveBytes('Tong_hop_thanh_toan_'+todayISO()+'.xlsx',await bkTblXlsx('TỔNG HỢP THANH TOÁN CÁC BẢNG KÊ','Tình trạng lọc: '+(SUM_ST.find(x=>x[0]===f.st)||[])[1]+' · xuất ngày '+fd(todayISO()),['TT','Tên khách hàng','Công trình','Số bảng kê','Giá trị (đ)','Đã thanh toán (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái'],rows,{num:[4,5,6],sum:[4,5,6],widths:[6,34,40,18,16,18,16,14,16,26]}));}},'Xuất Excel');
  box.append(h('div',{class:'card stack'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Tổng hợp thanh toán các bảng kê'),h('p',{class:'muted small'},'Mặc định hiện các bảng kê đã duyệt (đã ký, đóng dấu). Kế toán tích chọn bảng kê khách đã thanh toán rồi gửi thủ quỹ xác nhận; có thể thanh toán nhiều đợt.')),h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},btnSend,xl)),
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;align-items:center'},q,st,h('label',{class:'small muted'},'Ngày lập từ'),fr,h('label',{class:'small muted'},'đến'),to),
    h('div',{class:'tbl-wrap'},h('table',{class:'bk-sum'},h('thead',null,h('tr',null,['','TT','Tên khách hàng','Công trình','Số bảng kê','Giá trị (đ)','Đã thanh toán (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái',''].map(x=>h('th',null,x)))),body,foot))));
  fill();
}
/* ---- thiết lập tài khoản nhận thanh toán */
function bkBankCard(box,canEdit){
  const B=bkBank(),stk=h('input',{type:'text',inputmode:'numeric','aria-label':'Số tài khoản',value:B.stk,disabled:!canEdit}),ten=h('input',{type:'text','aria-label':'Tên chủ tài khoản',value:B.ten||'',placeholder:'Không bắt buộc, chỉ để hiện trên bảng kê',disabled:!canEdit});
  const bank=h('select',{'aria-label':'Ngân hàng',disabled:!canEdit},BANKS.map(([bin,n])=>h('option',{value:bin},n)));bank.value=BANKS.some(x=>x[0]===B.bin)?B.bin:BANK_DEF.bin;
  const prev=h('div',{class:'muted small'}),save=h('button',{class:'btn primary',disabled:!canEdit,'data-act':'bank-save',onclick:async()=>{
    const s=stk.value.replace(/\s+/g,'');if(!/^\d{6,19}$/.test(s)){toast('Số tài khoản gồm 6 đến 19 chữ số.','bad');return;}
    const bn=BANKS.find(x=>x[0]===bank.value),doc={stk:s,bin:bank.value,bank:bn?bn[1]:BANK_DEF.bank,ten:ten.value.trim(),by:SESSION.name,at:new Date().toISOString()};
    const ok=await safe(()=>Data.set('config/bank',doc).then(()=>true),'Không lưu được tài khoản nhận thanh toán.');if(ok){S.bankCfg={stk:doc.stk,bin:doc.bin,bank:doc.bank,ten:doc.ten};await logAudit('Cập nhật tài khoản nhận thanh toán',doc.bank+' '+doc.stk);toast('Đã lưu tài khoản nhận thanh toán. Mã QR trên bảng kê dùng tài khoản này.');}}},'Lưu tài khoản');
  box.append(h('div',{class:'card stack bk-bank'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Tài khoản nhận thanh toán (mã QR trên bảng kê)'),h('p',{class:'muted small'},'Mã QR theo chuẩn VietQR của Napas, tự điền số tiền còn lại và nội dung chuyển khoản là số bảng kê. Khách quét bằng ứng dụng ngân hàng.'))),
    h('div',{class:'grid3'},bkF('Ngân hàng',bank),bkF('Số tài khoản',stk),bkF('Tên chủ tài khoản',ten)),h('div',{class:'row'},save,prev)));
}
