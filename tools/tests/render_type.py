import asyncio, sys, base64, os
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];OUT=sys.argv[2];codes=sys.argv[3].split(',')
os.makedirs(OUT,exist_ok=True)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context(viewport={'width':1280,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        for code in codes:
            b=await page.evaluate("""async(code)=>{const P=window.__ptn,G=P.GT[code];
              const s={ma_mau:'M26.11.05.1',so_yc:'YC26.11.05.1',so_bao_cao:'BC26.11.08.3',giao:{ma_gv:'GV1'},khach:{ten:'Công ty TNHH Xây dựng Hoàng Long'},du_an:{cong_trinh:'Đường giao thông Đồng Hới - Lệ Thủy',hang_muc:'Nền đường',chu_dau_tu:'BQLDA',giam_sat:'TVGS ABC',thi_cong:'Công ty TNHH Xây dựng Hoàng Long',dia_chi:'Quảng Trị'},mau:{loai:code,ten:'Mẫu thử',nguon_goc:'Mỏ X',quy_cach:'Mẫu 15x15',ngay_nhan:'2026-11-05'},chi_tieu:[]};
              const ph={};if(G)Object.keys(G.ph||{}).forEach(k=>{const v=G.ph[k];ph[k]=(typeof v==='string'&&v!==''&&!isNaN(+v.replace(',','.')))?+v.replace(',','.'):v;});const d=Object.assign({},ph, {d0:'2026-11-06',d1:'2026-11-07',tc:27,ha:60,tt:'',dv:[]});
              const u8=await P.buildTemplate(s,{id:'NS001',name:'Nguyễn Văn A'},G?{d}:null,{bc:'BC26.11.08.3',hash:'h',url:'',at:'2026-11-08',qr:null});
              let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));return btoa(o)}""",code)
            open(OUT+'/'+code+'.xlsx','wb').write(base64.b64decode(b))
        print('errs',errs)
asyncio.run(main())
