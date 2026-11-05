import re
OUT='/tmp/w/out98.html'
s=open('/tmp/w/out97_final.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:110])
    s=s.replace(old,new)
rep("const BUILD='0.15.0 · 05/11/2026';","const BUILD='0.16.0 · 05/11/2026';")
# 1. quyền giao nhận mẫu cho cán bộ thử nghiệm
rep("title:'Cán bộ thử nghiệm',roles:['tn']}","title:'Cán bộ thử nghiệm, giao nhận mẫu',roles:['tn','tiepnhan']}",6)
rep("['Tiếp nhận, soát xét',ACCOUNTS.filter(a=>!a.roles.some(r=>['tp','pd'].includes(r))&&a.roles.some(r=>['tiepnhan','sx'].includes(r)))],['Cán bộ thử nghiệm',ACCOUNTS.filter(a=>a.roles.length===1&&a.roles[0]==='tn')]",
    "['Tiếp nhận, soát xét',ACCOUNTS.filter(a=>!a.roles.some(r=>['tp','pd','tn'].includes(r))&&a.roles.some(r=>['tiepnhan','sx'].includes(r)))],['Cán bộ thử nghiệm, giao nhận mẫu',ACCOUNTS.filter(a=>a.roles.includes('tn')&&!a.roles.some(r=>['tp','pd'].includes(r)))]")
# 2. trang cũ thành hàm
a=s.index("pages['thanh-toan']={render(root){\n  const canEdit=hasRole('kt')||hasRole('tp');\n  const list=S.samples.filter(s=>s.status==='da_phat_hanh')")
b=s.index("\n/* ---- tra cứu phiếu (QR) */")
old=s[a:b]
assert old.rstrip().endswith("},update(){const a=document.activeElement;if(a&&a.closest&&a.closest('.pay')&&/INPUT|SELECT/.test(a.tagName))return;render();}};")
body=old.replace("pages['thanh-toan']={render(root){","function ttOldRender(root){",1)
body=body.rstrip()[:-len("},update(){const a=document.activeElement;if(a&&a.closest&&a.closest('.pay')&&/INPUT|SELECT/.test(a.tagName))return;render();}};")]+"}\n"
assert body.count("root.append(pageHead('Thanh toán',")==1
body=body.replace("root.append(pageHead('Thanh toán',","root.append(ttSubHead(null,",1)
bk=open('/tmp/w/p/bk7.js',encoding='utf8').read()
s=s[:a]+body+bk+s[b:]
# 3. nav, config, boot
rep("{k:'thanh-toan',t:'Thanh toán',show:()=>hasRole('kt')||hasRole('tp'),count:()=>S.samples.filter(x=>x.status==='da_phat_hanh'&&(!x.tt||x.tt.thanh_toan!=='da')).length}",
    "{k:'thanh-toan',t:'Thanh toán',show:()=>hasRole('kt')||hasRole('tp'),count:()=>bkAll().filter(b=>['nhap','da_gui'].includes(b.trang_thai)).length+bkPendingGroups().length}")
rep("S.perCfg=list.find(x=>x.id==='periods')||null;","S.perCfg=list.find(x=>x.id==='periods')||null;S.bgia=((list.find(x=>x.id==='bang_gia')||{}).gia)||{};")
rep("  syncSampleWatchers();\n  Data.watch('audit'","  syncSampleWatchers();bkWatchInit();\n  Data.watch('audit'")
rep("@media print{.topbar,.tabbar,.sheet,.side{display:none!important}}","@media print{.topbar,.tabbar,.sheet,.side{display:none!important}}.bk-print{display:none}@media print{html.printing-bk body>*:not(.bk-print){display:none!important}html.printing-bk .bk-print{display:block!important}}")
rep("window.__ptn={","window.__ptn={S,bkLines,bkTotals,docSo,bkXlsx,bkDraftFrom,bkSave,ycGroups,BK,BKS,bkAll,bkDelta,bkPendingGroups,bkTam,")
row=""" ['05/11/2026','B8','Claude','Cán bộ thử nghiệm được thêm quyền giao nhận mẫu (tab Nhận mẫu). Tab Thanh toán thiết kế lại thành Bảng kê thanh toán: mỗi phiếu yêu cầu (hoặc nhiều phiếu cùng khách) một bảng kê gồm Tên khách hàng, Tên công trình, bảng TT, tên mẫu, số lượng, đơn giá, thành tiền; dưới tổng cộng có chiết khấu theo % hoặc số tiền; số bảng kê BK<yy>.<mm>.<dd>.<STT> theo ngày tạo phiếu (sửa được); mẫu chưa hoàn thành vẫn lập được (tạm tính, in rõ trên bảng kê); bảng giá theo loại mẫu; tải Excel có công thức, in, soạn nội dung gửi khách; trạng thái nháp, đã gửi, đã thanh toán, hủy. Trang phiếu kết quả và bản giấy cũ chuyển thành tab con','Chờ thử','Bảng kê lưu ở bộ sưu tập bangke_<năm>; chưa chạy trên CSDL thật; chưa có VAT; phiếu quá 90 ngày đã lưu giữ không còn hiện để lập bảng kê mới'],
"""
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
open(OUT,'w',encoding='utf8').write(s);print(len(s))
