# B7b: sheet Phieu_KQ hiển thị trong app (PKV) phải trùng giá trị LibreOffice tính cho Phieu_KQ, mọi loại mẫu
import asyncio,sys,io,zipfile,base64,re,subprocess,os,shutil,html,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ONLY=sys.argv[2].split(',') if len(sys.argv)>2 and sys.argv[2] else None
OUT='/tmp/w/p123';shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT)
def colN(s):
    n=0
    for ch in s:n=n*26+ord(ch)-64
    return n
def cells(path,sheet='Phieu_KQ'):
    z=zipfile.ZipFile(path)
    ss=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        ss=[html.unescape(re.sub(r'<[^>]+>','',m)) for m in re.findall(r'<si>(.*?)</si>',z.read('xl/sharedStrings.xml').decode(),re.S)]
    wb=z.read('xl/workbook.xml').decode();rel=z.read('xl/_rels/workbook.xml.rels').decode()
    rid=re.search(r'<sheet [^>]*name="%s"[^>]*r:id="([^"]+)"'%sheet,wb).group(1)
    tgt=re.search(r'<Relationship [^>]*Id="%s"[^>]*Target="([^"]+)"'%rid,rel) or re.search(r'<Relationship [^>]*Target="([^"]+)"[^>]*Id="%s"'%rid,rel)
    x=z.read('xl/'+tgt.group(1).lstrip('/').replace('xl/','')).decode()
    out={}
    for m in re.finditer(r'<c r="([A-Z]+\d+)"([^>]*?)(?:/>|>(.*?)</c>)',x,re.S):
        ref,at,b=m.groups();b=b or ''
        v=re.search(r'<v>(.*?)</v>',b,re.S);t=re.search(r'<t[^>]*>(.*?)</t>',b,re.S)
        if 't="s"' in at and v: val=ss[int(v.group(1))]
        elif t: val=html.unescape(t.group(1))
        elif v: val=html.unescape(v.group(1))
        else: continue
        if 't="e"' in at: val='#ERR'
        if val.strip(): out[ref]=(val.strip(),('t="s"' in at or 't="str"' in at or t is not None))
    return out
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type in('warning','error') and 'formula' in m.text else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        res=await page.evaluate("""async(only)=>{const P=window.__ptn,out={};
          for(const code of P.mauCodes()){ if(only&&!only.includes(code))continue;
            const G=P.GT[code];const ph=G?G.ph:(code==='DA_5_20'?P.MF_PH_DA:P.MF_PH);const d={};Object.keys(ph||{}).forEach(k=>{const v=ph[k];d[k]=typeof v==='string'&&v!==''&&!isNaN(+v.replace(',','.'))?+v.replace(',','.'):v;});
            Object.assign(d,G&&G.defaults||{},{d0:'2026-11-06',d1:'2026-11-07',tc:27,ha:60,tt:'',dv:[]});
            if(code==='NEN_BT'||code==='NEN_VUA'){d.duc=46300;d.more=[Object.assign({},d,{ky:'Mẫu hai',tuoi:7,duc:46320,f_0:(+d.f_0||10)+3})];d.more.forEach(x=>{delete x.more;});}
            const s={id:'S1',ma_mau:'M26.11.05.1',so_yc:'YC1',so_bao_cao:'BC26.11.08.3',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'Nguyễn Văn Sự'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'Mẫu thử',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            try{const u8=await P.buildTemplate(s,{id:'NS001',name:'Nguyễn Văn Sự'},{d},{bc:'BC26.11.08.3',hash:'h',url:'u',at:'2026-11-08',qr:null,more:[{bc:'BC26.11.08.4',url:'u2',qr:null}]});
              let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));out[code]={x:btoa(o)};}catch(e){out[code]={err:String(e)}}}
          return out}""",ONLY)
        ok=[c for c,o in res.items() if 'x' in o]
        for c in ok: open('%s/%s.xlsx'%(OUT,c),'wb').write(base64.b64decode(res[c]['x']))
        subprocess.run(['soffice','--headless','--convert-to','xlsx:Calc MS Excel 2007 XML','--outdir',OUT+'/lo']+['%s/%s.xlsx'%(OUT,c) for c in ok],capture_output=True,timeout=1500)
        tot=0;bad=0
        jobs=[(c,'Phieu_KQ') for c in ok]+[(c,'Phieu_KQ_2') for c in ok if c in('NEN_BT','NEN_VUA')]
        for c,sh in jobs:
            r=await page.evaluate("""async([b64,sh])=>{const P=window.__ptn;const u8=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));
              try{const wb=await P.PKV.load(u8);const R=await P.PKV.render(wb,sh);return{texts:R.texts,vis:R.vis,w:R.w,h:R.h,svg:R.el.querySelectorAll('svg').length,img:R.el.querySelectorAll('img').length}}catch(e){return{err:String(e&&e.stack||e)}}}""",[res[c]['x'],sh])
            if 'err' in r: print(c,'LỖI',r['err'][:300]);bad+=1;continue
            lo=cells('%s/lo/%s.xlsx'%(OUT,c),sh)
            ours={k:(t,raw) for k,t,raw in r['texts']}
            vc=set(r['vis']['cols']);vr=set(r['vis']['rows'])
            miss=[];n=0
            for ref,(val,isstr) in lo.items():
                m=re.match(r'([A-Z]+)(\d+)',ref);ci=colN(m.group(1));ri=int(m.group(2))
                if ci not in vc or ri not in vr: continue
                n+=1
                o=ours.get(ref)
                if o is None: miss.append((ref,val,None));continue
                t,raw=o
                if isstr or not re.fullmatch(r'-?[\d.]+(e-?\d+)?',val):
                    nz=lambda s:re.sub(r'[\s.,]','',str(s))
                    if nz(t)!=nz(val): miss.append((ref,val,t))
                else:
                    try:
                        a=float(val);b=raw if isinstance(raw,(int,float)) else None
                        if b is None or abs(a-b)>1e-6*max(1,abs(a)): miss.append((ref,val,t,raw))
                    except Exception as e: miss.append((ref,val,t))
            tot+=n;bad+=len(miss)
            print('%-14s %-10s ô %3d lệch %2d  ảnh %d svg %d  %dx%d'%(c,sh,n,len(miss),r['img'],r['svg'],r['w'],r['h']), miss[:4] if miss else '')
        print('TỔNG ô',tot,'lệch',bad);print(errs[:10]);print('lỗi dựng:',{c:o['err'] for c,o in res.items() if 'err' in o})
asyncio.run(main())
