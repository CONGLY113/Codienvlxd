import re,base64,sys,json
sys.path.insert(0,'/tmp/w/t')
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out92.html'
s=open('/tmp/w/out91.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:90])
    s=s.replace(old,new)
js=open('/tmp/w/p/gt3.js',encoding='utf8').read()
L=json.load(open('/tmp/w/cp/lay.json'))
T=json.load(open('/tmp/w/cp/tables.json'))
import mk3
CONST={k:v for k,_,v,_ in mk3.CONST}
SLUMP=[list(x) for x in mk3.SLUMP]
INKEYS=['mac','sut','hk','dl','xm_src','xm_bc','xm_ten','xm_lo','xm_r28','xm_rho','xm_rhox','ct_src','ct_bc','ct_ten','ct_mdl','ct_rx','ct_ra','ct_s5','da_src','da_bc','da_ten','da_loai','da_dmax','da_cl','da_rx','da_rho','da_rhov','da_nd','pg_ten','pg_lieu','pg_giam','n_vien','canh','alpha','w_c','w_d','sut_do']+['%s%d'%(a,i) for i in range(3) for a in []]
INKEYS+= ['p%s_%d'%(a,i) for a in ('3','7','28') for i in range(3)]
CPMAP={k:L['lay'][k] for k in INKEYS}
assert len(CPMAP)==len(INKEYS)==46,(len(CPMAP))
cj=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':'))
rep_js={'@@CP@@':base64.b64encode(open('/tmp/w/t2/CP.xlsx','rb').read()).decode(),
 '@@CPTAB@@':cj({'water':T['water'],'vh':T['vh'],'mrows':T['mrows'],'kd':T['kd']}),
 '@@CPCONST@@':cj(CONST),'@@CPSL@@':cj(SLUMP),'@@CPMAP@@':cj(CPMAP),'@@CPCALC@@':cj(L['calc']),'@@CPFIX@@':cj(L['fix'])}
for k,v in rep_js.items():
    assert js.count(k)==1,k
    js=js.replace(k,v)
# 1. khối GT cấp phối trước rawGT
old="const rawGT=raw=>raw&&raw.__t&&GT[raw.__t]?GT[raw.__t]:"
rep(old,js+"\n"+old)
# 2. loại mẫu
rep("['THEP_XD','Thép xây dựng',true,'Thép xây dựng'],","['THEP_XD','Thép xây dựng',true,'Thép xây dựng'],['CP_BT','Cấp phối bê tông',true,'Cấp phối bê tông'],")
# 3. form điện thoại: giá trị mặc định, ô chọn, nút liên kết phiếu vật liệu
rep("MF={id:s.id,d:Object.assign({d0:todayISO(),d1:todayISO(),tc:null,ha:null,tt:'',dv:[]},pick||{})};}","MF={id:s.id,d:Object.assign({d0:todayISO(),d1:todayISO(),tc:null,ha:null,tt:'',dv:[]},(G&&G.defaults)||{},pick||{})};}")
rep("return h('label',null,l,num_(k));};",
"""if(kd==='sel')return h('label',null,l,h('select',{onchange:e=>{d[k]=e.target.value||null;save();upd();}},[['','Chọn…']].concat(G.opts[k].map(x=>[x,x])).map(o=>h('option',{value:o[0],selected:(d[k]||'')===o[0]},o[1]))));
    if(kd==='numsel')return h('label',null,l,h('select',{onchange:e=>{d[k]=e.target.value===''?null:+e.target.value;save();upd();}},[['','Chọn…']].concat(G.opts[k].map(x=>[String(x[0]),x[1]])).map(o=>h('option',{value:o[0],selected:String(d[k]==null?'':d[k])===o[0]},o[1]))));
    return h('label',null,l,num_(k));};""")
