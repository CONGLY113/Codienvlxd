/* ---- chọn dịch vụ từ bảng giá */
function dvPickDlg(b,onAdd){
  const mangs=(DV_ROOM[b.phong]||{mang:[]}).mang.filter(m=>b.kind==='bg'||DV_MANG[m].bk);
  let cur=b.mang&&mangs.includes(b.mang)?b.mang:mangs[0],q='',gr='',added=0;
  const sel=h('select',{'aria-label':'Mảng dịch vụ',onchange:e=>{cur=e.target.value;gr='';fillGr();draw();}},mangs.map(m=>h('option',{value:m},DV_MANG[m].ten)));sel.value=cur;
  const grS=h('select',{'aria-label':'Nhóm',onchange:e=>{gr=e.target.value;draw();}});
  const qi=h('input',{type:'text',placeholder:'Tìm theo tên, đặc trưng, phạm vi, nhóm','aria-label':'Tìm dịch vụ',style:'flex:1;min-width:200px',oninput:e=>{q=e.target.value;draw();}});
  const info=h('div',{class:'muted small'}),body=h('tbody');
  const fillGr=()=>{const gs=Array.from(new Set(dvBook(cur).items.map(x=>x.n||''))).filter(Boolean);grS.replaceChildren(h('option',{value:''},'Tất cả nhóm'),...gs.map(g=>h('option',{value:g},g)));grS.value=gr;};
  function draw(){
    const ws=dvNorm1(q).split(' ').filter(Boolean);
    const all=dvBook(cur).items.filter(it=>(!gr||it.n===gr)&&(!ws.length||ws.every(w=>dvNorm1([it.n,it.tt,it.t,it.dt,it.pv,it.u].join(' ')).includes(w))));
    const rows=all.slice(0,150);
    info.textContent=all.length+' mục'+(all.length>150?' (hiện 150 mục đầu, gõ thêm từ khóa để lọc)':'')+(added?' · đã thêm '+added+' dòng':'');
    body.replaceChildren(...rows.map(it=>h('tr',null,h('td',{class:'muted small'},(it.n||'').split(' › ').pop()),h('td',null,dvItemName(it),it.tr?h('span',{class:'pill','data-tone':'info',style:'margin-left:6px'},'trọn gói'):null),h('td',null,it.u||''),h('td',{class:'num'},fmtN(it.g)),
      h('td',null,h('button',{class:'btn sm primary','data-act':'dv-add',onclick:()=>{onAdd(dvLineFrom(it,cur));added++;info.textContent=all.length+' mục · đã thêm '+added+' dòng';toast('Đã thêm: '+dvItemName(it).slice(0,60));}},'Thêm')))));
    if(!rows.length)body.replaceChildren(h('tr',null,h('td',{colspan:'5',class:'muted'},'Không có mục phù hợp.')));
  }
  fillGr();draw();
  const m=openModal({title:'Chọn dịch vụ từ bảng giá',sub:'Đơn giá theo bảng giá ban hành, chưa gồm thuế GTGT. Có thể thêm nhiều dịch vụ liên tiếp.',wide:true,body:[
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-bottom:8px'},mangs.length>1?sel:null,grS,qi),info,
    h('div',{class:'tbl-wrap',style:'max-height:52vh;overflow:auto'},h('table',null,h('thead',null,h('tr',null,['Nhóm','Dịch vụ, chỉ tiêu','ĐVT','Đơn giá (đ)',''].map(x=>h('th',null,x)))),body))],
    actions:[h('button',{class:'btn primary',onclick:()=>m.close()},'Xong')]});
  return m;
}
/* ---- giấy chứng nhận: chỉ lưu số, ngày cấp, hạn hiệu lực và liên kết */
function dvCcDlg(b,l,after){
  const c=l.cc||{},so=h('input',{type:'text',value:c.so||'','aria-label':'Số giấy chứng nhận'}),nc=h('input',{type:'date',value:c.ngay_cap||'','aria-label':'Ngày cấp'}),hl=h('input',{type:'date',value:c.het_han||'','aria-label':'Hạn hiệu lực'}),lk=h('input',{type:'text',value:c.lk||'',placeholder:'Đường dẫn tới bản scan, nếu có','aria-label':'Liên kết'});
  const m=openModal({title:'Giấy chứng nhận',sub:(l.ten||'').slice(0,120)+'. Chỉ lưu số và liên kết, không lưu file giấy chứng nhận.',body:[h('div',{class:'grid3'},bkF('Số giấy chứng nhận',so),bkF('Ngày cấp',nc),bkF('Hạn hiệu lực',hl)),bkF('Liên kết ngoài',lk)],
    actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'cc-ok',onclick:async()=>{
      if(hl.value&&nc.value&&hl.value<nc.value){toast('Hạn hiệu lực phải sau ngày cấp.','bad');return;}
      const v={so:so.value.trim(),ngay_cap:nc.value,het_han:hl.value,lk:lk.value.trim()};
      if(b.id&&b.trang_thai!=='nhap'){const n=await dvAct(b,'Cập nhật giấy chứng nhận',(v.so||'(xóa)')+' · '+(l.ten||'').slice(0,50),d=>{const x=d.dong.find(y=>y.id===l.id);if(x)x.cc=v.so||v.lk||v.ngay_cap||v.het_han?v:undefined;},'Đã lưu giấy chứng nhận.');if(!n)return;}
      else{l.cc=(v.so||v.lk||v.ngay_cap||v.het_han)?v:undefined;DVS.dirty=true;}
      m.close();if(after)after();}},'Lưu')]});
}
/* ---- nhập dòng từ Excel theo mẫu của hệ thống */
const DV_IMP_HEAD=['Mã dịch vụ','Nội dung (tham khảo)','Số lượng','Số giấy chứng nhận','Ngày cấp (dd/mm/yyyy)','Hạn hiệu lực (dd/mm/yyyy)','Liên kết'];
async function dvTemplateXlsx(b){
  const mangs=(DV_ROOM[b.phong]||{mang:[]}).mang.filter(m=>b.kind==='bg'||DV_MANG[m].bk),ex=dvBook(mangs[0]).items[0];
  return bkTblXlsx('MẪU NHẬP DÒNG '+(b.kind==='bg'?'BÁO GIÁ':'BẢNG KÊ'),'Điền mã dịch vụ lấy từ file Bảng giá có mã (ví dụ '+ex.id+'), số lượng, và giấy chứng nhận (nếu có). Đơn giá lấy theo bảng giá của hệ thống.',DV_IMP_HEAD,[],{widths:[16,48,10,22,22,22,30],num:[2],sheet:'Dong_nhap'});
}
async function dvPriceXlsx(mangs){
  const rows=[];mangs.forEach(m=>dvBook(m).items.forEach(it=>rows.push([it.id,it.n||'',it.tt||'',it.t||'',it.dt||'',it.pv||'',it.u||'',it.g,it.ghi||''])));
  return bkTblXlsx('BẢNG GIÁ DỊCH VỤ',mangs.map(m=>DV_MANG[m].ten).join('; ')+' · '+dvBook(mangs[0]).meta.qd,['Mã','Nhóm','TT','Dịch vụ, chỉ tiêu','Đặc trưng kỹ thuật','Phạm vi','ĐVT','Đơn giá (đ)','Ghi chú'],rows,{widths:[14,38,7,48,26,26,10,14,34],num:[7],sheet:'Bang_gia'});
}
function dvFindCol(head,keys){const hs=head.map(dvNorm1);for(const k of keys){const i=hs.findIndex(x=>x.startsWith(k));if(i>=0)return i;}return -1;}
async function dvImportLines(b,file,after){
  let sheets;try{sheets=await dvReadXlsx(new Uint8Array(await file.arrayBuffer()));}catch(e){toast('Không đọc được file Excel này.','bad');return;}
  const rows=sheets[Object.keys(sheets)[0]]||[];let hi=rows.findIndex(r=>r.some(c=>dvNorm1(c).startsWith('ma dich vu')));
  if(hi<0){toast('Không thấy dòng tiêu đề "Mã dịch vụ". Hãy dùng đúng file mẫu của hệ thống.','bad');return;}
  const head=rows[hi],cM=dvFindCol(head,['ma dich vu']),cQ=dvFindCol(head,['so luong']),cS=dvFindCol(head,['so giay']),cN=dvFindCol(head,['ngay cap']),cH=dvFindCol(head,['han hieu']),cL=dvFindCol(head,['lien ket']);
  const mangs=(DV_ROOM[b.phong]||{mang:[]}).mang.filter(m=>b.kind==='bg'||DV_MANG[m].bk),ok=[],err=[];
  rows.slice(hi+1).forEach((r,i)=>{const code=String(r[cM]||'').trim();if(!code)return;const n=hi+i+2;
    let m=null,it=null;for(const mm of mangs){it=dvFindItem(mm,code);if(it){m=mm;break;}}
    if(!it){err.push('Dòng '+n+': mã "'+code+'" không có trong bảng giá của phòng.');return;}
    const sl=+String(r[cQ]===''||r[cQ]==null?1:r[cQ]).replace(',','.');if(!(sl>0)){err.push('Dòng '+n+': số lượng không hợp lệ.');return;}
    const l=dvLineFrom(it,m);l.sl=sl;
    if(b.kind==='bk'){const cc={so:String(r[cS]||'').trim(),ngay_cap:dvDate(r[cN]),het_han:dvDate(r[cH]),lk:String(r[cL]||'').trim()};if(cc.so||cc.lk||cc.ngay_cap||cc.het_han)l.cc=cc;}
    ok.push(l);});
  const m=openModal({title:'Kết quả nhập từ Excel',sub:ok.length+' dòng hợp lệ'+(err.length?', '+err.length+' dòng lỗi':'')+'.',body:[err.length?h('div',{class:'banner','data-tone':'warn'},h('div',null,err.slice(0,20).map(e=>h('div',null,e)))):null,
    ok.length?h('div',{class:'tbl-wrap',style:'max-height:40vh;overflow:auto'},h('table',null,h('thead',null,h('tr',null,['Nội dung','SL','Đơn giá','Giấy chứng nhận'].map(x=>h('th',null,x)))),h('tbody',null,ok.map(l=>h('tr',null,h('td',null,l.ten),h('td',null,l.sl),h('td',{class:'num'},fmtN(l.dg)),h('td',null,(l.cc&&l.cc.so)||'')))))):null],
    actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'imp-ok',disabled:!ok.length,onclick:()=>{ok.forEach(l=>b.dong.push(l));DVS.dirty=true;m.close();toast('Đã thêm '+ok.length+' dòng.');after();}},'Thêm '+ok.length+' dòng')]});
}
/* ---- in và xuất */
function dvTitle(b){return b.kind==='bk'?'BẢNG KÊ THANH TOÁN DỊCH VỤ':'BẢNG BÁO GIÁ';}
async function dvQr(b){const P=dvPay(b);if(b.kind!=='bk'||b.qr===false||P.con<=0||b.trang_thai!=='da_duyet')return null;const B=bkBank(),nd=bkAscii(bkQrNd(b)),text=vietQrText({bin:B.bin,stk:B.stk,amount:P.con,nd}),png=await bkQrPng(text);return{text,png,B,P,nd};}
function dvPrintBox(b,Q){
  const T=dvTotals(b),td=(t,al,x)=>h('td',{style:'border:1px solid #000;padding:4px 6px;text-align:'+(al||'left')+(x||'')},t),th=t=>h('th',{style:'border:1px solid #000;padding:4px 6px;background:#eee'},t);
  const hasCc=b.kind==='bk'&&b.dong.some(l=>l.cc&&l.cc.so),qi=Q&&Q.png?h('img',{src:'data:image/png;base64,'+u8ToB64(Q.png),width:'120',height:'120',alt:'Mã QR thanh toán'}):null,lapName=(b.tao&&b.tao.by)||'',tqName=(b.soat&&b.soat.by)||'';
  const g=b.giam||{},pct=g.kieu==='pct',nc=hasCc?7:6;
  const sumRow=(lab,v,bold)=>h('tr',null,h('td',{colspan:nc-1,style:'border:1px solid #000;padding:4px 6px;text-align:right;'+(bold?'font-weight:bold':'')},lab),td(fmtN(v),'right',bold?';font-weight:bold':''));
  return h('div',{class:'bk-print',style:'position:relative;font-family:"Times New Roman",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},
    h('img',{src:LOGO_L,alt:LOGO_ALT,width:76,height:76,style:'position:absolute;left:14mm;top:11mm;width:19mm;height:19mm'}),
    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG'),h('div',{style:'text-align:center;font-weight:bold'},dvRoomName(b.phong).toUpperCase()),
    h('div',{style:'text-align:center;font-size:11px;font-style:italic'},'23 Phan Huy Chú, phường Đồng Hới, tỉnh Quảng Trị'),
    h('h2',{style:'text-align:center;margin:14px 0 2px;font-size:18px'},dvTitle(b)),h('div',{style:'text-align:center'},DV_MANG[b.mang].ten),h('div',{style:'text-align:center;margin-bottom:10px'},'Số: '+b.so+' · Ngày '+fd(b.ngay)),
    h('div',null,h('b',null,'Khách hàng: '),b.khach.ten),b.khach.mst?h('div',null,h('b',null,'Mã số thuế: '),b.khach.mst):null,b.khach.dia_chi?h('div',null,h('b',null,'Địa chỉ: '),b.khach.dia_chi):null,
    h('div',{style:'margin-bottom:10px'},h('b',null,b.kind==='bk'?'Công trình, nội dung: ':'Nội dung báo giá: '),b.cong_trinh||''),
    h('table',{style:'border-collapse:collapse;width:100%'},h('thead',null,h('tr',null,['TT','Nội dung','ĐVT','Số lượng','Đơn giá (đồng)','Thành tiền (đồng)'].concat(hasCc?['Giấy chứng nhận']:[]).map(th))),
      h('tbody',null,b.dong.map((l,i)=>h('tr',null,[td(i+1,'center'),td(l.ten),td(l.u||'','center'),td(fmtN(l.sl),'center'),td(fmtN(l.dg),'right'),td(fmtN(Math.round((+l.sl||0)*(+l.dg||0))),'right')].concat(hasCc?[td(l.cc&&l.cc.so?l.cc.so+(l.cc.ngay_cap?' ngày '+fd(l.cc.ngay_cap):''):'')]:[]))),
        sumRow('Cộng tiền hàng',T.tong,true),T.giam?sumRow(pct?'Chiết khấu '+fmtN(Math.min(100,+g.gt||0))+' %':'Chiết khấu (giảm trừ)',T.giam):null,
        sumRow('Cộng tiền hàng sau chiết khấu',T.trc),sumRow('Thuế GTGT '+T.vat+' %',T.thue),sumRow('TỔNG CỘNG THANH TOÁN',T.tt,true))),
    h('div',{style:'margin-top:8px;font-style:italic'},'Bằng chữ: '+docSo(T.tt)),b.ghi_chu?h('div',{style:'margin-top:4px'},'Ghi chú: '+b.ghi_chu):null,
    Q?h('div',{style:'display:flex;gap:14px;align-items:center;margin-top:14px;border:1px solid #000;padding:8px'},qi,h('div',{style:'font-size:12px;line-height:1.5'},h('div',null,h('b',null,'THÔNG TIN THANH TOÁN')),h('div',null,'Ngân hàng: '+Q.B.bank),h('div',null,'Số tài khoản: '+Q.B.stk),Q.B.ten?h('div',null,'Chủ tài khoản: '+Q.B.ten):null,h('div',null,'Số tiền: '+fmtN(Q.P.con)+' đồng'),h('div',null,'Nội dung chuyển khoản: '+Q.nd),h('div',{style:'font-style:italic'},'Quét mã QR bằng ứng dụng ngân hàng'))):null,
    b.kind==='bk'?h('div',{style:'display:flex;justify-content:space-between;margin-top:22px;text-align:center;gap:6px'},[['Người lập bảng kê',lapName],['Thủ quỹ',tqName],['Đại diện khách hàng','']].map(([t,n])=>h('div',{style:'flex:1'},h('b',null,t),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên)'),h('div',{style:'height:64px'}),h('div',null,n))))
      :h('div',{style:'margin-top:22px;text-align:right'},h('div',{style:'display:inline-block;text-align:center;min-width:200px'},h('b',null,'Người lập báo giá'),h('div',{style:'height:50px'}),h('div',null,lapName))));
}
async function dvDoPrint(b){
  const box=dvPrintBox(b,await dvQr(b));document.body.append(box);await Promise.all(Array.from(box.querySelectorAll('img')).map(im=>im.decode?im.decode().catch(()=>{}):0));document.documentElement.classList.add('printing-bk');
  const done=()=>{document.documentElement.classList.remove('printing-bk');box.remove();window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  try{window.print();}catch(e){done();toast('Máy không cho in trực tiếp. Bấm Tải Excel rồi in từ Excel.','bad');return;}
  setTimeout(()=>{if(document.documentElement.classList.contains('printing-bk'))done();},1500);
}
async function dvDocXlsx(b){
  const T=dvTotals(b),sub='Số '+b.so+' · '+fd(b.ngay)+' · '+b.khach.ten+(b.khach.mst?' · MST '+b.khach.mst:'')+' · Cộng '+fmtN(T.tong)+' đ'+(T.giam?' · Chiết khấu '+fmtN(T.giam)+' đ':'')+' · Thuế GTGT '+T.vat+'% = '+fmtN(T.thue)+' đ · TỔNG THANH TOÁN '+fmtN(T.tt)+' đ';
  const hasCc=b.kind==='bk'&&b.dong.some(l=>l.cc&&l.cc.so);
  return bkTblXlsx(dvTitle(b)+' · '+DV_MANG[b.mang].ten.toUpperCase(),sub,['TT','Nội dung','ĐVT','Số lượng','Đơn giá (đ)','Thành tiền (đ)'].concat(hasCc?['Giấy chứng nhận']:[]),
    b.dong.map((l,i)=>[i+1,l.ten,l.u||'',l.sl,l.dg,Math.round((+l.sl||0)*(+l.dg||0))].concat(hasCc?[l.cc&&l.cc.so?l.cc.so:'']:[])),{widths:[6,58,10,10,16,18,22],num:[3,4,5],sum:[5],sheet:b.kind==='bk'?'Bang_ke':'Bao_gia'});
}
