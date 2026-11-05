import sys,base64,re
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out102.html'
s=open('/tmp/w/out101.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:120])
    s=s.replace(old,new)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
rep("const BUILD='0.19.0 · 05/11/2026';","const BUILD='0.20.0 · 05/11/2026';")
# 1. số bảng kê BKVL
rep("pre='BK'+yy+'.'+mm+'.'+dd+'.';","pre='BKVL'+yy+'.'+mm+'.'+dd+'.';")
# 2. logo, đăng nhập
js=open('/tmp/w/p/login.js',encoding='utf8').read().replace('@@L@@',b64('/tmp/w/logo320.webp')).replace('@@S@@',b64('/tmp/w/logo72.webp'))
a=s.index("/* ---- login */");b=s.index("function defaultPage()")
s=s[:a]+js+s[b:]
rep("h('div',{class:'brand-mark'},icon('sand'))","logoMark()",4)
rep("h('span',null,'Mẫu cát · '+BUILD)","h('span',null,'Quảng Trị · '+BUILD)")
css=open('/tmp/w/p/login.css',encoding='utf8').read()
k=s.index("/* phieu */\n.phieu{");s=s[:k]+css+"\n"+s[k:]
# 3. logo trên bản in bảng kê
rep("style:'font-family:\"Times New Roman\",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},\n    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG')",
    "style:'position:relative;font-family:\"Times New Roman\",serif;font-size:13px;color:#000;background:#fff;padding:12mm 14mm'},\n    h('img',{src:LOGO_L,alt:LOGO_ALT,width:76,height:76,style:'position:absolute;left:14mm;top:11mm;width:19mm;height:19mm'}),\n    h('div',{style:'text-align:center;font-weight:bold'},'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG')")
# 4. nhật ký
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B13','Claude','Nạp bảng đơn giá thí nghiệm do phòng gửi (31 loại mẫu có giá trọn, 4 chỉ tiêu có giá) vào hệ thống. Số bảng kê có ký hiệu VL: BKVL26.11.05.1. Thêm logo Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng Quảng Trị (nền trong suốt) vào trang đăng nhập, thanh bên, thanh trên điện thoại, cổng khách hàng, trang tra cứu và bản in bảng kê. Thiết kế lại trang đăng nhập theo phong cách 2026: nền gradient aurora, kính mờ, thẻ bento các bước nghiệp vụ, thẻ chọn tài khoản có ô tìm kiếm, ảnh đại diện chữ cái','Chờ thử','Số bảng kê cũ dạng BK26... giữ nguyên, bảng kê mới dùng BKVL; đơn giá nạp từ file ngày 05/11/2026'],
""")
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
