import re,base64,sys
SRC='/mnt/attach/outputs/Quản_lý_mẫu_thử_nghiệm_0_9_0.html'
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out91.html'
s=open(SRC,encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:80])
    s=s.replace(old,new)
js=open('/tmp/w/p/gt2.js',encoding='utf8').read()
files={'DA1040':'DA1040','DG':'DG','LN1':'LN1','LN2':'LN2','LN3':'LN3','GDAC':'GDAC','G2L':'G2L','G6L':'G6L','TX':'TX'}
for k,f in files.items():
    b=base64.b64encode(open('/tmp/w/t2/%s.xlsx'%f,'rb').read()).decode()
    assert '@@%s@@'%k in js; js=js.replace('@@%s@@'%k,b)
# fix: secL khong co live thi null
js=js.replace("const secL=(t,s,g,fn)=>sec1(t,s,g,fn?(d=>fn(d)):null);","const secL=(t,s,g,fn)=>sec1(t,s,g,fn||null);")
# 1. chen khoi gt2 truoc rawGT
old="const rawGT=raw=>raw&&raw.dm_m0!==undefined?GT.XM_PCB40:(raw&&(raw.a_0!==undefined||raw.tk_0!==undefined)?GT.THEP_HINH:null);"
rep(old,js+"\nconst rawGT=raw=>raw&&raw.__t&&GT[raw.__t]?GT[raw.__t]:(raw&&raw.dm_m0!==undefined?GT.XM_PCB40:(raw&&(raw.a_0!==undefined||raw.tk_0!==undefined)?GT.THEP_HINH:null));")
# 2. analyzeUploadGT: danh dau loai, tra ve thanh phan hat
rep("const rc=G.rc(raw),exp=G.expect(rc),ek=Object.keys(exp).filter(k=>exp[k]!=null);","raw.__t=G.code;const rc=G.rc(raw),exp=G.expect(rc),ek=Object.keys(exp).filter(k=>exp[k]!=null);")
rep("results:hasCache?G.results(rc,raw):{},raw,sieve:null,devs:[],d0,d1,nhiet_do:tc,do_am:ha,tinh_trang:T.B27,hao_hut:null};}","results:hasCache?G.results(rc,raw):{},raw,sieve:(hasCache&&G.sieve)?G.sieve(rc,raw):null,devs:[],d0,d1,nhiet_do:tc,do_am:ha,tinh_trang:T.B27,hao_hut:(G.sieve&&rc.loss!=null)?rc.loss:null};}")
# 3. phieu xem truoc: bang thanh phan hat cho loai GT co sieve
rep("const sv=(DAp||s.chi_tieu.includes('CAT_05'))?((s.nop&&s.nop.sieve)||[]):[];","const sv=(DAp||(G&&G.sieve)||s.chi_tieu.includes('CAT_05'))?((s.nop&&s.nop.sieve)||[]):[];")
rep("h('td',{class:'c'},x.sang?String(x.sang).replace('.',','):(DAp?'< 5':'< 0,14'))","h('td',{class:'c'},x.lab||(x.sang?String(x.sang).replace('.',','):(DAp?'< 5':'< 0,14')))")
# 4. recheck: rkeys co the la ham
rep("(G?G.rkeys:DA?['sc','rx','la','td','nd','dmax','dmin']:['sc','rx','ra','s5','mdl'])","(G?(typeof G.rkeys==='function'?G.rkeys(n.raw,rc):G.rkeys):DA?['sc','rx','la','td','nd','dmax','dmin']:['sc','rx','ra','s5','mdl'])")
# 5. form dien thoai: muc khong co ket qua tam tinh
rep("const secs=(G?G.sections(d):(isDA?MF_SEC_DA:MF_SEC)).map(c=>{const lv=h('div',{class:'mf-live'});lives.push([lv,c.live]);","const secs=(G?G.sections(d):(isDA?MF_SEC_DA:MF_SEC)).map(c=>{const lv=c.live?h('div',{class:'mf-live'}):null;if(lv)lives.push([lv,c.live]);")
# 6. loai mau
old=re.search(r"\['DA_10_40','Đá dăm 10x40',false\],",s).group(0)
rep(old,"['DA_10_40','Đá dăm 10x40',true,'Đá dăm xây dựng cỡ 10-40 (mm)'],")
rep("['DA_GOC','Đá gốc',false],","['DA_GOC','Đá gốc',true,'Đá gốc'],")
rep("['DA_LANG_NHUA','Đá láng nhựa',false],","['DA_LN_1','Đá láng nhựa 4,75/9,5',true,'Đá dăm dùng cho mặt đường láng nhựa cỡ 4,75/9,5'],['DA_LN_2','Đá láng nhựa 9,5/12,5',true,'Đá dăm dùng cho mặt đường láng nhựa cỡ 9,5/12,5'],['DA_LN_3','Đá láng nhựa 12,5/19',true,'Đá dăm dùng cho mặt đường láng nhựa cỡ 12,5/19'],['GACH_DAC','Gạch đặc',true,'Gạch đặc đất sét nung'],['GACH_2L','Gạch 2 lỗ',true,'Gạch rỗng 2 lỗ đất sét nung'],['GACH_6L','Gạch 6 lỗ',true,'Gạch rỗng 6 lỗ đất sét nung'],['THEP_XD','Thép xây dựng',true,'Thép xây dựng'],")
# 7. quan trac: bo 2 muc cu (XM, DA_10_40 gia), sinh tu GT
a=s.index(" {k:'XM_PCB40',t:'Xi măng PCB40',std:'TCVN 6260:2009',groups:[")
b=s.index("const QT=QT_TYPES;")
s=s[:a]+"];\nObject.values(GT).forEach(G=>{if(G.qt)QT_TYPES.push({k:G.code,t:G.ten,std:'Biểu mẫu '+G.form.code,groups:G.qt()});});\n"+s[b:]
rep("QT.indexOf(T)?'Loại mẫu này chưa có biểu mẫu nhập số liệu trong hệ thống. Cột bên dưới là bộ cột sẽ hiện khi mẫu được nhập.':'Số liệu hiện khi cán bộ thử nghiệm nộp kết quả (nhập trên điện thoại hoặc tải file Excel).'","'Số liệu hiện khi cán bộ thử nghiệm nộp kết quả (nhập trên điện thoại hoặc tải file Excel). Cột bên dưới là bộ cột sẽ hiện.'")
# 9. loi nho trang quan trac
rep("'Hiển thị thêm 300 dòng'):null);","'Hiển thị thêm 300 dòng'):document.createTextNode(''));")
rep("table.qt th.qt-g{background:var(--accent-soft);color:var(--accent)}","table.qt th.qt-g{background:var(--accent-soft);color:var(--accent);text-align:left}")
# 8. build
rep("const BUILD='0.9.0 · 04/11/2026';","const BUILD='0.9.1 · 04/11/2026';")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n ['04/11/2026','B3','Claude','Thêm 9 loại mẫu theo bảng mô tả dùng chung: Đá dăm 10-40 (BM-DA-02), Đá gốc (BM-DG-01), Đá láng nhựa 3 cỡ 4,75/9,5, 9,5/12,5, 12,5/19 (BM-LN-01..03), Gạch đặc, 2 lỗ, 6 lỗ (BM-GD-01, BM-G2-01, BM-G6-01), Thép xây dựng (BM-TX-01: mỗi phiếu tối đa 3 nhóm đường kính, mỗi nhóm 3 mẫu thử, một số báo cáo). Trang Quan trắc có đủ các loại, gồm Xi măng PCB40 và Thép hình','Đạt','Chạy thử trên Chrome với CSDL giả: tạo mẫu, tải biểu mẫu, nộp, soát xét, tính lại, phát hành, phiếu A4, QR. Tính lại công thức bằng LibreOffice khớp 100% giá trị app ghi','Công thức kết luận nhóm thép thiếu nhánh CHƯA ĐỦ khi nhóm chưa đủ 3 mẫu; trang Quan trắc hiện chữ null dưới bảng','Đã sửa cả hai. Gạch và đá gốc chưa kết luận đạt hay không đạt vì file cũ không có mức yêu cầu','0.9.1'],\n")
rep('window.__ptn={renderPhieu,','window.__ptn={loaiOf,QT_TYPES,rcTX,rc1040,rcGach,rcDG,rcLN,renderPhieu,')
open(OUT,'w',encoding='utf8').write(s)
print('ok',len(s))
