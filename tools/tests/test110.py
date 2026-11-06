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
        ROOM={'NS012':'kd','NS013':'kd','NS009':'co'}
        async def login(i):
            await ev("([id,r])=>{window.__ptn.setSession(id);if(r)window.__ptn.setWroom(r);location.hash='tong-quan';}",[i,ROOM.get(i)]);await page.wait_for_timeout(300)
            await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500)
        # --- bảng giá nhúng sẵn
        await login('NS015')
        r=await ev("()=>{const P=window.__ptn;return {k:P.dvBook('kdhc').items.length,a:P.dvBook('atld').items.length,h:P.dvBook('hsmt').items.length,v:P.dvBook('vlxd').items.length,show:P.dvShow()}}")
        chk(r['show'],'NS015 thấy module')
        await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500)
        chk(await page.locator('[data-tab="bk"]').count()==1,'có tab bảng kê')
        chk(await page.locator('[data-tab="gia"]').count()==1,'có tab bảng giá')
        chk(r['k']==241 and r['a']==72 and r['h']==614 and r['v']==176,'bảng giá nhúng %s'%r)
        # --- lập bảng kê qua giao diện
        L=page.locator
        async def go(tab):
            await L('[data-tab="%s"]'%tab).click();await page.wait_for_timeout(250)
        await go('bk')
        await L('[data-act="dv-new"]').click();await page.wait_for_timeout(200)
        await L('[data-act="dv-new-ok"]').click();await page.wait_for_timeout(300)
        await L('input[placeholder="Tên khách hàng hoặc cơ sở"]').fill('Công ty CP Điện Quảng Bình')
        await L('[data-act="dv-pick"]').click();await page.wait_for_timeout(300)
        await L('[data-act="dv-add"]').nth(0).click();await L('[data-act="dv-add"]').nth(1).click()
        await page.keyboard.press('Escape');await page.wait_for_timeout(200)
        d=await ev("()=>JSON.parse(JSON.stringify(window.__ptn.DVS.draft))")
        chk(len(d['dong'])==2,'2 dòng, có %d'%len(d['dong']))
        chk(all(x['khoa'] for x in d['dong']),'giá khóa')
        T=await ev("()=>window.__ptn.dvTotals(window.__ptn.DVS.draft)")
        chk(T['tong']==850000 and T['vat']==0 and T['thue']==0 and T['tt']==850000,'tổng %s'%T)
        # khóa: ô đơn giá bị khóa
        chk(await L('input[aria-label^="Đơn giá dòng"]').count()==0 and await L('[data-act="dv-unlock"]').count()==0,'đơn giá khóa, nhân viên không mở khóa được')
        await page.screenshot(path='/tmp/claude-0/-home-claude/c64f2c08-0025-5f29-8403-f78a9d20d6b8/scratchpad/s_editor.png',full_page=True)
        await L('[data-act="dv-save"]').click();await page.wait_for_timeout(500)
        d=await ev("()=>JSON.parse(JSON.stringify(window.__ptn.DVS.draft))")
        chk(d['so'].startswith('BK.KĐHC.') and d['so'].endswith('.1'),'số %s'%d['so'])
        await L('[data-act="dv-gui"]').click();await page.wait_for_timeout(300)
        await L('.overlay button.primary').last.click();await page.wait_for_timeout(500)
        st=await ev("()=>window.__ptn.dvAllBk().map(b=>b.trang_thai)")
        chk(st==['cho_soat'],'chờ soát xét %s'%st)
        # NS015 không soát xét được
        chk(await L('[data-act="dv-soat"]').count()==0,'nhân viên không có nút soát xét')
        # phòng Hóa sinh không thấy bảng kê phòng Kiểm định
        await login('NS017');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500)
        n=await ev("()=>window.__ptn.dvMine('bk').length");
        rows=await ev("()=>document.querySelectorAll('table tbody tr').length")
        vis=await ev("()=>[...document.querySelectorAll('#app table tbody tr')].map(r=>r.textContent).join('|')")
        chk('BK.KĐHC' not in vis and 'Điện Quảng Bình' not in vis,'P.HS không thấy bảng kê P.KĐ: '+vis[:120])
        # thủ quỹ soát xét
        await login('NS012');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(600)
        chk(await ev("()=>window.__ptn.dvMine('bk').length")==1,'tq có 1 việc')
        await L('[data-act="dv-open"]').first.click();await page.wait_for_timeout(300)
        await L('[data-act="dv-soat"]').click();await page.wait_for_timeout(300)
        await L('.overlay button.primary').last.click();await page.wait_for_timeout(500)
        chk(await ev("()=>window.__ptn.dvAllBk()[0].trang_thai")=='da_soat','đã soát')
        # kế toán trưởng duyệt
        await login('NS013');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(600)
        await L('[data-act="dv-open"]').first.click();await page.wait_for_timeout(300)
        await L('[data-act="dv-duyet"]').click();await page.wait_for_timeout(300)
        await L('.overlay button.primary').last.click();await page.wait_for_timeout(500)
        chk(await ev("()=>window.__ptn.dvAllBk()[0].trang_thai")=='da_duyet','đã duyệt')
        # trưởng phòng KĐ không phải người duyệt bảng kê
        await login('NS014');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await page.wait_for_timeout(300)
        chk(await L('[data-act="dv-duyet"]').count()==0 and await L('[data-act="dv-molai"]').count()==0,'trưởng phòng không duyệt/mở lại bảng kê')
        chk(await L('[data-act="dv-print"]').count()==1,'có nút in sau duyệt')
        # đề nghị thanh toán, thủ quỹ xác nhận
        bid=await ev("()=>window.__ptn.dvAllBk()[0].id")
        await login('NS015')
        await ev("""async()=>{const P=window.__ptn;const b=P.dvAllBk()[0];await P.dvAct(b,'Đề nghị thanh toán','',d=>{d.pay.push({id:'p1',ngay:'2026-11-06',so_tien:500000,ht:'ck',tt:'cho_tq'});});}""")
        await page.wait_for_timeout(300)
        P1=await ev("()=>window.__ptn.dvPay(window.__ptn.dvAllBk()[0])")
        chk(P1['cho']==500000 and P1['da']==0 and P1['con']==850000,'pay chờ %s'%P1)
        await login('NS012')
        await ev("""async()=>{const P=window.__ptn;const b=P.dvAllBk()[0];await P.dvAct(b,'xn','',d=>{d.pay[0].tt='da_xn';d.pay[0].ngay_xn='2026-11-06';});}""")
        await page.wait_for_timeout(300)
        P2=await ev("()=>window.__ptn.dvPay(window.__ptn.dvAllBk()[0])")
        chk(P2['da']==500000 and P2['con']==350000 and P2['st']=='mot','pay một phần %s'%P2)
        dd=await ev("()=>window.__ptn.dvDebtData('kd').map(e=>[e.ten,e.con])")
        chk(dd==[['Công ty CP Điện Quảng Bình',350000]],'công nợ %s'%dd)
        await ev("()=>{location.hash='dich-vu'}");await go('no');
        chk('350.000' in (await page.content()),'hiển thị công nợ')
        # không đụng bangke_ / samples_
        keys=await ev("()=>Object.keys(window.__fake.dump?window.__fake.dump():{})")
        print('keys',[k for k in keys][:20])
        # --- báo giá do phòng Hóa sinh lập, trưởng phòng duyệt
        await login('NS017');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500);await go('bg')
        await L('[data-act="dv-new"]').click();await page.wait_for_timeout(200)
        await L('[data-act="dv-new-ok"]').click();await page.wait_for_timeout(300)
        await L('input[placeholder="Tên khách hàng hoặc cơ sở"]').fill('Nhà máy nước Đồng Hới')
        await L('[data-act="dv-pick"]').click();await page.wait_for_timeout(300)
        await L('[data-act="dv-add"]').nth(0).click();await page.keyboard.press('Escape')
        await L('[data-act="dv-save"]').click();await page.wait_for_timeout(500)
        so=await ev("()=>window.__ptn.DVS.draft.so");chk(so.startswith('BG.HSMT.'),'số báo giá %s'%so)
        chk(await L('[data-act="dv-duyet-ngay"]').count()==0,'nhân viên không duyệt báo giá')
        await L('[data-act="dv-gui"]').click();await page.wait_for_timeout(300)
        await L('.overlay button.primary').last.click();await page.wait_for_timeout(500)
        await login('NS016');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500);await go('bg')
        chk(await ev("()=>window.__ptn.dvMine('bg').length")==1,'trưởng phòng HS có 1 báo giá chờ')
        await L('[data-act="dv-open"]').first.click();await page.wait_for_timeout(300)
        await L('[data-act="dv-duyet"]').click();await page.wait_for_timeout(300)
        await L('.overlay button.primary').last.click();await page.wait_for_timeout(500)
        chk(await ev("()=>window.__ptn.dvAllBg()[0].trang_thai")=='da_duyet','báo giá đã duyệt')
        # trưởng phòng KĐ không duyệt được báo giá phòng HS (khác phòng)
        await login('NS014');await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500);await go('bg')
        chk('Nhà máy nước' not in (await page.content()),'P.KĐ không thấy báo giá P.HS')
        # --- admin: mở khóa giá cần lý do; cơ điện có báo giá
        await login('NS009')
        chk(await ev("()=>window.__ptn.dvShow()"),'admin thấy module')
        # excel mẫu
        x=await ev("""async()=>{const P=window.__ptn;const u=await P.dvPriceXlsx(['atld']);return u.length}""")
        chk(x>2000,'xuất bảng giá xlsx')
        chk(await page.locator('.nav [data-k="dich-vu"]').count()==1,'menu có mục')
        # thanh toán cũ vẫn mở
        await ev("()=>{location.hash='thanh-toan'}");await page.wait_for_timeout(600)
        chk(await page.locator('text=Thanh toán').count()>0,'trang thanh toán cũ còn')
        chk('nullnull' not in (await page.inner_text('body')),'không còn chữ null')
        print('errs',errs[:5]);print('ok',ok,'bad',bad)
asyncio.run(main())
