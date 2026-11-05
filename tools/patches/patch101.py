import sys,base64,re
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out101.html'
s=open('/tmp/w/out100.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:120])
    s=s.replace(old,new)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
rep("const BUILD='0.18.0 · 05/11/2026';","const BUILD='0.19.0 · 05/11/2026';")
# ---- 1. nhân sự: Trần Hoàn là Kế toán trưởng
rep(" {id:'NS013',name:'Trần Hoàn',title:'Thủ quỹ',roles:['tq']},\n {id:'NS014',name:'Kế toán trưởng',title:'Kế toán trưởng (tên cập nhật sau)',roles:['ktt']}];",
    " {id:'NS013',name:'Trần Hoàn',title:'Kế toán trưởng',roles:['ktt']}];")
# ---- 2. quyền ghi nhận ký duyệt
rep("const bkLap=()=>hasRole('kt')||hasRole('tp');","const bkLap=()=>hasRole('kt')||hasRole('tp');\nconst bkDuyet=()=>hasRole('tp')||hasRole('sx')||hasRole('pd');")
rep("st0==='da_soat'&&(canEdit||tq)?B_('Ghi nhận đã ký duyệt, đóng dấu bản giấy','primary',askDuyet,false,'wf-duyet'):null,",
    "st0==='da_soat'&&bkDuyet()?B_('Ghi nhận ký duyệt','primary',askDuyet,false,'wf-duyet'):null,")
rep("const askDuyet=()=>{const ky=h('input',{type:'text',value:'Giám đốc','aria-label':'Người ký duyệt'});\n    bkTextDlg('Ghi nhận ký duyệt, đóng dấu','Chỉ bấm sau khi bản giấy đã được ký duyệt và đóng dấu. Bảng kê được ghi nhận vào hệ thống với tình trạng chưa thanh toán.','Ghi chú',false,'Đã ký duyệt, đóng dấu',v=>wf('Ghi nhận đã ký duyệt, đóng dấu bản giấy',",
    "const askDuyet=()=>{const ky=h('input',{type:'text',value:SESSION.name,'aria-label':'Người ký duyệt'});\n    bkTextDlg('Ghi nhận ký duyệt','Thủ quỹ đã dò lại số mẫu và đóng dấu mộc bản giấy. Bấm sau khi bảng kê được ký duyệt. Bảng kê được ghi nhận vào hệ thống với tình trạng chưa thanh toán.','Ghi chú',false,'Đã ký duyệt',v=>wf('Ghi nhận ký duyệt bảng kê',")
rep("'Đã soát xét đạt. Chờ ký duyệt, đóng dấu bản giấy.'","'Đã soát xét đạt. Chờ quản trị, trưởng phòng TN hoặc giám đốc ghi nhận ký duyệt.'")
rep("h('span',null,'Tôi đã đối chiếu số lượng mẫu và đơn giá từng dòng')","h('span',null,'Tôi đã dò lại số lượng mẫu, đơn giá từng dòng và đóng dấu mộc bản giấy')")
rep("['Thủ quỹ soát xét',1],['Ký duyệt, đóng dấu',2]","['Thủ quỹ soát xét, đóng dấu mộc',1],['Ghi nhận ký duyệt',2]")
rep(". In bản giấy, ký duyệt, đóng dấu rồi bấm Ghi nhận đã ký duyệt.'",". Chờ quản trị, trưởng phòng TN hoặc giám đốc ghi nhận ký duyệt.'")
rep("if(lap){L.filter(b=>b.trang_thai==='da_soat').forEach(b=>items.push([b,'Đã soát xét, chờ ký duyệt và đóng dấu bản giấy','Mở']));",
    "if(bkDuyet())L.filter(b=>b.trang_thai==='da_soat').forEach(b=>items.push([b,'Thủ quỹ đã soát xét, chờ ghi nhận ký duyệt','Ký duyệt']));\n  if(lap){")
rep("if(bkLap())n+=L.filter(b=>b.trang_thai==='nhap'||b.trang_thai==='da_soat').length+bkPendingGroups().length;",
    "if(bkLap())n+=L.filter(b=>b.trang_thai==='nhap').length+bkPendingGroups().length;if(bkDuyet())n+=L.filter(b=>b.trang_thai==='da_soat').length;")
rep("Giai đoạn 1: lập bảng kê, thủ quỹ soát xét, ký duyệt và đóng dấu bản giấy.","Giai đoạn 1: lập bảng kê, thủ quỹ soát xét và đóng dấu mộc, ghi nhận ký duyệt.")
# ---- 3. ba khối ký
rep("[['Người lập bảng kê',lapName],['Thủ quỹ soát xét',tqName],['Ký duyệt, đóng dấu',''],['Đại diện khách hàng','']]","[['Người lập bảng kê',lapName],['Thủ quỹ',tqName],['Đại diện khách hàng','']]")
i=s.index("  const s3=row(0,[cell('A',r+1,'Người lập bảng kê'");j=s.index("  const font=(sz,bold,it)",i)
NEW="""  const s3=row(0,[cell('A',r+1,'Người lập bảng kê',S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,'Thủ quỹ',S_.bc),cell('D',r+1,'',S_.bc),cell('E',r+1,'Đại diện khách hàng',S_.bc)]);mg('A'+s3,'B'+s3);mg('C'+s3,'D'+s3);
  const s4=row(0,[cell('A',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('B',r+1,'',S_.sm),cell('C',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('D',r+1,'',S_.sm),cell('E',r+1,'(Ký, ghi rõ họ tên)',S_.sm)]);mg('A'+s4,'B'+s4);mg('C'+s4,'D'+s4);
  row(54,[]);
  const s5=row(0,[cell('A',r+1,lapN,S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,tqN,S_.bc),cell('D',r+1,'',S_.bc),cell('E',r+1,'',S_.bc)]);mg('A'+s5,'B'+s5);mg('C'+s5,'D'+s5);
  row(30,[]);
"""
s=s[:i]+NEW+s[j:]
# ---- 4. nội dung chuyển khoản: số bảng kê + tên khách viết tắt
rep("const bkQrNd=b=>{const so=b.so||'',k=bkAscii((b.khach||{}).ten).toUpperCase();return((so?so+' ':'')+k).slice(0,25).trim();};",
"""const bkAbbr=t=>bkAscii(t).split(/[\\s.\\-]+/).filter(Boolean).map(w=>(w.length>=2&&w===w.toUpperCase()&&/[A-Z]/.test(w))?w:w.charAt(0).toUpperCase()).join('');
const bkQrNd=b=>{const so=b.so||'',k=bkAbbr((b.khach||{}).ten);return((so?so+' ':'')+k).slice(0,25).trim();};""")
# ---- 5. tính tiền theo tổ, theo điểm
rep("const BK_UNIT={NEN_BT:{u:'tổ',sz:3,def:3,ghi:'tổ 3 viên'},NEN_VUA:{u:'tổ',sz:6,def:6,ghi:'tổ 6 viên'},",
    "const BK_UNIT={NEN_BT:{u:'tổ',per:1,ghi:'tổ'},NEN_VUA:{u:'tổ',per:1,ghi:'tổ'},")
rep("function bkQty(s){const U=BK_UNIT[loaiOf(s)];if(!U)return{q:1,est:false};","function bkQty(s){const U=BK_UNIT[loaiOf(s)];if(!U||U.per)return{q:1,est:false};")
rep("tạm tính số '+((BK_UNIT[l.loai]||{}).u||'')+' theo mặc định'","tạm tính 3 '+((BK_UNIT[l.loai]||{}).u||'')+' mỗi mẫu, cập nhật khi có kết quả'")
rep("const bkNoteTam=b=>{const c=(b.dong||[]).filter(l=>!l.tay).reduce((a,l)=>a+(l.n-l.xong),0);return c?'Bảng kê tạm tính: còn '+c+' mẫu chưa hoàn thành, số tiền có thể thay đổi khi chốt.':'';};",
"""const bkNoteTam=b=>{const L=(b.dong||[]).filter(l=>!l.tay),c=L.reduce((a,l)=>a+(l.n-l.xong),0),ek=L.filter(l=>BK_UNIT[l.loai]&&BK_UNIT[l.loai].def).reduce((a,l)=>a+(l.est||0),0);
  const a=c?'Bảng kê tạm tính: còn '+c+' mẫu chưa hoàn thành, số tiền có thể thay đổi khi chốt.':'',k=ek?'Đo hệ số K: '+ek+' mẫu chưa nộp kết quả, tạm tính 3 điểm đo mỗi mẫu, sẽ cập nhật theo số điểm đo thực tế.':'';return a+(a&&k?' ':'')+k;};""")
# ---- 6. đầm chặt cát
old=open('/tmp/w/t7/DAM_CHAT_CAT_v1_backup.xlsx','rb').read()
ob=base64.b64encode(old).decode();nb=b64('/tmp/w/t7/DAM_CHAT_CAT_v2.xlsx')
assert s.count(ob)==1,s.count(ob)
s=s.replace(ob,nb)
mk="  GT[code]=G;ALL_TESTS.push(test);NGUON_LBL[code]=lbl;};"
dam=open('/tmp/w/p/dam.js',encoding='utf8').read()
k=s.index("  mk('CPDD_2','BM-CT-04'");k2=s.index("})();",k)+len("})();")
s=s[:k2]+"\n"+dam+s[k2:]
rep("đơn vị đồng. Nén bê tông tính theo tổ 3 viên, nén vữa theo tổ 6 viên, đo K theo điểm đo.","đơn vị đồng. Nén bê tông và nén vữa tính theo tổ (mỗi phiếu một tổ), đo K theo số điểm đo.")
# ---- 7. nhật ký
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B12','Claude','Áp dụng các xác nhận bản 0.18.0: Trần Hoàn là Kế toán trưởng (chỉ xem tổng hợp, từng bảng kê); thủ quỹ soát xét số mẫu và đóng dấu mộc bản giấy, quản trị, trưởng phòng TN hoặc giám đốc ghi nhận ký duyệt; bản in và Excel bảng kê còn 3 khối ký (Người lập, Thủ quỹ, Đại diện khách hàng); nội dung chuyển khoản gồm số bảng kê và tên khách viết tắt; đầm chặt cát bỏ hiệu chỉnh hạt quá cỡ (chỉ còn ở cấp phối thiên nhiên và cấp phối đá dăm), biểu mẫu Excel đầm chặt cát dựng lại; bảng kê tính nén bê tông, nén vữa mỗi phiếu một tổ, đo K theo số điểm đo, chưa nộp tạm tính 3 điểm và ghi rõ trên bảng kê','Chờ thử','Giám đốc ghi nhận ký duyệt theo câu trả lời, các việc khác chỉ xem; đá 20x70 đã là một lần thử, bình quân gia quyền như đá 5-20 nên giữ nguyên'],
""")
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
