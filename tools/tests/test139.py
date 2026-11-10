# 0.28.8: nhựa MC70 – tính từ nhật ký quan trắc, so với kết quả file mẫu
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
        r=await page.evaluate("""()=>{const G=window.__ptn.GT&&window.__ptn.GT.NHUA_MC70;if(!G)return {noGT:1};
          const d={nh_t1:85.5,nh_t2:84.5,cc_K:101.3,cc_o1:45,cc_o2:46,nu_m1:100,nu_v1:0.1,nu_m2:100,nu_v2:0.12,ca_V:200,ca_c1:50,ca_c2:108,ca_c3:155,ca_c4:180,nt_K:2,nt_t1:22,nt_t2:23,kd_1:110,kd_2:108,kd_3:112,ht_m1:2,ht_b1:10,ht_c1:10.01,ht_m2:2,ht_b2:10,ht_c2:10.012,nh_tol:5};
          const rc=G.rc(d);return {n:rc.n,bad:rc.bad,rc:rc.v||rc,need:G.need(d),total:G.total(),valid:G.valid(d,rc),secs:G.sections(d).map(x=>x.live(d)&&x.live(d).slice(1,3).join('|')),warn:G.verify(Object.assign({},d,{nh_t1:80,nh_t2:90,nh_tol:5})).filter(x=>x.state==='warn').length,map:Object.keys(G.map).length,v:G.detail.calc(d).R}}""")
        print(json.dumps(r,ensure_ascii=False)[:900])
        chk('noGT' not in r,'GT chưa lộ ra __ptn')
        chk(not errs,'pageerror %s'%errs)
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
