let LGROOM=null;
const LG_INFO={
  co:{ten:'Cơ điện vật liệu xây dựng',sub:'Phòng thí nghiệm chuyên ngành xây dựng',h1:['Phòng thí nghiệm ','chuyên ngành xây dựng'],steps:['Nhận mẫu','Thử nghiệm','Phát hành','Thanh toán'],ids:['NS009','NS011','NS001','NS002','NS003','NS004','NS007','NS008']},
  kd:{ten:'Kiểm định Hiệu chuẩn đo lường',sub:'Phòng Kiểm định Hiệu chuẩn đo lường',h1:['Phòng Kiểm định ','Hiệu chuẩn đo lường'],steps:['Báo giá','Bảng kê','Thanh toán','Công nợ'],ids:['NS014','NS015']},
  hs:{ten:'Hóa sinh môi trường',sub:'Phòng thử nghiệm Hóa sinh môi trường',h1:['Phòng thử nghiệm ','Hóa sinh môi trường'],steps:['Báo giá','Bảng kê','Thanh toán','Công nợ'],ids:['NS016','NS017']}};
const LG_SHARED=['NS010','NS012','NS013'];
pages['dang-nhap']={public:true,render(root){
  const hc=h('div',{class:'lg-hc'}),list=h('div',{class:'lg-list'}),cardH=h('div',{class:'lg-card-h'}),side=h('div',{class:'lg-side'}),brandTag=h('div',{class:'lg-room','aria-live':'polite'});
  const paintHero=r=>{const i=LG_INFO[r];brandTag.replaceChildren(h('span',null,i?i.sub:'Chọn phòng ở khung bên phải'));brandTag.classList.toggle('on',!!i);
    hc.replaceChildren(brandTag,h('h1',null,...(i?[i.h1[0],h('em',null,i.h1[1])]:['Chọn phòng ',h('em',null,'để đăng nhập')])),h('div',{class:'lg-steps'},(i?i.steps:['Báo giá','Bảng kê','Thanh toán','Thử nghiệm']).map((t,n)=>h('span',{class:'lg-step'},h('i',null,'0'+(n+1)),t))));};
  const loginAs=a=>{setWroom(LGROOM);if(window.__fbLogin){fbPwDlg(a);return;}SESSION=a;saveSession();location.hash=defaultPage();render();};
  const stepRoom=()=>{LGROOM=null;paintHero(null);cardH.replaceChildren(h('h2',null,'Chọn phòng'),h('p',null,'Mỗi phòng có không gian làm việc và dữ liệu riêng.'));
    list.replaceChildren(h('div',{class:'lg-rooms'},Object.keys(LG_INFO).map(k=>h('button',{class:'acc lg-roombtn',type:'button','data-room':k,onmouseenter:()=>paintHero(k),onfocus:()=>paintHero(k),onmouseleave:()=>paintHero(null),onclick:()=>{LGROOM=k;stepName();}},h('i',{class:'lg-av','aria-hidden':'true',style:'background:hsl('+({co:172,kd:205,hs:145})[k]+' 70% 90%);color:hsl('+({co:172,kd:205,hs:145})[k]+' 65% 24%)'},({co:'CĐ',kd:'KĐ',hs:'HS'})[k]),h('span',{class:'lg-tx'},h('b',null,LG_INFO[k].ten),h('span',{class:'lg-ti'},k==='co'?'Phòng thí nghiệm chuyên ngành xây dựng':'Báo giá, bảng kê, thanh toán'))))));
    cta.hidden=false;};
  const q=h('input',{type:'search',class:'lg-search',placeholder:'Tìm tên','aria-label':'Tìm tài khoản',autocomplete:'off',spellcheck:'false'});
  const cta=h('a',{class:'lg-cta',href:'#khach-hang'},'Tôi là khách hàng: gửi yêu cầu thử nghiệm',h('span',{'aria-hidden':'true'},'→'));
  const stepName=()=>{const i=LG_INFO[LGROOM];paintHero(LGROOM);q.value='';
    cardH.replaceChildren(h('button',{class:'lg-back',type:'button','data-act':'lg-back',onclick:stepRoom},'← Đổi phòng'),h('h2',null,i.ten),h('p',null,'Chọn tên của bạn để vào'));
    const accs=i.ids.concat(LG_SHARED).map(id=>ACCOUNTS.find(a=>a.id===id)).filter(Boolean),tiles=[],empty=h('p',{class:'lg-empty',hidden:true},'Không có tên khớp từ khóa.');
    const grid=h('div',{class:'acc-grid'},accs.map(a=>{const v=lgAv(a.name),b=h('button',{class:'acc',type:'button','aria-label':'Đăng nhập: '+a.name,onclick:()=>loginAs(a)},h('i',{class:'lg-av','aria-hidden':'true',style:'background:hsl('+v.hue+' 75% 91%);color:hsl('+v.hue+' 65% 26%)'},v.ini),h('span',{class:'lg-tx'},h('b',null,a.name)));tiles.push([b,bkNorm(a.name)]);return b;}));
    q.oninput=()=>{const k=bkNorm(q.value);let n=0;tiles.forEach(([b,t])=>{const on=!k||t.includes(k);b.hidden=!on;if(on)n++;});empty.hidden=n>0;};
    list.replaceChildren(q,h('div',{style:'margin-top:12px'},grid,empty));cta.hidden=LGROOM!=='co';};
  const noteTx=window.__fbLogin?'Chọn tên của mình rồi nhập mật khẩu do trưởng phòng cấp. Quên mật khẩu: báo trưởng phòng đặt lại. ':'Chế độ chạy thử: chọn một tên để vào, chưa có mật khẩu. Vai trò hiện là tạm, chỉ để thử luồng. ';
  side.append(h('div',{class:'lg-card'},cardH,list),cta,h('p',{class:'lg-note'},noteTx,h('span',null,'Phiên bản '+BUILD)));
  root.append(h('div',{class:'lg'},h('div',{class:'lg-in'},
    h('div',{class:'lg-hero'},
      h('img',{class:'lg-bg',src:LG_BG_S,srcset:LG_BG_S+' 720w, '+LG_BG_L+' 1448w',sizes:'(max-width:900px) 100vw, 56vw',alt:'Trụ sở Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng Quảng Trị',decoding:'async',fetchpriority:'high'}),
      h('div',{class:'lg-scrim','aria-hidden':'true'}),
      h('div',{class:'lg-brand'},h('img',{class:'lg-logo',src:LOGO_L,alt:LOGO_ALT,width:72,height:72}),h('div',null,h('small',null,'Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng'),h('b',null,'Quảng Trị'))),hc),side)));
  stepRoom();
}};
