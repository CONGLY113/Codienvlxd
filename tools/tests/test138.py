# 0.28.7: cấp số đồng thời (10 người) không trùng; ghi chi tiết gộp theo trường
import asyncio,sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
PATCH="""(()=>{const u=window.claude.use;window.claude.use=async n=>{const d=await u(n);if(n!=='db')return d;
  const doc=d.doc;return {collection:d.collection,doc:p=>{const o=doc(p);o.incr=min=>{window.__mx=(window.__mx||Promise.resolve()).then(async()=>{const S=window.__fake.store;await new Promise(r=>setTimeout(r,Math.random()*20));
    const c=S.get(p),n0=c?(c.n||0):0,nn=Math.max(n0,min||0)+1;S.set(p,{n:nn});return nn;});return window.__mx;};return o;}};};})();"""
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
        await page.add_init_script(PATCH)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        r=await page.evaluate("""async()=>{
          const N=window.__ptn;
          const res=await Promise.all(Array.from({length:10},()=>N.nextSeq('bc261110',0)));
          const r2=await N.nextSeq('bc261110',20);
          const codes=await Promise.all(Array.from({length:10},()=>N.makeCode('mau','2026-11-05','CAT_XD')));
          return {res,r2,codes};}""")
        s=sorted(r['res']);chk(s==list(range(1,11)),'10 số khác nhau liên tiếp %s'%s);chk(r['r2']==21,'tôn trọng existingMax %s'%r['r2'])
        chk(len(set(r['codes']))==10,'10 mã mẫu khác nhau %s'%r['codes']);chk(not errs,'pageerror %s'%errs)
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
