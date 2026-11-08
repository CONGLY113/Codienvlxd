import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
fn=r'''
/* ===== 0.27.6 Phiếu nhận mẫu (in) ===== */
function nmPrintBox(P){
  const b1='border:1px solid #000;padding:4px 6px;vertical-align:top',th=t=>h('th',{style:b1+';background:#eee;text-align:left'},t),td=(t,st)=>h('td',{style:b1+(st||'')},t==null?'':String(t));
  const K=P.khach||{},D=P.du_an||{},line=(l,v)=>v?h('div',{style:'margin:1px 0'},h('b',null,l+': '),v):null;
  const tn=P.items.map(x=>(x.ct||[]).map(c=>{const t=TESTS.find(y=>y.code===c);return t?t.name:c;})).reduce((a,l)=>a.concat(l.filter(n=>a.indexOf(n)<0)),[]);
  const sig=h('div',{style:'display:flex;justify-content:space-between;margin-top:26px;text-align:center;gap:10px'},
    [['Người nhận mẫu',P.nguoi_nhan||''],['Đại diện khách hàng',K.lien_he||'']].map(([t,n])=>h('div',{style:'flex:1'},h('b',null,t),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên)'),h('div',{style:'height:70px'}),h('div',null,n))));
  return h('div',{class:'bk-print',style:'position:relative;font-family:"Times New Roman",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},
    h('img',{src:LOGO_L,alt:LOGO_ALT,width:76,height:76,style:'position:absolute;left:14mm;top:11mm;width:19mm;height:19mm'}),
    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG'),h('div',{style:'text-align:center;font-weight:bold'},'PHÒNG THÍ NGHIỆM CHUYÊN NGÀNH XÂY DỰNG'),
    h('div',{style:'text-align:center;font-size:11px;font-style:italic'},'23 Phan Huy Chú, phường Đồng Hới, tỉnh Quảng Trị'),
    h('h2',{style:'text-align:center;margin:14px 0 2px;font-size:18px'},'PHIẾU NHẬN MẪU'),
    h('div',{style:'text-align:center;margin-bottom:10px'},'Số phiếu yêu cầu: '+(P.so_yc||'')+' · Ngày '+fd(P.ngay||todayISO())),
    line('Khách hàng',K.ten),line('Mã số thuế',K.mst),line('Người liên hệ',[K.lien_he,K.dien_thoai].filter(Boolean).join(' · ')),line('Email',K.email),
    line('Công trình',D.cong_trinh),line('Hạng mục',D.hang_muc),line('Chủ đầu tư',D.chu_dau_tu),line('Đơn vị thi công',D.thi_cong),line('Tư vấn giám sát',D.giam_sat),line('Địa điểm công trình',D.dia_chi),
    h('div',{style:'margin:10px 0 4px'},h('b',null,'Mẫu đã nhận:')),
    h('table',{style:'border-collapse:collapse;width:100%;font-size:12px'},h('thead',null,h('tr',null,['TT','Mã mẫu','Tên mẫu','Nguồn gốc','Quy cách','SL','Ngày lấy','Ngày nhận','Hạn trả','Tình trạng, ghi chú'].map(th))),
      h('tbody',null,P.items.map((x,i)=>h('tr',null,td(i+1),td(x.ma_mau||'(chờ cấp mã)'),td(x.ten),td(x.nguon),td(x.quy),td(x.sl),td(fd(x.lay)),td(fd(x.nhan)),td(fd(x.han)),td([x.tt,x.gc].filter(Boolean).join('. ')))))),
    tn.length?h('div',{style:'margin-top:10px'},h('b',null,'Chỉ tiêu yêu cầu thử nghiệm: '),tn.join('; ')+'.'):null,
    h('div',{style:'margin-top:10px;font-size:12px;font-style:italic'},'Khách hàng xác nhận đã bàn giao đúng số lượng mẫu và thông tin ghi trên phiếu này.'),sig);
}
function nmPackFromSample(s){const m=s.mau||{};return{ma_mau:s.ma_mau,ten:m.ten,nguon:m.nguon_goc,quy:m.quy_cach,sl:m.so_luong,lay:m.ngay_lay,nhan:m.ngay_nhan,han:s.han_tra,tt:m.tinh_trang,gc:m.ghi_chu,ct:s.chi_tieu||[]};}
async function nmDoPrint(P){
  const box=nmPrintBox(P);document.body.append(box);
  await Promise.all(Array.from(box.querySelectorAll('img')).map(im=>im.decode?im.decode().catch(()=>{}):0));document.documentElement.classList.add('printing-bk');
  const done=()=>{document.documentElement.classList.remove('printing-bk');box.remove();window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  try{window.print();}catch(e){done();toast('Máy không cho in trực tiếp.','bad');return;}
  setTimeout(()=>{if(document.documentElement.classList.contains('printing-bk'))done();},1500);
}
function nmPrintRequest(e){const l=e.mau.slice().sort((a,b)=>(a.ma_mau||'')<(b.ma_mau||'')?-1:1),s0=l[0]||{};
  nmDoPrint({so_yc:e.so_yc,khach:e.khach,du_an:e.du_an,ngay:(s0.mau&&s0.mau.ngay_nhan)||todayISO(),nguoi_nhan:(s0.xem_xet&&s0.xem_xet.by)||(SESSION&&SESSION.name)||'',items:l.map(nmPackFromSample)});}
'''
rep("pages['nhan-mau']={render(root){",fn+"pages['nhan-mau']={render(root){")
# nút trong danh sách phiếu đang thực hiện
rep("h('td',{class:'r'},h('button',{class:'btn sm primary',onclick:()=>{setTab('manual');selYc.value=e.so_yc;selYc.onchange();window.scrollTo({top:0,behavior:'smooth'});}},'Bổ sung mẫu'))",
    "h('td',{class:'r'},h('button',{class:'btn sm','data-act':'nm-in',onclick:()=>nmPrintRequest(e)},'In phiếu nhận mẫu'),' ',h('button',{class:'btn sm primary',onclick:()=>{setTab('manual');selYc.value=e.so_yc;selYc.onchange();window.scrollTo({top:0,behavior:'smooth'});}},'Bổ sung mẫu'))")
