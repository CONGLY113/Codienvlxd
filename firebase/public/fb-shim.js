/* Cầu nối Firebase cho web app "Quản lý mẫu thử nghiệm" (bản 0.23.0).
   Web app gốc nói chuyện với kho dữ liệu qua window.claude.use('db'). File này dựng lại đúng giao diện đó
   bằng Firebase Authentication + Cloud Firestore.
   Đăng nhập: người dùng chọn TÊN mình trong danh sách của web app rồi nhập mật khẩu đã tạo ở Firebase.
   Mỗi tài khoản của web app ứng với một email trong Firebase (xem FIREBASE_LOGIN ở firebase-config.js).
   Chạy TRƯỚC web app (classic script), đặt window.__fbReady để web app chỉ khởi động sau khi biết ai đang đăng nhập. */
(function(){
  'use strict';
  var SDK='https://www.gstatic.com/firebasejs/10.14.1/';
  var cfg=window.FIREBASE_CONFIG||{};
  var L=window.FIREBASE_LOGIN||{};
  var DOMAIN=String(L.domain||'ptn-vlxd.vn').toLowerCase();
  var EMAILS=L.emails||{};
  var state={db:null,ok:false};
  var configured=cfg.apiKey&&cfg.projectId&&!/^(DIEN|YOUR|XXXX)/i.test(cfg.apiKey);

  /* ---------- ánh xạ tài khoản web app <-> email Firebase ---------- */
  function emailOf(id){var e=EMAILS[id];return String(e||(String(id).toLowerCase()+'@'+DOMAIN)).toLowerCase();}
  function idOf(email){
    email=String(email||'').toLowerCase();
    for(var k in EMAILS){if(String(EMAILS[k]).toLowerCase()===email)return k;}
    var m=/^(ns\d+)@(.+)$/.exec(email);
    return (m&&m[2]===DOMAIN)?m[1].toUpperCase():null;
  }
  function setSess(id){try{if(id)localStorage.setItem('ptn_session',id);else localStorage.removeItem('ptn_session');}catch(e){}}
  function banner(t){var d=document.createElement('div');d.setAttribute('style','position:fixed;left:0;right:0;top:0;z-index:9999;background:#FFF4D6;color:#5A3E00;padding:10px 14px;font:14px system-ui;text-align:center');d.textContent=t;document.body.append(d);}
  function viErr(e){var c=(e&&e.code)||'';
    if(/invalid-credential|wrong-password|invalid-login|user-not-found/.test(c))return 'Sai mật khẩu, hoặc tài khoản này chưa được tạo trên Firebase.';
    if(/too-many/.test(c))return 'Thử sai quá nhiều lần. Đợi vài phút rồi thử lại.';
    if(/network/.test(c))return 'Mất kết nối mạng. Kiểm tra mạng rồi thử lại.';
    if(/user-disabled/.test(c))return 'Tài khoản này đã bị khóa.';
    if(/operation-not-allowed/.test(c))return 'Chưa bật đăng nhập Email/Password trong Firebase Authentication.';
    if(/weak-password/.test(c))return 'Mật khẩu mới quá yếu.';
    if(/requires-recent-login/.test(c))return 'Phiên đăng nhập đã cũ. Đăng xuất, đăng nhập lại rồi đổi mật khẩu.';
    return 'Không đăng nhập được ('+(c||'lỗi')+').';}

  /* ---------- bộ chuyển đổi kho dữ liệu: giao diện giống db của Artifact ---------- */
  function clean(o){return JSON.parse(JSON.stringify(o));}
  function mapErr(e){if(e&&e.code==='resource-exhausted')e.code='quota_exceeded';return e;}
  function wrapSnap(s){return {docs:s.docs.map(function(d){return {id:d.id,data:function(){return d.data();}};})};}
  var EMPTY=function(){return {docs:[]};};
  function makeDb(F,fs,ctl){
    /* ctl.staff(): đã đăng nhập bằng tài khoản nhân viên? ctl.ensure(): bảo đảm có người dùng (ẩn danh cho khách) */
    function coll(name){var c=F.collection(fs,name);
      return {
        /* Chưa đăng nhập nhân viên thì không nghe dữ liệu: tránh lỗi permission-denied ở trang đăng nhập và cổng khách */
        onSnapshot:function(ok,err){
          if(!ctl.staff()){var t=setTimeout(function(){ok(EMPTY());},0);return function(){clearTimeout(t);};}
          return F.onSnapshot(c,function(s){ok(wrapSnap(s));},function(e){if(err)err(e);});},
        get:function(){if(!ctl.staff())return Promise.resolve(EMPTY());return F.getDocs(c).then(wrapSnap).catch(function(e){throw mapErr(e);});},
        limit:function(n){return {get:function(){if(!ctl.staff())return Promise.resolve(EMPTY());return F.getDocs(F.query(c,F.limit(n))).then(wrapSnap).catch(function(e){throw mapErr(e);});}};}
      };}
    function docRef(path){var r=F.doc(fs,path);
      function w(fn){return ctl.ensure().then(fn).catch(function(e){throw mapErr(e);});}
      return {
        get:function(){
          var pub=/^archive\//.test(path);   /* tra cứu phiếu bằng QR: khách ẩn danh được đọc đúng một bản lưu */
          if(!ctl.staff()&&!pub)return Promise.resolve({exists:false,id:path.split('/').pop(),data:function(){return undefined;}});
          return (pub?ctl.ensure():Promise.resolve()).then(function(){return F.getDoc(r);}).then(function(s){return {exists:s.exists(),id:s.id,data:function(){return s.data();}};}).catch(function(e){throw mapErr(e);});},
        set:function(o){return w(function(){return F.setDoc(r,clean(o));});},
        update:function(o){return w(function(){return F.setDoc(r,clean(o),{merge:true});});},
        'delete':function(){return w(function(){return F.deleteDoc(r);});},
        /* khóa ngắn hạn (cấp số thứ tự): giao dịch trên tài liệu locks/<đường dẫn> */
        acquire:function(o){var lr=F.doc(fs,'locks/'+path.replace(/\//g,'__'));var holder=(o&&o.holder)||'x',ttl=(o&&o.ttlMs)||4000;
          return w(function(){return F.runTransaction(fs,function(tx){return tx.get(lr).then(function(s){var now=Date.now(),d=s.exists()?s.data():null;
            if(d&&d.holder!==holder&&d.exp>now)return {acquired:false};tx.set(lr,{holder:holder,exp:now+ttl});return {acquired:true};});});});}
      };}
    return {collection:coll,doc:docRef};
  }

  /* ---------- khởi động ---------- */
  window.claude={use:function(name){
    if(name==='db')return Promise.resolve(state.ok?state.db:null);
    if(name==='user')return Promise.resolve({can:function(){return Promise.resolve(true);}});
    return Promise.resolve(null);}};

  window.__fbReady=(function(){
    if(!configured){
      document.addEventListener('DOMContentLoaded',function(){banner('Chưa cấu hình Firebase (sửa public/firebase-config.js). Dữ liệu đang lưu riêng trong trình duyệt này, ai cũng chọn tên để vào được.');});
      return Promise.resolve();
    }
    return Promise.all([import(SDK+'firebase-app.js'),import(SDK+'firebase-auth.js'),import(SDK+'firebase-firestore.js')]).then(function(m){
      var A=m[0],U=m[1],F=m[2];
      var app=A.initializeApp(cfg);var auth=U.getAuth(app);
      var fs;try{fs=F.initializeFirestore(app,{localCache:F.persistentLocalCache({tabManager:F.persistentMultipleTabManager()})});}catch(e){fs=F.getFirestore(app);}
      var anonP=null;
      var ctl={
        staff:function(){var u=auth.currentUser;return !!(u&&!u.isAnonymous);},
        ensure:function(){if(auth.currentUser)return Promise.resolve();
          if(!anonP)anonP=U.signInAnonymously(auth).then(function(){anonP=null;},function(e){anonP=null;throw e;});return anonP;}
      };
      state.db=makeDb(F,fs,ctl);

      /* đăng nhập theo tên tài khoản trong danh sách web app + mật khẩu tạo ở Firebase */
      window.__fbLogin=function(id,pw){
        return U.signInWithEmailAndPassword(auth,emailOf(id),pw).then(function(){setSess(id);return {ok:true};},function(e){return {ok:false,msg:viErr(e)};});};
      window.__fbSignOut=function(){setSess(null);return U.signOut(auth);};
      window.__fbChangePassword=function(oldPw,newPw){
        var u=auth.currentUser;if(!u||u.isAnonymous||!u.email)return Promise.resolve({ok:false,msg:'Chưa đăng nhập.'});
        return U.reauthenticateWithCredential(u,U.EmailAuthProvider.credential(u.email,oldPw))
          .then(function(){return U.updatePassword(u,newPw);})
          .then(function(){return {ok:true};},function(e){return {ok:false,msg:/invalid-credential|wrong-password/.test((e&&e.code)||'')?'Mật khẩu hiện tại chưa đúng.':viErr(e)};});};

      /* biết ai đang đăng nhập trước khi web app khởi động */
      return new Promise(function(res){var off=U.onAuthStateChanged(auth,function(u){off();res(u);});}).then(function(u){
        if(u&&!u.isAnonymous){
          var id=idOf(u.email);
          if(id){setSess(id);}
          else{setSess(null);return U.signOut(auth);}      /* email không thuộc danh sách web app */
        }else{setSess(null);}                              /* chưa đăng nhập hoặc là khách ẩn danh */
      }).then(function(){
        /* đăng xuất ở tab khác thì tab này tải lại về trang đăng nhập */
        var was=ctl.staff();
        U.onAuthStateChanged(auth,function(u){var now=!!(u&&!u.isAnonymous);if(was&&!now){setSess(null);location.reload();}was=now;});
      });
    }).then(function(){state.ok=true;},function(e){
      console.error('Firebase',e);
      document.addEventListener('DOMContentLoaded',function(){banner('Không kết nối được Firebase ('+(e&&e.code||e&&e.message||'lỗi')+'). Dữ liệu đang lưu riêng trong trình duyệt này.');});
    });
  })();
})();
