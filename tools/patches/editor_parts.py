WF_JS=r'''
  const tq=hasRole('tq'),st0=b.trang_thai,iso=()=>new Date().toISOString();
  const saved=async()=>{if(BK.dirty&&!(await doSave()))return false;return true;};
  const wf=async(hd,ghi,fn,msg)=>{const n=await bkAct(b,hd,ghi,fn,msg);if(n)render();return !!n;};
  const askGui=async()=>{if(!(await saved()))return;const m=openModal({title:'Gửi thủ quỹ soát xét',sub:'Bảng kê '+b.so+' · '+fmtN(bkTotals(b).tt)+' đ. Sau khi gửi, bảng kê bị khóa để thủ quỹ soát xét số lượng mẫu và đơn giá.',body:[],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'dlg-ok',onclick:async function(){this.disabled=true;const ok=await wf('Gửi thủ quỹ soát xét','',n=>{n.trang_thai='cho_soat';n.gui_soat={by:SESSION.name,at:iso()};n.tra_lai=null;},'Đã gửi thủ quỹ soát xét.');if(ok)m.close();else this.disabled=false;}},'Gửi soát xét')]});};
  const askSoat=()=>{const ck=h('input',{type:'checkbox','aria-label':'Đã đối chiếu số lượng mẫu và đơn giá'});
    bkTextDlg('Soát xét bảng kê '+b.so,'Đối chiếu số lượng mẫu và đơn giá từng dòng với phiếu yêu cầu và bảng giá. Giá trị '+fmtN(bkTotals(b).tt)+' đ.','Ghi chú soát xét',false,'Soát xét đạt',async v=>{if(!ck.checked){toast('Tích xác nhận đã đối chiếu số lượng mẫu và đơn giá.','bad');return false;}
      return wf('Thủ quỹ soát xét đạt',v,n=>{n.trang_thai='da_soat';n.soat={by:SESSION.name,at:iso(),ghi:v};},'Đã soát xét đạt. Chờ ký duyệt, đóng dấu bản giấy.');},[h('label',{class:'chk'},ck,h('span',null,'Tôi đã đối chiếu số lượng mẫu và đơn giá từng dòng'))]);};
  const askTra=()=>bkTextDlg('Trả lại bảng kê '+b.so,'Bảng kê quay về người lập để sửa, kèm lý do.','Lý do trả lại',true,'Trả lại',v=>wf('Thủ quỹ trả lại bảng kê',v,n=>{n.trang_thai='nhap';n.tra_lai={by:SESSION.name,at:iso(),ly_do:v};n.soat=null;},'Đã trả lại bảng kê cho người lập.'));
  const askThuHoi=()=>bkTextDlg('Thu hồi bảng kê '+b.so,'Bảng kê quay về nháp để sửa.','Ghi chú',false,'Thu hồi',v=>wf('Thu hồi bảng kê về nháp',v,n=>{n.trang_thai='nhap';n.gui_soat=null;},'Đã thu hồi về nháp.'));
  const askBack=()=>bkTextDlg('Trả bảng kê '+b.so+' về nháp','Bảng kê đã soát xét nhưng cần sửa trước khi ký duyệt. Phải gửi soát xét lại.','Lý do',true,'Trả về nháp',v=>wf('Trả bảng kê về nháp để sửa',v,n=>{n.trang_thai='nhap';n.soat=null;n.gui_soat=null;},'Đã trả về nháp.'));
  const askDuyet=()=>{const ky=h('input',{type:'text',value:'Giám đốc','aria-label':'Người ký duyệt'});
    bkTextDlg('Ghi nhận ký duyệt, đóng dấu','Chỉ bấm sau khi bản giấy đã được ký duyệt và đóng dấu. Bảng kê được ghi nhận vào hệ thống với tình trạng chưa thanh toán.','Ghi chú',false,'Đã ký duyệt, đóng dấu',v=>wf('Ghi nhận đã ký duyệt, đóng dấu bản giấy',(ky.value.trim()?'Người ký: '+ky.value.trim():'')+(v?' · '+v:''),n=>{n.trang_thai='da_duyet';n.duyet={by:SESSION.name,at:iso(),ky:ky.value.trim(),ghi:v};},'Đã ghi nhận bảng kê. Tình trạng: chưa thanh toán.'),[bkF('Người ký duyệt',ky)]);};
  const askMoLai=()=>bkTextDlg('Mở lại bảng kê '+b.so,'Chỉ mở lại khi chưa có thanh toán nào. Bảng kê về nháp, phải soát xét và ký duyệt lại.','Lý do mở lại',true,'Mở lại',v=>wf('Mở lại bảng kê để sửa',v,n=>{n.trang_thai='nhap';n.soat=null;n.duyet=null;n.gui_soat=null;},'Đã mở lại bảng kê.'));
  const askGuiKhach=()=>wf('Ghi nhận đã gửi khách','',n=>{n.gui_khach={by:SESSION.name,at:iso()};},'Đã ghi nhận gửi khách.');
  const askCancel=async()=>{if(!(await saved()))return;const m=openModal({title:'Hủy bảng kê '+b.so,sub:'Bảng kê hủy vẫn lưu để đối chiếu, phiếu yêu cầu quay lại danh sách chưa lập bảng kê.',body:[],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Không hủy'),h('button',{class:'btn primary',onclick:async()=>{m.close();await wf('Hủy bảng kê','',n=>{n.trang_thai='huy';},'Đã hủy bảng kê.');}},'Hủy bảng kê')]});};
  const qrBox=h('div',{class:'card flat stack bk-qr','data-sec':'qr'});
  function qrUpd(){const B=bkBank(),P=bkPay(b),on=b.qr!==false;
    const cb=h('label',{class:'chk'},h('input',{type:'checkbox','aria-label':'In mã QR thanh toán',checked:on,disabled:locked,onchange:e=>{b.qr=e.target.checked;mark();qrUpd();}}),h('span',null,'In mã QR thanh toán trên bảng kê (bản in và Excel)'));
    const img=h('img',{alt:'Mã QR thanh toán',width:'150',height:'150',style:'background:#fff;border:1px solid var(--line);border-radius:6px'});
    const info=h('div',{class:'stack small'},h('div',null,h('b',null,'Thanh toán chuyển khoản')),h('div',null,'Ngân hàng: '+B.bank),h('div',null,'Số tài khoản: ',h('b',null,B.stk)),B.ten?h('div',null,'Chủ tài khoản: '+B.ten):null,h('div',null,'Số tiền: ',h('b',null,fmtN(P.con)+' đ')),h('div',null,'Nội dung chuyển khoản: ',h('b',null,bkQrNd(b))),bkTam(b)?h('div',{class:'muted'},'Số tiền theo bảng kê tạm tính.'):null,h('div',{class:'muted'},'Khách quét mã bằng ứng dụng ngân hàng.'));
    qrBox.replaceChildren(cb,on?(P.con>0?h('div',{class:'row',style:'gap:16px;align-items:flex-start;flex-wrap:wrap'},img,info):h('div',{class:'muted small'},'Bảng kê đã thanh toán đủ, không cần mã QR.')):null);
    if(on&&P.con>0)bkQrPng(bkQrText(b)).then(p=>{if(p)img.src='data:image/png;base64,'+u8ToB64(p);else img.replaceWith(h('div',{class:'muted small'},'Không tạo được ảnh mã QR trên thiết bị này.'));});}
'''
SB_JS=r'''  if(locked)bar.querySelectorAll('button[disabled],select[disabled]').forEach(x=>x.remove());
  const B_=(l,cls,fn,dis,act)=>h('button',{class:'btn '+(cls||''),disabled:!!dis,'data-act':act||null,onclick:fn},l);
  const noPay=!(b.pay||[]).some(x=>x.tt==='cho_tq'||x.tt==='da_xn');
  const sbar=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},
    st0==='nhap'&&canEdit?B_('Gửi thủ quỹ soát xét','primary',askGui,!b.dong.length,'wf-gui'):null,
    st0==='cho_soat'&&tq?B_('Soát xét đạt','primary',askSoat,false,'wf-soat'):null,
    st0==='cho_soat'&&tq?B_('Trả lại, yêu cầu sửa','',askTra,false,'wf-tra'):null,
    st0==='cho_soat'&&canEdit?B_('Thu hồi về nháp','ghost',askThuHoi,false,'wf-thuhoi'):null,
    st0==='da_soat'&&(canEdit||tq)?B_('Ghi nhận đã ký duyệt, đóng dấu bản giấy','primary',askDuyet,false,'wf-duyet'):null,
    st0==='da_soat'&&canEdit?B_('Trả về nháp để sửa','ghost',askBack,false,'wf-back'):null,
    st0==='da_duyet'&&canEdit&&!b.gui_khach?B_('Ghi nhận đã gửi khách','',askGuiKhach,false,'wf-khach'):null,
    st0==='da_duyet'&&hasRole('tp')&&noPay?B_('Mở lại để sửa','ghost',askMoLai,false,'wf-molai'):null,
    st0==='huy'&&canEdit?B_('Khôi phục bảng kê','',()=>wf('Khôi phục bảng kê','',n=>{n.trang_thai='nhap';},'Đã khôi phục bảng kê.'),false,'wf-khoiphuc'):null,
    (b.id&&st0==='nhap'&&canEdit)?B_('Hủy bảng kê','ghost',askCancel,false,'wf-huy'):null,
    (b.khach.email||b.id)?B_('Soạn nội dung gửi khách','ghost',()=>bkMail(b),!b.id):null);
  const stp=[['Lập, gửi soát xét',0],['Thủ quỹ soát xét',1],['Ký duyệt, đóng dấu',2],['Đã duyệt, chưa thanh toán',3],['Đã thanh toán',4]],cur=({nhap:0,cho_soat:1,da_soat:2,da_duyet:3})[st0]!=null?({nhap:0,cho_soat:1,da_soat:2,da_duyet:3})[st0]+(st0==='da_duyet'&&bkPay(b).st==='da'?1:0):-1;
  const wfSteps=st0==='huy'?null:h('div',{class:'row small','data-sec':'steps',style:'gap:6px;flex-wrap:wrap'},stp.map(([l,i])=>h('span',null,tonePill((i+1)+'. '+l,i<cur?'ok':(i===cur?'info':'neutral')))));
  const wfTxt={nhap:b.tra_lai?'Bảng kê bị thủ quỹ trả lại: '+(b.tra_lai.ly_do||'')+'. Sửa rồi gửi soát xét lại.':null,cho_soat:'Đang chờ thủ quỹ soát xét số lượng mẫu và đơn giá. Bảng kê đang khóa.',da_soat:'Thủ quỹ đã soát xét'+((b.soat||{}).by?' ('+b.soat.by+')':'')+'. In bản giấy, ký duyệt, đóng dấu rồi bấm Ghi nhận đã ký duyệt.',da_duyet:'Bảng kê đã duyệt và được ghi nhận vào hệ thống.',huy:'Bảng kê đã hủy.'}[st0];
  const wfBanner=wfTxt?h('div',{class:'banner','data-tone':(st0==='nhap'&&b.tra_lai)?'warn':'info'},h('div',null,wfTxt)):null;
  const paySec=(st0==='da_duyet'||(b.pay||[]).length)?(()=>{const P=bkPay(b),can=canEdit&&st0==='da_duyet'&&P.con-P.cho>0;
    const rows=(b.pay||[]).map(p=>{const sl={cho_tq:['Chờ thủ quỹ xác nhận','warn'],da_xn:['Đã thanh toán','ok'],tra:['Bị trả lại','bad'],huy:['Đã rút lại','neutral']}[p.tt]||['','neutral'];
      return h('tr',null,h('td',null,fd(p.tt==='da_xn'?(p.ngay_xn||p.ngay):p.ngay)),h('td',null,HT_L[p.ht]||''),h('td',{class:'num'},fmtN(p.so_tien)+' đ'),h('td',null,p.ct||'',p.ly_do?h('div',{class:'muted small'},'Lý do: '+p.ly_do):null),h('td',null,tonePill(sl[0],sl[1])),h('td',null,((p.de||{}).by||'')+(p.xn?' → '+p.xn.by:'')),
        h('td',null,h('div',{class:'row',style:'gap:6px;flex-wrap:wrap'},
          p.tt==='cho_tq'&&tq?h('button',{class:'btn sm primary','data-act':'pay-ok',onclick:()=>bkConfirmPay(b,p)},'Đã thanh toán'):null,
          p.tt==='cho_tq'&&tq?h('button',{class:'btn sm','data-act':'pay-ret',onclick:()=>bkPayFlow(b,p,'tra')},'Trả lại'):null,
          p.tt==='cho_tq'&&canEdit?h('button',{class:'btn sm ghost','data-act':'pay-rut',onclick:()=>bkPayFlow(b,p,'rut')},'Rút lại'):null,
          p.tt==='da_xn'&&(tq||hasRole('tp'))?h('button',{class:'btn sm ghost','data-act':'pay-thu',onclick:()=>bkPayFlow(b,p,'thu')},'Thu hồi xác nhận'):null)));});
    return h('div',{class:'card flat stack','data-sec':'pay'},h('div',{class:'card-h'},h('h3',null,'Thanh toán'),can?h('button',{class:'btn primary','data-act':'pay-new',onclick:()=>bkPayDlg([b])},'Khách đã thanh toán, gửi thủ quỹ xác nhận'):null),
      h('div',{class:'row',style:'gap:18px;flex-wrap:wrap'},[['Giá trị',P.tt],['Đã thanh toán',P.da],['Chờ xác nhận',P.cho],['Còn lại',P.con]].map(([l,v])=>h('div',null,h('div',{class:'muted small'},l),h('b',null,fmtN(v)+' đ')))),
      rows.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Ngày','Hình thức','Số tiền','Chứng từ, ghi chú','Tình trạng','Người đề nghị, xác nhận',''].map(x=>h('th',null,x)))),h('tbody',null,rows))):h('p',{class:'muted small'},'Chưa có đợt thanh toán nào.'));})():null;
  const lsSec=(b.ls||[]).length?h('div',{class:'card flat stack','data-sec':'ls'},h('h3',null,'Lưu vết bảng kê'),h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Thời điểm','Người thực hiện','Việc','Ghi chú'].map(x=>h('th',null,x)))),h('tbody',null,(b.ls||[]).slice().reverse().map(x=>h('tr',null,h('td',null,fdt(x.at)),h('td',null,(x.by||'')+(x.vai?' ('+x.vai+')':'')),h('td',null,x.hd),h('td',null,x.ghi||''))))))):null;
'''
