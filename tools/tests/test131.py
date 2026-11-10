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
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'LIÊN DANH 568 - BẢO THÀNH'},mau:{loai,ten:'x',ngay_nhan:'2026-10-20',ngay_lay:'2026-10-08'},chi_tieu:[]};
              const f=bt?[[605,590,580],[500,510,520],[700,710,690]]:[[20,21,19,22,20,21],[18,19,18,19,18,19],[25,24,26,25,24,26]];
              const mk=(i,ky,mac,tuoi,duc)=>{const o={ky,mac,tuoi,duc};if(bt)o.canh=i==2?200:150;f[i].forEach((v,k)=>o['f_'+k]=v);return o};
              const d=Object.assign(mk(0,'Dầm D1',bt?250:7.5,28,46300),{d0:'2026-10-20',d1:'2026-10-20',more:[mk(1,'Cột C2',bt?300:10,7,46320),mk(2,'Sàn S3',bt?300:10,28,46302)]});
              const T={id:'NS001',name:'A'};
              const u8=await P.buildTemplate(s,T,{d},null);
              const an=await P.analyzeUpload(Object.assign({},s),u8);
              /* cấp số: mỗi sheet theo ngày thử của dòng */
              const s2=Object.assign({},s,{nop:{raw:an.raw,results:an.results,d0:an.d0,d1:an.d1,nhiet_do:null,do_am:null,tinh_trang:'',sha256:'x'},status:'cho_phe_duyet'});
              const so=await P.makeCode('bc',P.ngayBaoCao(s2,0)),b2=await P.makeCode('bc',P.ngayBaoCao(s2,1)),b3=await P.makeCode('bc',P.ngayBaoCao(s2,2));
              return {an:{ok:an.ok,checks:an.checks.filter(c=>c.state!=='ok'),n:an.raw.more&&an.raw.more.length,resMore:an.results.more&&an.results.more.length,r0:an.results.tb,r1:an.results.more&&an.results.more[0].tb,r2:an.results.more&&an.results.more[1].tb,ky:[an.raw.ky].concat((an.raw.more||[]).map(x=>x.ky)),d1:an.d1,d0:an.d0},
                so,b2,b3,nS:P.nSheets(s2)}}""",loai)
            print(loai,r)
            a=r['an']
            chk(a['n']==2 and a['resMore']==2 and r['nS']==3,loai+' đọc lại 3 sheet: more=%s nS=%s'%(a['n'],r['nS']))
            chk(a['ky']==['Dầm D1','Cột C2','Sàn S3'],loai+' ký hiệu từng sheet %s'%a['ky'])
            chk(all(c['state']=='warn' for c in a['checks']),loai+' chỉ còn lưu ý (không có lỗi): %s'%a['checks'])
            chk(a['ok'],loai+' file nộp hợp lệ')
            # số báo cáo: ngày thử = đúc + tuổi, bỏ ngày nghỉ (01/11/2026 là Chủ nhật nên sang 02/11)
            chk(r['so'].startswith('BC26.11.02.') and r['b2'].startswith('BC26.11.02.') and r['b3'].startswith('BC26.11.04.'),loai+' số báo cáo theo ngày thử của từng sheet: %s %s %s'%(r['so'],r['b2'],r['b3']))
            r2=await page.evaluate("""async([loai,so,b2,b3])=>{const P=window.__ptn,bt=loai==='NEN_BT';
              const s={id:'S1',ma_mau:'M1',so_yc:'YC1',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'LIÊN DANH 568 - BẢO THÀNH'},mau:{loai,ten:'x',ngay_nhan:'2026-10-20',ngay_lay:'2026-10-08'},chi_tieu:[]};
              const f=bt?[[605,590,580],[500,510,520],[700,710,690]]:[[20,21,19,22,20,21],[18,19,18,19,18,19],[25,24,26,25,24,26]];
              const mk=(i,ky,mac,tuoi,duc)=>{const o={ky,mac,tuoi,duc};if(bt)o.canh=i==2?200:150;f[i].forEach((v,k)=>o['f_'+k]=v);return o};
              const d=Object.assign(mk(0,'Dầm D1',bt?250:7.5,28,46300),{d0:'2026-10-20',d1:'2026-10-20',more:[mk(1,'Cột C2',bt?300:10,7,46320),mk(2,'Sàn S3',bt?300:10,28,46302)]});
              const x={bc:so,hash:'HASH',url:P.verifyUrl(so),at:'2026-11-08',qr:null,more:[{bc:b2,url:P.verifyUrl(b2),qr:null},{bc:b3,url:P.verifyUrl(b3),qr:null}]};
              const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},{d},x);
              const wb=await P.PKV.load(u8),names=Object.keys(wb.sheets).filter(k=>/^Phieu_KQ/.test(k));
              const out={names,txt:[]};
              for(const n of names){const R=await P.PKV.render(wb,n);out.txt.push([...R.el.querySelectorAll('tr')].map(t=>[...t.children].map(c=>c.textContent.trim()).filter(Boolean).join(' | ')).join(String.fromCharCode(10)));}
              out.bcName=P.bcFileName(Object.assign({},s,{phieu:{at:'2026-11-08T01:00:00Z'},so_bao_cao:so}),so);
              return out}""",[loai,r['so'],r['b2'],r['b3']])
            chk(r2['names']==['Phieu_KQ','Phieu_KQ_2','Phieu_KQ_3'],loai+' có 3 sheet kết quả %s'%r2['names'])
            T=r2['txt']
            for i,(so,ky,duc,thu,tuoi) in enumerate([(r['so'],'Dầm D1','05/10/2026','02/11/2026','28'),(r['b2'],'Cột C2','25/10/2026','01/11/2026','7'),(r['b3'],'Sàn S3','07/10/2026','04/11/2026','28')]):
                t=T[i]
                chk(so in t,loai+' sheet %d số báo cáo %s'%(i+1,so))
                chk('Ký hiệu mẫu: | '+ky in t,loai+' sheet %d ký hiệu'%(i+1))
                chk('Ngày đúc mẫu: | '+duc in t,loai+' sheet %d ngày đúc %s'%(i+1,duc))
                chk('Ngày thử: | '+thu in t or True,loai+' ngày thử')
                chk('Tuổi mẫu: | (ngày) | '+tuoi in t,loai+' sheet %d tuổi'%(i+1))
                chk('Tên mẫu' not in t and 'Cấu kiện' not in t,loai+' sheet %d bỏ Tên mẫu, Cấu kiện'%(i+1))
                lines=t.split('\n')
                ic=[k for k,l in enumerate(lines) if l.startswith('Cường độ trung bình')]
                inx=[k for k,l in enumerate(lines) if l.startswith('Nhận xét')]
                chk(ic and inx and inx[0]==ic[0]+1,loai+' sheet %d Nhận xét ngay dưới Cường độ TB'%(i+1))
            chk('Ngày thử: | 02/11/2026' in T[0] and 'Ngày thử: | 01/11/2026' in T[1] and 'Ngày thử: | 04/11/2026' in T[2],loai+' ngày thử = đúc + tuổi: %s'%[x.split('Ngày thử:')[1][:20] for x in T])
            chk(T[0]!=T[1]!=T[2],loai+' ba sheet khác nhau')
            chk(r2['bcName'].startswith(('Nén bê tông .' if loai=='NEN_BT' else 'Nén vữa .')+'BC.'),loai+' tên file có tiền tố tên mẫu: %s'%r2['bcName'])
        # phát hành thật: issueDoc cấp phiếu nhiều sheet, tải lại đúng 3 sheet, tra cứu theo số của sheet 2
        r3=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');await new Promise(r=>setTimeout(r,300));
          const loai='NEN_BT',s={id:'S9',ma_mau:'M9',so_yc:'YC9',giao:{ma_nv:'NS001',ma_gv:'GV1',ten:'A'},khach:{ten:'KH'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:'Bê tông',ngay_nhan:'2026-10-20',ngay_lay:'2026-10-08'},chi_tieu:[]};
          const mk=(ky,mac,tuoi,duc,f)=>{const o={ky,mac,tuoi,duc,canh:150};f.forEach((v,k)=>o['f_'+k]=v);return o};
          const d=Object.assign(mk('A',250,28,46300,[605,590,580]),{d0:'2026-11-02',d1:'2026-11-02',more:[mk('B',300,7,46320,[500,510,520])]});
          const u8=await P.buildTemplate(s,{id:'NS001',name:'A'},{d},null),an=await P.analyzeUpload(s,u8);
          const s2=Object.assign({},s,{nop:{raw:an.raw,results:an.results,d0:an.d0,d1:an.d1,tinh_trang:'',sha256:'x',checks:an.checks},status:'cho_phe_duyet',soat_xet:{by:'S'}});
          const so=await P.makeCode('bc',P.ngayBaoCao(s2,0)),b2=await P.makeCode('bc',P.ngayBaoCao(s2,1));
          const phieu=await P.issueDoc(s2,so,new Date().toISOString(),[b2]);
          const s3=Object.assign({},s2,{so_bao_cao:so,phieu,status:'da_phat_hanh'});
          const o=await P.phieuBytes(s3),wb=await P.PKV.load(o.bytes),names=Object.keys(wb.sheets).filter(k=>/^Phieu_KQ/.test(k));
          const tx=[];for(const n of names){const R=await P.PKV.render(wb,n);tx.push(R.el.textContent)}
          return {so,b2,more:phieu.more&&phieu.more.map(e=>e.bc),url:phieu.more&&phieu.more[0].url,names,n1:tx[0].includes(so)&&!tx[0].includes(b2),n2:tx[1]&&tx[1].includes(b2)&&!tx[1].includes(so),q:tx[1]&&tx[1].includes('tc-'+b2.replace(/[^A-Za-z0-9]+/g,'-')),fname:o.name,nS:P.nSheets(s3),qty:P.bkQty(s3)}}""")
        print(r3)
        chk(r3['more']==[r3['b2']],'phieu.more lưu số báo cáo sheet 2: %s'%r3['more'])
        chk(r3['names']==['Phieu_KQ','Phieu_KQ_2'],'tải lại phiếu có 2 sheet %s'%r3['names'])
        chk(r3['n1'] and r3['n2'],'mỗi sheet mang số báo cáo của chính nó')
        chk(r3['q'],'sheet 2 có đường dẫn tra cứu theo số của nó')
        chk(r3['nS']==2 and r3['qty']['q']==2,'tính tiền theo số sheet: %s'%r3['qty'])
        chk(r3['fname'].startswith('Nén bê tông .BC.'),'tên file %s'%r3['fname'])
        print([r2['bcName']])
        chk(not errs,'lỗi trang %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
