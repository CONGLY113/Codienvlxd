import re
s=open('/tmp/w/out104.html',encoding='utf8').read()
def rep(old,new,n=1):
    global s
    c=s.count(old)
    assert c==n,(old[:70],c)
    s=s.replace(old,new)

rep("const BUILD='0.22.0 · 05/11/2026';","const BUILD='0.23.0 · 05/11/2026';")

# 1. tile: có Firebase thì hỏi mật khẩu
rep("onclick:()=>{SESSION=a;saveSession();location.hash=defaultPage();render();}},\n        h('i',{class:'lg-av'",
    "onclick:()=>{if(window.__fbLogin){fbPwDlg(a);return;}SESSION=a;saveSession();location.hash=defaultPage();render();}},\n        h('i',{class:'lg-av'")
# 2. ghi chú
rep("'Chế độ chạy thử: chọn một tài khoản để vào, chưa có mật khẩu. Vai trò hiện là tạm, chỉ để thử luồng. '",
    "(window.__fbLogin?'Chọn tài khoản của mình rồi nhập mật khẩu do trưởng phòng cấp. Quên mật khẩu: báo trưởng phòng đặt lại. ':'Chế độ chạy thử: chọn một tài khoản để vào, chưa có mật khẩu. Vai trò hiện là tạm, chỉ để thử luồng. ')")

# 3. hàm đăng nhập / đăng xuất / đổi mật khẩu
FN=r"""function defaultPage(){return 'tong-quan';}
/* 0.23.0 đăng nhập bằng mật khẩu Firebase (chỉ bật khi có fb-shim.js đặt window.__fbLogin) */
function fbPwField(label,id,ac){return h('div',{class:'field'},h('label',{for:id},label),h('input',{type:'password',id:id,autocomplete:ac,spellcheck:'false'}));}
function fbShowToggle(inputs){const cb=h('input',{type:'checkbox',id:'fb-show',onchange:()=>inputs.forEach(i=>{i.type=cb.checked?'text':'password';})});return h('label',{class:'small muted',for:'fb-show',style:'display:flex;gap:8px;align-items:center;margin-top:10px;cursor:pointer'},cb,'Hiện mật khẩu');}
function fbPwDlg(a){
  const f=fbPwField('Mật khẩu','fb-pw','current-password'),pw=f.querySelector('input');
  const err=h('p',{class:'small',role:'alert','aria-live':'polite',style:'color:#B00020;min-height:18px;margin:8px 0 0'});
  const go=h('button',{class:'btn primary',type:'submit',style:'width:100%;margin-top:14px'},'Đăng nhập');
  const form=h('form',{onsubmit:async ev=>{ev.preventDefault();
    if(!pw.value){err.textContent='Nhập mật khẩu.';pw.focus();return;}
    go.disabled=true;go.textContent='Đang kiểm tra…';err.textContent='';
    let r;try{r=await window.__fbLogin(a.id,pw.value);}catch(e){r={ok:false,msg:'Không đăng nhập được. Thử lại sau.'};}
    if(r&&r.ok){SESSION=a;saveSession();location.hash=defaultPage();location.reload();return;}
    err.textContent=(r&&r.msg)||'Sai mật khẩu.';go.disabled=false;go.textContent='Đăng nhập';pw.focus();pw.select();}},
    h('div',{class:'lg-who'},h('b',null,a.name),h('span',{class:'muted small'},' · '+a.title)),f,fbShowToggle([pw]),err,go);
  openModal({title:'Đăng nhập',sub:a.name,body:[form]});
  setTimeout(()=>pw.focus(),60);
}
function fbChangePwDlg(){
  const f1=fbPwField('Mật khẩu hiện tại','fb-o','current-password'),f2=fbPwField('Mật khẩu mới (ít nhất 8 ký tự)','fb-n','new-password'),f3=fbPwField('Nhập lại mật khẩu mới','fb-n2','new-password');
  const i1=f1.querySelector('input'),i2=f2.querySelector('input'),i3=f3.querySelector('input');
  const err=h('p',{class:'small',role:'alert',style:'color:#B00020;min-height:18px;margin:8px 0 0'});
  const go=h('button',{class:'btn primary',type:'submit',style:'width:100%;margin-top:14px'},'Đổi mật khẩu');
  const form=h('form',{onsubmit:async ev=>{ev.preventDefault();err.textContent='';
    if(i2.value.length<8){err.textContent='Mật khẩu mới cần ít nhất 8 ký tự.';return;}
    if(i2.value!==i3.value){err.textContent='Hai lần nhập mật khẩu mới chưa giống nhau.';return;}
    if(i2.value===i1.value){err.textContent='Mật khẩu mới phải khác mật khẩu hiện tại.';return;}
    go.disabled=true;let r;try{r=await window.__fbChangePassword(i1.value,i2.value);}catch(e){r={ok:false,msg:'Không đổi được mật khẩu.'};}
    if(r&&r.ok){$('#modal-root').replaceChildren();toast('Đã đổi mật khẩu.','ok');return;}
    err.textContent=(r&&r.msg)||'Không đổi được mật khẩu.';go.disabled=false;}},f1,f2,f3,fbShowToggle([i1,i2,i3]),err,go);
  openModal({title:'Đổi mật khẩu',sub:SESSION?SESSION.name:'',body:[form]});
  setTimeout(()=>i1.focus(),60);
}
function fbLogout(){
  SESSION=null;saveSession();location.hash='dang-nhap';
  if(window.__fbSignOut){const done=()=>location.reload();window.__fbSignOut().then(done,done);}else render();
}
const fbPwBtn=cls=>window.__fbChangePassword?h('button',{class:cls,onclick:fbChangePwDlg},'Đổi mật khẩu'):null;"""
rep("function defaultPage(){return 'tong-quan';}",FN)

