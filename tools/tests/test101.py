import asyncio, json, sys, base64, io, zipfile, re
import cv2, numpy as np
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SHIM=r"""window.__QRM={};window.qrcode=function(t,ec){let txt='',m=null;return{addData(x){txt=x;},make(){m=window.__QRM[txt];if(!m){window.__QRMISS=(window.__QRMISS||[]).concat([txt]);m=[[1]];}},getModuleCount(){return m.length;},isDark(r,c){return !!m[r][c];}};};"""
SEED=r"""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 P.setSession('NS009');await sleep(150);
 const iso=new Date().toISOString();
 const mk=async(so_yc,kh,ct,loai,ten,status,n)=>{for(let i=0;i<n;i++){const id=P.newSid();const ma=await P.makeCode('mau',iso.slice(0,10),loai);
   const d={kenh:'thu_cong',created_at:iso,created_by:'t',so_yc,ma_mau:ma,khach:{ten:kh,lien_he:'Ông A',email:'a@x.vn'},du_an:{cong_trinh:ct},mau:{loai,ten,ngay_nhan:iso.slice(0,10)},status,chi_tieu:['x'],giao:{ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng'}};
   if(status==='da_phat_hanh')d.so_bao_cao='BC-'+ma;await P.Data.set(P.sp(id),d);}};
 await mk('YC-A1','Công ty Đường Việt','Cầu X','CAT_XD','Cát xây dựng','da_phat_hanh',2);
 await mk('YC-A1','Công ty Đường Việt','Cầu X','CAT_XD','Cát xây dựng','dang_thu',1);
 await mk('YC-B1','Công ty B','Nhà Y','THEP_XD','Thép xây dựng','da_giao',2);
 await P.Data.set('config/bang_gia',{gia:{CAT_XD:200000,THEP_XD:350000}});
 await sleep(700);return 1;})()"""
def matrix(text):
    enc=cv2.QRCodeEncoder.create();img=enc.encode(text)
    return (img==0).astype(int).tolist()
def decode(png_bytes):
    a=np.frombuffer(png_bytes,np.uint8);im=cv2.imdecode(a,cv2.IMREAD_GRAYSCALE)
    d=cv2.QRCodeDetector();v,_,_=d.detectAndDecode(im);return v
def crc(s):
    c=0xFFFF
    for ch in s.encode():
        c^=ch<<8
        for _ in range(8):
            c=((c<<1)^0x1021)&0xFFFF if c&0x8000 else (c<<1)&0xFFFF
    return '%04X'%c
