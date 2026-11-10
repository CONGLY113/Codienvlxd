# 0.28.8: nhựa 60/70 – tính từ nhật ký quan trắc, so với kết quả file mẫu
import asyncio,sys,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
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
        r=await page.evaluate("""()=>{const G=window.__ptn.GT&&window.__ptn.GT.NHUA_6070;if(!G)return {noGT:1};
          const d={kim_11:63,kim_12:64,kim_13:62,kim_21:65,kim_22:63,kim_23:64,kd_1:110,kd_2:108,kd_3:112,hm_o1:49,hm_n1:0.1,hm_o2:49.5,hm_n2:0.1,cc_K:101.3,cc_o:270,tk_1:58,tk_2:59,tk_3:57,tt_a1:100,tt_b1:99.8,tt_k1:50,tt_a2:100,tt_b2:99.78,tt_k2:50,kr_A1:30,kr_B1:80,kr_C1:55,kr_D1:80.5,kr_T1:25,kr_A2:30,kr_B2:80,kr_C2:55.1,kr_D2:80.55,kr_T2:25,db_1:4,db_2:4,db_kl:4};
          const rc=G.rc(d);return {n:rc.n,bad:rc.bad,rc:rc.v||rc,need:G.need(d),total:G.total(),valid:G.valid(d,rc),secs:G.sections(d).map(x=>x.live(d)&&x.live(d).slice(1,3).join('|')),warn:G.verify(Object.assign({},d,{kim_11:50,kim_12:70,kim_tol:4})).filter(x=>x.state==='warn').length,map:Object.keys(G.map).length,v:G.detail.calc(d).R}}""")
        print(json.dumps(r,ensure_ascii=False)[:900])
        chk('noGT' not in r,'GT chưa lộ ra __ptn')
        chk(not errs,'pageerror %s'%errs)
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
