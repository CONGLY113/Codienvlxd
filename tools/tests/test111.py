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
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        L=page.locator;ev=lambda js,a=None: page.evaluate(js,a)
        # --- đăng nhập: chọn phòng trước, chỉ hiện tên
        await page.wait_for_timeout(500)
        chk(await L('[data-room]').count()==5,'5 khối đăng nhập')
        chk(await L('.lg-rooms3 [data-room]').count()==3,'3 phòng chuyên môn nằm cùng hàng')
        await L('[data-room="hs"]').hover();await page.wait_for_timeout(200)
        chk('Hóa sinh' in await L('.lg-hc h1').inner_text(),'tiêu đề theo phòng hóa sinh')
        await L('[data-room="hs"]').click();await page.wait_for_timeout(300)
        names=await ev("()=>[...document.querySelectorAll('.lg .acc-grid .acc')].map(b=>b.textContent.trim())")
        chk(len(names)==2,'hóa sinh: chỉ 2 người của phòng, có %d'%len(names))
        chk(all('Trưởng' not in n and 'Giao nhận' not in n and 'Phê duyệt' not in n for n in names),'chỉ hiện tên: %s'%names)
        chk(await L('.lg-cta').is_hidden(),'ẩn cổng khách hàng ở phòng hóa sinh')
        await L('.acc',has_text='Giang Tấn Thông').click();await page.wait_for_timeout(800)
        chk('NS016'==await ev("()=>window.__ptn.SESSION.id") and await ev("()=>window.__ptn.wroom()")=='hs','vào phòng hóa sinh')
        side=await L('.side').inner_text()
        chk('Phòng Hóa sinh môi trường' in side and 'Trưởng phòng' not in side and 'Giang Tấn Thông' in side,'thanh bên: tên phòng, chỉ tên người: %s'%side.replace('\n',' | ')[:160])
        nav=await ev("()=>[...document.querySelectorAll('.nav a')].map(a=>a.firstChild.textContent)")
        chk(nav==['Tổng quan','Thông báo','Hồ sơ lưu trữ','Bảng kê và báo giá','Thiết bị'],'menu %s'%nav)
        # --- thiết bị riêng, không lẫn phòng VLXD
        await ev("()=>{location.hash='thiet-bi'}");await page.wait_for_timeout(500)
        chk(await L('table tbody tr').count()==0,'hóa sinh chưa có thiết bị (không lấy của VLXD)')
        hd=await ev("()=>document.querySelector('.card,.main')&&1")
        xl=await ev("""async()=>{const P=window.__ptn;const u=await P.bkTblXlsx('DM','x',['Mã','Thiết bị','S/N','Chế độ','KĐ/HC gần nhất','Hạn tiếp theo','Tình trạng','Quản lý'],
           [['HS-01','Cân phân tích','S1','Hiệu chuẩn','01/03/2026','31/03/2027','','Châu'],['HS-02','Tủ sấy','S2','Kiểm định','01/03/2025','01/04/2026','','Thông'],['HS-03','pH meter','S3','Hiệu chuẩn','','','','Châu']],{widths:[10,30,10,12,14,14,12,12],num:[],sum:[],sheet:'Thiet_bi'});
           window.__xl=Array.from(u);return u.length}""")
        chk(xl>1500,'tạo file mẫu')
        await ev("""async()=>{const f=new File([new Uint8Array(window.__xl)],'tb.xlsx');window.__ptn.dvTbImport('hs',f)}""");await page.wait_for_timeout(600)
        await L('[data-act="tb-ok"]').click();await page.wait_for_timeout(800)
        rows=await ev("()=>[...document.querySelectorAll('table tbody tr')].map(r=>r.textContent)")
        chk(len(rows)==3 and any('HS-01' in r and 'Còn hạn' in r for r in rows),'nhập 3 thiết bị: %s'%[r[:60] for r in rows])
        chk(any('HS-02' in r and 'Quá hạn' in r for r in rows),'HS-02 quá hạn theo hạn trong file')
        chk(any('HS-03' in r and 'Thiếu dữ liệu' in r for r in rows),'HS-03 thiếu dữ liệu')
        th=await ev("()=>[...document.querySelectorAll('table thead th')].map(x=>x.textContent)")
        chk(th==['Mã','Thiết bị','S/N','Chế độ','KĐ/HC gần nhất','Hạn tiếp theo','Tình trạng','Quản lý'],'tiêu đề %s'%th)
        # --- giấy chứng nhận tải lên
        await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500);await L('[data-tab="cn"]').click();await page.wait_for_timeout(300)
        xl=await ev("""async()=>{const P=window.__ptn;const u=await P.bkTblXlsx('GCN','x',['Số giấy chứng nhận','Ngày cấp','Hạn hiệu lực','Khách hàng','Nội dung','Số bảng kê','Liên kết'],
           [['GCN-001/26','10/10/2026','10/10/2027','Cty A','Cân','','https://x.vn/a'],['GCN-002/26','01/01/2026','15/11/2026','Cty B','Nhiệt kế','','']],{widths:[20,14,14,30,30,16,30],num:[],sum:[],sheet:'GCN'});window.__xl=Array.from(u);return u.length}""")
        await ev("""async()=>{const f=new File([new Uint8Array(window.__xl)],'cc.xlsx');window.__ptn.dvCcImport('hs',f)}""");await page.wait_for_timeout(600)
        await L('[data-act="cc-up-ok"]').click();await page.wait_for_timeout(800)
        txt=await L('[data-sec="cert"]').inner_text()
        chk('GCN-001/26' in txt and 'GCN-002/26' in txt and 'Cty B' in txt,'GCN hiện sau khi tải lên')
        # --- phòng kiểm định không thấy dữ liệu phòng hóa sinh
        await ev("()=>{window.__ptn.setSession('NS014');location.hash='thiet-bi'}");await page.wait_for_timeout(500)
        chk(await L('table tbody tr').count()==0,'kiểm định không thấy thiết bị hóa sinh')
        await ev("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(400)
        chk('Phòng Kiểm định Hiệu chuẩn đo lường' in await L('.main').inner_text(),'tổng quan phòng kiểm định')
        await ev("()=>{location.hash='luu-tru'}");await page.wait_for_timeout(400)
        chk('Chưa có hồ sơ' in await L('.main').inner_text(),'hồ sơ lưu trữ riêng, trống')
        # --- phòng Cơ điện giữ nguyên thiết bị VLXD
        await ev("()=>{window.__ptn.setSession('NS009');location.hash='thiet-bi'}");await page.wait_for_timeout(500)
        chk(await L('table tbody tr').count()>20,'phòng Cơ điện vẫn có danh mục thiết bị cũ')
        nav=await ev("()=>[...document.querySelectorAll('.nav a')].map(a=>a.firstChild.textContent)")
        chk('Nhận mẫu' in nav and 'Thanh toán' in nav,'phòng Cơ điện đủ menu cũ %s'%nav)
        # thủ quỹ vào phòng kiểm định: không có menu nhận mẫu
        await ev("()=>{window.__ptn.setSession('NS012');window.__ptn.setWroom('kd');location.hash='tong-quan'}");await page.wait_for_timeout(500)
        nav=await ev("()=>[...document.querySelectorAll('.nav a')].map(a=>a.firstChild.textContent)")
        chk('Nhận mẫu' not in nav and 'Bảng kê và báo giá' in nav,'thủ quỹ trong phòng kiểm định %s'%nav)
        # --- Ban Giám đốc và Hành chính tổng hợp
        await ev("()=>{window.__ptn.setSession(null);localStorage.removeItem('ptn_session');location.hash='dang-nhap'}");await page.wait_for_timeout(500)
        await page.reload();await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000);await page.wait_for_timeout(500)
        await L('[data-room="bgd"]').click();await page.wait_for_timeout(300)
        names=await ev("()=>[...document.querySelectorAll('.lg .acc-grid .acc')].map(b=>b.textContent.trim())")
        chk(len(names)==2 and any('Phan Thanh Giàn' in n for n in names) and any('Lưu Minh Tuấn' in n for n in names),'Ban Giám đốc: %s'%names)
        await L('[data-act="lg-back"]').click();await page.wait_for_timeout(200)
        await L('[data-room="hc"]').click();await page.wait_for_timeout(300)
        names=await ev("()=>[...document.querySelectorAll('.lg .acc-grid .acc')].map(b=>b.textContent.trim())")
        chk(len(names)==2 and any('Trần Hoàn' in n for n in names) and any('Hồ Thị Bích Thuỷ' in n for n in names),'Hành chính tổng hợp: %s'%names)
        await L('[data-act="lg-back"]').click();await L('[data-room="bgd"]').click();await page.wait_for_timeout(200)
        await L('.acc',has_text='Phan Thanh Giàn').click();await page.wait_for_timeout(800)
        side=await L('.side').inner_text()
        chk('Ban Giám đốc' in side and 'Phó giám đốc' not in side and await L('.side [data-act="wr-sw"]').count()==1,'Phó giám đốc: thanh bên tên đơn vị + chọn phòng xem')
        await L('.side [data-act="wr-sw"]').select_option('kd');await page.wait_for_timeout(500)
        chk(await ev("()=>window.__ptn.wroom()")=='kd' and 'Bảng kê và báo giá' in await L('.nav').inner_text(),'chuyển xem phòng kiểm định')
        await ev("()=>{location.hash='dich-vu'}");await page.wait_for_timeout(500)
        chk(await L('[data-tab="bk"]').count()==1,'Phó giám đốc xem được bảng kê phòng kiểm định')
        print('errs',errs[:5]);print('ok',ok,'bad',bad)
asyncio.run(main())
