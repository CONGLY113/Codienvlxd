import sys
src=open('/tmp/w/out107.html',encoding='utf8').read()
sd=open('/tmp/w/p/sd.js',encoding='utf8').read()
def rep(a,b,cnt=1):
    global src
    n=src.count(a)
    assert n==cnt,('anchor count %d (want %d): %s'%(n,cnt,a[:90]))
    src=src.replace(a,b)
# 1. phiên bản
rep("const BUILD='0.24.0 · 05/11/2026';","const BUILD='0.25.0 · 06/11/2026';")
# 2. số hiệu phiếu hiện hành + slug an toàn với chữ Đ
rep("const bcSlug=so=>'tc-'+String(so||'').replace(/[^A-Za-z0-9]+/g,'-');",
    "const bcSlug=so=>'tc-'+String(so||'').replace(/Đ/g,'D').replace(/[^A-Za-z0-9]+/g,'-');\nconst phieuNo=s=>(s&&s.phieu&&s.phieu.bc)||(s&&s.so_bao_cao)||'';")
# 3. phiếu hiện hành dùng số hiệu của bản sửa đổi (phiếu chưa sửa: giữ nguyên số cũ)
rep("name=F.code+'_'+s.so_bao_cao+'.xlsx',ck=s.id+'|'+p.hash+'|'+F.code;","name=F.code+'_'+phieuNo(s)+'.xlsx',ck=s.id+'|'+p.hash+'|'+F.code;")
rep("const x={bc:s.so_bao_cao,hash:p.hash,url:p.url,at:p.at,qr:await qrPng(p.qr),tp_tu_thu:tpTest(s),sx_ten:s.soat_xet&&s.soat_xet.by};\n    const bytes=await issuedBytes(s,s.so_bao_cao,x);await assertForm(bytes,F);",
    "const x={bc:phieuNo(s),hash:p.hash,url:p.url,at:p.at,qr:await qrPng(p.qr),tp_tu_thu:tpTest(s),sx_ten:s.soat_xet&&s.soat_xet.by,thay_the:p.thay_the||null};\n    const bytes=await issuedBytes(s,phieuNo(s),x);await assertForm(bytes,F);")
rep("h('div',null,h('b',null,'Số báo cáo '+s.so_bao_cao)),\n    h('div',null,p.url?","h('div',null,h('b',null,'Số báo cáo '+phieuNo(s))),\n    h('div',null,p.url?")
rep("h('div',{class:'c'},h('b',null,'Số báo cáo: '+(s.so_bao_cao||'(chưa cấp)'))),","h('div',{class:'c'},h('b',null,'Số báo cáo: '+(phieuNo(s)||'(chưa cấp)'))),sdNote(s),")
# 4. Excel phiếu: hai dòng thay thế / đã bị thay thế
rep("const rows=line(R+1,'Số báo cáo: '+x.bc)+line(R+2,x.url?('Tra cứu: '+x.url):'Tra cứu: nhập số báo cáo ở trang Tra cứu của web app')+line(R+3,'')+line(R+4,'');",
"""const sdl=[],cut=(t,n)=>t.length>n?t.slice(0,n-1)+'…':t;
  if(x.da_thay_the)sdl.push('PHIẾU NÀY ĐÃ BỊ THAY THẾ bằng phiếu số '+x.da_thay_the.bc_moi+' (hồ sơ '+x.da_thay_the.ma_sd+'), không còn giá trị sử dụng.');
  if(x.thay_the){const t=x.thay_the;sdl.push('Phiếu này thay thế phiếu số '+t.bc_cu+' ngày '+fd(String(t.at_cu||'').slice(0,10))+' (hồ sơ '+t.ma_sd+'). Lý do: '+(t.ly_do||''));
    sdl.push('Nội dung thay đổi: '+(t.doi||[]).map(y=>y.l+' từ “'+y.cu+'” thành “'+y.moi+'”').join('; ')+'. Số liệu thử nghiệm không đổi.');}
  const rows=line(R+1,'Số báo cáo: '+x.bc)+line(R+2,x.url?('Tra cứu: '+x.url):'Tra cứu: nhập số báo cáo ở trang Tra cứu của web app')+line(R+3,cut(sdl[0]||'',190))+line(R+4,cut(sdl[1]||'',190));""")
# 5. trang tra cứu: tìm theo số của mọi lần sửa, cảnh báo phiếu cũ
rep("const s=S.samples.find(x=>x.so_bao_cao&&bcSlug(x.so_bao_cao)===slug);\n  const box=h('div',{class:'card stack'});","const s=S.samples.find(x=>x.so_bao_cao&&(bcSlug(x.so_bao_cao)===slug||sdHasSlug(x,slug)));\n  const box=h('div',{class:'card stack'});")
rep("box.append(h('h2',null,'Số báo cáo '+s.so_bao_cao),h('div',null,st),kv(","box.append(h('h2',null,'Số báo cáo '+phieuNo(s)),h('div',null,st),sdLookupBanner(s,slug),kv(")
# 6. Hồ sơ lưu trữ: banner + nút đề nghị sửa
rep("    body:[h('div',{class:'card flat'},h('h3',null,'Nhật ký thao tác'),","    body:[sdArchiveBanner(s),h('div',{class:'card flat'},h('h3',null,'Nhật ký thao tác'),")
rep("    actions:[h('button',{class:'btn primary',disabled:!s.phieu,onclick:()=>downloadPhieu(s)},'Tải phiếu A4 (Excel)'),h('button',{class:'btn',onclick:async()=>{const f=await safe(()=>Data.get(isNew(s.id)?bp(s.id):'files/'+s.nop.file_id));",
    "    actions:[sdBtn(s,()=>m.close()),h('button',{class:'btn primary',disabled:!s.phieu,onclick:()=>downloadPhieu(s)},'Tải phiếu A4 (Excel)'),h('button',{class:'btn',onclick:async()=>{const f=await safe(()=>Data.get(isNew(s.id)?bp(s.id):'files/'+s.nop.file_id));")
