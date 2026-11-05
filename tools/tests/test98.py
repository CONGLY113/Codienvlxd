import asyncio, json, sys, base64, re, io
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SEED=r"""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 P.setSession('NS009');await sleep(150);
 const iso=new Date().toISOString();
 const mk=async(so_yc,kh,ct,loai,ten,status,n)=>{for(let i=0;i<n;i++){const id=P.newSid();const ma=await P.makeCode('mau',iso.slice(0,10),loai);
   const d={kenh:'thu_cong',created_at:iso,created_by:'t',so_yc,ma_mau:ma,khach:{ten:kh,lien_he:'Ông A',email:'a@x.vn'},du_an:{cong_trinh:ct},mau:{loai,ten,ngay_nhan:iso.slice(0,10)},status,chi_tieu:['x'],giao:{ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng'}};
   if(status==='da_phat_hanh')d.so_bao_cao='BC-'+ma;await P.Data.set(P.sp(id),d);}};
 await mk('YC-A1','Công ty A','Cầu X','CAT_XD','Cát xây dựng','da_phat_hanh',2);
 await mk('YC-A1','Công ty A','Cầu X','CAT_XD','Cát xây dựng','dang_thu',1);
 await mk('YC-A2','Công ty A','Cầu X','XM_PCB30','Xi măng PCB30','da_phat_hanh',1);
 await mk('YC-B1','Công ty B','Nhà Y','THEP_XD','Thép xây dựng','da_giao',2);
 await P.Data.set('config/bang_gia',{gia:{CAT_XD:200000,XM_PCB30:500000,THEP_XD:350000}});
 await sleep(600);return 1;})()"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        ctx=await br.new_context(viewport={'width':1200,'height':900})
        page=await ctx.new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate(SEED)
        # đơn vị
        r=await page.evaluate("""()=>{const P=window.__ptn;return {
          w:[0,5,15,21,100,105,1000,1005,1234567,2000000,10000000,1500000000].map(n=>[n,P.docSo(n)]),
          t:P.bkTotals({dong:[{sl:3,don_gia:200000},{sl:1,don_gia:500000}],giam:{kieu:'pct',gt:10}}),
          t2:P.bkTotals({dong:[{sl:3,don_gia:200000}],giam:{kieu:'amt',gt:999999999}}),
          t3:P.bkTotals({dong:[{sl:3,don_gia:333333}],giam:{kieu:'pct',gt:33.3}})}}""")
        for w in r['w']: print(w)
        print(r['t'],r['t2'],r['t3'])
        # trang
        await page.evaluate("()=>{window.__ptn.setSession('NS011');location.hash='thanh-toan'}")
        await page.wait_for_selector('.tabs',timeout=5000); await page.wait_for_timeout(800)
        print('nav',await page.evaluate("()=>[...document.querySelectorAll('nav a, .side a, .tabbar a')].map(a=>a.textContent.trim().replace(/\\s+/g,' ')).slice(0,14)"))
        print('pending',await page.evaluate("()=>[...document.querySelectorAll('.card')].map(c=>c.textContent.slice(0,260)).slice(0,2)"))
        await page.screenshot(path='/tmp/w/bk_list.png',full_page=True)
        # lập riêng YC-A1
        btn=page.locator('tr:has-text("YC-A1") button:has-text("Lập riêng")'); await btn.click(); await page.wait_for_timeout(500)
        print('editor',await page.evaluate("()=>({title:document.querySelector('h2').textContent,rows:[...document.querySelectorAll('tbody tr')].map(r=>[...r.querySelectorAll('input')].map(i=>i.value).join('|')+' :: '+(r.querySelector('.bk-amt')||{}).textContent),tam:(document.querySelector('.banner')||{}).textContent,tot:document.querySelector('.stack[style*=flex-end]').textContent})"))
        # chiết khấu 10 %
        await page.fill('input[aria-label="Giá trị chiết khấu"]','10'); await page.wait_for_timeout(200)
        print('sau CK10%',await page.evaluate("()=>document.querySelector('.stack[style*=flex-end]').textContent+' | '+[...document.querySelectorAll('p.muted.small')].map(p=>p.textContent).filter(t=>t.startsWith('Bằng chữ'))"))
        await page.fill('#bk-gc','Giao 2 đợt'); 
        await page.screenshot(path='/tmp/w/bk_edit.png',full_page=True)
        await page.click('button:has-text("Lưu và cấp số bảng kê")'); await page.wait_for_timeout(900)
        bks=await page.evaluate("()=>window.__ptn.bkAll().map(b=>({id:b.id,so:b.so,col:b.col,ngay:b.ngay,yc:b.yc,tt:b.trang_thai,dong:b.dong.map(l=>[l.ten,l.sl,l.n,l.xong,l.don_gia]),giam:b.giam,tam:window.__ptn.bkTam(b)}))")
        print('saved',json.dumps(bks,ensure_ascii=False))
        # Excel
        x=await page.evaluate("async()=>{const P=window.__ptn;const b=P.bkAll()[0];const u=await P.bkXlsx(b);return btoa(String.fromCharCode(...u));}")
        open('/tmp/w/bk98.xlsx','wb').write(base64.b64decode(x))
        # đổi trạng thái: đã gửi, thanh toán
        print('paid samples',await page.evaluate("()=>window.__ptn.bkAll().map(b=>b.trang_thai)"))
        print('tt thanh_toan',await page.evaluate("()=>[...document.querySelectorAll('x')].length"))
        # đóng và kiểm tra YC-A1 không còn pending; chọn nhiều phiếu
        await page.click('button:has-text("Đóng")'); await page.wait_for_timeout(500)
        print('pending after',await page.evaluate("()=>window.__ptn.bkPendingGroups().map(e=>e.so_yc)"))
        print('sample tt',await page.evaluate("async()=>{const P=window.__ptn;const all=P.S.samples;return all.filter(s=>s.so_yc==='YC-A1').map(s=>[s.ma_mau,s.status,(s.tt||{}).thanh_toan||null])}"))
        # chọn nhiều phiếu của B (1 phiếu) + tạo bảng kê cho A2 và test số thứ tự
        await page.check('tr:has-text("YC-A2") input[type=checkbox]')
        await page.locator('div:has(> .card-h b:has-text("Công ty A")) button:has-text("Lập bảng kê cho phiếu đã chọn")').first.click(); await page.wait_for_timeout(500)
        print('A2 lines',await page.evaluate("()=>[...document.querySelectorAll('tbody tr')].map(r=>[...r.querySelectorAll('input')].map(i=>i.value).join('|'))"))
        await page.click('button:has-text("Lưu và cấp số bảng kê")'); await page.wait_for_timeout(700)
        print('so',await page.evaluate("()=>window.__ptn.bkAll().map(b=>b.so)"))
        # in
        await page.evaluate("()=>{window.print=()=>{window.__printed=document.querySelectorAll('.bk-print').length+'|'+document.documentElement.className;};}")
        await page.click('button:has-text("In")'); await page.wait_for_timeout(300)
        print('print',await page.evaluate("()=>window.__printed"))
        # tab khác
        for t in ['banggia','phieu']:
            await page.click('[data-tab=%s]'%t) if False else None
        await page.click('button:has-text("Đóng")'); await page.wait_for_timeout(300)
        await page.click('[data-tab=banggia]'); await page.wait_for_timeout(300)
        print('bang gia rows',await page.evaluate("()=>document.querySelectorAll('.bk-prices tbody tr').length"))
        await page.click('[data-tab=phieu]'); await page.wait_for_timeout(300)
        print('phieu tab',await page.evaluate("()=>document.body.innerText.includes('Đã giao bản giấy')||document.body.innerText.includes('Bản giấy')"))
        # TN account: quyền giao nhận
        await page.evaluate("()=>{window.__ptn.setSession('NS003');location.hash='tong-quan'}"); await page.wait_for_timeout(600)
        print('TN nav',await page.evaluate("()=>[...document.querySelectorAll('nav a, .side a, .tabbar a, a[href^=\"#\"]')].map(a=>a.textContent.trim().replace(/\\s+/g,' ')).filter(Boolean).slice(0,16)"))
        await page.evaluate("()=>{location.hash='nhan-mau'}"); await page.wait_for_timeout(600)
        print('TN nhan-mau h1',await page.evaluate("()=>(document.querySelector('h1')||{}).textContent"))
        await page.evaluate("()=>{location.hash='thanh-toan'}"); await page.wait_for_timeout(500)
        print('TN thanh-toan h1',await page.evaluate("()=>(document.querySelector('h1')||{}).textContent"))
        await page.evaluate("()=>{window.__ptn.setSession(null);location.hash='dang-nhap'}"); await page.wait_for_timeout(600)
        print('login groups',await page.evaluate("()=>[...document.querySelectorAll('h2,h3,.group-t,.lg-h')].map(e=>e.textContent.trim()).slice(0,8)"))
        print('ERRORS',errs[:6] or 'none')
        await br.close()
asyncio.run(main())
