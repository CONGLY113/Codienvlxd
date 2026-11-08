# test119: cấu trúc sheet Phieu_KQ của cả 31 biểu mẫu sau khi dựng: ô gộp không chồng nhau, hàng/ô đúng thứ tự, không trùng ô, vùng in phủ hết nội dung
import asyncio, sys, base64, re, zipfile, io, os
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
ok=bad=0
def chk(c,m):
    global ok,bad
    if c: ok+=1
    else: bad+=1; print('  FAIL',m)
def cn(L):
    n=0
    for ch in L: n=n*26+ord(ch)-64
    return n
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
        res=await page.evaluate("""async()=>{const P=window.__ptn,out={};
          for(const code of P.mauCodes()){
            const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            const G=P.GT[code],ph={};if(G)Object.keys(G.ph||{}).forEach(k=>{ph[k]=G.ph[k];});
            for(const mode of ['draft','issued']){
              const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},mode==='issued'&&G?{d:Object.assign({},G.defaults||{},ph,{d0:'2026-11-06',d1:'2026-11-07'})}:null,mode==='issued'?{bc:'BC26.11.08.3',hash:'h',url:'u',at:'2026-11-08',qr:null}:null);
              let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));out[code+'|'+mode]=btoa(o);}
          }return out}""")
        print(len(res),'tệp');
        for k,b in res.items():
            z=zipfile.ZipFile(io.BytesIO(base64.b64decode(b)))
            x=z.read('xl/worksheets/sheet4.xml').decode('utf8')
            wb=z.read('xl/workbook.xml').decode('utf8')
            # hàng tăng dần, ô tăng dần, không trùng
            rows=[(m[0],m[1],m[3]) for m in re.findall(r'<row r="(\d+)"([^>]*?)(/>|>(.*?)</row>)',x,re.S)]
            rn=[int(r[0]) for r in rows]
            chk(rn==sorted(rn) and len(rn)==len(set(rn)),k+' thứ tự hàng '+str([ (a,b) for a,b in zip(rn,rn[1:]) if b<=a]))
            maxr=0;maxc=0
            for r,at,body in rows:
                refs=re.findall(r'<c r="([A-Z]+)(\d+)"',body)
                cs=[cn(a) for a,b in refs]
                chk(cs==sorted(cs) and len(cs)==len(set(cs)),k+' ô hàng '+r)
                chk(all(b==r for a,b in refs),k+' số hàng ô '+r)
            # ô gộp
            ms=re.findall(r'<mergeCell ref="([A-Z]+)(\d+):([A-Z]+)(\d+)"',x)
            cnt=re.search(r'<mergeCells count="(\d+)"',x)
            chk(cnt and int(cnt.group(1))==len(ms),k+' count gộp ô %s/%d'%(cnt.group(1) if cnt else None,len(ms)))
            occ={};dup=0
            for a,b,c,d in ms:
                for r in range(int(b),int(d)+1):
                    for c_ in range(cn(a),cn(c)+1):
                        if (r,c_) in occ: dup+=1
                        occ[(r,c_)]=1
                    maxr=max(maxr,r)
                maxc=max(maxc,cn(c))
            chk(dup==0,k+' ô gộp chồng nhau %d'%dup)
            pa=re.search(r"Phieu_KQ'?!\$A\$1:\$([A-Z]+)\$(\d+)",wb)
            chk(pa and cn(pa.group(1))>=maxc,k+' vùng in không phủ hết cột gộp')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
