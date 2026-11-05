const BK_FIL=[['nhap','Nháp'],['cho_soat','Chờ thủ quỹ soát xét'],['da_soat','Đã soát xét, chờ ký duyệt'],['da_duyet','Đã duyệt (mọi tình trạng thanh toán)'],['chua','Đã duyệt, chưa thanh toán'],['mot','Đã duyệt, thanh toán một phần'],['da','Đã thanh toán đủ'],['huy','Đã hủy']];
const bkFilSt=(b,k)=>!k||(['nhap','cho_soat','da_soat','huy','da_duyet'].includes(k)?b.trang_thai===k:(b.trang_thai==='da_duyet'&&bkPay(b).st===k));
function bkWorkCard(){
  const tq=hasRole('tq'),lap=bkLap(),L=bkAll().filter(b=>b.so),items=[];
  if(tq)L.filter(b=>b.trang_thai==='cho_soat').forEach(b=>items.push([b,'Chờ soát xét số lượng mẫu và đơn giá','Soát xét']));
  if(lap){L.filter(b=>b.trang_thai==='da_soat').forEach(b=>items.push([b,'Đã soát xét, chờ ký duyệt và đóng dấu bản giấy','Mở']));
    L.filter(b=>b.trang_thai==='nhap'&&b.tra_lai).forEach(b=>items.push([b,'Thủ quỹ trả lại: '+(b.tra_lai.ly_do||''),'Sửa lại']));}
  if(!items.length)return null;
  return h('div',{class:'card stack','data-sec':'work'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Việc cần làm'),h('p',{class:'muted small'},'Các bảng kê đang chờ bạn xử lý.'))),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số bảng kê','Khách hàng','Công trình','Giá trị','Việc cần làm',''].map(x=>h('th',null,x)))),
      h('tbody',null,items.map(([b,v,l])=>h('tr',null,h('td',null,code(b.so)),h('td',null,b.khach.ten),h('td',null,b.cong_trinh||''),h('td',{class:'num'},fmtN(bkTotals(b).tt)+' đ'),h('td',null,v),
        h('td',null,h('button',{class:'btn sm primary','data-act':'work-open',onclick:()=>bkOpenDraft(JSON.parse(JSON.stringify(b)))},l))))))));
}
pages['thanh-toan']={render(root){
  const lap=bkLap(),tq=hasRole('tq');bkWatchInit();
  if(BK.uid!==(SESSION&&SESSION.id)){BK.uid=SESSION&&SESSION.id;BK.draft=null;BK.dirty=false;BK.tab='bangke';BK.psel=new Set();BK.sf=null;BK.pdirty=false;BK.pnote='';}
  root.append(pageHead('Thanh toán','Giai đoạn 1: lập bảng kê, thủ quỹ soát xét, ký duyệt và đóng dấu bản giấy. Giai đoạn 2: khách thanh toán, kế toán chọn bảng kê, thủ quỹ xác nhận đã thanh toán.'));
  const tabs=[['bangke','Bảng kê thanh toán'],['tonghop','Tổng hợp thanh toán'],['banggia','Bảng giá và tài khoản']].concat(lap?[['phieu','Phiếu kết quả, bản giấy']]:[]);
  if(!tabs.some(t=>t[0]===BK.tab))BK.tab='bangke';
  root.append(h('div',{class:'tabs',role:'tablist',style:'margin-bottom:12px'},tabs.map(([k,l])=>h('button',{role:'tab','aria-selected':BK.tab===k,'data-tab':k,onclick:()=>{
    if(BK.draft&&BK.dirty&&k!=='bangke'){toast('Lưu hoặc đóng bảng kê đang sửa trước.','bad');return;}
    if(BK.pdirty&&BK.tab==='banggia'&&k!=='banggia'){toast('Bấm Lưu bảng giá trước khi chuyển tab.','bad');return;}
    BK.tab=k;BK.pnote='';if(k!=='bangke'&&BK.draft&&!BK.dirty)BK.draft=null;render();}},l))));
  const box=h('div',{class:'stack'});root.append(box);
  if(BK.tab==='banggia'){bkBankCard(box,lap);bkPrices(box,lap);}
  else if(BK.tab==='tonghop')bkSummary(box,lap,tq);
  else if(BK.tab==='phieu')ttOldRender(box);
  else if(BK.draft)bkEditor(box,lap);else bkList(box,lap);
},update(){
  if(BK.draft){if(!BK.dirty&&BK.draft.id){const cur=bkAll().find(x=>x.id===BK.draft.id&&x.col===BK.draft.col);
    if(cur&&((cur.sua||{}).at!==(BK.draft.sua||{}).at)&&!document.querySelector('#modal-root .overlay')){BK.draft=JSON.parse(JSON.stringify(cur));render();}}return;}
  if(BK.tab==='banggia'&&BK.pdirty)return;
  if(document.querySelector('#modal-root .overlay'))return;
  const a=document.activeElement;if(a&&a.closest&&a.closest('.pay,.bk-prices,.bk-bank,.bk-sum')&&/INPUT|SELECT/.test(a.tagName))return;if(a&&a.type==='text'&&a.placeholder)return;render();}};
