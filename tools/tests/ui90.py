import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SETUP=r"""(async(loai)=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const nhan=iso(new Date(Date.now()-864e5));
 P.setSession('NS009');await sleep(150);const id=P.newSid();
 await P.Data.set(P.sp(id),{status:'da_giao',kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-U',ma_mau:await P.makeCode('mau',nhan,loai),khach:{ten:'K'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:loai,nguon_goc:'x',ngay_nhan:nhan,ngay_lay:nhan},chi_tieu:P.defTests(loai),han_tra:nhan,giao:{ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()}});
 await sleep(300);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(600);return id;})"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context(viewport={'width':420,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        for loai in ['THEP_HINH','XM_PCB40']:
            await page.evaluate(SETUP+"('"+loai+"')")
            await page.wait_for_selector('.mf-sec',timeout=5000)
            info=await page.evaluate("()=>({secs:document.querySelectorAll('.mf-sec').length,inputs:document.querySelectorAll('.mf-sec input').length,selects:document.querySelectorAll('.mf-sec select').length,cnt:[...document.querySelectorAll('.mf-top .small')].map(x=>x.textContent).join(' | '),btns:[...document.querySelectorAll('button')].map(b=>b.textContent).filter(t=>/thanh|Kiểm tra/.test(t))})")
            print(loai,json.dumps(info,ensure_ascii=False))
            if loai=='THEP_HINH':
                await page.click('text=＋ Thêm thanh thép'); await page.wait_for_timeout(300)
                n1=await page.evaluate("()=>document.querySelectorAll('.mf-sec').length")
                # nhập thanh 1
                ins=await page.query_selector_all('.mf-sec:nth-of-type(3) input')
                vals=['PL10','10','37,2','102','156','30,6']
                for el,v in zip(ins,vals): await el.fill(v)
                sel=await page.query_selector('.mf-sec:nth-of-type(3) select'); await sel.select_option('Không nứt')
                await page.wait_for_timeout(200)
                live=await page.evaluate("()=>document.querySelector('.mf-sec:nth-of-type(3) .mf-live').textContent")
                cnt=await page.evaluate("()=>[...document.querySelectorAll('.mf-top .small')].map(x=>x.textContent).join(' | ')")
                print('  sau them thanh: secs',n1,'| live:',live,'| cnt:',cnt)
                await page.click('text=Bớt một thanh'); await page.wait_for_timeout(300)
                print('  sau bot:',await page.evaluate("()=>document.querySelectorAll('.mf-sec').length"))
            else:
                ins=await page.query_selector_all('.mf-sec:nth-of-type(2) input')
                print('  xm inputs',len(ins))
                for el in ins[:4]: await el.fill('10')
                print('  cnt:',await page.evaluate("()=>[...document.querySelectorAll('.mf-top .small')].map(x=>x.textContent).join(' | ')"))
        await page.screenshot(path='/tmp/w/ui_xm.png')
        # form tiếp nhận: loại mẫu có XM, thép hình chọn được
        await page.evaluate("()=>{P=window.__ptn;P.setSession('NS011');location.hash='nhan-mau';}")
        await page.wait_for_timeout(600)
        opts=await page.evaluate("()=>[...document.querySelectorAll('select option')].map(o=>o.textContent+(o.disabled?' [khoa]':'')).filter(t=>/Xi măng|Thép|Cát|Đá dăm 5/.test(t))")
        print('tiep-nhan options:',opts[:8]);print('ERRORS',errs or 'none');await br.close()
asyncio.run(main())
