import asyncio, sys, json
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
        res=await page.evaluate("""async()=>{const P=window.__ptn,out={};
          for(const code of P.mauCodes()){
            const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            const mk=async extra=>{const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},null,extra);const z=await JSZip.loadAsync(u8);const x=await z.file('xl/worksheets/sheet4.xml').async('string');return x;};
            const x=await mk({bc:'BC26.11.08.3',hash:'h',url:'',at:'2026-11-08',qr:null}),y=await mk(null);
            out[code]={m:/<pageMargins[^>]*>/.exec(x)[0],ps:/<pageSetup[^>]*>/.exec(x)[0],fit:/fitToPage/.test(x),
              a5:/<c r="A5"[^>]*>[\\s\\S]*?<\\/c>/.exec(x)[0],date:/Quảng Trị, ngày 08 tháng 11 năm 2026/.test(x),dateDraft:/Quảng Trị, ngày\\s+tháng\\s+năm/.test(y),
              sp:/<row r="\\d+" ht="65" customHeight="1"/.test(x),tit:/PHIẾU KẾT QUẢ THỬ NGHIỆM/.test(x)&&!/<row r="4"[^>]*hidden="1"/.test(x),
              ctt:/Cán bộ thử nghiệm/.test(x),trpt:/Trưởng phòng TN/.test(x),qc:x.includes('Mẫu do đơn vị thi công và tư vấn giám sát lấy'),a5d:/<c r="A5"[^>]*>[\\s\\S]*?<\\/c>/.exec(y)[0]};
          }return out}""")
        print(len(res),'mẫu')
        for c,o in res.items():
            chk('top="1.6142"' in o['m'] and 'bottom="0.8661"' in o['m'] and 'left="0.6693"' in o['m'] and 'right="0.1969"' in o['m'],c+' lề '+o['m'])
            chk('scale="100"' in o['ps'] and not o['fit'] and 'fitToWidth' not in o['ps'],c+' scale '+o['ps'])
            chk('Số báo cáo: BC26.11.08.3' in o['a5'],c+' a5 '+o['a5'][:120])
            chk(o['date'],c+' dòng ngày');chk(o['dateDraft'],c+' dòng ngày bản nháp')
            chk(o['sp'],c+' hàng cách 65');chk(not o['tit'],c+' tiêu đề còn hiển thị')
            chk(not o['ctt'] and not o['trpt'],c+' còn tiêu đề người ký')
            if c not in ('NEN_BT','NEN_VUA','DO_CS'): chk(o['qc'],c+' quy cách')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
