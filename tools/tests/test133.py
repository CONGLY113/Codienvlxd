# E3-E5: cổng khách dạng bảng; nhận mẫu thủ công có công trình mới; xem xét yêu cầu tích sẵn đạt, bố cục gọn
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
async def newpage(br,w=1300,h=1000):
    page=await (await br.new_context(viewport={'width':w,'height':h})).new_page();errs=[]
    page.on('pageerror',lambda e:errs.append(str(e)))
    async def route(r):
        u=r.request.url
        if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
        elif u.startswith('file://'): await r.continue_()
        else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
    await page.route('**/*',route);await page.add_init_script(FAKE)
    return page,errs
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        # ---- E3 cổng khách
        page,errs=await newpage(br)
        await page.goto('file://'+HTML+'#khach-hang');await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000);await page.wait_for_timeout(500)
        r=await page.evaluate("""()=>{const vis=e=>e&&e.offsetParent!==null;const th=[...document.querySelectorAll('table th')].map(x=>x.textContent);
          return {th,tests:[...document.querySelectorAll('.chk input[type=checkbox]')].filter(vis).length,
           lbl:document.body.innerText.includes('Chỉ tiêu yêu cầu: mặc định tất cả chỉ tiêu của loại mẫu'),bam:document.body.innerText.includes('bấm để thay đổi'),
           tt:vis(document.querySelector('[data-f=m_tinhtrang]')),nl:vis(document.querySelector('[data-f=m_nguoilay]')),
           sl:vis(document.querySelector('[data-f=m_sl]')),nguon:vis(document.querySelector('[data-f=m_nguon]')),
           tinhtrang:document.querySelector('[data-f=m_tinhtrang] select').value}}""")
        print('portal',r)
        chk(r['th']==['TT','Tên mẫu','Nguồn gốc mẫu / số lô','Ngày lấy mẫu','Số lượng',''],'cột bảng mẫu thử: %s'%r['th'])
        chk(r['tests']==0 and r['lbl'] and not r['bam'],'chỉ tiêu chỉ còn dòng tiêu đề')
        chk(r['tt'] and r['nl'] and not r['sl'] and not r['nguon'] and r['tinhtrang']=='Nguyên vẹn, đủ khối lượng','tình trạng và người lấy chung, mặc định nguyên vẹn')
        await page.click('button:has-text("Điền ví dụ")');await page.wait_for_timeout(300)
        await page.click('button:has-text("+ Thêm mẫu")');await page.wait_for_timeout(200)
        await page.evaluate("""()=>{const t=[...document.querySelectorAll('table tbody tr')];const set=(el,v)=>{el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));};
          set(t[0].querySelector('input[type=number]'),'3');
          const s2=t[1].querySelector('select');set(s2,'DA_5_20');
          const tt=[...document.querySelectorAll('table tbody tr')][1];set(tt.querySelector('input[type=text]'),'Mỏ đá B');set(tt.querySelector('input[type=number]'),'2');set(tt.querySelector('input[type=date]'),'2026-11-05');}""")
        await page.wait_for_timeout(300)
        await page.click('button:has-text("Gửi yêu cầu")');await page.wait_for_timeout(1500)
        d=await page.evaluate("()=>window.__ptn.S.samples.filter(x=>x.kenh==='khach').map(x=>({sl:x.mau.so_luong,nguon:x.mau.nguon_goc,tt:x.mau.tinh_trang,ex:x.extra,ct:x.chi_tieu.length,st:x.status}))")
        print('doc',d)
        chk(len(d)==1 and d[0]['sl']==3 and d[0]['st']=='cho_tiep_nhan' and d[0]['tt']=='Nguyên vẹn, đủ khối lượng','yêu cầu khách lưu đúng: %s'%d)
        chk(d and d[0]['ex'] and len(d[0]['ex'])==1 and d[0]['ex'][0]['sl']==2 and d[0]['ex'][0]['nguon']=='Mỏ đá B' and d[0]['ex'][0]['loai']=='DA_5_20','mẫu thứ 2 lưu trong extra: %s'%(d and d[0]['ex']))
        chk(not errs,'lỗi trang cổng: %s'%errs[:2]);await page.context.close()
        # ---- E4/E5 cán bộ: lấy lại yêu cầu từ hàng đợi
        page,errs=await newpage(br)
        await page.goto('file://'+HTML);await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("""()=>{window.__ptn.setSession('NS009');location.hash='nhan-mau';}""");await page.wait_for_timeout(900)
        tabs=await page.evaluate("()=>[...document.querySelectorAll('[role=tab]')].map(b=>[b.textContent,getComputedStyle(b).display!=='none'])")
        print('tabs (hàng đợi trống)',tabs)
        chk(tabs[0][0].startswith('Hàng đợi') and not tabs[0][1],'tab Hàng đợi ẩn khi trống')
        chk(await page.evaluate("()=>document.querySelector('[role=tab][aria-selected=true]').textContent")=='Nhập thủ công','mặc định vào Nhập thủ công')
        opts=await page.evaluate("()=>[...document.querySelectorAll('#nm-pick-da option')].map(o=>o.textContent)")
        dis=await page.evaluate("()=>document.querySelector('#nm-pick-da').disabled")
        print('công trình',opts,dis)
        chk(not dis and any('Công trình mới' in o for o in opts),'chọn được «Công trình mới» ngay cả khi nhập khách mới')
        await page.click('button:has-text("Điền ví dụ")');await page.wait_for_timeout(200)
        await page.select_option('#nm-pick-da','new');await page.wait_for_timeout(300)
        v=await page.evaluate("()=>({ct:document.querySelector('#nm-d_ct').value,kh:document.querySelector('#nm-k_ten').value,foc:document.activeElement&&document.activeElement.id})")
        print('sau chọn công trình mới',v)
        chk(v['ct']=='' and v['kh']!='' and v['foc']=='nm-d_ct','công trình mới: xóa ô công trình, giữ khách, đưa con trỏ vào ô công trình')
        chk(not errs,'lỗi trang nhận mẫu: %s'%errs[:2]);await page.context.close()
        # ---- review từ hàng đợi (có yêu cầu từ khách do bước E3)
        page,errs=await newpage(br)
        await page.goto('file://'+HTML+'#khach-hang');await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000);await page.wait_for_timeout(400)
        await page.click('button:has-text("Điền ví dụ")');await page.click('button:has-text("+ Thêm mẫu")');await page.wait_for_timeout(200)
        await page.click('button:has-text("Gửi yêu cầu")');await page.wait_for_timeout(1200)
        await page.evaluate("()=>{window.__ptn.setSession('NS009');location.hash='nhan-mau';}");await page.wait_for_timeout(900)
        tabs=await page.evaluate("()=>[...document.querySelectorAll('[role=tab]')].map(b=>[b.textContent,getComputedStyle(b).display!=='none',b.getAttribute('aria-selected')])")
        print('tabs (có yêu cầu)',tabs)
        chk(tabs[0][1] and tabs[0][2]=='true' and '(1)' in tabs[0][0],'có yêu cầu chờ thì tab Hàng đợi hiện và được chọn')
        await page.click('button:has-text("Xem xét")');await page.wait_for_timeout(600)
        rv=await page.evaluate("""()=>({a:document.querySelector('#rv-a').checked,b:document.querySelector('#rv-b').checked,c:document.querySelector('#rv-c').checked,
          rows:document.querySelectorAll('.rv-mau tbody tr').length,ul:document.querySelectorAll('.rv-mau ul').length,
          h:[...document.querySelectorAll('.rv-mau th')].map(x=>x.textContent),
          go:[...document.querySelectorAll('button')].find(b=>b.textContent==='Tiếp nhận và cấp mã mẫu').disabled,
          nhan:document.querySelector('#rv-nhan').value})""")
        print('review',rv)
        chk(rv['a'] and rv['b'] and rv['c'],'ô xác nhận tích sẵn đạt')
        chk(rv['rows']==2 and rv['ul']==0,'bảng Mẫu và chỉ tiêu gọn, 2 dòng mẫu')
        # chưa có ngày nhận -> nút bị khóa; điền ngày thì mở
        mn=await page.evaluate("()=>document.querySelector('#rv-nhan').min");await page.fill('#rv-nhan',mn);await page.dispatch_event('#rv-nhan','change');await page.wait_for_timeout(300)
        go=await page.evaluate("()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Tiếp nhận và cấp mã mẫu').disabled")
        chk(rv['go'] is True and go is False,'nút tiếp nhận mở khi có ngày nhận, hạn trả (khóa trước đó: %s, sau: %s)'%(rv['go'],go))
        await page.click('button:has-text("Tiếp nhận và cấp mã mẫu")');await page.wait_for_timeout(1500)
        res=await page.evaluate("()=>window.__ptn.S.samples.filter(x=>x.status==='da_tiep_nhan').map(x=>({m:x.ma_mau,yc:x.so_yc,nhan:x.mau.ngay_nhan,sl:x.mau.so_luong,lay:x.mau.ngay_lay}))")
        print('đã tiếp nhận',res)
        chk(len(res)==2 and all(x['nhan']==mn for x in res) and res[0]['yc']==res[1]['yc'],'tiếp nhận 2 mẫu cùng phiếu, ngày nhận áp cho mẫu thêm')
        chk(not errs,'lỗi trang review: %s'%errs[:2])
        print('ok',ok,'bad',bad);await br.close()
asyncio.run(main())
