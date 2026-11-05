import sys,base64
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out95.html'
s=open('/tmp/w/out94_final.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:100])
    s=s.replace(old,new)
rep("const BUILD='0.12.0 · 04/11/2026';","const BUILD='0.13.0 · 04/11/2026';")
b=lambda p:base64.b64encode(open(p,'rb').read()).decode()
g=open('/tmp/w/p/gt5.js',encoding='utf8').read()
for k,f in [('NB','NB'),('NV','NV'),('KDV','KDV'),('KPR','KPR'),('CPT','CPT')]:
    assert g.count('@@%s@@'%k)==1
    g=g.replace('@@%s@@'%k,b('/tmp/w/t5/%s.xlsx'%f))
mk="  csTests.forEach(t=>ALL_TESTS.push(t));\n})();\n"
rep(mk,mk+g+"\n")
# loại mẫu
rep("['DO_CS','Đo chống sét',true,'Đo điện trở tiếp đất (chống sét)'],","['DO_CS','Đo chống sét',true,'Đo điện trở tiếp đất (chống sét)'],['NEN_BT','Nén mẫu bê tông',true,'Bê tông'],['NEN_VUA','Nén mẫu vữa',true,'Vữa'],['DO_K_DV','Đo K dao vòng (cát)',true,'Đo hệ số đầm nén K (dao vòng)'],['DO_K_PR','Đo K phễu rót cát (đất)',true,'Đo hệ số đầm nén K (phễu rót cát)'],['CP_TN','Cấp phối thiên nhiên (đầm chặt)',true,'Đất cấp phối thiên nhiên'],")
# số phiếu yêu cầu cố định theo tháng cho nén bê tông và nén vữa
mon="""/* 0.13.0: nén bê tông và nén vữa dùng chung MỘT số phiếu yêu cầu cho cả tháng: lấy theo ngày nhận mẫu đầu tiên của tháng (ví dụ nhận 12/10 đầu tiên thì cả tháng 10 là YC26.10.12.x).
   Số báo cáo vẫn cấp theo ngày nhận từng mẫu như các loại khác. Muốn tách riêng bê tông và vữa: đổi nhóm của NEN_VUA thành 'vua'. */
const YC_MONTH={NEN_BT:'nen',NEN_VUA:'nen'};
const ycKey=s=>YC_MONTH[loaiOf(s)]?((s.so_yc||s.id)+'|'+((s.khach&&s.khach.ten)||'')+'|'+((s.du_an&&s.du_an.cong_trinh)||'')):(s.so_yc||s.id);
async function monthlyYc(loai,isoNhan){
  const g=YC_MONTH[loai],iso=/^\\d{4}-\\d{2}-\\d{2}$/.test(isoNhan||'')?isoNhan:todayISO(),ym=iso.slice(0,7),key='counters/ycm_'+ym.replace('-','')+'_'+g;
  const used=()=>S.samples.filter(x=>x.so_yc&&x.status!=='tu_choi'&&YC_MONTH[loaiOf(x)]===g&&((x.mau&&x.mau.ngay_nhan)||'').slice(0,7)===ym).map(x=>x.so_yc).sort();
  const u0=used();if(u0.length)return u0[0];
  if(DB){const ref=DB.doc(key);for(let i=0;i<8;i++){try{const r=await ref.acquire({holder:HOLDER,ttlMs:4000});if(r.acquired)break;}catch(e){break;}await sleep(600);}}
  const c=await Data.get(key);if(c&&c.code)return c.code;
  const u1=used();if(u1.length)return u1[0];
  const code=await makeCode('yc',iso);await Data.set(key,{code,thang:ym,nhom:g,at:new Date().toISOString()});return code;
}
"""
rep("/* ====================================================================== STATE */",mon+"\n/* ====================================================================== STATE */")
rep("const so_yc=base.bo_sung_cho||await makeCode('yc',dNhan.value),ma_mau=","const allM=[base.mau.loai].concat((base.extra||[]).map(r=>r.loai)).every(l=>YC_MONTH[l]);const so_yc=base.bo_sung_cho||(allM?await monthlyYc(base.mau.loai,dNhan.value):await makeCode('yc',dNhan.value)),ma_mau=")
rep("S.samples.forEach(s=>{if(!s.so_yc||s.status==='tu_choi')return;\n    const e=m.get(s.so_yc)","S.samples.forEach(s=>{if(!s.so_yc||s.status==='tu_choi'||YC_MONTH[loaiOf(s)])return;\n    const e=m.get(s.so_yc)")
rep("todo.forEach(s=>{const k=s.so_yc||s.id;","todo.forEach(s=>{const k=ycKey(s);")
rep("h('div',null,code(k),' ',h('span',{class:'muted small'},l.length+' mẫu: '","h('div',null,code(l[0].so_yc||k),' ',h('span',{class:'muted small'},(YC_MONTH[loaiOf(l[0])]?(l[0].khach.ten+' · '+((l[0].du_an&&l[0].du_an.cong_trinh)||'')+' · '):'')+l.length+' mẫu: '")
rep("active.forEach(s=>{const k=s.so_yc||s.id;","active.forEach(s=>{const k=ycKey(s);")
rep("(G&&G.defaults)||{},pick||{})};}","(G&&G.defaults)||{},(G&&G.init?G.init(s):{}),pick||{})};}")
rep("zip.file('xl/workbook.xml',wb.replace(/(['\"]?Phieu_KQ['\"]?)!\\$A\\$1:\\$H\\$(\\d+)/,(mm,sh,end)=>sh+'!$A$1:$H$'+Math.max(R+4,+end)));","zip.file('xl/workbook.xml',wb.replace(/(['\"]?Phieu_KQ['\"]?)!\\$A\\$1:\\$([A-Z]+)\\$(\\d+)/,(mm,sh,col,end)=>sh+'!$A$1:$'+col+'$'+Math.max(R+4,+end)));")
rep("window.__ptn={arcBuild,","window.__ptn={nenRc,kRc,rcCT,kpCp,kVerify,rpt,monthlyYc,YC_MONTH,ycKey,NGUON_LBL,arcBuild,")
row=""" ['04/11/2026','B5','Claude','Thêm 5 loại mẫu: Nén mẫu bê tông (BM-NB-01: lực nén từng viên 3 đến 9 viên, cạnh mẫu 100/150/200/300 mm quy đổi về mẫu chuẩn, mác thiết kế daN/cm², % so với mác), Nén mẫu vữa (BM-NV-01: mẫu 40x40x160, 6 viên, N/mm²), Đo K dao vòng (BM-DK-01: tối đa 15 điểm, Wo và γkmax, K từng điểm, yêu cầu K nhập được), Đo K phễu rót cát (BM-DK-02: lượng cát trong phễu, thể tích hố đào, K), Cấp phối thiên nhiên đầm chặt (BM-CT-01: 5 đến 7 điểm đầm nén, γkmax và Wo, hiệu chỉnh hạt lớn hơn 19 mm, đường cong đầm nén trên phiếu xem trước). Đo K chọn được phiếu cấp phối thiên nhiên đã phát hành để lấy Wo và γkmax (kiểm tra khớp khi nộp). Quy tắc mới: nén bê tông và nén vữa dùng chung một số phiếu yêu cầu cho cả tháng (theo ngày nhận mẫu đầu tiên của tháng); số báo cáo giữ nguyên quy tắc cũ. Danh sách phiếu và giao cả phiếu tách theo khách hàng và công trình khi dùng số phiếu chung. Phiếu Excel rộng (K phễu rót cát 12 cột) có vùng in mở theo đúng bề rộng.','Chrome thật (CSDL giả): tạo mẫu, giao việc, tải biểu mẫu, nhập, nộp, soát xét, phát hành, tải phiếu cho cả 5 loại; số phiếu yêu cầu tháng dùng chung cho nén bê tông và vữa, sang tháng mới đổi số; phát hiện sửa công thức, sửa _HeThong, sai biểu mẫu. Tính lại bằng LibreOffice đúng giá trị file Excel gốc (BT 217,04 daN/cm² đạt 108,5 % mác; vữa 8,385 N/mm² đạt 111,8 %; K dao vòng 91,2 / 89,7 / 88,3; phễu 86,1 / 98,3 / 70,3; đầm chặt γkmax hiệu chỉnh 1,898 g/cm³, Wo 12,8 %). Hồi quy 17 trang và các loại cũ không lỗi','Chưa tự đọc được macro trong file Đo K đất.xlsm (đã bỏ macro, chỉ lấy công thức ô). File Nén mẫu vữa.xls và Chống sét.xls có sheet ẩn chứa chuỗi mã độc macro, không dùng làm file mẫu. Chưa vẽ đường cong đầm nén vào phiếu Excel. Quy ước điểm đỉnh đầm chặt lấy điểm có γk lớn nhất (file gốc lấy cố định điểm 4)','Anh trả lời bảng câu hỏi mới (mác, hệ số quy đổi, phạm vi số phiếu chung, ngưỡng K); thử nhập số thật từng loại','0.13.0'],
"""
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
