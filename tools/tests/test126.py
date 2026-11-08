# C1: chức danh dòng ký chỉ hiện ở web app, không có trong file Excel
import asyncio,sys,io,zipfile,base64,re
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
        page=await (await br.new_context(viewport={'width':900,'height':1200})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        for loai in ['DA_5_20','CAT_XD','NEN_BT','XM_PCB40','THEP_XD','CP_BT','DO_CS']:
            r=await page.evaluate("""async(loai)=>{const P=window.__ptn;
              const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[],giao:{ma_nv:'NS001',ten:'Nguyễn Văn Sự'},soat_xet:{by:'Hoàng Công Lý'},phieu:{bc:'BC26.11.09.3',hash:'h',url:'u',at:'2026-11-09'},nop:{d0:'2026-11-05',d1:'2026-11-09',raw:{}},status:'da_phat_hanh',so_bao_cao:'BC26.11.09.3'};
              const host=P.renderPhieu(s);document.body.innerHTML='';document.body.append(host);await new Promise(r=>setTimeout(r,2500));
              const t=[...host.querySelectorAll('tr')],i=t.findIndex(x=>x.className==='pkv-sign-title');
              const xl=await P.buildTemplate(s,{id:'NS001',name:'A'},{d:{d0:'2026-11-05',d1:'2026-11-09',dv:[]}},{bc:'BC26.11.09.3',hash:'h',url:'u',at:'2026-11-09',qr:null});
              let o='';for(let k=0;k<xl.length;k+=8192)o+=String.fromCharCode.apply(null,xl.subarray(k,k+8192));
              return {src:host.dataset.src,i,titles:i>=0?t[i].textContent:'',prev:i>0?t[i-1].textContent:'',next:i>=0?t[i+2].textContent:'',x:btoa(o)}}""",loai)
            chk(r['src']=='phieu_kq',loai+' dựng từ Phieu_KQ')
            chk(r['i']>0 and 'Cán bộ thử nghiệm' in r['titles'] and 'Giám đốc' in r['titles'] and 'Trưởng phòng TN' in r['titles'],loai+' có chức danh: %s'%r['titles'])
            chk('Quảng Trị, ngày' in r['prev'] and 'Nguyễn Văn Sự' in r['next'],loai+' thứ tự ngày, chức danh, tên')
            z=zipfile.ZipFile(io.BytesIO(base64.b64decode(r['x'])))
            sh=' '.join(z.read(n).decode('utf8','ignore') for n in z.namelist() if n.startswith('xl/worksheets/') or n=='xl/sharedStrings.xml')
        # file Excel của phiếu không có dòng chức danh trong Phieu_KQ
        r=await page.evaluate("""async()=>{const P=window.__ptn;const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:'DA_5_20',ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[],giao:{ma_nv:'NS001',ten:'A'}};
          const xl=await P.buildTemplate(s,{id:'NS001',name:'A'},{d:{d0:'2026-11-05',d1:'2026-11-09',dv:[]}},{bc:'BC26.11.09.3',hash:'h',url:'u',at:'2026-11-09',qr:null});
          const wb=await P.PKV.load(xl);const R=await P.PKV.render(wb,'Phieu_KQ');return R.el.textContent}""")
        chk('Cán bộ thử nghiệm' not in r and 'Quảng Trị, ngày' in r,'file Excel không có dòng chức danh')
        chk(not errs,'lỗi %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
