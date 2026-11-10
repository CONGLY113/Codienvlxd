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
# ---- tạo file chỉnh sửa bằng python từ bytes gốc
def edit_xlsx(b, fn):
    zin=zipfile.ZipFile(io.BytesIO(b));out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as zo:
        for n in zin.namelist():
            d=zin.read(n)
            d2=fn(n,d)
            zo.writestr(n,d if d2 is None else d2)
    return out.getvalue()
def widen(n,d):
    if n=='xl/worksheets/sheet4.xml':
        x=d.decode('utf8')
        m=re.search(r'<col\b[^>]*width="([\d.]+)"[^>]*/>',x)
        assert m, 'no col'
        old=m.group(0);new=re.sub(r'width="[\d.]+"','width="%.2f"'%(float(m.group(1))+1.5),old)
        return x.replace(old,new,1).encode('utf8')

def excelish(b):
    zin=zipfile.ZipFile(io.BytesIO(b));out=io.BytesIO()
    with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as zo:
        for n in zin.namelist():
            d=zin.read(n)
            if n.startswith('xl/worksheets/sheet'):
                x=d.decode('utf8')
                x=re.sub(r'(<f\b[^>]*>)([^<]*)(</f>)',lambda m:m.group(1)+m.group(2).replace('&quot;','"')+m.group(3),x)
                if n.endswith('sheet4.xml'):
                    x=re.sub(r'<row r="(\d+)"([^>]*?)>',lambda m:'<row r="%s"%s ht="31.5" customHeight="1">'%(m.group(1),re.sub(r'\s(ht|customHeight)="[^"]*"','',m.group(2))) if m.group(1)=='6' else m.group(0),x)
                d=x.encode('utf8')
            if re.match(r'xl/charts/chart\d+\.xml',n):
                d=re.sub(rb'<a:ln w="\d+"',b'<a:ln w="38100"',d)
            zo.writestr(n,d)
    return out.getvalue()
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
        await page.route('**/*',route);await page.add_init_script(FAKE);await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("()=>window.__ptn.setSession('NS009')");await page.wait_for_timeout(300)
        print('== 1. mọi biểu mẫu gốc tự đạt bộ kiểm tra của chính nó')
        r=await page.evaluate("""async()=>{const P=window.__ptn,out=[];for(const c of P.mauCodes()){const u=Uint8Array.from(atob(P.origB64(c)),x=>x.charCodeAt(0));const v=await P.validateTemplate(u,c);out.push([c,v.E,v.W]);}return out;}""")
        chk(len(r)==31,'31 loại, có %d'%len(r))
        for c,E,W in r:
            chk(not E,c+' '+str(E))
        print('  cảnh báo:',[(c,W) for c,E,W in r if W][:5])
        print('== 2. mỗi loại: sửa độ rộng cột Phieu_KQ -> đạt; áp dụng -> buildTemplate dùng bản sửa')
        b64s=await page.evaluate("()=>window.__ptn.mauCodes().map(c=>[c,window.__ptn.origB64(c)])")
        fails=0
        for c,b in b64s:
            raw=base64.b64decode(b)
            try: ed=edit_xlsx(raw,widen)
            except AssertionError as e:
                print('  (không có <col> ở',c,')');continue
            v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));const v=await P.validateTemplate(u,a[0]);const d=await P.mauDiff(Uint8Array.from(atob(a[2]),x=>x.charCodeAt(0)),u,a[0]);return {E:v.E,W:v.W,d};}""",[c,base64.b64encode(ed).decode(),b])
            chk(not v['E'],c+' sửa cột bị chê: '+str(v['E']))
            chk(any('độ rộng cột' in x for x in v['d']),c+' diff: '+str(v['d']))
        print('== 2b. kiểu Excel lưu lại (dấu nháy, đổi chiều cao hàng, nét biểu đồ)')
        nb=0
        for c,b in b64s:
            ed=excelish(base64.b64decode(b))
            v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",[c,base64.b64encode(ed).decode()])
            if v['E']: nb+=1
            chk(not v['E'],c+' excelish: '+str(v['E'][:2]))
        print('  lỗi',nb)
        print('== 3. lỗi cố ý bị chặn')
        raw=base64.b64decode(b64s[0][1]) # CAT_XD
        def kill_names(n,d):
            if n=='xl/workbook.xml': return re.sub(rb'<definedName[^>]*name="out_sc"[^>]*>[^<]*</definedName>',b'',d)
        def no_a4(n,d):
            if n=='xl/worksheets/sheet4.xml': return d.replace(b'paperSize="9"',b'paperSize="8"')
        def chg_margin(n,d):
            if n=='xl/worksheets/sheet4.xml': return re.sub(rb'(<pageMargins[^>]*\bleft=")[\d.]+',rb'\g<1>0.9',d)
        def macro(n,d): return None
        def kill_f(n,d):
            if n=='xl/worksheets/sheet2.xml': return re.sub(rb'<f\b[^>]*>[^<]+</f>',b'',d,count=1)
        def nochart(n,d):
            if n=='xl/worksheets/sheet4.xml': return re.sub(rb'<drawing[^>]*/>',b'',d)
        for nm,fn,key in [('mất tên vùng',kill_names,'tên vùng'),('đổi khổ giấy',no_a4,'A4'),('đổi lề',chg_margin,'Lề'),('sửa công thức sheet2',kill_f,'bị sửa'),('bỏ biểu đồ',nochart,'biểu đồ')]:
            ed=edit_xlsx(raw,fn)
            v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",['CAT_XD',base64.b64encode(ed).decode()])
            chk(v['E'] and any(key in e for e in v['E']),nm+' không bị chặn đúng: '+str(v['E']))
        # macro
        ed=edit_xlsx(raw,lambda n,d:None)
        zin=zipfile.ZipFile(io.BytesIO(ed));out=io.BytesIO()
        with zipfile.ZipFile(out,'w') as zo:
            for n in zin.namelist(): zo.writestr(n,zin.read(n))
            zo.writestr('xl/vbaProject.bin',b'x')
        v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",['CAT_XD',base64.b64encode(out.getvalue()).decode()])
        chk(any('macro' in e for e in v['E']),'macro không bị chặn')
        # file của loại khác không đạt
        other=base64.b64decode(b64s[2][1])
        v=await page.evaluate("""async(a)=>{const P=window.__ptn;const u=Uint8Array.from(atob(a[1]),x=>x.charCodeAt(0));return await P.validateTemplate(u,a[0]);}""",['CAT_XD',base64.b64encode(other).decode()])
        chk(len(v['E'])>0,'file loại khác lọt qua')
        print('== 4. UI: cán bộ thử nghiệm (NS004)')
        await page.evaluate("()=>{window.__ptn.setSession('NS004');location.hash='tong-quan';}");await page.wait_for_timeout(500)
        vis=await page.evaluate("()=>!!document.querySelector('a[href=\"#mau-bieu\"]')")
        chk(vis,'cán bộ thử nghiệm không thấy tab Biểu mẫu báo cáo')
        await page.evaluate("()=>{location.hash='mau-bieu';}");await page.wait_for_timeout(700)
        n=await page.evaluate("()=>document.querySelectorAll('.tbl-wrap tbody tr').length")
        chk(n==31,'số dòng bảng %d'%n)
        dis=await page.evaluate("()=>[...document.querySelectorAll('.tbl-wrap button.primary')].filter(b=>b.disabled).length")
        chk(dis==0,'nút nạp bị khóa với tn')
        # tìm kiếm
        await page.fill('#mau-q','xi mang');await page.wait_for_timeout(200)
        n2=await page.evaluate("()=>document.querySelectorAll('.tbl-wrap tbody tr').length")
        chk(n2==2,'tìm xi mang ra %d'%n2)
        await page.screenshot(path='/tmp/w/mb1.png')
        # nạp bản chỉnh cho XM_PCB40
        raw=base64.b64decode([b for c,b in b64s if c=='XM_PCB40'][0]);ed=edit_xlsx(raw,widen)
        open('/tmp/w/xm_edit.xlsx','wb').write(ed)
        row=page.locator('.tbl-wrap tbody tr',has_text='Xi măng PCB40')
        async with page.expect_file_chooser() as fc:
            await row.locator('button',has_text='Nạp bản đầy đủ').click()
        await (await fc.value).set_files('/tmp/w/xm_edit.xlsx')
        await page.wait_for_selector('.modal h3',timeout=8000)
        t=await page.inner_text('.modal')
        chk('Đạt, có thể áp dụng' in t,'hộp kiểm tra: '+t[:200])
        chk('độ rộng cột' in t,'thiếu tóm tắt khác biệt')
        await page.screenshot(path='/tmp/w/mb2.png')
        # ghi chú bắt buộc
        await page.click('.modal button.primary');await page.wait_for_timeout(300)
        chk(await page.locator('.modal').count()==1,'đóng khi chưa có ghi chú')
        await page.fill('#mau-note','Mở rộng cột đầu của phiếu xi măng');await page.click('.modal button.primary');await page.wait_for_timeout(900)
        chk(await page.locator('.modal').count()==0,'không đóng sau khi áp dụng')
        st=await page.evaluate("()=>{const P=window.__ptn;const o=P.mauOv('XM_PCB40');return {has:!!o,rev:o&&o.rev,by:o&&o.by,h:(P.S.mauh||[]).length}}")
        chk(st['has'] and st['rev']==1 and st['by']=='Trần Anh Dũng' and st['h']==1,'trạng thái sau áp dụng '+str(st))
        # buildTemplate dùng bản sửa
        bt=await page.evaluate("""async()=>{const P=window.__ptn;const s={ma_mau:'X1',so_yc:'Y',mau:{loai:'XM_PCB40',ten:'Xi măng'},du_an:{}};const u=await P.buildTemplate(s,{id:'NS004',name:'Trần Anh Dũng'},null,null);return btoa(String.fromCharCode.apply(null,new Uint8Array(u)));}""")
        z=zipfile.ZipFile(io.BytesIO(base64.b64decode(bt)));x=z.read('xl/worksheets/sheet4.xml').decode()
        zo=zipfile.ZipFile(io.BytesIO(raw)).read('xl/worksheets/sheet4.xml').decode()
        w=lambda x:re.search(r'<col\b[^>]*width="([\d.]+)"',x).group(1)
        def tot(x):return sum(float(m) for m in re.findall(r'<col\b[^>]*width="([\d.]+)"[^>]*min="[1-8]" max="[1-8]"',x))
        # 0.27.6: cột phiếu được co về tổng 90 ký tự để vừa A4 ở 100 %
        ex=(float(w(zo))+1.5)*90/(tot(zo)+1.5)
        chk(abs(float(w(x))-1.12)<0.05,'phiếu xi măng dùng bố cục mới (cột A 1,12): %s'%w(x))
        # loại khác không bị ảnh hưởng
        bt2=await page.evaluate("""async()=>{const P=window.__ptn;const s={ma_mau:'X2',so_yc:'Y',mau:{loai:'XM_PCB30',ten:'Xi măng'},du_an:{}};const u=await P.buildTemplate(s,{id:'NS004',name:'T'},null,null);return btoa(String.fromCharCode.apply(null,new Uint8Array(u)));}""")
        z2=zipfile.ZipFile(io.BytesIO(base64.b64decode(bt2))).read('xl/worksheets/sheet4.xml').decode()
        raw30=base64.b64decode([b for c,b in b64s if c=='XM_PCB30'][0]);z3=zipfile.ZipFile(io.BytesIO(raw30)).read('xl/worksheets/sheet4.xml').decode()
        chk(abs(float(w(z2))-1.12)<0.05,'XM_PCB30 dùng bố cục mới')
        # lịch sử
        await page.locator('.tbl-wrap tbody tr',has_text='Xi măng PCB40').locator('button',has_text='Lịch sử').click();await page.wait_for_timeout(400)
        t=await page.inner_text('.modal')
        chk('Mở rộng cột đầu' in t and 'Trần Anh Dũng' in t and 'Đang dùng' in t,'lịch sử thiếu nội dung: '+t[:300])
        await page.screenshot(path='/tmp/w/mb3.png')
        await page.click('.modal-h button');await page.wait_for_timeout(200)
        # bản 2 rồi khôi phục bản 1
        ed2=edit_xlsx(ed,widen);open('/tmp/w/xm_edit2.xlsx','wb').write(ed2)
        async with page.expect_file_chooser() as fc:
            await page.locator('.tbl-wrap tbody tr',has_text='Xi măng PCB40').locator('button',has_text='Nạp bản đầy đủ').click()
        await (await fc.value).set_files('/tmp/w/xm_edit2.xlsx')
        await page.wait_for_selector('#mau-note',timeout=8000);await page.fill('#mau-note','Mở rộng thêm lần hai');await page.click('.modal button.primary');await page.wait_for_timeout(900)
        r2=await page.evaluate("()=>window.__ptn.mauOv('XM_PCB40').rev")
        chk(r2==2,'rev sau lần 2 = %s'%r2)
        await page.locator('.tbl-wrap tbody tr',has_text='Xi măng PCB40').locator('button',has_text='Lịch sử').click();await page.wait_for_timeout(400)
        await page.locator('.modal tbody tr',has_text='#1').locator('button',has_text='Khôi phục').click();await page.wait_for_timeout(900)
        st=await page.evaluate("()=>{const P=window.__ptn;const o=P.mauOv('XM_PCB40');return {rev:o.rev,from:o.from_rev,act:o.action,n:(P.S.mauh||[]).length,same:o.b64==="+json.dumps(base64.b64encode(ed).decode())+"}}")
        chk(st['rev']==3 and st['from']==1 and st['act']=='khoi_phuc' and st['n']==3 and st['same'],'khôi phục: '+str(st))
        # về bản gốc
        await page.locator('.tbl-wrap tbody tr',has_text='Xi măng PCB40').locator('button',has_text='Dùng lại bản gốc').click();await page.wait_for_timeout(300)
        await page.fill('.modal input[type=text]','Thử về gốc');await page.click('.modal button.primary');await page.wait_for_timeout(900)
        st=await page.evaluate("()=>{const P=window.__ptn;return {ov:!!P.mauOv('XM_PCB40'),n:(P.S.mauh||[]).length}}")
        chk(not st['ov'] and st['n']==4,'về gốc: '+str(st))
        # audit
        au=await page.evaluate("()=>(window.__ptn.S.audit||[]).filter(a=>/biểu mẫu/i.test(a.action)).map(a=>a.action)")
        chk(len(au)>=4,'audit %s'%au)
        print('  audit:',au[:4])
        # nhật ký chung
        await page.click('text=Nhật ký chỉnh sửa chung');await page.wait_for_timeout(300)
        chk('Khôi phục' in await page.inner_text('.modal'),'nhật ký chung thiếu')
        await page.click('.modal-h button')
        print('== 5. phân quyền: Giám đốc / thủ quỹ không thấy tab')
        for id_ in ['NS010','NS012','NS011']:
            await page.evaluate("(a)=>{window.__ptn.setSession(a);location.hash='tong-quan';}",id_);await page.wait_for_timeout(400)
            v=await page.evaluate("()=>!!document.querySelector('a[href=\"#mau-bieu\"]')")
            chk(not v,id_+' thấy tab')
        print('== 6. tương thích cũ: bản cát đã nạp bằng cách cũ vẫn dùng')
        await page.evaluate("()=>window.__ptn.setSession('NS009')")
        legacy=base64.b64encode(edit_xlsx(base64.b64decode(b64s[0][1]),widen)).decode()
        await page.evaluate("async(b)=>{const P=window.__ptn;await P.Data.set('config/mau_kq',{b64:b,name:'cu.xlsx',at:new Date().toISOString(),by:'Hoàng Công Lý',hash:'x',opts:{}});}",legacy)
        await page.wait_for_timeout(500)
        v=await page.evaluate("()=>{const o=window.__ptn.mauOv('CAT_XD');return o&&o.legacy}")
        chk(v,'legacy không nhận')
        await page.evaluate("()=>{location.hash='mau-bieu';}");await page.wait_for_timeout(600)
        await page.fill('#mau-q','');await page.wait_for_timeout(200)
        t=await page.inner_text('.tbl-wrap')
        chk('nạp trước 0.21.0' in t,'nhãn legacy')
        print('== 7. ảnh chụp di động')
        await page.set_viewport_size({'width':390,'height':800});await page.wait_for_timeout(400);await page.screenshot(path='/tmp/w/mb4.png')
        print('LỖI trình duyệt:',errs[:5])
        chk(not errs,'có lỗi console')
        await br.close()
    print('KẾT QUẢ ok=%d bad=%d'%(ok,bad))
asyncio.run(main())
