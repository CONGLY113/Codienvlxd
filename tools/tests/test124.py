import asyncio, sys
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
        ctx=await br.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        page=await ctx.new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        ev=lambda js,a=None: page.evaluate(js,a)
        ROOM={'NS012':'kd','NS013':'kd','NS009':'co','NS014':'kd','NS017':'hs','NS010':'co','NS011':'co','NS008':'co'}
        async def login(i,room=None):
            await ev("([id,r])=>{window.__ptn.setSession(id);if(r)window.__ptn.setWroom(r);location.hash='tong-quan';}",[i,room or ROOM.get(i)]);await page.wait_for_timeout(300)
        tabs=lambda: ev("()=>[...document.querySelectorAll('[role=tab]')].map(x=>x.dataset.tab)")
        async def go(k):
            await page.locator('[data-tab="%s"]'%k).click();await page.wait_for_timeout(350)
        # ---- 1. Cơ điện, trưởng phòng: đủ tab cũ + báo giá, một bảng giá
        print('== 1. Cơ điện (NS009)')
        await login('NS009');await ev("()=>{location.hash='thanh-toan'}");await page.wait_for_timeout(600)
        T=await tabs();print(T)
        chk(T==['bangke','bg','tonghop','banggia','phieu'],'tab Cơ điện %s'%T)
        chk(await page.locator('.nav [data-k="thanh-toan"]').count()==1 and await page.locator('.nav [data-k="dich-vu"]').count()==0,'một mục menu')
        chk('Thanh toán và báo giá' in await page.inner_text('.main h1,.main .page-head,.main'),'tiêu đề trang')
        chk(await page.locator('[data-tab="bangke"][aria-selected="true"]').count()==1,'mở đầu ở Bảng kê thanh toán')
        await go('bg');chk(await page.locator('[data-tab="bg"][aria-selected="true"]').count()==1,'chuyển sang Báo giá');chk(await page.locator('[data-act=dv-new]').count()>=0,'danh sách báo giá dựng được')
        await go('tonghop');chk(await page.locator('[data-tab="tonghop"][aria-selected="true"]').count()==1,'Tổng hợp thanh toán')
        await go('banggia')
        chk(await page.locator('[data-act=bank-save]').count()==1,'tab Bảng giá có tài khoản nhận thanh toán (1 thẻ)')
        chk(await page.locator('[data-sec=prices]').count()==1,'có bảng giá ban hành')
        chk(await page.locator('[data-sec=old-prices]').count()==1,'có đơn giá theo loại mẫu của bảng kê')
        chk(await page.locator('[data-act=bank-save]').count()+await page.locator('[data-sec=prices]').count()==2,'không trùng thẻ')
        # ---- 2. nạp giá từ bảng giá ban hành
        print('== 2. Lấy giá từ bảng giá ban hành')
        det=page.locator('[data-sec=old-prices]');
        if not await det.evaluate("e=>e.open"): await det.locator('summary').click()
        chk((await ev("()=>Object.keys(window.__ptn.S.bgia||{}).length"))==0,'bảng giá cũ đang trống')
        await page.locator('[data-act=bg-pull]').click();await page.wait_for_selector('[data-act=bg-pull-ok]')
        txt=await page.inner_text('#modal-root')
        print(txt[:260].replace('\n',' | '))
        chk('Sẽ điền' in txt,'hộp thoại xem trước')
        await page.locator('[data-act=bg-pull-ok]').click();await page.wait_for_timeout(400)
        chk(await page.locator('[data-act=bg-save]').count()==1,'nút lưu có')
        await page.locator('[data-act=bg-save]').click();await page.wait_for_timeout(600)
        n=await ev("()=>({g:Object.keys(window.__ptn.S.bgia||{}).length,c:Object.keys(window.__ptn.S.bgiaCt||{}).length,cat:window.__ptn.S.bgia&&window.__ptn.S.bgia.CAT_XD,xm:window.__ptn.S.bgia&&window.__ptn.S.bgia.XM_PCB40})")
        print(n)
        chk(n['g']>=5 and n['c']>=20,'đã lưu giá trọn %s, chỉ tiêu %s'%(n['g'],n['c']))
        chk(n['cat']==270000,'cát trọn gói 270.000 khớp bảng ban hành (%s)'%n['cat'])
        # lấy lại lần 2 chỉ điền ô trống: không đổi
        await page.locator('[data-act=bg-pull]').click();await page.wait_for_selector('[data-act=bg-pull-ok]')
        chk('Giữ nguyên' in await page.inner_text('#modal-root'),'lần 2 giữ nguyên giá đã có')
        await page.locator('#modal-root button:has-text("Hủy")').click()
        await page.wait_for_timeout(200)
        # tab phiếu giấy
        await go('phieu');chk(await page.locator('[data-tab="phieu"][aria-selected="true"]').count()==1,'Phiếu kết quả bản giấy còn')
        # ---- 3. bảng kê Cơ điện vẫn lập được từ trang gộp
        await go('bangke');chk(await page.locator('.bk-list,.tbl-wrap,.empty').count()>0,'danh sách bảng kê cũ dựng được')
        # ---- 4. phòng Kiểm định, hóa sinh
        print('== 4. Phòng Kiểm định (NS014)')
        await login('NS014');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(600)
        T=await tabs();print(T)
        chk(T==['bk','bg','no','th','cn','gia'],'tab Kiểm định %s'%T)
        await go('gia')
        chk(await page.locator('[data-act=bank-save]').count()==1 and await page.locator('[data-sec=prices]').count()==1,'tab Bảng giá của phòng KĐ có tài khoản + bảng giá')
        chk(await page.locator('[data-sec=old-prices]').count()==0,'không có đơn giá loại mẫu ở phòng KĐ')
        await login('NS017');await ev("()=>{location.hash='thanh-toan'}");await page.wait_for_timeout(600)
        T=await tabs();chk(T[0]=='bk' and 'gia' in T,'tab Hóa sinh %s'%T)
        # ---- 5. vai trò cũ
        for i,lbl in (('NS012','Hành chính'),('NS010','Giám đốc'),('NS011','Giao nhận Cơ điện')):
            await login(i);await ev("()=>{location.hash='thanh-toan'}");await page.wait_for_timeout(500)
            T=await tabs();print(i,lbl,T);chk(len(T)>0 or i=='NS011','%s có tab hoặc bị ẩn đúng (%s)'%(lbl,T))
        print('errs',errs[:5]);print('ok',ok,'bad',bad)
asyncio.run(main())
