# Phiếu yêu cầu chung trong tháng cho nén bê tông/vữa và đo K; kế toán không có Hồ sơ lưu trữ
import asyncio,sys
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
        page=await (await br.new_context(viewport={'width':1200,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a','2612a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        r=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');await new Promise(r=>setTimeout(r,300));
          const a=await P.monthlyYc('DO_K_DV','2026-11-03'),b=await P.monthlyYc('DO_K_PR','2026-11-17'),a2=await P.monthlyYc('DO_K_DV','2026-11-25'),
            n1=await P.monthlyYc('NEN_BT','2026-11-05'),n2=await P.monthlyYc('NEN_VUA','2026-11-20'),d=await P.monthlyYc('DO_K_DV','2026-12-02'),n3=await P.monthlyYc('NEN_BT','2026-12-04');
          return {a,b,a2,n1,n2,d,n3,g:P.YC_MONTH}}""")
        print(r)
        chk(r['a']==r['b']==r['a2'] and r['a'].startswith('YC26.11.03.'),'đo K dao vòng và phễu rót cát chung một phiếu yêu cầu trong tháng')
        chk(r['n1']==r['n2'] and r['n1']!=r['a'],'nén bê tông và vữa chung phiếu của tháng, tách khỏi đo K')
        chk(r['d']!=r['a'] and r['d'].startswith('YC26.12.02.'),'qua tháng mới tạo phiếu yêu cầu mới')
        chk(r['n3']!=r['n1'] and r['n3'].startswith('YC26.12.04.'),'nén sang tháng mới có phiếu mới')
        for who,has in [('NS009',True),('NS002',True),('NS010',True),('NS013',False),('NS012',False),('NS018',False),('NS011',True)]:
            await page.evaluate("(w)=>{window.__ptn.setSession(w);window.__ptn.setWroom('co');location.hash='thong-bao'}",who);await page.wait_for_timeout(300);await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(400)
            n=await page.locator('.nav [data-k="luu-tru"]').count()
            chk((n==1)==has,'%s Hồ sơ lưu trữ %s'%(who,n))
        chk(not errs,'lỗi %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
