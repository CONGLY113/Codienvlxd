/* ---- trình soạn bảng kê, báo giá */
function dvOpen(b){DVS.draft=JSON.parse(JSON.stringify(b));DVS.draft.kind=DVS.draft.kind||(b.col&&/^dvbg_/.test(b.col)?'bg':'bk');DVS.dirty=false;DVS.kind=DVS.draft.kind;DVS.tab=DVS.kind;render();}
function dvNewDlg(kind){
  const rooms=dvLapRooms().filter(r=>kind==='bg'||r!=='co');if(!rooms.length){toast('Bạn chưa được giao lập '+(kind==='bg'?'báo giá':'bảng kê')+'.','bad');return;}
  const rs=h('select',{'aria-label':'Phòng',onchange:()=>fillM()},rooms.map(r=>h('option',{value:r},dvRoomName(r)))),ms=h('select',{'aria-label':'Mảng dịch vụ'});
  const fillM=()=>{const l=DV_ROOM[rs.value].mang.filter(m=>kind==='bg'||DV_MANG[m].bk);ms.replaceChildren(...l.map(m=>h('option',{value:m},DV_MANG[m].ten)));};fillM();
  const m=openModal({title:kind==='bg'?'Lập báo giá mới':'Lập bảng kê mới',sub:kind==='bg'?'Báo giá gửi khách tham khảo; trưởng phòng của phòng duyệt.':'Bảng kê lập theo kết quả dịch vụ đã thực hiện, đơn giá theo bảng giá ban hành.',
    body:[bkF('Phòng',rs),bkF('Mảng dịch vụ',ms)],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'dv-new-ok',onclick:()=>{const d=dvEmpty(kind,rs.value,ms.value);m.close();DVS.draft=d;DVS.dirty=true;DVS.kind=kind;DVS.tab=kind;render();}},'Tạo')]});
}
function dvEditor(box){
  const b=DVS.draft,kind=b.kind,room=b.phong,st=b.trang_thai,canEdit=st==='nhap'&&dvCanLap(room),canTp=dvCanTp(room),isBk=kind==='bk';
  const dirt=h('span',{class:'pill','data-tone':'warn',hidden:!DVS.dirty},'Chưa lưu');
  const mark=()=>{DVS.dirty=true;dirt.hidden=false;};
  const amt={},totBox=h('div',{class:'stack small',style:'max-width:420px;margin-left:auto'});
  const dsel=h('select',{'aria-label':'Kiểu chiết khấu',disabled:!canEdit,onchange:e=>{b.giam.kieu=e.target.value;mark();upd();}},h('option',{value:'pct'},'Chiết khấu %'),h('option',{value:'tien'},'Giảm trừ (đ)'));dsel.value=b.giam.kieu||'pct';
  const dval=h('input',{type:'number',min:'0',step:'any',value:b.giam.gt||0,disabled:!canEdit,'aria-label':'Giá trị chiết khấu',style:'width:110px',oninput:e=>{b.giam.gt=+e.target.value||0;mark();upd();}});
  const vsel=h('select',{'aria-label':'Thuế suất GTGT',disabled:!canEdit,onchange:e=>{b.vat=+e.target.value;mark();upd();}},DV_VAT.map(v=>h('option',{value:v},v+' %')));vsel.value=String(b.vat==null?dvVatDef():b.vat);
  const cV={},tv=(k)=>cV[k]=h('b',null,'0'),row2=(l,r)=>h('div',{class:'row',style:'justify-content:space-between;gap:12px'},h('span',null,l),r);
  totBox.append(row2('Cộng tiền hàng',tv('tong')),row2(h('span',{class:'row',style:'gap:6px'},dsel,dval),tv('giam')),row2('Cộng sau chiết khấu',tv('trc')),row2(h('span',{class:'row',style:'gap:6px'},'Thuế GTGT',vsel),tv('thue')),row2(h('b',null,'TỔNG CỘNG THANH TOÁN'),tv('tt')));
  const words=h('div',{class:'muted small',style:'text-align:right;font-style:italic'});
  function upd(){const T=dvTotals(b);b.dong.forEach(l=>{if(amt[l.id])amt[l.id].textContent=fmtN(Math.round((+l.sl||0)*(+l.dg||0)));});
    cV.tong.textContent=fmtN(T.tong)+' đ';cV.giam.textContent=fmtN(T.giam)+' đ';cV.trc.textContent=fmtN(T.trc)+' đ';cV.thue.textContent=fmtN(T.thue)+' đ';cV.tt.textContent=fmtN(T.tt)+' đ';words.textContent='Bằng chữ: '+docSo(T.tt);}
  /* khách hàng */
  const kin={};const kf=(key,label,ph)=>{const i=kin[key]=h('input',{type:'text',value:b.khach[key]||'',disabled:!canEdit,placeholder:ph||'','aria-label':label,list:key==='ten'?'dv-kh-list':null,
      oninput:e=>{b.khach[key]=e.target.value;mark();},onchange:e=>{if(key!=='ten')return;const k=DV.kh.find(x=>x.ten===e.target.value);if(k){['mst','dia_chi','lien_he','dt','email'].forEach(f=>{if(!b.khach[f]&&k[f]){b.khach[f]=k[f];if(kin[f])kin[f].value=k[f];}});}}});return bkF(label,i);};
  const dl=h('datalist',{id:'dv-kh-list'},DV.kh.map(k=>h('option',{value:k.ten},k.mst||'')));
  const ngay=h('input',{type:'date',value:b.ngay,disabled:!canEdit||!!b.id,'aria-label':'Ngày',onchange:e=>{b.ngay=e.target.value;mark();}});
  const ct=h('input',{type:'text',value:b.cong_trinh||'',disabled:!canEdit,'aria-label':'Công trình, nội dung',placeholder:isBk?'Công trình, cơ sở, thiết bị được dịch vụ':'Nội dung báo giá',oninput:e=>{b.cong_trinh=e.target.value;mark();}});
  const gc=h('textarea',{rows:'2',disabled:!canEdit,'aria-label':'Ghi chú',oninput:e=>{b.ghi_chu=e.target.value;mark();}});gc.value=b.ghi_chu||'';
  /* các dòng */
  const tb=h('tbody');
  function drawLines(){
    tb.replaceChildren(...b.dong.map((l,i)=>{
      const sl=h('input',{type:'number',min:'0',step:'any',value:l.sl,disabled:!canEdit,'aria-label':'Số lượng dòng '+(i+1),style:'width:80px',oninput:e=>{l.sl=+e.target.value||0;mark();upd();}});
      let pc;
      if(canEdit&&(l.tay||l.khoa===false)){
        const dg=h('input',{type:'number',min:'0',step:'any',value:l.dg,'aria-label':'Đơn giá dòng '+(i+1),style:'width:120px',oninput:e=>{l.dg=+e.target.value||0;mark();upd();}});
        pc=h('div',{class:'stack',style:'gap:2px'},dg,l.tay?h('span',{class:'muted small'},'đơn giá phát sinh'):h('span',{class:'muted small'},'Gốc '+fmtN(l.dg0)+' đ · mở khóa: '+(l.ly_do||''),' ',h('button',{class:'btn sm ghost','data-act':'dv-relock',onclick:()=>{l.dg=l.dg0;l.khoa=true;delete l.ly_do;mark();drawLines();upd();}},'Khóa lại')));
      }else if(canEdit&&canTp&&!l.tay){
        pc=h('div',{class:'row',style:'gap:6px;justify-content:flex-end'},fmtN(l.dg),h('button',{class:'btn sm ghost','data-act':'dv-unlock','aria-label':'Mở khóa đơn giá dòng '+(i+1),onclick:()=>bkTextDlg('Mở khóa đơn giá','Đơn giá niêm yết '+fmtN(l.dg0)+' đ. Chỉ trưởng phòng hoặc quản trị được sửa, phải nêu lý do và có lưu vết.','Lý do',true,'Mở khóa',v=>{l.khoa=false;l.ly_do=v+' ('+SESSION.name+')';mark();drawLines();upd();})},'Mở khóa'));
      }else pc=h('div',null,fmtN(l.dg),l.khoa===false&&!l.tay?h('div',{class:'muted small'},'Đã sửa, gốc '+fmtN(l.dg0)+' đ'+(l.ly_do?' · '+l.ly_do:'')):null);
      const nm=(l.tay&&canEdit)?h('input',{type:'text',value:l.ten,placeholder:'Nội dung phát sinh (vận chuyển, công tác phí...)','aria-label':'Nội dung dòng '+(i+1),style:'min-width:200px',oninput:e=>{l.ten=e.target.value;mark();}}):h('div',null,l.ten,l.nhom&&!l.tay?h('div',{class:'muted small'},l.nhom.split(' › ').pop()):null);
      const un=(l.tay&&canEdit)?h('input',{type:'text',value:l.u||'',style:'width:70px','aria-label':'ĐVT dòng '+(i+1),oninput:e=>{l.u=e.target.value;mark();}}):(l.u||'');
      const a=amt[l.id]=h('span',null,fmtN(Math.round((+l.sl||0)*(+l.dg||0))));
      const cc=isBk&&st!=='huy'?h('td',null,h('button',{class:'btn sm '+(l.cc&&l.cc.so?'':'ghost'),'data-act':'dv-cc',onclick:()=>dvCcDlg(b,l,()=>{drawLines();}),disabled:!(dvCanLap(room)||(l.cc&&l.cc.so))},l.cc&&l.cc.so?l.cc.so:'Gắn số'),l.cc&&l.cc.het_han?h('div',{class:'muted small'},'Hạn '+fd(l.cc.het_han)):null):(isBk?h('td'):null);
      return h('tr',{'data-id':l.id},h('td',null,i+1),h('td',null,nm),h('td',null,un),h('td',null,sl),h('td',{class:'num'},pc),h('td',{class:'num'},a),cc,h('td',null,canEdit?h('button',{class:'btn sm ghost danger','aria-label':'Xóa dòng '+(i+1),'data-act':'dv-del',onclick:()=>{b.dong=b.dong.filter(x=>x!==l);mark();drawLines();upd();}},'Xóa'):null));}));
    if(!b.dong.length)tb.replaceChildren(h('tr',null,h('td',{colspan:isBk?'8':'7',class:'muted'},'Chưa có dòng nào. Bấm Thêm từ bảng giá, hoặc Nhập từ Excel.')));
  }
  const fileIn=h('input',{type:'file',accept:'.xlsx',hidden:true,onchange:async e=>{const f=e.target.files[0];e.target.value='';if(f)await dvImportLines(b,f,()=>{drawLines();upd();dirt.hidden=false;});}});
  const addBar=canEdit?h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},
    h('button',{class:'btn primary','data-act':'dv-pick',onclick:()=>dvPickDlg(b,l=>{b.dong.push(l);if(!b.mang)b.mang=l.mang;mark();drawLines();upd();})},'Thêm từ bảng giá'),
    h('button',{class:'btn','data-act':'dv-tay',onclick:()=>{b.dong.push({id:rid(),g:'',mang:b.mang,nhom:'',ten:'',u:'Lần',sl:1,dg:0,dg0:0,khoa:false,tay:true});mark();drawLines();upd();}},'Thêm dòng phát sinh'),
    h('button',{class:'btn','data-act':'dv-imp',onclick:()=>fileIn.click()},'Nhập từ Excel'),
    h('button',{class:'btn ghost',onclick:async()=>saveBytes('Mau_nhap_dong.xlsx',await dvTemplateXlsx(b))},'Tải mẫu Excel'),
    h('button',{class:'btn ghost',onclick:async()=>saveBytes('Bang_gia_co_ma.xlsx',await dvPriceXlsx((DV_ROOM[room].mang).filter(m=>kind==='bg'||DV_MANG[m].bk)))},'Bảng giá có mã (Excel)'),fileIn):null;
  /* lưu và quy trình */
  const valid=(forSend)=>{
    if(!b.khach.ten.trim()){toast('Nhập tên khách hàng.','bad');return false;}
    if(forSend){if(!b.dong.length){toast('Chưa có dòng nào.','bad');return false;}
      const bad=b.dong.findIndex(l=>!(+l.sl>0)||!(+l.dg>0)||!(l.ten||'').trim());if(bad>=0){toast('Dòng '+(bad+1)+' thiếu nội dung, số lượng hoặc đơn giá.','bad');return false;}}
    return true;};
  const doSave=async(forSend)=>{if(!valid(forSend))return false;const ok=await dvSave(b);if(ok){DVS.dirty=false;dirt.hidden=true;toast('Đã lưu '+(isBk?'bảng kê ':'báo giá ')+b.so+'.');if(!forSend)render();}return ok;};
  const saved=async(forSend)=>(DVS.dirty||!b.id)?await doSave(forSend):(valid(forSend));
  const wf=(hd,ghi,fn,msg)=>dvAct(b,hd,ghi,fn,msg).then(n=>{if(n)render();return!!n;});
  const B_=(label,cls,fn,dis,act)=>h('button',{class:'btn '+(cls||''),disabled:!!dis,'data-act':act||null,onclick:fn},label);
  const stamp=(n,k)=>{n[k]={by:SESSION.name,id:SESSION.id,at:new Date().toISOString()};};
  const askGui=async()=>{if(!(await saved(true)))return;bkTextDlg(isBk?'Gửi thủ quỹ soát xét':'Gửi trưởng phòng duyệt',(isBk?'Bảng kê ':'Báo giá ')+b.so+' · '+fmtN(dvTotals(b).tt)+' đ','Ghi chú',false,'Gửi',v=>wf('Gửi '+(isBk?'thủ quỹ soát xét':'trưởng phòng duyệt'),v,n=>{n.trang_thai=isBk?'cho_soat':'cho_duyet';n.tra_lai=null;},'Đã gửi.'));};
  const askTra=(who)=>bkTextDlg('Trả lại '+b.so,'Quay về người lập để sửa, kèm lý do.','Lý do trả lại',true,'Trả lại',v=>wf('Trả lại ('+who+')',v,n=>{n.trang_thai='nhap';n.tra_lai={by:SESSION.name,vai:dvVai(),ly_do:v,at:new Date().toISOString()};}));
  const askThuHoi=()=>bkTextDlg('Thu hồi '+b.so,'Quay về nháp để sửa.','Ghi chú',false,'Thu hồi',v=>wf('Thu hồi về nháp',v,n=>{n.trang_thai='nhap';}));
  const askSoat=()=>bkTextDlg('Soát xét '+b.so,'Đối chiếu nội dung, số lượng và đơn giá từng dòng với bảng giá. Giá trị '+fmtN(dvTotals(b).tt)+' đ.','Ghi chú soát xét',false,'Soát xét đạt',v=>wf('Thủ quỹ soát xét đạt',v,n=>{n.trang_thai='da_soat';stamp(n,'soat');}));
  const askDuyet=()=>bkTextDlg((isBk?'Kế toán trưởng duyệt ':'Trưởng phòng duyệt ')+b.so,'Giá trị '+fmtN(dvTotals(b).tt)+' đ (đã gồm thuế GTGT '+dvTotals(b).vat+'%).','Ghi chú',false,'Duyệt',v=>wf(isBk?'Kế toán trưởng duyệt':'Trưởng phòng duyệt báo giá',v,n=>{n.trang_thai='da_duyet';stamp(n,'duyet');},'Đã duyệt '+b.so+'.'));
  const askMoLai=()=>bkTextDlg('Mở lại '+b.so,isBk?'Chỉ mở lại khi chưa có khoản thanh toán nào. Về nháp, phải gửi soát xét và duyệt lại.':'Báo giá về nháp để điều chỉnh theo yêu cầu khách, rồi trưởng phòng duyệt lại.','Lý do mở lại',true,'Mở lại',v=>wf('Mở lại',v,n=>{if(isBk&&(n.pay||[]).some(p=>p.tt==='da_xn'||p.tt==='cho_tq'))return;n.trang_thai='nhap';n.duyet=null;n.soat=null;}));
  const askHuy=()=>bkTextDlg('Hủy '+b.so,'Bản hủy vẫn lưu để đối chiếu.','Lý do hủy',true,'Hủy',v=>wf('Hủy',v,n=>{n.trang_thai='huy';}));
  const P=dvPay(b),paid=(b.pay||[]).some(p=>p.tt==='da_xn'||p.tt==='cho_tq');
  const lapOk=dvCanLap(room),tq=hasRole('tq'),ktt=hasRole('ktt'),tp=dvCanTp(room);
  const btns=[B_('Lưu',canEdit?'primary':'',()=>doSave(false),!canEdit||!b.dong,'dv-save')];
  if(canEdit){btns.push(B_(isBk?'Gửi thủ quỹ soát xét':'Gửi trưởng phòng duyệt','primary',askGui,false,'dv-gui'));
    if(!isBk&&tp)btns.push(B_('Lưu và duyệt ngay','',async()=>{if(!(await saved(true)))return;askDuyet();},false,'dv-duyet-ngay'));
    if(b.id)btns.push(B_(isBk?'Hủy bảng kê':'Hủy báo giá','ghost',askHuy,false,'dv-huy'));}
  if(st==='cho_soat'||st==='cho_duyet'){if(isBk&&tq)btns.push(B_('Soát xét đạt','primary',askSoat,false,'dv-soat'),B_('Trả lại','',()=>askTra('Thủ quỹ'),false,'dv-tra'));
    if(!isBk&&tp)btns.push(B_('Duyệt báo giá','primary',askDuyet,false,'dv-duyet'),B_('Trả lại','',()=>askTra('Trưởng phòng'),false,'dv-tra'));
    if(lapOk)btns.push(B_('Thu hồi về nháp','ghost',askThuHoi,false,'dv-thuhoi'));}
  if(st==='da_soat'&&isBk){if(ktt)btns.push(B_('Duyệt (kế toán trưởng)','primary',askDuyet,false,'dv-duyet'),B_('Trả lại','',()=>askTra('Kế toán trưởng'),false,'dv-tra'));if(lapOk)btns.push(B_('Thu hồi về nháp','ghost',askThuHoi,false,'dv-thuhoi'));}
  if(st==='da_duyet'){btns.push(B_('In / Lưu PDF','primary',()=>dvDoPrint(b),false,'dv-print'),B_('Tải Excel','',async()=>saveBytes((isBk?'Bang_ke_':'Bao_gia_')+b.so.replace(/[^\w.]+/g,'_')+'.xlsx',await dvDocXlsx(b)),false,'dv-xlsx'));
    if((isBk&&(ktt||dvAdmin())&&!paid)||(!isBk&&(lapOk||tp)))btns.push(B_(isBk?'Mở lại bảng kê':'Mở lại để điều chỉnh','ghost',askMoLai,false,'dv-molai'));}
  if(st==='huy'&&lapOk)btns.push(B_('Khôi phục','',()=>wf('Khôi phục','',n=>{n.trang_thai='nhap';},'Đã khôi phục.'),false,'dv-khoiphuc'));
  btns.push(B_('Đóng','ghost',()=>{const go=()=>{DVS.draft=null;DVS.dirty=false;render();};if(DVS.dirty)bkTextDlg('Đóng khi chưa lưu','Các thay đổi chưa lưu sẽ mất.','Ghi chú',false,'Vẫn đóng',()=>{go();});else go();},false,'dv-close'));
  const wfTxt={nhap:b.tra_lai?'Bị '+b.tra_lai.vai.toLowerCase()+' '+b.tra_lai.by+' trả lại: '+(b.tra_lai.ly_do||'')+'. Sửa rồi gửi lại.':null,cho_soat:'Đang chờ thủ quỹ soát xét.',cho_duyet:'Đang chờ trưởng phòng duyệt.',da_soat:'Thủ quỹ đã soát xét '+(b.soat?'('+b.soat.by+') ':'')+'. Chờ kế toán trưởng duyệt trên hệ thống.',
    da_duyet:isBk?'Đã duyệt'+(b.duyet?' ('+b.duyet.by+', '+fdt(b.duyet.at)+')':'')+'. In bản giấy, đóng dấu mộc, thu tiền; thủ quỹ xác nhận khi đã nhận.':'Đã duyệt. Bấm In / Lưu PDF để xuất file gửi khách.',huy:'Đã hủy.'}[st];
  /* thanh toán */
  const payCard=(isBk&&st==='da_duyet')?h('div',{class:'card flat stack','data-sec':'pay'},h('h3',null,'Thanh toán'),
    h('div',{class:'pipe'},[['Phải thanh toán',fmtN(P.tt)+' đ'],['Đã thu (xác nhận)',fmtN(P.da)+' đ'],['Chờ xác nhận',fmtN(P.cho)+' đ'],['Còn lại',fmtN(P.con)+' đ']].map(([k,v])=>h('div',null,h('b',null,v),h('span',null,k)))),
    (b.pay||[]).length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Ngày','Hình thức','Số tiền','Chứng từ','Tình trạng',''].map(x=>h('th',null,x)))),h('tbody',null,b.pay.map(p=>h('tr',null,h('td',null,fd(p.ngay_xn||p.ngay)),h('td',null,HT_L[p.ht||'ck']),h('td',{class:'num'},fmtN(p.so_tien)+' đ'),h('td',null,p.ct||''),
      h('td',null,{cho_tq:tonePill('Chờ thủ quỹ xác nhận','warn'),da_xn:tonePill('Đã xác nhận','ok'),tra:tonePill('Bị trả lại','bad'),huy:tonePill('Đã rút','neutral')}[p.tt]||p.tt,p.ly_do?h('div',{class:'muted small'},p.ly_do):null),
      h('td',null,p.tt==='cho_tq'&&tq?[B_('Xác nhận','primary sm',()=>dvConfirmPay(b,p),false,'dv-pay-xn'),' ',B_('Trả lại','sm',()=>dvPayFlow(b,p,'tra'),false,'dv-pay-tra')]:null,p.tt==='cho_tq'&&lapOk?B_('Rút lại','sm ghost',()=>dvPayFlow(b,p,'rut'),false,'dv-pay-rut'):null,p.tt==='da_xn'&&tq?B_('Thu hồi xác nhận','sm ghost',()=>dvPayFlow(b,p,'thu'),false,'dv-pay-thu'):null)))))):null,
    lapOk&&P.con-P.cho>0?B_('Đề nghị thủ quỹ xác nhận thanh toán','primary',()=>dvPayDlg(b),false,'dv-pay-de'):null):null;
  const lsSec=(b.ls||[]).length?h('div',{class:'card flat stack','data-sec':'ls'},h('h3',null,'Lưu vết'),h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Thời gian','Người thực hiện','Vai trò','Hành động','Ghi chú'].map(x=>h('th',null,x)))),h('tbody',null,b.ls.slice().reverse().map(x=>h('tr',null,h('td',null,fdt(x.at)),h('td',null,x.by),h('td',null,x.vai||''),h('td',null,x.hd),h('td',null,x.ghi||'')))))) ):null;
  const stl=dvStLabel(b,kind);
  box.append(h('div',{class:'card stack','data-sec':'editor'},
    h('div',{class:'card-h'},h('div',null,h('h2',null,dvTitle(b)),h('p',{class:'muted small'},(b.so?'Số '+b.so:'Số sẽ cấp khi lưu: '+DV_MANG[b.mang][kind]+b.ngay.slice(2,4)+'.'+b.ngay.slice(5,7)+'.'+b.ngay.slice(8,10)+'.STT')+' · '+dvRoomName(room)+' · '+DV_MANG[b.mang].ten)),h('div',{class:'row'},tonePill(stl[0],stl[1]),dirt)),
    wfTxt?h('div',{class:'banner','data-tone':b.tra_lai&&st==='nhap'?'bad':'info'},h('div',null,wfTxt)):null,
    h('div',{class:'grid3'},h('div',{class:'field',style:'grid-column:span 2'},kf('ten','Khách hàng, cơ sở','Tên khách hàng hoặc cơ sở'),dl),bkF('Ngày',ngay)),
    h('div',{class:'grid3'},kf('mst','Mã số thuế','Để xuất hóa đơn'),kf('dia_chi','Địa chỉ'),kf('lien_he','Người liên hệ')),
    h('div',{class:'grid3'},kf('dt','Điện thoại'),kf('email','Email'),bkF(isBk?'Công trình, nội dung':'Nội dung báo giá',ct)),
    addBar,
    h('div',{class:'tbl-wrap'},h('table',{class:'dv-lines'},h('thead',null,h('tr',null,['TT','Nội dung','ĐVT','Số lượng','Đơn giá (đ)','Thành tiền (đ)'].concat(isBk?['Giấy chứng nhận']:[]).concat(['']).map(x=>h('th',null,x)))),tb)),
    totBox,words,bkF('Ghi chú (in trên '+(isBk?'bảng kê':'báo giá')+')',gc),
    isBk&&canEdit?h('label',{class:'chk'},h('input',{type:'checkbox',checked:b.qr!==false,'aria-label':'In mã QR thanh toán',onchange:e=>{b.qr=e.target.checked;mark();}}),' In mã QR thanh toán trên bảng kê'):null,
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},btns)),...[payCard,lsSec].filter(Boolean));
  drawLines();upd();
}
/* ---- thanh toán giai đoạn 2 */
function dvPayDlg(b){
  const P=dvPay(b),ht=h('select',{'aria-label':'Hình thức'},h('option',{value:'ck'},'Chuyển khoản về tài khoản cơ quan'),h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ')),ngay=h('input',{type:'date',value:todayISO(),'aria-label':'Ngày'}),ct=h('input',{type:'text','aria-label':'Chứng từ',placeholder:'Số giao dịch, người nộp tiền'}),sotien=h('input',{type:'number',min:'0',step:'1000','aria-label':'Số tiền'});sotien.value=Math.max(0,P.con-P.cho);
  const m=openModal({title:'Đề nghị thủ quỹ xác nhận thanh toán',sub:'Bảng kê '+b.so+' · còn lại '+fmtN(P.con-P.cho)+' đ',body:[h('div',{class:'grid3'},bkF('Hình thức',ht),bkF('Ngày tiền về, ngày nộp',ngay),bkF('Số tiền (đ)',sotien)),bkF('Chứng từ, ghi chú',ct)],actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),h('button',{class:'btn primary','data-act':'pay-send',onclick:async function(){
    const v=Math.round(+sotien.value||0);if(v<=0||v>P.con-P.cho){toast('Số tiền không hợp lệ (tối đa '+fmtN(P.con-P.cho)+' đ).','bad');return;}if(!/^\d{4}-\d{2}-\d{2}$/.test(ngay.value)){toast('Chọn ngày.','bad');return;}
    this.disabled=true;const n=await dvAct(b,'Đề nghị thủ quỹ xác nhận thanh toán',fmtN(v)+' đ · '+HT_L[ht.value]+(ct.value.trim()?' · '+ct.value.trim():''),d=>{d.pay.push({id:rid(),ngay:ngay.value,so_tien:v,ht:ht.value,ct:ct.value.trim(),tt:'cho_tq',de:{by:SESSION.name,at:new Date().toISOString()}});},'Đã gửi đề nghị cho thủ quỹ.');
    m.close();if(n)render();}},'Gửi thủ quỹ')]});
}
function dvConfirmPay(b,p){
  const ngay=h('input',{type:'date',value:p.ngay||todayISO(),'aria-label':'Ngày nhận tiền'});
  bkTextDlg('Xác nhận đã thanh toán','Bảng kê '+b.so+' · '+b.khach.ten+' · '+fmtN(p.so_tien)+' đ · '+HT_L[p.ht||'ck']+'. Chỉ bấm khi tiền đã về tài khoản hoặc đã nhận tiền mặt.','Ghi chú của thủ quỹ',false,'Đã thanh toán',async v=>{
    const d=ngay.value||todayISO(),n=await dvAct(b,'Thủ quỹ xác nhận đã thanh toán',fmtN(p.so_tien)+' đ · '+HT_L[p.ht||'ck']+(v?' · '+v:''),x=>{const e=x.pay.find(y=>y.id===p.id);if(!e)return;e.tt='da_xn';e.xn={by:SESSION.name,at:new Date().toISOString(),ghi:v};e.ngay_xn=d;},'Đã ghi nhận thanh toán.');
    if(!n)return false;render();},[bkF('Ngày nhận tiền',ngay)]);
}
function dvPayFlow(b,p,kind){
  const cfg={tra:['Trả lại đề nghị thanh toán','Lý do trả lại',true,'Trả lại','Thủ quỹ trả lại đề nghị thanh toán',x=>{x.tt='tra';}],rut:['Rút lại đề nghị thanh toán','Lý do rút lại',false,'Rút lại','Rút lại đề nghị thanh toán',x=>{x.tt='huy';}],thu:['Thu hồi xác nhận thanh toán','Lý do thu hồi',true,'Thu hồi','Thu hồi xác nhận thanh toán',x=>{x.tt='tra';}]}[kind];
  bkTextDlg(cfg[0],'Bảng kê '+b.so+' · '+fmtN(p.so_tien)+' đ',cfg[1],cfg[2],cfg[3],async v=>{const n=await dvAct(b,cfg[4],fmtN(p.so_tien)+' đ'+(v?' · '+v:''),d=>{const e=d.pay.find(y=>y.id===p.id);if(e){cfg[5](e);if(v)e.ly_do=v;}});if(!n)return false;render();});
}
