# F3: nhiều người dùng: không vẽ lại khi đang gõ; gom nhiều thay đổi
import asyncio,sys
exec(open('/tmp/w/test133.py',encoding='utf8').read().split('async def main():')[0])
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page,errs=await newpage(br)
        await page.goto('file://'+HTML);await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        await page.evaluate("()=>{window.__ptn.setSession('NS009');location.hash='thong-ke';}");await page.wait_for_timeout(800)
        await page.evaluate("()=>{const d=window.__ptn.Data;for(let i=0;i<3;i++)d.set('samples/pp'+i,{id:'pp'+i,ma_mau:'MP'+i,status:'da_phat_hanh',khach:{ten:'K'},du_an:{cong_trinh:'C'},mau:{ten:'x'},chi_tieu:[],phat_hanh_at:'2026-10-0'+i});}");await page.wait_for_timeout(600)
        await page.evaluate("()=>{location.hash='luu-tru';}");await page.wait_for_timeout(800)
        inp=await page.evaluate("()=>{const i=document.querySelector('.shell input[type=search],.shell input[type=text]');if(!i)return null;i.focus();return i.outerHTML.slice(0,80)}")
        print('input',inp)
        chk(inp,'trang lưu trữ có ô nhập')
        await page.keyboard.type('MX');await page.wait_for_timeout(100)
        await page.evaluate("()=>{window.__ptn.__r=0;const o=window.__ptn.S;}")
        await page.evaluate("""()=>{const d=window.__ptn.Data;for(let i=0;i<5;i++)d.set('samples/rr'+i,{id:'rr'+i,ma_mau:'MX'+i,status:'da_phat_hanh',khach:{ten:'K'},du_an:{cong_trinh:'C'},mau:{ten:'x'},chi_tieu:[],phat_hanh_at:'2026-11-0'+i});}""")
        await page.wait_for_timeout(900)
        v=await page.evaluate("()=>document.activeElement&&document.activeElement.value");print('giá trị khi đang gõ',v)
        chk(v=='MX','không mất chữ đang gõ khi dữ liệu đổi')
        await page.evaluate("()=>document.activeElement.blur()");await page.wait_for_timeout(1500)
        n=await page.evaluate("()=>document.body.innerText.includes('MX4')");print('sau blur có dữ liệu mới',n)
        chk(n,'sau khi rời ô nhập, trang được cập nhật dữ liệu mới')
        # tốc độ: 40 lần ghi liên tiếp
        t=await page.evaluate("""async()=>{const d=window.__ptn.Data;let c=0;const ob=new MutationObserver(()=>c++);ob.observe(document.body,{childList:true,subtree:true});
          const t0=performance.now();for(let i=0;i<40;i++)await d.set('samples/qq'+i,{id:'qq'+i,ma_mau:'MQ'+i,status:'da_phat_hanh',khach:{ten:'K'},du_an:{cong_trinh:'C'},mau:{ten:'x'},chi_tieu:[],phat_hanh_at:'2026-11-0'+(i%9)});
          await new Promise(r=>setTimeout(r,1000));ob.disconnect();return {ms:performance.now()-t0,c}}""");print(t)
        chk(t['ms']<4000,'40 ghi liên tiếp chạy mượt: %d ms'%t['ms'])
        chk(not errs,'lỗi: %s'%errs[:2]);await br.close()
    print('ok',ok,'bad',bad)
asyncio.run(main())
