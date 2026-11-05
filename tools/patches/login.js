/* ---- 0.20.0: logo đơn vị và trang đăng nhập */
const LOGO_L='data:image/webp;base64,@@L@@';
const LOGO_S='data:image/webp;base64,@@S@@';
const LOGO_ALT='Logo Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng Quảng Trị';
const logoMark=()=>h('div',{class:'brand-mark logo'},h('img',{src:LOGO_S,alt:LOGO_ALT,width:34,height:34}));
try{const lk=document.createElement('link');lk.rel='icon';lk.type='image/webp';lk.href=LOGO_S;document.head.append(lk);}catch(e){}
const lgAv=name=>{const p=String(name).trim().split(/\s+/),ini=(p.length>1?p[p.length-2].charAt(0)+p[p.length-1].charAt(0):p[0].slice(0,2)).toUpperCase();let k=0;for(const c of String(name))k=(k*31+c.charCodeAt(0))%6;return{ini,hue:[205,172,262,28,340,145][k]};};
pages['dang-nhap']={public:true,render(root){
  const groups=[['Điều hành',ACCOUNTS.filter(a=>a.roles.some(r=>['tp','pd'].includes(r)))],['Tiếp nhận, soát xét',ACCOUNTS.filter(a=>!a.roles.some(r=>['tp','pd','tn'].includes(r))&&a.roles.some(r=>['tiepnhan','sx'].includes(r)))],['Cán bộ thử nghiệm, giao nhận mẫu',ACCOUNTS.filter(a=>a.roles.includes('tn')&&!a.roles.some(r=>['tp','pd'].includes(r)))],['Thủ quỹ, kế toán trưởng',ACCOUNTS.filter(a=>a.roles.some(r=>['tq','ktt'].includes(r)))]];
  const tiles=[],empty=h('p',{class:'lg-empty',hidden:true},'Không có tài khoản khớp từ khóa.');
  const q=h('input',{type:'search',class:'lg-search',placeholder:'Tìm theo tên hoặc chức danh','aria-label':'Tìm tài khoản',autocomplete:'off',spellcheck:'false'});
  const secs=groups.map(([t,list])=>{
    const grid=h('div',{class:'acc-grid'},list.map(a=>{const v=lgAv(a.name);
      const b=h('button',{class:'acc',type:'button','aria-label':'Đăng nhập: '+a.name+', '+a.title,onclick:()=>{SESSION=a;saveSession();location.hash=defaultPage();render();}},
        h('i',{class:'lg-av','aria-hidden':'true',style:'background:hsl('+v.hue+' 75% 91%);color:hsl('+v.hue+' 65% 26%)'},v.ini),
        h('span',{class:'lg-tx'},h('b',null,a.name),h('span',{class:'lg-ti'},a.title),h('span',{class:'lg-rl'},a.roles.slice(0,2).map(r=>h('em',null,ROLE_NAME[r])),a.roles.length>2?h('em',{class:'more',title:a.roles.slice(2).map(r=>ROLE_NAME[r]).join(', ')},'+'+(a.roles.length-2)):null)));
      tiles.push([b,bkNorm(a.name+' '+a.title+' '+a.roles.map(r=>ROLE_NAME[r]).join(' '))]);return b;}));
    return h('section',{class:'lg-grp'},h('h3',null,t),grid);});
  q.addEventListener('input',()=>{const k=bkNorm(q.value);let n=0;tiles.forEach(([b,t])=>{const on=!k||t.includes(k);b.hidden=!on;if(on)n++;});
    secs.forEach(s=>{s.hidden=!Array.from(s.querySelectorAll('.acc')).some(b=>!b.hidden);});empty.hidden=n>0;});
  const step=(n,t,d)=>h('div',{class:'lg-step'},h('span',null,n),h('b',null,t),h('small',null,d));
  root.append(h('div',{class:'lg'},h('div',{class:'lg-in'},
    h('div',{class:'lg-hero'},
      h('div',{class:'lg-brand'},h('img',{class:'lg-logo',src:LOGO_L,alt:LOGO_ALT,width:96,height:96}),h('div',null,h('small',null,'Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng'),h('b',null,'Quảng Trị'))),
      h('h1',null,'Phòng thí nghiệm ',h('em',null,'chuyên ngành xây dựng')),
      h('p',{class:'lg-sub'},'Quản lý toàn bộ quy trình thí nghiệm vật liệu xây dựng: nhận mẫu, giao việc, nhập số liệu, soát xét, phát hành phiếu kết quả và bảng kê thanh toán.'),
      h('div',{class:'lg-steps'},step('01','Nhận mẫu','Tiếp nhận, mã hóa, giao việc'),step('02','Thử nghiệm','Biểu mẫu Excel, tự tính, soát xét'),step('03','Phát hành','Phiếu kết quả có mã QR tra cứu'),step('04','Thanh toán','Bảng kê, QR ngân hàng, tổng hợp')),
      h('a',{class:'lg-cta',href:'#khach-hang'},'Tôi là khách hàng: gửi yêu cầu thử nghiệm',h('span',{'aria-hidden':'true'},'→')),
      h('p',{class:'lg-note'},'Chế độ chạy thử: chọn một tài khoản để vào, chưa có mật khẩu. Vai trò hiện là tạm, chỉ để thử luồng. ',h('span',null,'Phiên bản '+BUILD))),
    h('div',{class:'lg-card'},h('div',{class:'lg-card-h'},h('h2',null,'Chọn tài khoản để vào'),h('p',null,'Tài khoản thử nghiệm của phòng')),q,h('div',{class:'lg-list'},secs,empty)))));
}};
