/* ---- Bảng giá: TT | Tên mẫu, chỉ tiêu | Đơn giá. Giá theo loại mẫu (trọn) và theo chỉ tiêu; đơn giá phát sinh; nạp từ Excel */
function bkPriceCatalog(){
  const out=[];let i=0;
  MAT_TYPES.forEach(([k,l,on])=>{if(!on)return;i++;const U=BK_UNIT[k],dvt=U?'đ / '+U.ghi:'đ / mẫu';
    out.push({kind:'loai',key:k,tt:String(i),ten:l,dvt});
    defTests(k).forEach((c,j)=>{const t=ALL_TESTS.find(x=>x.code===c);if(t)out.push({kind:'ct',key:c,loai:k,tt:i+'.'+(j+1),ten:t.name,dvt,std:t.std});});});
  return out;
}
const bkMoney=v=>{if(typeof v==='number')return isFinite(v)&&v>=0?Math.round(v):null;if(v==null)return null;let t=String(v).replace(/[^\d.,-]/g,'');if(!t)return null;if(/^\d{1,3}([.,]\d{3})+$/.test(t))t=t.replace(/[.,]/g,'');else t=t.replace(',','.');const n=parseFloat(t);return isFinite(n)&&n>=0?Math.round(n):null;};
async function bkParsePrices(u8,P){
  const wb=await readXlsx(u8),names=Object.keys(wb);if(!names.length)throw new Error('File không có sheet nào.');
  const sh=wb['Bang_gia']||wb[names[0]];
  const rowOf=k=>+k.replace(/\D+/g,'');let maxR=0;Object.keys(sh).forEach(k=>{maxR=Math.max(maxR,rowOf(k));});
  let hr=0,cN='B',cP='C',cK=null;
  for(let r=1;r<=Math.min(maxR,30)&&!hr;r++){
    const cols={};['A','B','C','D','E','F','G'].forEach(c=>{const v=sh[c+r];if(v!=null)cols[c]=bkNorm(v);});
    const pc=Object.keys(cols).find(c=>/^don gia/.test(cols[c])),nc=Object.keys(cols).find(c=>/^ten /.test(cols[c]));
    if(pc&&nc){hr=r;cP=pc;cN=nc;const kc=Object.keys(cols).find(c=>/^ma( |$)/.test(cols[c]));cK=kc||null;}
  }
  if(!hr)throw new Error('Không thấy hàng tiêu đề có cột "Tên mẫu, chỉ tiêu" và "Đơn giá". Hãy dùng nút Tải bảng giá hiện tại làm file mẫu.');
  const cat=bkPriceCatalog(),byKey={},loaiN=[],ctFull=new Map(),ctOnly=new Map();
  cat.forEach(e=>{byKey[e.kind+':'+e.key]=e;
    if(e.kind==='loai')loaiN.push([bkNorm(e.ten),e]);
    else{const lt=(MAT_TYPES.find(x=>x[0]===e.loai)||[])[1]||'';ctFull.set(bkNorm(lt+' - '+e.ten),e);const nn=bkNorm(e.ten);ctOnly.set(nn,ctOnly.has(nn)?null:e);}});
  const setP=(e,v)=>{const m=e.kind==='loai'?P.gia:P.ct;if(v>0)m[e.key]=v;else delete m[e.key];};
  const findByName=nm=>{const n=bkNorm(nm);let e=loaiN.find(x=>x[0]===n);if(e)return e[1];if(ctFull.has(n))return ctFull.get(n);if(ctOnly.get(n))return ctOnly.get(n);
    if(n.length>=6){const c=loaiN.filter(x=>n.includes(x[0])||x[0].includes(n));if(c.length===1)return c[0][1];}return null;};
  const res={cap:0,moi:0,bo:0,ps:[]};
  for(let r=hr+1;r<=maxR;r++){
    const nm=String(sh[cN+r]==null?'':sh[cN+r]).trim(),raw=sh[cP+r];if(!nm)continue;
    const v=bkMoney(raw);if(v==null){if(raw!=null)res.bo++;continue;}
    const key=cK?String(sh[cK+r]||'').trim():'';let e=null;
    if(/^them:/.test(key)){const id=key.slice(5);let t=P.them.find(x=>x.id===id);if(!t){t={id,ten:nm,gia:0};P.them.push(t);res.moi++;}else res.cap++;t.ten=nm;t.gia=v;continue;}
    if(key)e=byKey[key]||null;
    if(!e)e=findByName(nm);
    if(e){setP(e,v);res.cap++;continue;}
    const n=bkNorm(nm),t=P.them.find(x=>bkNorm(x.ten)===n);
    if(t){t.gia=v;res.cap++;}else{P.them.push({id:rid(),ten:nm,gia:v});res.moi++;res.ps.push(nm);}
  }
  return res;
}
async function bkPricesXlsx(P){
  const cat=bkPriceCatalog(),rows=[],merges=[];let r=0;
  const c=(col,v,st,num)=>num?(v===''||v==null?'<c r="'+col+r+'" s="'+st+'"/>':'<c r="'+col+r+'" s="'+st+'"><v>'+(+v||0)+'</v></c>'):'<c r="'+col+r+'" s="'+st+'" t="inlineStr"><is><t xml:space="preserve">'+xe(v)+'</t></is></c>';
  const add=(arr,ht)=>{r++;rows.push('<row r="'+r+'"'+(ht?' ht="'+ht+'" customHeight="1"':'')+'>'+arr.map(a=>c(a[0],a[1],a[2],a[3])).join('')+'</row>');return r;};
  /* styles: 0 mặc định, 1 tiêu đề, 2 đầu cột, 3 chữ viền, 4 số viền, 5 chữ đậm nền, 6 số đậm nền, 7 TT giữa, 8 TT đậm nền, 9 ghi chú, 10 mã nhỏ xám */
  let m=add([['A','BẢNG ĐƠN GIÁ THÍ NGHIỆM',1],['B','',1],['C','',1],['D','',1],['E','',1]],26);merges.push('A'+m+':E'+m);
  m=add([['A','Sửa số ở cột Đơn giá (đồng). Để trống = không đổi. Giữ nguyên cột Mã để hệ thống nhận đúng dòng. Mẫu mới: ghi tên và đơn giá ở các dòng cuối, bỏ trống cột Mã. Nén bê tông tính theo tổ 3 viên, nén vữa theo tổ 6 viên, đo K theo điểm đo.',9],['B','',9],['C','',9],['D','',9],['E','',9]],44);merges.push('A'+m+':E'+m);
  add([],6);
  add([['A','TT',2],['B','Tên mẫu, chỉ tiêu',2],['C','Đơn giá (đ)',2],['D','Đơn vị tính',2],['E','Mã (không sửa)',2]],30);
  cat.forEach(e=>{const L=e.kind==='loai',v=L?P.gia[e.key]:P.ct[e.key];
    add([['A',e.tt,L?8:7],['B',L?e.ten:'    '+e.ten+(e.std?' ('+e.std+')':''),L?5:3],['C',v||'',L?6:4,1],['D',e.dvt,L?5:3],['E',(L?'loai:':'ct:')+e.key,10]]);});
  m=add([['A','PS',8],['B','ĐƠN GIÁ PHÁT SINH',5],['C','',6],['D','',5],['E','',10]]);
  P.them.forEach((t,i)=>add([['A','PS'+(i+1),7],['B',t.ten,3],['C',t.gia||'',4,1],['D','',3],['E','them:'+t.id,10]]));
  for(let i=0;i<5;i++)add([['A','',7],['B','',3],['C','',4,1],['D','',3],['E','',10]]);
  const font=(sz,bold,it,col)=>'<font>'+(bold?'<b/>':'')+(it?'<i/>':'')+'<sz val="'+sz+'"/>'+(col?'<color rgb="'+col+'"/>':'')+'<name val="Times New Roman"/><family val="1"/></font>';
  const xf=(num,fo,fi,bo,al)=>'<xf numFmtId="'+num+'" fontId="'+fo+'" fillId="'+fi+'" borderId="'+bo+'" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment '+al+'/></xf>';
  const bd='<border><left style="thin"><color auto="1"/></left><right style="thin"><color auto="1"/></right><top style="thin"><color auto="1"/></top><bottom style="thin"><color auto="1"/></bottom><diagonal/></border>';
  const styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="5">'+font(11)+font(11,1)+font(14,1)+font(10,0,1)+font(9,0,0,'FF888888')+'</fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFE8EEF0"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border>'+bd+'</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="11">'
    +xf(0,0,0,0,'vertical="center"')+xf(0,2,0,0,'horizontal="center" vertical="center"')+xf(0,1,2,1,'horizontal="center" vertical="center" wrapText="1"')
    +xf(0,0,0,1,'horizontal="left" vertical="center" wrapText="1"')+xf(3,0,0,1,'horizontal="right" vertical="center"')
    +xf(0,1,2,1,'horizontal="left" vertical="center" wrapText="1"')+xf(3,1,2,1,'horizontal="right" vertical="center"')
    +xf(0,0,0,1,'horizontal="center" vertical="center"')+xf(0,1,2,1,'horizontal="center" vertical="center"')
    +xf(0,3,0,0,'horizontal="left" vertical="top" wrapText="1"')+xf(0,4,0,1,'horizontal="left" vertical="center"')
    +'</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
  const sheet='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0"><pane ySplit="4" topLeftCell="A5" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/><cols><col min="1" max="1" width="7" customWidth="1"/><col min="2" max="2" width="62" customWidth="1"/><col min="3" max="3" width="16" customWidth="1"/><col min="4" max="4" width="20" customWidth="1"/><col min="5" max="5" width="22" customWidth="1"/></cols><sheetData>'+rows.join('')+'</sheetData><mergeCells count="'+merges.length+'">'+merges.join('')+'</mergeCells><pageMargins left="0.7" right="0.4" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>';
  const zip=new JSZip();
  zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>');
  zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>');
  zip.file('xl/workbook.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Bang_gia" sheetId="1" r:id="rId1"/></sheets></workbook>');
  zip.file('xl/_rels/workbook.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>');
  zip.file('xl/styles.xml',styles);zip.file('xl/worksheets/sheet1.xml',sheet);
  return zip.generateAsync({type:'uint8array',compression:'DEFLATE'});
}
function bkPrices(box,canEdit){
  BK.pdirty=false;
  const P={gia:Object.assign({},S.bgia||{}),ct:Object.assign({},S.bgiaCt||{}),them:(S.bgiaThem||[]).map(x=>Object.assign({},x))};
  let q=BK.pq||'';const open=BK.popen||(BK.popen=new Set());
  const dirt=h('span',{hidden:true},tonePill('Chưa lưu','warn')),note=h('div',{class:'banner','data-tone':'info',hidden:true});
  const mark=()=>{BK.pdirty=true;dirt.hidden=false;};
  const body=h('tbody'),cnt=h('span',{class:'muted small'});
  const numIn=(val,label,set)=>{const i=h('input',{type:'number',min:'0',step:'1000',inputmode:'numeric','aria-label':label,disabled:!canEdit,style:'max-width:150px'});i.value=val||'';i.addEventListener('input',()=>{set(Math.max(0,Math.round(+i.value||0)));mark();});return i;};
  const groups=[];bkPriceCatalog().forEach(e=>{if(e.kind==='loai')groups.push({head:e,kids:[]});else groups[groups.length-1].kids.push(e);});
  const draw=()=>{
    const ql=bkNorm(q),out=[];let nl=0;
    groups.forEach(g=>{const k=g.head.key,hm=!ql||bkNorm(g.head.ten).includes(ql),kids=hm?g.kids:g.kids.filter(x=>bkNorm(x.ten).includes(ql));
      if(!hm&&!kids.length)return;nl++;const isOpen=ql?true:open.has(k);
      const tg=g.kids.length?h('button',{class:'btn sm ghost','data-act':'bg-toggle','data-k':k,'aria-expanded':String(isOpen),'aria-label':(isOpen?'Thu gọn ':'Mở ')+g.kids.length+' chỉ tiêu của '+g.head.ten,onclick:()=>{if(open.has(k))open.delete(k);else open.add(k);draw();}},(isOpen?'▾ ':'▸ ')+g.kids.length+' chỉ tiêu'):null;
      out.push(h('tr',{class:'bk-grp'},h('td',null,g.head.tt),h('td',null,h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;justify-content:space-between'},h('b',null,g.head.ten),tg),h('div',{class:'muted small'},'Giá trọn một '+g.head.dvt.replace('đ / ','')+'. Để trống thì bảng kê tính theo từng chỉ tiêu có giá.')),
        h('td',null,numIn(P.gia[k],'Đơn giá '+g.head.ten,v=>{if(v)P.gia[k]=v;else delete P.gia[k];}))));
      if(isOpen)kids.forEach(e=>out.push(h('tr',null,h('td',{class:'muted'},e.tt),h('td',{style:'padding-left:22px'},e.ten,h('span',{class:'muted small'},e.std?' · '+e.std:'')),
        h('td',null,numIn(P.ct[e.key],'Đơn giá chỉ tiêu '+e.ten+' ('+g.head.ten+')',v=>{if(v)P.ct[e.key]=v;else delete P.ct[e.key];})))));});
    out.push(h('tr',{class:'bk-grp'},h('td',null,'PS'),h('td',{colspan:'2'},h('b',null,'Đơn giá phát sinh'),h('span',{class:'muted small'},' · mẫu hoặc phép thử mới chưa có trong danh mục; chọn nhanh khi lập bảng kê bằng nút Thêm từ đơn giá phát sinh'))));
    P.them.forEach((t,i)=>{if(ql&&!bkNorm(t.ten).includes(ql))return;
      const nm=h('input',{type:'text','aria-label':'Tên đơn giá phát sinh '+(i+1),placeholder:'Tên mẫu, chỉ tiêu phát sinh',style:'min-width:160px;flex:1 1 220px',oninput:e=>{t.ten=e.target.value;mark();}});nm.value=t.ten||'';nm.disabled=!canEdit;
      out.push(h('tr',null,h('td',{class:'muted'},'PS'+(i+1)),h('td',null,h('div',{class:'row',style:'gap:8px'},nm,h('button',{class:'btn sm ghost',disabled:!canEdit,'aria-label':'Xóa đơn giá phát sinh '+(i+1),onclick:()=>{P.them.splice(i,1);mark();draw();}},'Xóa'))),
        h('td',null,numIn(t.gia,'Đơn giá phát sinh '+(i+1),v=>{t.gia=v;}))));});
    if(!P.them.length)out.push(h('tr',null,h('td',{colspan:'3',class:'muted small'},'Chưa có đơn giá phát sinh. Bấm Thêm đơn giá để tạo.')));
    body.replaceChildren(...out);cnt.textContent=nl+' loại mẫu'+(ql?' phù hợp':'')+' · '+Object.keys(P.gia).length+' có giá trọn · '+Object.keys(P.ct).length+' chỉ tiêu có giá · '+P.them.length+' phát sinh';
  };
  const save=async auto=>{
    const them=P.them.filter(x=>String(x.ten||'').trim()).map(x=>({id:x.id,ten:String(x.ten).trim(),gia:Math.max(0,Math.round(+x.gia||0))}));
    const doc={gia:P.gia,ct:P.ct,them,by:SESSION.name,at:new Date().toISOString()};
    const ok=await safe(()=>Data.set('config/bang_gia',doc).then(()=>true),'Không lưu được bảng giá.');
    if(ok){S.bgia=Object.assign({},P.gia);S.bgiaCt=Object.assign({},P.ct);S.bgiaThem=them;P.them=them.map(x=>Object.assign({},x));BK.pdirty=false;dirt.hidden=true;
      await logAudit(auto?'Nạp bảng giá từ Excel':'Cập nhật bảng giá thử nghiệm',Object.keys(P.gia).length+' loại, '+Object.keys(P.ct).length+' chỉ tiêu, '+them.length+' phát sinh');
      toast('Đã lưu bảng giá. Bảng kê mới lấy đơn giá này.');draw();}
    return ok;};
  const upload=async f=>{
    let r;try{const Q={gia:Object.assign({},P.gia),ct:Object.assign({},P.ct),them:P.them.map(x=>Object.assign({},x))};r=await bkParsePrices(new Uint8Array(await f.arrayBuffer()),Q);if(r.cap+r.moi>0){P.gia=Q.gia;P.ct=Q.ct;P.them=Q.them;}}
    catch(e){toast(e&&e.message?e.message:'Không đọc được file đơn giá.','bad');return;}
    if(!(r.cap+r.moi)){toast('Không nhận được dòng giá nào trong file.','bad');return;}
    mark();draw();
    BK.pnote='Đã đọc '+f.name+': cập nhật '+r.cap+' dòng, thêm mới '+r.moi+' dòng vào đơn giá phát sinh'+(r.bo?', bỏ qua '+r.bo+' dòng giá không hợp lệ':'')+'.'+(r.ps.length?' Dòng không nhận ra tên nên vào phát sinh: '+r.ps.slice(0,6).join('; ')+(r.ps.length>6?'…':'')+'.':'');note.replaceChildren(h('div',null,BK.pnote));note.hidden=false;
    await save(true);};
  const file=h('input',{type:'file',accept:'.xlsx',hidden:true,'aria-label':'Chọn file Excel đơn giá','data-act':'bg-file',onchange:async()=>{const f=file.files&&file.files[0];file.value='';if(f)await upload(f);}});
  const srch=h('input',{type:'search',id:'bg-q',placeholder:'Tìm loại mẫu hoặc chỉ tiêu','aria-label':'Tìm trong bảng giá',style:'max-width:280px',oninput:e=>{q=e.target.value;BK.pq=q;draw();}});srch.value=q;
  const bar=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},
    h('button',{class:'btn primary',disabled:!canEdit,'data-act':'bg-up',onclick:()=>file.click()},'Tải file Excel đơn giá lên'),
    h('button',{class:'btn',disabled:!canEdit,'data-act':'bg-add',onclick:()=>{P.them.push({id:rid(),ten:'',gia:0});q='';BK.pq='';srch.value='';mark();draw();const ins=body.querySelectorAll('input[type=text]');if(ins.length)ins[ins.length-1].focus();}},'Thêm đơn giá'),
    h('button',{class:'btn','data-act':'bg-dl',onclick:async()=>{await saveBytes('Bang_gia_thi_nghiem_'+todayISO()+'.xlsx',await bkPricesXlsx(P));}},'Tải bảng giá hiện tại (Excel)'),
    file);
  box.append(h('div',{class:'card stack bk-prices'},
    h('div',{class:'card-h'},h('div',null,h('h2',null,'Bảng giá thí nghiệm'),h('p',{class:'muted small'},'Đơn giá theo loại mẫu (giá trọn một mẫu) và theo từng chỉ tiêu, đơn vị đồng. Nén bê tông tính theo tổ 3 viên, nén vữa theo tổ 6 viên, đo K theo điểm đo. Loại mẫu có giá trọn thì bảng kê dùng giá đó; để trống giá trọn thì bảng kê tính theo từng chỉ tiêu có giá. Đơn giá để trống nghĩa là chưa có giá, bảng kê hiện 0 và nhập tay.')),dirt),
    bar,note,h('div',{class:'row',style:'gap:12px;flex-wrap:wrap;align-items:center'},srch,cnt),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['TT','Tên mẫu, chỉ tiêu','Đơn giá (đ)'].map(x=>h('th',null,x)))),body)),
    h('div',null,h('button',{class:'btn primary',disabled:!canEdit,'data-act':'bg-save',onclick:()=>save(false)},'Lưu bảng giá'))));
  if(BK.pnote){note.replaceChildren(h('div',null,BK.pnote));note.hidden=false;}
  draw();
}
