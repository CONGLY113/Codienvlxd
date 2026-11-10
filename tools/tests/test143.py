# 0.28.9: bố cục in chung (trích, áp, phiếu cũ), file mẫu = phiếu đang sinh
import asyncio,sys,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        page.on('console',lambda m: errs.append('CONSOLE '+m.text) if m.type=='warning' and ('lay' in m.text.lower()) else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        codes=await page.evaluate("()=>window.__ptn.mauCodes2()")
        print('loại mẫu',len(codes))
        res=await page.evaluate("""async(codes)=>{const P=window.__ptn,out={};
          const b64=u=>{let o='';for(let i=0;i<u.length;i+=8192)o+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(o)};
          for(const c of codes){const r={};
            try{
              const d0=await P.mauDemo(c,{off:true});const ex=await P.layExtract(d0);
              r.E=ex.E;r.W=ex.W;r.cols=ex.P?ex.P.cols.length:0;r.rows=ex.P?Object.keys(ex.P.rows).length:0;r.ch=ex.P?ex.P.charts.length:0;r.fit=ex.P&&ex.P.fit;
              /* sửa file: lề trái, cột đầu, hàng 25, biểu đồ */
              const z=await JSZip.loadAsync(d0),loc=await P.layLocate(z),L=loc[0];let x=await z.file(L.path).async('string');
              x=x.replace(/(<pageMargins[^>]*\\bleft=")[^"]*"/,'$10.5"');
              x=x.replace(/<col ([^>]*?)width="[^"]*"/,'<col $1width="11.5"');
              const rk=Object.keys(ex.P.rows).map(Number).filter(n=>n>=20).sort((a,b)=>a-b)[0];r.rk=rk;r.ex2row=null;x=x.replace(new RegExp('(<row r="'+rk+'"[^>]*?)\\\\bht="[^"]*"'),'$1ht="31.5"');
              z.file(L.path,x);
              let chartMarked=false;
              if(L.drawing){const dx=await z.file(L.drawing).async('string');const cm=/<c:chart [^>]*r:id="([^"]+)"/.exec(dx);
                if(cm){const rels=await z.file(L.drawing.replace(/drawings\\/([^/]+)$/,'drawings/_rels/$1.rels')).async('string');const t=new RegExp('Id="'+cm[1]+'"[^>]*Target="([^"]+)"|Target="([^"]+)"[^>]*Id="'+cm[1]+'"').exec(rels);const tp=(t[1]||t[2]).replace(/^.*charts\\//,'xl/charts/');
                  let cx=await z.file(tp).async('string');if(/<c:majorGridlines>/.test(cx)){cx=cx.replace('<c:majorGridlines>','<c:majorGridlines><!--MARK-->');}
                  cx=cx.replace(/<a:ln([^>]*?)\\bw="\\d+"/,'<a:ln$1w="31750"');z.file(tp,cx);chartMarked=true;}}
              const mod=await z.generateAsync({type:'uint8array'});
              const ex2=await P.layExtract(mod);r.E2=ex2.E;r.ex2row=ex2.P.rows[String(rk)];
              P.S.layf={};P.S.layf[c]={b64:b64(new TextEncoder().encode(JSON.stringify(ex2.P))),hid:'t1',rev:1};
              const d1=await P.mauDemo(c);const ex3=await P.layExtract(d1);const zc=await JSZip.loadAsync(d1);r.badx=[];for(const n of Object.keys(zc.files)){if(!/\\.(xml|rels)$/.test(n))continue;const dd=new DOMParser().parseFromString(await zc.file(n).async('string'),'application/xml');if(dd.getElementsByTagName('parsererror').length)r.badx.push(n);}
              r.diffAfter=P.layDiff(ex2.P,ex3.P);r.diffBase=P.layDiff(ex.P,ex3.P).length;
              r.left=ex3.P.pm.left;r.row25=ex3.P.rows[String(rk)];r.col1=ex3.P.cols[0]&&ex3.P.cols[0].w;
              r.chartLn=ex3.P.charts[0]?/<a:ln[^>]*\\bw="31750"/.test(ex3.P.charts[0]):null;
              /* phiếu cũ: áp lên bytes đã phát hành (giả lập bằng demo off) */
              const old=await P.layApplyBytes(d0,c);const ex4=await P.layExtract(old);r.diffOld=P.layDiff(ex2.P,ex4.P);
              /* công thức/số liệu không đổi: so sánh text các ô */
              const zo=await JSZip.loadAsync(d0),zn=await JSZip.loadAsync(old);
              const strip=s=>s.replace(/<cols>[\\s\\S]*?<\\/cols>/,'').replace(/<pageMargins[^>]*>/,'').replace(/<pageSetup[^>]*>/,'').replace(/<row ([^>]*?)\\s*ht="[^"]*"/g,'<row $1').replace(/ customHeight="1"/g,'').replace(/<(row|col)Breaks[\\s\\S]*?<\\/\\1Breaks>/g,'').replace(/<printOptions[^>]*>/,'');
              const lo=await P.layLocate(zo),ln=await P.layLocate(zn);let same=true;
              for(let i=0;i<lo.length;i++){const a=strip(await zo.file(lo[i].path).async('string')),b=strip(await zn.file(ln[i].path).async('string'));
                const cells=s=>{const d=new DOMParser().parseFromString(s,'application/xml');return JSON.stringify(Array.from(d.getElementsByTagName('c')).map(c=>{const g=t=>{const e=c.getElementsByTagName(t)[0];return e?e.textContent:''};return [c.getAttribute('r'),c.getAttribute('t'),c.getAttribute('s'),g('f'),g('v'),g('t')]}))};if(cells(a)!==cells(b))same=false;}
              r.sameCells=same;r.sheets=lo.length;
            }catch(e){r.err=String(e&&e.stack||e)}
            out[c]=r;P.S.layf={};}
          return out}""",codes)
        for c,r in res.items():
            chk('err' not in r,c+' lỗi '+str(r.get('err'))[:300])
            if 'err' in r: continue
            chk(not r['E'],c+' E '+str(r['E']));chk(not r['E2'],c+' E2 '+str(r['E2']))
            chk(r['cols']>3 and r['rows']>10,c+' cols/rows %s %s'%(r['cols'],r['rows']))
            chk(not r['diffAfter'],c+' áp rồi trích lại khác: '+str(r['diffAfter']))
            chk(r['diffBase']>=2,c+' sau khi áp phải khác bản gốc: %s'%r['diffBase'])
            chk(abs(r['left']-0.5)<1e-6,c+' lề trái %s'%r['left']);chk(abs((r['row25'] or 0)-31.5)<0.01,c+' hàng %s: sau áp %s, trích %s'%(r['rk'],r['row25'],r['ex2row']));chk(abs((r['col1'] or 0)-11.5)<0.01,c+' cột 1 %s'%r['col1'])
            if r['ch']: chk(r['chartLn'],c+' định dạng biểu đồ không áp được')
            chk(not r['badx'],c+' XML không hợp lệ: %s'%r['badx']);chk(not r['diffOld'],c+' áp lên phiếu cũ: '+str(r['diffOld']));chk(r['sameCells'],c+' ô dữ liệu bị đổi khi áp bố cục')
        print({c:(r.get('ch'),r.get('sheets')) for c,r in res.items() if r.get('ch')})
        chk(not errs,'errs %s'%errs[:5])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
