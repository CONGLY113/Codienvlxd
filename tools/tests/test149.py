# 0.28.11: nạp bố cục không còn báo nhầm «macro» khi file Excel kèm printerSettings*.bin; vẫn chặn macro thật; mọi sheet của 31 biểu mẫu đúng thứ tự phần tử (Excel mở không phải sửa lỗi); số báo cáo không kèm chữ «Số báo cáo:»
import asyncio,sys,json,base64,zipfile,io,re
from playwright.async_api import async_playwright
from xml.etree import ElementTree as ET
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
ORD=['sheetPr','dimension','sheetViews','sheetFormatPr','cols','sheetData','sheetCalcPr','sheetProtection','protectedRanges','scenarios','autoFilter','sortState','dataConsolidate','customSheetViews','mergeCells','phoneticPr','conditionalFormatting','dataValidations','hyperlinks','printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','drawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst']
def order_ok(u8):
    z=zipfile.ZipFile(io.BytesIO(u8));bad=[]
    for n in z.namelist():
        if re.match(r'xl/worksheets/sheet\d+\.xml$',n):
            tags=[c.tag.split('}')[1] for c in ET.fromstring(z.read(n))];ix=[ORD.index(t) if t in ORD else -1 for t in tags]
            if -1 in ix or ix!=sorted(ix): bad.append(n)
    return bad
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
        codes=await page.evaluate("()=>window.__ptn.mauCodes2()")
        chk(len(codes)>=32,'số loại mẫu (32 từ bản 0.37.0, có vải địa kỹ thuật)')
        res=await page.evaluate("""async()=>{const P=window.__ptn,out={};
          const toB=u8=>{let s='';for(let i=0;i<u8.length;i+=32768)s+=String.fromCharCode.apply(null,u8.subarray(i,i+32768));return btoa(s);};
          for(const c of P.mauCodes2()){const u8=await P.mauDemo(c);out[c]=toB(u8);}
          return out;}""")
        for c,b in res.items():
            u8=base64.b64decode(b);bo=order_ok(u8)
            chk(not bo,'%s: thứ tự phần tử sheet sai %s'%(c,bo))
            z=zipfile.ZipFile(io.BytesIO(u8));w=z.read([n for n in z.namelist() if n.endswith('workbook.xml')][0]).decode()
            # tìm ô số báo cáo ở 8 dòng đầu sheet Phieu_KQ
            cells=[]
            for n in z.namelist():
                if re.match(r'xl/worksheets/sheet\d+\.xml$',n):
                    x=z.read(n).decode()
                    if 'BC26.11.08.3' in x and 'Phieu' not in n: pass
            r=await page.evaluate("""async(b)=>{const P=window.__ptn;const bin=atob(b),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
              const z=await JSZip.loadAsync(u),L=await P.layLocate(z);const x=await z.file(L[0].path).async('string');
              const sst=z.file('xl/sharedStrings.xml')?await z.file('xl/sharedStrings.xml').async('string'):'';
              const hit=[...x.matchAll(/<c r="([A-Z]+)([1-8])"[^>]*?(?:\\/>|>([\\s\\S]*?)<\\/c>)/g)].map(m=>[m[1]+m[2],(m[3]||'').replace(/<[^>]+>/g,'')]).filter(a=>a[1].indexOf('BC26.11.08.3')>=0);return hit;}""",b)
            chk(len(r)>=1 and all(a[1]=='BC26.11.08.3' for a in r),'%s: ô số báo cáo chỉ gồm mã, không kèm chữ: %s'%(c,r))
        # file Excel lưu từ máy có máy in: thêm printerSettings1.bin
        out=await page.evaluate("""async()=>{const P=window.__ptn;const d=await P.mauDemo('CAT_XD');const z=await JSZip.loadAsync(d);
          z.file('xl/printerSettings/printerSettings1.bin',new Uint8Array([1,2,3,4]));
          let ct=await z.file('[Content_Types].xml').async('string');if(ct.indexOf('Extension="bin"')<0)ct=ct.replace('<Default ','<Default Extension="bin" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.printerSettings"/><Default ');z.file('[Content_Types].xml',ct);
          const u1=await z.generateAsync({type:'uint8array'});const e1=await P.layExtract(u1);
          z.file('xl/vbaProject.bin',new Uint8Array([1,2,3]));const u2=await z.generateAsync({type:'uint8array'});const e2=await P.layExtract(u2);
          return {e1:e1.E,w1:e1.W,e2:e2.E};}""")
        print(json.dumps(out,ensure_ascii=False)[:400])
        chk(out['e1']==[],'file có printerSettings.bin được nạp, không lỗi: %s'%out['e1'])
        chk(any('macro' in x for x in out['e2']),'file có vbaProject.bin vẫn bị chặn')
        chk(not errs,'lỗi console %s'%errs[:2])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
