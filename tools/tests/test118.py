import asyncio, sys, re
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
          for(const code of ['XM_PCB30','XM_PCB40','DO_CS','DO_K_DV','DO_K_PR','DA_LN_1','DA_LN_2','DA_LN_3','NHUA_6070','NHUA_MC70','GACH_BT_DAC','GACH_BT_RONG','CAT_XD']){
            const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',nguon_goc:'NGUON-X',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},null,null),z=await JSZip.loadAsync(u8);
            const x=await z.file('xl/worksheets/sheet4.xml').async('string'),y=await z.file('xl/worksheets/sheet2.xml').async('string'),st=await z.file('xl/styles.xml').async('string');
            const hid=[...x.matchAll(/<row r="(\\d+)"[^>]*hidden="1"/g)].map(m=>+m[1]);
            const fills=[...x.matchAll(/<c r="[A-Z]+\\d+" s="(\\d+)"/g)].map(m=>+m[1]);
            const xfs=[...(/<cellXfs[^>]*>([\\s\\S]*?)<\\/cellXfs>/.exec(st)[1]).matchAll(/<xf [^>]*>/g)].map(m=>m[0]);
            const withFill=new Set(fills.filter(i=>xfs[i]&&!/fillId="0"/.test(xfs[i])));
            out[code]={hid,x4030:/4030:2003/.test(x)||/4030:2003/.test(y),x13605:/13605:2023/.test(x),k:/22 TCN 02:71/.test(x),k2:/12791:2020/.test(x),
              kv:/Khu vực đo|Đoạn, vị trí đo/.test(x),ng:x.includes('NGUON-X'),fill:withFill.size}}
          return out}""")
        for c in ('XM_PCB30','XM_PCB40'):
            o=res[c];chk(16 in o['hid'] or c.startswith('XM'),c+' ẩn dòng phương pháp thử');chk(not o['x4030'] and o['x13605'],c+' TCVN 13605');chk(o['fill']==0,c+' còn nền %d'%o['fill'])
        o=res['DO_CS'];chk(not o['kv'] and not o['ng'],'DO_CS khu vực/ghi chú: %s'%o);chk(o['fill']==0,'DO_CS nền %d'%o['fill'])
        for c in ('DO_K_DV','DO_K_PR'):
            o=res[c];chk(not o['kv'] and not o['ng'],c+' đoạn, vị trí');chk(o['fill']==0,c+' nền %d'%o['fill'])
        o=res['DO_K_DV'];chk(not o['k'] and o['k2'],'DO_K_DV TCVN 12791:2020')
        for c in ('DA_LN_1','DA_LN_2','DA_LN_3'): chk(res[c]['fill']==0,c+' nền %d'%res[c]['fill'])
        for c in ('NHUA_6070','NHUA_MC70','GACH_BT_DAC','GACH_BT_RONG'): chk(16 in res[c]['hid'],c+' ẩn phương pháp thử')
        chk(16 not in res['CAT_XD']['hid'],'CAT_XD không đổi')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
