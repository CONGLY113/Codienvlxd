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
        r=await ev("""()=>{const P=window.__ptn;const b={so:'BK.1',khach:{ten:'Cty A'},cong_trinh:'CT',ngay:'2026-11-01',trang_thai:'da_duyet',dong:[],pay:[
          {id:'a',so_tien:300000,ht:'tm',tt:'da_xn',ngay_xn:'2026-11-02'},{id:'b',so_tien:200000,ht:'kc',tt:'da_xn',ngay_xn:'2026-11-03'}]};
          const T=P.bkTotals(b).tt;b.ghep=1;const p=P.bkPay(b);return {T,da:p.da,kc:p.kc}}""")
        chk(r['kc']==200000 and r['da']==500000,'bkPay kc %s'%r)
        chk('kc' in await ev("()=>JSON.stringify(window.__ptn.bkPay({dong:[],pay:[]}))"),'bkPay có kc')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
