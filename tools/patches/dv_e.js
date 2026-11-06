/* ===== 0.27.1 PHÒNG LÀM VIỆC: mỗi phòng một không gian riêng ===== */
const WR_ALL=['co','kd','hs'];
const WR_NAME={co:'Phòng thí nghiệm VLXD',kd:'Phòng Kiểm định Hiệu chuẩn đo lường',hs:'Phòng Hóa sinh môi trường'};
const ACC_ROOM={NS001:'co',NS002:'co',NS003:'co',NS004:'co',NS007:'co',NS008:'co',NS009:'co',NS011:'co',NS014:'kd',NS015:'kd',NS016:'hs',NS017:'hs'};
const wrRooms=a=>a?((ACC_ROOM[a.id]&&!a.roles.includes('tp'))?[ACC_ROOM[a.id]]:WR_ALL):[];
let WR_CUR=null;
function wroom(){if(!SESSION)return 'co';const ok=wrRooms(SESSION);let r=WR_CUR;if(!r){try{r=localStorage.getItem('ptn_room');}catch(e){}}return ok.includes(r)?r:(ACC_ROOM[SESSION.id]||ok[0]||'co');}
function setWroom(r){WR_CUR=r||null;try{r?localStorage.setItem('ptn_room',r):localStorage.removeItem('ptn_room');}catch(e){}}
const dvHash=s=>{let x=0;s=String(s);for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))>>>0;return x.toString(36);};
const dvDate2=v=>{const d=dvDate(v);if(d)return d;const m=String(v==null?'':v).trim().match(/^(\d{1,2})[\/\-.](\d{4})$/);return m?m[2]+'-'+pad(+m[1])+'-01':'';};
/* ---- thiết bị riêng của từng phòng (bộ sưu tập dv_tb) */
const DVT={f:'all',q:''};
const dvDevs=r=>(DV.tb||[]).filter(d=>d.phong===r).sort((a,b)=>String(a.ma).localeCompare(String(b.ma),'vi',{numeric:true}));
const dvDevDue=d=>d.han||(d.last?(+d.last.slice(0,4)+1)+d.last.slice(4):'');
function dvDevSt(d){const due=dvDevDue(d);if(!due)return 'thieu';const n=dvDays(todayISO(),due);return n<0?'qua_han':n<=30?'sap':'con';}
function dvDevPill(d){const s=dvDevSt(d);if(s==='thieu'&&d.tt)return tonePill(d.tt,'neutral');const t=DEV_TXT[s];return tonePill(t[0],t[1]);}
const DV_TB_HEAD=['Mã','Thiết bị','S/N','Chế độ','KĐ/HC gần nhất','Hạn tiếp theo','Tình trạng','Quản lý'];
async function dvTbTemplate(r){return bkTblXlsx('DANH MỤC THIẾT BỊ · '+WR_NAME[r].toUpperCase(),'Điền từ dòng 4. Ngày nhập dạng dd/mm/yyyy. Cột Tình trạng có thể để trống, hệ thống tự tính từ Hạn tiếp theo.',DV_TB_HEAD,[],{widths:[14,44,18,16,18,18,18,24],num:[],sum:[],sheet:'Thiet_bi'});}
async function dvWriteAll(items,path){for(let i=0;i<items.length;i+=10){await Promise.all(items.slice(i,i+10).map(x=>Data.set(path+'/'+x.id,x.doc)));}}
async function dvTbImport(r,file){
  let sh;try{sh=await dvReadXlsx(new Uint8Array(await file.arrayBuffer()));}catch(e){toast('Không đọc được file Excel này.','bad');return;}
  const rows=sh[Object.keys(sh)[0]]||[],hi=rows.findIndex(x=>dvFindCol(x,['ma'])>=0&&dvFindCol(x,['thiet bi','ten thiet bi'])>=0);
  if(hi<0){toast('Không thấy dòng tiêu đề (Mã, Thiết bị, S/N...). Hãy dùng file mẫu của hệ thống.','bad');return;}
  const hd=rows[hi],c=k=>dvFindCol(hd,k),cM=c(['ma']),cT=c(['thiet bi','ten thiet bi']),cS=c(['s/n','sn','so may']),cC=c(['che do']),cL=c(['kd/hc','ngay kd','lan cuoi']),cH=c(['han']),cTT=c(['tinh trang']),cQ=c(['quan ly']);
  const items=[],err=[],seen=new Set(),g=(r0,i)=>i<0?'':String(r0[i]==null?'':r0[i]).trim();
  rows.slice(hi+1).forEach((r0,i)=>{const ma=g(r0,cM),ten=g(r0,cT);if(!ma&&!ten)return;
    if(!ma||!ten){err.push('Dòng '+(hi+i+2)+': thiếu '+(ma?'tên thiết bị':'mã')+'.');return;}
    if(seen.has(ma)){err.push('Dòng '+(hi+i+2)+': mã '+ma+' bị trùng trong file.');return;}seen.add(ma);
    const last=cL<0?'':dvDate2(r0[cL]),han=cH<0?'':dvDate2(r0[cH]);
    if(cL>=0&&r0[cL]!==''&&r0[cL]!=null&&!last)err.push('Dòng '+(hi+i+2)+': ngày KĐ/HC gần nhất không đọc được.');
    if(cH>=0&&r0[cH]!==''&&r0[cH]!=null&&!han)err.push('Dòng '+(hi+i+2)+': hạn tiếp theo không đọc được.');
    items.push({id:'tb_'+r+'_'+dvHash(ma),doc:{phong:r,ma,ten,sn:g(r0,cS),che_do:g(r0,cC),last,han,tt:g(r0,cTT),mgr:g(r0,cQ),sua:{at:new Date().toISOString(),by:SESSION.name}}});});
  if(err.length||!items.length||items.length>2000){openModal({title:'Không nhập được danh sách thiết bị',body:[h('div',{class:'banner','data-tone':'bad'},h('div',null,err.slice(0,20).map(e=>h('div',null,e)),!items.length?h('div',null,'File không có dòng thiết bị nào.'):null,items.length>2000?h('div',null,'Tối đa 2000 thiết bị mỗi lần nhập.'):null))],actions:[]});return;}
  const old=dvDevs(r),mode=h('select',{'aria-label':'Cách nhập'},h('option',{value:'cap_nhat'},'Cập nhật theo mã, giữ thiết bị khác'),h('option',{value:'thay'},'Thay thế toàn bộ danh sách hiện có'));
  const dlg=openModal({title:'Nhập danh sách thiết bị · '+WR_NAME[r],sub:'File có '+items.length+' thiết bị. Danh sách hiện có: '+old.length+'.',body:[bkF('Cách nhập',mode)],actions:[h('button',{class:'btn',onclick:()=>dlg.close()},'Đóng'),h('button',{class:'btn primary','data-act':'tb-ok',onclick:async function(){this.disabled=true;
    const ok=await safe(async()=>{await dvWriteAll(items,'dv_tb');if(mode.value==='thay'){const keep=new Set(items.map(x=>x.id));for(const d of old)if(!keep.has(d.id))await Data.del('dv_tb/'+d.id);}return true;},'Không lưu được danh sách thiết bị.');
    if(ok){await logAudit('Nhập danh sách thiết bị',WR_NAME[r]+' · '+items.length+' thiết bị · '+(mode.value==='thay'?'thay toàn bộ':'cập nhật'));toast('Đã nhập '+items.length+' thiết bị.');dlg.close();render();}else this.disabled=false;}},'Nhập')]});
}
function dvEquip(root){
  const r=wroom(),can=dvCanLap(r)||dvCanTp(r),all=dvDevs(r),cnt={qua_han:0,sap:0,con:0,thieu:0};all.forEach(d=>cnt[dvDevSt(d)]++);
  const tbl=h('div'),fileIn=h('input',{type:'file',accept:'.xlsx',hidden:true,onchange:async e=>{const f=e.target.files[0];e.target.value='';if(f)await dvTbImport(r,f);}});
  const draw=()=>{const q=dvNorm1(DVT.q),L=all.filter(d=>(DVT.f==='all'||dvDevSt(d)===DVT.f)&&(!q||dvNorm1([d.ma,d.ten,d.sn,d.mgr].join(' ')).includes(q)));
    tbl.replaceChildren(L.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,DV_TB_HEAD.map(x=>h('th',null,x)))),h('tbody',null,L.map(d=>{const due=dvDevDue(d);return h('tr',null,h('td',null,code(d.ma)),h('td',null,d.ten),h('td',{class:'mono'},d.sn||''),h('td',null,d.che_do||''),h('td',{class:'num'},d.last?fd(d.last):''),h('td',{class:'num'},due?fd(due):''),h('td',null,dvDevPill(d)),h('td',null,d.mgr||''));})))):
      emptyState(all.length?'Không có thiết bị khớp bộ lọc':'Chưa có thiết bị nào',all.length?'Đổi bộ lọc hoặc từ khóa.':(can?'Bấm Tải lên Excel để nhập danh mục thiết bị của '+WR_NAME[r]+'. Bấm Tải mẫu Excel nếu chưa có file.':'Cán bộ của phòng sẽ tải danh mục thiết bị lên.')));};
  const chip=(k,l,n)=>h('button',{class:'btn sm'+(DVT.f===k?' primary':''),onclick:()=>{DVT.f=k;render();}},l+' ('+n+')');
  root.append(pageHead('Thiết bị',WR_NAME[r]+'. Danh mục riêng của phòng, tải lên từ file Excel. Hạn tiếp theo lấy từ file; nếu để trống thì tính một năm sau lần KĐ/HC gần nhất.'),
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},can?h('button',{class:'btn primary','data-act':'tb-up',onclick:()=>fileIn.click()},'Tải lên Excel'):null,h('button',{class:'btn','data-act':'tb-tpl',onclick:async()=>saveBytes('Mau_thiet_bi_'+r+'.xlsx',await dvTbTemplate(r))},'Tải mẫu Excel'),
      h('button',{class:'btn',disabled:!all.length,onclick:()=>csvSave('thiet-bi-'+r+'.csv',DV_TB_HEAD,all.map(d=>[d.ma,d.ten,d.sn||'',d.che_do||'',d.last?fd(d.last):'',dvDevDue(d)?fd(dvDevDue(d)):'',(DEV_TXT[dvDevSt(d)]||[''])[0],d.mgr||'']))},'Tải CSV'),
      can&&all.length?h('button',{class:'btn ghost','data-act':'tb-clear',onclick:()=>bkTextDlg('Xóa toàn bộ danh sách thiết bị','Xóa '+all.length+' thiết bị của '+WR_NAME[r]+'. Không ảnh hưởng phòng khác. Có thể tải lên lại từ file Excel.','Lý do',true,'Xóa toàn bộ',async v=>{const ok=await safe(async()=>{for(const d of all)await Data.del('dv_tb/'+d.id);return true;},'Không xóa được.');if(ok){await logAudit('Xóa danh sách thiết bị',WR_NAME[r]+' · '+all.length+' thiết bị · '+v);toast('Đã xóa danh sách thiết bị.');render();}})},'Xóa toàn bộ'):null,fileIn),
    h('div',{class:'row'},chip('all','Tất cả',all.length),chip('qua_han','Quá hạn',cnt.qua_han),chip('sap','Sắp hết hạn',cnt.sap),chip('con','Còn hạn',cnt.con),chip('thieu','Thiếu dữ liệu',cnt.thieu),
      h('input',{type:'text',placeholder:'Tìm theo mã, tên, S/N, người quản lý',value:DVT.q,oninput:e=>{DVT.q=e.target.value;draw();},style:'max-width:320px','aria-label':'Tìm thiết bị'})),tbl);
  draw();
}
/* ---- hồ sơ lưu trữ riêng của phòng (bảng kê, báo giá đã duyệt) */
function dvArchive(root){
  const r=wroom(),L=dvAllBk().filter(b=>b.phong===r&&b.so&&b.trang_thai==='da_duyet').map(b=>({b,k:'Bảng kê'})).concat(dvAllBg().filter(b=>b.phong===r&&b.so&&b.trang_thai==='da_duyet').map(b=>({b,k:'Báo giá'}))).sort((x,y)=>(y.b.duyet&&y.b.duyet.at||y.b.ngay)<(x.b.duyet&&x.b.duyet.at||x.b.ngay)?-1:1);
  const tb=h('tbody'),q=h('input',{type:'text',placeholder:'Tìm theo số, khách hàng, nội dung','aria-label':'Tìm hồ sơ',style:'max-width:320px',oninput:()=>fill()});
  const fill=()=>{const t=dvNorm1(q.value);const M=L.filter(x=>!t||dvNorm1([x.b.so,x.b.khach.ten,x.b.cong_trinh].join(' ')).includes(t));
    tb.replaceChildren(...M.map(x=>h('tr',null,h('td',null,code(x.b.so)),h('td',null,x.k),h('td',null,x.b.khach.ten),h('td',{class:'small'},fd(x.b.ngay)),h('td',{class:'num'},fmtN(dvTotals(x.b).tt)),h('td',null,(()=>{const s=dvStLabel(x.b,x.b.col&&/^dvbg_/.test(x.b.col)?'bg':'bk');return tonePill(s[0],s[1]);})()),h('td',{class:'r'},h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>{location.hash='dich-vu';dvOpen(x.b);}},'Mở')))));};
  root.append(pageHead('Hồ sơ lưu trữ',WR_NAME[r]+'. Bảng kê và báo giá đã duyệt của phòng. Hồ sơ thử nghiệm chuyên môn sẽ có ở giai đoạn 2.'),
    h('div',{class:'card stack'},h('div',{class:'row'},q),L.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số','Loại','Khách hàng','Ngày','Giá trị (đ)','Trạng thái',''].map(x=>h('th',null,x)))),tb)):emptyState('Chưa có hồ sơ','Bảng kê và báo giá xuất hiện ở đây sau khi được duyệt.')));
  fill();
}
/* ---- tổng quan của phòng kiểm định, hóa sinh */
function dvOverview(root){
  const r=wroom(),bk=dvAllBk().filter(b=>b.phong===r&&b.so),bg=dvAllBg().filter(b=>b.phong===r&&b.so),today=todayISO();
  const mine=dvMine('bk').concat(dvMine('bg')).filter(([b])=>b.phong===r),devs=dvDevs(r),dd=devs.filter(d=>['qua_han','sap'].includes(dvDevSt(d))).length;
  const cc=[];bk.filter(b=>b.trang_thai!=='huy').forEach(b=>b.dong.forEach(l=>{if(l.cc&&l.cc.het_han)cc.push(l.cc.het_han);}));(DV.cc||[]).filter(x=>x.phong===r&&x.het_han).forEach(x=>cc.push(x.het_han));
  const soon=cc.filter(d=>dvDays(today,d)<=60).length;
  root.append(pageHead('Tổng quan',WR_NAME[r]+'. Việc đang chờ bạn và tình hình thanh toán của phòng.'),
    h('div',{class:'pipe'},[['Bảng kê chờ duyệt',bk.filter(b=>b.trang_thai==='cho_soat'||b.trang_thai==='da_soat').length],['Chưa thu',fmtN(bkSum(bk.filter(b=>b.trang_thai==='da_duyet'),b=>dvPay(b).con))+' đ'],['Báo giá chờ duyệt',bg.filter(b=>b.trang_thai==='cho_duyet').length],['Giấy chứng nhận sắp hết hạn',soon],['Thiết bị quá hạn, sắp hết hạn',dd]].map(([k,v])=>h('div',null,h('b',null,v),h('span',null,k)))),
    h('div',{class:'card stack'},h('div',{class:'card-h'},h('h2',null,'Việc của bạn')),mine.length?h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,['Số','Khách hàng','Giá trị','Việc cần làm',''].map(x=>h('th',null,x)))),h('tbody',null,mine.map(([b,why])=>h('tr',null,h('td',null,b.so),h('td',null,b.khach.ten),h('td',{class:'num'},fmtN(dvTotals(b).tt)+' đ'),h('td',null,why),h('td',null,h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>{location.hash='dich-vu';dvOpen(b);}},'Mở'))))))):emptyState('Không có việc nào đang chờ bạn','Bảng kê và báo giá cần bạn xử lý sẽ hiện ở đây.')));
}
/* ---- giấy chứng nhận: từ dòng bảng kê và từ file tải lên */
const DV_CC_HEAD=['Số giấy chứng nhận','Ngày cấp','Hạn hiệu lực','Khách hàng','Nội dung','Số bảng kê','Liên kết'];
async function dvCcTemplate(r){return bkTblXlsx('GIẤY CHỨNG NHẬN KIỂM ĐỊNH, HIỆU CHUẨN · '+WR_NAME[r].toUpperCase(),'Điền từ dòng 4. Ngày nhập dạng dd/mm/yyyy. Cột Liên kết là địa chỉ web của file giấy chứng nhận (nếu có).',DV_CC_HEAD,[],{widths:[26,16,16,36,40,22,40],num:[],sum:[],sheet:'Giay_chung_nhan'});}
async function dvCcImport(r,file){
  let sh;try{sh=await dvReadXlsx(new Uint8Array(await file.arrayBuffer()));}catch(e){toast('Không đọc được file Excel này.','bad');return;}
  const rows=sh[Object.keys(sh)[0]]||[],hi=rows.findIndex(x=>dvFindCol(x,['so giay'])>=0);
  if(hi<0){toast('Không thấy dòng tiêu đề (Số giấy chứng nhận, Ngày cấp...). Hãy dùng file mẫu của hệ thống.','bad');return;}
  const hd=rows[hi],c=k=>dvFindCol(hd,k),cS=c(['so giay']),cN=c(['ngay cap']),cH=c(['han']),cK=c(['khach']),cD=c(['noi dung']),cB=c(['so bang ke']),cL=c(['lien ket']),g=(r0,i)=>i<0?'':String(r0[i]==null?'':r0[i]).trim();
  const items=[],err=[],seen=new Set();
  rows.slice(hi+1).forEach((r0,i)=>{const so=g(r0,cS);if(!so)return;if(seen.has(so)){err.push('Dòng '+(hi+i+2)+': số '+so+' bị trùng trong file.');return;}seen.add(so);
    const nc=cN<0?'':dvDate2(r0[cN]),hh=cH<0?'':dvDate2(r0[cH]);
    if(cN>=0&&r0[cN]!==''&&r0[cN]!=null&&!nc)err.push('Dòng '+(hi+i+2)+': ngày cấp không đọc được.');
    if(cH>=0&&r0[cH]!==''&&r0[cH]!=null&&!hh)err.push('Dòng '+(hi+i+2)+': hạn hiệu lực không đọc được.');
    items.push({id:'cc_'+r+'_'+dvHash(so),doc:{phong:r,so,ngay_cap:nc,het_han:hh,khach:g(r0,cK),ten:g(r0,cD),bk:g(r0,cB),lk:g(r0,cL),sua:{at:new Date().toISOString(),by:SESSION.name}}});});
  if(err.length||!items.length||items.length>2000){openModal({title:'Không nhập được giấy chứng nhận',body:[h('div',{class:'banner','data-tone':'bad'},h('div',null,err.slice(0,20).map(e=>h('div',null,e)),!items.length?h('div',null,'File không có dòng giấy chứng nhận nào.'):null))],actions:[]});return;}
  const dlg=openModal({title:'Nhập giấy chứng nhận · '+WR_NAME[r],sub:'File có '+items.length+' giấy chứng nhận. Số đã có sẽ được cập nhật, số mới được thêm.',body:[],actions:[h('button',{class:'btn',onclick:()=>dlg.close()},'Đóng'),h('button',{class:'btn primary','data-act':'cc-up-ok',onclick:async function(){this.disabled=true;const ok=await safe(async()=>{await dvWriteAll(items,'dv_cc');return true;},'Không lưu được giấy chứng nhận.');
    if(ok){await logAudit('Nhập giấy chứng nhận',WR_NAME[r]+' · '+items.length+' giấy');toast('Đã nhập '+items.length+' giấy chứng nhận.');dlg.close();render();}else this.disabled=false;}},'Nhập')]});
}
function dvCert(box){
  const rs=dvScope('bk'),r=rs[0],today=todayISO(),can=r&&(dvCanLap(r)||dvCanTp(r)),rows=[],seen=new Set();
  dvAllBk().filter(b=>rs.includes(b.phong)&&b.trang_thai!=='huy').forEach(b=>b.dong.forEach(l=>{if(l.cc&&l.cc.so){seen.add(l.cc.so);rows.push({b,c:l.cc,nd:l.ten,kh:b.khach.ten,bk:b.so,left:l.cc.het_han?dvDays(today,l.cc.het_han):null});}}));
  const up=(DV.cc||[]).filter(x=>rs.includes(x.phong));
  up.forEach(x=>{if(!seen.has(x.so))rows.push({b:null,c:x,nd:x.ten||'',kh:x.khach||'',bk:x.bk||'',left:x.het_han?dvDays(today,x.het_han):null});});
  rows.sort((a,b)=>(a.c.het_han||'9999')<(b.c.het_han||'9999')?-1:1);
  const q=h('input',{type:'text',placeholder:'Tìm số giấy chứng nhận, khách hàng, thiết bị','aria-label':'Tìm giấy chứng nhận',value:DVS.gq,style:'width:300px;max-width:100%',oninput:e=>{DVS.gq=e.target.value;fill();}});
  const cb=h('input',{type:'checkbox','aria-label':'Chỉ sắp hết hạn',checked:DVS.cnSoon,onchange:e=>{DVS.cnSoon=e.target.checked;fill();}});
  const fileIn=h('input',{type:'file',accept:'.xlsx',hidden:true,onchange:async e=>{const f=e.target.files[0];e.target.value='';if(f)await dvCcImport(r,f);}});
  const body=h('tbody');
  function fill(){const t=dvNorm1(DVS.gq);const L=rows.filter(x=>(!t||dvNorm1([x.c.so,x.kh,x.nd,x.bk].join(' ')).includes(t))&&(!DVS.cnSoon||(x.left!=null&&x.left<=60)));
    body.replaceChildren(...L.map(x=>h('tr',null,h('td',null,h('b',null,x.c.so)),h('td',null,fd(x.c.ngay_cap)),h('td',null,fd(x.c.het_han),x.left!=null?h('div',{class:'small'},x.left<0?tonePill('Hết hạn '+(-x.left)+' ngày','bad'):x.left<=60?tonePill('Còn '+x.left+' ngày','warn'):h('span',{class:'muted'},'Còn '+x.left+' ngày')):null),h('td',null,x.kh),h('td',null,x.nd),h('td',null,x.bk),h('td',null,x.c.lk?h('a',{href:/^https?:/i.test(x.c.lk)?x.c.lk:null,target:'_blank',rel:'noopener'},/^https?:/i.test(x.c.lk)?'Mở liên kết':x.c.lk):null),h('td',null,x.b?h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>dvOpen(x.b)},'Mở'):null))));
    if(!L.length)body.replaceChildren(h('tr',null,h('td',{colspan:'8',class:'muted'},'Không có giấy chứng nhận phù hợp.')));}
  fill();
  box.append(h('div',{class:'card stack','data-sec':'cert'},h('div',{class:'card-h'},h('div',null,h('h2',null,'Giấy chứng nhận kiểm định, hiệu chuẩn'),h('p',{class:'muted small'},'Chỉ lưu số, ngày cấp, hạn hiệu lực và liên kết. Tải lên từ Excel hoặc gắn số trong từng dòng bảng kê.')),
    h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},q,h('label',{class:'chk'},cb,' Sắp hết hạn (60 ngày)'),
      can?h('button',{class:'btn primary','data-act':'cc-up',onclick:()=>fileIn.click()},'Tải lên Excel'):null,h('button',{class:'btn','data-act':'cc-tpl',onclick:async()=>saveBytes('Mau_giay_chung_nhan_'+r+'.xlsx',await dvCcTemplate(r))},'Tải mẫu Excel'),
      h('button',{class:'btn',disabled:!rows.length,onclick:()=>csvSave('giay-chung-nhan.csv',DV_CC_HEAD,rows.map(x=>[x.c.so,fd(x.c.ngay_cap),fd(x.c.het_han),x.kh,x.nd,x.bk,x.c.lk||'']))},'Tải CSV'),
      can&&up.length?h('button',{class:'btn ghost',onclick:()=>bkTextDlg('Xóa giấy chứng nhận đã tải lên','Xóa '+up.length+' giấy chứng nhận tải lên từ Excel. Số gắn trong bảng kê không bị xóa.','Lý do',true,'Xóa',async v=>{const ok=await safe(async()=>{for(const x of up)await Data.del('dv_cc/'+x.id);return true;},'Không xóa được.');if(ok){await logAudit('Xóa giấy chứng nhận tải lên',WR_NAME[r]+' · '+up.length+' giấy · '+v);render();}})},'Xóa danh sách tải lên'):null,fileIn)),
    h('div',{class:'tbl-wrap'},h('table',null,h('thead',null,h('tr',null,DV_CC_HEAD.concat(['']).map(x=>h('th',null,x)))),body))));
}
/* ---- phòng kiểm định, hóa sinh dùng trang riêng; phòng Cơ điện giữ trang cũ */
[['tong-quan',dvOverview],['luu-tru',dvArchive],['thiet-bi',dvEquip]].forEach(([k,fn])=>{const o=pages[k].render;pages[k].render=function(root){return wroom()==='co'?o.call(this,root):fn(root);};});
