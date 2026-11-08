import asyncio, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,m):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',m)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context(viewport={'width':1280,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        ev=page.evaluate
        # B3 phiếu nhận mẫu
        txt=await ev("""()=>{const P=window.__ptn;const s={ma_mau:'M.26.11.001',so_yc:'YC.1',khach:{ten:'Cty ABC',lien_he:'Nguyễn A',dien_thoai:'090'},du_an:{cong_trinh:'Đường X',thi_cong:'Nhà thầu Y',giam_sat:'TVGS Z'},mau:{ten:'Cát xây dựng',nguon_goc:'Mỏ K',so_luong:2,ngay_lay:'2026-11-05',ngay_nhan:'2026-11-07'},han_tra:'2026-11-12',chi_tieu:['CAT_01']};
          const box=P.nmPrintBox({so_yc:'YC.1',khach:s.khach,du_an:s.du_an,ngay:'2026-11-07',nguoi_nhan:'Hồ Thị B',items:[P.nmPackFromSample(s)]});return box.innerText}""")
        chk('PHIẾU NHẬN MẪU' in txt and 'Cty ABC' in txt and 'Đường X' in txt and 'M.26.11.001' in txt,'nội dung phiếu nhận mẫu')
        chk('Người nhận mẫu' in txt and 'Đại diện khách hàng' in txt and 'Hồ Thị B' in txt,'hai khối ký')
        chk('Hàm lượng bùn' in txt,'chỉ tiêu')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
