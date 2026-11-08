# D5: đo K dao vòng / phễu rót cát nhiều khối trong So_lieu -> nhiều sheet kết quả, mỗi sheet số báo cáo riêng, tính tiền theo số điểm đo
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
  const mkp=(o,pts)=>{pts.forEach((p,i)=>{o['lt_'+i]=p[0];o['vt_'+i]=p[1];o['ct_'+i]=p[2];o['w_'+i]=p[3];o['f_'+i]=p[4];if(!dv){o['g_'+i]=p[5];o['h_'+i]=p[6];}});return o;};
  const par=(wo,gk,V,x,yc)=>Object.assign({wo,gkmax:gk,V,yc},dv?{m0:x}:{gc:x});
  const P1=dv?[['Km0+36','Trái',0.7,8.5,540],['Km0+72','Phải',1.2,9,552],['Km0+110','Tim',0,8.8,548]]:[['Km0+36','Trái',0.7,13,3128,6493,2762],['Km0+72','Phải',1.2,12.5,3100,6493,2800],['Km0+110','Tim',0,13.4,3150,6493,2750]];
  const P2=dv?[['Km1+00','Tim',0,9.2,545],['Km1+20','Trái',1,9.1,560]]:[['Km1+00','Tim',0,12.8,3140,6493,2770],['Km1+20','Trái',1,13.1,3120,6493,2790]];
  const P3=dv?[['Km2+00','Phải',0.5,8.9,550],['Km2+10','Trái',0.5,9.3,547],['Km2+20','Tim',0,9,551],['Km2+30','Phải',1,8.7,544]]:[['Km2+00','Phải',0.5,13.2,3135,6493,2765],['Km2+10','Trái',0.5,12.9,3125,6493,2780],['Km2+20','Tim',0,13.1,3130,6493,2772],['Km2+30','Phải',1,13,3145,6493,2760]];
  const a=dv?[9.1,1.637,190.7,231,85]:[13.6,2.375,1025,1.486,95],b=dv?[9.0,1.640,190.7,231,90]:[13.4,2.380,1025,1.486,95],c=dv?[9.2,1.630,190.7,231,85]:[13.8,2.370,1025,1.486,90];
  return Object.assign(mkp(par(...a),P1),{d0:'2026-10-20',d1:'2026-10-21',n:3,more:[mkp(par(...b),P2),mkp(par(...c),P3)]});}"""
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
              const u8=await P.buildTemplate(s,T,{d},null);
              const wb0=await P.PKV.load(u8);
              const an=await P.analyzeUpload(Object.assign({},s),u8);
              const s2=Object.assign({},s,{nop:{raw:an.raw,results:an.results,d0:an.d0,d1:an.d1,nhiet_do:null,do_am:null,tinh_trang:'',sha256:'x'},status:'cho_phe_duyet'});
              const so=await P.makeCode('bc',P.ngayBaoCao(s2,0)),b2=await P.makeCode('bc',P.ngayBaoCao(s2,1)),b3=await P.makeCode('bc',P.ngayBaoCao(s2,2));
              const x={bc:so,hash:'HASH',url:P.verifyUrl(so),at:'2026-11-08',qr:null,more:[{bc:b2,url:P.verifyUrl(b2),qr:null},{bc:b3,url:P.verifyUrl(b3),qr:null}]};
              const u9=await P.buildTemplate(s,T,{d},x);
              const wb=await P.PKV.load(u9),names=Object.keys(wb.sheets).filter(k=>/^Phieu_KQ/.test(k)),txt=[];
              for(const n of names){const R=await P.PKV.render(wb,n);txt.push([...R.el.querySelectorAll('tr')].map(t=>[...t.children].map(c=>c.textContent.trim()).filter(Boolean).join(' | ')).join(String.fromCharCode(10)));}
              const so0=wb0.sheets.So_lieu.cells,dv=loai==='DO_K_DV';
              return {an:{ok:an.ok,checks:an.checks.filter(c=>c.state!=='ok'),n:an.raw.more&&an.raw.more.length,resMore:an.results.more&&an.results.more.length,r0:an.results,rm:an.results.more},
                so,b2,b3,nS:P.nSheets(s2),names,txt,qty:P.bkQty(s2),
                sl:{A1:so0.A1&&so0.A1.v,A41:so0.A41&&so0.A41.v,B44:so0.B44&&so0.B44.v,B84:so0.B84&&so0.B84.v,A13:so0[dv?'A13':'A14'].v,A53:so0[dv?'A53':'A54'].v,
                    B370:!!so0.B370},
                bcName:P.bcFileName(Object.assign({},s,{phieu:{at:'2026-11-08T01:00:00Z'},so_bao_cao:so}),so)}}""",[loai,JS_D])
            print(loai,{k:r[k] for k in ('so','b2','b3','nS','names','qty','bcName')})
            a=r['an']
            chk(a['n']==2 and a['resMore']==2 and r['nS']==3,loai+' đọc lại 3 sheet: more=%s nS=%s'%(a['n'],r['nS']))
            chk(a['ok'],loai+' file nộp hợp lệ, checks=%s'%a['checks'])
            chk(all(c['state']=='warn' for c in a['checks']),loai+' chỉ còn lưu ý: %s'%a['checks'])
            chk([a['r0']['n']]+[m['n'] for m in a['rm']]==[3,2,4],loai+' số điểm mỗi sheet %s'%([a['r0']['n']]+[m['n'] for m in a['rm']]))
            chk(r['qty']['q']==9 and not r['qty']['est'],loai+' tính tiền theo tổng điểm đo đã nhập: %s'%r['qty'])
            chk(r['names']==['Phieu_KQ','Phieu_KQ_2','Phieu_KQ_3'],loai+' có 3 sheet kết quả %s'%r['names'])
            chk(r['so']!=r['b2']!=r['b3'],loai+' mỗi sheet một số báo cáo: %s %s %s'%(r['so'],r['b2'],r['b3']))
            chk(r['sl']['A41'] and 'SHEET KẾT QUẢ SỐ 2' in r['sl']['A41'] and r['sl']['A13']==1 and r['sl']['A53']==1,loai+' So_lieu có khối 2: %s'%r['sl'])
            chk('SHEET KẾT QUẢ SỐ 1' in (r['sl']['A1'] or ''),loai+' tiêu đề khối 1')
            T=r['txt']
            exp=[(r['so'],['Km0+36','Km0+72','Km0+110'],['Km1+00','Km2+00']),(r['b2'],['Km1+00','Km1+20'],['Km0+36','Km2+00']),(r['b3'],['Km2+00','Km2+10','Km2+20','Km2+30'],['Km0+36','Km1+00'])]
            for i,(so,yes,no) in enumerate(exp):
                t=T[i]
                chk('Số báo cáo: '+so in t or so in t,loai+' sheet %d mang số %s'%(i+1,so))
                chk(all(y in t for y in yes) and not any(n in t for n in no),loai+' sheet %d chỉ có các điểm của nó'%(i+1))
            # K từng điểm khớp tính của hệ thống
            allrows=[a['r0']['rows']]+[m['rows'] for m in a['rm']]
            for i,rows in enumerate(allrows):
                for x in rows:
                    k1=('%.1f'%x['K']);k2=k1.replace('.',',')
                    chk(k1 in T[i] or k2 in T[i],loai+' sheet %d K=%s có trong phiếu'%(i+1,k1))
            chk(r['bcName'].startswith(('Đo K dao vòng .' if loai=='DO_K_DV' else 'Đo K phễu rót cát .')+'BC.'),loai+' tên file có tiền tố: %s'%r['bcName'])
        chk(not errs,'lỗi trang %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
