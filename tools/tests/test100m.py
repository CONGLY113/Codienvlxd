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
        ctx=await br.new_context(viewport={'width':390,'height':800},device_scale_factor=2)
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

        async def as_(id,hash_='thanh-toan'):
            await page.evaluate("(a)=>{window.__ptn.setSession(a[0]);location.hash='tong-quan';}",[id,hash_]);await page.wait_for_timeout(500);await page.evaluate("(a)=>{location.hash=a[1];}",[id,hash_]);await page.wait_for_timeout(700)
        async def tab(k):
            await page.click('button[data-tab=%s]'%k);await page.wait_for_timeout(500)
        print('== legacy')
        await page.evaluate("""async()=>{const P=window.__ptn;const y=String(new Date().getFullYear()%100);
          const base={so:'BK26.01.01.1',ngay:'2026-01-01',khach:{ten:'Khách cũ'},cong_trinh:'CT cũ',yc:['YC-X'],ycKeys:['YC-X'],dong:[{k:'a',ten:'Cát',loai:'CAT_XD',sl:2,n:2,xong:2,don_gia:100000,ma:['M1']}],giam:{kieu:'pct',gt:0}};
          await P.Data.set('bangke_'+y+'/old1',Object.assign({},base,{trang_thai:'da_gui'}));
          await P.Data.set('bangke_'+y+'/old2',Object.assign({},base,{so:'BK26.01.01.2',trang_thai:'da_thu',thu:{at:'2026-01-05T03:00:00.000Z',by:'Lan',so_tien:200000}}));
          await new Promise(r=>setTimeout(r,800));}""")
        await as_('NS010');await tab('tonghop')
        print(await page.evaluate("()=>[...document.querySelectorAll('table.bk-sum tbody tr')].map(r=>[...r.cells].map(c=>c.textContent.trim()).join(' | '))"))
        await page.screenshot(path='/tmp/w/m1.png',full_page=True)
        await tab('bangke');await page.locator('tbody button:has-text("Mở")').first.click();await page.wait_for_timeout(500)
        await page.screenshot(path='/tmp/w/m2.png',full_page=True)
        print('overflow',await page.evaluate("()=>[document.documentElement.scrollWidth,window.innerWidth]"))
        await br.close()
asyncio.run(main())
