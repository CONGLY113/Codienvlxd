import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SETUP=r"""(async()=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const nhan=iso(new Date(Date.now()-864e5));
 P.setSession('NS009');await sleep(150);
 const base=(loai,ten,i)=>({kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-U'+i,ma_mau:'',khach:{ten:'K'},du_an:{cong_trinh:'Cầu Nhật Lệ 2',thi_cong:'TC'},mau:{loai,ten,nguon_goc:'Nguồn '+ten,ngay_nhan:nhan,ngay_lay:nhan},chi_tieu:P.defTests(loai),han_tra:nhan});
 const mk=async(loai,ten,results,i)=>{const id=P.newSid();const d=base(loai,ten,i);d.status='da_phat_hanh';d.ma_mau=await P.makeCode('mau',nhan,loai);d.so_bao_cao=await P.makeCode('bc',nhan);d.nop={results,at:new Date().toISOString()};await P.Data.set(P.sp(id),d);return d.ma_mau;};
 await mk('XM_PCB40','Xi măng Sông Gianh PCB40',{r28:44.83},1);await mk('CAT_XD','Cát Long Đại',{rx:1452.34,ra:2.6149,s5:0,mdl:2.6481},2);await mk('DA_5_20','Đá 5x20 Lèn Bạc',{rx:1455.4,nd:10.34},3);
 const id=P.newSid();const d=base('CP_BT','Cấp phối bê tông',9);d.status='da_giao';d.ma_mau=await P.makeCode('mau',nhan,'CP_BT');d.giao={ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()};await P.Data.set(P.sp(id),d);
 await sleep(400);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(700);return id;})()"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context(viewport={'width':420,'height':900},device_scale_factor=1)).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERROR '+str(e)))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' else None)
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate(SETUP)
        await page.wait_for_selector('.mf-sec',timeout=5000)
        info=lambda:page.evaluate("()=>({secs:document.querySelectorAll('.mf-sec').length,inputs:document.querySelectorAll('.mf-sec input').length,selects:[...document.querySelectorAll('.mf-sec select')].map(s=>s.options.length+':'+s.value),lives:[...document.querySelectorAll('.mf-live')].map(x=>x.textContent).filter(Boolean),cnt:[...document.querySelectorAll('.mf-top .small')].map(x=>x.textContent).join(' | ')})")
        print('lúc đầu',json.dumps(await info(),ensure_ascii=False))
        await page.screenshot(path='/tmp/w/ui_cp0.png',full_page=False)
        sels=await page.query_selector_all('.mf-sec select')
        # 3 ô chọn phiếu nguồn = các select có option 'Nhập tay, không liên kết'
        picks=await page.evaluate("()=>[...document.querySelectorAll('.mf-sec select')].map((s,i)=>[i,s.options[0].textContent]).filter(x=>/Nhập tay/.test(x[1])).map(x=>x[0])")
        print('picker idx',picks)
        for i in picks:
            await page.evaluate("(i)=>{const s=document.querySelectorAll('.mf-sec select')[i];s.selectedIndex=1;s.dispatchEvent(new Event('change',{bubbles:true}));}",i)
            await page.wait_for_timeout(400)
        print('sau chọn nguồn',json.dumps(await info(),ensure_ascii=False))
        vals=await page.evaluate("()=>JSON.parse(localStorage.getItem('ptn_mf_'+window.__ptn.S.samples.find(x=>x.mau.loai==='CP_BT').id))")
        print({k:v for k,v in vals.items() if k.startswith(('xm_','ct_','da_'))})
        # nhập các số còn lại bằng bàn phím
        async def fill(label,val):
            el=await page.query_selector('label:has-text("%s") input'%label)
            assert el,label
            await el.fill(val)
        await fill('Mác bê tông','300')
        await page.evaluate("()=>{const l=[...document.querySelectorAll('label')].find(x=>/Nhóm độ sụt yêu cầu/.test(x.textContent));const s=l.querySelector('select');s.value='4';s.dispatchEvent(new Event('change',{bubbles:true}));}")
        await fill('Khối lượng riêng (g/cm³)','3,1') if False else None
        # ρ đá, ρv đá
        for lab,v in [('Độ sụt đo được','7,4')]:
            await fill(lab,v)
        await page.evaluate("""()=>{const set=(txt,v,idx)=>{const ls=[...document.querySelectorAll('label')].filter(x=>x.textContent.startsWith(txt));const i=ls[idx||0].querySelector('input');i.value=v;i.dispatchEvent(new Event('input',{bubbles:true}));};
          set('Khối lượng riêng (g/cm³)','2,7',2);set('KL thể tích hạt (g/cm³)','2,68',0);
          ['Viên 1','Viên 2','Viên 3'].forEach((t,k)=>{[[0,[455,448,462]],[1,[590,582,598]],[2,[795,810,801]]].forEach(([g,a])=>set(t,String(a[k]),g));});}""")
        await page.wait_for_timeout(500)
        print('sau nhập',json.dumps(await info(),ensure_ascii=False))
        await page.screenshot(path='/tmp/w/ui_cp1.png',full_page=True)
        # nút tạo hồ sơ
        await page.fill('label:has-text("Nhiệt độ phòng") input','27'); await page.fill('label:has-text("Độ ẩm phòng") input','60')
        await page.click('text=Kiểm tra, tạo hồ sơ'); await page.wait_for_timeout(1500)
        r=await page.evaluate("()=>{const u=window.__ptn.UP;const k=Object.keys(u)[0];return k?{ok:u[k].res.ok,fails:u[k].res.checks.filter(c=>c.state!=='ok').map(c=>c.state+': '+c.label+' | '+c.note),n:u[k].res.checks.length}:null}")
        print('tạo hồ sơ',json.dumps(r,ensure_ascii=False)); print('hash',await page.evaluate("()=>location.hash"))
        print('ERRORS',errs or 'none'); await br.close()
asyncio.run(main())