# 7. module
rep("/* ---- devices */\nlet dvF='all',dvQ='';",sd+"\n/* ---- devices */\nlet dvF='all',dvQ='';")
# 8. menu, trạng thái, theo dõi dữ liệu
rep(" {k:'luu-tru',t:'Hồ sơ lưu trữ',show:()=>true},"," {k:'luu-tru',t:'Hồ sơ lưu trữ',show:()=>true},\n {k:'sua-phieu',t:'Sửa đổi phiếu',show:()=>['tiepnhan','tp','sx','pd','ql'].some(hasRole),count:()=>sdMyCount()},")
rep("const S={samples:[],audit:[],errors:[],config:","const S={samples:[],audit:[],errors:[],suadoi:[],config:")
rep("  Data.watch('audit',list=>{S.audit=list;schedule();});","  Data.watch('audit',list=>{S.audit=list;schedule();});\n  Data.watch('suadoi',list=>{S.suadoi=list;schedule();});")
# 9. sao lưu: thêm bộ sưu tập suadoi và sheet Sua_phieu
rep("['audit','errors','config','counters','mauh','mauv','devcal','archive','files'].forEach(c=>cols.push(c));","['audit','errors','config','counters','mauh','mauv','devcal','archive','files','suadoi'].forEach(c=>cols.push(c));")
rep("  stat.push(['Nhat_ky',au.length]);","""  stat.push(['Nhat_ky',au.length]);
  prog('Đang dựng sheet Sua_phieu ...');
  const sdr=(D.suadoi||[]).slice().sort((a,b)=>String(a.ma)<String(b.ma)?-1:1);
  put('Sua_phieu',['Mã hồ sơ','Loại','Trạng thái','Phiếu gốc','Phiếu cũ','Phiếu thay thế','Mã mẫu','Khách hàng','Công trình','Nội dung đổi (cũ → mới)','Lý do','Căn cứ / bằng chứng','Phí (đồng)','Người lập','Ngày lập','Soát xét','Phê duyệt','Ngày phê duyệt','Phát hành','Thu hồi bản cũ','Mã băm phiếu mới','ID'],
    sdr.map(x=>[x.ma,x.loai,(SD_ST[x.status]||[x.status])[0],x.bc_goc,x.bc_cu||'',x.bc_moi||'',x.ma_mau,x.khach,x.cong_trinh,sdSummary(x),x.ly_do,x.can_cu?('Văn bản '+(x.can_cu.vb_so||'')+' ngày '+fd(x.can_cu.vb_ngay)+', '+x.can_cu.nguoi_de_nghi+', '+x.can_cu.hinh_thuc):(x.bang_chung||''),x.phi||0,(x.lap||{}).by||'',fdt((x.lap||{}).at),(x.sx||{}).by||'',(x.pd||{}).by||'',fdt((x.pd||{}).at),fdt((x.phat_hanh||{}).at),x.thu_hoi?x.thu_hoi.kieu+(x.thu_hoi.ghi_chu?' · '+x.thu_hoi.ghi_chu:''):'',x.hash_moi||'',x.id]),
    [16,6,22,18,18,22,16,28,30,50,36,44,10,20,17,20,20,17,17,36,36,20]);
  stat.push(['Sua_phieu',sdr.length]);""")
# 10. xuất cho kiểm thử
rep("window.__ptn={bkupRun,","window.__ptn={sdCreate,sdApprove,sdMove,sdOldBytes,sdNewDlg,sdOpen,sdDateErr,sdList,sdPrintBox,sdNo,phieuNo,recompute,bkupRun,")
# 11. nhật ký build
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['06/11/2026','B19','Claude','Thêm trang Sửa đổi phiếu (giao nhận, trưởng phòng, soát xét, phê duyệt): phiếu đã phát hành không bị sửa đè. Đề nghị loại A (phòng ghi nhầm, cần bằng chứng), B (khách đổi thông tin do khách cung cấp, cần văn bản), D (liên quan mẫu, kết quả: ghi nhận từ chối). Qua soát xét, phê duyệt (người lập không tự duyệt) rồi phát hành phiếu thay thế mang số cũ kèm SĐ01, SĐ02, có dòng thay thế và nội dung đổi, số liệu không đổi. Phiếu cũ, giá trị cũ, mã băm cũ lưu ở suadoi và tải lại được kèm dòng ĐÃ BỊ THAY THẾ. Tra cứu QR báo phiếu cũ đã bị thay thế. In BM-SĐ-01 (đề nghị điều chỉnh) và BM-SĐ-02 (biên bản đính chính, thu hồi). Sao lưu Excel có sheet Sua_phieu. Luồng nhận mẫu, giao việc, soát xét, phát hành, thanh toán giữ nguyên.'],\n")
open('/tmp/w/out108.html','w',encoding='utf8').write(src)
print('ok',len(src))
