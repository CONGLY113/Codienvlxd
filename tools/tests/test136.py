# D4: nén bê tông/vữa nhiều dòng trong So_lieu -> nhiều sheet kết quả, mỗi sheet một số báo cáo riêng
import asyncio,sys
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
        page=await (await br.new_context(viewport={'width':1200,'height':900})).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a','2612a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true,url_app:'https://tdcquatest.web.app/'}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        for loai in ['NEN_BT','NEN_VUA']:
            r=await page.evaluate("""async(loai)=>{const P=window.__ptn,bt=loai==='NEN_BT';
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:'x',ngay_nhan:'2026-10-20',ngay_lay:'2026-10-08'},chi_tieu:[]};
              const T={id:'NS001',name:'A'};
              const f=bt?[605,590,580]:[20,21,19,22,20,21];
              const mk=(ky,duc,tuoi)=>{const o={ky,mac:bt?250:7.5,tuoi,duc};f.forEach((v,k)=>o['f_'+k]=v);return o};
              const ok=Object.assign(mk('A',46300,28),{d0:'2026-10-20',d1:'2026-10-20',more:[mk('B',46301,28)]});
              const u1=await P.buildTemplate(s,T,{d:ok},null);const a1=await P.analyzeUpload(Object.assign({},s),u1);
              const bad=Object.assign(mk('A',46300,28),{d0:'2026-10-20',d1:'2026-10-20',more:[mk('B',46330,28)]});
              const u2=await P.buildTemplate(s,T,{d:bad},null);const a2=await P.analyzeUpload(Object.assign({},s),u2);
              const wb=await P.PKV.load(u1);
              const L=await P.readXlsx(u1);
              return {n1:a1.raw.more.length,chk1:a1.checks.filter(c=>c.label.includes('cùng một tháng')).map(c=>c.state),chk2:a2.checks.filter(c=>c.label.includes('cùng một tháng')).map(c=>[c.state,c.note]),
                G5:L.So_lieu.G5,G104:L.So_lieu.G104,G105:L.So_lieu.G105,A104:L.So_lieu.A104,Z6:L.So_lieu.Z6,H100:L.So_lieu.H100}}""",loai)
            print(loai,r)
            chk(r['n1']==1,loai+' 2 dòng có số liệu = 2 sheet')
            chk(r['chk1']==['ok'],loai+' cùng tháng ok')
            chk(r['chk2'] and r['chk2'][0][0]=='fail',loai+' khác tháng báo fail')
            if loai=='NEN_BT':
                chk(r['G5']==150 and r['G104']==150 and r['G105'] in (None,''),loai+' cạnh mặc định 150 cho 100 dòng')
        chk(not errs,'lỗi: %s'%errs[:2]);await br.close()
    print('ok',ok,'bad',bad)
asyncio.run(main())
