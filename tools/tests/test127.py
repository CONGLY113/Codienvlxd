# C3: nén bê tông/vữa: ký hiệu mẫu, ngày đúc, tuổi mẫu nhập ở So_lieu, điền sang Phieu_KQ
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
        page=await (await br.new_context(viewport={'width':1000,'height':1000})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        for loai,mac,fs,unit in [('NEN_BT',250,[620,640,600],'daN/cm²'),('NEN_VUA',7.5,[20,21,19,22,20,21],'N/mm²')]:
            r=await page.evaluate("""async([loai,mac,fs])=>{const P=window.__ptn;
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',so_bao_cao:'BC26.11.09.3',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:'x',ngay_nhan:'2026-11-05',ngay_lay:'2026-10-08'},chi_tieu:[]};
              const d={mac,tuoi:28,canh:150,n:fs.length,ky:'BT-M250-01',duc:46303,d0:'2026-11-05',d1:'2026-11-05',dv:[]};fs.forEach((f,i)=>d['f_'+i]=f);
              const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},{d},{bc:'BC26.11.09.3',hash:'h',url:'u',at:'2026-11-09',qr:null});
              const wb=await P.PKV.load(u8);const so=wb.sheets.So_lieu;const R=await P.PKV.render(wb,'Phieu_KQ');
              const cell=k=>{const c=so.cells[k];return c?(c.v!=null?c.v:null):null};
              const an=await P.analyzeUpload(s,u8);
              return {d4:cell('B5'),d5:cell('E5'),c4:cell('B4'),c5:cell('E4'),txt:[...R.el.querySelectorAll('tr')].map(t=>[...t.children].map(c=>c.textContent.trim()).filter(Boolean).join(' | ')).join(String.fromCharCode(10)),raw:an.raw?{ky:an.raw.ky,duc:an.raw.duc,tuoi:an.raw.tuoi}:null,checks:an.checks.filter(c=>c.state==='fail').map(c=>c.label)}}""",[loai,mac,fs])
            chk(r['d4']=='BT-M250-01' and r['d5']==46303 and r['c4']=='Ký hiệu mẫu' and r['c5']=='Ngày đúc',loai+' So_lieu bảng B5/E5: %s %s'%(r['d4'],r['d5']))
            chk('Ký hiệu mẫu: | BT-M250-01' in r['txt'],loai+' Phieu_KQ ký hiệu mẫu')
            chk('Ngày đúc mẫu: | 08/10/2026' in r['txt'],loai+' Phieu_KQ ngày đúc')
            chk('Tuổi mẫu: | (ngày) | 28' in r['txt'],loai+' tuổi mẫu')
            chk(r['raw'] and r['raw']['ky']=='BT-M250-01' and r['raw']['duc']==46303 and r['raw']['tuoi']==28,loai+' đọc lại từ file: %s'%r['raw'])
            chk(not r['checks'],loai+' file nộp không lỗi: %s'%r['checks'])
        # form nhập số liệu: ngày đúc -> tuổi
        SETUP="""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));P.setSession('NS009');await sleep(150);
         const id=P.newSid();const nhan='2026-11-05';const d={kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-T1',ma_mau:'',khach:{ten:'K'},du_an:{cong_trinh:'CT'},mau:{loai:'NEN_BT',ten:'Bê tông',nguon_goc:'N',ngay_nhan:nhan,ngay_lay:'2026-10-08'},chi_tieu:P.defTests('NEN_BT'),han_tra:nhan};
         d.status='da_giao';d.ma_mau=await P.makeCode('mau',nhan,'NEN_BT');d.giao={ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()};await P.Data.set(P.sp(id),d);
         await sleep(400);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(700);return id;})()"""
        await page.evaluate(SETUP);await page.wait_for_selector('.mf-sec',timeout=5000)
        v=await page.evaluate("()=>[...document.querySelectorAll('.mf-sec input[type=date]')].map(x=>x.value)")
        chk(v[0]=='2026-11-05' and v[2]=='2026-10-08' or '2026-10-08' in v,'ô ngày đúc mặc định theo ngày lấy mẫu %s'%v)
        t=await page.inner_text('.mf-sec:nth-of-type(2)') if False else await page.inner_text('main,.main')
        chk('Ký hiệu mẫu' in t and 'Ngày đúc mẫu' in t and 'Tuổi mẫu' in t,'có 3 ô nhập')
        tuoi=await page.evaluate("()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith('Tuổi mẫu'));return l&&l.querySelector('input').value}")
        chk(tuoi=='28','tuổi mặc định 28: %s'%tuoi)
        await page.evaluate("()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith('Ngày đúc'));const i=l.querySelector('input');i.value='2026-10-29';i.dispatchEvent(new Event('change'))}")
        await page.wait_for_timeout(600)
        tuoi=await page.evaluate("()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith('Tuổi mẫu'));return l&&l.querySelector('input').value}")
        chk(tuoi=='7','đổi ngày đúc -> tuổi 7: %s'%tuoi)
        await page.evaluate("()=>{const l=[...document.querySelectorAll('label')].find(x=>x.textContent.startsWith('Ký hiệu mẫu'));const i=l.querySelector('input');i.value='BT-M300-02';i.dispatchEvent(new Event('input'))}")
        raw=await page.evaluate("()=>{const m=JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('ptn_mf_')&&k!=='ptn_mf_cur')));return [m.ky,m.duc,m.tuoi]}")
        chk(raw[0]=='BT-M300-02' and raw[1]==46324 and raw[2]==7,'lưu nháp %s'%raw)
        chk(not errs,'lỗi trang %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
