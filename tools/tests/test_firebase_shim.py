import asyncio, json, sys
from playwright.async_api import async_playwright
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
APP="""export const initializeApp=c=>({cfg:c});"""
AUTH="""
const G=globalThis.__FAKE=globalThis.__FAKE||{user:null,subs:[],store:{},log:[]};
export const getAuth=a=>({a});
export const onAuthStateChanged=(auth,cb)=>{setTimeout(()=>cb(G.user),10);return()=>{}};
export const signInWithEmailAndPassword=async(a,e,p)=>{if(p!=='dung123'){const x=new Error('bad');x.code='auth/invalid-credential';throw x;}G.user={email:e,isAnonymous:false};return {user:G.user};};
export const signInAnonymously=async()=>{G.user={isAnonymous:true};G.log.push('anon');return {user:G.user};};
export const sendPasswordResetEmail=async(a,e)=>{G.log.push('reset:'+e);};
export const signOut=async()=>{G.user=null;};
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
const snap=n=>({docs:Object.entries(S()[n]||{}).map(([id,d])=>({id,data:()=>JSON.parse(JSON.stringify(d))}))});
const listeners=[];const fire=n=>listeners.filter(l=>l.n===n).forEach(l=>l.cb(snap(n)));
export const onSnapshot=(c,ok)=>{const l={n:c.n,cb:ok};listeners.push(l);setTimeout(()=>ok(snap(c.n)),5);return()=>{listeners.splice(listeners.indexOf(l),1)}};
export const getDocs=async c=>snap(c.n);
export const getDoc=async r=>{const [c,i]=part(r.p);const d=(S()[c]||{})[i];return {exists:()=>!!d,id:i,data:()=>JSON.parse(JSON.stringify(d))};};
const deepMerge=(a,b)=>{const o=Object.assign({},a);for(const k in b){o[k]=(b[k]&&typeof b[k]==='object'&&!Array.isArray(b[k])&&a&&a[k]&&typeof a[k]==='object')?deepMerge(a[k],b[k]):b[k];}return o;};
export const setDoc=async(r,data,opt)=>{const [c,i]=part(r.p);S()[c]=S()[c]||{};
  if(G.user&&G.user.isAnonymous&&!(c.startsWith('samples')&&data.kenh==='khach'&&data.status==='cho_tiep_nhan')&&c!=='audit'){const e=new Error('denied');e.code='permission-denied';throw e;}
  S()[c][i]=opt&&opt.merge&&S()[c][i]?deepMerge(S()[c][i],JSON.parse(JSON.stringify(data))):JSON.parse(JSON.stringify(data));fire(c);};
export const deleteDoc=async r=>{const [c,i]=part(r.p);if(S()[c])delete S()[c][i];fire(c);};
export const runTransaction=async(fs,fn)=>{const tx={get:async r=>getDoc(r),set:(r,d)=>{const [c,i]=part(r.p);S()[c]=S()[c]||{};S()[c][i]=d;}};return fn(tx);};
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
        # 1 chưa cấu hình
        page,errs=await run('nocfg','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body='window.FIREBASE_CONFIG={apiKey:"DIEN_API_KEY",projectId:"DIEN_PROJECT_ID"};',content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html');await page.wait_for_timeout(1500)
        print('1 chưa cấu hình: db=',await page.evaluate("()=>window.__ptn&&window.__ptn.db"),'banner=',await page.evaluate("()=>document.body.innerText.includes('Chưa cấu hình Firebase')"),errs[:2])
        # 2 đã cấu hình, nhân viên
        page,errs=await run('cfg','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body=CFG,content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html');await page.wait_for_selector('.fbg',timeout=8000)
        print('2a overlay đăng nhập hiện, app chưa chạy:',await page.evaluate("()=>!window.__ptn"))
        await page.fill('#fbg-em','hcly113@gmail.com');await page.fill('#fbg-pw','sai');await page.click('.fbg button[type=submit]');await page.wait_for_timeout(300)
        print('2b sai mật khẩu:',await page.inner_text('.fbg-err'))
        await page.fill('#fbg-pw','dung123');await page.click('.fbg button[type=submit]');await page.wait_for_function('window.__ptn&&window.__ptn.db===true',timeout=8000)
        print('2c app chạy với db Firebase:',await page.evaluate("()=>window.__ptn.db"))
        r=await page.evaluate("""async()=>{const P=window.__ptn;P.setSession('NS009');await new Promise(r=>setTimeout(r,200));
          const c1=await P.makeCode('mau','2026-11-05','CAT_XD');const c2=await P.makeCode('mau','2026-11-05','CAT_XD');
          await P.Data.set('config/bang_gia',{gia:{CAT_XD:200000}});await P.Data.update('config/bang_gia',{ct:{CT_01:1}});
          const g=await P.Data.get('config/bang_gia');
          await P.Data.set('mauh/h1',{code:'CAT_XD',rev:1});await new Promise(r=>setTimeout(r,200));
          return {c1,c2,g,mauh:(P.S.mauh||[]).length,store:Object.keys(globalThis.__FAKE.store)};}""")
        print('2d ghi/đọc:',json.dumps(r,ensure_ascii=False))
        print('   lỗi console:',errs[:3])
        # 3 khách hàng ẩn danh
        page,errs=await run('anon','window.__x=1;')
        await page.route('**/firebase-config.js',lambda r:r.fulfill(body=CFG,content_type='application/javascript'))
        await page.goto('http://localhost:8765/index.html#khach-hang');await page.wait_for_function('window.__ptn&&window.__ptn.db===true',timeout=8000)
        print('3 khách ẩn danh vào thẳng cổng, không overlay:',await page.evaluate("()=>!document.querySelector('.fbg')"),await page.evaluate("()=>location.hash"),'user:',await page.evaluate("()=>JSON.stringify(globalThis.__FAKE&&globalThis.__FAKE.user)"))
        r=await page.evaluate("""async()=>{const P=window.__ptn;const id=P.newSid();let ok=true,den=null;
          try{await P.Data.set(P.sp(id),{kenh:'khach',status:'cho_tiep_nhan',khach:{ten:'A'}});}catch(e){ok=false}
          try{await P.Data.set('config/bang_gia',{x:1});}catch(e){den=e.code}
          return {ok,den};}""")
        print('   khách gửi yêu cầu được, ghi cấu hình bị chặn:',r)
        await br.close();srv.shutdown()
asyncio.run(main())
