import asyncio, sys, re
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
RAW={'sc_m0':500,'sc_m10':497,'sc_m1':500,'sc_m11':497.5,'rx_V0':1,'rx_m0':1450,'rx_V1':1,'rx_m1':1452,'ra_m20':1000,'ra_m30':688.7,'ra_m40':500,'ra_m21':1000,'ra_m31':688.9,'ra_m41':500,'s5_m0':500,'s5_m5':5.5,'sieve_total':500,'sieve0':0,'sieve1':25,'sieve2':50,'sieve3':125,'sieve4':150,'sieve5':100,'sieve6':50}
def smp(sid,i,st,**kw):
    d={'status':st,'kenh':'thu_cong','created_at':'2026-11-04T02:00:00.000Z','created_by':'Nguyễn Thị Bích Lan','so_yc':'YC26.11.04.%d'%i,'ma_mau':'M26.11.04.%d'%i,
       'khach':{'ten':'Công ty CP Xây dựng 79','lien_he':'Anh Nam','dien_thoai':'0905123456'},'du_an':{'cong_trinh':'Khu đô thị Nam Đồng Hới','hang_muc':'Móng','chu_dau_tu':'Ban QLDA A','giam_sat':'Công ty TV B','thi_cong':'Công ty TC C','dia_chi':'Đồng Hới'},
       'mau':{'loai':'CAT_XD','ten':'Cát xây dựng','ngay_nhan':'2026-11-04','nguon_goc':'Mỏ Sông Gianh','quy_cach':'Cát vàng','ngay_lay':'2026-11-02'},'chi_tieu':['CAT_01','CAT_02','CAT_03','CAT_04','CAT_05'],'han_tra':'2026-11-10'}
    d.update(kw);return d
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        ctx=await br.new_context(viewport={'width':1280,'height':900},accept_downloads=True)
        await ctx.grant_permissions([]) 
        page=await ctx.new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        # giả lập Notification: ghi lại các lần hiện
        await page.add_init_script("""window.__os=[];window.Notification=function(t,o){window.__os.push({t:t,o:o});this.close=function(){}};Notification.permission='default';Notification.requestPermission=function(){Notification.permission='granted';return Promise.resolve('granted');};
          window.__beeps=0;""")
        await page.add_init_script("window.__fake.seed([['config/periods',{open:['2611a']}],['config/main',{policy:'canh_bao',han_tra_ngay:5,solo:true}]])")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        P="window.__ptn"
        await page.evaluate("""async(a)=>{const P=window.__ptn;for(const [id,s] of a)await P.Data.set('samples/'+id,s);}""",[
          ['s_a',smp('s_a',1,'da_tiep_nhan')],['s_b',smp('s_b',2,'da_tiep_nhan')]])
        # ---- 1. Trưởng phòng giao việc bằng giao diện
        print('== 1. TP giao việc cho cán bộ thử nghiệm (giao diện)')
        await page.evaluate("()=>window.__ptn.setSession('NS009')");await page.evaluate("()=>{location.hash='giao-viec'}");await page.wait_for_timeout(500)
        await page.click('table tbody tr:first-child button.btn.primary');await page.wait_for_selector('#as-NS002')
        await page.check('#as-NS002');await page.fill('#as-note','Làm trước, khách cần gấp');await page.click('.modal .btn.primary,[role=dialog] .btn.primary');await page.wait_for_timeout(700)
        n=await page.evaluate("async()=>{const P=window.__ptn;return (await P.Data.readAll('tb_NS002'))}")
        chk(len(n)==1,'NS002 có 1 thông báo '+str(len(n)));
        if n:
            chk(n[0]['title']=='Nhiệm vụ mới' and 'M26.11.04.' in n[0]['body'] and 'Làm trước' in n[0]['body'],'nội dung thông báo giao việc '+n[0]['body']);chk(n[0]['link']=='nhiem-vu' and not n[0].get('read_at'),'link nhiem-vu, chưa đọc');chk(n[0]['by']=='Hoàng Công Lý','ghi người giao')
        chk(len(await page.evaluate("async()=>await window.__ptn.Data.readAll('tb_NS009')"))==0,'người giao không tự nhận thông báo')
        chk(len(await page.evaluate("async()=>await window.__ptn.Data.readAll('pushq')"))==0,'chưa bật đẩy nền thì không ghi hàng đợi pushq')
        # ---- 2. NS002 đăng nhập: chuông, đếm, trang thông báo
        print('== 2. NS002 thấy chuông, số chưa đọc, trang Thông báo')
        await page.evaluate("()=>window.__ptn.setSession('NS002')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(700)
        navtxt=await page.inner_text('.nav');chk('Thông báo' in navtxt,'menu có Thông báo')
        un=await page.evaluate("()=>window.__ptn.tbUnread()");chk(un==1,'chưa đọc = 1: %s'%un)
        chk((await page.title()).startswith('(1)'),'tiêu đề tab có (1): '+await page.title())
        chk(await page.locator('.nav a[data-k=thong-bao] .count').inner_text()=='1','đếm ở menu = 1')
        await page.evaluate("()=>{location.hash='thong-bao'}");await page.wait_for_timeout(500)
        txt=await page.inner_text('.main');chk('Nhiệm vụ mới' in txt and 'Chưa bật' in txt,'trang thông báo hiển thị nội dung và trạng thái Chưa bật')
        await page.screenshot(path='/tmp/w/tb_page.png')
        # ---- 3. bật thông báo hệ điều hành + thông báo mới khi ở cửa sổ khác
        print('== 3. Bật thông báo hệ điều hành')
        await page.click('[data-act=tb-enable]');await page.wait_for_timeout(500)
        chk('Đã bật' in await page.inner_text('.main'),'trạng thái Đã bật')
        await page.evaluate("()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});}")   # giả lập đang ở cửa sổ khác
        await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');await P.tbNotify(['NS002'],{title:'Nhiệm vụ mới',body:'M26.11.04.2 · thử OS',link:'nhiem-vu',kind:'giao'});P.setSession('NS002');}""")
        await page.wait_for_timeout(800)
        os_=await page.evaluate("()=>window.__os")
        chk(len(os_)>=1 and os_[-1]['t']=='Nhiệm vụ mới','thông báo hệ điều hành đã hiện: '+str(os_))
        chk(await page.evaluate("()=>window.__ptn.tbUnread()")==2,'chưa đọc = 2')
        await page.evaluate("()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});}")
        # ---- 4. đánh dấu đã đọc, mở theo link
        print('== 4. Đọc, mở link, đọc tất cả')
        await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='thong-bao'}");await page.wait_for_timeout(500)
        await page.locator('[data-act=tb-open]').first.click();await page.wait_for_timeout(600)
        chk(await page.evaluate("()=>location.hash")=='#nhiem-vu','mở thông báo chuyển tới trang Nhiệm vụ')
        chk(await page.evaluate("()=>window.__ptn.tbUnread()")==1,'đã đọc 1, còn 1')
        await page.evaluate("()=>{location.hash='thong-bao'}");await page.wait_for_timeout(400)
        await page.click('[data-act=tb-readall]');await page.wait_for_timeout(600)
        chk(await page.evaluate("()=>window.__ptn.tbUnread()")==0,'đọc tất cả = 0');chk(not (await page.title()).startswith('('),'tiêu đề hết số')
        # ---- 5. nộp kết quả -> người soát xét; soát xét đạt -> giám đốc; trả lại -> cán bộ
        print('== 5. Chuỗi thông báo theo luồng')
        await page.evaluate("""async(raw)=>{const P=window.__ptn;const rc=P.recompute(raw),res={sc:rc.sc,rx:rc.rx,ra:rc.ra,s5:rc.s5,mdl:rc.mdl};
          const sieve=[0,1,2,3,4,5,6].map(i=>({lab:'c'+i,sang:i,rieng:raw['sieve'+i]/5,tich_luy:(rc.cum||[])[i]}));
          await P.Data.update('samples/s_a',{status:'cho_soat_xet',giao:{ma_nv:'NS002',ten:'Trần Đăng Hùng',han:'2026-11-10',ma_gv:'GV1',by:'x',at:'2026-11-05T00:00:00Z'},
            nop:{at:'2026-11-05T03:00:00.000Z',by:'Trần Đăng Hùng',d0:'2026-11-04',d1:'2026-11-05',warn_n:0,file_name:'BM-CAT-01.xlsx',size:100,sha256:'ab'.repeat(32),results:res,raw,sieve,checks:[],devs:[]}});
          await new Promise(r=>setTimeout(r,300));}""",RAW)
        await page.evaluate("()=>window.__ptn.setSession('NS002')")
        # gọi qua giao diện soát xét thật: NS009 mở mẫu s_a chờ soát xét -> trả lại
        await page.evaluate("()=>window.__ptn.setSession('NS009')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='soat-xet'}");await page.wait_for_timeout(600)
        btn=page.locator('table button.btn.sm.primary').first
        await btn.click();await page.wait_for_selector('#rd-why',timeout=5000)
        await page.fill('#rd-why','Số liệu sàng chưa khớp, làm lại');await page.click('.modal button:has-text("Trả lại"),[role=dialog] button:has-text("Trả lại")');await page.wait_for_timeout(900)
        t=await page.evaluate("async()=>(await window.__ptn.Data.readAll('tb_NS002')).filter(x=>x.kind==='tra_lai')")
        chk(len(t)==1 and 'Số liệu sàng' in t[0]['body'],'cán bộ nhận thông báo bị trả lại: '+str(t))
        # sửa phiếu: lập -> người soát xét nhận
        r=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS011');const s=P.S.samples.find(x=>x.id==='s_b');
          await P.Data.update('samples/s_b',{status:'da_phat_hanh',so_bao_cao:'BC26.11.04.9',phat_hanh_at:'2026-11-05T00:00:00Z'});return 1}""")
        # đề nghị sửa: dùng sdCreate trực tiếp với mẫu có đủ dữ liệu giả (chỉ kiểm thông báo)
        r=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS011');const s=Object.assign({},P.S.samples.find(x=>x.id==='s_b'));
          const d=await P.sdCreate(s,{loai:'B',doi:[{k:'du_an.hang_muc',l:'Hạng mục',cu:'Móng',moi:'Móng M2'}],ly_do:'khách đề nghị',can_cu:{vb_so:'1',vb_ngay:'2026-11-06',nguoi_de_nghi:'A',hinh_thuc:'x'}});
          const a=(await P.Data.readAll('tb_NS009')).filter(x=>x.kind==='sua_phieu').map(x=>x.title);
          P.setSession('NS009');await P.sdMove(d,'cho_phe_duyet',{sx:{by:'x',by_id:'NS009',at:'2026-11-06T00:00:00Z'}},'Soát xét');
          const b=(await P.Data.readAll('tb_NS010')).filter(x=>x.kind==='sua_phieu').map(x=>x.title);return {a,b}}""")
        chk(r['a']==['Đề nghị sửa phiếu chờ soát xét'],'soát xét nhận thông báo đề nghị sửa phiếu '+str(r['a']));chk(r['b']==['Đề nghị sửa phiếu chờ phê duyệt'],'giám đốc nhận thông báo chờ phê duyệt '+str(r['b']))
        # ---- 6. chuông trên điện thoại + trang dựng được cho mọi vai trò
        print('== 6. Điện thoại: chuông; mọi vai trò mở được trang')
        await page.set_viewport_size({'width':390,'height':800});await page.evaluate("()=>window.__ptn.setSession('NS002')");await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(600)
        chk(await page.locator('.topbar .bell').is_visible(),'chuông hiện trên điện thoại');chk(await page.locator('.topbar .bell .count').count()>=1,'chuông có số chưa đọc')
        await page.screenshot(path='/tmp/w/tb_mobile.png')
        await page.locator('.topbar .bell').click();await page.wait_for_timeout(500);chk(await page.evaluate("()=>location.hash")=='#thong-bao','bấm chuông mở trang thông báo')
        await page.set_viewport_size({'width':1280,'height':900})
        for acc in ['NS009','NS010','NS011','NS012','NS013','NS002']:
            await page.evaluate("(a)=>window.__ptn.setSession(a)",acc);await page.evaluate("()=>{location.hash='tong-quan'}");await page.evaluate("()=>{location.hash='thong-bao'}");await page.wait_for_timeout(300)
            chk('Nhận thông báo' in await page.inner_text('.main'),acc+' mở được trang Thông báo')
        # ---- 7. bật đẩy nền: ghi hàng đợi pushq
        print('== 7. Đẩy nền: ghi hàng đợi khi có cấu hình')
        await page.evaluate("()=>{window.FIREBASE_PUSH={vapidKey:'KEY'};}")
        await page.evaluate("()=>window.__ptn.setSession('NS009')")
        await page.evaluate("async()=>{await window.__ptn.tbNotify(['NS002'],{title:'Đẩy nền',body:'thử',link:'nhiem-vu'});}")
        q=await page.evaluate("async()=>await window.__ptn.Data.readAll('pushq')")
        chk(len(q)==1 and q[0]['to']=='NS002' and q[0]['tag'].startswith('n_'),'hàng đợi pushq có 1 mục '+str(q))
        # ---- 8. hồi quy: giao việc không chặn khi ghi thông báo lỗi
        print('== 8. Lỗi ghi thông báo không làm hỏng thao tác chính')
        r=await page.evaluate("""async()=>{const P=window.__ptn;const old=P.Data.set;let called=0;
          const real=P.Data.set.bind(P.Data);P.Data.set=async(p,o)=>{if(/^tb_/.test(p)){called++;throw new Error('boom');}return real(p,o);};
          let err=null;try{await P.tbNotify(['NS002'],{title:'x',body:'y'});}catch(e){err=e.message}
          P.Data.set=real;return {called,err}}""")
        chk(r['called']>=1 and r['err'] is None,'tbNotify nuốt lỗi '+str(r))
        errs=[e for e in errs if 'favicon' not in e and 'boom' not in e]
        chk(not errs,'lỗi console: '+'; '.join(errs[:5]))
        print('OK=%d FAIL=%d'%(ok,bad))
        await br.close()
asyncio.run(main())
