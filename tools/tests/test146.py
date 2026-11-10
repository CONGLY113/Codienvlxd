# 0.28.9: nạp bố cục từ file đã lưu lại bằng phần mềm khác (LibreOffice đổi tiền tố, kiểu neo, độ chính xác chiều cao hàng)
import asyncio,sys,json,base64,subprocess,os,tempfile
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
JS=r"""async([b,c])=>{const P=window.__ptn;const u8=Uint8Array.from(atob(b),x=>x.charCodeAt(0));
  const ex=await P.layExtract(u8);const dem=await P.mauDemo(c,{off:true});const dx=await P.layExtract(dem);
  if(!ex.P)return {E:ex.E};
  const z=await JSZip.loadAsync(dem);const n=await P.layApplyZip(z,c,ex.P);const out=await z.generateAsync({type:'uint8array'});const chk=await P.layExtract(out);
  const zz=await JSZip.loadAsync(out);const loc=await P.layLocate(zz);const dxml=await zz.file(loc[0].drawing).async('string');
  return {E:ex.E,W:ex.W,sigEq:ex.P.sig===dx.P.sig,n,back:P.layDiff(ex.P,chk.P,{noRows:true}),xdrOk:!/<xdr:/.test(dxml)||/xmlns:xdr=/.test(dxml)}}"""
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
        d=tempfile.mkdtemp()
        for c in ['CAT_XD','CPDD_1','DAM_CHAT_CAT','CP_BT','NEN_BT','XM_PCB40']:
            b=await page.evaluate("""async c=>{const P=window.__ptn;const u=await P.mauDemo(c,{off:true});let o='';for(let i=0;i<u.length;i+=8192)o+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(o)}""",c)
            fi=os.path.join(d,'in_%s.xlsx'%c);open(fi,'wb').write(base64.b64decode(b))
            os.makedirs(os.path.join(d,'out'),exist_ok=True)
            subprocess.run(['soffice','--headless','-env:UserInstallation=file:///tmp/lo2','--convert-to','xlsx:Calc MS Excel 2007 XML','--outdir',os.path.join(d,'out'),fi],capture_output=True,timeout=120)
            fo=os.path.join(d,'out','in_%s.xlsx'%c)
            if not os.path.exists(fo): print('  bỏ qua',c,'(không có soffice)');continue
            r=await page.evaluate(JS,[base64.b64encode(open(fo,'rb').read()).decode(),c])
            chk(not r.get('E'),c+' E %s'%r.get('E'));chk(r.get('sigEq'),c+' chữ ký ô gộp khác');chk(r.get('n')==1,c+' không áp được');chk(not r.get('back'),c+' áp rồi đọc lại khác: %s'%r.get('back'));chk(r.get('xdrOk'),c+' tiền tố xdr thiếu khai báo tên miền')
        chk(not errs,'errs %s'%errs[:4])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
