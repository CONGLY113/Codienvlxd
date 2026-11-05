import asyncio, json, sys, time
from playwright.async_api import async_playwright

HTML = sys.argv[1]
JSZIP = open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js', encoding='utf8').read()

# Cơ sở dữ liệu giả mô phỏng nền tảng: dữ liệu đóng băng, update báo lỗi khi chưa có tài liệu, snapshot bất đồng bộ.
FAKE = r"""
(()=>{
  const store=new Map(); const subs=new Map(); window.__stat={reads:0,writes:0,snaps:0};
  const freeze=o=>{if(o&&typeof o==='object'){Object.values(o).forEach(freeze);Object.freeze(o);}return o;};
  const colOf=p=>p.slice(0,p.lastIndexOf('/')), idOf=p=>p.slice(p.lastIndexOf('/')+1);
  const docs=c=>[...store.entries()].filter(([p])=>colOf(p)===c).map(([p,v])=>mk(p,v)).sort((a,b)=>a.id<b.id?-1:1);
  const mk=(p,v)=>({id:idOf(p),exists:v!==undefined,data:()=>v,metadata:{fromCache:false,hasPendingWrites:false}});
  const notify=c=>{(subs.get(c)||[]).forEach(f=>setTimeout(()=>{window.__stat.snaps++;f(snap(c));},0));};
  const snap=c=>{const d=docs(c);return {docs:d,size:d.length,empty:!d.length,docChanges:()=>[],metadata:{fromCache:false}};};
  const err=code=>Object.assign(new Error(code),{code});
  const doc=p=>({id:idOf(p),path:p,
    async get(){window.__stat.reads++;return mk(p,store.get(p));},
    async set(d){window.__stat.writes++;const s=JSON.stringify(d);if(s.length>262144)throw err('invalid_argument');store.set(p,freeze(JSON.parse(s)));notify(colOf(p));},
    async update(d){window.__stat.writes++;const cur=store.get(p);if(cur===undefined)throw err('invalid_argument');
      const merge=(a,b)=>{const o=Object.assign({},a);for(const k in b){const v=b[k];o[k]=(v&&typeof v==='object'&&!Array.isArray(v)&&o[k]&&typeof o[k]==='object'&&!Array.isArray(o[k]))?merge(o[k],v):v;}return o;};
      store.set(p,freeze(JSON.parse(JSON.stringify(merge(cur,d)))));notify(colOf(p));},
    async delete(){store.delete(p);notify(colOf(p));},
    async acquire(){return {acquired:true,version:1};},
    onSnapshot(n){const c=p;return ()=>{};}
  });
  const col=c=>{const q={path:c,doc:id=>doc(c+'/'+id),
    get:async()=>{window.__stat.reads++;return snap(c);},
    limit:()=>q,where:()=>q,orderBy:()=>q,
    onSnapshot(next){const l=subs.get(c)||[];l.push(next);subs.set(c,l);setTimeout(()=>{window.__stat.snaps++;next(snap(c));},0);return ()=>{subs.set(c,(subs.get(c)||[]).filter(x=>x!==next));};}};return q;};
  window.__fake={store,count:()=>store.size,cols:()=>{const m={};for(const p of store.keys()){const c=colOf(p);m[c]=(m[c]||0)+1;}return m;},
    seed:(arr)=>{arr.forEach(([p,v])=>store.set(p,freeze(JSON.parse(JSON.stringify(v)))));}};
  const downloads=[];window.__dl=downloads;
  window.claude={use:async n=>n==='db'?{doc,collection:col}:n==='user'?{can:async()=>true,isOwner:()=>true,canEdit:()=>true}:n==='downloads'?{save:async({filename,data})=>{downloads.push({filename,len:data.length,data});}}:null};
})();
"""

async def main():
    async with async_playwright() as pw:
        br = await pw.chromium.launch(executable_path='/usr/bin/google-chrome', headless=True, args=['--no-sandbox'])
        ctx = await br.new_context(viewport={'width': 1300, 'height': 900})
        page = await ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        page.on('console', lambda m: errs.append('CONSOLE ' + m.text) if m.type == 'error' else None)
        async def route(r):
            u = r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP, content_type='application/javascript')
            elif 'qrcode' in u: await r.fulfill(body='', content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='', content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*', route)
        await page.add_init_script(FAKE)
        await page.goto('file://' + HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true', timeout=15000)
        r = await page.evaluate(open('/tmp/w/scenario.js', encoding='utf8').read())
        print(json.dumps(r, ensure_ascii=False, indent=1))
        print('ERRORS:', errs if errs else 'none')
        await br.close()

asyncio.run(main())