# nút sau khi tiếp nhận
rep("actions:[h('button',{class:'btn primary',onclick:()=>{r.close();if(!existingId&&window.__form)window.__form.clear();if(current&&current.update)current.update();}},'Xong')]});",
 "actions:[h('button',{class:'btn','data-act':'nm-in-moi',onclick:()=>{const mm=base.mau||{},cts=base.chi_tieu||[],codes=[res.ma_mau].concat(res.more||[]);nmDoPrint({so_yc:res.so_yc,khach:base.khach,du_an:base.du_an,ngay:dNhan.value,nguoi_nhan:SESSION.name,items:[{ma_mau:codes[0],ten:mm.ten,nguon:mm.nguon_goc,quy:mm.quy_cach,sl:mm.so_luong,lay:mm.ngay_lay,nhan:dNhan.value,han:dHan.value,tt:mm.tinh_trang,gc:mm.ghi_chu,ct:cts}].concat((base.extra||[]).map((r,i)=>({ma_mau:codes[i+1],ten:r.ten,nguon:r.nguon,quy:r.quy,sl:r.sl||1,lay:r.lay,nhan:r.nhan,han:r.han||dHan.value,tt:mm.tinh_trang,gc:'',ct:r.loai===mm.loai?cts:defTests(r.loai)})))});}},'In phiếu nhận mẫu'),h('button',{class:'btn primary',onclick:()=>{r.close();if(!existingId&&window.__form)window.__form.clear();if(current&&current.update)current.update();}},'Xong')]});")
rep("const BUILD='0.27.5 · 07/11/2026';","const BUILD='0.27.6 · 08/11/2026';")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['08/11/2026','B27','Claude','Sửa lỗi theo file V0.27.5: tab Tổng hợp quan trắc gốc bỏ Trung bình, Nhỏ nhất, Lớn nhất; Hồ sơ lưu trữ bỏ nhật ký thao tác; thêm in Phiếu nhận mẫu (có khối ký người nhận mẫu và khách hàng) ở danh sách phiếu đang thực hiện và sau khi tiếp nhận.','Đã kiểm thử'],\n")
open(F,'w',encoding='utf-8').write(s)
