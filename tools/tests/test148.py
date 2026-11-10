# 0.28.11: thanh bên gọn: Thông báo nằm trong Cài đặt, Sửa đổi phiếu nằm trong Hồ sơ lưu trữ; đường dẫn cũ vẫn dùng được
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
        page=await (await br.new_context(viewport={'width':1280,'height':800})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        async def go(sid,h):
            await page.evaluate("(s)=>window.__ptn.setSession(s)",sid);await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("(h)=>{location.hash=h}",h);await page.wait_for_timeout(450)
        INFO="""()=>({nav:[...document.querySelectorAll('.nav a')].map(a=>a.textContent.trim().replace(/\\d+$/,'')+'|'+a.getAttribute('href')+'|'+(a.getAttribute('aria-current')||'')),
           sub:[...document.querySelectorAll('.subtabs a')].map(a=>a.dataset.sub+'|'+a.getAttribute('aria-selected')+'|'+a.textContent.trim()),h1:(document.querySelector('.page-head h1')||{}).textContent||'',hash:location.hash})"""
        # trưởng phòng
        await go('NS009','cai-dat');r=await page.evaluate(INFO);print('tp cai-dat',json.dumps(r,ensure_ascii=False))
        navs=[x.split('|')[0] for x in r['nav']]
        chk('Thông báo' not in navs and 'Sửa đổi phiếu' not in navs,'thanh bên không còn Thông báo / Sửa đổi phiếu: %s'%navs)
        chk('Cài đặt' in navs and 'Hồ sơ lưu trữ' in navs,'còn Cài đặt, Hồ sơ lưu trữ')
        chk(any(x.startswith('Cài đặt|#cai-dat|page') for x in r['nav']),'Cài đặt sáng khi ở Thiết lập')
        chk([x.split('|')[0] for x in r['sub']]==['thong-bao','cai-dat'] and r['sub'][1].split('|')[1]=='true','thẻ con Thông báo | Thiết lập, Thiết lập đang chọn')
        await page.click('.subtabs a[data-sub="thong-bao"]');await page.wait_for_timeout(450);r=await page.evaluate(INFO)
        chk(r['hash']=='#thong-bao' and r['h1']=='Thông báo','bấm thẻ Thông báo mở trang Thông báo: %s %s'%(r['hash'],r['h1']))
        chk(any(x.startswith('Cài đặt|#cai-dat|page') for x in r['nav']),'ở Thông báo thì Cài đặt vẫn sáng')
        await go('NS009','luu-tru');r=await page.evaluate(INFO);print('tp luu-tru',json.dumps(r['sub'],ensure_ascii=False))
        chk([x.split('|')[0] for x in r['sub']]==['luu-tru','sua-phieu'],'Hồ sơ lưu trữ có thẻ Sửa đổi phiếu')
        # bấm đổi tab lưu trữ bên trong rồi thẻ con vẫn còn
        await page.evaluate("()=>{const b=[...document.querySelectorAll('.tabs:not(.subtabs) button')];if(b[1])b[1].click();}");await page.wait_for_timeout(400)
        r=await page.evaluate(INFO);chk(len(r['sub'])==2,'sau khi đổi tab trong Hồ sơ lưu trữ thẻ con vẫn còn')
        await page.click('.subtabs a[data-sub="sua-phieu"]');await page.wait_for_timeout(450);r=await page.evaluate(INFO)
        chk(r['hash']=='#sua-phieu' and any(x.startswith('Hồ sơ lưu trữ|#luu-tru|page') for x in r['nav']),'Sửa đổi phiếu mở được, Hồ sơ lưu trữ sáng: %s'%r['nav'])
        # cán bộ thường: Cài đặt dẫn tới Thông báo, không có Thiết lập
        await go('NS001','tong-quan');r=await page.evaluate(INFO);ci=[x for x in r['nav'] if x.startswith('Cài đặt')]
        chk(ci and ci[0].split('|')[1]=='#thong-bao','cán bộ: Cài đặt dẫn tới #thong-bao: %s'%ci)
        await go('NS001','cai-dat');r=await page.evaluate(INFO)
        chk(r['hash']=='#thong-bao' and r['h1']=='Thông báo','cán bộ gõ #cai-dat được đưa về Thông báo: %s'%r['hash'])
        chk(r['sub']==[],'cán bộ không có thẻ Thiết lập (chỉ một thẻ nên không hiện thanh)')
        await go('NS001','luu-tru');r=await page.evaluate(INFO);chk(len(r['sub'])==2,'cán bộ giao nhận mẫu thấy thẻ Sửa đổi phiếu')
        await go('NS012','thong-bao');r=await page.evaluate(INFO);chk(r['h1']=='Thông báo','thủ quỹ vẫn vào được Thông báo')
        # điện thoại
        await page.set_viewport_size({'width':390,'height':800});await go('NS009','tong-quan')
        sh=await page.evaluate("()=>[...document.querySelectorAll('.sheet-list a')].map(a=>a.textContent.trim().replace(/\\d+$/,''))")
        chk('Thông báo' not in sh and 'Sửa đổi phiếu' not in sh and 'Cài đặt' in sh,'menu điện thoại gọn: %s'%sh)
        chk(not errs,'lỗi console: %s'%errs[:2])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
