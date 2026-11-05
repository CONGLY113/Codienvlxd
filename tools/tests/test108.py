import asyncio, json, sys, base64, io, zipfile, re
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
RAW={'sc_m0':500,'sc_m10':497,'sc_m1':500,'sc_m11':497.5,'rx_V0':1,'rx_m0':1450,'rx_V1':1,'rx_m1':1452,'ra_m20':1000,'ra_m30':688.7,'ra_m40':500,'ra_m21':1000,'ra_m31':688.9,'ra_m41':500,'s5_m0':500,'s5_m5':5.5,
     'sieve_total':500,'sieve0':0,'sieve1':25,'sieve2':50,'sieve3':125,'sieve4':150,'sieve5':100,'sieve6':50}
def sample(sid,i,khach,ct,**kw):
    d={'status':'cho_phe_duyet','kenh':'thu_cong','created_at':'2026-11-04T02:00:00.000Z','created_by':'Nguyễn Thị Bích Lan','so_yc':'YC26.11.04.%d'%i,'ma_mau':'M26.11.04.%d'%i,
       'khach':{'ten':khach,'lien_he':'Anh Nam','dien_thoai':'0905123456'},'du_an':{'cong_trinh':ct,'hang_muc':'Móng','chu_dau_tu':'Ban QLDA A','giam_sat':'Công ty TV B','thi_cong':'Công ty TC C','dia_chi':'Đồng Hới'},
       'mau':{'loai':'CAT_XD','ten':'Cát xây dựng','ngay_nhan':'2026-11-04','nguon_goc':'Mỏ Sông Gianh','quy_cach':'Cát vàng','ngay_lay':'2026-11-02'},'chi_tieu':['CAT_01','CAT_02','CAT_03','CAT_04','CAT_05'],
       'giao':{'ma_nv':'NS002','ten':'Trần Đăng Hùng','ma_gv':'GV26.11.04.%d'%i,'at':'2026-11-04T08:00:00.000Z','han':'2026-11-10'},'han_tra':'2026-11-10',
       'nop':{'at':'2026-11-05T03:00:00.000Z','by':'Trần Đăng Hùng','d0':'2026-11-04','d1':'2026-11-05','warn_n':0,'file_name':'BM-CAT-01.xlsx','size':100,'sha256':'ab'*32},
       'soat_xet':{'by':'Hoàng Công Lý','by_id':'NS009','at':'2026-11-05T04:00:00.000Z'}}
    d.update(kw);return d
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        ctx=await br.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        page=await ctx.new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true,url_app:'https://ptn-vlxd.web.app'}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("()=>window.__ptn.setSession('NS009')");await page.wait_for_timeout(400)
        # ---- dựng 2 phiếu đã phát hành thật: s2611a_t1 (mẫu mới, tách detail) và s_t2 (mẫu cũ, file phiếu lưu)
        r=await page.evaluate("""async(a)=>{const P=window.__ptn,[raw,s1,s2]=a;
          const rc=P.recompute(raw),res={sc:rc.sc,rx:rc.rx,ra:rc.ra,s5:rc.s5,mdl:rc.mdl};
          const sieve=[0,1,2,3,4,5,6].map(i=>({lab:'c'+i,sang:i,rieng:raw['sieve'+i]/5,tich_luy:(rc.cum||[])[i]}));
          const out=[];
          for(const [path,s,legacy] of [['samples_2611a/s2611a_t1',s1,false],['samples/s_t2',s2,true]]){
            const id=path.split('/')[1];
            const nop=Object.assign({},s.nop,{results:res,sieve,raw});
            if(!legacy){await P.Data.set('detail_2611a/'+id,{sample:id,raw,sieve,checks:[],devs:[]});const n2=Object.assign({},s.nop,{results:res,split:true});await P.Data.set(path,Object.assign({},s,{nop:n2}));}
            else await P.Data.set(path,Object.assign({},s,{nop}));
          }
          await new Promise(r=>setTimeout(r,400));
          for(const [path,legacy] of [['samples_2611a/s2611a_t1',false],['samples/s_t2',true]]){
            const id=path.split('/')[1];let s=P.S.samples.find(x=>x.id===id);s=await P.withDetail(s,true);
            const so=await P.makeCode('bc','2026-11-04'),now='2026-11-06T01:00:00.000Z';
            const phieu=await P.issueDoc(s,so,now);
            await P.Data.update(path,{status:'da_phat_hanh',so_bao_cao:so,phat_hanh_at:now,pd:{by:'Lưu Minh Tuấn',by_id:'NS010',at:now,y_kien:''},phieu});
            out.push(so);
          }
          await new Promise(r=>setTimeout(r,400));return out;}""",[RAW,sample('s2611a_t1',1,'Công ty CP Xây dựng 79','Khu đô thị Nam Đồng Hới'),sample('s_t2',2,'Công ty TNHH Hưng Thịnh','Nhà máy nước Đồng Hới')])
        bc1,bc2=r;print('phiếu gốc:',bc1,bc2)
        chk(bc1!=bc2,'hai số báo cáo khác nhau')
        # ---- 0. luồng cũ còn nguyên
        print('== 0. luồng cũ: tải phiếu gốc, tra cứu, tên file')
        o=await page.evaluate("""async(id)=>{const P=window.__ptn;const s=P.S.samples.find(x=>x.id===id);const b=await P.phieuBytes(s);return {name:b.name,len:b.bytes.length,no:P.phieuNo(s),rev:s.sua_doi||null}}""",'s2611a_t1')
        chk(o['name']=='BM-CAT-01_%s.xlsx'%bc1,'tên file phiếu gốc '+o['name']);chk(o['no']==bc1,'phieuNo = số gốc');chk(o['rev'] is None,'chưa có sua_doi')
        # ---- 1. lập đề nghị bằng giao diện (NS011 giao nhận)
        print('== 1. NS011 lập đề nghị loại B bằng giao diện')
        await page.evaluate("()=>window.__ptn.setSession('NS011')");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(500)
        navtxt=await page.inner_text('.nav')
        chk('Sửa đổi phiếu' in navtxt,'menu có Sửa đổi phiếu cho giao nhận')
        await page.click('[data-act=sd-add]');await page.wait_for_selector('#sd-pick')
        await page.fill('#sd-pick',bc1);await page.dispatch_event('#sd-pick','input');await page.wait_for_timeout(200)
        await page.select_option('#sd-loai','B');await page.wait_for_timeout(200)
        await page.fill('input[aria-label="Tên công trình mới"]','Khu đô thị Nam Đồng Hới - giai đoạn 2')
        await page.fill('input[aria-label="Chủ đầu tư mới"]','Ban QLDA Đầu tư xây dựng tỉnh')
        await page.screenshot(path='/tmp/w/sd_dialog.png')
        # chưa nhập lý do -> bị chặn
        await page.click('[data-act=sd-save]');await page.wait_for_timeout(200)
        chk(await page.locator('.toast').count()>0,'thiếu lý do bị chặn')
        chk(await page.evaluate("()=>window.__ptn.sdList().length")==0,'chưa tạo hồ sơ khi thiếu lý do')
        await page.fill('#sd-ly','Khách điều chỉnh tên công trình theo hợp đồng mới');await page.fill('#sd-vbso','CV-12');await page.fill('#sd-vbng','2026-11-06');await page.fill('#sd-ng','Anh Nam, giám đốc, Cty 79')
        await page.click('[data-act=sd-save]');await page.wait_for_timeout(800)
        print('  toast:',await page.evaluate("()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent)"));print('  list:',await page.evaluate("()=>window.__ptn.sdList().length"));await page.screenshot(path='/tmp/w/dbg.png')
        await page.wait_for_selector('[data-act=sd-p1]',timeout=5000)
        L=await page.evaluate("()=>window.__ptn.sdList()")
        chk(len(L)==1,'có 1 hồ sơ');d=L[0];print('  ',d['ma'],d['loai'],d['status'],d['bc_moi'])
        chk(d['status']=='cho_soat_xet' and d['loai']=='B','trạng thái chờ soát xét')
        chk(d['bc_moi']==bc1+'-SĐ01','số phiếu thay thế '+d['bc_moi'])
        chk(len(d['doi'])==2 and d['doi'][0]['cu']=='Khu đô thị Nam Đồng Hới','giá trị cũ ghi đúng')
        chk(d['ma'].startswith('SĐ26.11.06.') or d['ma'].startswith('SĐ'),'mã hồ sơ SĐ')
        # người lập không tự soát xét/phê duyệt: modal không có nút
        chk(await page.locator('[data-act=sd-sx]').count()==0 and await page.locator('[data-act=sd-pd]').count()==0,'người lập không có nút soát xét/phê duyệt')
        s1=await page.evaluate("()=>{const s=window.__ptn.S.samples.find(x=>x.id==='s2611a_t1');return {ct:s.du_an.cong_trinh,st:s.status,bc:s.so_bao_cao}}")
        chk(s1['ct']=='Khu đô thị Nam Đồng Hới' and s1['st']=='da_phat_hanh','phiếu chưa bị sửa khi mới đề nghị')
        await page.keyboard.press('Escape')
        # ---- 2. soát xét (NS009) rồi phê duyệt (NS010)
        print('== 2. soát xét NS009, phê duyệt NS010')
        await page.evaluate("()=>window.__ptn.setSession('NS009')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(500)
        await page.click('[data-act=sd-open]');await page.wait_for_selector('[data-act=sd-sx]')
        chk(await page.locator('[data-act=sd-pd]').count()==0,'chưa tới bước phê duyệt')
        await page.fill('#sd-why','Đối chiếu văn bản CV-12 khớp');await page.click('[data-act=sd-sx]');await page.wait_for_timeout(600)
        d=(await page.evaluate("()=>window.__ptn.sdList()"))[0];chk(d['status']=='cho_phe_duyet' and d['sx']['by_id']=='NS009','đã soát xét')
        await page.evaluate("()=>window.__ptn.setSession('NS010')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(500)
        await page.click('[data-act=sd-open]');await page.wait_for_selector('[data-act=sd-pd]')
        await page.screenshot(path='/tmp/w/sd_detail_pd.png')
        await page.click('[data-act=sd-pd]');await page.wait_for_selector('[data-act=sd-p2]',timeout=15000)
        d=(await page.evaluate("()=>window.__ptn.sdList()"))[0]
        chk(d['status']=='da_phat_hanh','trạng thái chờ thu hồi: '+d['status']);chk(d['truoc'] and d['truoc']['du_an']['cong_trinh']=='Khu đô thị Nam Đồng Hới','lưu giá trị cũ')
        s1=await page.evaluate("()=>{const s=window.__ptn.S.samples.find(x=>x.id==='s2611a_t1');return {ct:s.du_an.cong_trinh,cdt:s.du_an.chu_dau_tu,st:s.status,bc:s.so_bao_cao,ph:s.phieu,sd:s.sua_doi,pha:s.phat_hanh_at}}")
        chk(s1['ct']=='Khu đô thị Nam Đồng Hới - giai đoạn 2' and s1['cdt']=='Ban QLDA Đầu tư xây dựng tỉnh','mẫu mang giá trị mới')
        chk(s1['bc']==bc1,'so_bao_cao gốc không đổi');chk(s1['ph']['bc']==bc1+'-SĐ01','phiếu hiện hành SĐ01')
        chk(s1['sd']['rev']==1 and len(s1['sd']['ds'])==2 and s1['sd']['ds'][0]['hash']==d['truoc']['phieu']['hash'],'chuỗi phiên bản')
        chk(s1['pha']=='2026-11-06T01:00:00.000Z','ngày phát hành gốc không đổi')
        chk(s1['ph']['hash']!=d['truoc']['phieu']['hash'],'mã băm mới khác mã băm cũ')
        # mã băm khớp dữ liệu niêm phong (mẫu mới: snap ở detail)
        hv=await page.evaluate("""async()=>{const P=window.__ptn;let s=P.S.samples.find(x=>x.id==='s2611a_t1');s=await P.withDetail(s,true);
          const b=new TextEncoder().encode(s.phieu.snap||'');const h=await crypto.subtle.digest('SHA-256',b);const hex=[...new Uint8Array(h)].map(x=>x.toString(16).padStart(2,'0')).join('');return [hex===s.phieu.hash,JSON.parse(s.phieu.snap).thay_the.bc_cu]}""")
        chk(hv[0],'mã băm phiếu thay thế khớp snap');chk(hv[1]==bc1,'snap ghi phiếu bị thay thế')
        # file Excel phiếu mới & cũ
        xb=await page.evaluate("""async()=>{const P=window.__ptn;const s=P.S.samples.find(x=>x.id==='s2611a_t1');const o=await P.phieuBytes(s);const old=await P.sdOldBytes(P.sdList()[0]);
          const rd=async(b)=>{const z=await JSZip.loadAsync(b);const t=[];for(const n of Object.keys(z.files))if(/(worksheets\\/sheet\\d+|sharedStrings)\.xml$/.test(n))t.push(await z.file(n).async('string'));return t.join('')};
          return {nn:o.name,on:old.name,newx:await rd(o.bytes),oldx:await rd(old.bytes)}}""")
        chk(xb['nn']=='BM-CAT-01_%s-SĐ01.xlsx'%bc1,'tên file mới '+xb['nn']);chk(xb['on']=='BM-CAT-01_%s_DA_THAY_THE.xlsx'%bc1,'tên file cũ '+xb['on'])
        chk('Phiếu này thay thế phiếu số '+bc1 in xb['newx'],'Excel mới có dòng thay thế');chk('Khu đô thị Nam Đồng Hới - giai đoạn 2' in xb['newx'],'Excel mới có tên công trình mới')
        chk('Số báo cáo: '+bc1+'-SĐ01' in xb['newx'],'Excel mới ghi số SĐ01')
        print('  oldx cong trinh:',re.findall(r'Khu đô thị[^<]{0,40}',xb['oldx']));chk('ĐÃ BỊ THAY THẾ' in xb['oldx'],'Excel cũ có dòng đã bị thay thế');chk('Khu đô thị Nam Đồng Hới' in xb['oldx'] and '- giai đoạn 2' not in xb['oldx'],'Excel cũ giữ tên công trình cũ')
        await page.screenshot(path='/tmp/w/sd_detail_done.png')
        await page.keyboard.press('Escape');await page.wait_for_timeout(300)
        # ---- 3. tra cứu
        print('== 3. tra cứu QR')
        slug_old='tc-'+re.sub(r'[^A-Za-z0-9]+','-',bc1);slug_new=slug_old+'-SD01'
        await page.evaluate("(h)=>{location.hash=h}",slug_old);await page.wait_for_timeout(900)
        txt=await page.inner_text('#app')
        await page.screenshot(path='/tmp/w/sd_look_old.png')
        chk('đã bị thay thế' in txt and (bc1+'-SĐ01') in txt,'tra cứu số cũ báo đã bị thay thế')
        await page.evaluate("(h)=>{location.hash=h}",slug_new);await page.wait_for_timeout(900)
        txt=await page.inner_text('#app');await page.screenshot(path='/tmp/w/sd_look_new.png');chk('bản sửa đổi lần 1' in txt,'tra cứu số mới báo bản sửa đổi: '+txt[:200].replace('\n',' '))
        chk('Nguyên vẹn' in txt,'mã băm khớp trên trang tra cứu')
        # ---- 4. thu hồi bản cũ, đóng hồ sơ (NS011)
        print('== 4. thu hồi bản cũ')
        await page.keyboard.press('Escape');await page.wait_for_timeout(200)
        await page.evaluate("()=>window.__ptn.setSession('NS011')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(500)
        await page.click('[data-act=sd-open]');await page.wait_for_selector('[data-act=sd-th]')
        await page.select_option('#sd-th','khong_thu_hoi');await page.fill('#sd-thgc','Đã nộp cho Sở Xây dựng');await page.click('[data-act=sd-th]');await page.wait_for_timeout(600)
        d=(await page.evaluate("()=>window.__ptn.sdList()"))[0];chk(d['status']=='hoan_tat' and d['thu_hoi']['ma']=='khong_thu_hoi','đóng hồ sơ')
        # ---- 5. mẫu cũ (file lưu), loại A sửa ngày nhận; lần sửa thứ hai
        print('== 5. mẫu cũ có file lưu; loại A ngày nhận; SĐ01 rồi SĐ02')
        await page.evaluate("()=>window.__ptn.setSession('NS009')")
        e1=await page.evaluate("""async(a)=>{const P=window.__ptn;const s=P.S.samples.find(x=>x.id==='s_t2');return [P.sdDateErr(s,'2026-11-01'),P.sdDateErr(s,'2026-11-05'),P.sdDateErr(s,'2027-01-01'),P.sdDateErr(s,'2026-11-03')]}""",None)
        chk('trước ngày lấy mẫu' in e1[0],'chặn ngày trước ngày lấy mẫu');chk('sau ngày bắt đầu' in e1[1],'chặn ngày sau ngày thử');chk('tương lai' in e1[2],'chặn ngày tương lai');chk(e1[3]=='','ngày hợp lệ qua')
        r=await page.evaluate("""async()=>{const P=window.__ptn;const s=P.S.samples.find(x=>x.id==='s_t2');
          P.setSession('NS011');const d1=await P.sdCreate(s,{loai:'A',doi:[{k:'mau.ngay_nhan',l:'Ngày nhận mẫu',cu:'2026-11-04',moi:'2026-11-03'}],ly_do:'Phiếu giao nhận ghi 03/11',bang_chung:'Phiếu giao nhận số 55 ngày 03/11/2026 có chữ ký'});
          await new Promise(r=>setTimeout(r,300));
          let blocked=null;try{const dup=await P.sdCreate(s,{loai:'A',doi:[],ly_do:'x'});}catch(e){blocked=String(e)}
          const act=P.sdList().filter(x=>x.sample==='s_t2').length;
          P.setSession('NS009');let self='';try{await P.sdApprove(d1,'')}catch(e){self=e.message}
          return {id:d1.id,ma:d1.ma,self,act}}""")
        # NS009 (sx+pd) trong chế độ chạy thử vẫn được duyệt đề nghị do NS011 lập (khác người lập)
        d1=(await page.evaluate("()=>window.__ptn.sdList().find(x=>x.sample==='s_t2')"))
        r2=await page.evaluate("""async(id)=>{const P=window.__ptn;P.setSession('NS009');const d=P.sdList().find(x=>x.id===id);await P.sdMove(d,'cho_phe_duyet',{sx:{by:'Hoàng Công Lý',by_id:'NS009',at:new Date().toISOString(),y_kien:''}},'Soát xét');
          await new Promise(r=>setTimeout(r,300));const d2=P.sdList().find(x=>x.id===id);const out=await P.sdApprove(d2,'ok');await new Promise(r=>setTimeout(r,400));
          const s=P.S.samples.find(x=>x.id==='s_t2');const f=await P.Data.get('files/'+s.phieu.file_id);const o=await P.phieuBytes(s);
          return {bc:out.bc,nn:s.mau.ngay_nhan,fid:s.phieu.file_id,fname:f&&f.name,ph:s.phieu.bc,ok:!!(f&&f.b64),name:o.name,old_file:!!(await P.Data.get('files/f_s_t2_bc'))}}""",d1['id'])
        chk(r2['bc']==bc2+'-SĐ01','legacy SĐ01 '+r2['bc']);chk(r2['nn']=='2026-11-03','ngày nhận mới');chk(r2['fid']=='f_s_t2_bc01' and r2['ok'],'file phiếu mới lưu riêng '+str(r2['fid']));chk(r2['old_file'],'file phiếu cũ vẫn còn')
        chk(r2['name']=='BM-CAT-01_%s-SĐ01.xlsx'%bc2,'tải phiếu mới tên '+r2['name'])
        # lần sửa thứ hai (SĐ02) lên mẫu cũ
        r3=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS011');const s=P.S.samples.find(x=>x.id==='s_t2');
          // còn hồ sơ chờ thu hồi -> bị chặn ở bước tạo giao diện, ở đây sdCreate không chặn nên ta đóng hồ sơ cũ trước
          const d0=P.sdList().find(x=>x.sample==='s_t2');await P.sdMove(d0,'hoan_tat',{thu_hoi:{ma:'dien_tu',kieu:'x',by:'a',at:new Date().toISOString()}},'Thu hồi');await new Promise(r=>setTimeout(r,300));
          const d=await P.sdCreate(P.S.samples.find(x=>x.id==='s_t2'),{loai:'B',doi:[{k:'khach.ten',l:'Tên khách hàng',cu:'Công ty TNHH Hưng Thịnh',moi:'Công ty CP Hưng Thịnh'}],ly_do:'Đổi loại hình',can_cu:{vb_so:'1',vb_ngay:'2026-11-06',nguoi_de_nghi:'A',hinh_thuc:'x'}});
          await new Promise(r=>setTimeout(r,300));P.setSession('NS009');await P.sdMove(P.sdList().find(x=>x.id===d.id),'cho_phe_duyet',{sx:{by:'x',by_id:'NS009',at:'2026-11-06T00:00:00Z'}},'sx');await new Promise(r=>setTimeout(r,300));
          P.setSession('NS010');const out=await P.sdApprove(P.sdList().find(x=>x.id===d.id),'');await new Promise(r=>setTimeout(r,400));
          const s2=P.S.samples.find(x=>x.id==='s_t2');return {bc:out.bc,ds:s2.sua_doi.ds.map(x=>x.no),kh:s2.khach.ten,nn:s2.mau.ngay_nhan}}""")
        chk(r3['bc']==bc2+'-SĐ02','SĐ02 '+str(r3));chk(len(r3['ds'])==3 and r3['kh']=='Công ty CP Hưng Thịnh' and r3['nn']=='2026-11-03','chuỗi 3 phiên bản, giữ ngày nhận đã sửa')
        # ---- 6. loại D, chặn trùng, giá trị cũ bị lệch
        print('== 6. loại D, chặn, lệch giá trị')
        r4=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS011');const s=P.S.samples.find(x=>x.id==='s2611a_t1');
          const dd=await P.sdCreate(s,{loai:'D',doi:[],ly_do:'Khách muốn đổi số lượng mẫu và kết quả'});
          const d=await P.sdCreate(s,{loai:'B',doi:[{k:'du_an.hang_muc',l:'Hạng mục',cu:'Sai giá trị cũ',moi:'Móng M2'}],ly_do:'thử',can_cu:{vb_so:'',vb_ngay:'2026-11-06',nguoi_de_nghi:'A',hinh_thuc:'x'}});
          await new Promise(r=>setTimeout(r,300));P.setSession('NS009');await P.sdMove(P.sdList().find(x=>x.id===d.id),'cho_phe_duyet',{sx:{by:'x',by_id:'NS009',at:'2026-11-06T00:00:00Z'}},'sx');await new Promise(r=>setTimeout(r,300));
          P.setSession('NS010');let err='';try{await P.sdApprove(P.sdList().find(x=>x.id===d.id),'')}catch(e){err=e.message}
          const s2=P.S.samples.find(x=>x.id==='s2611a_t1');const d2=P.sdList().find(x=>x.id===d.id);
          return {dstatus:dd.status,err,hm:s2.du_an.hang_muc,st:d2.status,rev:s2.sua_doi.rev}}""")
        chk(r4['dstatus']=='tu_choi','loại D ghi nhận từ chối');chk('đã khác' in r4['err'],'chặn khi giá trị cũ lệch: '+r4['err']);chk(r4['hm']=='Móng','mẫu không bị đổi khi lỗi');chk(r4['st']=='cho_phe_duyet','hồ sơ quay lại chờ phê duyệt sau lỗi: '+r4['st']);chk(r4['rev']==1,'rev giữ nguyên')
        # người lập không tự duyệt
        r5=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');const s=P.S.samples.find(x=>x.id==='s2611a_t1');
          const d=await P.sdCreate(s,{loai:'B',doi:[{k:'du_an.hang_muc',l:'Hạng mục',cu:'Móng',moi:'Móng M3'}],ly_do:'tự lập tự duyệt',can_cu:{vb_so:'',vb_ngay:'2026-11-06',nguoi_de_nghi:'A',hinh_thuc:'x'}});return d.id}""")
        await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(500)
        # mở hồ sơ vừa lập bởi NS009 (đang là NS009)
        await page.evaluate("(id)=>window.__ptn.sdOpen(id)",r5);await page.wait_for_timeout(300)
        chk(await page.locator('[data-act=sd-sx]').count()==0,'người lập NS009 không có nút soát xét')
        await page.keyboard.press('Escape')
        # ---- 7. in biểu mẫu, sao lưu
        print('== 7. in BM-SĐ-01/02, sao lưu')
        t=await page.evaluate("""()=>{const P=window.__ptn,d=P.sdList().find(x=>x.status==='hoan_tat');const a=P.sdPrintBox('01',d).innerText||'',b=P.sdPrintBox('02',d).textContent;return [P.sdPrintBox('01',d).textContent.includes('PHIẾU ĐỀ NGHỊ ĐIỀU CHỈNH'),b.includes('BIÊN BẢN ĐÍNH CHÍNH'),b.includes(d.bc_moi)]}""")
        chk(all(t),'nội dung biểu mẫu in '+str(t))
        bk=await page.evaluate("""async()=>{const P=window.__ptn;const C=await P.bkupCollect({},function(){});return [C.cols.includes('suadoi'),(C.data.suadoi||[]).length]}""")
        chk(bk[0] and bk[1]>=4,'sao lưu có suadoi '+str(bk))
        xl=await page.evaluate("""async()=>{const P=window.__ptn;const r=await P.bkupRun({},function(){});return r.sheets.map(s=>s[0])}""")
        chk('Sua_phieu' in xl or any(n=='Sua_phieu' for n in xl),'sao lưu có sheet Sua_phieu '+str(xl))
        # ---- 8. các trang cũ vẫn dựng được
        print('== 8. mọi trang vẫn dựng được')
        for acc,pages in [('NS009',['tong-quan','nhan-mau','giao-viec','soat-xet','luu-tru','thanh-toan','thong-ke','thiet-bi','nhat-ky','mau-bieu','cai-dat','sua-phieu']),('NS002',['tong-quan','nhiem-vu','luu-tru','thiet-bi']),('NS011',['tong-quan','nhan-mau','thanh-toan','sua-phieu'])]:
            await page.evaluate("(a)=>window.__ptn.setSession(a)",acc)
            for p in pages:
                await page.evaluate("(p)=>{location.hash=p}",p);await page.wait_for_timeout(250)
                hh=await page.evaluate("()=>document.querySelector('.main h1')?document.querySelector('.main h1').textContent:''")
                chk(len(hh)>0,acc+' trang '+p+' không dựng được')
        await page.evaluate("()=>window.__ptn.setSession('NS012')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(400)
        chk('Sửa đổi phiếu' not in await page.inner_text('.nav'),'thủ quỹ không thấy menu Sửa đổi phiếu')
        # ảnh
        await page.evaluate("()=>window.__ptn.setSession('NS011')");await page.evaluate("()=>{location.hash='sua-phieu'}");await page.wait_for_timeout(600)
        await page.screenshot(path='/tmp/w/sd_list.png')
        errs=[e for e in errs if 'favicon' not in e]
        chk(not errs,'lỗi console: '+'; '.join(errs[:5]))
        print('OK=%d FAIL=%d'%(ok,bad))
        await br.close()
asyncio.run(main())