def parse(t):
    out={};i=0
    while i<len(t):
        tag=t[i:i+2];l=int(t[i+2:i+4]);out[tag]=t[i+4:i+4+l];i+=4+l
    return out
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
            elif 'qrcode' in u: await r.fulfill(body=SHIM,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate(SEED)
        async def as_(id,hash_='thanh-toan'):
            await page.evaluate("(a)=>{window.__ptn.setSession(a[0]);location.hash='tong-quan';}",[id,hash_]);await page.wait_for_timeout(500);await page.evaluate("(a)=>{location.hash=a[1];}",[id,hash_]);await page.wait_for_timeout(700)
        async def tab(k):
            await page.click('button[data-tab=%s]'%k);await page.wait_for_timeout(500)
        async def bks():
            return await page.evaluate("()=>window.__ptn.bkAll().map(b=>({id:b.id,so:b.so,tt:b.trang_thai,pay:(b.pay||[]).map(p=>[p.tt,p.so_tien,p.ht]),ls:(b.ls||[]).map(x=>x.hd),tra:b.tra_lai&&b.tra_lai.ly_do,P:window.__ptn.bkPay(b)}))")
        print('== 0. QR chuẩn')
        t=await page.evaluate("()=>window.__ptn.vietQrText({bin:'970405',stk:'3800201005127',amount:1234500,nd:'BK26.11.05.1 CTY ABC'})")
        pr=parse(t);print(t);print('crc ok',crc(t[:-4])==t[-4:],'tag38',parse(pr['38']),'guid/bin',parse(parse(pr['38'])['01']),'54',pr['54'],'62',parse(pr['62']))
        enc=await page.evaluate("()=>window.__ptn.emvCrc('123456789')");print('crc test vector 29B1:',enc)
        d=decode(base64.b64decode(base64.b64encode(cv2.imencode('.png',(np.array(matrix(t),np.uint8)*0+255-np.array(matrix(t),np.uint8)*255).astype(np.uint8))[1].tobytes())))
        print('== 1. Lan lập bảng kê')
        await as_('NS011')
        print('tabs',await page.evaluate("()=>[...document.querySelectorAll('.tabs button')].map(b=>b.textContent)"))
        await page.locator('tr:has-text("YC-A1") button:has-text("Lập riêng")').first.click();await page.wait_for_timeout(500)
        await page.fill('#bk-gc','Giao 2 đợt')
        await page.click('button:has-text("Lưu và cấp số bảng kê")');await page.wait_for_timeout(900)
        print('saved',json.dumps(await bks(),ensure_ascii=False))
        print('steps',await page.evaluate("()=>document.querySelector('[data-sec=steps]').textContent"))
        print('QR box',await page.evaluate("()=>document.querySelector('[data-sec=qr]').textContent"))
        await page.screenshot(path='/tmp/w/f1.png',full_page=True)
        await page.click('button[data-act=wf-gui]');await page.wait_for_timeout(300);await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('after gửi',b['tt'],b['ls'])
        print('locked inputs',await page.evaluate("()=>[...document.querySelectorAll('#bk-kh,#bk-ct')].map(i=>i.disabled)"),'buttons',await page.evaluate("()=>[...document.querySelectorAll('.card button')].map(b=>b.textContent.trim()).filter(Boolean)"))
        print('== 2. Thủ quỹ trả lại rồi soát đạt')
        await as_('NS012')
        print('nav',await page.evaluate("()=>[...document.querySelectorAll('.nav a')].map(a=>a.textContent.trim())"))
        print('việc cần làm',await page.evaluate("()=>(document.querySelector('[data-sec=work]')||{}).textContent"))
        await page.click('[data-sec=work] button[data-act=work-open]');await page.wait_for_timeout(500)
        print('tq buttons',await page.evaluate("()=>[...document.querySelectorAll('.card button')].map(b=>b.textContent.trim()).filter(Boolean)"))
        await page.click('button[data-act=wf-tra]');await page.wait_for_timeout(300)
        await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(300)
        print('toast khi thiếu lý do',await page.evaluate("()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()"))
        await page.fill('.modal textarea','Đơn giá cát sai, kiểm tra lại');await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('sau trả lại',b['tt'],b['tra'])
        await as_('NS011');
        print('Lan thấy',await page.evaluate("()=>(document.querySelector('[data-sec=work]')||{}).textContent"))
        await page.click('[data-sec=work] button[data-act=work-open]');await page.wait_for_timeout(500)
        print('banner',await page.evaluate("()=>(document.querySelector('.banner')||{}).textContent"))
        await page.click('button[data-act=wf-gui]');await page.wait_for_timeout(300);await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        await as_('NS012');await page.click('[data-sec=work] button[data-act=work-open]');await page.wait_for_timeout(500)
        await page.click('button[data-act=wf-soat]');await page.wait_for_timeout(300)
        await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(300)
        print('toast chưa tích',await page.evaluate("()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).pop()"))
        await page.check('.modal input[type=checkbox]');await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('sau soát',b['tt'])
        print('== 3. Giám đốc ghi nhận ký duyệt (Lan không có quyền)')
        await as_('NS011');print('Lan thấy việc cần làm:',await page.evaluate("()=>(document.querySelector('[data-sec=work]')||{}).textContent||'(không có)'"))
        await page.evaluate("()=>window.__ptn.bkAll().length");
        await as_('NS010');print('GĐ thấy:',await page.evaluate("()=>(document.querySelector('[data-sec=work]')||{}).textContent"))
        await page.click('[data-sec=work] button[data-act=work-open]');await page.wait_for_timeout(500)
        print('GĐ nút duyệt',await page.evaluate("()=>!!document.querySelector('button[data-act=wf-duyet]')"),'nút gửi',await page.evaluate("()=>!!document.querySelector('button[data-act=wf-gui]')"))
        # in và Excel bản giấy có QR
        bk=await page.evaluate("()=>{const b=window.__ptn.bkAll()[0];return {text:window.__ptn.bkQrText(b),con:window.__ptn.bkPay(b).con,nd:window.__ptn.bkQrNd(b)}}")
        print('QR bảng kê',bk)
        pq=parse(bk['text']);print('crc ok',crc(bk['text'][:-4])==bk['text'][-4:],'amount',pq['54'],'nd',parse(pq['62']),'stk',parse(parse(pq['38'])['01']))
        await page.evaluate("(m)=>{window.__QRM[m[0]]=m[1];}",[bk['text'],matrix(bk['text'])])
        x=await page.evaluate("async()=>{const P=window.__ptn;const b=P.bkAll()[0];const u=await P.bkXlsx(b);let s='';const C=0x8000;for(let i=0;i<u.length;i+=C)s+=String.fromCharCode.apply(null,u.subarray(i,i+C));return btoa(s);}")
        open('/tmp/w/bk_qr.xlsx','wb').write(base64.b64decode(x))
        z=zipfile.ZipFile('/tmp/w/bk_qr.xlsx');print('xlsx parts',[n for n in z.namelist() if 'draw' in n or 'media' in n])
        if 'xl/media/qr1.png' in z.namelist():
            dec=decode(z.read('xl/media/qr1.png'));print('QR giải mã khớp payload:',dec==bk['text'],dec[:40])
        pr=await page.evaluate("async()=>{const P=window.__ptn;const b=P.bkAll()[0];const box=P.bkPrint(b,await P.bkQr(b));return {sig:[...box.querySelectorAll('div[style*=flex]>div')].map(d=>d.textContent.trim()),all:box.textContent.includes('Ký duyệt'),qr:box.textContent.includes('Nội dung chuyển khoản')}}")
        print('PRINT 3 khối ký',pr)
        zz=zipfile.ZipFile('/tmp/w/bk_qr.xlsx');ss=zz.read('xl/worksheets/sheet1.xml').decode();print('XLSX có Ký duyệt:', 'Ký duyệt' in ss, '| Thủ quỹ:', 'Thủ quỹ' in ss, '| Đại diện khách hàng:', 'Đại diện khách hàng' in ss, '| ND:', re.findall(r'Nội dung chuyển khoản: [^<]*',ss))
        await page.click('button[data-act=wf-duyet]');await page.wait_for_timeout(300);await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('sau ký duyệt',b['tt'],b['P'])
        print('pill',await page.evaluate("()=>document.querySelector('.card-h .pill, .card-h [class*=pill]')?.textContent"))
        await page.screenshot(path='/tmp/w/f3.png',full_page=True)
        print('== 4. Giai đoạn 2')
        await as_('NS011');await tab('tonghop')
        print('tổng hợp',await page.evaluate("()=>[...document.querySelectorAll('table.bk-sum tbody tr')].map(r=>[...r.cells].map(c=>c.textContent.trim()).join(' | '))"))
        await page.check('table.bk-sum tbody tr:first-child input[type=checkbox]');await page.click('button[data-act=sum-send]');await page.wait_for_timeout(400)
        tot=(await bks())[0]['P']['tt'];half=tot//2
        await page.fill('.modal table input[type=number]',str(half));await page.click('.modal button[data-act=pay-send]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('đề nghị 1',b['pay'],b['P'])
        await as_('NS012');await tab('tonghop')
        print('pend',await page.evaluate("()=>(document.querySelector('[data-sec=pend]')||{}).textContent?.slice(0,200)"))
        await page.click('[data-sec=pend] button[data-act=pay-ok]');await page.wait_for_timeout(300);await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(900)
        b=(await bks())[0];print('xác nhận 1',b['pay'],b['P'])
        await as_('NS011');await tab('tonghop')
        print('dòng',await page.evaluate("()=>[...document.querySelectorAll('table.bk-sum tbody tr')].map(r=>[...r.cells].map(c=>c.textContent.trim()).join(' | '))"))
        await page.check('table.bk-sum tbody tr:first-child input[type=checkbox]');await page.click('button[data-act=sum-send]');await page.wait_for_timeout(400)
        await page.select_option('.modal select','tm');await page.click('.modal button[data-act=pay-send]');await page.wait_for_timeout(900)
        await as_('NS012');await tab('tonghop');await page.click('[data-sec=pend] button[data-act=pay-ok]');await page.wait_for_timeout(300);await page.click('.modal button[data-act=dlg-ok]');await page.wait_for_timeout(1200)
        b=(await bks())[0];print('xác nhận 2',b['pay'],b['P'])
        tts=await page.evaluate("()=>window.__ptn.S.samples.filter(s=>s.so_yc==='YC-A1').map(s=>(s.tt||{}).thanh_toan)");print('mẫu đã thanh toán',tts)
        await page.screenshot(path='/tmp/w/f4.png',full_page=True)
        print('== 5. Giám đốc, KTT xem')
        for id in ('NS010','NS013'):
            await as_(id);await tab('tonghop')
            print(id,'rows',await page.evaluate("()=>document.querySelectorAll('table.bk-sum tbody tr').length"),'checkbox',await page.evaluate("()=>document.querySelectorAll('table.bk-sum input[type=checkbox]').length"),'send btn',await page.evaluate("()=>!!document.querySelector('button[data-act=sum-send]')&&document.querySelector('button[data-act=sum-send]').disabled"))
            await tab('bangke');await page.locator('tbody button:has-text("Mở")').first.click();await page.wait_for_timeout(500)
            print(id,'editor buttons',await page.evaluate("()=>[...document.querySelectorAll('.card > button, .card .row button')].map(b=>b.textContent.trim()).filter(x=>x&&!/Đóng/.test(x))"),'inputs disabled',await page.evaluate("()=>[...document.querySelectorAll('#bk-kh,#bk-ct,#bk-gc')].map(i=>i.disabled)"))
        await as_('NS001');print('tn nav',await page.evaluate("()=>[...document.querySelectorAll('.nav a')].map(a=>a.textContent.trim())"))
        print('== 6. Excel tổng hợp')
        await as_('NS010');await tab('tonghop')
        xs=await page.evaluate("async()=>{const P=window.__ptn;const l=P.bkSumRows({q:'',st:'',from:'',to:''});const rows=l.map((b,i)=>[i+1].concat([b.khach.ten,b.cong_trinh||'',b.so,P.bkPay(b).tt,P.bkPay(b).da,P.bkPay(b).con,'','','']));const u=await P.bkTblXlsx('T','s',['TT','Tên khách hàng','Công trình','Số bảng kê','Giá trị (đ)','Đã thanh toán (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái'],rows,{num:[4,5,6],sum:[4,5,6],widths:[6,34,40,18,16,18,16,14,16,26]});let s='';for(let i=0;i<u.length;i+=8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+8000));return btoa(s);}")
        open('/tmp/w/tong_hop.xlsx','wb').write(base64.b64decode(xs))
        print('errs',errs)
        await br.close()
asyncio.run(main())
