import asyncio
from playwright.async_api import async_playwright
G='/tmp/claude-0/-home-claude/c64f2c08-0025-5f29-8403-f78a9d20d6b8/scratchpad/g/'
src=open('/tmp/w/test80.py',encoding='utf8').read();FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JS=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
ROOM={'NS012':'kd','NS013':'kd','NS015':'kd','NS014':'kd'}
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        pg=await br.new_page(viewport={'width':1280,'height':780},device_scale_factor=1.5);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JS,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await pg.route('**/*',route);await pg.add_init_script(FAKE)
        await pg.add_init_script("window.__fake.seed([['config/periods',{open:['2611a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true}]])")
        await pg.goto('file:///home/claude/congly113/codienvlxd/app/quan-ly-mau-thu-nghiem.html')
        await pg.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000);await pg.wait_for_timeout(1000)
        ev=pg.evaluate;L=pg.locator
        async def shot(n,sel=None,full=False):
            await pg.wait_for_timeout(350)
            if sel: await L(sel).first.screenshot(path=G+n+'.png')
            else: await pg.screenshot(path=G+n+'.png',full_page=full)
        async def login(i):
            await ev("([id,r])=>{window.__ptn.setSession(id);if(r)window.__ptn.setWroom(r);location.hash='tong-quan';}",[i,ROOM.get(i)]);await pg.wait_for_timeout(300)
            await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        async def tab(t):
            await L('[data-tab="%s"]'%t).click();await pg.wait_for_timeout(300)
        # đăng nhập
        await shot('01_login_khoi')
        await L('.lg .acc[data-room="kd"]').first.click();await pg.wait_for_timeout(400);await shot('02_login_ten')
        # lập bảng kê
        await login('NS015');await shot('03_dichvu_tab')
        await tab('bk')
        await L('[data-act="dv-new"]').click();await pg.wait_for_timeout(300);await shot('04_chon_mang')
        await L('[data-act="dv-new-ok"]').click();await pg.wait_for_timeout(300)
        await L('input[placeholder="Tên khách hàng hoặc cơ sở"]').fill('Công ty CP Điện Quảng Bình')
        await L('[data-act="dv-pick"]').click();await pg.wait_for_timeout(300);await shot('05_chon_dich_vu')
        await L('[data-act="dv-add"]').nth(0).click();await L('[data-act="dv-add"]').nth(1).click()
        await pg.keyboard.press('Escape');await pg.wait_for_timeout(300)
        await ev("()=>{const d=window.__ptn.DVS.draft;d.khach.mst='3100123456';d.khach.dia_chi='12 Quang Trung, Đồng Hới, Quảng Trị';d.cong_trinh='Hiệu chuẩn công tơ điện năm 2026'}")
        await ev("()=>window.__ptn.dvOpen(window.__ptn.DVS.draft)");await pg.wait_for_timeout(400)
        await pg.wait_for_timeout(4500);await shot('06_bang_ke_soan',full=True)
        await L('[data-act="dv-save"]').click();await pg.wait_for_timeout(500)
        await L('[data-act="dv-gui"]').click();await pg.wait_for_timeout(300);await shot('07_gui_soat_xet')
        await L('.overlay button.primary').last.click();await pg.wait_for_timeout(500)
        await L('[data-tab="bk"]').click();await pg.wait_for_timeout(300);await shot('08_ds_bang_ke')
        await login('NS012');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(400);await shot('09_thu_quy_soat_xet',full=True)
        await L('[data-act="dv-soat"]').click();await pg.wait_for_timeout(300);await L('.overlay button.primary').last.click();await pg.wait_for_timeout(500)
        await login('NS013');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(400);await shot('10_ke_toan_truong_duyet',full=True)
        await L('[data-act="dv-duyet"]').click();await pg.wait_for_timeout(300);await shot('11_duyet_hop_thoai')
        await L('.overlay button.primary').last.click();await pg.wait_for_timeout(500)
        # thanh toán
        await login('NS015');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(500)
        await shot('12_the_thanh_toan','[data-sec=pay]')
        await L('[data-act="dv-pay-de"]').click();await pg.wait_for_timeout(300)
        await L('.overlay input[type=number]').fill('500000');await shot('13_de_nghi_thanh_toan')
        await L('.overlay button.primary').last.click();await pg.wait_for_timeout(600)
        await pg.wait_for_timeout(4000);await shot('14_cho_xac_nhan','[data-sec=pay]')
        await login('NS012');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(500)
        await L('[data-act="dv-pay-xn"]').click();await pg.wait_for_timeout(300);await shot('15_thu_quy_xac_nhan')
        await L('.overlay button.primary').last.click();await pg.wait_for_timeout(600)
        await login('NS015');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(500)
        await L('[data-act="dv-pay-de"]').click();await pg.wait_for_timeout(300)
        await L('.overlay select').first.select_option('kc');await L('.overlay input[type=number]').fill('200000')
        await L('.overlay input[type=text]').last.fill('Đối trừ vào khoản chi theo biên bản số 05');await shot('16_khoan_chi')
        await L('.overlay button.primary').last.click();await pg.wait_for_timeout(600)
        await login('NS012');await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await L('[data-act="dv-open"]').first.click();await pg.wait_for_timeout(500)
        await L('[data-act="dv-pay-xn"]').click();await pg.wait_for_timeout(300);await L('.overlay button.primary').last.click();await pg.wait_for_timeout(800)
        await pg.wait_for_timeout(4000);await shot('17_the_thanh_toan_xong','[data-sec=pay]')
        await ev("()=>{location.hash='dich-vu'}");await pg.wait_for_timeout(500)
        await tab('th');await shot('18_tong_hop')
        await tab('no');await shot('19_cong_no')
        await tab('gia');await shot('20_bang_gia')
        await tab('bg');await shot('21_bao_gia')
        # in bảng kê
        await ev("""async()=>{const P=window.__ptn;const b=P.dvAllBk()[0];const box=P.dvPrintBox(b,null);box.id='pbox';box.style.display='block';box.style.width='820px';box.style.margin='0 auto';document.body.innerHTML='';document.body.style.background='#ccc';document.body.append(box)}""")
        await shot('22_ban_in','#pbox')
        print('errs',errs)
asyncio.run(main())
