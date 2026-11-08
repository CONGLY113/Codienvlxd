import asyncio, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,m):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',m)
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
        ev=page.evaluate
        r=await ev("""()=>{const P=window.__ptn;return[P.envNeed('XM_PCB30'),P.envNeed('XM_PCB40'),P.envNeed('CAT_XD'),P.envNeed('DA_5_20'),P.envNeed('THEP_XD')]}""")
        chk(r==[True,True,False,False,False],'envNeed '+str(r))
        n=await ev("""()=>{const P=window.__ptn;return P.bcFileName({so_bao_cao:'BC26.11.08.3',du_an:{thi_cong:'Công ty TNHH Xây dựng Hoàng Long',cong_trinh:'Đường giao thông Đồng Hới - Lệ Thủy, gói thầu XL01'},khach:{ten:'KH'}})}""")
        print(n)
        chk(n.startswith('BC.08.11.2026.3. ') and n.endswith('.xlsx') and 'Cty' in n,'tên file '+n)
        chk('/' not in n and '..' not in n.replace('.xlsx',''),'ký tự cấm')
        # buildTemplate cho cát, xi măng
        res=await ev("""async()=>{const P=window.__ptn;const out={};
          for(const code of ['CAT_XD','XM_PCB30','THEP_XD','DA_5_20']){
            const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-07'},chi_tieu:[]};
            const u8=await P.buildTemplate(s,{id:'NS001',name:'A'});
            const z=await JSZip.loadAsync(u8);
            const t=await z.file('xl/worksheets/sheet1.xml').async('string'),k=await z.file('xl/worksheets/sheet3.xml').async('string');
            out[code]={nd:/Nhi.t..\\u0111.\\u1ed9.ph.ng/.test(t)||t.includes('Nhiệt độ phòng thử'),c7:(/<c r="C7"[^>]*>(.*?)<\\/c>/.exec(k)||[])[1]||'',b7:(/<c r="B7"[^>]*>(.*?)<\\/c>/.exec(k)||[])[1]||''};}
          return out}""")
        print(res)
        chk(res['XM_PCB30']['nd'],'xi măng còn nhiệt độ')
        for c in ['CAT_XD','THEP_XD','DA_5_20']:
            chk(not res[c]['nd'],c+' còn nhiệt độ')
            chk('"OK"' in res[c]['c7'].replace('&quot;','"'),c+' Kiem_tra C7 '+res[c]['c7'])
        chk('Thong_tin!B25' in res['XM_PCB30']['c7'].replace('&lt;','<').replace('&gt;','>') or 'B25' in res['XM_PCB30']['c7'],'xi măng giữ kiểm tra')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
