import asyncio,sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(args=['--no-sandbox'])
        for name,vp in [('d',{'width':1366,'height':800}),('m',{'width':390,'height':780})]:
            ctx=await br.new_context(viewport=vp,device_scale_factor=1);page=await ctx.new_page();errs=[]
            page.on('pageerror',lambda e:errs.append(str(e)))
            async def route(r):
                u=r.request.url
                if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
                elif u.startswith('file://'): await r.continue_()
                else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
            await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
            await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
            await page.evaluate("()=>{location.hash='dang-nhap'}");await page.wait_for_timeout(600)
            await page.evaluate("()=>{location.hash='khach-hang'}");await page.wait_for_timeout(900)
            await page.screenshot(path='/tmp/w/sh_%s.png'%name);print(name,errs)
            if name=='d':
                for h in ['khach-hang']:
                    await page.evaluate("(h)=>{SESSION=null;}",h) if False else None
            await ctx.close()
asyncio.run(main())
