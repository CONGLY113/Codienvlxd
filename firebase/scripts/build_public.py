#!/usr/bin/env python3
"""Tạo public/index.html từ file web app gốc.
Dùng:  python3 scripts/build_public.py ../app/quan-ly-mau-thu-nghiem.html
- chèn firebase-config.js và fb-shim.js vào đầu trang
- cho web app chỉ khởi động sau khi đăng nhập Firebase xong
"""
import re, sys, pathlib
src = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '../app/quan-ly-mau-thu-nghiem.html')
out = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'index.html'
s = src.read_text(encoding='utf8')
head = '<script src="firebase-config.js"></script>\n<script src="fb-shim.js"></script>\n'
i = s.index('<script')               # script đầu tiên (JSZip)
s = s[:i] + head + s[i:]
pat = re.compile(r'\nboot\(\);\n\}\)\(\);\n</script>')
assert len(pat.findall(s)) == 1, 'Không tìm thấy lệnh boot() ở cuối web app'
s = pat.sub('\n(window.__fbReady||Promise.resolve()).then(boot);\n})();\n</script>', s)
pwa = ('<link rel="manifest" href="manifest.webmanifest">'
       '<link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32.png">'
       '<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
       '<meta name="theme-color" content="#0f5c66">'
       '<meta name="mobile-web-app-capable" content="yes">'
       '<meta name="apple-mobile-web-app-capable" content="yes">'
       '<meta name="apple-mobile-web-app-title" content="Mẫu thử nghiệm">'
       '<meta name="apple-mobile-web-app-status-bar-style" content="default">'
       '<script>if("serviceWorker"in navigator)addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){})})</script>')
assert s.count('<head>') == 1
s = s.replace('<head>', '<head>' + pwa, 1)
out.write_text(s, encoding='utf8')
print('Đã tạo', out, len(s), 'ký tự')
