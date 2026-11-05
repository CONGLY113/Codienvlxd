import asyncio,sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(args=['--no-sandbox'])
        for name,vp in [('t',{'width':820,'height':1100}),('s',{'width':1280,'height':640}),('w',{'width':1920,'height':1080})]:
            ctx=await br.new_context(viewport=vp,device_scale_factor=1);page=await ctx.new_page()
            async def route(r):
                u=r.request.url
                if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
                elif u.startswith('file://'): await r.continue_()
                else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
            await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file:///tmp/w/out104.html')
            await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
            await page.evaluate("()=>{location.hash='dang-nhap'}");await page.wait_for_timeout(1200)
            await page.screenshot(path='/tmp/w/lg4_%s.png'%name);await ctx.close()
asyncio.run(main())
