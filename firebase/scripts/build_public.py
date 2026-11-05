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
out.write_text(s, encoding='utf8')
print('Đã tạo', out, len(s), 'ký tự')
