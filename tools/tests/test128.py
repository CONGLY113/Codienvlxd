# C4: tính lại đầm chặt đã phát hành theo cực trị parabol qua hồ sơ sửa loại T
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
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        r=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');await new Promise(r=>setTimeout(r,300));
          const W=[8.0,9.8,11.6,13.2,15.1],Gk=[1.735,1.806,1.850,1.872,1.853];
          const out=[];
          for(const [id,code] of [['s2611a_d1','CP_TN'],['s2611a_d2','DAM_CHAT_CAT']]){
            const G=P.GT[code],raw={V:2132,cm:7000,n:5,dv:[]};
            W.forEach((w,i)=>{raw['mt_'+i]=Math.round(7000+Gk[i]*(1+w/100)*2132);raw['ma_'+i]=150+w;raw['mk_'+i]=150;raw['mh_'+i]=50;});
            const rc=G.rc(raw),nw=G.results(rc,raw),rows=rc.rows.filter(x=>x.gk!=null),top=rows.reduce((a,b)=>b.gk>a.gk?b:a);
            const old=Object.assign({},nw,{gk0:top.gk,w0:top.w,gk:top.gk,w:top.w});
            const s={kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-D1',ma_mau:'M26.11.04.'+id,khach:{ten:'KH '+id},du_an:{cong_trinh:'CT '+id},mau:{loai:code,ten:'x',ngay_nhan:'2026-11-04',ngay_lay:'2026-11-03'},chi_tieu:P.defTests(code),han_tra:'2026-11-09',
              giao:{ma_gv:'GV1',ma_nv:'NS004',ten:'Trần Anh Dũng',han:'2026-11-09',by:'x',at:'2026-11-04T01:00:00Z'},soat_xet:{by:'Hoàng Công Lý',by_id:'NS009'},status:'cho_phe_duyet',
              nop:{results:old,split:true,d0:'2026-11-04',d1:'2026-11-07',at:'2026-11-05T01:00:00Z'}};
            await P.Data.set('detail_2611a/'+id,{sample:id,raw,sieve:null,checks:[],devs:[]});
            await P.Data.set('samples_2611a/'+id,s);await new Promise(r=>setTimeout(r,300));
            let s1=await P.withDetail(P.S.samples.find(x=>x.id===id),true);
            const so=await P.makeCode('bc','2026-11-07'),now='2026-11-08T01:00:00.000Z';
            const phieu=await P.issueDoc(s1,so,now);
            await P.Data.update('samples_2611a/'+id,{status:'da_phat_hanh',so_bao_cao:so,phat_hanh_at:now,pd:{by:'Lưu Minh Tuấn',by_id:'NS010',at:now,y_kien:''},phieu});
            out.push({id,so,old:{gk:old.gk,w:old.w},nw:{gk:nw.gk,w:nw.w}});
          }
          await new Promise(r=>setTimeout(r,400));return out}""")
        print(r)
        for o in r: chk(abs(o['old']['gk']-o['nw']['gk'])>0.0004 or abs(o['old']['w']-o['nw']['w'])>0.04,'dữ liệu thử có khác biệt '+o['id'])
        # ---- quét
        sc=await page.evaluate("""async()=>{const L=await window.__ptn.sdDmScan();return L.map(x=>({id:x.s.id,n:x.doi.length,ks:x.doi.map(d=>d.k),dep:x.dep.length}))}""")
        chk(len(sc)==2 and all(x['n']>=2 for x in sc),'quét thấy 2 phiếu cần tính lại %s'%sc)
        # ---- giao diện
        await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(600)
        chk(await page.locator('[data-act=sd-dm]').count()==1,'có nút tính lại cho Trưởng phòng')
        await page.click('[data-act=sd-dm]');await page.wait_for_selector('[data-act=sd-dm-go]');await page.wait_for_timeout(900)
        chk('Kết quả cũ → mới' in await page.inner_text('#modal-root'),'bảng so sánh')
        chk(await page.locator('#modal-root input[type=checkbox]:checked').count()==2,'chọn sẵn 2 phiếu')
        await page.screenshot(path='/tmp/w/c4_dlg.png')
        await page.click('[data-act=sd-dm-go]');await page.wait_for_timeout(1200)
        L=await page.evaluate("()=>window.__ptn.sdList()")
        chk(len(L)==2 and all(d['loai']=='T' and d['status']=='cho_soat_xet' and d['kq_moi'] for d in L),'2 hồ sơ loại T chờ soát xét %s'%[(d['loai'],d['status']) for d in L])
        # không còn quét ra phiếu đang có hồ sơ
        sc=await page.evaluate("""async()=>{const L=await window.__ptn.sdDmScan();return L.map(x=>!!x.act)}""")
        chk(all(sc),'phiếu đang có hồ sơ không lập trùng')
        # ---- soát xét rồi phê duyệt
        for d in L:
            await page.evaluate("""async(id)=>{const P=window.__ptn;P.setSession('NS009');await new Promise(r=>setTimeout(r,200));const d=P.sdList().find(x=>x.id===id);
              await P.sdMove(d,'cho_phe_duyet',{sx:{by:'Nguyễn Tiến Hoàng',by_id:'NS008',at:new Date().toISOString(),y_kien:'ok'}},'Soát xét đạt');}""",d['id'])
            res=await page.evaluate("""async(id)=>{const P=window.__ptn;P.setSession('NS010');await new Promise(r=>setTimeout(r,300));const d=P.sdList().find(x=>x.id===id);
              try{const r=await P.sdApprove(d,'đồng ý');await new Promise(r=>setTimeout(r,500));
                const s=await P.withDetail(P.S.samples.find(x=>x.id===d.sample),true);const b=await P.phieuBytes(s);const wb=await P.PKV.load(b.bytes);const R=await P.PKV.render(wb,'Phieu_KQ');
                const old=await P.sdOldBytes(P.sdList().find(x=>x.id===id));
                return {bc:r.bc,phieuNo:P.phieuNo(s),gk:s.nop.results.gk,w:s.nop.results.w,txt:[...R.el.querySelectorAll('tr')].map(t=>[...t.children].map(c=>c.textContent.trim()).filter(Boolean).join(' | ')).join(String.fromCharCode(10)),old:old.bytes.length,oldName:old.name,raw:!!s.nop.raw,thay:s.phieu.thay_the&&s.phieu.thay_the.loai}}catch(e){return {err:String(e&&e.message||e)}}}""",d['id'])
            if 'err' in res: chk(False,'phê duyệt: '+res['err']);continue
            o=[x for x in r if x['id']==d['sample']][0]
            chk(res['bc']==o['so']+'-SĐ01' and res['phieuNo']==o['so']+'-SĐ01','số phiếu thay thế '+res['bc'])
            chk(abs(res['gk']-o['nw']['gk'])<1e-9 and abs(res['w']-o['nw']['w'])<1e-9,'kết quả đã cập nhật theo đỉnh parabol: %s %s'%(res['gk'],res['w']))
            chk(res['raw'],'số liệu gốc còn nguyên')
            fm=('%.3f'%o['nw']['gk']).replace('.',',')
            chk(fm in res['txt'],'phiếu mới hiện γkmax %s'%fm)
            chk(res['old']>1000 and res['oldName'].endswith('_DA_THAY_THE.xlsx'),'có bản cũ đã thay thế')
            chk(res['thay']=='T','phiếu ghi loại thay thế T')
        # sau khi thay: quét không còn khác biệt
        sc=await page.evaluate("""async()=>{const L=await window.__ptn.sdDmScan();return L.map(x=>x.doi.length)}""")
        chk(all(n==0 for n in sc),'sau khi thay, tính lại không còn khác biệt %s'%sc)
        chk(not errs,'lỗi trang %s'%errs[:3])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