rep("c.g.map(([gt,fs])=>h('div',{class:'mf-g'},","c.node?c.node(d,()=>{save();render();},s):null,c.g.map(([gt,fs])=>h('div',{class:'mf-g'},")
# 4. kiểm tra file nộp: đối chiếu số liệu với phiếu vật liệu nguồn
rep("  for(let r=5;r<=20;r++){if(K['C'+r]==='LƯU Ý')add(","  if(G.verify)G.verify(raw,sample).forEach(c=>add(c.label,c.state,c.note));\n  for(let r=5;r<=20;r++){if(K['C'+r]==='LƯU Ý')add(")
rep("for(let r=5;r<=20;r++){if(K['C'+r]==='LƯU Ý')add('Lưu ý khi kiểm tra: '+(K['B'+r]||'mục '+(r-4)),'warn',K['D'+r]||'');}","for(let r=5;r<=20;r++){if(K['C'+r]==='LƯU Ý'&&!checks.some(c=>c.label==='Lưu ý khi kiểm tra: '+(K['B'+r]||'mục '+(r-4))))add('Lưu ý khi kiểm tra: '+(K['B'+r]||'mục '+(r-4)),'warn',K['D'+r]||'');}")
# 5. phiếu xem trước: thân phiếu riêng
rep("    G?h('table',null,h('thead',null,h('tr',null,G.head.map(x=>h('th',null,x)))),","    G&&G.body?G.body(r):G?h('table',null,h('thead',null,h('tr',null,G.head.map(x=>h('th',null,x)))),")
# 6. build
rep("const BUILD='0.9.1 · 04/11/2026';","const BUILD='0.10.0 · 04/11/2026';")
row=" ['04/11/2026','B4','Claude','Thêm loại Cấp phối bê tông (BM-CP-01): thiết kế thành phần 1 m³ theo phương pháp thể tích tuyệt đối đúng file Excel cấp phối của phòng (bảng nước theo độ sụt, Dmax, Mđl; hệ số A, A1; hiệu chỉnh khi xi măng trên 400 kg; bảng hệ số dư vữa Kd), mẻ trộn thử theo độ ẩm cát đá, nén mẫu 3, 7, 28 ngày. Số liệu xi măng, cát, đá lấy từ phiếu đã phát hành (chọn mã mẫu, tự điền, kiểm tra lệch khi nộp); khối lượng riêng đá, khối lượng thể tích hạt và phụ gia nhập tay. Kiểm tra: file gốc của phòng và chương trình Python độc lập khớp trên 60 bộ số ngẫu nhiên; biểu mẫu mới khớp Python trên 48 bộ số; tính lại trong app khớp biểu mẫu mới trên 106 bộ số kể cả ô trống và ngoài bảng; chạy toàn luồng trên Chrome với CSDL giả, hồ sơ nộp và phiếu A4 tính lại bằng LibreOffice khớp 100%','Chờ thử','Dòng phụ gia trên phiếu vẫn hiện số thứ tự khi không dùng phụ gia; ô chọn phiếu nguồn dính chữ với tiêu đề. Ô nguồn gốc mẫu trên phiếu Excel lệch dòng, có sẵn ở các phiếu cũ, chưa sửa','Đã sửa hai lỗi đầu. Các hệ số k1 = 0,89, k2 = 0,90, cộng thêm 1 kg cát, hệ số đổi 10,197, tỷ số 1,035/0,77 lấy từ file cũ, tên phương pháp thử TCVN 3105, 3106, 3118:2022 do tôi đặt tạm, cần phòng xác nhận','0.10.0'],\n"
# sửa dòng nhật ký 0.9.1 bị lệch cột (9 phần tử thay vì 8)
import re
k0=s.index(" ['04/11/2026','B3','Claude','Thêm 9 loại mẫu")
k1=s.index("\n",k0)
line=s[k0:k1]
items=line.strip()[1:-2].split("','")
assert len(items)==9,len(items)
items[0]=items[0].lstrip("'")
items[-1]=items[-1].rstrip("'")
newl=" ['"+"','".join([items[0],items[1],items[2],items[3]+'. Kiểm tra: '+items[5],items[4],items[6],items[7],items[8]])+"'],"
s=s[:k0]+newl+s[k1:]
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
rep("window.__ptn={loaiOf,","window.__ptn={rcCP,cpVals,cpCands,cpFill,cpBody,CP_T,CP_K,loaiOf,")
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
