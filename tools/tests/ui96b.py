import asyncio, json, sys
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]
SETUP=r"""async(loai)=>{const P=window.__ptn,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');const nhan=iso(new Date(Date.now()-864e5));
 P.setSession('NS009');await sleep(150);
 const id=P.newSid();const d={kenh:'thu_cong',created_at:new Date().toISOString(),created_by:'t',so_yc:'YC-U1',ma_mau:'',khach:{ten:'K'},du_an:{cong_trinh:'CT',thi_cong:'TC'},mau:{loai,ten:loai,nguon_goc:'NG',quy_cach:'M75',ngay_nhan:nhan,ngay_lay:nhan},chi_tieu:P.defTests(loai),han_tra:nhan,status:'da_giao'};
 d.ma_mau=await P.makeCode('mau',nhan,loai);d.giao={ma_gv:'GV',ma_nv:'NS004',ten:'Trần Anh Dũng',han:nhan,by:'x',at:new Date().toISOString()};await P.Data.set(P.sp(id),d);
 await sleep(400);P.setSession('NS004');localStorage.setItem('ptn_mf_cur',id);location.hash='tong-quan';await sleep(400);location.hash='nhap-so-lieu';await sleep(700);return id;}"""
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
        for loai in ['CP_VUA']:
            sid=await page.evaluate(SETUP,loai)
            await page.wait_for_selector('.mf-sec',timeout=6000)
            info=await page.evaluate("""()=>[...document.querySelectorAll('.mf-sec')].map(s=>({h:s.querySelector('h3')&&s.querySelector('h3').textContent,f:[...s.querySelectorAll('label')].map(l=>(l.childNodes[0]&&l.childNodes[0].textContent||'').trim()+(l.querySelector('select')?'[sel:'+[...l.querySelectorAll('option')].map(o=>o.textContent).join('/')+']':'')),btn:[...s.querySelectorAll('[data-act]')].map(b=>b.dataset.act)}))""")
            print('=====',loai)
            for s in info: print(' ',s['h'],'|',s['f'],s['btn'])
            async def fillall(vals):
                inps=await page.query_selector_all('.mf-sec input:not([type=date])')
                return inps
            ld=lambda:page.evaluate("(id)=>JSON.parse(localStorage.getItem('ptn_mf_'+id)||'null')",sid)
            btns=await page.evaluate("()=>[...document.querySelectorAll('[data-act]')].map(b=>b.dataset.act)")
            print('  nút',btns)
            print('  mac init',await page.evaluate('()=>[...document.querySelectorAll("select")].map(x=>x.value)'))
            # điền: lần lượt các ô số trong từng khối theo bảng
            V={'CP_VUA':{'Mác xi măng thực tế':'311','Loại, nhãn hiệu':'COSEVCO 6- PCB30','Số lô':'016','R28':'32,4','Nguồn cát':'Nguồn Đồng Lào','Mô đun':'2,84','KL thể tích xốp (kg/m³)':'1485','Khối lượng riêng (g/cm³)':'2,65','Hạt >':'0'},'NEN_BT':{'Mác thiết kế':'200','Tuổi mẫu':'28','Viên 1':'500','Viên 2':'470','Viên 3':'495'},
               'NEN_VUA':{'Mác thiết kế':'7,5','Tuổi mẫu':'28','Viên 1':'14,3','Viên 2':'13','Viên 3':'13,6','Viên 4':'13,4','Viên 5':'13,1','Viên 6':'13,1'},
               'DO_K_DV':{'Độ ẩm tốt nhất':'9,1','Dung trọng khô lớn nhất':'1,637','Thể tích dao':'190,7','Khối lượng dao':'231','Yêu cầu K':'85'},
               'DO_K_PR':{'Độ ẩm tốt nhất':'13,6','Dung trọng khô lớn nhất':'2,375','Thể tích phễu':'1025','Dung trọng cát':'1,486','Yêu cầu K':'85'},
               'CP_TN':{'Thể tích cối':'2132','Khối lượng cối':'7000'}}[loai]
            secs=await page.query_selector_all('.mf-sec')
            for sec in secs:
                for lab in await sec.query_selector_all('label'):
                    t=(await lab.inner_text()).strip()
                    inp=await lab.query_selector('input:not([type=date])')
                    if not inp: continue
                    for k,v in V.items():
                        if t.startswith(k): await inp.fill(v)
            # điểm đo / đầm nén
            if loai.startswith('DO_K') or loai=='CP_TN':
                pts={'DO_K_DV':[('Km0+36','Trái','0,7','8,5','540'),('Km0+125.8','Phải','0,8','8,2','534'),('Km0+352.3','Tim','','6,7','525')],
                     'DO_K_PR':[('Km0+53.6','Trái','0,7','3','3128','6493','2762'),('Km0+138.3','Phải','0,8','3','3738','6311','2477'),('Km0+205','Trái','0,8','11','4125','8302','3470')],
                     'CP_TN':[('10995','518,81','485,36','67,29'),('11228','547,17','504,25','66,24'),('11403','570,25','517,36','63,17')]}[loai]
                secs=await page.query_selector_all('.mf-sec')
                pi=0
                for sec in secs:
                    h=await sec.query_selector('h3'); ht=(await h.inner_text()) if h else ''
                    if not (ht.startswith('Điểm')): continue
                    if pi>=len(pts): break
                    ins=await sec.query_selector_all('input:not([type=date])'); sels=await sec.query_selector_all('select')
                    vals=list(pts[pi]); 
                    if loai.startswith('DO_K'):
                        await ins[0].fill(vals[0]); await sels[0].select_option(label=vals[1])
                        for ii,v in enumerate(vals[2:],start=1):
                            if v!='': await ins[ii].fill(v)
                    else:
                        for ii,v in enumerate(vals): await ins[ii].fill(v)
                    pi+=1
            if loai=='NEN_BT':
                sel=await page.query_selector('.mf-sec select'); await sel.select_option(label='150 mm')
            await page.wait_for_timeout(400)
            print('  live',await page.evaluate("()=>[...document.querySelectorAll('.mf-live')].map(x=>x.textContent)"))
            d=await ld(); print('  draft keys',sorted([k for k in d.keys()])[:40] if d else None)
            await page.screenshot(path=f'/tmp/w/ui95_{loai}.png',full_page=True)
        print('ERRORS',errs)
        await br.close()
asyncio.run(main())
