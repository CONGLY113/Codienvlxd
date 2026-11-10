# 0.28.9: bố cục in áp lên mọi sheet Phieu_KQ_n của phiếu nhiều sheet
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
JS_D="""(loai)=>{const dv=loai==='DO_K_DV';
  const mkp=(o,pts)=>{pts.forEach((p,i)=>{o['lt_'+i]=p[0];o['vt_'+i]=p[1];o['ct_'+i]=p[2];o['ws_'+i]=p[3];o['wd_'+i]=100;o['f_'+i]=p[4];if(!dv){o['g_'+i]=p[5];o['h_'+i]=p[6];}});return o;};
  const par=(wo,gk,V,x,yc,nd)=>Object.assign({wo,gkmax:gk,V,yc,nd},dv?{m0:x}:{gc:x});
  const P1=dv?[['Km0+36','Trái',0.7,108.5,540],['Km0+72','Phải',1.2,109,552],['Km0+110','Tim',0,108.8,548]]:[['Km0+36','Trái',0.7,113,3128,6493,2762],['Km0+72','Phải',1.2,112.5,3100,6493,2800],['Km0+110','Tim',0,113.4,3150,6493,2750]];
  const P2=dv?[['Km1+00','Tim',0,109.2,545],['Km1+20','Trái',1,109.1,560]]:[['Km1+00','Tim',0,112.8,3140,6493,2770],['Km1+20','Trái',1,113.1,3120,6493,2790]];
  const P3=dv?[['Km2+00','Phải',0.5,108.9,550],['Km2+10','Trái',0.5,109.3,547],['Km2+20','Tim',0,109,551],['Km2+30','Phải',1,108.7,544]]:[['Km2+00','Phải',0.5,113.2,3135,6493,2765],['Km2+10','Trái',0.5,112.9,3125,6493,2780],['Km2+20','Tim',0,113.1,3130,6493,2772],['Km2+30','Phải',1,113,3145,6493,2760]];
  const a=dv?[9.1,1.637,190.7,231,85]:[13.6,2.375,1025,1.486,95];
  return Object.assign(mkp(par(...a,46315),P1),{d0:'2026-10-20',d1:'2026-10-22',n:3,more:[mkp(par(...a,46316),P2),mkp(par(...a,46317),P3)]});}"""
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
        for loai in ['DO_K_DV','DO_K_PR']:
            r=await page.evaluate("""async([loai,mkd])=>{const P=window.__ptn;const d=eval(mkd)(loai);
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'LIÊN DANH 568 - BẢO THÀNH'},mau:{loai,ten:'x',ngay_nhan:'2026-10-20',ngay_lay:'2026-10-08'},chi_tieu:[]};
              const T={id:'NS001',name:'A'};
              const u8=await P.buildTemplate(s,T,{d},null);const an=await P.analyzeUpload(Object.assign({},s),u8);
              const s2=Object.assign({},s,{nop:{raw:an.raw,results:an.results,d0:an.d0,d1:an.d1,nhiet_do:null,do_am:null,tinh_trang:'',sha256:'x'},status:'cho_phe_duyet'});
              const so=await P.makeCode('bc',P.ngayBaoCao(s2,0)),b2=await P.makeCode('bc',P.ngayBaoCao(s2,1)),b3=await P.makeCode('bc',P.ngayBaoCao(s2,2));
              const x={bc:so,hash:'HASH',url:P.verifyUrl(so),at:'2026-11-08',qr:null,more:[{bc:b2,url:P.verifyUrl(b2),qr:null},{bc:b3,url:P.verifyUrl(b3),qr:null}]};
              const b64=u=>{let o='';for(let i=0;i<u.length;i+=8192)o+=String.fromCharCode.apply(null,u.subarray(i,i+8192));return btoa(o)};
              const u0=await P.buildTemplate(s,T,{d:an.raw},x);
              const ex=await P.layExtract(u0);const Pl=JSON.parse(JSON.stringify(ex.P));Pl.pm.left=0.45;Pl.cols[0].w=Pl.cols[0].w+1.5;const rk=Object.keys(Pl.rows).map(Number).filter(n=>n>=20).sort((a,b)=>a-b)[0];Pl.rows[String(rk)]=33;
              P.S.layf={};P.S.layf[loai]={b64:b64(new TextEncoder().encode(JSON.stringify(Pl))),hid:'t',rev:1};
              const u1=await P.buildTemplate(s,T,{d:an.raw},x);
              const z0=await JSZip.loadAsync(u0),z1=await JSZip.loadAsync(u1),l0=await P.layLocate(z0),l1=await P.layLocate(z1);
              const per=[];
              for(let i=0;i<l1.length;i++){const a=await z1.file(l1[i].path).async('string');const dd=new DOMParser().parseFromString(a,'application/xml');
                const pm=dd.getElementsByTagName('pageMargins')[0],c1=dd.getElementsByTagName('col')[0],rw=Array.from(dd.getElementsByTagName('row')).find(r=>r.getAttribute('r')===String(rk));
                const cells=s=>JSON.stringify(Array.from(new DOMParser().parseFromString(s,'application/xml').getElementsByTagName('c')).map(c=>{const g=t=>{const e=c.getElementsByTagName(t)[0];return e?e.textContent:''};return [c.getAttribute('r'),c.getAttribute('t'),g('f'),g('v'),g('t')]}));
                per.push({name:l1[i].name,left:+pm.getAttribute('left'),w:+c1.getAttribute('width'),ht:rw?+rw.getAttribute('ht'):null,same:cells(a)===cells(await z0.file(l0[i].path).async('string'))});}
              const wb=await P.PKV.load(u1),names=Object.keys(wb.sheets).filter(k=>/^Phieu_KQ/.test(k));const pg=[];
              for(const n of names){const R=await P.PKV.render(wb,n,{paper:true});document.body.append(R.el);R.relayout();pg.push([R.el.dataset.pages,R.sc]);R.el.remove();}
              return {per,names,pg,w0:Pl.cols[0].w,rk}}""",[loai,JS_D])
        print(loai,r['per'],r['pg'])
        chk(r['names']==['Phieu_KQ','Phieu_KQ_2','Phieu_KQ_3'],loai+' 3 sheet %s'%r['names'])
        for p in r['per']:
            chk(abs(p['left']-0.45)<1e-6,loai+' '+p['name']+' lề %s'%p['left']);chk(abs(p['w']-r['w0'])<0.01,loai+' '+p['name']+' cột %s vs %s'%(p['w'],r['w0']));chk(abs((p['ht'] or 0)-33)<0.01,loai+' '+p['name']+' hàng %s: %s'%(r['rk'],p['ht']));chk(p['same'],loai+' '+p['name']+' ô dữ liệu đổi')
        chk(len(r['pg'])==3 and all(x[0] for x in r['pg']),loai+' xem web đủ 3 sheet')
        chk(not errs,'errs %s'%errs[:4])
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
