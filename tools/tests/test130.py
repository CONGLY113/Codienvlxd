# D3: lấy giá cho nén bê tông, nén vữa, đo K từ bảng giá ban hành; D2: tên mẫu ở Việc của bạn
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
          const pl=P.ttPullPlan({gia:{},ct:{}},false);
          const l=(k,loai)=>({k,loai,tay:false});
          return {bt:P.ttUnitBookPrice('NEN_BT'),vua:P.ttUnitBookPrice('NEN_VUA'),kdv:P.ttUnitBookPrice('DO_K_DV'),kpr:P.ttUnitBookPrice('DO_K_PR'),cat:P.ttUnitBookPrice('CAT_XD'),
            pf:P.bkPriceFor(l('a','NEN_BT')),plan:pl.gia.filter(x=>['NEN_BT','NEN_VUA','DO_K_DV','DO_K_PR'].includes(x[0])).map(x=>x[0]+':'+x[1]),miss:pl.miss}}""")
        print(r)
        chk(r['bt']==90000 and r['vua']==80000 and r['kdv']==65000 and r['kpr']==65000,'giá nén BT 90.000/tổ, vữa 80.000/tổ, đo K 65.000/điểm')
        chk(r['cat'] is None,'loại không tính theo tổ/điểm không đi theo đường này')
        chk(r['pf']==90000,'nút Lấy lại đơn giá có giá khi bảng giá loại mẫu chưa nhập')
        chk(len(r['plan'])==4,'kế hoạch lấy giá có 4 loại tổ/điểm: %s'%r['plan'])
        chk(not any(x in ' '.join(r['miss']) for x in ['Nén mẫu bê tông','Nén mẫu vữa','Đo K']),'không còn nằm trong danh sách để trống: %s'%r['miss'])
        chk(not errs,'lỗi %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
