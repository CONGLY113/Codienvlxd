import re,base64,sys,json
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out93.html'
s=open('/tmp/w/out92.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:100])
    s=s.replace(old,new)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
# 1. biểu mẫu xi măng PCB40 dựng lại (đổi nhãn nguồn gốc thành Số lô)
m=re.search(r"const XM_B64='[^']+'",s); assert m
s=s[:m.start()]+"const XM_B64='"+b64('/tmp/w/t4/XM40.xlsx')+"'"+s[m.end():]
# 2. khối GT mới
js=open('/tmp/w/p/gt4.js',encoding='utf8').read()
for k,v in {'@@XM30@@':b64('/tmp/w/t4/XM30.xlsx'),'@@CS@@':b64('/tmp/w/t4/CS.xlsx')}.items():
    assert js.count(k)==1; js=js.replace(k,v)
old="const rawGT=raw=>raw&&raw.__t&&GT[raw.__t]?GT[raw.__t]:"
rep(old,js+"\n"+old)
# 3. loại mẫu
rep("['THEP_HINH','Thép hình',true,'Thép hình'],","['XM_PCB30','Xi măng PCB30',true,'Xi măng PCB30'],['THEP_HINH','Thép hình',true,'Thép hình'],['DO_CS','Đo chống sét',true,'Đo điện trở tiếp đất (chống sét)'],")
# 4. cấp phối: nguồn xi măng gồm PCB30, số lô lấy từ phiếu
rep("const CP_SRC={xm:{loai:['XM_PCB40'],t:'xi măng'}","const CP_SRC={xm:{loai:['XM_PCB40','XM_PCB30'],t:'xi măng'}")
rep("d[kind+'_src']=src.ma_mau;d[kind+'_bc']=src.so_bao_cao;d[kind+'_ten']=(src.mau&&(src.mau.nguon_goc||src.mau.ten))||'';",
    "d[kind+'_src']=src.ma_mau;d[kind+'_bc']=src.so_bao_cao;\n  if(kind==='xm'){d.xm_ten=((src.mau&&src.mau.ten)||'').replace(/^Xi măng\\s*/i,'');d.xm_lo=(src.mau&&src.mau.nguon_goc)||'';}else d[kind+'_ten']=(src.mau&&(src.mau.nguon_goc||src.mau.ten))||'';")
rep(". Điền lại từ phiếu nguồn hoặc bỏ liên kết nếu nhập tay.':''});});",
    ". Điền lại từ phiếu nguồn hoặc bỏ liên kết nếu nhập tay.':''});\n    if(kind==='xm'&&x.mau&&(raw.xm_lo||'')!==(x.mau.nguon_goc||''))out.push({label:'Lưu ý khi kiểm tra: Số lô xi măng khớp phiếu '+x.so_bao_cao,state:'warn',note:'Cấp phối ghi lô \"'+(raw.xm_lo||'')+'\", phiếu xi măng ghi lô \"'+(x.mau.nguon_goc||'')+'\".'});});")
rep("+((x.mau&&x.mau.nguon_goc)||'')+' · nhận '","+(kind==='xm'?'lô ':'')+((x.mau&&x.mau.nguon_goc)||'')+' · nhận '")
rep("F('xm_ten','Nhãn hiệu, nguồn gốc')","F('xm_ten','Loại, nhãn hiệu xi măng')")
# 5. kiểm tra file nộp: có sơ đồ
rep("  if(G.verify)G.verify(raw,sample).forEach(c=>add(c.label,c.state,c.note));\n  for(let r=5;r<=20;r++)",
    "  if(G.verify)G.verify(raw,sample).forEach(c=>add(c.label,c.state,c.note));\n  let skRes=null;if(G.sketch){skRes=await skFromFile(u8,G);add('Có sơ đồ vị trí các điểm đo (mặt sau phiếu)',skRes&&skRes.b64?'ok':'warn',skRes&&skRes.b64?'':((skRes&&skRes.err)||'Chưa có sơ đồ. Vẽ trên điện thoại (nút Vẽ sơ đồ) hoặc chèn ảnh vào sheet Phieu_KQ thay hình giữ chỗ.'));}\n  for(let r=5;r<=20;r++)")
rep("hao_hut:(G.sieve&&rc.loss!=null)?rc.loss:null};}","hao_hut:(G.sieve&&rc.loss!=null)?rc.loss:null,sketch:(skRes&&skRes.b64)?skRes:null};}")
# 6. lưu và phát hành: sơ đồ nằm trong tài liệu chi tiết
rep("{raw:d.raw,sieve:d.sieve,checks:d.checks,devs:d.devs}","{raw:d.raw,sieve:d.sieve,checks:d.checks,devs:d.devs,sketch:d.sketch}")
rep("raw:res.raw,sieve:res.sieve,checks:res.checks,devs:res.devs});\n      await Data.set(dp(s.id),det);","raw:res.raw,sieve:res.sieve,checks:res.checks,devs:res.devs,sketch:res.sketch||null});\n      await Data.set(dp(s.id),det);")
rep("tt:n.tinh_trang||'',dv:[]});","tt:n.tinh_trang||'',dv:[],sketch:n.sketch||null});")
# 7. nhúng sơ đồ vào biểu mẫu
rep("  if(extra)await issuedParts(zip,extra);\n",
"""  if(form&&gt(sample)&&gt(sample).sketch){const f=form.d;let png=null,w=0,h_=0;
    if(f.sketch&&f.sketch.b64){png=b64ToU8(f.sketch.b64);w=f.sketch.w;h_=f.sketch.h;}
    else if(f.sk&&f.sk.ops&&f.sk.ops.length){png=await skPng(f.sk);w=f.sk.w;h_=f.sk.h;}
    else if(extra){const k0=skNew('ngang');png=await skPng(k0,'Chưa có sơ đồ vị trí các điểm đo');w=k0.w;h_=k0.h;}
    if(png)await skEmbed(zip,png,w,h_);}
  if(extra)await issuedParts(zip,extra);
""")
# 8. issuedParts: chèn dòng theo thứ tự, giữ vùng in dài hơn (mặt sau)
rep("  xml=xml.replace('</sheetData>',()=>rows+'</sheetData>');",
    "  const insAt=(()=>{const re=/<row r=\"(\\d+)\"/g;let q;while((q=re.exec(xml))){if(+q[1]>R+4)return q.index;}return -1;})();\n  xml=insAt>=0?xml.slice(0,insAt)+rows+xml.slice(insAt):xml.replace('</sheetData>',()=>rows+'</sheetData>');")
rep("zip.file('xl/workbook.xml',wb.replace(/(['\"]?Phieu_KQ['\"]?)!\\$A\\$1:\\$H\\$\\d+/,(mm,sh)=>sh+'!$A$1:$H$'+(R+4)));","zip.file('xl/workbook.xml',wb.replace(/(['\"]?Phieu_KQ['\"]?)!\\$A\\$1:\\$H\\$(\\d+)/,(mm,sh,end)=>sh+'!$A$1:$H$'+Math.max(R+4,+end)));")
# 9. phiếu xem trước
rep("['Nguồn gốc mẫu',m.nguon_goc],['Công trình',da.cong_trinh]","[nguonLbl(loaiOf(s)).l,m.nguon_goc],['Công trình',da.cong_trinh]")
rep("    h('p',{style:'font-size:12px;margin-top:10px'},h('b',null,'Nhận xét: ')",
    "    (G&&G.sketch&&s.nop&&s.nop.sketch&&s.nop.sketch.b64)?h('div',{style:'margin-top:10px'},h('b',null,'Sơ đồ vị trí các điểm đo (mặt sau phiếu)'),h('img',{src:'data:image/png;base64,'+s.nop.sketch.b64,alt:'Sơ đồ vị trí các điểm đo',style:'display:block;max-width:100%;border:1px solid #bbb;margin-top:4px'})):null,\n    h('p',{style:'font-size:12px;margin-top:10px'},h('b',null,'Nhận xét: ')")
# 10. form tiếp nhận: nhãn theo loại, cổng khách hàng dùng đúng loại đã chọn
rep("['TT','Tên mẫu','Nguồn gốc mẫu','Ngày lấy mẫu','Ngày nhận mẫu','Hạn trả kết quả','']","['TT','Tên mẫu','Nguồn gốc mẫu / số lô','Ngày lấy mẫu','Ngày nhận mẫu','Hạn trả kết quả','']")
rep("placeholder:'Mỏ, bãi cung cấp','aria-label':'Nguồn gốc '+(i+1)","placeholder:nguonLbl(r.loai).ph,'aria-label':'Nguồn gốc '+(i+1)")
rep("onchange:e=>{r.loai=e.target.value;if(i===0)syncRow1();}},MAT_TYPES.map","onchange:e=>{r.loai=e.target.value;if(i===0)syncRow1();drawRows();}},MAT_TYPES.map")
rep("const t0=MAT_TYPES.find(x=>x[0]===rows[0].loai)||MAT_TYPES[0];","const t0=MAT_TYPES.find(x=>x[0]===(manual?rows[0].loai:F.m_loai.value))||MAT_TYPES[0];")
rep("  function val(id){return (F[id].value||'').trim();}\n  function read(){",
"""  const relabel=()=>{const L=nguonLbl(F.m_loai.value),fl=el.querySelector('[data-f="m_nguon"]');if(!fl)return;const lb=fl.querySelector('label');if(lb&&lb.firstChild)lb.firstChild.nodeValue=L.l;F.m_nguon.placeholder=L.ph;const ht=fl.querySelector('.hint');if(ht)ht.textContent=L.hint;};
  F.m_loai.addEventListener('change',relabel);
  function val(id){return (F[id].value||'').trim();}
  function read(){""")
rep("pageHead('Gửi yêu cầu thử nghiệm cát xây dựng','Điền thông tin khách hàng, công trình và mẫu.","pageHead('Gửi yêu cầu thử nghiệm vật liệu xây dựng','Chọn loại mẫu, điền thông tin khách hàng, công trình và mẫu.")
rep("else if(k==='m_ngaynhan'||k==='m_hantra')F[k].value='';else F[k].value='';});}","else if(k==='m_ngaynhan'||k==='m_hantra')F[k].value='';else F[k].value='';});relabel();}")
# 11. bản nháp đồng bộ lên hệ thống: bỏ sơ đồ nếu quá lớn (vẫn giữ trên máy)
rep("Data.update(sp(s.id),{ban_nhap:JSON.parse(JSON.stringify(d))})","Data.update(sp(s.id),{ban_nhap:mfRemote(d)})",2)
rep("let MF=null;\nasync function openMF(s){","const mfRemote=d=>{const o=JSON.parse(JSON.stringify(d));if(o.sk&&JSON.stringify(o.sk).length>60000)delete o.sk;return o;};\nlet MF=null;\nasync function openMF(s){")
# 12. build, nhật ký, hook thử nghiệm
rep("const BUILD='0.10.0 · 04/11/2026';","const BUILD='0.11.0 · 04/11/2026';")
row=" ['04/11/2026','B5','Claude','Thêm 2 loại mẫu: Xi măng PCB30 (BM-XM-02, cùng phương pháp thử với PCB40, yêu cầu R3 từ 14 và R28 từ 30 MPa theo file Excel cũ) và Đo chống sét (BM-CS-01: đo điện trở tiếp đất tối đa 15 điểm, mỗi điểm 3 lần, trung bình, yêu cầu tối đa nhập được). Xi măng: ô nguồn gốc mẫu đổi thành Số lô ở form tiếp nhận, biểu mẫu Excel, phiếu và phiếu cấp phối; cấp phối bê tông chọn được phiếu PCB30 và lấy số lô từ phiếu xi măng. Thêm bảng vẽ sơ đồ vị trí điểm đo trên điện thoại (bút, đường, mũi tên, khung, elip, chữ, số điểm, gôm, hoàn tác, khổ ngang hoặc đứng), lưu dạng nét vector gọn trong bản nháp, xuất ảnh PNG đưa vào mặt sau phiếu Excel, đọc lại ảnh khi nộp file Excel, hiện ở phiếu xem trước và phiếu phát hành. Cổng khách hàng dùng đúng loại mẫu đã chọn, nhãn ô nhập đổi theo loại (Số lô, Khu vực đo).','Chrome thật trên khổ điện thoại 390x844 và CSDL giả: vẽ đủ 8 công cụ, hoàn tác, gôm, đổi khổ, tạo hồ sơ, nộp soát xét, ảnh sơ đồ đi vào hồ sơ chi tiết và vào phiếu phát hành (cả khổ ngang, khổ đứng, không có sơ đồ); phát hiện sửa công thức, sửa _HeThong, sai biểu mẫu. Tính lại bằng LibreOffice: 0 ô lệch. Hồi quy các loại cũ và cấp phối bê tông với PCB40, 17 trang, không lỗi','Cổng khách hàng cũ bỏ qua ô Loại mẫu (luôn lấy cát): đã sửa. Ô Nguồn gốc mẫu trên phiếu của các loại cũ còn lệch dòng. Phiếu phát hành chưa in danh sách Thiết bị thử nghiệm. File Chống sét.xls gốc có sheet ẩn chứa mã độc macro, không dùng làm file mẫu','Mở trên điện thoại thật: vẽ sơ đồ bằng ngón tay, nộp, tải phiếu chống sét; so sánh phiếu PCB30 với file gốc','0.11.0'],\n"
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
rep("window.__ptn={rcCP,","window.__ptn={rcCS,skNew,skDraw,skOp,skPng,skFromFile,skEmbed,skMedia,skOpen,skNorm,nguonLbl,rcCP,")
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
