H='app/quan-ly-mau-thu-nghiem.html'
s=open(H,encoding='utf8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:90])
    s=s.replace(a,b)
# 1. tài khoản
rep(" {id:'NS014',name:'Phan Thanh Hà'"," {id:'NS018',name:'Phan Thanh Giàn',title:'Phó giám đốc',roles:['pd']},\n {id:'NS014',name:'Phan Thanh Hà'")
rep("return hasRole('pd')?'Giám đốc':'';}","return hasRole('pd')?(SESSION.title==='Phó giám đốc'?'Phó giám đốc':'Giám đốc'):'';}")
# 2. đơn vị dùng chung, tên thương hiệu, chuyển phòng xem
rep("const wrRooms=a=>","const WR_UNIT={NS010:'bgd',NS018:'bgd',NS012:'hc',NS013:'hc'};\nconst UNIT_NAME={bgd:'Ban Giám đốc',hc:'Phòng Hành chính tổng hợp'};\nconst brandName=()=>SESSION&&WR_UNIT[SESSION.id]?UNIT_NAME[WR_UNIT[SESSION.id]]:WR_NAME[wroom()];\nfunction wrSwitch(){if(!SESSION||wrRooms(SESSION).length<2)return null;const sel=h('select',{'aria-label':'Xem phòng','data-act':'wr-sw',onchange:e=>{setWroom(e.target.value);location.hash='tong-quan';render();}},wrRooms(SESSION).map(r=>h('option',{value:r},WR_NAME[r])));sel.value=wroom();return h('label',{class:'wr-sw'},h('span',null,'Đang xem phòng'),sel);}\nconst wrRooms=a=>")
rep(".lg-rooms{display:flex;",".wr-sw{display:flex;flex-direction:column;gap:4px;margin:2px 0 10px;font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#52667A)}\n.wr-sw select{font:500 13px inherit;font-family:inherit;text-transform:none;letter-spacing:0;padding:8px 10px;border-radius:10px;border:1px solid #D5E0EA;background:#fff;color:#10222F}\n.lg-sec{margin:14px 2px 8px;font-size:11px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;color:#52667A}\n.lg-rooms3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}\n.lg .lg-blk{flex-direction:column;text-align:center;justify-content:flex-start;padding:16px 8px 14px;gap:10px;width:100%}\n.lg .lg-blk .lg-tx{align-items:center}\n.lg .lg-blk .lg-ti{display:block;font-size:11.5px;color:#52667A;margin-top:3px;line-height:1.35}\n.lg .lg-blk .lg-av{width:46px;height:46px;border-radius:14px;font-size:14px}\n.lg .lg-wide{width:100%}\n@media(max-width:480px){.lg-rooms3{grid-template-columns:1fr}.lg .lg-blk{flex-direction:row;text-align:left}}\n.lg-rooms{display:flex;")
rep("h('div',{class:'brand'},logoMark(),h('div',null,h('b',null,WR_NAME[wroom()]),h('span',null,'Quảng Trị · '+BUILD))),\n      h('nav'","h('div',{class:'brand'},logoMark(),h('div',null,h('b',null,brandName()),h('span',null,'Quảng Trị · '+BUILD))),\n      wrSwitch(),\n      h('nav'")
rep("h('span',{class:'muted small'},WR_NAME[wroom()])),\n","h('span',{class:'muted small'},brandName())),\n        wrSwitch(),\n")
rep("h('span',null,WR_NAME[wroom()]+' · '+BUILD)","h('span',null,brandName()+' · '+BUILD)")
# 3. trang đăng nhập 5 khối
a=s.index("let LGROOM=null;");b=s.index("pages['dang-nhap']={public:true,render(root){")
s=s[:a]+"""let LGROOM=null;
const LG_INFO={
  bgd:{ten:'Ban Giám đốc',sub:'Ban Giám đốc',ini:'BGĐ',hue:262,h1:['Ban ','Giám đốc'],steps:['Theo dõi','Phê duyệt','Báo giá','Công nợ'],ids:['NS010','NS018'],note:'Giám đốc, Phó giám đốc'},
  co:{ten:'Cơ điện vật liệu xây dựng',sub:'Phòng thí nghiệm chuyên ngành xây dựng',ini:'CĐ',hue:172,h1:['Phòng thí nghiệm ','chuyên ngành xây dựng'],steps:['Nhận mẫu','Thử nghiệm','Phát hành','Thanh toán'],ids:['NS009','NS011','NS001','NS002','NS003','NS004','NS007','NS008']},
  kd:{ten:'Kiểm định Hiệu chuẩn đo lường',sub:'Phòng Kiểm định Hiệu chuẩn đo lường',ini:'KĐ',hue:205,h1:['Phòng Kiểm định ','Hiệu chuẩn đo lường'],steps:['Báo giá','Bảng kê','Thanh toán','Công nợ'],ids:['NS014','NS015']},
  hs:{ten:'Hóa sinh môi trường',sub:'Phòng thử nghiệm Hóa sinh môi trường',ini:'HS',hue:145,h1:['Phòng thử nghiệm ','Hóa sinh môi trường'],steps:['Báo giá','Bảng kê','Thanh toán','Công nợ'],ids:['NS016','NS017']},
  hc:{ten:'Phòng Hành chính tổng hợp',sub:'Phòng Hành chính tổng hợp',ini:'HC',hue:28,h1:['Phòng Hành chính ','tổng hợp'],steps:['Soát xét','Duyệt bảng kê','Thu tiền','Công nợ'],ids:['NS013','NS012']}};
"""+s[b:]
a=s.index("  const stepRoom=()=>{LGROOM=null;");b=s.index("  const q=h('input',{type:'search',class:'lg-search'")
s=s[:a]+"""  const blk=(k,wide)=>{const i=LG_INFO[k],c='hsl('+i.hue+' 70% 90%)',t='hsl('+i.hue+' 65% 24%)';
    return h('button',{class:'acc '+(wide?'lg-wide':'lg-blk'),type:'button','data-room':k,onmouseenter:()=>paintHero(k),onfocus:()=>paintHero(k),onmouseleave:()=>paintHero(null),onclick:()=>{LGROOM=k;stepName();}},
      h('i',{class:'lg-av','aria-hidden':'true',style:'background:'+c+';color:'+t},i.ini),h('span',{class:'lg-tx'},h('b',null,i.ten),h('span',{class:'lg-ti'},i.note||(k==='co'?'Phòng thí nghiệm chuyên ngành xây dựng':k==='hc'?'Thủ quỹ, kế toán trưởng':'Báo giá, bảng kê, thanh toán'))));};
  const stepRoom=()=>{LGROOM=null;paintHero(null);cardH.replaceChildren(h('h2',null,'Chọn đơn vị'),h('p',null,'Mỗi phòng có không gian làm việc và dữ liệu riêng.'));
    list.replaceChildren(blk('bgd',true),h('div',{class:'lg-sec'},'Phòng chuyên môn'),h('div',{class:'lg-rooms3'},['co','kd','hs'].map(k=>blk(k))),h('div',{style:'height:10px'}),blk('hc',true));
    cta.hidden=false;};
"""+s[b:]
s=s.replace("const loginAs=a=>{setWroom(LGROOM);","const loginAs=a=>{setWroom(WR_NAME[LGROOM]?LGROOM:'co');")
s=s.replace("const accs=i.ids.concat(LG_SHARED).map(","const accs=i.ids.map(")
s=s.replace("const LG_SHARED=['NS010','NS012','NS013'];\n","")
s=s.replace("'Chế độ chạy thử: chọn một tên để vào","'Chế độ chạy thử: chọn đơn vị rồi chọn một tên để vào")
rep("const BUILD='0.27.1 · 06/11/2026'","const BUILD='0.27.2 · 06/11/2026'")
e="['06/11/2026','B23','Claude','Trang đăng nhập chia 5 khối: Ban Giám đốc (Lưu Minh Tuấn, Phan Thanh Giàn), ba phòng chuyên môn, Phòng Hành chính tổng hợp (Trần Hoàn, Hồ Thị Bích Thủy). Thêm tài khoản Phó giám đốc (quyền như Giám đốc). Người ở Ban Giám đốc và Hành chính tổng hợp chọn xem từng phòng ở thanh bên','Chờ thử','Giám đốc, thủ quỹ, kế toán trưởng nằm lẫn trong danh sách từng phòng','NS018 là mã tạm; tên Phan Thanh Giàn theo đúng chữ anh nhập'],\n"
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+e)
open(H,'w',encoding='utf8').write(s)
r=open('firebase/firestore.rules',encoding='utf8').read()
r=r.replace("'ns017@ptn-vlxd.vn'           // Hoàng Thị Châu (mã tạm)","'ns017@ptn-vlxd.vn',          // Hoàng Thị Châu (mã tạm)\n        'ns018@ptn-vlxd.vn'           // Phan Thanh Giàn, Phó giám đốc (mã tạm)")
assert 'ns018' in r;open('firebase/firestore.rules','w',encoding='utf8').write(r)
g=open('firebase/HUONG_DAN_TRIEN_KHAI.md',encoding='utf8').read()
g=g.replace("| NS017 Hoàng Thị Châu (giao nhận mẫu, mã tạm) | `ns017@ptn-vlxd.vn` |\n","| NS017 Hoàng Thị Châu (giao nhận mẫu, mã tạm) | `ns017@ptn-vlxd.vn` |\n| NS018 Phan Thanh Giàn (Phó giám đốc, mã tạm) | `ns018@ptn-vlxd.vn` |\n")
g=g.replace('15 email','16 email').replace('đủ 15 người dùng','đủ 16 người dùng').replace('bản 0.27.1','bản 0.27.2').replace('Có 4 email mới cần tạo trong Authentication: `ns014`, `ns015`, `ns016`, `ns017@ptn-vlxd.vn`','Có 5 email mới cần tạo trong Authentication: `ns014` đến `ns018@ptn-vlxd.vn`')
g=g.replace("- Trang đăng nhập chọn phòng trước (Cơ điện vật liệu xây dựng, Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường), rồi chọn tên.","- Trang đăng nhập có 5 khối: Ban Giám đốc, ba phòng chuyên môn (Cơ điện vật liệu xây dựng, Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường), Phòng Hành chính tổng hợp; chọn khối rồi chọn tên.")
open('firebase/HUONG_DAN_TRIEN_KHAI.md','w',encoding='utf8').write(g)
print('ok')
