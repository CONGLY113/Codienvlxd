# 0.28.8: tải lên file So_lieu điền sẵn của nhựa (đã tính lại bằng LibreOffice) -> hệ thống phân tích
import asyncio,sys,base64,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML,XL,CODE=sys.argv[1],sys.argv[2],sys.argv[3]
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        b=base64.b64encode(open(XL,'rb').read()).decode()
        r=await page.evaluate("""async([b,code])=>{const u8=Uint8Array.from(atob(b),c=>c.charCodeAt(0));
          const s={ma_mau:'MAU-T1',so_yc:'YC-T1',mau:{loai:code,ngay_nhan:'2026-11-09'},giao:{ma_nv:'NV01'}};
          const r=await window.__ptn.analyzeUpload(s,u8);return {ok:r.ok,checks:(r.checks||[]).map(c=>c.state+' | '+c.label+' | '+(c.note||''))};}""",[b,CODE])
        print(json.dumps(r,ensure_ascii=False,indent=0)[:3000]);print('errs',errs)
        await br.close()
asyncio.run(main())
