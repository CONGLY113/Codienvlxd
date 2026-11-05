import asyncio, json, sys, base64, subprocess, os, re, zipfile, io
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
def excelish(b):
    zin=zipfile.ZipFile(io.BytesIO(b));out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as zo:
        for n in zin.namelist():
            d=zin.read(n)
            if n.startswith('xl/worksheets/sheet'):
                x=d.decode('utf8')
                x=re.sub(r'(<f\b[^>]*>)([^<]*)(</f>)',lambda m:m.group(1)+m.group(2).replace('&quot;','"')+m.group(3),x)
                d=x.encode('utf8')
            zo.writestr(n,d)
    return out.getvalue()
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page()
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        b64s=await page.evaluate("()=>window.__ptn.mauCodes().map(c=>[c,window.__ptn.origB64(c)])")
        tot=0;bad=0
        for c,b in b64s:
            raw=base64.b64decode(b)
            for kind,data in [('excelish',excelish(raw))]:
                v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",[c,base64.b64encode(data).decode()])
                tot+=1
                if v['E']: bad+=1;print(c,kind,v['E'][:3])
        print('excelish: %d/%d lỗi'%(bad,tot))
        # LibreOffice vòng ghi lại
        for c,b in b64s:
            if c not in ('CAT_XD','XM_PCB40','DA_5_20','DO_CS','CP_BT','THEP_XD'):continue
            p='/tmp/w/rt103/%s.xlsx'%c;open(p,'wb').write(base64.b64decode(b))
            subprocess.run(['soffice','--headless','--convert-to','xlsx:Calc MS Excel 2007 XML','--outdir','/tmp/w/rt103/out',p],capture_output=True,timeout=120)
            q='/tmp/w/rt103/out/%s.xlsx'%c
            if not os.path.exists(q):print('no lo out',c);continue
            v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",[c,base64.b64encode(open(q,'rb').read()).decode()])
            print('LO',c,'E:',[e[:140] for e in v['E']][:4],'W:',v['W'][:2])
        await br.close()
asyncio.run(main())
