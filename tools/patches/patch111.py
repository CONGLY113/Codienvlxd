import re
H='app/quan-ly-mau-thu-nghiem.html';P='tools/patches/'
s=open(H,encoding='utf8').read()
def rep(a,b,cnt=1):
    global s
    assert s.count(a)==cnt,(s.count(a),a[:80])
    s=s.replace(a,b)
# 1. đăng nhập mới
i=s.index("pages['dang-nhap']={public:true,render(root){");j=s.index("function defaultPage()")
s=s[:i]+open(P+'login3.js',encoding='utf8').read()+s[j:]
rep(".lg-steps{display:flex;",".lg-rooms{display:flex;flex-direction:column;gap:10px;margin-top:16px}\n.lg .lg-roombtn{width:100%;padding:14px 16px}\n.lg .lg-roombtn .lg-ti{display:block;font-size:12.5px;color:#52667A;margin-top:2px}\n.lg-back{border:0;background:none;color:#1A6FB0;font:600 13px/1 inherit;font-family:inherit;cursor:pointer;padding:0 0 8px}\n.lg-back:hover{text-decoration:underline}\n.lg-steps{display:flex;")
# 2. module
rep("const DV={gia:{},cfg:{},kh:[]};","const DV={gia:{},cfg:{},kh:[],tb:[],cc:[]};")
rep("  Data.watch('dv_kh',list=>{DV.kh=list;schedule();});","  Data.watch('dv_kh',list=>{DV.kh=list;schedule();});\n  Data.watch('dv_tb',list=>{DV.tb=list;schedule();});\n  Data.watch('dv_cc',list=>{DV.cc=list;schedule();});")
rep("return v==null||v===''?10:+v;","return v==null||v===''?0:+v;")
# bỏ dvCert cũ
a=s.index("/* ---- giấy chứng nhận: tra cứu theo số */\nfunction dvCert(box){");b=s.index("/* ---- bảng giá */\nfunction dvPrices")
s=s[:a]+s[b:]
rep("const dvRoomsFor=(kind)=>dvViewRooms().filter(r=>kind==='bg'||r!=='co');\nconst dvScope=(kind)=>{const rs=dvRoomsFor(kind);return DVS.room&&rs.includes(DVS.room)?[DVS.room]:rs;};",
    "const dvRoomsFor=(kind)=>dvViewRooms().filter(r=>r===wroom()&&(kind==='bg'||r!=='co'));\nconst dvScope=(kind)=>dvRoomsFor(kind);")
rep("const rs=dvViewRooms(),mangs=rs.flatMap(r=>DV_ROOM[r].mang),adm=dvAdmin();","const rs=dvViewRooms().filter(r=>r===wroom()),mangs=rs.flatMap(r=>DV_ROOM[r].mang),adm=dvAdmin();")
rep("const rooms=dvLapRooms().filter(r=>kind==='bg'||r!=='co');if(!rooms.length)","const rooms=dvLapRooms().filter(r=>r===wroom()&&(kind==='bg'||r!=='co'));if(!rooms.length)")
rep("const canNew=dvLapRooms().filter(r=>kind==='bg'||r!=='co').length>0;","const canNew=dvLapRooms().filter(r=>r===wroom()&&(kind==='bg'||r!=='co')).length>0;")
rep("if(DVS.uid!==(SESSION&&SESSION.id)){DVS.uid=SESSION&&SESSION.id;","if(DVS.uid!==(SESSION&&SESSION.id+'|'+wroom())){DVS.uid=SESSION&&SESSION.id+'|'+wroom();")
rep("root.append(pageHead('Bảng kê và báo giá dịch vụ','Phòng Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường lập bảng kê trực tiếp; cả ba phòng lập báo giá. Bảng kê: thủ quỹ soát xét, kế toán trưởng duyệt. Báo giá: trưởng phòng duyệt.'));\n  const rs=dvViewRooms();\n  if(rs.length>1&&!DVS.draft){const sel=h('select',{'aria-label':'Phòng',style:'max-width:320px',onchange:e=>{DVS.room=e.target.value;render();}},h('option',{value:''},'Tất cả các phòng'),rs.map(r=>h('option',{value:r},dvRoomName(r))));sel.value=DVS.room;root.append(h('div',{class:'row',style:'margin-bottom:8px'},sel));}\n",
    "root.append(pageHead('Bảng kê và báo giá dịch vụ',WR_NAME[wroom()]+'. '+(bkOk?'Bảng kê: thủ quỹ soát xét, kế toán trưởng duyệt. ':'Bảng kê của phòng này lập ở trang Thanh toán. ')+'Báo giá: trưởng phòng duyệt.'));\n")
