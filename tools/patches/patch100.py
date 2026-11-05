import sys,re,os
exec(open('/tmp/w/p/editor_parts.py',encoding='utf8').read())
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out100.html'
s=open('/tmp/w/out99.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:120])
    s=s.replace(old,new)
rd=lambda p:open('/tmp/w/p/'+p,encoding='utf8').read().rstrip('\n')
rep("const BUILD='0.17.0 · 05/11/2026';","const BUILD='0.18.0 · 05/11/2026';")
# ---- nhân sự
rep("{id:'NS008',name:'Nguyễn Tiến Hoàng',title:'Cán bộ thử nghiệm, giao nhận mẫu',roles:['tn','tiepnhan']}];",
 "{id:'NS008',name:'Nguyễn Tiến Hoàng',title:'Cán bộ thử nghiệm, giao nhận mẫu',roles:['tn','tiepnhan']},\n {id:'NS012',name:'Hồ Thị Bích Thuỷ',title:'Thủ quỹ',roles:['tq']},\n {id:'NS013',name:'Trần Hoàn',title:'Thủ quỹ',roles:['tq']},\n {id:'NS014',name:'Kế toán trưởng',title:'Kế toán trưởng (tên cập nhật sau)',roles:['ktt']}];")
rep("kt:'Kế toán'};","kt:'Kế toán',tq:'Thủ quỹ',ktt:'Kế toán trưởng'};")
rep("['Cán bộ thử nghiệm, giao nhận mẫu',ACCOUNTS.filter(a=>a.roles.includes('tn')&&!a.roles.some(r=>['tp','pd'].includes(r)))]];",
 "['Cán bộ thử nghiệm, giao nhận mẫu',ACCOUNTS.filter(a=>a.roles.includes('tn')&&!a.roles.some(r=>['tp','pd'].includes(r)))],['Thủ quỹ, kế toán trưởng',ACCOUNTS.filter(a=>a.roles.some(r=>['tq','ktt'].includes(r)))]];")
# ---- trạng thái, lưu, đồng bộ
rep("const BK_ST={nhap:['Nháp, tạm tính','warn'],da_gui:['Đã gửi khách','info'],da_thu:['Đã thanh toán','ok'],huy:['Đã hủy','neutral']};",
 "const BK_ST={nhap:['Nháp','warn'],cho_soat:['Chờ thủ quỹ soát xét','info'],da_soat:['Đã soát xét, chờ ký duyệt','info'],da_duyet:['Đã duyệt','info'],huy:['Đã hủy','neutral']};")
rep("BKS[col]=list.map(x=>Object.assign({col},x));","BKS[col]=list.map(x=>bkNormDoc(Object.assign({col},x)));")
rep("async function bkSave(b){","async function bkSave(b,quiet){")
rep("b.tao={at:now,by:SESSION?SESSION.name:'',by_id:SESSION?SESSION.id:''};}","b.tao={at:now,by:SESSION?SESSION.name:'',by_id:SESSION?SESSION.id:''};b.ls=(b.ls||[]).concat([{at:now,by:SESSION?SESSION.name:'',id:SESSION?SESSION.id:'',vai:bkVai(),hd:'Lập bảng kê',ghi:''}]);}")
rep("if(ok)await logAudit((first?'Lập':'Sửa')+' bảng kê '+b.so,","if(ok&&!quiet)await logAudit((first?'Lập':'Sửa')+' bảng kê '+b.so,")
rep("if(!['nhap','da_gui'].includes(b.trang_thai))return null;","if(!['nhap','cho_soat','da_soat'].includes(b.trang_thai))return null;")
rep("{const bg=list.find(x=>x.id==='bang_gia')||{};S.bgia=bg.gia||{};S.bgiaCt=bg.ct||{};S.bgiaThem=Array.isArray(bg.them)?bg.them:[];}",
 "{const bg=list.find(x=>x.id==='bang_gia')||{};S.bgia=bg.gia||{};S.bgiaCt=bg.ct||{};S.bgiaThem=Array.isArray(bg.them)?bg.them:[];}{const bk=list.find(x=>x.id==='bank');S.bankCfg=bk?{stk:bk.stk,bin:bk.bin,bank:bk.bank,ten:bk.ten||''}:null;}")
# ---- khối mới: logic quy trình
a=s.index('/* ---- trang */\nconst BK={')
s=s[:a]+rd('flow1.js')+'\n'+rd('flow2.js')+'\n'+s[a:]
# bkAct dùng bản mới hơn
rep("const cur=bkAll().find(x=>x.id===b.id&&x.col===b.col)||b,n=JSON.parse(JSON.stringify(cur));","const c0=bkAll().find(x=>x.id===b.id&&x.col===b.col),cur=(c0&&((c0.sua||{}).at||'')>=((b.sua||{}).at||''))?c0:b,n=JSON.parse(JSON.stringify(cur));")
# ---- bkList
a=s.index('function bkList(box,canEdit){');b=s.index('\nfunction bkEditor(box,canEdit){',a)
L=s[a:b]
def lrep(old,new):
    global L
    assert L.count(old)==1,(L.count(old),old[:100]);L=L.replace(old,new)
lrep("['Chưa thanh toán',fmtN(sumT(live.filter(b=>b.trang_thai!=='da_thu')))+' đ'],['Đã thanh toán',fmtN(sumT(live.filter(b=>b.trang_thai==='da_thu')))+' đ']",
 "['Chưa thanh toán',fmtN(bkSum(live.filter(b=>b.trang_thai==='da_duyet'),b=>bkPay(b).con))+' đ'],['Đã thanh toán',fmtN(bkSum(live.filter(b=>b.trang_thai==='da_duyet'),b=>bkPay(b).da))+' đ']")
lrep("['Phiếu chưa lập bảng kê',pend.length]","['Phiếu chưa lập bảng kê',canEdit?pend.length:'-']")
lrep("Object.keys(BK_ST).map(k=>h('option',{value:k},BK_ST[k][0]))","BK_FIL.map(([k,l])=>h('option',{value:k},l))")
lrep("(!f.st||b.trang_thai===f.st)","bkFilSt(b,f.st)")
lrep("tonePill(BK_ST[b.trang_thai]?BK_ST[b.trang_thai][0]:b.trang_thai,BK_ST[b.trang_thai]?BK_ST[b.trang_thai][1]:'neutral')","tonePill(bkStLabel(b)[0],bkStLabel(b)[1])")
lrep("dl?h('span',null,' ',tonePill('Phiếu đã đổi'","(b.trang_thai==='nhap'&&b.tra_lai)?h('span',null,' ',tonePill('Bị trả lại','bad')):null,dl?h('span',null,' ',tonePill('Phiếu đã đổi'")
lrep("(BK_ST[b.trang_thai]||[b.trang_thai])[0]","bkStLabel(b)[0]")
lrep("box.append(pcard,h('div',{class:'card stack'},h('div',{class:'card-h'},h('h2',null,'Bảng kê đã lập')","box.append(...[bkWorkCard(),canEdit?pcard:null].filter(Boolean),h('div',{class:'card stack'},h('div',{class:'card-h'},h('h2',null,'Bảng kê đã lập')")
s=s[:a]+L+s[b:]
# ---- bkEditor
a=s.index('function bkEditor(box,canEdit){');b=s.index('\nfunction bkMail(b){',a)
E=s[a:b]
def erep(old,new):
    global E
    assert E.count(old)==1,(E.count(old),old[:100]);E=E.replace(old,new)
erep("const b=BK.draft,locked=!canEdit||b.trang_thai==='da_thu'||b.trang_thai==='huy';","const b=BK.draft,locked=!canEdit||b.trang_thai!=='nhap';")
erep("const status=BK_ST[b.trang_thai]||['',''];","const status=bkStLabel(b);")
erep("h('td',{class:'num bk-amt'},''),h('td',null,del));","h('td',{class:'num bk-amt'},''),h('td',null,locked?null:del));")
erep("words.textContent='Bằng chữ: '+docSo(T.tt);","words.textContent='Bằng chữ: '+docSo(T.tt);qrUpd();")
i=E.index("  const setSt=async");j=E.index("  const bar=h('div'")
E=E[:i]+WF_JS+E[j:]
i=E.index("  const sbar=h('div'");j=E.index("  box.append(h('div',{class:'card stack'},")
E=E[:i]+SB_JS+E[j:]
erep("    locked&&b.trang_thai==='da_thu'?h('div',{class:'banner','data-tone':'info'},h('div',null,'Bảng kê đã ghi nhận thanh toán nên khóa sửa. Bấm Bỏ ghi nhận thanh toán nếu cần sửa.')):null,\n","    wfSteps,wfBanner,\n")
erep("    bar,sbar));","    bar,sbar,qrBox,paySec,lsSec));")
s=s[:a]+E+s[b:]
# ---- thư gửi khách
a=s.index('function bkMail(b){');b=s.index("pages['thanh-toan']={render(root){",a)
M=s[a:b]
assert M.count("+'\\nTrân trọng,\\nPhòng thí nghiệm';")==1
M=M.replace("+'\\nTrân trọng,\\nPhòng thí nghiệm';","+(bkPay(b).con>0&&b.qr!==false?'\\nThông tin thanh toán: '+bkBank().bank+', số tài khoản '+bkBank().stk+(bkBank().ten?', chủ tài khoản '+bkBank().ten:'')+', số tiền '+fmtN(bkPay(b).con)+' đ, nội dung chuyển khoản: '+bkQrNd(b)+'. Có thể quét mã QR trên bảng kê để chuyển khoản.\\n':'')+'\\nTrân trọng,\\nPhòng thí nghiệm';")
s=s[:a]+M+s[b:]
# ---- trang: thay hẳn
a=s.index("pages['thanh-toan']={render(root){");b=s.index("/* ---- tra cứu phiếu (QR) */",a)
s=s[:a]+rd('flow3.js')+'\n\n'+s[b:]
# ---- bản in
a=s.index('function bkPrint(b){');b=s.index('/* ---- trang */',a)
P=s[a:b]
def prep(old,new):
    global P
    assert P.count(old)==1,(P.count(old),old[:100]);P=P.replace(old,new)
prep("function bkPrint(b){","function bkPrint(b,Q){")
prep("const T=bkTotals(b),th=t=>","const T=bkTotals(b),lapName=(b.gui_soat&&b.gui_soat.by)||(b.tao&&b.tao.by)||'',tqName=(b.soat&&b.soat.by)||'',qi=Q&&Q.png?h('img',{src:'data:image/png;base64,'+u8ToB64(Q.png),width:'120',height:'120',alt:'Mã QR thanh toán'}):null,th=t=>")
i=P.index("    h('div',{style:'display:flex;justify-content:space-between;margin-top:22px;text-align:center'}");j=P.index("  return box;")
NEW="""    (Q?h('div',{style:'display:flex;gap:14px;align-items:center;margin-top:14px;border:1px solid #000;padding:8px'},qi,h('div',{style:'font-size:12px;line-height:1.5'},h('div',null,h('b',null,'THÔNG TIN THANH TOÁN')),h('div',null,'Ngân hàng: '+Q.B.bank),h('div',null,'Số tài khoản: '+Q.B.stk),Q.B.ten?h('div',null,'Chủ tài khoản: '+Q.B.ten):null,h('div',null,'Số tiền: '+fmtN(Q.P.con)+' đồng'),h('div',null,'Nội dung chuyển khoản: '+Q.nd),h('div',{style:'font-style:italic'},'Quét mã QR bằng ứng dụng ngân hàng'))):null),
    h('div',{style:'display:flex;justify-content:space-between;margin-top:22px;text-align:center;gap:6px'},[['Người lập bảng kê',lapName],['Thủ quỹ soát xét',tqName],['Ký duyệt, đóng dấu',''],['Đại diện khách hàng','']].map(([t,n])=>h('div',{style:'flex:1'},h('b',null,t),h('div',{style:'font-size:11px;font-style:italic'},'(Ký, ghi rõ họ tên)'),h('div',{style:'height:64px'}),h('div',null,n)))));
"""
P=P[:i]+NEW+P[j:]
prep("function bkDoPrint(b){\n  const box=bkPrint(b);document.body.append(box);","async function bkDoPrint(b){\n  const box=bkPrint(b,await bkQr(b));document.body.append(box);await Promise.all(Array.from(box.querySelectorAll('img')).map(im=>im.decode?im.decode().catch(()=>{}):0));")
s=s[:a]+P+s[b:]
# ---- Excel bảng kê
a=s.index('async function bkXlsx(b){');b=s.index('/* ---- bản in (HTML) */',a)
X=s[a:b]
def xrep(old,new):
    global X
    assert X.count(old)==1,(X.count(old),old[:100]);X=X.replace(old,new)
xrep("const T=bkTotals(b),L=b.dong||[],cols='ABCDE';","const T=bkTotals(b),L=b.dong||[],cols='ABCDE',Q=await bkQr(b);let qrRow0=0;")
i=X.index("  const sg=row(0,[");j=X.index("  row(60,[]);\n")+len("  row(60,[]);\n")
XN=r"""  if(Q){const q0=r+1;
    const qr_=(txt,st)=>{const rr=row(20,[cell('A',r+1,txt,st),cell('B',r+1,'',st),cell('C',r+1,'',st),cell('D',r+1,'',S_.n),cell('E',r+1,'',S_.n)]);mg('A'+rr,'C'+rr);return rr;};
    qr_('THÔNG TIN THANH TOÁN',S_.lb);qr_('Ngân hàng: '+Q.B.bank,S_.tr);qr_('Số tài khoản: '+Q.B.stk,S_.tr);qr_(Q.B.ten?'Chủ tài khoản: '+Q.B.ten:' ',S_.tr);qr_('Số tiền thanh toán: '+fmtN(Q.P.con)+' đồng',S_.tr);qr_('Nội dung chuyển khoản: '+Q.nd,S_.tr);qr_('Quét mã QR bằng ứng dụng ngân hàng',S_.sm);
    qrRow0=q0;}
  row(8,[]);
  const lapN=(b.gui_soat&&b.gui_soat.by)||(b.tao&&b.tao.by)||'',tqN=(b.soat&&b.soat.by)||'';
  const s3=row(0,[cell('A',r+1,'Người lập bảng kê',S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,'Thủ quỹ soát xét',S_.bc),cell('D',r+1,'',S_.bc),cell('E',r+1,'Ký duyệt, đóng dấu',S_.bc)]);mg('A'+s3,'B'+s3);mg('C'+s3,'D'+s3);
  const s4=row(0,[cell('A',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('B',r+1,'',S_.sm),cell('C',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('D',r+1,'',S_.sm),cell('E',r+1,'(Ký, đóng dấu)',S_.sm)]);mg('A'+s4,'B'+s4);mg('C'+s4,'D'+s4);
  row(54,[]);
  const s5=row(0,[cell('A',r+1,lapN,S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,tqN,S_.bc),cell('D',r+1,'',S_.bc),cell('E',r+1,'',S_.bc)]);mg('A'+s5,'B'+s5);mg('C'+s5,'D'+s5);
  row(10,[]);
  const s6=row(0,[cell('A',r+1,'Đại diện khách hàng',S_.bc),cell('B',r+1,'',S_.bc),cell('C',r+1,'',S_.bc),cell('D',r+1,'',S_.bc),cell('E',r+1,'',S_.bc)]);mg('A'+s6,'B'+s6);
  const s7=row(0,[cell('A',r+1,'(Ký, ghi rõ họ tên)',S_.sm),cell('B',r+1,'',S_.sm),cell('C',r+1,'',S_.sm),cell('D',r+1,'',S_.sm),cell('E',r+1,'',S_.sm)]);mg('A'+s7,'B'+s7);
  row(54,[]);
"""
X=X[:i]+XN+X[j:]
xrep("zip.file('xl/styles.xml',styles);zip.file('xl/worksheets/sheet1.xml',sheet);",
r"""zip.file('xl/styles.xml',styles);let sh1=sheet;
  if(Q&&Q.png&&qrRow0){
    sh1=sheet.replace('<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">','<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">').replace('</worksheet>','<drawing r:id="rId1"/></worksheet>');
    const ct=await zip.file('[Content_Types].xml').async('string');
    zip.file('[Content_Types].xml',ct.replace('<Default Extension="xml" ContentType="application/xml"/>','<Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>').replace('</Types>','<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>'));
    zip.file('xl/worksheets/_rels/sheet1.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>');
    zip.file('xl/drawings/_rels/drawing1.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/qr1.png"/></Relationships>');
    zip.file('xl/media/qr1.png',Q.png);
    zip.file('xl/drawings/drawing1.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><xdr:oneCellAnchor><xdr:from><xdr:col>3</xdr:col><xdr:colOff>180000</xdr:colOff><xdr:row>'+(qrRow0-1)+'</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from><xdr:ext cx="1428750" cy="1428750"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="QR thanh toán" descr="Mã QR thanh toán"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="1428750" cy="1428750"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>');
  }
  zip.file('xl/worksheets/sheet1.xml',sh1);""")
s=s[:a]+X+s[b:]
# ---- nav, xuất
a=s.index(" {k:'thanh-toan',t:'Thanh toán',show:()=>hasRole('kt')||hasRole('tp'),count:");b=s.index("\n",a)
s=s[:a]+" {k:'thanh-toan',t:'Thanh toán',show:()=>['kt','tp','tq','ktt','pd'].some(r=>hasRole(r)),count:()=>{const L=bkAll();let n=0;if(hasRole('tq'))n+=L.filter(b=>b.trang_thai==='cho_soat').length+bkPendingPays().length;if(bkLap())n+=L.filter(b=>b.trang_thai==='nhap'||b.trang_thai==='da_soat').length+bkPendingGroups().length;return n;}},"+s[b:]
rep("window.__ptn={S,","window.__ptn={S,bkPrint,vietQrText,emvCrc,bkPay,bkAct,bkStLabel,bkNormDoc,bkQrText,bkQrNd,bkBank,bkPendingPays,bkSumRows,bkTblXlsx,bkQr,bkPayDlg,")
# ---- nhật ký
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B11','Claude','Bảng kê thanh toán hai giai đoạn. Thêm vai Thủ quỹ (Hồ Thị Bích Thuỷ, Trần Hoàn) và Kế toán trưởng. Giai đoạn 1: kế toán hoặc quản trị lập bảng kê, gửi thủ quỹ soát xét số lượng mẫu và đơn giá (đạt hoặc trả lại kèm lý do), ghi nhận ký duyệt và đóng dấu bản giấy, lưu vết từng bước; giai đoạn này bảng kê ghi nhận vào hệ thống với tình trạng chưa thanh toán. Giám đốc, Kế toán trưởng xem được các bảng kê và tổng hợp. Giai đoạn 2: kế toán chọn bảng kê khách đã thanh toán (chuyển khoản hoặc tiền mặt), thủ quỹ bấm Đã thanh toán, thanh toán nhiều đợt, thu hồi được. Tab Tổng hợp thanh toán: tên khách hàng, công trình, số bảng kê, giá trị, đã thanh toán, còn lại, ngày lập kê, ngày thanh toán, lọc, xuất Excel. Mã QR VietQR tài khoản Agribank 3800201005127 trên màn hình, bản in, Excel và nội dung gửi khách','Chờ thử','Tên Kế toán trưởng chưa có nên tạm để Kế toán trưởng, cập nhật sau; bảng kê cũ ở bản 0.16.0 tự chuyển sang Đã duyệt'],
""")
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
