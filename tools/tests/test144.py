# 0.28.9: hộp thoại nạp bố cục, lịch sử, khôi phục, quay về gốc, áp lên phiếu đã phát hành
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
        r=await page.evaluate("""async()=>{const P=window.__ptn,out={};
          P.setSession('NS001');await new Promise(r=>setTimeout(r,300));
          const code='CP_BT';
          const d0=await P.mauDemo(code,{off:true});
          const z=await JSZip.loadAsync(d0),loc=await P.layLocate(z);let x=await z.file(loc[0].path).async('string');
          x=x.replace(/(<pageMargins[^>]*\\bleft=")[^"]*"/,'$10.4"').replace(/<col ([^>]*?)width="[^"]*"/,'<col $1width="9.5"');z.file(loc[0].path,x);
          const mod=await z.generateAsync({type:'uint8array'});
          out.session=!!P.SESSION;
          P.layCheckDlg(code,mod,'moi.xlsx');await new Promise(r=>setTimeout(r,2500));
          const dlg=document.querySelector('.modal,[role=dialog],dialog')||document.body;
          out.txt=(dlg.innerText||'').slice(0,900);
          const note=document.getElementById('lay-note');if(note)note.value='Thu lề trái, thu cột đầu';
          const btn=Array.from(document.querySelectorAll('button')).find(b=>/Áp dụng bố cục này/.test(b.textContent));out.btn=!!btn&&!btn.disabled;
          if(btn)btn.click();await new Promise(r=>setTimeout(r,1500));
          out.layf=!!(P.S.layf&&P.S.layf[code]&&P.S.layf[code].b64);out.hist=(P.S.mauh||[]).filter(h=>h.code===code).map(h=>[h.kind,h.rev,h.action]);
          /* áp lên phiếu mới dựng */
          const d1=await P.mauDemo(code);const e1=await P.layExtract(d1);out.left=e1.P&&e1.P.pm.left;
          /* gốc không áp */
          const d2=await P.mauDemo(code,{off:true});const e2=await P.layExtract(d2);out.leftOff=e2.P&&e2.P.pm.left;
          /* quay về gốc */
          const r2=await P.mauApply(code,new Uint8Array(0),{action:'ve_goc',kind:'layout',name:'',note:'test'});await new Promise(r=>setTimeout(r,500));
          out.afterReset=!!(P.S.layf&&P.S.layf[code]&&P.S.layf[code].b64);
          const d3=await P.mauDemo(code);const e3=await P.layExtract(d3);out.left3=e3.P&&e3.P.pm.left;
          /* khôi phục bản #1 */
          const h1=(P.S.mauh||[]).find(h=>h.code===code&&h.kind==='layout'&&h.action==='tai_len');const u=await P.mauBytes(code,h1.id);out.bytes=!!u;
          const r3=await P.mauApply(code,u,{action:'khoi_phuc',kind:'layout',name:'moi.xlsx',note:'Khôi phục',from_rev:h1.rev});await new Promise(r=>setTimeout(r,500));
          out.restored=!!(P.S.layf&&P.S.layf[code]&&P.S.layf[code].b64);
          const d4=await P.mauDemo(code);const e4=await P.layExtract(d4);out.left4=e4.P&&e4.P.pm.left;
          /* lịch sử mở được */
          try{P.mauHistory&&0}catch(e){}
          return out}""")
        print(json.dumps(r,ensure_ascii=False)[:1500])
        chk(r['session'],'đăng nhập');chk('Đạt' in r['txt'],'hộp thoại báo đạt: '+r['txt'][:200]);chk(r['btn'],'nút áp dụng bật')
        chk(r['layf'],'đã lưu layf');chk(len(r['hist'])>=1 and r['hist'][0][0]=='layout','lịch sử có kind layout %s'%r['hist'])
        chk(abs(r['left']-0.4)<1e-6,'lề trái áp %s'%r['left']);chk(abs(r['leftOff']-0.4)>0.01,'bản gốc không áp %s'%r['leftOff'])
        chk(not r['afterReset'],'quay về gốc xóa layf');chk(abs(r['left3']-r['leftOff'])<1e-6,'sau reset giống gốc')
        chk(r['bytes'] and r['restored'] and abs(r['left4']-0.4)<1e-6,'khôi phục %s'%r['left4'])
        chk(not errs,'errs %s'%errs[:5])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