# 4. đăng xuất (2 chỗ) + nút đổi mật khẩu
rep("h('button',{class:'btn sm',onclick:()=>{SESSION=null;saveSession();location.hash='dang-nhap';render();}},icon('logout'),'Đăng xuất')",
    "fbPwBtn('btn sm'),h('button',{class:'btn sm',onclick:fbLogout},icon('logout'),'Đăng xuất')")
rep("h('button',{class:'btn',onclick:()=>{SESSION=null;saveSession();location.hash='dang-nhap';render();}},icon('logout'),'Đăng xuất')",
    "fbPwBtn('btn'),h('button',{class:'btn',onclick:fbLogout},icon('logout'),'Đăng xuất')")

# 5. toast permission-denied: chỉ khi đã đăng nhập và chỉ một lần
rep("if(e&&e.code!=='unavailable')toast('Không đọc được dữ liệu dùng chung ('",
    "if(e&&e.code!=='unavailable'&&(e.code!=='permission-denied'||(SESSION&&!Data._pd&&(Data._pd=1))))toast('Không đọc được dữ liệu dùng chung ('")

# 6. modal phải nằm trên trang đăng nhập
rep("align-items:flex-start;padding:max(20px,env(safe-area-inset-top,0px)) 16px 24px;overflow-y:auto;z-index:50}",
    "align-items:flex-start;padding:max(20px,env(safe-area-inset-top,0px)) 16px 24px;overflow-y:auto;z-index:70}")
rep(".side .brand-mark.logo{width:42px;height:42px}",
    ".side .brand-mark.logo{width:42px;height:42px}\n.lg-who{margin:0 0 12px;font-size:14.5px}.modal .field input[type=password],.modal .field input[type=text]{width:100%}")

# 7. nhật ký build
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B17','Claude','Đăng nhập bằng mật khẩu Firebase theo từng người: chọn tên trong danh sách tài khoản rồi nhập mật khẩu do trưởng phòng tạo ở Firebase; có nút Đổi mật khẩu và Đăng xuất (đăng xuất cả phiên Firebase). Bỏ khung email/mật khẩu hiện trước trang đăng nhập. Chưa đăng nhập thì không đọc kho dữ liệu nên hết báo lỗi permission-denied; nếu còn lỗi này thì chỉ báo một lần sau khi đăng nhập. Khi chạy ngoài Firebase vẫn là chế độ chọn tên không mật khẩu','Chờ thử','Trang đăng nhập đọc kho dữ liệu trước khi có người đăng nhập, bị Firebase từ chối','Nâng cấp bản Firebase kèm firebase/ v0.23.0'],
""")
open('/tmp/w/out105.html','w',encoding='utf8').write(s)
print('ok',len(s))
