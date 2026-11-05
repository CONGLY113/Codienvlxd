/* Cầu nối Firebase cho web app "Quản lý mẫu thử nghiệm".
   Web app gốc nói chuyện với kho dữ liệu qua window.claude.use('db'). File này dựng lại đúng giao diện đó
   bằng Firebase Authentication + Cloud Firestore, nên mã web app không phải sửa.
   Chạy TRƯỚC web app (classic script), đặt window.__fbReady để web app chỉ khởi động sau khi đăng nhập xong. */
(function(){
  'use strict';
  var SDK='https://www.gstatic.com/firebasejs/10.14.1/';
  var cfg=window.FIREBASE_CONFIG||{};
  var state={db:null,ok:false};
  var configured=cfg.apiKey&&cfg.projectId&&!/^(DIEN|YOUR|XXXX)/i.test(cfg.apiKey);

  /* ---------- giao diện đăng nhập ---------- */
  var css='.fbg{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px;background:radial-gradient(900px 600px at 10% -10%,rgba(24,126,196,.75),transparent 60%),radial-gradient(800px 600px at 110% 10%,rgba(14,165,170,.4),transparent 58%),#061A2E;font-family:"Be Vietnam Pro",system-ui,sans-serif;color:#D6E6F5}'
   +'.fbg-c{width:100%;max-width:400px;background:#fff;color:#10222F;border-radius:24px;padding:26px;box-shadow:0 30px 80px rgba(2,12,27,.5)}'
   +'.fbg-c h1{margin:0 0 4px;font-size:21px;letter-spacing:-.02em;color:#0A2236}.fbg-c p{margin:0 0 16px;font-size:13px;color:#52667A;line-height:1.5}'
   +'.fbg-c label{display:block;font-size:12.5px;font-weight:600;margin:12px 0 4px;color:#33475B}'
   +'.fbg-c input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:1px solid #D5E0EA;background:#F3F7FB;font:inherit;font-size:15px;color:#10222F}'
   +'.fbg-c input:focus-visible{outline:3px solid #7CC8FF;outline-offset:1px}'
   +'.fbg-c button{width:100%;margin-top:16px;padding:13px;border:0;border-radius:999px;background:#0B5A7C;color:#fff;font:inherit;font-weight:600;font-size:15px;cursor:pointer}'
   +'.fbg-c button[disabled]{opacity:.6;cursor:wait}.fbg-c .lnk{background:none;color:#0B5A7C;margin-top:10px;font-weight:500;font-size:13.5px;padding:6px}'
   +'.fbg-err{margin-top:12px;font-size:13px;color:#B00020;min-height:18px}.fbg-ok{color:#0A6B3D}';
  function el(t,a,k){var e=document.createElement(t);if(a)for(var n in a){if(n==='text')e.textContent=a[n];else e.setAttribute(n,a[n]);}(k||[]).forEach(function(x){e.append(x);});return e;}
  function overlay(opts){
    return new Promise(function(resolve){
      var st=el('style',null,[css]);var err=el('div',{'class':'fbg-err',role:'alert'});
      var em=el('input',{type:'email',autocomplete:'username',id:'fbg-em',placeholder:'ten@donvi.vn',required:'required'});
      var pw=el('input',{type:'password',autocomplete:'current-password',id:'fbg-pw',placeholder:'Mật khẩu',required:'required'});
      var go=el('button',{type:'submit',text:'Đăng nhập'});
      var reset=el('button',{type:'button','class':'lnk',text:'Quên mật khẩu? Gửi email đặt lại'});
      var cust=el('button',{type:'button','class':'lnk',text:'Tôi là khách hàng: gửi yêu cầu thử nghiệm'});
      var form=el('form',null,[el('label',{'for':'fbg-em',text:'Email'}),em,el('label',{'for':'fbg-pw',text:'Mật khẩu'}),pw,go,err,reset,cust]);
      var box=el('div',{'class':'fbg'},[st,el('div',{'class':'fbg-c'},[el('h1',{text:'Phòng thí nghiệm VLXD'}),el('p',{text:'Đăng nhập bằng tài khoản email do trưởng phòng cấp để vào hệ thống quản lý mẫu thử nghiệm.'}),form])]);
      document.body.append(box);setTimeout(function(){em.focus();},50);
      function msg(t,ok){err.textContent=t;err.className='fbg-err'+(ok?' fbg-ok':'');}
      function vi(e){var c=e&&e.code||'';
        if(/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c))return 'Sai email hoặc mật khẩu.';
        if(/too-many/.test(c))return 'Thử quá nhiều lần. Đợi vài phút rồi thử lại.';
        if(/network/.test(c))return 'Mất kết nối mạng.';
        if(/invalid-email/.test(c))return 'Email không hợp lệ.';
        return 'Không đăng nhập được ('+(c||'lỗi')+').';}
      form.addEventListener('submit',function(ev){ev.preventDefault();go.disabled=true;msg('');
        opts.signIn(em.value.trim(),pw.value).then(function(){box.remove();resolve();},function(e){msg(vi(e));go.disabled=false;});});
      reset.addEventListener('click',function(){var m=em.value.trim();if(!m){msg('Nhập email trước.');em.focus();return;}
        opts.reset(m).then(function(){msg('Đã gửi email đặt lại mật khẩu (kiểm tra cả thư rác).',true);},function(e){msg(vi(e));});});
      cust.addEventListener('click',function(){cust.disabled=true;opts.anon().then(function(){box.remove();location.hash='#khach-hang';resolve();},function(e){msg(vi(e));cust.disabled=false;});});
    });
  }
  function banner(t){var d=el('div',{style:'position:fixed;left:0;right:0;top:0;z-index:9999;background:#FFF4D6;color:#5A3E00;padding:10px 14px;font:14px system-ui;text-align:center'},[t]);document.body.append(d);}

  /* ---------- bộ chuyển đổi kho dữ liệu: giao diện giống db của Artifact ---------- */
  function clean(o){return JSON.parse(JSON.stringify(o));}
  function mapErr(e){if(e&&e.code==='resource-exhausted')e.code='quota_exceeded';return e;}
  function wrapSnap(s){return {docs:s.docs.map(function(d){return {id:d.id,data:function(){return d.data();}};})};}
  function makeDb(F,fs){
    function coll(name){var c=F.collection(fs,name);
      var api={
        onSnapshot:function(ok,err){return F.onSnapshot(c,function(s){ok(wrapSnap(s));},function(e){if(err)err(e);});},
        get:function(){return F.getDocs(c).then(wrapSnap).catch(function(e){throw mapErr(e);});},
        limit:function(n){return {get:function(){return F.getDocs(F.query(c,F.limit(n))).then(wrapSnap).catch(function(e){throw mapErr(e);});}};}
      };return api;}
    function docRef(path){var r=F.doc(fs,path);
      return {
        get:function(){return F.getDoc(r).then(function(s){return {exists:s.exists(),id:s.id,data:function(){return s.data();}};}).catch(function(e){throw mapErr(e);});},
        set:function(o){return F.setDoc(r,clean(o)).catch(function(e){throw mapErr(e);});},
        update:function(o){return F.setDoc(r,clean(o),{merge:true}).catch(function(e){throw mapErr(e);});},
        'delete':function(){return F.deleteDoc(r).catch(function(e){throw mapErr(e);});},
        /* khóa ngắn hạn (cấp số thứ tự): giao dịch trên tài liệu locks/<đường dẫn> */
        acquire:function(o){var lr=F.doc(fs,'locks/'+path.replace(/\//g,'__'));var holder=o&&o.holder||'x',ttl=o&&o.ttlMs||4000;
          return F.runTransaction(fs,function(tx){return tx.get(lr).then(function(s){var now=Date.now(),d=s.exists()?s.data():null;
            if(d&&d.holder!==holder&&d.exp>now)return {acquired:false};tx.set(lr,{holder:holder,exp:now+ttl});return {acquired:true};});}).catch(function(e){throw mapErr(e);});}
      };}
    return {collection:coll,doc:docRef};
  }

  /* ---------- khởi động ---------- */
  var isPublicHash=function(){var h=location.hash||'';return h==='#khach-hang'||/^#tc-/.test(h);};
  window.claude={use:function(name){
    if(name==='db')return Promise.resolve(state.ok?state.db:null);
    if(name==='user')return Promise.resolve({can:function(){return Promise.resolve(true);}});
    return Promise.resolve(null);}};
  window.__fbSignOut=function(){return window.__fbAuthOut?window.__fbAuthOut().then(function(){location.reload();}):Promise.resolve();};

  window.__fbReady=(function(){
    if(!configured){
      document.addEventListener('DOMContentLoaded',function(){banner('Chưa cấu hình Firebase (sửa public/firebase-config.js). Dữ liệu đang lưu riêng trong trình duyệt này.');});
      return Promise.resolve();
    }
    return Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-firestore.js')]).then(function(m){
      var A=m[0],U=m[1],F=m[2];
      var app=A.initializeApp(cfg);var auth=U.getAuth(app);
      var fs;try{fs=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})});}catch(e){fs=F.getFirestore(app);}
      window.__fbAuthOut=function(){return U.signOut(auth);};
      state.db=makeDb(F,fs);
      var opts={signIn:function(e,p){return U.signInWithEmailAndPassword(auth,e,p);},reset:function(e){return U.sendPasswordResetEmail(auth,e);},anon:function(){return U.signInAnonymously(auth);}};
      return new Promise(function(res){var off=U.onAuthStateChanged(auth,function(u){off();res(u);});}).then(function(u){
        if(u&&!u.isAnonymous)return;               /* đã đăng nhập nhân viên */
        if(isPublicHash())return U.signInAnonymously(auth);   /* cổng khách hàng, tra cứu QR */
        var p=u?U.signOut(auth):Promise.resolve();
        return p.then(function(){return new Promise(function(r){if(document.body)r();else document.addEventListener('DOMContentLoaded',r);});}).then(function(){return overlay(opts);});
      });
    }).then(function(){state.ok=true;},function(e){
      console.error('Firebase',e);
      document.addEventListener('DOMContentLoaded',function(){banner('Không kết nối được Firebase ('+(e&&e.code||e&&e.message||'lỗi')+'). Dữ liệu đang lưu riêng trong trình duyệt này.');});
    });
  })();
})();
