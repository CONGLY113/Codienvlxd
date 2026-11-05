import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
JS=r"""(async()=>{const P=window.__ptn;const out=[];
 const codes=['CAT_XD','DA_5_20'].concat(Object.keys(P.GT).filter(c=>c!=='CAT_XD'&&c!=='DA_5_20'));
 for(const c of codes){const g=P.GT[c];let b=null;
  if(c==='CAT_XD')b='T';else if(c==='DA_5_20')b='D';else b=g.b64();
  out.push([c,b==='T'||b==='D'?b:b.length]);}
 return out;})()"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page()
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        print(json.dumps(await page.evaluate(JS),ensure_ascii=False))
        await br.close()
asyncio.run(main())
