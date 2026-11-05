import asyncio, json, sys, base64, io, time
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1]; BIG=len(sys.argv)>2 and sys.argv[2]=='big'
ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)

def seed_docs(nbig=0):
    d=[]
    emo='😀'
    note=('x'*29998)+emo+'tail &<>"\x01\x0b end'   # biên cắt rơi vào giữa cặp thay thế
    def smp(i,per,st='da_phat_hanh',loai='CAT_XD'):
        sid='s%s_%s'%(per,'t%d'%i)
        return sid,{'status':st,'ma_mau':'M26.11.%02d.%d'%(i%28+1,i),'so_yc':'YC26.11.01.%d'%i,'so_bao_cao':'BC26.11.%02d.%d'%(i%28+1,i) if st=='da_phat_hanh' else '',
          'khach':{'ten':'Cty CP Cầu 12','lien_he':'Anh A','dien_thoai':'0905','mst':'3100'},'du_an':{'cong_trinh':'Trường THPT Đồng Hới','hang_muc':'Cầu chính','thi_cong':'Cty X','giam_sat':'TVGS'},
          'mau':{'loai':loai,'ten':'Cát xây dựng','ngay_nhan':'2026-11-0%d'%(i%9+1),'nguon_goc':'Mỏ ABC','quy_cach':'Hạt mịn'},'chi_tieu':['CAT_01','CAT_02'],
          'giao':{'ma_nv':'NS002','ten':'Trần Đăng Hùng','ma_gv':'GV26.11.01.%d'%i,'at':'2026-11-02T03:00:00.000Z'},'han_tra':'2026-11-12','soat_xet':{'by':'Lưu Minh Tuấn'},
          'phat_hanh_at':'2026-11-04T05:00:00.000Z','phieu':{'hash':'abc123','at':'2026-11-04T05:00:00.000Z'},'tt':{'don_gia':150000+i,'thanh_toan':False},'nop':{'results':{'mdl':2.65,'rx':1450.5,'txt':'đạt'}},'kenh':'noi_bo','created_at':'2026-11-01T01:00:00.000Z'}
    for i in range(3):
        sid,s=smp(i,'2611a');d.append(('samples_2611a/'+sid,s))
        d.append(('detail_2611a/'+sid,{'sample':sid,'raw':{'m1':[10.1,10.2],'sieve':{'5':1.2}},'checks':[{'k':'a','ok':True}],'devs':['TB001'],'sketch':'data:image/png;base64,'+'A'*25000,'log':[{'at':'2026-11-01T02:00:00.000Z','by':'A','by_id':'NS002','action':'Nộp kết quả','note':'ghi chú '+emo}]}))
        d.append(('blob_2611a/'+sid,{'sample':sid,'b64':'UEsDB'+'B'*60000,'name':'f.xlsx'}))
    sid,s=smp(3,'2611a');s['khach']['ten']=note;d.append(('samples_2611a/'+sid,s))
    sid,s=smp(4,'2611b','cho_tiep_nhan');d.append(('samples_2611b/'+sid,s))
    d.append(('samples/s_old1',{'status':'da_phat_hanh','ma_mau':'M26.10.01.1','so_bao_cao':'BC26.10.01.1','khach':{'ten':'Khách cũ'},'du_an':{'cong_trinh':'CT cũ'},'mau':{'loai':'CAT_XD','ngay_nhan':'2026-10-01'},'nop':{'raw':{'a':1},'results':{'mdl':2.5}}}))
    d.append(('files/f_s_old1_bc',{'sample':'s_old1','b64':'UEsD'+'C'*50000,'name':'x.xlsx'}))
    for i in range(5):
        d.append(('audit/a_%d'%i,{'at':'2026-11-0%dT0%d:00:00.000Z'%(i%4+1,i),'by':'Hoàng Công Lý','by_id':'NS009','action':'Thao tác %d'%i,'note':'n','ma_mau':'M26.11.01.1','sample':''}))
    d.append(('errors/e1',{'at':'2026-11-03T01:00:00.000Z','by':'A','screen':'tong-quan','where':'window','msg':'lỗi thử','build':'0.23.0'}))
    d.append(('config/main',{'policy':'canh_bao','han_tra_ngay':5,'url_app':'https://x.web.app'}))
    d.append(('config/bang_gia',{'gia':{'CAT_XD':200000},'ct':{'CAT_01':50000}}))
    d.append(('config/bank',{'stk':'1','bin':'970','bank':'VCB','ten':'TT'}))
    d.append(('config/mauf_CAT_XD',{'hid':'h1','b64':'UEsD'+'D'*40000,'name':'m.xlsx'}))
    d.append(('counters/mau_261101',{'n':3}))
    d.append(('devcal/TB001',{'last':'2026-03'}))
    d.append(('bangke_26/bk_1',{'so':'BK26/001','ngay':'2026-11-03','khach':{'ten':'Cty CP Cầu 12'},'trang_thai':'da_duyet','dong':[{'k':'a','ten':'Cát xây dựng','loai':'CAT_XD','sl':3,'n':3,'don_gia':200000,'ma':['M1','M2']}],'giam':{},'pay':[{'id':'p1','so_tien':300000,'tt':'da_xn'}],'tao':{'at':'2026-11-03T01:00:00.000Z','by':'Thủ quỹ'},'ls':[]}))
    d.append(('archive/ix_2610_2610b_r1_0',{'ym':'2610','per':'2610b','zip':'LUU_2610b.zip','at':'2026-11-01T00:00:00.000Z','e':[{'i':'s2610b_x','b':'BC26.10.20.1','m':'M26.10.20.1','l':'CAT_XD','k':'KH','c':'CT','d':'2026-10-21','h':'hh','n':2,'t':'ph'}]}))
    d.append(('archive/run_2610b_r1',{'per':'2610b','zip':'LUU_2610b.zip','so_mau':1,'at':'2026-11-01T00:00:00.000Z','by':'A','sha_zip':'zz','bytes':1000}))
    d.append(('mauh/h1',{'code':'CAT_XD','rev':1,'action':'nap','by':'A','at':'2026-11-02T00:00:00.000Z','chg':['x','y']}))
    d.append(('mauv/h1',{'code':'CAT_XD','b64':'UEsD'+'E'*70000}))
    d.append(('config/periods',{'open':['2611a','2611b']}))
    for i in range(nbig):
        per='2611a' if i%2==0 else '2611b'
        sid,s=smp(1000+i,per);d.append(('samples_'+per+'/'+sid,s))
        d.append(('detail_'+per+'/'+sid,{'sample':sid,'raw':{'v':[float(j)/7 for j in range(120)],'tab':{str(j):j*1.5 for j in range(80)}},'checks':[{'k':str(j),'ok':True} for j in range(20)],'log':[{'at':'2026-11-01T02:00:00.000Z','by':'A','by_id':'NS002','action':'a','note':'n'}]*6}))
    for i in range(nbig*2):
        d.append(('audit/ab_%d'%i,{'at':'2026-11-0%dT0%d:00:00.000Z'%(i%4+1,i%9),'by':'A','by_id':'NS002','action':'Thao tác','note':'n','ma_mau':'M%d'%i,'sample':''}))
    return d

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
        await page.add_init_script("""window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__lt.push(e.duration))).observe({entryTypes:['longtask']});}catch(e){}""")
        docs=seed_docs(1500 if BIG else 0)
        await page.add_init_script("window.__fake.seed("+json.dumps(docs)+")")
        await page.add_init_script("localStorage.setItem('ptn_session','NS009')")
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.wait_for_timeout(1500)
        await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(400)
        print('1. banner nhắc sao lưu hiện khi chưa sao lưu:',await page.evaluate("()=>document.body.innerText.includes('Chưa sao lưu dữ liệu ra Excel')"))
        await page.evaluate("()=>{location.hash='cai-dat'}");await page.wait_for_selector('text=Xuất toàn bộ dữ liệu ra Excel')
        await page.evaluate("()=>{window.__lt.length=0}")
        t0=time.time()
        await page.click('button:has-text("Xuất toàn bộ dữ liệu ra Excel")')
        await page.wait_for_function('window.__dl&&window.__dl.length>=1',timeout=240000)
        dt=time.time()-t0
        lt=await page.evaluate("()=>({max:Math.max(0,...window.__lt),n:window.__lt.length})")
        info=await page.evaluate("()=>{const d=window.__dl[0];let s='';for(let i=0;i<d.data.length;i+=0x8000)s+=String.fromCharCode.apply(null,d.data.subarray(i,i+0x8000));return {name:d.filename,len:d.data.length,b64:btoa(s)}}")
        open('/tmp/w/bk_out.xlsx','wb').write(base64.b64decode(info['b64']))
        print('2. xuất xong %.1fs, %s, %.0f KB, longtask max %.0f ms (%d lần)'%(dt,info['name'],info['len']/1024,lt['max'],lt['n']))
        await page.wait_for_timeout(600)
        st=await page.inner_text('[role=status]');print('   trạng thái:',st)
        print('3. ghi nhận lần sao lưu:',await page.evaluate("()=>JSON.stringify(window.__ptn.S.saoLuu&&{by:window.__ptn.S.saoLuu.by,n:window.__ptn.S.saoLuu.n})"))
        await page.evaluate("()=>{location.hash='tong-quan'}");await page.wait_for_timeout(400)
        print('   banner sau sao lưu ẩn:',await page.evaluate("()=>!document.body.innerText.includes('chưa sao lưu dữ liệu ra Excel')&&!document.body.innerText.includes('Chưa sao lưu dữ liệu ra Excel')"))
        # chế độ kèm file
        if not BIG:
            await page.evaluate("()=>{location.hash='cai-dat'}");await page.wait_for_selector('#bk-full')
            await page.check('#bk-full');await page.click('button:has-text("Xuất toàn bộ dữ liệu ra Excel")')
            await page.wait_for_function('window.__dl.length>=2',timeout=60000)
            info2=await page.evaluate("()=>{const d=window.__dl[1];let s='';for(let i=0;i<d.data.length;i+=0x8000)s+=String.fromCharCode.apply(null,d.data.subarray(i,i+0x8000));return {len:d.data.length,b64:btoa(s)}}")
            open('/tmp/w/bk_full.xlsx','wb').write(base64.b64decode(info2['b64']))
            print('4. bản kèm file: %.0f KB'%(info2['len']/1024))
        print('lỗi console:',errs[:4])
        await br.close()
    json.dump([[p,v] for p,v in docs],open('/tmp/w/bk_seed.json','w'),ensure_ascii=False)
asyncio.run(main())
