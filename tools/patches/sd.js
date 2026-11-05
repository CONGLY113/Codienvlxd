/* ====================================================================== 0.25.0 SỬA ĐỔI, THAY THẾ PHIẾU ĐÃ PHÁT HÀNH
   Căn cứ: TCVN ISO/IEC 17025:2017 mục 7.8.8 (sửa đổi báo cáo sau khi phát hành), 7.1.6 (thay đổi hợp đồng), 7.5.2 (sửa hồ sơ kỹ thuật),
   7.10 và 8.7 (công việc không phù hợp); Phụ lục III Nghị định 62/2016/NĐ-CP (hợp nhất tại 54/VBHN-BXD ngày 26/06/2026) về nội dung phiếu kết quả.
   Nguyên tắc: không sửa đè, không xóa phiếu đã phát hành. Phiếu thay thế mang số cũ kèm hậu tố SĐ01, SĐ02..., dẫn chiếu phiếu cũ, nêu rõ nội dung đổi và lý do.
   Số liệu thử nghiệm không đổi. Phiếu cũ, giá trị cũ và mã băm cũ lưu trong hồ sơ suadoi/<id>. Luồng nhận mẫu, giao việc, soát xét, phát hành, thanh toán giữ nguyên.
   Loại A: phòng ghi nhầm, ghi sót (miễn phí, cần bằng chứng đối chiếu). Loại B: khách đề nghị đổi thông tin do khách cung cấp (cần văn bản đề nghị).
   Loại D: liên quan mẫu, chỉ tiêu, kết quả, hoặc ngày nhận mẫu theo ý khách: không sửa, ghi nhận từ chối. Ngày nhận mẫu chỉ sửa ở loại A khi có bằng chứng. */
const SD_OPEN=['cho_soat_xet','cho_phe_duyet','da_phat_hanh'];
const SD_ST={cho_soat_xet:['Chờ soát xét','info'],cho_phe_duyet:['Chờ phê duyệt','info'],da_phat_hanh:['Chờ xác nhận thu hồi bản cũ','warn'],hoan_tat:['Hoàn tất','ok'],tu_choi:['Từ chối','bad'],huy:['Đã hủy','neutral']};
const SD_LOAI={A:'A. Phòng ghi nhầm, ghi sót',B:'B. Khách đề nghị đổi thông tin do khách cung cấp',D:'D. Liên quan mẫu, chỉ tiêu, kết quả: không sửa'};
const SD_FIELDS=[
 {k:'khach.ten',l:'Tên khách hàng'},{k:'du_an.cong_trinh',l:'Tên công trình'},{k:'du_an.hang_muc',l:'Hạng mục'},{k:'du_an.chu_dau_tu',l:'Chủ đầu tư'},
 {k:'du_an.giam_sat',l:'Đơn vị tư vấn giám sát'},{k:'du_an.thi_cong',l:'Đơn vị thi công'},{k:'du_an.dia_chi',l:'Địa chỉ công trình'},{k:'mau.ngay_nhan',l:'Ngày nhận mẫu',date:true,onlyA:true}];
const SD_HINH_THUC=['Văn bản giấy có chữ ký, đóng dấu của khách','Email hoặc văn bản điện tử có xác nhận của khách','Phiếu đề nghị BM-SĐ-01 do khách ký'];
const sdList=()=>S.suadoi||[];
const sdVal=(s,k)=>{const p=k.split('.'),v=(s[p[0]]||{})[p[1]];return v==null?'':String(v);};
const sdPad=n=>String(n).padStart(2,'0');
const sdNo=(base,rev)=>base+'-SĐ'+sdPad(rev);
const sdActive=sid=>sdList().find(x=>x.sample===sid&&SD_OPEN.includes(x.status));
const sdCanLap=()=>!!SESSION&&(hasRole('tiepnhan')||hasRole('tp'));
const sdCanSx=d=>!!SESSION&&hasRole('sx')&&d.status==='cho_soat_xet'&&d.lap.by_id!==SESSION.id;
const sdCanPd=d=>!!SESSION&&hasRole('pd')&&d.status==='cho_phe_duyet'&&d.lap.by_id!==SESSION.id&&(!!S.config.solo||!d.sx||d.sx.by_id!==SESSION.id);
const sdCanTh=d=>!!SESSION&&d.status==='da_phat_hanh'&&(hasRole('tiepnhan')||hasRole('tp'));
const sdCanHuy=d=>!!SESSION&&['cho_soat_xet','cho_phe_duyet'].includes(d.status)&&(d.lap.by_id===SESSION.id||hasRole('tp'));
const sdMyCount=()=>sdList().filter(d=>sdCanSx(d)||sdCanPd(d)||sdCanTh(d)).length;
const sdHasSlug=(x,slug)=>!!(x.sua_doi&&(x.sua_doi.ds||[]).some(d=>bcSlug(d.no)===slug));
const sdSummary=d=>(d.doi||[]).map(x=>x.l+': “'+x.cu+'” → “'+x.moi+'”').join('; ');
function sdNote(s){const t=s&&s.phieu&&s.phieu.thay_the;if(!t)return null;
  return h('div',{class:'c',style:'font-size:12px;margin-top:2px'},'Phiếu này thay thế phiếu số '+t.bc_cu+' ngày '+fd(String(t.at_cu||'').slice(0,10))+' (hồ sơ '+t.ma_sd+'). Nội dung thay đổi: '+(t.doi||[]).map(x=>x.l+' từ “'+x.cu+'” thành “'+x.moi+'”').join('; ')+'.');}
function sdLookupBanner(s,slug){const u=s.sua_doi;if(!u||!u.ds||u.ds.length<2)return null;
  const i=u.ds.findIndex(x=>bcSlug(x.no)===slug),last=u.ds.length-1,cur=u.ds[last];
  if(i<0||i===last)return h('div',{class:'banner','data-tone':'info'},h('div',null,'Phiếu này là bản sửa đổi lần '+last+', thay thế phiếu số '+u.ds[last-1].no+'. Mã băm bên dưới là của phiếu hiện hành.'));
  return h('div',{class:'banner','data-tone':'bad'},h('div',null,h('b',null,'Phiếu số '+u.ds[i].no+' đã bị thay thế, không còn giá trị sử dụng. '),'Phiếu hiện hành là '+cur.no+' phát hành '+fdt(cur.at)+'. Nội dung bên dưới là phiếu hiện hành.'));}
