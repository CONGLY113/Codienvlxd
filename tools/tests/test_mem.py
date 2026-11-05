import asyncio, json, sys
from playwright.async_api import async_playwright
HTML=sys.argv[1]; JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
JS=r"""(async()=>{const P=window.__ptn,out={};const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 P.setSession('NS009');await sleep(200);
 const id=P.newSid();await P.Data.set(P.sp(id),{status:'da_giao',ma_mau:'M1',khach:{ten:'K'},du_an:{cong_trinh:'C'},mau:{loai:'CAT_XD',ngay_nhan:'2026-11-03'},chi_tieu:[],giao:{ma_nv:'NS004'}});
 await P.audit({id,ma_mau:'M1'},'Tiếp nhận mẫu','t');await P.audit({id,ma_mau:'M1'},'Giao','t2');
 await sleep(200);const s=P.S.samples.find(x=>x.id===id);const d=await P.Data.get(P.dp(id));
 out.found=!!s;out.lastAction=s&&s.last_action;out.logLen=(d.log||[]).length;out.db=P.db;out.cols=Object.keys(JSON.parse(localStorage.getItem('ptn_local_v1')||'{}'));
 location.hash='#tong-quan';await sleep(300);out.page=document.body.innerText.includes('Hoạt động gần đây');return out;})()"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='application/javascript')
        await page.route('**/*',route);await page.goto('file://'+HTML);await page.wait_for_function('window.__ptn',timeout=10000)
        print(json.dumps(await page.evaluate(JS),ensure_ascii=False),errs or 'no errors');await br.close()
asyncio.run(main())