# 3. module e chèn trước NAV
mod=open(P+'dv_e.js',encoding='utf8').read()
rep("/* ===== HẾT MODULE ===== */\n","/* ===== HẾT MODULE ===== */\n"+mod+"\n")
# 4. NAV theo phòng
rep(" {k:'cai-dat',t:'Cài đặt',show:()=>hasRole('tp')}];"," {k:'cai-dat',t:'Cài đặt',show:()=>hasRole('tp')}];\nNAV.forEach(n=>{if(!['tong-quan','thong-bao','luu-tru','thiet-bi','dich-vu'].includes(n.k)){const o=n.show;n.show=()=>wroom()==='co'&&o();}});")
# 5. thanh bên, chỉ hiện tên
rep("h('div',{class:'brand'},logoMark(),h('div',null,h('b',null,'Phòng thí nghiệm VLXD'),h('span',null,'Quảng Trị · '+BUILD))),\n      h('nav'","h('div',{class:'brand'},logoMark(),h('div',null,h('b',null,WR_NAME[wroom()]),h('span',null,'Quảng Trị · '+BUILD))),\n      h('nav'")
rep("h('div',{class:'me'},h('div',null,h('b',null,SESSION.name),h('span',{class:'muted small'},SESSION.title)),h('div',{class:'roles'},SESSION.roles.map(r=>h('span',{class:'pill role'},ROLE_NAME[r]))),\n","h('div',{class:'me'},h('div',null,h('b',null,SESSION.name)),\n")
rep("h('div',{class:'who'},h('b',null,SESSION.name),h('span',{class:'muted small'},SESSION.title)),\n        h('div',{class:'roles'},SESSION.roles.map(r=>h('span',{class:'pill role'},ROLE_NAME[r]))),\n","h('div',{class:'who'},h('b',null,SESSION.name),h('span',{class:'muted small'},WR_NAME[wroom()])),\n")
rep("h('span',null,'PTN VLXD · '+BUILD)","h('span',null,WR_NAME[wroom()]+' · '+BUILD)")
# 6. setSession test: đặt lại phòng; export
rep("setSession:id=>{SESSION=ACCOUNTS.find(a=>a.id===id)||null;saveSession();}","setSession:id=>{SESSION=ACCOUNTS.find(a=>a.id===id)||null;saveSession();setWroom(null);},setWroom,wroom,dvEquip,dvTbImport,dvCcImport")
rep("const BUILD='0.27.0 · 06/11/2026'","const BUILD='0.27.1 · 06/11/2026'")
rep("Thuế GTGT mặc định 10 phần trăm (chỉnh được)","Thuế GTGT mặc định 0 phần trăm (chỉnh được)")
e="['06/11/2026','B22','Claude','Mỗi phòng một không gian riêng: đăng nhập chọn phòng trước rồi chọn tên (chỉ hiện tên). Sau đăng nhập, tên phòng hiện ở thanh bên; phòng Kiểm định Hiệu chuẩn và Hóa sinh có Tổng quan, Thiết bị, Hồ sơ lưu trữ riêng, không lẫn dữ liệu phòng VLXD. Thiết bị và giấy chứng nhận tải lên từ Excel (tiêu đề giống nhau ba phòng). Thuế GTGT mặc định 0 phần trăm','Chờ thử','Dữ liệu thiết bị, hồ sơ của phòng VLXD hiện cả ở phòng khác; đăng nhập chung','Tiêu đề file tải lên giấy chứng nhận: Số giấy chứng nhận, Ngày cấp, Hạn hiệu lực, Khách hàng, Nội dung, Số bảng kê, Liên kết'],\n"
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+e)
open(H,'w',encoding='utf8').write(s);print('ok')
