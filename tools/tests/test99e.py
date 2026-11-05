import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SEED=r"""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 P.setSession('NS009');await sleep(150);
 const iso=new Date().toISOString();
 const mk=async(so_yc,kh,ct,loai,ten,status,n,extra)=>{for(let i=0;i<n;i++){const id=P.newSid();const ma=await P.makeCode('mau',iso.slice(0,10),loai);
   const d=Object.assign({kenh:'thu_cong',created_at:iso,created_by:'t',so_yc,ma_mau:ma,khach:{ten:kh,lien_he:'Ông A',email:'a@x.vn'},du_an:{cong_trinh:ct},mau:{loai,ten,ngay_nhan:iso.slice(0,10)},status,chi_tieu:['x'],giao:{ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng'}},extra||{});
   if(status==='da_phat_hanh')d.so_bao_cao='BC-'+ma;await P.Data.set(P.sp(id),d);}};
 await mk('YC-N1','Công ty N','Cầu N','NEN_BT','Bê tông','da_phat_hanh',1,{nop:{results:{n:9}}});
 await mk('YC-N1','Công ty N','Cầu N','NEN_BT','Bê tông','dang_thu',1);
 await mk('YC-N1','Công ty N','Cầu N','NEN_VUA','Vữa','da_phat_hanh',1,{nop:{results:{n:6}}});
 await mk('YC-N1','Công ty N','Cầu N','NEN_VUA','Vữa','da_phat_hanh',1,{nop:{results:{n:7}}});
 await mk('YC-N1','Công ty N','Cầu N','DO_K_DV','Đo K dao vòng','da_phat_hanh',1,{nop:{results:{n:5}}});
 await mk('YC-N1','Công ty N','Cầu N','DO_K_PR','Đo K phễu','dang_thu',1);
 await mk('YC-N1','Công ty N','Cầu N','CAT_XD','Cát xây dựng','da_phat_hanh',2,{chi_tieu:['CAT_01','CAT_02']});
 await P.Data.set('config/bang_gia',{gia:{NEN_BT:300000,NEN_VUA:150000,DO_K_DV:80000},ct:{CAT_01:50000,CAT_02:70000,DK_02:95000},them:[{id:'p1',ten:'Quan trắc lún',gia:1500000}]});
 await sleep(700);return 1;})()"""
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
        cat=await page.evaluate("()=>{const P=window.__ptn;const c=P.bkPriceCatalog();const codes=c.filter(e=>e.kind==='ct').map(e=>e.key);const d=codes.filter((x,i)=>codes.indexOf(x)!==i);return {n:c.length,loai:c.filter(e=>e.kind==='loai').length,ct:codes.length,dup:d}}")
        print('catalog',cat)
        r=await page.evaluate("""()=>{const P=window.__ptn;const gs=P.ycGroups().filter(e=>e.so_yc==='YC-N1');
          const f=(c)=>P.bkLines(gs,c,[]).map(l=>[l.ten,l.sl,l.n,l.xong,l.don_gia,l.est||0,l.q0]);
          return {gs:gs.length,all:f(false),xong:f(true)}}""")
        for k in ('all','xong'):
            print(k)
            for l in r[k]: print('  ',l)
        # UI bảng giá
        await page.evaluate("()=>{window.__ptn.setSession('NS011');location.hash='thanh-toan'}")
        await page.wait_for_selector('.tabs',timeout=5000)
        await page.click('button[data-tab=banggia]');await page.wait_for_timeout(500)
        print('rows',await page.evaluate("()=>document.querySelectorAll('.bk-prices tbody tr').length"),await page.evaluate("()=>document.querySelector('.bk-prices .muted.small:last-of-type, .bk-prices span.muted').textContent"))
        await page.screenshot(path='/tmp/w/bg1.png',full_page=False)
        await page.fill('#bg-q','nén');await page.wait_for_timeout(300)
        print('search nén rows',await page.evaluate("()=>[...document.querySelectorAll('.bk-prices tbody tr')].map(r=>r.cells[0].textContent+' '+r.cells[1].textContent.slice(0,50)+' '+(r.querySelector('input')||{}).value)"))
        await page.fill('#bg-q','');await page.wait_for_timeout(200)
        await page.click('button[data-act=bg-toggle][data-k=CAT_XD]');await page.wait_for_timeout(300)
        print('cat open',await page.evaluate("()=>[...document.querySelectorAll('.bk-prices tbody tr')].slice(0,10).map(r=>r.cells[0].textContent+' | '+r.cells[1].textContent.slice(0,60)+' | '+(r.querySelector('input')||{}).value)"))
        # sửa 1 giá + thêm đơn giá + lưu
        await page.fill('input[aria-label="Đơn giá Nén mẫu bê tông"]','310000')
        await page.click('button[data-act=bg-add]');await page.wait_for_timeout(200)
        ins=page.locator('.bk-prices input[aria-label^="Tên đơn giá phát sinh 2"]');await ins.fill('Khoan lấy lõi bê tông')
        await page.fill('input[aria-label="Đơn giá phát sinh 2"]','800000')
        await page.click('button[data-act=bg-save]');await page.wait_for_timeout(800)
        print('saved doc',await page.evaluate("async()=>JSON.stringify(await window.__ptn.Data.get('config/bang_gia'))"))
        # tải xuống Excel hiện tại → đọc lại
        rt=await page.evaluate("""async()=>{const P=window.__ptn;const u=await P.bkPricesXlsx({gia:P.S.bgia,ct:P.S.bgiaCt,them:P.S.bgiaThem});
          const Q={gia:{},ct:{},them:[]};const r=await P.bkParsePrices(u,Q);return {len:u.length,r,gia:Object.keys(Q.gia).length,ct:Object.keys(Q.ct).length,them:Q.them.length,same:JSON.stringify(Q.gia)===JSON.stringify(P.S.bgia)&&JSON.stringify(Q.ct)===JSON.stringify(P.S.bgiaCt)}}""")
        print('roundtrip',rt)
        # upload file hãng
        await page.set_input_files('input[data-act=bg-file]','/tmp/w/vendor_price.xlsx');await page.wait_for_timeout(1200)
        print('banner',await page.evaluate("()=>document.querySelector('.bk-prices .banner').textContent"))
        print('after',await page.evaluate("async()=>JSON.stringify(await window.__ptn.Data.get('config/bang_gia'))"))
        await page.screenshot(path='/tmp/w/bg2.png',full_page=True)
        # tải bảng giá xuống
        # bảng kê với giá mới
        r=await page.evaluate("""()=>{const P=window.__ptn;const gs=P.ycGroups().filter(e=>e.so_yc==='YC-N1');return P.bkLines(gs,false,[]).map(l=>[l.ten,l.sl,l.don_gia])}""")
        for l in r: print('  ',l)
        # bảng kê UI: thêm từ đơn giá phát sinh
        await page.click('button[data-tab=bangke]');await page.wait_for_timeout(500)
        btn=page.locator("tr:has-text(\"YC-N1\") button:has-text(\"Lập riêng\")").first;await btn.click();await page.wait_for_timeout(500)
        print('editor rows',await page.evaluate("()=>[...document.querySelectorAll('tbody tr')].map(r=>r.textContent.slice(0,120))"))
        await page.select_option('select[data-act=bk-ps]',index=1);await page.wait_for_timeout(300)
        print('after PS',await page.evaluate("()=>document.querySelectorAll('tbody tr').length"))
        await page.screenshot(path='/tmp/w/bg3.png',full_page=True)
        print('errs',errs)
        await br.close()
asyncio.run(main())
