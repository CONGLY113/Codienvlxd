import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
async def newpage(br,w=1300,h=900):
    ctx=await br.new_context(viewport={'width':w,'height':h}); page=await ctx.new_page(); errs=[]
    page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
    page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
    async def route(r):
        u=r.request.url
        if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
        elif u.startswith('file://'): await r.continue_()
        else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
    await page.route('**/*',route); await page.add_init_script(FAKE)
    return page,errs
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        # ===== cổng khách hàng
        page,errs=await newpage(br,390,844)
        await page.goto('file://'+HTML+'#khach-hang'); await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000); await page.wait_for_timeout(600)
        st=lambda:page.evaluate("()=>{const m=document.querySelector('[data-f=m_mac]'),q=document.querySelector('[data-f=m_quycach]');return {mac:m&&getComputedStyle(m).display,quy:q&&getComputedStyle(q).display,label:m&&m.querySelector('label').textContent,opts:m&&[...m.querySelectorAll('option')].map(o=>o.textContent),hint:m&&(m.querySelector('.hint')||{}).textContent}}")
        print('mặc định',await st())
        await page.evaluate("()=>{const s=document.querySelector('[data-f=m_loai] select');s.value='CP_VUA';s.dispatchEvent(new Event('change',{bubbles:true}));}"); await page.wait_for_timeout(200)
        print('CP_VUA',await st())
        print('nguồn',await page.evaluate("()=>{const f=document.querySelector('[data-f=m_nguon]');return [f.querySelector('label').textContent,f.querySelector('input').placeholder]}"))
        await page.click('button:has-text("Điền ví dụ")'); await page.wait_for_timeout(300)
        await page.evaluate("()=>{const s=document.querySelector('[data-f=m_loai] select');s.value='CP_VUA';s.dispatchEvent(new Event('change',{bubbles:true}));}")
        await page.fill('[data-f=m_nguon] input','Tường nhà lớp học B')
        await page.click('button:has-text("Gửi yêu cầu")'); await page.wait_for_timeout(500)
        print('toast khi chưa chọn mác:',await page.evaluate("()=>[...document.querySelectorAll('.toast,[role=status],#toast-root *')].map(x=>x.textContent).filter(Boolean).slice(0,3)"), 'err class',await page.evaluate("()=>document.querySelector('[data-f=m_mac]').classList.contains('err')"))
        print('số mẫu khách trước',await page.evaluate("()=>window.__ptn.S.samples.filter(x=>x.kenh==='khach').length"))
        await page.select_option('[data-f=m_mac] select','M75')
        await page.click('button:has-text("Gửi yêu cầu")'); await page.wait_for_timeout(1800)
        print('yêu cầu khách',await page.evaluate("()=>window.__ptn.S.samples.filter(x=>x.kenh==='khach').map(x=>[x.mau.loai,x.mau.ten,x.mau.nguon_goc,x.mau.quy_cach,x.chi_tieu.join(',')])"))
        await page.screenshot(path='/tmp/w/ui96_portal.png',full_page=True)
        # đổi sang loại khác: ô quy cách trở lại, ô mác ẩn
        await page.evaluate("()=>{const s=document.querySelector('[data-f=m_loai] select');s.value='CAT_XD';s.dispatchEvent(new Event('change',{bubbles:true}));}"); await page.wait_for_timeout(200)
        print('CAT_XD',await st())
        print('ERRORS cổng',errs or 'none'); await page.context.close()
        # ===== tiếp nhận thủ công
        page,errs=await newpage(br)
        await page.goto('file://'+HTML); await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("()=>{window.__ptn.setSession('NS009');location.hash='nhan-mau';}"); await page.wait_for_timeout(900)
        await page.click('button[role=tab]:has-text("Nhập thủ công")'); await page.wait_for_timeout(500)
        await page.click('button:has-text("Điền ví dụ")'); await page.wait_for_timeout(400)
        rowsel=lambda i:page.query_selector_all('tbody select[aria-label^="Tên mẫu"]')
        sels=await rowsel(0); await sels[0].select_option('CP_VUA'); await page.wait_for_timeout(300)
        print('dòng 1 có ô mác:',await page.evaluate("()=>document.querySelectorAll('select[data-f=row-mac]').length"))
        r=await page.evaluate("()=>{const r=window.__form.read();return {errs:r.errs}}"); print('chưa chọn mác',r)
        await page.select_option('select[data-f=row-mac]','M100'); await page.wait_for_timeout(200)
        r=await page.evaluate("()=>{const r=window.__form.read();return {errs:r.errs,quy:r.sample.mau.quy_cach,loai:r.sample.mau.loai,ten:r.sample.mau.ten,tests:r.sample.chi_tieu}}"); print('đã chọn M100',r)
        await page.click('button:has-text("+ Thêm mẫu")'); await page.wait_for_timeout(300)
        print('số ô mác sau thêm dòng (nhân bản dòng 1):',await page.evaluate("()=>[...document.querySelectorAll('select[data-f=row-mac]')].map(s=>s.value)"))
        ms=await page.query_selector_all('select[data-f=row-mac]'); await ms[1].select_option('M50')
        await page.click('button:has-text("+ Thêm mẫu")'); await page.wait_for_timeout(300)
        sels=await rowsel(0); await sels[2].select_option('CAT_XD'); await page.wait_for_timeout(300)
        print('ô mác theo dòng',await page.evaluate("()=>[...document.querySelectorAll('tbody tr')].map(tr=>[tr.querySelector('select').value,(tr.querySelector('select[data-f=row-mac]')||{}).value||null])"))
        r=await page.evaluate("()=>{const r=window.__form.read();return {errs:r.errs,quy:r.sample.mau.quy_cach,extra:(r.sample.extra||[]).map(x=>[x.loai,x.quy])}}"); print('read 3 dòng',r)
        await page.screenshot(path='/tmp/w/ui96_manual.png',full_page=True)
        await page.click('button:has-text("Xem xét và tiếp nhận")'); await page.wait_for_selector('#rv-a',timeout=5000)
        print('modal quy cách:',await page.evaluate("()=>[...document.querySelectorAll('.modal dt')].map(d=>d.textContent+'='+d.nextSibling.textContent).filter(x=>/Mác|Quy/.test(x))"))
        for k in 'abc': await page.check('#rv-'+k)
        await page.click('button:has-text("Tiếp nhận và cấp mã mẫu")'); await page.wait_for_timeout(2500)
        print('mẫu đã nhận',await page.evaluate("()=>window.__ptn.S.samples.filter(x=>x.status==='da_tiep_nhan').map(x=>[x.so_yc,x.ma_mau,x.mau.loai,x.mau.quy_cach])"))
        # giao việc: danh sách hiện loại và mác
        print('ERRORS thủ công',errs or 'none'); await br.close()
asyncio.run(main())
