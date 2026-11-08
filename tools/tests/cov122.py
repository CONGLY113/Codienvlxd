# tích hợp renderPhieu -> sheet Phieu_KQ (nguồn phieu_kq); đối chiếu từng ô chính xác nằm ở pkv123.py. Độ phủ: mọi giá trị hiển thị trong sheet Phieu_KQ (đã tính bằng LibreOffice) phải có mặt trong phiếu hiển thị ở Hồ sơ lưu trữ (renderPhieu)
import asyncio,sys,io,zipfile,base64,re,subprocess,os,shutil,html,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ONLY=sys.argv[2].split(',') if len(sys.argv)>2 else None
OUT='/tmp/w/c122';shutil.rmtree(OUT,ignore_errors=True);os.makedirs(OUT)
def cells(path):
    z=zipfile.ZipFile(path)
    ss=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        ss=[html.unescape(re.sub(r'<[^>]+>','',m)) for m in re.findall(r'<si>(.*?)</si>',z.read('xl/sharedStrings.xml').decode(),re.S)]
    wb=z.read('xl/workbook.xml').decode();rel=z.read('xl/_rels/workbook.xml.rels').decode()
    rid=re.search(r'<sheet [^>]*name="Phieu_KQ"[^>]*r:id="([^"]+)"',wb).group(1)
    tgt=re.search(r'<Relationship [^>]*Id="%s"[^>]*Target="([^"]+)"'%rid,rel) or re.search(r'<Relationship [^>]*Target="([^"]+)"[^>]*Id="%s"'%rid,rel)
    x=z.read('xl/'+tgt.group(1).lstrip('/').replace('xl/','')).decode()
    out=[]
    for m in re.finditer(r'<c r="([A-Z]+\d+)"([^>]*?)(?:/>|>(.*?)</c>)',x,re.S):
        ref,at,b=m.groups();b=b or ''
        v=re.search(r'<v>(.*?)</v>',b,re.S);t=re.search(r'<t[^>]*>(.*?)</t>',b,re.S)
        if 't="s"' in at and v: val=ss[int(v.group(1))]
        elif t: val=html.unescape(t.group(1))
        elif v: val=html.unescape(v.group(1))
        else: continue
        if val.strip(): out.append((ref,val.strip()))
    return out
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
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
            const s={id:'S1',ma_mau:'M26.11.05.1',so_yc:'YC1',so_bao_cao:'BC26.11.08.3',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'Nguyễn Văn Sự'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'Mẫu thử',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            try{const u8=await P.buildTemplate(s,{id:'NS001',name:'Nguyễn Văn Sự'},{d},{bc:'BC26.11.08.3',hash:'h',url:'u',at:'2026-11-08',qr:null});
              let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));out[code]={x:btoa(o),d};}catch(e){out[code]={err:String(e)}}}
          return out}""",ONLY)
        ok=[c for c,o in res.items() if 'x' in o]
        for c in ok: open('%s/%s.xlsx'%(OUT,c),'wb').write(base64.b64decode(res[c]['x']))
        subprocess.run(['soffice','--headless','--convert-to','xlsx:Calc MS Excel 2007 XML','--outdir',OUT+'/lo']+['%s/%s.xlsx'%(OUT,c) for c in ok],capture_output=True,timeout=900)
        report={}
        for c in ok:
            b=open('%s/lo/%s.xlsx'%(OUT,c),'rb').read()
            r=await page.evaluate("""async([code,b64,d])=>{const P=window.__ptn;const u8=Uint8Array.from(atob(b64),x=>x.charCodeAt(0));
              const s={id:'S1',ma_mau:'M26.11.05.1',so_yc:'YC1',so_bao_cao:'BC26.11.08.3',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'Nguyễn Văn Sự'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'Mẫu thử',ngay_nhan:'2026-11-05'},chi_tieu:[]};
              const a=await P.analyzeUpload(s,u8);
              const s2=Object.assign({},s,{status:'da_phat_hanh',nop:{results:a.results,sieve:a.sieve,raw:a.raw,d0:'2026-11-06',d1:'2026-11-07',nhiet_do:27,do_am:60,sketch:a.sketch||null}});
              const el=P.renderPhieu(s2);for(let i=0;i<100&&!el.dataset.src;i++)await new Promise(r=>setTimeout(r,50));return{src:el.dataset.src,text:el.innerText||el.textContent,html:el.innerHTML,hasSvg:/<svg/.test(el.innerHTML),ok:a.ok}}""",[c,base64.b64encode(b).decode(),res[c]['d']])
            open('%s/%s.txt'%(OUT,c),'w',encoding='utf8').write(r['text'])
            cs=cells('%s/lo/%s.xlsx'%(OUT,c))
            txt=re.sub(r'\s+',' ',r['text']).replace(' ',' ')
            norm=lambda t:re.sub(r'\s+',' ',t).strip().replace(',','.')
            miss=[(ref,v) for ref,v in cs if norm(v) not in txt and not re.fullmatch(r'(CHƯA|THIẾU|OK|FALSE|TRUE)',v)]
            report[c]={'n':len(cs),'miss':miss,'svg':r['hasSvg'],'ok':r['ok'],'src':r['src']}
        json.dump(report,open('/tmp/w/cov122.json','w'),ensure_ascii=False,indent=1)
        for c,o in report.items(): print(c,'ô',o['n'],'thiếu',len(o['miss']),'svg',o['svg'],'ok',o['ok'],'nguồn',o['src'])
        print('lỗi dựng:',{c:o['err'] for c,o in res.items() if 'err' in o});print(errs)
asyncio.run(main())
