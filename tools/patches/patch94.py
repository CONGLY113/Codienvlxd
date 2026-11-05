import sys
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out94.html'
s=open('/tmp/w/out93_final.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:90])
    s=s.replace(old,new)
rep("const BUILD='0.11.0 · 04/11/2026';","const BUILD='0.12.0 · 04/11/2026';")
arc=open('/tmp/w/p/arc.js',encoding='utf8').read()
rep("/* ---- archive */\nlet arQ='';","/* ---- archive */\n"+arc+"\nlet arQ='';")
rep("pages['luu-tru']={render(root){\n  const all=","pages['luu-tru']={render(root){\n  if(arTab!=='online')return arTabs(root);\n  const all=")
rep("\n    h('div',{class:'card flat row',style:'justify-content:space-between'},h('div',null,h('b',null,all.length+' báo cáo","\n    arTabBar(),h('div',{class:'card flat row',style:'justify-content:space-between'},h('div',null,h('b',null,all.length+' báo cáo")
# tra cứu QR
old="  if(!s||!s.phieu){box.append(h('p',null,S.samples.length?'Không tìm thấy phiếu '+slug.replace(/^tc-/,'')+' có bản lưu nguyên bản.':'Đang tải dữ liệu, hoặc tài khoản của bạn chưa được cấp quyền xem. Nếu không tải được, hãy liên hệ phòng thí nghiệm.'));return;}"
new="""  if(!s||!s.phieu){
    const nf=S.samples.length?'Không tìm thấy phiếu '+slug.replace(/^tc-/,'')+' có bản lưu nguyên bản.':'Đang tải dữ liệu, hoặc tài khoản của bạn chưa được cấp quyền xem. Nếu không tải được, hãy liên hệ phòng thí nghiệm.';
    const msg=h('p',null,'Đang tìm phiếu '+slug.replace(/^tc-/,'')+' ...');box.append(msg);
    arLookup(slug).then(e=>{if(e)box.replaceChildren(...arcPublicCard(e));else msg.textContent=nf;});
    return;}"""
rep(old,new)
# thẻ dung lượng: nút nhắc kỳ đến hạn
rep("quá 90 ngày cần chuyển lưu giữ (bản 0.8.1).'));","quá 90 ngày được chuyển sang lưu giữ ở trang Hồ sơ lưu trữ, tab Gói lưu giữ.'),arcDueCount()?h('a',{class:'btn sm primary',href:'#luu-tru',style:'margin-top:8px','data-act':'arc-due',onclick:()=>{arTab='pack';}},arcDueCount()+' kỳ đến hạn lưu giữ'):null);")
rep("window.__ptn={rcCS,","window.__ptn={arcBuild,arcRead,arcCommit,arLookup,arcPeriods,arcDueCount,perDue,perEnd,AR,arOpenZip,setArTab:v=>{arTab=v;},rcCS,")
row=" ['04/11/2026','B5','Claude','Lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2): trang Hồ sơ lưu trữ có 3 tab (đang lưu trực tuyến, đã lưu giữ, gói lưu giữ). Kỳ nửa tháng quá 90 ngày: tạo gói ZIP (mẫu, số liệu gốc, nhật ký, file Excel gốc, chỉ mục CSV, mã băm từng file, tùy chọn kèm phiếu A4), lưu file, chọn lại file để app kiểm tra, chỉ khi đạt mới ghi chỉ mục gọn và xóa hồ sơ nặng khỏi kho (đọc lại từng mẫu so với gói trước khi xóa). Chỉ mục khóa theo tháng của số báo cáo nên quét QR phiếu cũ vẫn ra thông tin và mã băm; mở file ZIP để xem lại toàn bộ phiếu, nhật ký, tải phiếu A4 và file gốc.','Chrome thật (CSDL giả): gói lỗi, gói hỏng 1 byte, gói sai kỳ đều bị chặn, nút xóa chỉ mở khi gói đạt và phải bấm 2 lần; mẫu bị sửa sau khi đóng gói được giữ lại; mẫu chưa xong giữ lại; kỳ hết mẫu thì đóng; quét QR ra thông tin và mã băm khớp, cả khi tháng số báo cáo khác kỳ lưu; mở ZIP xem phiếu, tải phiếu A4 và file gốc; tài khoản không phải Trưởng phòng bị chặn. Kỳ 700 hồ sơ: đóng gói 2,9 giây, gói 35 MB, kiểm tra 1 giây. Hồi quy 17 trang và các loại mẫu không lỗi','Chưa thử trên CSDL thật: tốc độ xóa 3 tài liệu mỗi mẫu qua mạng chưa biết. Cấp phối chọn phiếu nguồn đã lưu giữ phải nhập tay. Trang Thống kê chỉ tính dữ liệu đang giữ trực tuyến. Mẫu cũ (id s_xxx) chưa chia kỳ nên chưa lưu giữ được','Làm thử một kỳ thật nhỏ: tạo gói, lưu file, chọn lại file, chuyển, quét QR phiếu cũ','0.12.0'],\n"
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
