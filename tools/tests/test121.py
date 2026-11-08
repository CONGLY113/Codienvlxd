# vòng khép kín đá dăm 5-20 / 10-40 / 20-70: tạo file, LibreOffice tính lại, hệ thống đọc và đối chiếu với tính lại của ứng dụng
import asyncio,sys,io,zipfile,base64,re,subprocess,os,shutil
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=bad=0;errs=[]
OUT='/tmp/w/t121';shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT)
def chk(c,m):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',m)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page()
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
          for(const code of ['DA_5_20','DA_10_40','DA_20_70']){
            const G=P.GT[code];const ph=G?G.ph:P.MF_PH_DA;const d={};Object.keys(ph).forEach(k=>{const v=ph[k];d[k]=typeof v==='string'&&v!==''&&!isNaN(+v.replace(',','.'))?+v.replace(',','.'):v;});
            Object.assign(d,{d0:'2026-11-06',d1:'2026-11-07',dv:[]});
            const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},{d},null);
            let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));
            out[code]={x:btoa(o),d};}
          return out}""")
        for c,o in res.items():
            open('%s/%s.xlsx'%(OUT,c),'wb').write(base64.b64decode(o['x']))
        subprocess.run(['soffice','--headless','--convert-to','xlsx:Calc MS Excel 2007 XML','--outdir',OUT+'/lo']+['%s/%s.xlsx'%(OUT,c) for c in res],capture_output=True,timeout=240)
        for c,o in res.items():
            b=open('%s/lo/%s.xlsx'%(OUT,c),'rb').read()
            r=await page.evaluate("""async([code,b64,d])=>{const P=window.__ptn;const u8=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[]};
              const G=P.GT[code];const rc=G?G.rc(d):P.recomputeDA(d);const a=await P.analyzeUpload(s,u8);
              return{checks:a.checks.map(x=>[x.label,x.state,x.note]),results:a.results,rc:{sc:rc.sc,rx:rc.rx,td:rc.td,nd:rc.nd,la:rc.la,dmax:rc.dmax,dmin:rc.dmin}}}""",[c,base64.b64encode(b).decode(),o['d']])
            fails=[x for x in r['checks'] if x[1]=='fail']
            for f in fails: print('  ',c,f)
            chk(not fails,c+' không có mục fail')
            for k in ['sc','rx','td','nd','la','dmax','dmin']:
                v=(r['results'] or {}).get(k);e=r['rc'][k]
                chk(v is not None and e is not None and abs(v-e)<1e-6*max(1,abs(e)),'%s %s file=%s app=%s'%(c,k,v,e))
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
