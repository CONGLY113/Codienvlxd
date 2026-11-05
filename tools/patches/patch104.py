import sys,base64
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out104.html'
s=open('/tmp/w/out103.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:120])
    s=s.replace(old,new)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
rd=lambda p:open('/tmp/w/p/'+p,encoding='utf8').read()
rep("const BUILD='0.21.1 · 05/11/2026';","const BUILD='0.22.0 · 05/11/2026';")
# ảnh nền
rep("const LOGO_ALT=","const LG_BG_L='data:image/webp;base64,"+b64('/tmp/w/bgL.webp')+"';\nconst LG_BG_S='data:image/webp;base64,"+b64('/tmp/w/bgS.webp')+"';\nconst LOGO_ALT=")
# bố cục
a=s.index("  const step=(n,t,d)=>h('div',{class:'lg-step'}");b=s.index("empty)))));\n}};",a)+len("empty)))));\n")
s=s[:a]+rd('login2_ui.js')+s[b:]
# css
a=s.index("/* 0.20.0 đăng nhập */");e=".side .brand-mark.logo{width:42px;height:42px}";b=s.index(e,a)+len(e)
s=s[:a]+rd('login2.css').rstrip('\n')+s[b:]
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B16','Claude','Trang đăng nhập đặt ảnh trụ sở Trung tâm làm hình nền bên trái, phủ lớp mờ chuyển màu để chữ rõ, logo và tên đơn vị ở góc trên, tiêu đề cùng bốn bước nghiệp vụ dạng viên thuốc ở phía dưới; bên phải là thẻ chọn tài khoản. Bỏ dòng mô tả quy trình. Điện thoại: ảnh thành dải đầu trang, thẻ tài khoản bên dưới. Ảnh nhúng hai cỡ (720 và 1448 px) để máy tự chọn','Chờ thử','Ảnh gốc do phòng cung cấp, đã nén WebP'],
""")
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
