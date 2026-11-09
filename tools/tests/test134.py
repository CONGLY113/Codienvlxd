# F1 tìm khách/công trình; F2 nút Tải phiếu A4 excel ở Nhiệm vụ của tôi
import asyncio,sys
exec(open('/tmp/w/test133.py',encoding='utf8').read().split('async def main():')[0])
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page,errs=await newpage(br)
        await page.goto('file://'+HTML);await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("""()=>{const S=window.__ptn.S;const mk=(i,kh,ct,hm,st)=>({id:'zz'+i,ma_mau:'M26.11.0'+i+'.1',status:st||'da_tiep_nhan',created_at:'2026-11-0'+i+'T01:00:00Z',kenh:'tn',
          khach:{ten:kh,lien_he:'Ông '+i,dien_thoai:'09000000'+i,mst:i==2?'01':'0'+i},du_an:{cong_trinh:ct,hang_muc:hm,chu_dau_tu:'CĐT '+i},mau:{ten:'Cát'},chi_tieu:[]});
          S.samples.push(mk(1,'Công ty TNHH Tiến Phong','Đường Phan Huy Ích','Nền đường'),mk(2,'Công ty TNHH Tiến Phong','Cầu Đường Sắt','Mố cầu'),mk(3,'Liên danh 568 - Bảo Thành','Đường GT Đồng Hới - Lệ Thủy','Mặt đường'));
          window.__ptn.setSession('NS009');location.hash='nhan-mau';}""");await page.wait_for_timeout(900)
        opts=lambda sel:page.evaluate("(s)=>[...document.querySelectorAll(s+' option')].map(o=>o.textContent)",sel)
        k0=await opts('#nm-pick-kh');print('kh',k0)
        chk(await page.locator('#nm-find-kh').count()==1 and await page.locator('#nm-find-da').count()==1,'có 2 ô tìm kiếm')
        await page.fill('#nm-find-kh','tien phong');await page.wait_for_timeout(500)
        k1=await opts('#nm-pick-kh');print('kh sau tìm',k1)
        chk(len(k1)==2 and 'Tiến Phong' in k1[1],'tìm không dấu ra đúng 1 khách')
        sel=await page.evaluate("()=>document.querySelector('#nm-pick-kh').value");chk(sel!='','1 kết quả thì tự chọn')
        v=await page.evaluate("()=>document.querySelector('#nm-k_ten').value");chk('Tiến Phong' in v,'tự điền khách: '+v)
        d1=await opts('#nm-pick-da');chk(len(d1)==4,'công trình của khách: %s'%d1)
        await page.fill('#nm-find-da','cau');await page.wait_for_timeout(500)
        d2=await opts('#nm-pick-da');print('da',d2);chk(len(d2)==3 and 'Cầu' in d2[1],'lọc công trình trong khách')
        await page.select_option('#nm-pick-da',index=1);await page.wait_for_timeout(300)
        chk('Cầu' in await page.evaluate("()=>document.querySelector('#nm-d_ct').value"),'chọn công trình đã lọc điền đúng')
        # tìm công trình khi chưa chọn khách
        await page.fill('#nm-find-kh','');await page.select_option('#nm-pick-kh',index=0); await page.wait_for_timeout(400)
        await page.fill('#nm-find-da','dong hoi');await page.wait_for_timeout(500)
        d3=await opts('#nm-pick-da');print('da toàn bộ',d3);chk(len(d3)==3 and 'Liên danh' in d3[1],'tìm công trình toàn bộ khách')
        await page.select_option('#nm-pick-da',index=1);await page.wait_for_timeout(400)
        r=await page.evaluate("()=>({kh:document.querySelector('#nm-k_ten').value,ct:document.querySelector('#nm-d_ct').value,sk:document.querySelector('#nm-pick-kh').selectedOptions[0].textContent})")
        print(r);chk('Liên danh' in r['kh'] and 'Đồng Hới' in r['ct'],'chọn công trình tự điền cả khách')
        await page.fill('#nm-find-kh','zzzz');await page.wait_for_timeout(400)
        chk('Không thấy' in await page.evaluate("()=>document.body.innerText"),'báo không thấy')
        chk(not errs,'lỗi: %s'%errs[:2]);await page.context.close()
        # ---- F2
        page,errs=await newpage(br)
        await page.goto('file://'+HTML);await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("""()=>{const S=window.__ptn.S;const mk=(i,st,ph)=>({id:'yy'+i,ma_mau:'M26.11.0'+i+'.1',status:st,so_bao_cao:st==='da_phat_hanh'?'BC26.11.0'+i+'.1':'',created_at:'2026-11-0'+i+'T01:00:00Z',
          giao:{ma_nv:'NS001',ten:'Nguyễn Văn Sự'},khach:{ten:'K'},du_an:{cong_trinh:'CT'+i},mau:{ten:'Cát'},chi_tieu:[],phieu:ph?{bc:'BC26.11.0'+i+'.1'}:null});
          S.samples.push(mk(1,'da_phat_hanh',true),mk(2,'cho_soat_xet',false),mk(3,'da_phat_hanh',false));window.__ptn.setSession('NS001');location.hash='nhiem-vu';}""");await page.wait_for_timeout(900)
        n=await page.locator('[data-act=nv-phieu]').count();print('nút',n)
        chk(n==1,'chỉ phiếu đã phát hành và có bản lưu có nút: %d'%n)
        t=await page.evaluate("()=>document.querySelector('[data-act=nv-phieu]').textContent");chk(t=='Tải phiếu A4 excel','nhãn nút: '+t)
        await page.evaluate("()=>window.__ptn.setSession('NS009');location.hash='giao-viec'");await page.wait_for_timeout(500)
        await page.evaluate("()=>{location.hash='nhiem-vu'}");await page.wait_for_timeout(500)
        chk(not await page.evaluate("()=>document.body.innerText.includes('null')"),'không chữ null ở giao việc')
        chk(not errs,'lỗi F2: %s'%errs[:2]);await page.context.close()
        await br.close()
    print('ok',ok,'bad',bad)
asyncio.run(main())
