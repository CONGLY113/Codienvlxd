#!/usr/bin/env python3
"""0.28.9: xuất file mẫu của mọi loại mẫu đúng như hệ thống đang sinh phiếu Phieu_KQ (bản gốc, chưa áp bố cục đã nạp).
Dùng: python3 tools/export_demo_templates.py app/quan-ly-mau-thu-nghiem.html thu_muc_dau_ra
Cần playwright, jszip (đường dẫn /opt/npm-tools/node_modules/jszip) và harness /tmp/w/test80.py như các test khác."""
import asyncio,sys,base64,os
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=os.path.abspath(sys.argv[1]);OUT=sys.argv[2];os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page()
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        codes=await page.evaluate("()=>window.__ptn.mauCodes2()")
        for c in codes:
            r=await page.evaluate("""async c=>{const P=window.__ptn;const u=await P.mauDemo(c,{off:true});let o='';for(let i=0;i<u.length;i+=8192)o+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return {f:P.mauFile(c,'goc'),b:btoa(o)}}""",c)
            open(os.path.join(OUT,r['f']),'wb').write(base64.b64decode(r['b']));print(r['f'])
        await br.close()
asyncio.run(main())
