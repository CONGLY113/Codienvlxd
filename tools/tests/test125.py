# C2: ngày kết thúc thử theo loại mẫu, bỏ ngày nghỉ; số báo cáo theo ngày kết thúc thử
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
        page=await (await br.new_context(viewport={'width':1100,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        K=lambda l,d: page.evaluate("([l,d])=>window.__ptn.ngayKetThucMacDinh(l,d)",[l,d])
        cases=[('NEN_BT','2026-11-06','2026-11-06'),('NEN_VUA','2026-11-09','2026-11-09'),
          ('DO_K_DV','2026-11-09','2026-11-10'),('DO_K_PR','2026-11-06','2026-11-09'),
          ('CAT_XD','2026-11-05','2026-11-09'),('DA_5_20','2026-11-09','2026-11-12'),('DAM_CHAT_CAT','2026-11-09','2026-11-12'),('DA_LN_2','2026-11-09','2026-11-12'),('DA_GOC','2026-11-09','2026-11-12'),
          ('NHUA_6070','2026-11-09','2026-11-13'),('GACH_2L','2026-08-27','2026-09-03'),('GACH_BT_RONG','2026-11-09','2026-11-13'),
          ('CP_BT','2027-01-27','2027-02-11'),('CP_VUA','2026-11-09','2026-11-19'),
          ('DA_5_20','2026-08-19','2026-08-22'),   # thứ bảy làm bù
          ('DA_5_20','2026-02-12','2026-02-23'),    # nhận trước Tết, kết thúc rơi vào Tết
          ('NEN_BT','2026-04-30','2026-05-04'),('NEN_BT','2027-04-30','2027-05-04'),('CAT_XD','2026-12-30','2027-01-04')]
        for l,n,e in cases:
            v=await K(l,n);chk(v==e,'%s nhận %s -> %s (đúng %s)'%(l,n,v,e))
        chk(await page.evaluate("()=>window.__ptn.laNgayNghi('2026-11-07')&&window.__ptn.laNgayNghi('2026-11-08')&&!window.__ptn.laNgayNghi('2026-11-09')"),'thứ bảy, chủ nhật nghỉ')
        chk(await page.evaluate("()=>window.__ptn.laNgayNghi('2027-02-05')&&!window.__ptn.laNgayNghi('2026-08-22')"),'Tết 2027 nghỉ, làm bù không nghỉ')
        # cấu hình thêm ngày nghỉ
        await page.evaluate("()=>{window.__ptn.S.config.nghi_them='2026-11-10';window.__ptn.S.config.lam_bu='2026-11-07'}")
        chk(await K('DO_K_DV','2026-11-09')=='2026-11-11','nghỉ thêm 10/11 -> 11/11')
        chk(await page.evaluate("()=>!window.__ptn.laNgayNghi('2026-11-07')"),'làm bù cấu hình')
        await page.evaluate("()=>{window.__ptn.S.config.nghi_them='';window.__ptn.S.config.lam_bu=''}")
        # ngayBaoCao: dùng d1 đã nhập, dời nếu rơi ngày nghỉ
        r=await page.evaluate("""()=>{const P=window.__ptn;return [P.ngayBaoCao({mau:{ngay_nhan:'2026-11-09'},nop:{d1:'2026-11-12'},mau_loai:1}),
          P.ngayBaoCao({mau:{ngay_nhan:'2026-11-09',loai:'DA_5_20'},nop:{d1:'2026-11-14'}}),P.ngayBaoCao({mau:{ngay_nhan:'2026-11-09',loai:'DA_5_20'},nop:{}})]}""")
        chk(r[0]=='2026-11-12','ngày báo cáo = d1: %s'%r[0]);chk(r[1]=='2026-11-16','d1 rơi thứ bảy -> 16/11: %s'%r[1]);chk(r[2]=='2026-11-12','chưa có d1 -> mặc định +3: %s'%r[2])
        # số báo cáo theo ngày báo cáo
        c=await page.evaluate("async()=>window.__ptn.makeCode('bc','2026-11-12')")
        chk(c=='BC26.11.12.1','makeCode bc %s'%c)
        # UI nhập số liệu: mặc định
        SETUP="""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));P.setSession('NS009');await sleep(150);
         const id=P.newSid();const nhan='2026-11-05';const d={kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-T1',ma_mau:'',khach:{ten:'K'},du_an:{cong_trinh:'CT'},mau:{loai:'DA_5_20',ten:'Đá',nguon_goc:'N',ngay_nhan:nhan,ngay_lay:nhan},chi_tieu:P.defTests('DA_5_20'),han_tra:nhan};
         d.status='da_giao';d.ma_mau=await P.makeCode('mau',nhan,'DA_5_20');d.giao={ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()};await P.Data.set(P.sp(id),d);
         await sleep(400);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(700);return id;})()"""
        await page.evaluate(SETUP);await page.wait_for_selector('.mf-sec',timeout=5000)
        v=await page.evaluate("()=>[...document.querySelectorAll('.mf-sec input[type=date]')].slice(0,2).map(x=>x.value)")
        chk(v==['2026-11-05','2026-11-09'],'mặc định ngày thử %s'%v)
        txt=await page.inner_text('.mf-sec')
        chk('ngày nhận + 3 ngày' in txt and 'Đặt lại theo quy định' in txt,'ghi chú quy định')
        # sửa tay rồi đặt lại
        await page.evaluate("()=>{const i=document.querySelectorAll('.mf-sec input[type=date]')[1];i.value='2026-11-20';i.dispatchEvent(new Event('change'))}")
        await page.get_by_text('Đặt lại theo quy định').click();await page.wait_for_timeout(500)
        v=await page.evaluate("()=>[...document.querySelectorAll('.mf-sec input[type=date]')].slice(0,2).map(x=>x.value)")
        chk(v==['2026-11-05','2026-11-09'],'đặt lại %s'%v)
        # trang cài đặt
        await page.evaluate("()=>{window.__ptn.setSession('NS009');location.hash='cai-dat'}");await page.wait_for_timeout(600)
        chk(await page.locator('#st-nghi').count()==1 and await page.locator('#st-bu').count()==1,'ô ngày nghỉ ở Cài đặt')
        chk(not errs,'lỗi trang %s'%errs[:3])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
