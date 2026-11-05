import re,base64,sys
src='/mnt/user-data/outputs/Quản_lý_mẫu_thử_nghiệm_0_8_0.html'
dst='/mnt/user-data/outputs/v90.html'
s=open(src,encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    n=s.count(old)
    assert n==cnt,('count',n,old[:80])
    s=s.replace(old,new)
def rex(pat,new,cnt=1,flags=0):
    global s
    n=len(re.findall(pat,s,flags))
    assert n==cnt,('regex count',n,pat[:80])
    s=re.sub(pat,lambda m:new if isinstance(new,str) else new(m),s,flags=flags)
gt=open('/tmp/w/p/gt.js',encoding='utf8').read()
gt=gt.replace('@@XM_B64@@',base64.b64encode(open('/tmp/w/t/XM.xlsx','rb').read()).decode()).replace('@@TH_B64@@',base64.b64encode(open('/tmp/w/t/TH.xlsx','rb').read()).decode())
gt=gt.replace("Object.keys(XM_K).forEach((h_,i)=>{const c=String.fromCharCode(66+i);xmFixed.push([c+'26','Bảng hệ số K: h '+h_,+h_]);xmFixed.push([c+'27','Bảng hệ số K: K tại h '+h_,XM_K[h_]]);});",
 "[1,1.1,1.2,1.3,1.4,1.5,1.7,1.8,1.9,2,2.1,2.2].forEach((h_,i)=>{const c=String.fromCharCode(66+i);xmFixed.push([c+'26','Bảng hệ số K: h thứ '+(i+1),h_]);xmFixed.push([c+'27','Bảng hệ số K tại h '+h_,XM_K[String(h_)]]);});")
gt=gt.replace("results:hasCache?G.results(rc,raw):null","results:hasCache?G.results(rc,raw):{}")
assert 'XM_K[String(h_)]' in gt
# P1-P3
rep("const loaiForm=s=>loaiOf(s)==='DA_5_20'?{code:'BM-DA-01',ver:'v1.0'}:FORM;","const loaiForm=s=>{const G=gt(s);return G?G.form:(loaiOf(s)==='DA_5_20'?{code:'BM-DA-01',ver:'v1.0'}:FORM);};")
rep("const defTests=l=>(l==='DA_5_20'?DA_TESTS:TESTS).map(t=>t.code);","const defTests=l=>(GT[l]?GT[l].tests:(l==='DA_5_20'?DA_TESTS:TESTS)).map(t=>t.code);")
rep("const DPof=s=>loaiOf(s)==='DA_5_20'?DPDA:DP;","const DPof=s=>{const G=gt(s);return G?G.dp:(loaiOf(s)==='DA_5_20'?DPDA:DP);};")
rep("async function analyzeUploadDA(sample,u8){",gt+"\nasync function analyzeUploadDA(sample,u8){")
rep("['DA_5_20','Đá dăm 5x20',true,'Đá dăm xây dựng cỡ 5-20 (mm)'],","['DA_5_20','Đá dăm 5x20',true,'Đá dăm xây dựng cỡ 5-20 (mm)'],['XM_PCB40','Xi măng PCB40',true,'Xi măng PCB40'],['THEP_HINH','Thép hình',true,'Thép hình'],")
# buildTemplate
rep("b64ToU8(loaiOf(sample)==='DA_5_20'?DA_B64:activeTemplateB64())","b64ToU8(gt(sample)?gt(sample).b64():(loaiOf(sample)==='DA_5_20'?DA_B64:activeTemplateB64()))")
rep("str('B8',m.ten||'Cát xây dựng')","str('B8',m.ten||(gt(sample)?gt(sample).ten:'Cát xây dựng'))")
rep("(loaiOf(sample)==='DA_5_20'?'Căn cứ phiếu yêu cầu và giao nhiệm vụ thử nghiệm '","(loaiOf(sample)!=='CAT_XD'?'Căn cứ phiếu yêu cầu và giao nhiệm vụ thử nghiệm '")
rep("const [p2,d2]=await q(2),[p3,d3]=await q(3),f=form.d,DAx=loaiOf(sample)==='DA_5_20',rc=DAx?recomputeDA(f):recompute(f);","const G=gt(sample),[p2,d2]=await q(2),[p3,d3]=await q(3),f=form.d,DAx=loaiOf(sample)==='DA_5_20',rc=G?G.rc(f):(DAx?recomputeDA(f):recompute(f));")
rep("const MP=DAx?MF_MAP_DA:MF_MAP;","const MP=G?G.map:(DAx?MF_MAP_DA:MF_MAP);")
rep("    if(DAx){put(d2,'D8',rc.sc);","    if(G){const ex=G.expect(rc);Object.keys(ex).forEach(k=>put(d2,G.cacheCells[k]||k,ex[k]));}else if(DAx){put(d2,'D8',rc.sc);")
rep("put(d3,DAx?'C22':'C19',DAx||mfValid(f)?'HỢP LỆ':'CHƯA HỢP LỆ');","put(d3,G?'C22':(DAx?'C22':'C19'),(G?G.valid(f,rc):(DAx||mfValid(f)))?'HỢP LỆ':'CHƯA HỢP LỆ');")
# put with inline strings
m=re.search(r"const put=\(doc,ref,v\)=>\{.*?el\.removeAttribute\('t'\);\};",s,re.S)
assert m and "'str'" in m.group(0)
newput="""const put=(doc,ref,v)=>{const el=Array.from(doc.getElementsByTagName('c')).find(x=>x.getAttribute('r')===ref);if(!el||v==null||v==='')return;
      Array.from(el.childNodes).forEach(n=>{if(n.nodeName!=='f')el.removeChild(n);});
      if(typeof v==='string'&&!Array.from(el.childNodes).some(n=>n.nodeName==='f')){el.setAttribute('t','inlineStr');const is=doc.createElementNS(NS_X,'is'),t=doc.createElementNS(NS_X,'t');t.setAttributeNS('http://www.w3.org/XML/1998/namespace','xml:space','preserve');t.textContent=v;is.appendChild(t);el.appendChild(is);return;}
      const e=doc.createElementNS(NS_X,'v');e.textContent=String(v);el.appendChild(e);
      if(typeof v==='string')el.setAttribute('t','str');else el.removeAttribute('t');};"""
s=s.replace(m.group(0),newput)
rep("  if(limitsReady()){\n    const p5='xl/worksheets/sheet5.xml';","  if(!gt(sample)&&limitsReady()){\n    const p5='xl/worksheets/sheet5.xml';")
rep("  if(loaiOf(sample)==='DA_5_20')return analyzeUploadDA(sample,u8);","  if(gt(sample))return analyzeUploadGT(sample,u8);\n  if(loaiOf(sample)==='DA_5_20')return analyzeUploadDA(sample,u8);")
# qr
rep("(loaiOf(s)==='DA_5_20'?['sc','rx','td','la','nd','dmax','dmin'].filter(k=>r[k]!=null):TESTS.filter(","(gt(s)?gt(s).qr.map(x=>x[0]).filter(k=>r[k]!=null):loaiOf(s)==='DA_5_20'?['sc','rx','td','la','nd','dmax','dmin'].filter(k=>r[k]!=null):TESTS.filter(")
rep(".forEach(k=>L.push(nm[k]+': '+a(fnum(r[k],DPof(s)[k]))));",".forEach(k=>L.push((nm[k]||((gt(s)?gt(s).qr.find(x=>x[0]===k):null)||[k,k])[1])+': '+a(fnum(r[k],DPof(s)[k]))));")
# recheck
rep("const DA=loaiOf(s)==='DA_5_20',rc=DA?recomputeDA(n.raw):recompute(n.raw),bad=[];\n  (DA?['sc','rx','la','td','nd','dmax','dmin']:","const G=gt(s),DA=loaiOf(s)==='DA_5_20',rc=G?G.rc(n.raw):(DA?recomputeDA(n.raw):recompute(n.raw)),bad=[];\n  (G?G.rkeys:DA?['sc','rx','la','td','nd','dmax','dmin']:")
rep("(ALL_TESTS.find(t=>t.key===k)||{name:'Dmin'}).name","(ALL_TESTS.find(t=>t.key===k)||{name:k==='dmin'?'Dmin':k}).name")
# renderPhieu
rep("  const r=(s.nop&&s.nop.results)||{};const m=s.mau||{},da=s.du_an||{};\n  const DAp=","  const r=(s.nop&&s.nop.results)||{};const m=s.mau||{},da=s.du_an||{},G=gt(s);\n  const DAp=")
rep("    h('table',null,h('thead',null,h('tr',null,['TT','Chỉ tiêu thử nghiệm','Phương pháp thử','Đơn vị','Kết quả'].map(x=>h('th',null,x)))),h('tbody',null,rows)),",
    "    G?h('table',null,h('thead',null,h('tr',null,G.head.map(x=>h('th',null,x)))),h('tbody',null,G.table(r).map(rw=>h('tr',null,rw.map(c=>h('td',{class:'c'},c==null?'':String(c))))))):h('table',null,h('thead',null,h('tr',null,['TT','Chỉ tiêu thử nghiệm','Phương pháp thử','Đơn vị','Kết quả'].map(x=>h('th',null,x)))),h('tbody',null,rows)),")
rep("(DAp?'Mẫu đá':'Mẫu cát')+' trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 7570:2006.'","(G?G.nhanXet(r):((DAp?'Mẫu đá':'Mẫu cát')+' trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 7570:2006.'))")
# rawTable
rep("if(raw.la_m1!==undefined)return rawTableDA(raw);\n","if(raw.la_m1!==undefined)return rawTableDA(raw);\n  const RG=rawGT(raw);if(RG)return h('div',{class:'tbl-wrap'},h('table',null,h('tbody',null,RG.rawRows(raw).map(r=>h('tr',null,h('td',null,r[0]),h('td',null,r[1]))))));\n")
# phone form
rep("mfTry=0;const isDA=loaiOf(s)==='DA_5_20';","mfTry=0;const isDA=loaiOf(s)==='DA_5_20',G=gt(s);")
rep("const need=()=>KEYS.filter(k=>typeof d[k]!=='number').length;","const need=()=>G?G.need(d):KEYS.filter(k=>typeof d[k]!=='number').length;const totalK=()=>G?G.total(d):KEYS.length;")
rep("const n=KEYS.length-need();bar.style.width=Math.round(n/KEYS.length*100)+'%';cnt.textContent=n+'/'+KEYS.length+' số liệu';","const n=totalK()-need();bar.style.width=Math.round(n/totalK()*100)+'%';cnt.textContent=n+'/'+totalK()+' số liệu';")
rep("placeholder:(isDA?MF_PH_DA:MF_PH)[k]||''","placeholder:(G?G.ph:(isDA?MF_PH_DA:MF_PH))[k]||''")
rep("const fld=(k,l)=>h('label',null,l,num_(k));","const fld=(k,l)=>{const kd=G?G.kind(k):'num';if(kd==='text')return h('label',null,l,h('input',{type:'text',autocomplete:'off',placeholder:G.ph[k]||'',value:d[k]||'',oninput:e=>{d[k]=e.target.value;save();upd();}}));if(kd==='bend')return h('label',null,l,h('select',{onchange:e=>{d[k]=e.target.value;save();upd();}},[['','Chọn…'],['Không nứt','Không nứt'],['Nứt','Nứt']].map(o=>h('option',{value:o[0],selected:(d[k]||'')===o[0]},o[1]))));return h('label',null,l,num_(k));};")
rep("const secs=(isDA?MF_SEC_DA:MF_SEC).map(c=>{","const secs=(G?G.sections(d):(isDA?MF_SEC_DA:MF_SEC)).map(c=>{")
rep("(!isDA&&MF_NOTE[c.t])?","(!isDA&&!G&&MF_NOTE[c.t])?")
rep("    info,...secs,\n","    info,...secs,G&&G.extra?G.extra(d,()=>{save();render();}):null,\n")
# issuedParts
rep("  const line=(r,txt)=>'<row r=\"'+r+'\" ht=\"32\" customHeight=\"1\"><c r=\"C'+r+'\" s=\"60\" t=\"inlineStr\">","  const stX=await zip.file('xl/styles.xml').async('string');const SPT=(+((/<cellXfs count=\"(\\d+)\"/.exec(stX)||[])[1]||0))>60?60:0;\n  const line=(r,txt)=>'<row r=\"'+r+'\" ht=\"32\" customHeight=\"1\"><c r=\"C'+r+'\" s=\"'+SPT+'\" t=\"inlineStr\">")
rep("zip.file('xl/workbook.xml',wb.replace(/Phieu_KQ!\\$A\\$1:\\$H\\$\\d+/,()=>'Phieu_KQ!$A$1:$H$'+(R+4)));","zip.file('xl/workbook.xml',wb.replace(/(['\"]?Phieu_KQ['\"]?)!\\$A\\$1:\\$H\\$\\d+/,(mm,sh)=>sh+'!$A$1:$H$'+(R+4)));")
m=re.search(r"    zip\.file\(dp,dr\.replace\('</xdr:wsDr>',\(\)=>'.*?</xdr:oneCellAnchor></xdr:wsDr>'\)\);",s,re.S)
assert m
newdr="""    const px=/<xdr:wsDr/.test(dr)?'xdr:':'',NSA=' xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
    const xe=(n,at,inner)=>'<'+px+n+(at||'')+(inner==null?'/>':'>'+inner+'</'+px+n+'>');
    const anchor=xe('oneCellAnchor','',xe('from','',xe('col','','0')+xe('colOff','','38100')+xe('row','',String(R))+xe('rowOff','','63500'))+xe('ext',' cx="1500000" cy="1500000"')+xe('pic',NSA,xe('nvPicPr','',xe('cNvPr',' id="9" name="QR tra cứu"')+xe('cNvPicPr'))+xe('blipFill','','<a:blip r:embed="rIdQR1"/><a:stretch><a:fillRect/></a:stretch>')+xe('spPr','','<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'))+xe('clientData'));
    zip.file(dp,dr.replace(/<\\/(?:xdr:)?wsDr>\\s*$/,()=>anchor+'</'+px+'wsDr>'));
    let ct=await zip.file('[Content_Types].xml').async('string');if(!/Extension="png"/i.test(ct))zip.file('[Content_Types].xml',ct.replace(/(<Types[^>]*>)/,'$1<Default Extension="png" ContentType="image/png"/>'));"""
s=s.replace(m.group(0),newdr)
rex(r"sel\('m_loai','Loại mẫu',\[\{v:'CAT_XD'.*?\],\{req:true\}\)","sel('m_loai','Loại mẫu',MAT_TYPES.filter(t=>t[2]).map((t,i)=>({v:t[0],t:t[1],sel:i===0})),{req:true})",1,re.S)
rep("const BUILD='0.8.0 · 04/11/2026';","const BUILD='0.9.0 · 04/11/2026';")
row=" ['04/11/2026','B2','Claude','Thêm 2 loại vật liệu theo bảng mô tả dùng chung: Xi măng PCB40 (BM-XM-01: độ mịn, đông kết, ổn định thể tích, cường độ 3 ngày, quy về 28 ngày phương pháp nhanh) và Thép hình (BM-TH-01: tối đa 12 thanh trên một phiếu, mỗi phiếu một số báo cáo). Có biểu mẫu Excel, nhập trên điện thoại, kiểm tra file nộp, soát xét, phiếu A4, QR. Sửa lỗi cũ: mã QR và vùng in của file Excel phiếu A4 chưa được chèn vào đúng chỗ','Chờ thử','Đã chạy thử trên Chrome thật với CSDL giả. Trang Quan trắc chưa có 2 loại mới. Bảng hệ số K của xi măng thiếu h = 1,6 và h > 2,2 (giữ nguyên file cũ)','Tạo mẫu xi măng và thép hình, nhập điện thoại, nộp, duyệt, phát hành, tải phiếu A4','0.9.0'],\n"
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
s=s.replace('window.__ptn={MF_PH,','window.__ptn={renderPhieu,rawTable,recheck,qrText,GT,gt,rcXM,rcTH,issuedBytes,issuedParts,analyzeUploadGT,MF_PH,',1)
open(dst,'w',encoding='utf8').write(s)
print('patched',len(s))
