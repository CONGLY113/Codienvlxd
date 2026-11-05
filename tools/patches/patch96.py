import sys,base64
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out96.html'
s=open('/tmp/w/out95_final.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:100])
    s=s.replace(old,new)
rep("const BUILD='0.13.0 · 04/11/2026';","const BUILD='0.14.0 · 04/11/2026';")
g=open('/tmp/w/p/gt6.js',encoding='utf8').read()
assert g.count('@@CV@@')==1
g=g.replace('@@CV@@',base64.b64encode(open('/tmp/w/t6/CV.xlsx','rb').read()).decode())
mk="  GT.CP_TN=G;ALL_TESTS.push(test);\n})();\n"
rep(mk,mk+g+"\n")
rep("['CP_TN','Cấp phối thiên nhiên (đầm chặt)',true,'Đất cấp phối thiên nhiên'],","['CP_TN','Cấp phối thiên nhiên (đầm chặt)',true,'Đất cấp phối thiên nhiên'],['CP_VUA','Thiết kế cấp phối vữa xây',true,'Thiết kế cấp phối vữa xi măng cát'],")
# ---- form tiếp nhận: chọn mác vữa
rep("auto:''});rows.push(newRow());","auto:'',quy:''}),macSel=r=>{const mo=MAT_OPT[r.loai];return mo?h('select',{'aria-label':mo.l,class:'mac-sel','data-f':'row-mac',style:'margin-top:4px',onchange:e=>{r.quy=e.target.value;if(rows[0]===r)syncRow1();}},h('option',{value:''},'— '+mo.l+' —'),...mo.list.map(v=>h('option',{value:v,selected:r.quy===v},v))):null;};rows.push(newRow());")
rep("' (chờ biểu mẫu)'))))),","' (chờ biểu mẫu)')))),macSel(r)),")
rep("r.loai=e.target.value;if(i===0)syncRow1();drawRows();","r.loai=e.target.value;if(!MAT_OPT[r.loai])r.quy='';if(i===0)syncRow1();drawRows();if(i===0)relabelMac();")
rep("rows.splice(i,1);drawRows();syncRow1();","rows.splice(i,1);drawRows();syncRow1();relabelMac();")
rep("f('m_quycach','Quy cách, khối lượng mẫu',{ph:'Ví dụ: 1 bao, khoảng 20 kg'}),","f('m_quycach','Quy cách, khối lượng mẫu',{ph:'Ví dụ: 1 bao, khoảng 20 kg'}),f('m_mac','Mác vữa',{ctl:h('select',null,h('option',{value:''},'— Chọn —')),hint:MAT_OPT.CP_VUA.hint}),")
rep("F.m_loai.addEventListener('change',relabel);","""const relabelMac=()=>{const lo=manual?rows[0].loai:F.m_loai.value,mo=MAT_OPT[lo],fm=el.querySelector('[data-f="m_mac"]'),fq=el.querySelector('[data-f="m_quycach"]');if(!fm)return;fm.style.display=(mo&&!manual)?'':'none';if(fq)fq.style.display=mo?'none':'';
    if(mo){const lb=fm.querySelector('label');if(lb&&lb.firstChild)lb.firstChild.nodeValue=mo.l;const old=F.m_mac.value;F.m_mac.replaceChildren(h('option',{value:''},'— Chọn —'),...mo.list.map(v=>h('option',{value:v},v)));F.m_mac.value=mo.list.includes(old)?old:'';const ht=fm.querySelector('.hint');if(ht)ht.textContent=mo.hint;}};
  F.m_loai.addEventListener('change',()=>{relabel();relabelMac();});relabelMac();""")
rep("F[k].value='';});relabel();}","F[k].value='';});relabel();relabelMac();}")
rep("need('k_ten','tên đơn vị');need('d_ct','công trình');need('m_nguon','nguồn gốc mẫu');","need('k_ten','tên đơn vị');need('d_ct','công trình');need('m_nguon','nguồn gốc mẫu');const loai0=manual?rows[0].loai:F.m_loai.value,mo0=MAT_OPT[loai0],quy0=mo0?(manual?(rows[0].quy||''):F.m_mac.value):val('m_quycach');if(mo0&&!quy0){errs.push(mo0.l.toLowerCase());const fm=el.querySelector('[data-f=\"m_mac\"]');if(fm&&!manual)fm.classList.add('err');}")
rep("quy_cach:val('m_quycach')","quy_cach:quy0")
rep("extra.push({loai:r.loai,ten:t[3]||t[1],nguon:r.nguon.trim(),lay:r.lay,nhan:r.nhan,han:r.han})","if(MAT_OPT[r.loai]&&!r.quy)errs.push(MAT_OPT[r.loai].l.toLowerCase()+' '+n);extra.push({loai:r.loai,ten:t[3]||t[1],nguon:r.nguon.trim(),lay:r.lay,nhan:r.nhan,han:r.han,quy:r.quy||''})")
rep("d2.mau=Object.assign({},d2.mau,{loai:r.loai,ten:r.ten,nguon_goc:r.nguon,ngay_lay:r.lay,ngay_nhan:r.nhan})","d2.mau=Object.assign({},d2.mau,{loai:r.loai,ten:r.ten,nguon_goc:r.nguon,ngay_lay:r.lay,ngay_nhan:r.nhan,quy_cach:MAT_OPT[r.loai]?(r.quy||''):(MAT_OPT[doc.mau.loai]?'':doc.mau.quy_cach)})")
rep("['Quy cách',base.mau.quy_cach]","[(MAT_OPT[base.mau.loai]||{}).l||'Quy cách',base.mau.quy_cach]")
rep("['Quy cách mẫu',m.quy_cach]","[(MAT_OPT[loaiOf(s)]||{}).l||'Quy cách mẫu',m.quy_cach]")
row=""" ['04/11/2026','B6','Claude','Thêm loại mẫu Thiết kế cấp phối vữa xây (BM-CV-01): một biểu mẫu chung cho ba mác M50, M75, M100 gộp từ ba file Excel cũ. Mác vữa chọn bằng danh sách ngay lúc tạo phiếu yêu cầu (tiếp nhận thủ công, từng dòng mẫu, và cổng khách hàng), lưu ở ô quy cách và điền sẵn vào biểu mẫu. Tính lượng xi măng, cát, nước, thể tích tuyệt đối và xốp, độ hỗng cát, cường độ dự kiến 3, 7, 28 ngày theo bảng hệ số từng mác (ở sheet _HeThong). Số liệu xi măng và cát chọn từ phiếu đã phát hành (có kiểm tra khớp) hoặc nhập tay.','LibreOffice tính lại đúng giá trị ba file gốc (M50 xi măng 212, cát 1975, nước 178; M75 295, 1820, 218; M100 384, 1600, 277). Chrome thật: tạo yêu cầu có chọn mác, tải biểu mẫu, nhập, nộp, phát hành, phát hiện sửa công thức và sửa bảng hệ số','Hệ số R7 và R28 của M100 (0,72 và 1,04) khác M50, M75 (0,74 và 1,03); Rx (mác xi măng thực tế) trong file cũ không bằng R28 x 10,197. Chưa rõ tiêu chuẩn ghi trên phiếu và cấp phối tính cho 1 m³ vữa hay 1 m³ cát','Anh xác nhận bảng câu hỏi mới (hệ số từng mác, Rx, tiêu chuẩn, ngày xuất kết quả)','0.14.0'],
"""
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
rep("window.__ptn={","window.__ptn={cvRc,CV_T,MAT_OPT,macOf,cpFill,cpCands,cpVals,cvLinkChecks,")
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