async function sdMakeCode(){
  const iso=todayISO(),yy=iso.slice(2,4),mm=iso.slice(5,7),dd=iso.slice(8,10),pre='SĐ'+yy+'.'+mm+'.'+dd+'.';let mx=0;
  sdList().forEach(x=>{if(typeof x.ma==='string'&&x.ma.startsWith(pre)){const n=+x.ma.slice(pre.length);if(n>mx)mx=n;}});
  return pre+(await nextSeq('sd'+yy+mm+dd,mx));
}
function sdApply(s,doi){const o={khach:Object.assign({},s.khach),du_an:Object.assign({},s.du_an),mau:Object.assign({},s.mau)};doi.forEach(d=>{const p=d.k.split('.');o[p[0]][p[1]]=d.moi;});return o;}
/* kiểm tra ngày nhận mẫu mới: không được làm lệch tuổi mẫu, thứ tự ngày, hoặc ở tương lai */
function sdDateErr(s,iso){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(iso||''))return 'Ngày nhận mẫu mới không hợp lệ.';
  const m=s.mau||{},n=s.nop||{};
  if(iso>todayISO())return 'Ngày nhận mẫu không được ở tương lai.';
  if(m.ngay_lay&&iso<m.ngay_lay)return 'Ngày nhận mẫu không được trước ngày lấy mẫu ('+fd(m.ngay_lay)+').';
  if(n.d0&&iso>n.d0)return 'Ngày nhận mẫu không được sau ngày bắt đầu thử nghiệm ('+fd(n.d0)+').';
  const raw=n.raw||{};
  if(raw.tuoi!=null&&m.ngay_lay){const t=Math.round((Date.parse(iso)-Date.parse(m.ngay_lay))/864e5);if(t!==+raw.tuoi)return 'Ngày nhận mới làm tuổi mẫu thành '+t+' ngày, lệch tuổi mẫu '+raw.tuoi+' ngày đã dùng để tính kết quả. Không sửa được, xử lý như loại D.';}
  return '';
}
/* ---------- ghi dữ liệu */
async function sdCreate(s,o){
  const now=new Date().toISOString(),ma=await sdMakeCode(),id='sd_'+rid(),rev=((s.sua_doi&&s.sua_doi.rev)||0)+1;
  const doc={ma,sample:s.id,ma_mau:s.ma_mau||'',so_yc:s.so_yc||'',bc_goc:s.so_bao_cao,bc_cu:phieuNo(s),rev,bc_moi:sdNo(s.so_bao_cao,rev),khach:(s.khach||{}).ten||'',cong_trinh:(s.du_an||{}).cong_trinh||'',
    loai:o.loai,status:o.loai==='D'?'tu_choi':'cho_soat_xet',doi:o.doi||[],ly_do:o.ly_do||'',can_cu:o.can_cu||null,bang_chung:o.bang_chung||'',phi:+o.phi||0,
    lap:{by:SESSION.name,by_id:SESSION.id,at:now},created_at:now,updated_at:now};
  if(o.loai==='D')doc.tu_choi={by:SESSION.name,by_id:SESSION.id,at:now,ly_do:o.ly_do,buoc:'tiếp nhận'};
  await Data.set('suadoi/'+id,doc);
  await audit(s,o.loai==='D'?'Ghi nhận từ chối sửa phiếu '+ma:'Đề nghị sửa phiếu '+ma,'Loại '+o.loai+(o.doi&&o.doi.length?' · '+sdSummary(doc):'')+' · '+doc.ly_do);
  return Object.assign({id},doc);
}
async function sdMove(d,to,extra,note){
  const upd=Object.assign({status:to,updated_at:new Date().toISOString()},extra||{});
  await Data.update('suadoi/'+d.id,upd);
  const s=S.samples.find(x=>x.id===d.sample);if(s)await audit(s,note+' '+d.ma,'');
}
async function sdIssue(s2,so,now,thay,rev){
  const n=s2.nop||{};
  const snap={bc:so,ma_mau:s2.ma_mau,so_yc:s2.so_yc,khach:s2.khach.ten,cong_trinh:s2.du_an.cong_trinh,ngay_nhan:(s2.mau||{}).ngay_nhan,ngay_thu:[n.d0,n.d1],ket_qua:n.results,so_lieu_goc:n.raw,thanh_phan_hat:n.sieve,nguoi_thu:s2.giao.ten,soat_xet:s2.soat_xet&&s2.soat_xet.by,phe_duyet:SESSION.name,phat_hanh:now,sha256_file_goc:n.sha256,tp_tu_thu:tpTest(s2),thay_the:thay};
  const snapStr=JSON.stringify(snap),hash=await sha256(new TextEncoder().encode(snapStr));
  const url=verifyUrl(so),qr=qrText(s2,so,hash,url);
  const x={bc:so,hash,url,at:now,qr:await qrPng(qr),tp_tu_thu:tpTest(s2),sx_ten:s2.soat_xet&&s2.soat_xet.by,thay_the:thay};
  const F=loaiForm(s2),bytes=await issuedBytes(s2,so,x);await assertForm(bytes,F);
  if(isNew(s2.id)){
    const g=(await Data.get(dp(s2.id)))||{};const det=Object.assign({},g,{sample:s2.id,snap:snapStr});
    await Data.set(dp(s2.id),det);DET.set(s2.id,det);
    return {hash,file_id:null,at:now,url,qr,split:true,bc:so,thay_the:thay};
  }
  const file_id='f_'+s2.id+'_bc'+sdPad(rev);
  await Data.set('files/'+file_id,{sample:s2.id,form:F.code,loai:loaiOf(s2),name:F.code+'_'+so+'.xlsx',size:bytes.length,sha256:await sha256(bytes),nguon:'phieu_thay_the',b64:u8ToB64(bytes),by:SESSION.name,at:now});
  return {hash,snap:snapStr,file_id,at:now,url,qr,bc:so,thay_the:thay};
}
/* phê duyệt đề nghị và phát hành phiếu thay thế: chỉ người có quyền phê duyệt, khác người lập */
async function sdApprove(d,ykien){
  const fresh=sdList().find(x=>x.id===d.id);if(!fresh||!sdCanPd(fresh))throw new Error('Đề nghị chưa ở bước phê duyệt, hoặc bạn không có quyền phê duyệt đề nghị này.');d=fresh;
  const cur=S.samples.find(x=>x.id===d.sample);
  if(!cur)throw new Error('Không thấy mẫu của phiếu này.');
  const s=await withDetail(cur,true);
  if(s.status!=='da_phat_hanh'||!s.phieu)throw new Error('Phiếu gốc không còn ở trạng thái đã phát hành.');
  if(((s.sua_doi&&s.sua_doi.rev)||0)+1!==d.rev)throw new Error('Phiếu đã có lần sửa khác sau khi lập đề nghị này. Hãy hủy và lập đề nghị mới.');
  const stale=(d.doi||[]).filter(x=>sdVal(s,x.k)!==x.cu);
  if(stale.length)throw new Error('Giá trị hiện tại của '+stale.map(x=>x.l).join(', ')+' đã khác lúc lập đề nghị. Hãy hủy và lập đề nghị mới.');
  const dt=(d.doi||[]).find(x=>x.k==='mau.ngay_nhan');if(dt){const e=sdDateErr(s,dt.moi);if(e)throw new Error(e);}
  const now=new Date().toISOString(),bcNew=sdNo(s.so_bao_cao,d.rev),m2=sdApply(s,d.doi||[]),s2=Object.assign({},s,m2);
  const thay={lan:d.rev,bc_cu:phieuNo(s),at_cu:s.phieu.at,hash_cu:s.phieu.hash,ma_sd:d.ma,loai:d.loai,doi:(d.doi||[]).map(x=>({l:x.l,cu:x.cu,moi:x.moi})),ly_do:d.ly_do};
  const truoc={bc:phieuNo(s),phieu:s.phieu,khach:s.khach,du_an:s.du_an,mau:s.mau};
  const pdInfo={by:SESSION.name,by_id:SESSION.id,at:now,y_kien:ykien||''};
  /* bước 1: giữ lại bản cũ trong hồ sơ sửa đổi trước khi đụng vào mẫu */
  await Data.update('suadoi/'+d.id,{status:'da_phat_hanh',pd:pdInfo,truoc,bc_moi:bcNew,updated_at:now});
  let phieu;
  try{
    phieu=await sdIssue(s2,bcNew,now,thay,d.rev);
    const ds=((s.sua_doi&&s.sua_doi.ds)||[{no:s.so_bao_cao,at:s.phieu.at,hash:s.phieu.hash,ma_sd:''}]).concat({no:bcNew,at:now,hash:phieu.hash,ma_sd:d.ma});
    await Data.update(sp(s.id),{khach:m2.khach,du_an:m2.du_an,mau:m2.mau,phieu,sua_doi:{rev:d.rev,base:s.so_bao_cao,cur:bcNew,ds}});
  }catch(e){
    try{await Data.update('suadoi/'+d.id,{status:'cho_phe_duyet',pd:null,truoc:null,updated_at:new Date().toISOString()});}catch(x){console.warn(x);}
    throw e;
  }
  await Data.update('suadoi/'+d.id,{phat_hanh:{at:now,hash:phieu.hash,url:phieu.url||''},hash_moi:phieu.hash});
  await audit(s,'Phát hành phiếu thay thế '+bcNew,'Thay phiếu '+thay.bc_cu+' theo '+d.ma+' · '+sdSummary(d)+' · SHA-256 '+phieu.hash.slice(0,12));
  return {bc:bcNew,phieu};
}
/* phiếu cũ đã bị thay thế: tạo lại từ giá trị cũ lưu trong hồ sơ, có dòng "ĐÃ BỊ THAY THẾ" */
async function sdOldBytes(d){
  const cur=S.samples.find(x=>x.id===d.sample);if(!cur||!d.truoc)throw new Error('Hồ sơ chưa có bản cũ.');
  const t=d.truoc,s0=Object.assign({},await withDetail(cur),{khach:t.khach,du_an:t.du_an,mau:t.mau,phieu:t.phieu,so_bao_cao:cur.so_bao_cao}),p=t.phieu,F=loaiForm(s0);
  const x={bc:t.bc,hash:p.hash,url:p.url,at:p.at,qr:await qrPng(p.qr),tp_tu_thu:tpTest(s0),sx_ten:s0.soat_xet&&s0.soat_xet.by,thay_the:p.thay_the||null,da_thay_the:{bc_moi:d.bc_moi,at:(d.phat_hanh&&d.phat_hanh.at)||d.updated_at,ma_sd:d.ma}};
  const bytes=await issuedBytes(s0,t.bc,x);await assertForm(bytes,F);
  return {bytes,name:F.code+'_'+t.bc+'_DA_THAY_THE.xlsx'};
}
/* ---------- in biểu mẫu BM-SĐ-01, BM-SĐ-02 (cùng cách in với bảng kê) */
function sdPrintBox(kind,d,s){
  const th=t=>h('th',{style:'border:1px solid #000;padding:4px 6px;background:#eee;text-align:left'},t),td=t=>h('td',{style:'border:1px solid #000;padding:4px 6px;vertical-align:top'},t==null?'':String(t));
  const sig=(arr)=>h('div',{style:'display:flex;justify-content:space-between;margin-top:22px;text-align:center;gap:6px'},arr.map(([t,n])=>h('div',{style:'flex:1'},h('b',null,t),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên'+(t.indexOf('khách')>=0?', đóng dấu nếu có':'')+')'),h('div',{style:'height:64px'}),h('div',null,n||''))));
  const first=kind==='01';
  const kids=[
    h('img',{src:LOGO_L,alt:LOGO_ALT,width:76,height:76,style:'position:absolute;left:14mm;top:11mm;width:19mm;height:19mm'}),
    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG'),h('div',{style:'text-align:center;font-weight:bold'},'PHÒNG THÍ NGHIỆM CHUYÊN NGÀNH XÂY DỰNG'),
    h('div',{style:'text-align:center;font-size:11px;font-style:italic'},'23 Phan Huy Chú, phường Đồng Hới, tỉnh Quảng Trị'),
    h('h2',{style:'text-align:center;margin:14px 0 2px;font-size:17px'},first?'PHIẾU ĐỀ NGHỊ ĐIỀU CHỈNH THÔNG TIN PHIẾU KẾT QUẢ':'BIÊN BẢN ĐÍNH CHÍNH VÀ THU HỒI PHIẾU KẾT QUẢ'),
    h('div',{style:'text-align:center;margin-bottom:10px'},(first?'BM-SĐ-01':'BM-SĐ-02')+' · Số hồ sơ: '+d.ma+' · Ngày '+fd(todayISO())),
    h('div',null,h('b',null,'Khách hàng: '),d.khach),h('div',null,h('b',null,'Công trình: '),d.cong_trinh),
    h('div',null,h('b',null,'Phiếu kết quả: '),(first?(d.bc_cu||d.bc_goc):(d.bc_cu||d.bc_goc))+' · Mã mẫu '+d.ma_mau+(d.so_yc?' · Phiếu yêu cầu '+d.so_yc:'')),
    first?null:h('div',null,h('b',null,'Phiếu thay thế: '),d.bc_moi+(d.phat_hanh?' · phát hành '+fdt(d.phat_hanh.at):'')),
    h('div',{style:'margin:8px 0 4px'},h('b',null,first?'Nội dung đề nghị điều chỉnh (áp dụng cho phiếu yêu cầu, phiếu giao nhận và phiếu kết quả):':'Nội dung đã đính chính ở phiếu yêu cầu, phiếu giao nhận và phiếu kết quả:')),
    (d.doi&&d.doi.length)?h('table',{style:'border-collapse:collapse;width:100%'},h('thead',null,h('tr',null,th('TT'),th('Nội dung'),th('Hiện tại'),th(first?'Đề nghị sửa thành':'Sửa thành'))),
      h('tbody',null,d.doi.map((x,i)=>h('tr',null,td(i+1),td(x.l),td(x.cu),td(x.moi))))):h('div',null,'(Không có nội dung sửa)'),
    h('div',{style:'margin-top:8px'},h('b',null,'Lý do: '),d.ly_do||''),
    d.can_cu?h('div',null,h('b',null,'Căn cứ: '),'văn bản '+(d.can_cu.vb_so||'(không số)')+' ngày '+fd(d.can_cu.vb_ngay)+', người đề nghị '+(d.can_cu.nguoi_de_nghi||'')+', hình thức: '+(d.can_cu.hinh_thuc||'')):null,
    d.bang_chung?h('div',null,h('b',null,'Bằng chứng đối chiếu: '),d.bang_chung):null,
    first?h('div',{style:'margin-top:8px;font-size:12px;line-height:1.5'},'Khách hàng cam kết thông tin đề nghị sửa là chính xác và chịu trách nhiệm về thông tin do mình cung cấp. Số liệu thử nghiệm không thay đổi. Sau khi phòng phát hành phiếu thay thế, phiếu cũ bị vô hiệu và khách hàng giao lại bản giấy cũ (nếu có). Phòng giữ lại phiếu cũ trong hồ sơ để đối chiếu.')
      :h('div',{style:'margin-top:10px;font-size:13px;line-height:1.9'},h('div',null,h('b',null,'Tình trạng bản cũ (đánh dấu một mục):')),h('div',null,'☐ Đã thu hồi bản giấy phiếu cũ, đóng dấu “ĐÃ BỊ THAY THẾ”, lưu vào hồ sơ.'),h('div',null,'☐ Chỉ nhận bản điện tử, không có bản giấy.'),h('div',null,'☐ Không thu hồi được (đã nộp cho: ......................................). Khách hàng đã biết phiếu cũ không còn giá trị.'),h('div',null,'Số bản phiếu thay thế đã giao: ......... bản')),
    first?sig([['Đại diện khách hàng',''],['Người tiếp nhận',(d.lap&&d.lap.by)||''],['Trưởng phòng thí nghiệm','']])
      :sig([['Đại diện khách hàng',''],['Người giao phiếu',(d.thu_hoi&&d.thu_hoi.by)||''],['Trưởng phòng thí nghiệm','']])];
  return h('div',{class:'bk-print',style:'position:relative;font-family:"Times New Roman",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},kids);
}
async function sdDoPrint(kind,d){
  const box=sdPrintBox(kind,d);document.body.append(box);
  await Promise.all(Array.from(box.querySelectorAll('img')).map(im=>im.decode?im.decode().catch(()=>{}):0));document.documentElement.classList.add('printing-bk');
  const done=()=>{document.documentElement.classList.remove('printing-bk');box.remove();window.removeEventListener('afterprint',done);};
  window.addEventListener('afterprint',done);
  try{window.print();}catch(e){done();toast('Máy không cho in trực tiếp.','bad');return;}
  setTimeout(()=>{if(document.documentElement.classList.contains('printing-bk'))done();},1500);
}
/* ---------- giao diện */
const SDV={tab:'xl',pre:null};
function sdPill(st){const x=SD_ST[st]||[st,'neutral'];return tonePill(x[0],x[1]);}
function sdArchiveBanner(s){const u=s&&s.sua_doi;if(!u||!u.ds||u.ds.length<2)return null;return h('div',{class:'banner','data-tone':'info'},h('div',null,h('b',null,'Phiếu đã sửa đổi '+(u.ds.length-1)+' lần. '),'Phiếu hiện hành: '+u.cur+'. Phiếu cũ: '+u.ds.slice(0,-1).map(x=>x.no).join(', ')+' (đã bị thay thế, xem trong Sửa đổi phiếu).'));}
function sdBtn(s,after){
  if(!sdCanLap()||!s||s.status!=='da_phat_hanh'||!s.phieu)return null;
  return h('button',{class:'btn','data-act':'sd-new',onclick:()=>{if(after)after();SDV.pre=s.id;location.hash='sua-phieu';render();}},'Đề nghị sửa phiếu');
}
pages['sua-phieu']={render(root){
  const L=sdList().slice().sort((a,b)=>String(b.created_at)<String(a.created_at)?-1:1);
  const open=L.filter(x=>SD_OPEN.includes(x.status)),closed=L.filter(x=>!SD_OPEN.includes(x.status));
  if(SDV.tab==='xl'&&!open.length&&closed.length&&!SDV._seen)SDV.tab='dong';
  const list=SDV.tab==='xl'?open:closed;
  root.append(pageHead('Sửa đổi, thay thế phiếu','Phiếu đã phát hành không bị sửa đè hay xóa. Mọi thay đổi đi qua đề nghị, soát xét, phê duyệt rồi phát hành phiếu thay thế mang số cũ kèm SĐ01, SĐ02... Phiếu cũ vẫn lưu để đối chiếu.',
      h('div',{class:'row'},h('button',{class:'btn','data-act':'sd-csv',disabled:!L.length,onclick:()=>csvSave('so-theo-doi-sua-phieu.csv',['Mã hồ sơ','Phiếu gốc','Phiếu thay thế','Mã mẫu','Khách hàng','Công trình','Loại','Nội dung đổi','Lý do','Trạng thái','Người lập','Ngày lập','Người phê duyệt','Ngày phê duyệt','Thu hồi bản cũ'],
        L.map(x=>[x.ma,x.bc_goc,x.bc_moi||'',x.ma_mau,x.khach,x.cong_trinh,x.loai,sdSummary(x),x.ly_do,(SD_ST[x.status]||[x.status])[0],(x.lap||{}).by,fd(((x.lap||{}).at||'').slice(0,10)),(x.pd||{}).by||'',fd(((x.pd||{}).at||'').slice(0,10)),x.thu_hoi?x.thu_hoi.kieu:'']))},'Tải sổ theo dõi (CSV)'),
        sdCanLap()?h('button',{class:'btn primary','data-act':'sd-add',onclick:()=>sdNewDlg()},'Lập đề nghị sửa phiếu'):null)),
    h('div',{class:'banner','data-tone':'info'},h('div',null,h('b',null,'Quy tắc nhanh. '),'Loại A (phòng ghi nhầm) miễn phí, cần bằng chứng đối chiếu. Loại B (khách đổi thông tin do khách cung cấp: tên đơn vị, công trình, chủ đầu tư, tư vấn, thi công) cần văn bản đề nghị của khách. Ngày nhận mẫu chỉ sửa khi phòng ghi nhầm và có bằng chứng. Đổi mẫu, chỉ tiêu, số liệu, kết quả: không sửa, phải nhận mẫu mới và thử lại.')),
    h('div',{class:'tabs',role:'tablist'},[['xl','Đang xử lý ('+open.length+')'],['dong','Đã đóng ('+closed.length+')']].map(([k,t])=>h('button',{role:'tab','aria-selected':SDV.tab===k,onclick:()=>{SDV.tab=k;SDV._seen=1;render();}},t))),
    list.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Mã hồ sơ','Phiếu','Khách hàng, công trình','Loại','Nội dung đổi','Trạng thái','Cập nhật',''].map(x=>h('th',null,x)))),
      h('tbody',null,list.map(d=>h('tr',null,h('td',null,code(d.ma)),h('td',null,code(d.bc_goc),d.bc_moi&&d.status!=='tu_choi'&&d.status!=='huy'?h('div',{class:'muted small'},'→ '+d.bc_moi):null),h('td',null,d.khach,h('div',{class:'muted small'},d.cong_trinh)),h('td',null,d.loai),
        h('td',{class:'small'},sdSummary(d)||'(không có)'),h('td',null,sdPill(d.status)),h('td',{class:'small'},fdt(d.updated_at||d.created_at)),
        h('td',{class:'r'},h('button',{class:'btn sm primary','data-act':'sd-open',onclick:()=>sdOpen(d.id)},'Mở'))))))):
      h('div',{class:'card'},emptyState(SDV.tab==='xl'?'Không có đề nghị nào đang xử lý':'Chưa có hồ sơ đã đóng','Mở phiếu ở Hồ sơ lưu trữ rồi bấm “Đề nghị sửa phiếu”, hoặc bấm “Lập đề nghị sửa phiếu” ở trên.')));
  if(SDV.pre){const id=SDV.pre;SDV.pre=null;setTimeout(()=>sdNewDlg(id),50);}
},update(){if(document.querySelector('#modal-root .overlay'))return;render();}};
function sdNewDlg(preId){
  if(!sdCanLap()){toast('Chỉ cán bộ giao nhận mẫu hoặc Trưởng phòng lập đề nghị.','bad');return;}
  const issued=S.samples.filter(x=>x.status==='da_phat_hanh'&&x.so_bao_cao&&x.phieu).sort((a,b)=>String(a.so_bao_cao)<String(b.so_bao_cao)?-1:1);
  let cur=preId?issued.find(x=>x.id===preId)||null:null;
  const dl=h('datalist',{id:'sd-dl'},issued.slice(-400).map(x=>h('option',{value:phieuNo(x)},x.ma_mau+' · '+((x.khach||{}).ten||'')+' · '+((x.du_an||{}).cong_trinh||''))));
  const pick=h('input',{type:'text',id:'sd-pick',list:'sd-dl',placeholder:'Gõ số báo cáo, ví dụ BC26.11.03.1',autocomplete:'off',value:cur?phieuNo(cur):'','aria-label':'Số báo cáo của phiếu cần sửa'});
  const loaiSel=h('select',{id:'sd-loai','aria-label':'Loại thay đổi'},['A','B','D'].map(k=>h('option',{value:k},SD_LOAI[k])));
  const area=h('div',{class:'stack'}),warn=h('div');
  const inputs={};let ex={};
  const ta=(id,ph)=>h('textarea',{id,placeholder:ph,rows:'2'});
  function draw(){
    area.replaceChildren();warn.replaceChildren();Object.keys(inputs).forEach(k=>delete inputs[k]);
    if(!cur){area.append(h('p',{class:'muted small'},'Chọn phiếu đã phát hành để tiếp tục.'));return;}
    const act=sdActive(cur.id);
    if(act){area.append(h('div',{class:'banner','data-tone':'bad'},h('div',null,'Phiếu này đang có hồ sơ sửa '+act.ma+' ('+(SD_ST[act.status]||[act.status])[0]+'). Hoàn tất hoặc hủy hồ sơ đó trước khi lập đề nghị mới.')));return;}
    const L=loaiSel.value;
    area.append(h('div',{class:'card flat'},kv([['Phiếu hiện hành',phieuNo(cur)],['Mã mẫu',cur.ma_mau],['Phiếu yêu cầu',cur.so_yc],['Khách hàng',(cur.khach||{}).ten],['Công trình',(cur.du_an||{}).cong_trinh],['Ngày nhận mẫu',fd((cur.mau||{}).ngay_nhan)]])));
    if(L==='D'){
      area.append(h('div',{class:'banner','data-tone':'warn'},h('div',null,h('b',null,'Không sửa phiếu. '),'Thay đổi mẫu, chỉ tiêu, số liệu, kết quả, hoặc đổi ngày nhận mẫu theo ý khách không được thực hiện vì làm sai sự thật hoặc làm mất tính hợp lệ của kết quả. Khách cần gửi mẫu mới và thử nghiệm lại, phòng cấp phiếu mới. Hồ sơ này chỉ ghi nhận việc từ chối.')));
      inputs.ly=ta('sd-ly','Khách yêu cầu gì, vì sao không thực hiện, đã trả lời khách thế nào');area.append(h('div',{class:'field'},h('label',{for:'sd-ly'},'Nội dung yêu cầu của khách và hướng xử lý'),inputs.ly));return;
    }
    const rows=SD_FIELDS.filter(f=>!f.onlyA||L==='A');
    area.append(h('div',{class:'card flat'},h('h3',null,'Nội dung cần sửa'),h('p',{class:'small muted'},'Chỉ điền ô cần đổi, để trống ô giữ nguyên.'+(L==='B'?' Ngày nhận mẫu không đổi theo đề nghị của khách.':'')),
      h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Nội dung','Hiện tại','Sửa thành'].map(x=>h('th',null,x)))),
        h('tbody',null,rows.map(f=>{const i=h('input',{type:f.date?'date':'text','aria-label':f.l+' mới',max:f.date?todayISO():null});inputs[f.k]=i;return h('tr',null,h('td',null,f.l),h('td',{class:'muted'},sdVal(cur,f.k)||'(trống)'),h('td',null,i));}))))));
    if(L==='B'){
      inputs.vb_so=h('input',{type:'text',id:'sd-vbso',placeholder:'Số, ký hiệu (nếu có)'});inputs.vb_ngay=h('input',{type:'date',id:'sd-vbng',max:todayISO()});
      inputs.nguoi=h('input',{type:'text',id:'sd-ng',placeholder:'Họ tên, chức vụ, đơn vị'});
      inputs.ht=h('select',{id:'sd-ht'},SD_HINH_THUC.map(x=>h('option',{value:x},x)));inputs.phi=h('input',{type:'number',id:'sd-phi',min:'0',step:'1000',inputmode:'numeric',placeholder:'0'});
      area.append(h('div',{class:'card flat'},h('h3',null,'Căn cứ: đề nghị của khách hàng'),h('div',{class:'grid2'},h('div',{class:'field'},h('label',{for:'sd-vbso'},'Số văn bản đề nghị'),inputs.vb_so),h('div',{class:'field'},h('label',{for:'sd-vbng'},'Ngày văn bản'),inputs.vb_ngay),
        h('div',{class:'field'},h('label',{for:'sd-ng'},'Người đề nghị'),inputs.nguoi),h('div',{class:'field'},h('label',{for:'sd-ht'},'Hình thức'),inputs.ht),h('div',{class:'field'},h('label',{for:'sd-phi'},'Phí hành chính (đồng, nếu có)'),inputs.phi))));
    }else{
      inputs.bc=ta('sd-bc','Ví dụ: Phiếu giao nhận số ... ngày ... ghi đúng ...; nhật ký hệ thống ...');
      area.append(h('div',{class:'field'},h('label',{for:'sd-bc'},'Bằng chứng đối chiếu (bắt buộc)'),inputs.bc,h('span',{class:'small muted'},'Phiếu yêu cầu, phiếu giao nhận có chữ ký, nhật ký hệ thống... cho thấy phiếu kết quả ghi sai so với hồ sơ gốc.')));
    }
    inputs.ly=ta('sd-ly',L==='B'?'Lý do khách đề nghị':'Phòng ghi nhầm ở đâu, nguyên nhân');area.append(h('div',{class:'field'},h('label',{for:'sd-ly'},'Lý do (bắt buộc)'),inputs.ly));
    const bk=(typeof bkAll==='function'?bkAll():[]).find(b=>cur.so_yc&&(b.yc||[]).includes(cur.so_yc));
    if(bk)warn.append(h('div',{class:'banner','data-tone':'warn'},h('div',null,'Phiếu yêu cầu '+cur.so_yc+' đã có trong bảng kê '+bk.so+'. Đổi tên khách hoặc công trình không tự sửa bảng kê và hóa đơn: báo kế toán xử lý sau khi phát hành phiếu thay thế.')));
    if(L==='A'&&cur.tt&&cur.tt.ban_giay)warn.append(h('div',{class:'banner','data-tone':'info'},h('div',null,'Bản giấy của phiếu này đã giao cho khách. Cần thu hồi bản giấy cũ khi giao phiếu thay thế.')));
  }
  pick.addEventListener('input',()=>{const v=pick.value.trim();const f=issued.find(x=>phieuNo(x)===v||x.so_bao_cao===v);if(f!==cur){cur=f||null;draw();}});
  loaiSel.addEventListener('change',draw);
  const save=h('button',{class:'btn primary','data-act':'sd-save'},'Gửi đề nghị');
  const m=openModal({title:'Lập đề nghị sửa phiếu',sub:'Phiếu cũ không bị sửa. Sau khi được duyệt, phòng phát hành phiếu thay thế.',wide:true,body:[dl,h('div',{class:'grid2'},h('div',{class:'field'},h('label',{for:'sd-pick'},'Phiếu cần sửa'),pick),h('div',{class:'field'},h('label',{for:'sd-loai'},'Loại thay đổi'),loaiSel)),warn,area],
    actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng'),save]});
  draw();
  save.onclick=async()=>{
    if(!cur){toast('Chọn phiếu đã phát hành.','bad');return;}
    if(sdActive(cur.id)){toast('Phiếu đang có hồ sơ sửa chưa đóng.','bad');return;}
    const L=loaiSel.value,ly=(inputs.ly&&inputs.ly.value||'').trim();
    if(ly.length<5){toast('Nhập lý do.','bad');return;}
    if(L==='D'){save.disabled=true;const r=await safe(()=>sdCreate(cur,{loai:'D',doi:[],ly_do:ly}));if(!r){save.disabled=false;return;}m.close();toast('Đã ghi nhận từ chối '+r.ma+'. In thông báo ở hồ sơ nếu cần.');return;}
    const doi=[];
    for(const f of SD_FIELDS){if(f.onlyA&&L!=='A')continue;const i=inputs[f.k];if(!i)continue;const v=i.value.trim();if(!v)continue;const cu=sdVal(cur,f.k);if(v===cu)continue;
      if(f.date){const e=sdDateErr(cur,v);if(e){toast(e,'bad');return;}}doi.push({k:f.k,l:f.l,cu,moi:v});}
    if(!doi.length){toast('Chưa có nội dung nào khác giá trị hiện tại.','bad');return;}
    const o={loai:L,doi,ly_do:ly};
    if(L==='B'){const so=inputs.vb_so.value.trim(),ng=inputs.vb_ngay.value,nd=inputs.nguoi.value.trim();
      if(!ng||!nd){toast('Nhập ngày văn bản và người đề nghị của khách.','bad');return;}
      o.can_cu={vb_so:so,vb_ngay:ng,nguoi_de_nghi:nd,hinh_thuc:inputs.ht.value};o.phi=+inputs.phi.value||0;}
    else{const bc=inputs.bc.value.trim();if(bc.length<8){toast('Nhập bằng chứng đối chiếu.','bad');return;}o.bang_chung=bc;o.phi=0;}
    if(doi.some(x=>x.k==='mau.ngay_nhan')&&!hasRole('tp')){toast('Sửa ngày nhận mẫu cần Trưởng phòng lập hoặc xác nhận. Nhờ Trưởng phòng lập đề nghị.','bad');return;}
    save.disabled=true;const r=await safe(()=>sdCreate(cur,o));if(!r){save.disabled=false;return;}
    m.close();toast('Đã gửi đề nghị '+r.ma+' chờ soát xét.');sdOpenSoon(r.id);
  };
}
function sdOpenSoon(id,n){n=n||0;if(sdList().find(x=>x.id===id))return sdOpen(id);if(n<20)setTimeout(()=>sdOpenSoon(id,n+1),100);}
function sdOpen(id){
  const d=sdList().find(x=>x.id===id);if(!d)return;
  const s=S.samples.find(x=>x.id===d.sample);
  const why=h('textarea',{id:'sd-why',rows:'2',placeholder:'Ý kiến hoặc lý do từ chối'});
  const acts=[];let m,thbox=null;
  const run=async(fn,okMsg)=>{const r=await safe(async()=>{await fn();return true;},'Không thực hiện được.');if(r!==true)return;m.close();toast(okMsg);};
  const doing=(btn,fn)=>async()=>{btn.disabled=true;try{await fn();}finally{btn.disabled=false;}};
  if(sdCanSx(d)){
    const ok=h('button',{class:'btn primary','data-act':'sd-sx'},'Soát xét đạt, chuyển phê duyệt'),no=h('button',{class:'btn danger','data-act':'sd-sx-no'},'Từ chối');
    ok.onclick=doing(ok,()=>run(()=>sdMove(d,'cho_phe_duyet',{sx:{by:SESSION.name,by_id:SESSION.id,at:new Date().toISOString(),y_kien:why.value.trim()}},'Soát xét đạt đề nghị sửa phiếu'),'Đã chuyển phê duyệt.'));
    no.onclick=doing(no,async()=>{if(why.value.trim().length<3){toast('Nhập lý do từ chối.','bad');return;}await run(()=>sdMove(d,'tu_choi',{tu_choi:{by:SESSION.name,by_id:SESSION.id,at:new Date().toISOString(),ly_do:why.value.trim(),buoc:'soát xét'}},'Từ chối đề nghị sửa phiếu'),'Đã từ chối đề nghị.');});
    acts.push(no,ok);
  }
  if(sdCanPd(d)){
    const ok=h('button',{class:'btn primary','data-act':'sd-pd'},'Phê duyệt và phát hành phiếu thay thế'),no=h('button',{class:'btn danger','data-act':'sd-pd-no'},'Từ chối');
    ok.onclick=doing(ok,async()=>{let r;try{r=await sdApprove(d,why.value.trim());}catch(e){console.warn(e);logErr('sdApprove',e);toast('Không phát hành được: '+(e&&e.message||e),'bad');return;}
      m.close();toast('Đã phát hành phiếu '+r.bc+'.');sdOpenSoon(d.id);});
    no.onclick=doing(no,async()=>{if(why.value.trim().length<3){toast('Nhập lý do từ chối.','bad');return;}await run(()=>sdMove(d,'tu_choi',{tu_choi:{by:SESSION.name,by_id:SESSION.id,at:new Date().toISOString(),ly_do:why.value.trim(),buoc:'phê duyệt'}},'Từ chối đề nghị sửa phiếu'),'Đã từ chối đề nghị.');});
    acts.push(no,ok);
  }
  if(sdCanTh(d)){
    const sel=h('select',{id:'sd-th'},[['thu_hoi','Đã thu hồi bản giấy cũ, đóng dấu ĐÃ BỊ THAY THẾ'],['dien_tu','Khách chỉ nhận bản điện tử, không có bản giấy'],['khong_thu_hoi','Không thu hồi được (đã nộp cho bên khác), khách xác nhận đã biết']].map(([v,t])=>h('option',{value:v},t)));
    const ghi=h('input',{type:'text',id:'sd-thgc',placeholder:'Người nhận lại, số bản, đã nộp cho ai...'});
    const ok=h('button',{class:'btn primary','data-act':'sd-th'},'Xác nhận và đóng hồ sơ');
    ok.onclick=doing(ok,()=>run(()=>sdMove(d,'hoan_tat',{thu_hoi:{kieu:sel.options[sel.selectedIndex].text,ma:sel.value,ghi_chu:ghi.value.trim(),by:SESSION.name,by_id:SESSION.id,at:new Date().toISOString()}},'Xác nhận thu hồi bản cũ, đóng hồ sơ'),'Đã đóng hồ sơ.'));
    acts.push(ok);thbox=h('div',{class:'card flat'},h('h3',null,'Xác nhận thu hồi bản cũ'),h('div',{class:'grid2'},h('div',{class:'field'},h('label',{for:'sd-th'},'Tình trạng bản cũ'),sel),h('div',{class:'field'},h('label',{for:'sd-thgc'},'Ghi chú'),ghi)));
  }
  if(sdCanHuy(d)){const hb=h('button',{class:'btn','data-act':'sd-huy'},'Hủy đề nghị');hb.onclick=doing(hb,async()=>{if(why.value.trim().length<3){toast('Nhập lý do hủy ở ô ý kiến.','bad');return;}await run(()=>sdMove(d,'huy',{huy:{by:SESSION.name,by_id:SESSION.id,at:new Date().toISOString(),ly_do:why.value.trim()}},'Hủy đề nghị sửa phiếu'),'Đã hủy đề nghị.');});acts.unshift(hb);}
  const steps=[['Lập đề nghị',d.lap],['Soát xét',d.sx],['Phê duyệt',d.pd],['Phát hành phiếu thay thế',d.phat_hanh?{by:(d.pd||{}).by,at:d.phat_hanh.at}:null],['Xác nhận thu hồi bản cũ',d.thu_hoi],['Từ chối',d.tu_choi],['Hủy',d.huy]].filter(x=>x[1]);
  const docBtns=[
    h('button',{class:'btn','data-act':'sd-p1',onclick:()=>sdDoPrint('01',d)},'In phiếu đề nghị BM-SĐ-01')];
  if(['da_phat_hanh','hoan_tat'].includes(d.status)){
    docBtns.push(h('button',{class:'btn','data-act':'sd-p2',onclick:()=>sdDoPrint('02',d)},'In biên bản đính chính BM-SĐ-02'),
      h('button',{class:'btn','data-act':'sd-new-xlsx',onclick:()=>s&&downloadPhieu(s)},'Tải phiếu thay thế (Excel)'),
      h('button',{class:'btn','data-act':'sd-old-xlsx',onclick:async()=>{const r=await safe(()=>sdOldBytes(d),'Không tạo được phiếu cũ.');if(r)saveBytes(r.name,r.bytes);}},'Tải phiếu cũ đã bị thay thế'));
  }
  m=openModal({title:'Hồ sơ sửa phiếu '+d.ma,sub:(SD_LOAI[d.loai]||d.loai)+' · '+((SD_ST[d.status]||[d.status])[0]),wide:true,
    body:[
      h('div',{class:'card flat'},kv([['Phiếu cũ',d.bc_cu||d.bc_goc],['Phiếu thay thế',['da_phat_hanh','hoan_tat'].includes(d.status)||d.status==='cho_soat_xet'||d.status==='cho_phe_duyet'?d.bc_moi:''],['Mã mẫu',d.ma_mau],['Khách hàng',d.khach],['Công trình',d.cong_trinh],['Lý do',d.ly_do],
        d.can_cu?['Căn cứ','Văn bản '+(d.can_cu.vb_so||'(không số)')+' ngày '+fd(d.can_cu.vb_ngay)+' · '+d.can_cu.nguoi_de_nghi+' · '+d.can_cu.hinh_thuc]:null,d.bang_chung?['Bằng chứng',d.bang_chung]:null,d.phi?['Phí hành chính',fmtN(d.phi)+' đồng']:null].filter(Boolean))),
      (d.doi&&d.doi.length)?h('div',{class:'card flat'},h('h3',null,'Nội dung thay đổi'),h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Nội dung','Cũ','Mới'].map(x=>h('th',null,x)))),h('tbody',null,d.doi.map(x=>h('tr',null,h('td',null,x.l),h('td',{style:'text-decoration:line-through'},x.cu||'(trống)'),h('td',null,h('b',null,x.moi)))))))):null,
      h('div',{class:'card flat'},h('h3',null,'Tiến trình'),h('div',{class:'tbl-wrap'},h('table',null,h('tbody',null,steps.map(([t,x])=>h('tr',null,h('td',null,t),h('td',null,x.by||''),h('td',{class:'mono'},fdt(x.at)),h('td',{class:'muted'},x.y_kien||x.ly_do||x.kieu||x.ghi_chu||'')))))),
        d.status==='da_phat_hanh'?h('p',{class:'small muted'},'Phiếu thay thế đã phát hành. Giao phiếu mới cho khách, thu hồi bản giấy cũ, ghi nhận bên dưới để đóng hồ sơ. Phiếu cũ vẫn được giữ trong hồ sơ này.'):null),
      thbox,
      (sdCanSx(d)||sdCanPd(d)||sdCanHuy(d))?h('div',{class:'field'},h('label',{for:'sd-why'},'Ý kiến, lý do (bắt buộc khi từ chối hoặc hủy)'),why):null,
      h('div',{class:'row'},docBtns)],
    actions:[h('button',{class:'btn',onclick:()=>m.close()},'Đóng')].concat(acts)});
}
