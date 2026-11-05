import sys,re
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out103.html'
s=open('/tmp/w/out102.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:120])
    s=s.replace(old,new)
rd=lambda p:open('/tmp/w/p/'+p,encoding='utf8').read()
rep("const BUILD='0.20.0 · 05/11/2026';","const BUILD='0.21.1 · 05/11/2026';")
# 1. activeTemplateB64 -> bộ hàm mới
rep("function activeTemplateB64(){return S.mau&&S.mau.b64?S.mau.b64:TEMPLATE_B64;}","/* activeTemplateB64 chuyển xuống khối 0.21.0 */")
# 2. validateTemplate chung
a=s.index("async function validateTemplate(u8){");b=s.index("function lineOpts(xml,o)")
s=s[:a]+rd('mau_core.js')+rd('mau_valid.js')+s[b:]
# 3. buildTemplate dùng bản đang dùng theo loại
rep("JSZip.loadAsync(b64ToU8(gt(sample)?gt(sample).b64():(loaiOf(sample)==='DA_5_20'?DA_B64:activeTemplateB64())))","JSZip.loadAsync(b64ToU8(activeB64(loaiOf(sample))))")
# 4. trang Biểu mẫu báo cáo
a=s.index("async function mauSave(patch)");b=s.index("/* ---- settings */")
s=s[:a]+rd('mau_ui.js')+"\n"+s[b:]
# 5. quyền xem tab
rep("{k:'mau-bieu',t:'Biểu mẫu báo cáo',show:()=>hasRole('tp')||hasRole('ql')}","{k:'mau-bieu',t:'Biểu mẫu báo cáo',show:()=>hasRole('tp')||hasRole('ql')||hasRole('tn')}")
# 6. theo dõi dữ liệu
rep("S.mau=list.find(x=>x.id==='mau_kq')||null;","S.mau=list.find(x=>x.id==='mau_kq')||null;S.mauf={};list.forEach(x=>{if(/^mauf_/.test(x.id))S.mauf[x.id.slice(5)]=x;});")
rep("  Data.watch('errors',list=>{S.errors=list;schedule();});","  Data.watch('errors',list=>{S.errors=list;schedule();});\n  Data.watch('mauh',list=>{S.mauh=list;schedule();});")
rep("window.__ptn={S,","window.__ptn={mauApply,mauDiff,validateTemplate,origB64,activeB64,mauOv,mauCodes,mauBytes,S,")
# 7. nhật ký build
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B15','Claude','Sửa lỗi kiểm tra khi nạp biểu mẫu đã lưu lại bằng Excel: hệ thống so công thức dạng chữ thô nên dấu nháy kép Excel ghi khác file gốc (&quot; so với "), báo oan là sửa công thức sheet So_lieu, Kiem_tra, _HeThong. Nay giải mã đúng như Excel, bỏ qua khác biệt khoảng trắng/xuống dòng, bỏ cảnh báo font tên người ký (Excel tự xóa font không dùng, hệ thống tự thêm lại khi tải). Thử đạt trên cả 31 loại ở dạng Excel lưu lại có đổi chiều cao hàng và nét biểu đồ','Chờ thử','Chỉ sửa bộ kiểm tra, không đổi dữ liệu'],
['05/11/2026','B14','Claude','Tab Biểu mẫu báo cáo làm lại: liệt kê biểu mẫu gốc của cả 31 loại mẫu, mỗi dòng có Tải bản đang dùng, Tải bản gốc, Nạp bản chỉnh, Lịch sử, Dùng lại bản gốc; tải tất cả bản đang dùng/bản gốc dạng zip. Kiểm tra bản nạp theo biểu mẫu gốc của đúng loại (sheet, tên vùng, công thức, lề A4, biểu đồ); chỉ sửa được Phieu_KQ. Mỗi lần nạp bắt buộc ghi nội dung chỉnh sửa, hệ thống tự tóm tắt khác biệt (ô, cột, hàng, biểu đồ, định dạng), ghi lịch sử không xóa được (ai, lúc nào, file, mã băm) và cho khôi phục bản cũ. Cán bộ thử nghiệm được nạp như trưởng phòng và quản lý chất lượng. Phiếu và file Excel tải về dùng bản đang dùng của đúng loại mẫu','Chờ thử','Bản đã nạp bằng cách cũ (chỉ cát) tự hiển thị là bản tùy chỉnh trước 0.21.0'],
""")
# 8. CSS nhỏ
css="""
/* mau-bieu 0.21 */
#mau-q{min-width:220px}
.tbl-wrap td .row .btn.sm{white-space:nowrap}
"""
k=s.index("/* phieu */\n.phieu{");s=s[:k]+css+"\n"+s[k:]

# 9. đọc XML như Excel ghi: giải mã &quot; &lt; ..., chuẩn hóa khoảng trắng khi so sánh
rep("function xesc(s){","const xdec=s=>String(s==null?'':s).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'\"').replace(/&apos;/g,\"'\").replace(/&#x([0-9a-fA-F]+);/g,(m,n)=>String.fromCharCode(parseInt(n,16))).replace(/&#(\\d+);/g,(m,n)=>String.fromCharCode(+n)).replace(/&amp;/g,'&');\nconst xnv=s=>String(s==null?'':s).replace(/_x000D_/g,'').replace(/\\s+/g,' ').trim();\nfunction xesc(s){")
rep(".map(si=>(si.match(/<t[^>]*>[^<]*<\\/t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,'')).join(''));}",".map(si=>xdec((si.match(/<t[^>]*>[^<]*<\\/t>/g)||[]).map(t=>t.replace(/<[^>]+>/g,'')).join('')));}")
rep("else if(is)val=(is[1].match(/<t[^>]*>[^<]*<\\/t>/g)||[]).map(z=>z.replace(/<[^>]+>/g,'')).join('');else if(/\\bt=\"str\"/.test(m[1])&&v&&!fe)val=v[1];","else if(is)val=xdec((is[1].match(/<t[^>]*>[^<]*<\\/t>/g)||[]).map(z=>z.replace(/<[^>]+>/g,'')).join(''));else if(/\\bt=\"str\"/.test(m[1])&&v&&!fe)val=xdec(v[1]);")
rep("f:fe?(fe[1]?fe[1].replace(/\\s/g,''):'*'):null","f:fe?(fe[1]?xdec(fe[1]).replace(/\\s/g,''):'*'):null")
rep("m[2].replace(/\\s/g,'');}return o;}","xdec(m[2]).replace(/\\s/g,'').replace(/'/g,'');}return o;}")
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
