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
        side=lambda: ev("()=>[...document.querySelectorAll('.side nav a, .side nav button, .side .nav-item')].map(x=>x.innerText.trim()).join('|')")
        for room in ['kd','co']:
            await ev("([id,r])=>{window.__ptn.setSession(id);window.__ptn.setWroom(r);location.hash='thong-bao'}",['NS018',room]);await page.wait_for_timeout(300)
            await ev("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(500)
            t=await ev("()=>document.querySelector('.side').innerText")
            chk('Bảng kê và báo giá' in t,'Giàn thấy Bảng kê và báo giá (%s)'%room)
            chk(('Thanh toán' in t)==(room=='co'),'Giàn thấy mục Thanh toán cũ chỉ ở phòng Cơ điện (%s)'%room)
            for bd in ['Thiết bị','Sửa đổi phiếu','Soát xét','Hồ sơ lưu trữ','Giao việc','Cài đặt','Nhận mẫu']:
                chk(bd not in t,'Giàn không thấy %s (%s)'%(bd,room))
        await ev("()=>{location.hash='thiet-bi'}");await page.wait_for_timeout(300)
        chk(await ev("()=>location.hash")=='#tong-quan','vào thẳng #thiet-bi bị chuyển về tổng quan')
        await ev("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(300)
        chk(await ev("()=>location.hash")=='#tong-quan','vào thẳng #sua-phieu bị chuyển')
        await ev("()=>{location.hash='soat-xet'}");await page.wait_for_timeout(300)
        chk(await ev("()=>location.hash")=='#tong-quan','vào thẳng #soat-xet bị chuyển')
        await ev("()=>window.__ptn.setWroom('co')");await ev("()=>{location.hash='thanh-toan'}");await page.wait_for_timeout(400)
        chk(await ev("()=>location.hash")=='#thanh-toan','Giàn vào được Thanh toán')
        chk(await ev("()=>!document.querySelector('[data-act=wf-duyet],[data-act=bk-new],[data-act=wf-soat]')"),'không có nút thao tác ở Thanh toán')
        await ev("()=>{window.__ptn.setWroom('kd');location.hash='dich-vu'}");await page.wait_for_timeout(500)
        chk(await ev("()=>!document.querySelector('[data-act=dv-new]')"),'không có nút lập bảng kê')
        chk(await ev("()=>document.body.innerText.includes('Tổng hợp thanh toán')"),'thấy tab Tổng hợp thanh toán')
        chk(await ev("()=>!window.__ptn.hasRole||(!window.__ptn.hasRole('pd')&&!window.__ptn.hasRole('sx'))"),'không có quyền pd/sx')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
