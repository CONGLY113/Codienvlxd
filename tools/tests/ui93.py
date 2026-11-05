import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SETUP=r"""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const nhan=iso(new Date(Date.now()-864e5));
 P.setSession('NS009');await sleep(150);
 const id=P.newSid();const d={kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-U1',ma_mau:'',khach:{ten:'K'},du_an:{cong_trinh:'Trường THPT Đồng Hới',thi_cong:'TC'},mau:{loai:'DO_CS',ten:'Đo điện trở tiếp đất (chống sét)',nguon_goc:'Nhà lớp học A',ngay_nhan:nhan,ngay_lay:nhan},chi_tieu:P.defTests('DO_CS'),han_tra:nhan,status:'da_giao'};
 d.ma_mau=await P.makeCode('mau',nhan,'DO_CS');d.giao={ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()};await P.Data.set(P.sp(id),d);
 await sleep(400);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(700);return id;})()"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        ctx=await br.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True)
        page=await ctx.new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        sid=await page.evaluate(SETUP)
        await page.wait_for_selector('.mf-sec',timeout=5000)
        ld=lambda:page.evaluate("(id)=>JSON.parse(localStorage.getItem('ptn_mf_'+id)||'null')",sid)
        print('mf secs',await page.evaluate("()=>[...document.querySelectorAll('.mf-sec h3')].map(h=>h.textContent)"))
        await page.screenshot(path='/tmp/w/ui_cs0.png',full_page=True)
        async def fill(sec,label,val):
            el=await page.query_selector_all('.mf-sec')
            inp=await el[sec].query_selector('label:has-text("%s") input'%label); assert inp,(sec,label); await inp.fill(val)
        await fill(1,'Điện trở tối đa','10')
        for i,(n,a,b,c) in enumerate([('Cọc tiếp địa góc Đông Nam','4,36','4,58','4,88'),('Cọc tiếp địa góc Tây Bắc','5,26','5,78','5,02')]):
            await fill(2+i,'Vị trí',n); await fill(2+i,'Lần đo 1',a); await fill(2+i,'Lần đo 2',b); await fill(2+i,'Lần đo 3',c)
        print('lives',await page.evaluate("()=>[...document.querySelectorAll('.mf-live')].map(x=>x.textContent)"))
        await page.click('[data-act=cs-add]'); await page.wait_for_timeout(300)
        print('sau thêm',await page.evaluate("()=>document.querySelectorAll('.mf-sec').length"))
        await page.click('[data-act=cs-del]'); await page.wait_for_timeout(300)
        print('sau bớt',await page.evaluate("()=>document.querySelectorAll('.mf-sec').length"))
        # mở bảng vẽ
        await page.click('[data-act=sk-open]'); await page.wait_for_selector('.sk-ov'); await page.wait_for_timeout(300)
        await page.screenshot(path='/tmp/w/ui_sk0.png')
        box=await (await page.query_selector('.sk-cv')).bounding_box(); print('canvas box',box)
        X=lambda fx:box['x']+box['width']*fx; Y=lambda fy:box['y']+box['height']*fy
        async def drag(pts):
            await page.mouse.move(X(pts[0][0]),Y(pts[0][1])); await page.mouse.down()
            for p in pts[1:]: await page.mouse.move(X(p[0]),Y(p[1]),steps=4)
            await page.mouse.up()
        async def tool(k): await page.click('[data-tool=%s]'%k)
        await tool('r'); await drag([(0.2,0.2),(0.7,0.6)])
        await tool('l'); await drag([(0.1,0.8),(0.5,0.8)])
        await tool('a'); await drag([(0.7,0.6),(0.9,0.85)])
        await tool('o'); await drag([(0.4,0.3),(0.55,0.45)])
        await tool('p'); await drag([(0.1,0.1),(0.12,0.15),(0.15,0.2),(0.2,0.2)])
        await tool('n')
        for fx,fy in [(0.2,0.2),(0.7,0.6),(0.47,0.37)]:
            await page.mouse.click(X(fx),Y(fy))
        await tool('t'); await page.mouse.click(X(0.25),Y(0.7)); await page.fill('.sk-txt input','Nhà A - 20 m'); await page.press('.sk-txt input','Enter')
        await page.screenshot(path='/tmp/w/ui_sk1.png')
        # gôm: xóa đường ngang
        await tool('x'); await page.mouse.click(X(0.3),Y(0.8)); 
        n_after_erase=await page.evaluate("()=>document.querySelector('.sk-b[aria-pressed]') ? 1:0")
        # hoàn tác (đường quay lại)
        await page.click('.sk-top button:has-text("Hoàn tác")')
        await page.click('[data-act=ok]'); await page.wait_for_timeout(600)
        d=await ld(); sk=d.get('sk'); print('sk ops',len(sk['ops']),[o['t'] for o in sk['ops']],sk['o'],sk['w'],sk['h'],'len json',len(json.dumps(sk)))
        print('numbers',[o['n'] for o in sk['ops'] if o['t']=='n'])
        print('preview canvas',await page.evaluate("()=>!!document.querySelector('canvas.sk-prev')"))
        await page.screenshot(path='/tmp/w/ui_cs1.png',full_page=True)
        # sửa lại rồi Hủy: không đổi
        await page.click('[data-act=sk-open]'); await page.wait_for_selector('.sk-ov')
        await tool('l'); await drag([(0.1,0.9),(0.9,0.9)]); await page.click('[data-act=cancel]'); await page.wait_for_timeout(300)
        print('sau hủy ops',len((await ld())['sk']['ops']))
        # xóa hết rồi đổi khổ đứng
        await page.click('[data-act=sk-open]'); await page.wait_for_selector('.sk-ov')
        await page.click('[data-act=ori]'); print('đổi khổ khi có nét:',await page.evaluate("()=>document.querySelector('.sk-msg').textContent"))
        await page.click('[data-act=clear]'); await page.click('[data-act=clear]'); await page.click('[data-act=ori]')
        box=await (await page.query_selector('.sk-cv')).bounding_box(); print('canvas đứng',box, await page.evaluate("()=>[document.querySelector('.sk-cv').width,document.querySelector('.sk-cv').height]"))
        X=lambda fx:box['x']+box['width']*fx; Y=lambda fy:box['y']+box['height']*fy
        await tool('r'); await drag([(0.2,0.2),(0.8,0.7)]); await tool('n'); await page.mouse.click(X(0.2),Y(0.2)); await page.mouse.click(X(0.8),Y(0.7))
        await page.screenshot(path='/tmp/w/ui_sk2.png')
        await page.click('[data-act=ok]'); await page.wait_for_timeout(500)
        d=await ld(); print('khổ',d['sk']['o'],d['sk']['w'],d['sk']['h'],len(d['sk']['ops']))
        # điền ngày, tạo hồ sơ
        await page.fill('label:has-text("Nhiệt độ phòng") input','27'); await page.fill('label:has-text("Độ ẩm phòng") input','60')
        await page.wait_for_timeout(2200)
        remote=await page.evaluate("(id)=>{const s=window.__ptn.S.samples.find(x=>x.id===id);return s&&s.ban_nhap?{sk:!!s.ban_nhap.sk,n:s.ban_nhap.sk&&s.ban_nhap.sk.ops.length}:null}",sid); print('ban_nhap remote',remote)
        await page.click('button:has-text("Kiểm tra, tạo hồ sơ")'); await page.wait_for_timeout(1500)
        r=await page.evaluate("()=>{const u=window.__ptn.UP;const k=Object.keys(u)[0];return k?{ok:u[k].res.ok,fails:u[k].res.checks.filter(c=>c.state!=='ok').map(c=>c.state+': '+c.label+' | '+c.note),n:u[k].res.checks.length,sk:u[k].res.sketch?{w:u[k].res.sketch.w,h:u[k].res.sketch.h,len:u[k].res.sketch.b64.length}:null,size:u[k].size}:null}")
        print('tạo hồ sơ',json.dumps(r,ensure_ascii=False)); print('hash',await page.evaluate("()=>location.hash"))
        await page.wait_for_timeout(500); await page.screenshot(path='/tmp/w/ui_cs2.png',full_page=True)
        print('nhiệm vụ rows',await page.evaluate("()=>[...document.querySelectorAll('.report .rep-t')].map(x=>x.textContent)"))
        # nộp
        await page.click('button:has-text("Nộp soát xét")'); await page.wait_for_timeout(2000)
        st=await page.evaluate("(id)=>{const s=window.__ptn.S.samples.find(x=>x.id===id);return {status:s.status,lightSk:!!(s.nop&&s.nop.sketch)}}",sid); print('sau nộp',st)
        det=await page.evaluate("async(id)=>{const d=await window.__ptn.Data.get(window.__ptn.dp(id));return {sk:d&&d.sketch?{w:d.sketch.w,h:d.sketch.h,len:d.sketch.b64.length}:null}}",sid); print('detail',det)
        # cổng khách hàng
        await page.goto('file://'+HTML+'#khach-hang'); await page.wait_for_timeout(800)
        lab=lambda:page.evaluate("()=>{const f=document.querySelector('[data-f=m_nguon]');return [f.querySelector('label').textContent,f.querySelector('input').placeholder,(f.querySelector('.hint')||{}).textContent]}")
        print('portal lbl mặc định',await lab())
        for v in ['XM_PCB30','DO_CS','CAT_XD']:
            await page.evaluate("(v)=>{const s=document.querySelector('[data-f=m_loai] select');s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}));}",v)
            print('portal',v,await lab())
        await page.evaluate("()=>{const s=document.querySelector('[data-f=m_loai] select');s.value='XM_PCB30';s.dispatchEvent(new Event('change',{bubbles:true}));}")
        await page.click('button:has-text("Điền ví dụ")'); await page.wait_for_timeout(300)
        print('opts',await page.evaluate("()=>[...document.querySelector('[data-f=m_loai] select').options].map(o=>o.value)"))
        # gửi yêu cầu cho XM_PCB30
        await page.evaluate("()=>{const s=document.querySelector('[data-f=m_loai] select');s.value='XM_PCB30';s.dispatchEvent(new Event('change',{bubbles:true}));const i=document.querySelector('[data-f=m_nguon] input');i.value='Sông Gianh, lô 3B-QB0124093';}")
        await page.click('button:has-text("Gửi yêu cầu")'); await page.wait_for_timeout(1800)
        q=await page.evaluate("()=>{const l=window.__ptn.S.samples.filter(x=>x.kenh==='khach');return l.map(x=>[x.mau.loai,x.mau.ten,x.mau.nguon_goc,x.chi_tieu.length,x.status])}"); print('yêu cầu khách',q)
        await page.screenshot(path='/tmp/w/ui_portal.png',full_page=True)
        print('ERRORS',errs or 'none'); await br.close()
asyncio.run(main())
