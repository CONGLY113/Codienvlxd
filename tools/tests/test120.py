# kiểm tra đầm chặt (CP_TN, CPDD_1, CPDD_2, DAM_CHAT_CAT): cực trị parabol, biểu đồ trong phiếu, biểu đồ SVG trên màn hình
import asyncio,sys,io,zipfile,base64,re
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=bad=0;errs=[]
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
          const W=[8.0,9.8,11.6,13.2,15.1],Gk=[1.735,1.806,1.850,1.872,1.853];
          for(const code of ['CP_TN','CPDD_1','CPDD_2','DAM_CHAT_CAT']){
            const G=P.GT[code],d={V:2132,cm:7000,n:5,d0:'2026-11-06',d1:'2026-11-07',dv:[]};
            W.forEach((w,i)=>{d['mt_'+i]=Math.round(7000+Gk[i]*(1+w/100)*2132);d['ma_'+i]=150+w;d['mk_'+i]=150;d['mh_'+i]=50;});
            const rc=G.rc(d),secs=G.sections(d),ch=secs.find(s=>s.chart);
            const s={ma_mau:'M1',so_yc:'YC1',khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-05'},chi_tieu:[]};
            const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},{d},{bc:'BC26.11.08.3',hash:'h',url:'u',at:'2026-11-08',qr:null});
            let o='';for(let i=0;i<u8.length;i+=8192)o+=String.fromCharCode.apply(null,u8.subarray(i,i+8192));
            const body=G.body(Object.assign({},G.results(rc,d)));
            out[code]={x:btoa(o),fit:rc.fit&&{ok:rc.fit.ok,wv:rc.fit.wv,gv:rc.fit.gv},gk0:rc.gk0,w0:rc.w0,chart:!!ch,svg:ch?ch.chart(d):'',bodySvg:/<svg/.test(body.innerHTML||'')};}
          return out}""")
        for c,o in res.items():
            chk(o['fit'] and o['fit']['ok'],c+' có cực trị')
            chk(abs(o['gk0']-1.8676)<0.001 and abs(o['w0']-13.42)<0.02,c+' γkmax/Wo %s %s'%(o['gk0'],o['w0']))
            chk(o['chart'] and '<svg' in o['svg'] and 'polyline' in o['svg'],c+' biểu đồ trên form nhập')
            chk(o['bodySvg'],c+' biểu đồ trong chi tiết')
            z=zipfile.ZipFile(io.BytesIO(base64.b64decode(o['x'])))
            names=z.namelist()
            chk('xl/charts/chart1.xml' in names,c+' có chart1.xml')
            ch=z.read('xl/charts/chart1.xml').decode()
            chk('<c:trendline>' in ch and '<c:order val="2"/>' in ch and 'trendlineType val="poly"' in ch,c+' trendline bậc 2')
            chk('<c:majorUnit val="1"/>' in ch and '<c:minorUnit val="0.5"/>' in ch,c+' trục X')
            dr=z.read('xl/drawings/drawing1.xml').decode()
            chk('xmlns:a' in dr and 'rIdCH1' in dr,c+' drawing có chart + namespace')
            chk(re.search(r'<a:off[^>]*xmlns:a',dr) is not None,c+' khai báo namespace a trong xfrm')
            so=z.read('xl/worksheets/sheet2.xml').decode()
            chk('AGGREGATE' not in so,c+' không dùng AGGREGATE')
            chk('MIN(P8:P14)' in so,c+' So_lieu MIN/MAX')
            ct=z.read('[Content_Types].xml').decode()
            chk('drawingml.chart+xml' in ct,c+' content type chart')
            ph=z.read('xl/worksheets/sheet4.xml').decode()
            chk('scale="85"' in ph,c+' phiếu scale 85')
        print('ok',ok,'bad',bad,'errs',errs)
asyncio.run(main())
