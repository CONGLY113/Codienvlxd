import asyncio, http.server, threading, functools
from playwright.async_api import async_playwright
src=open('/tmp/fb/test_fb.py',encoding='utf8').read().split('async def main')[0]
exec(src)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',8766),functools.partial(Q,directory='/tmp/fb/public'));threading.Thread(target=srv.serve_forever,daemon=True).start()
CFG="window.FIREBASE_CONFIG={apiKey:'k',projectId:'p'};window.FIREBASE_LOGIN={domain:'ptn-vlxd.vn',emails:{NS009:'hcly113@gmail.com'}};"
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        for name,vp in (('d',{'width':1280,'height':800}),('m',{'width':390,'height':800})):
            ctx=await br.new_context(viewport=vp);page=await ctx.new_page()
            async def route(r):
                u=r.request.url
                if 'gstatic.com/firebasejs' in u:
                    body=APP if 'firebase-app' in u else AUTH if 'firebase-auth' in u else FS
                    await r.fulfill(body=body,content_type='application/javascript',headers={'access-control-allow-origin':'*'})
                elif 'firebase-config.js' in u: await r.fulfill(body=CFG,content_type='application/javascript')
                elif 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
                elif u.startswith('http://127.0.0.1') or u.startswith('http://localhost'): await r.continue_()
                else: await r.fulfill(body='',content_type='application/javascript')
            await page.route('**/*',route)
            await page.goto('http://127.0.0.1:8766/index.html');await page.wait_for_selector('.acc')
            await page.locator('.acc',has_text='Hoàng Công Lý').click();await page.wait_for_selector('#fb-pw');await page.wait_for_timeout(400)
            await page.screenshot(path=f'/tmp/fb/shot_{name}.png')
        await br.close()
asyncio.run(main())
