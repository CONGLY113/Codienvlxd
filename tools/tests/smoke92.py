import asyncio, json, sys, re
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
pages=re.findall(r"^pages\['([a-z0-9-]+)'\]",open(HTML,encoding='utf8').read(),re.M)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context(viewport={'width':1300,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        r=await page.evaluate(open('/tmp/w/scen92.js',encoding='utf8').read())
        for acc in ['NS009','NS011','NS004']:
            await page.evaluate("(a)=>window.__ptn.setSession(a)",acc); await page.wait_for_timeout(200)
            for p in pages:
                if p in ('nhap-so-lieu',): continue
                n0=len(errs)
                await page.evaluate("(p)=>{location.hash=p;}",p); await page.wait_for_timeout(250)
                if len(errs)>n0: print(acc,p,errs[n0:])
        print('pages',len(pages),'ERRORS',errs or 'none'); await br.close()
asyncio.run(main())
