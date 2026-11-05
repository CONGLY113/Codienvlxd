import asyncio, json, sys
from playwright.async_api import async_playwright
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
APP="""export const initializeApp=c=>({cfg:c});"""
AUTH="""
const ld=k=>{try{return JSON.parse(localStorage.getItem('fk_'+k));}catch(e){return null;}};
const G=globalThis.__FAKE=globalThis.__FAKE||{user:ld('user'),subs:[],store:ld('store')||{},log:[],denied:0,pw:ld('pw')||{'hcly113@gmail.com':'dung123','ns002@ptn-vlxd.vn':'abc12345'},STAFF:['hcly113@gmail.com','ns002@ptn-vlxd.vn']};
G.save=()=>{localStorage.setItem('fk_user',JSON.stringify(G.user));localStorage.setItem('fk_pw',JSON.stringify(G.pw));localStorage.setItem('fk_store',JSON.stringify(G.store));};
const lis=[];const setUser=u=>{G.user=u;G.save();lis.slice().forEach(f=>setTimeout(()=>f(G.user),0));};
export const getAuth=a=>({get currentUser(){return G.user;}});
export const onAuthStateChanged=(auth,cb)=>{lis.push(cb);setTimeout(()=>cb(G.user),10);return()=>{const i=lis.indexOf(cb);if(i>=0)lis.splice(i,1);}};
export const signInWithEmailAndPassword=async(a,e,p)=>{G.log.push('login:'+e);if(G.pw[e]!==p){const x=new Error('bad');x.code=G.pw[e]===undefined?'auth/user-not-found':'auth/invalid-credential';throw x;}setUser({email:e,isAnonymous:false});return {user:G.user};};
export const signInAnonymously=async()=>{G.log.push('anon');setUser({isAnonymous:true});return {user:G.user};};
export const signOut=async()=>{setUser(null);};
export const EmailAuthProvider={credential:(e,p)=>({e,p})};
export const reauthenticateWithCredential=async(u,c)=>{if(G.pw[c.e]!==c.p){const x=new Error('bad');x.code='auth/invalid-credential';throw x;}};
export const updatePassword=async(u,np)=>{G.pw[u.email]=np;G.save();G.log.push('pwchg');};
"""
FS="""
const G=globalThis.__FAKE;
const S=()=>G.store;
const part=p=>{const i=p.indexOf('/');return [p.slice(0,i),p.slice(i+1)];};
export const initializeFirestore=(app,o)=>({o});
export const getFirestore=app=>({});
export const persistentLocalCache=o=>o;export const persistentMultipleTabManager=()=>({});
export const collection=(fs,n)=>({kind:'c',n});
export const doc=(fs,p)=>({kind:'d',p});
export const limit=n=>({lim:n});
export const query=(c,l)=>Object.assign({},c,{lim:l.lim});
const staff=()=>G.user&&!G.user.isAnonymous&&G.STAFF.includes(G.user.email);
const deny=()=>{G.denied++;const e=new Error('denied');e.code='permission-denied';throw e;};
const snap=n=>({docs:Object.entries(S()[n]||{}).map(([id,d])=>({id,data:()=>JSON.parse(JSON.stringify(d))}))});
const listeners=[];const fire=n=>listeners.filter(l=>l.n===n).forEach(l=>l.cb(snap(n)));
export const onSnapshot=(c,ok,err)=>{if(!staff()){G.denied++;setTimeout(()=>err&&err(Object.assign(new Error('denied'),{code:'permission-denied'})),5);return()=>{}}
  const l={n:c.n,cb:ok};listeners.push(l);setTimeout(()=>ok(snap(c.n)),5);return()=>{listeners.splice(listeners.indexOf(l),1)}};
export const getDocs=async c=>{if(!staff())deny();return snap(c.n);};
export const getDoc=async r=>{const [c,i]=part(r.p);if(!staff()&&!(G.user&&G.user.isAnonymous&&c==='archive'))deny();const d=(S()[c]||{})[i];return {exists:()=>!!d,id:i,data:()=>JSON.parse(JSON.stringify(d))};};
const deepMerge=(a,b)=>{const o=Object.assign({},a);for(const k in b){o[k]=(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a&&a[k]&&typeof a[k]==='object')?deepMerge(a[k],b[k]):b[k];}return o;};
export const setDoc=async(r,data,opt)=>{const [c,i]=part(r.p);S()[c]=S()[c]||{};
  if(!staff()&&!(G.user&&G.user.isAnonymous&&((c.startsWith('samples')&&data.kenh==='khach'&&data.status==='cho_tiep_nhan')||c==='audit')))deny();
  S()[c][i]=opt&&opt.merge&&S()[c][i]?deepMerge(S()[c][i],JSON.parse(JSON.stringify(data))):JSON.parse(JSON.stringify(data));fire(c);G.save();};
export const deleteDoc=async r=>{const [c,i]=part(r.p);if(!staff())deny();if(S()[c])delete S()[c][i];fire(c);};
export const runTransaction=async(fs,fn)=>{if(!staff())deny();const tx={get:async r=>getDoc(r),set:(r,d)=>{const [c,i]=part(r.p);S()[c]=S()[c]||{};S()[c][i]=d;}};return fn(tx);};
"""
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        res={}
        async def run(name,cfg,hash_='',steps=None):
            ctx=await br.new_context(viewport={'width':1200,'height':800});page=await ctx.new_page();errs=[]
            page.on('pageerror',lambda e:errs.append(str(e)))
            page.on('console',lambda m:errs.append(m.text) if m.type=='error' else None)
            async def route(r):
                u=r.request.url
                if 'gstatic.com/firebasejs' in u:
                    body=APP if 'firebase-app' in u else AUTH if 'firebase-auth' in u else FS
                    await r.fulfill(body=body,content_type='application/javascript',headers={'access-control-allow-origin':'*'})
                elif 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
                elif u.startswith('file://') or u.startswith('http://localhost'): await r.continue_()
                else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
            await page.route('**/*',route)
            await page.add_init_script(cfg)
            return page,errs
        import http.server,threading,functools,os
        h=functools.partial(http.server.SimpleHTTPRequestHandler,directory='/tmp/fb/public')
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self,*a):pass
        srv=http.server.ThreadingHTTPServer(('127.0.0.1',8765),functools.partial(Q,directory='/tmp/fb/public'));threading.Thread(target=srv.serve_forever,daemon=True).start()
        CFG="window.FIREBASE_CONFIG={apiKey:'k',projectId:'p'};"
        LOGIN="window.FIREBASE_LOGIN={domain:'ptn-vlxd.vn',emails:{NS009:'hcly113@gmail.com'}};"
        # 1 chưa cấu hình
        page,errs=await run('nocfg','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body='window.FIREBASE_CONFIG={apiKey:"DIEN_API_KEY",projectId:"DIEN_PROJECT_ID"};',content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html');await page.wait_for_timeout(1500)
        print('1 chưa cấu hình: db=',await page.evaluate("()=>window.__ptn&&window.__ptn.db"),'banner=',await page.evaluate("()=>document.body.innerText.includes('Chưa cấu hình Firebase')"),errs[:2])
        # 2 đã cấu hình: trang đăng nhập không còn overlay, không lỗi permission-denied
        page,errs=await run('cfg','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body=CFG+LOGIN,content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html');await page.wait_for_selector('.acc',timeout=8000);await page.wait_for_timeout(800)
        print('2a không có khung email/mật khẩu cũ:',await page.evaluate("()=>!document.querySelector('.fbg')"),'| trang chọn tài khoản hiện:',await page.locator('.acc').count(),'ô')
        print('   ghi chú mật khẩu:',(await page.inner_text('.lg-note'))[:70])
        print('   số lần Firebase từ chối khi chưa đăng nhập =',await page.evaluate("()=>globalThis.__FAKE.denied"),'| toast lỗi:',await page.evaluate("()=>document.querySelectorAll('.toast').length"))
        # chọn Hoàng Công Lý, sai mật khẩu
        await page.locator('.acc',has_text='Hoàng Công Lý').click();await page.wait_for_selector('#fb-pw')
        print('2b hộp mật khẩu hiện trên trang đăng nhập (z-index):',await page.evaluate("()=>{const o=document.querySelector('.overlay');const r=o.getBoundingClientRect();const e=document.elementFromPoint(r.width/2,60);return !!e.closest('.overlay')}"))
        await page.fill('#fb-pw','sai');await page.press('#fb-pw','Enter');await page.wait_for_function("document.querySelector('[role=alert]').textContent.length>3")
        print('   sai mật khẩu:',await page.inner_text('.modal [role=alert]'),'| vẫn chưa vào:',await page.evaluate("()=>!localStorage.getItem('ptn_session')"))
        await page.fill('#fb-pw','dung123');await page.press('#fb-pw','Enter')
        await page.wait_for_function('window.__ptn&&window.__ptn.S&&window.__ptn.db===true&&!document.querySelector(".acc")&&document.querySelector(".side")',timeout=10000)
        r=await page.evaluate("""async()=>({sess:localStorage.getItem('ptn_session'),hash:location.hash,email:globalThis.__FAKE.user.email,me:document.querySelector('.side .me b').textContent,pwbtn:[...document.querySelectorAll('.side .me button')].map(b=>b.textContent.trim())})""")
        print('2c sau đăng nhập (đã tải lại):',json.dumps(r,ensure_ascii=False))
        r=await page.evaluate("""async()=>{const P=window.__ptn;await new Promise(r=>setTimeout(r,200));
          const c1=await P.makeCode('mau','2026-11-05','CAT_XD');const c2=await P.makeCode('mau','2026-11-05','CAT_XD');
          await P.Data.set('config/bang_gia',{gia:{CAT_XD:200000}});await P.Data.update('config/bang_gia',{ct:{CT_01:1}});
          const g=await P.Data.get('config/bang_gia');
          await P.Data.set('mauh/h1',{code:'CAT_XD',rev:1});await new Promise(r=>setTimeout(r,200));
          return {c1,c2,g,mauh:(P.S.mauh||[]).length,denied:globalThis.__FAKE.denied};}""")
        print('2d ghi/đọc nhân viên:',json.dumps(r,ensure_ascii=False))
        r=await page.evaluate("async()=>{const r=await window.__ptn.bkupRun({full:false},()=>{});return {ndoc:r.ndoc,sheets:r.sheets.length,kb:Math.round(r.bytes.length/1024),warn:r.warn,denied:globalThis.__FAKE.denied}}")
        print('2d2 xuất Excel qua Firebase (nhân viên):',r)
        # đổi mật khẩu
        await page.click('.side .me button:has-text("Đổi mật khẩu")');await page.wait_for_selector('#fb-o')
        await page.fill('#fb-o','sai');await page.fill('#fb-n','matkhau-moi1');await page.fill('#fb-n2','matkhau-moi1');await page.click('.modal button[type=submit]')
        await page.wait_for_function("[...document.querySelectorAll('.modal [role=alert]')].some(e=>e.textContent.length>3)")
        print('2e đổi mật khẩu sai mật khẩu cũ:',await page.inner_text('.modal [role=alert]'))
        await page.fill('#fb-o','dung123');await page.click('.modal button[type=submit]');await page.wait_for_timeout(500)
        print('   đổi đúng:',await page.evaluate("()=>globalThis.__FAKE.pw['hcly113@gmail.com']"),'| toast:',await page.evaluate("()=>[...document.querySelectorAll('.toast')].map(t=>t.textContent).join('|')"))
        # đăng xuất
        await page.click('.side .me button:has-text("Đăng xuất")');await page.wait_for_selector('.acc',timeout=8000);await page.wait_for_timeout(500)
        print('2f đăng xuất: user=',await page.evaluate("()=>JSON.stringify(globalThis.__FAKE.user)"),'session=',await page.evaluate("()=>localStorage.getItem('ptn_session')"),'| mật khẩu cũ còn dùng được?')
        # tài khoản khác: ns002
        await page.locator('.acc',has_text='Trần Đăng Hùng').click();await page.fill('#fb-pw','abc12345');await page.press('#fb-pw','Enter')
        await page.wait_for_function('document.querySelector(".side")',timeout=10000)
        print('2g NS002 vào được:',await page.evaluate("()=>[localStorage.getItem('ptn_session'),document.querySelector('.side .me b').textContent,globalThis.__FAKE.log.filter(x=>x.startsWith('login')).slice(-1)[0]]"))
        # tài khoản chưa tạo trên Firebase
        await page.click('.side .me button:has-text("Đăng xuất")');await page.wait_for_selector('.acc',timeout=8000)
        await page.locator('.acc',has_text='Lưu Minh Tuấn').click();await page.fill('#fb-pw','x');await page.press('#fb-pw','Enter')
        await page.wait_for_function("document.querySelector('.modal [role=alert]').textContent.length>3")
        print('2h tài khoản chưa tạo:',await page.inner_text('.modal [role=alert]'))
        print('   lỗi console:',[e for e in errs if 'permission' in e.lower() or 'pageerror' in e.lower()][:3],len(errs))
        # 3 khách hàng ẩn danh
        page,errs=await run('anon','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body=CFG+LOGIN,content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html#khach-hang');await page.wait_for_function('window.__ptn&&window.__ptn.db===true',timeout=8000);await page.wait_for_timeout(600)
        print('3 khách vào thẳng cổng:',await page.evaluate("()=>location.hash"),'| denied=',await page.evaluate("()=>globalThis.__FAKE.denied"),'| toast:',await page.evaluate("()=>document.querySelectorAll('.toast').length"))
        r=await page.evaluate("""async()=>{const P=window.__ptn;const id=P.newSid();let ok=true,den=null;
          try{await P.Data.set(P.sp(id),{kenh:'khach',status:'cho_tiep_nhan',khach:{ten:'A'}});}catch(e){ok=false}
          try{await P.Data.set('config/bang_gia',{x:1});}catch(e){den=e.code}
          return {ok,den,user:JSON.stringify(globalThis.__FAKE.user)};}""")
        print('   khách gửi yêu cầu (đăng nhập ẩn danh khi cần), ghi cấu hình bị chặn:',r)
        # 3b khách bấm chọn tài khoản nhân viên sau khi đã ẩn danh
        # 4 đã đăng nhập sẵn (phiên cũ) nhưng ptn_session bị sửa -> đồng bộ lại theo Firebase
        page,errs=await run('sess','localStorage.setItem("ptn_session","NS012");')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body=CFG+LOGIN,content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html');await page.wait_for_selector('.acc',timeout=8000)
        print('4 có ptn_session cũ nhưng chưa đăng nhập Firebase → về trang đăng nhập:',await page.evaluate("()=>localStorage.getItem('ptn_session')"))
        await br.close();srv.shutdown()
asyncio.run(main())
