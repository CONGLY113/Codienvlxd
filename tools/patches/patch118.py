import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)

fn=r'''
/* ===== 0.27.6 Chỉnh chung sheet Phieu_KQ cho mọi biểu mẫu (lề in, bỏ dòng thừa, dòng ký, số báo cáo) ===== */
const PK_QC='Mẫu do đơn vị thi công và tư vấn giám sát lấy';
const PK_NO_QC={NEN_BT:1,NEN_VUA:1};
async function patchPhieuCommon(zip,sample,extra){
  const p='xl/worksheets/sheet4.xml',sf=zip.file(p);if(!sf)return;
  const P=new DOMParser(),doc=P.parseFromString(await sf.async('string'),'application/xml'),sd=doc.getElementsByTagName('sheetData')[0];if(!sd)return;
  const stF=zip.file('xl/styles.xml');if(!stF)return;
  const stDoc=P.parseFromString(await stF.async('string'),'application/xml'),fonts=stDoc.getElementsByTagName('fonts')[0],xfs=stDoc.getElementsByTagName('cellXfs')[0];if(!fonts||!xfs)return;
  let sst=[];const ssf=zip.file('xl/sharedStrings.xml');
  if(ssf){const sx=P.parseFromString(await ssf.async('string'),'application/xml');sst=Array.from(sx.getElementsByTagName('si')).map(si=>Array.from(si.getElementsByTagName('t')).map(t=>t.textContent).join(''));}
  const xfC={},newXf=(idx,key,mut)=>{const k=idx+'|'+key;if(xfC[k]!=null)return xfC[k];const base=xfs.children[idx];if(!base)return idx;
    const x=base.cloneNode(true);mut(x);xfs.appendChild(x);xfs.setAttribute('count',String(xfs.children.length));return(xfC[k]=xfs.children.length-1);};
  const unbold=idx=>{const base=xfs.children[idx];if(!base)return idx;const fo=fonts.children[+base.getAttribute('fontId')||0];if(!fo||!fo.getElementsByTagName('b').length)return idx;
    return newXf(idx,'nb',x=>{const nf=fo.cloneNode(true);Array.from(nf.getElementsByTagName('b')).forEach(b=>nf.removeChild(b));fonts.appendChild(nf);fonts.setAttribute('count',String(fonts.children.length));x.setAttribute('fontId',String(fonts.children.length-1));x.setAttribute('applyFont','1');});};
  const align=(idx,hz)=>newXf(idx,'al'+hz,x=>{let a=x.getElementsByTagName('alignment')[0];if(!a){a=stDoc.createElementNS(x.namespaceURI,'alignment');x.insertBefore(a,x.firstChild);}a.setAttribute('horizontal',hz);x.setAttribute('applyAlignment','1');});
  const rows={};Array.from(sd.getElementsByTagName('row')).forEach(r=>{rows[+r.getAttribute('r')]=r;});
  const cellsOf=r=>rows[r]?Array.from(rows[r].getElementsByTagName('c')):[];
  const txt=c=>{if(!c)return'';const t=c.getAttribute('t');if(t==='inlineStr')return Array.from(c.getElementsByTagName('t')).map(x=>x.textContent).join('');
    const v=c.getElementsByTagName('v')[0];if(t==='s'&&v)return sst[+v.textContent]||'';const fe=c.getElementsByTagName('f')[0];return fe?'='+fe.textContent:(v?v.textContent:'');};
  const colOf=c=>(c.getAttribute('r').match(/^[A-Z]+/)||[''])[0];
  const setT=(c,t,st)=>{while(c.firstChild)c.removeChild(c.firstChild);c.setAttribute('t','inlineStr');if(st!=null)c.setAttribute('s',String(st));
    const is=doc.createElementNS(NS_X,'is'),te=doc.createElementNS(NS_X,'t');te.setAttributeNS('http://www.w3.org/XML/1998/namespace','xml:space','preserve');te.textContent=t;is.appendChild(te);c.appendChild(is);};
  const blank=c=>{while(c.firstChild)c.removeChild(c.firstChild);c.removeAttribute('t');};
  const mc=doc.getElementsByTagName('mergeCells')[0];
  const mcSync=()=>{if(mc)mc.setAttribute('count',String(mc.getElementsByTagName('mergeCell').length));};
  const delMerge=ref=>{if(!mc)return;Array.from(mc.getElementsByTagName('mergeCell')).forEach(m=>{const r=m.getAttribute('ref');if(r===ref)mc.removeChild(m);});mcSync();};
  const delMergeRow=n=>{if(!mc)return;Array.from(mc.getElementsByTagName('mergeCell')).forEach(m=>{const r=m.getAttribute('ref');if(new RegExp('^[A-Z]+'+n+':[A-Z]+'+n+'$').test(r))mc.removeChild(m);});mcSync();};
  const addMerge=ref=>{if(!mc)return;const m=doc.createElementNS(NS_X,'mergeCell');m.setAttribute('ref',ref);mc.appendChild(m);mcSync();};
  const maxHead=30;
  /* 1. dòng đầu trang: bỏ tiêu đề, ngày thử, thiết bị, mã mẫu; quy cách; chữ thường */
  for(let r=1;r<=maxHead;r++){const cs=cellsOf(r);if(!cs.length)continue;const a=cs.find(c=>colOf(c)==='A'),ta=txt(a).trim();
    if(r<=6&&ta==='PHIẾU KẾT QUẢ THỬ NGHIỆM')rows[r].setAttribute('hidden','1');
    if(/^Ngày (thử nghiệm|đo|nén mẫu|thử)\s*:/.test(ta)||/^Thiết bị thử nghiệm\s*:/.test(ta))rows[r].setAttribute('hidden','1');
    cs.forEach(c=>{const t=txt(c).trim();
      if(t==='Mã mẫu:'){blank(c);cs.forEach(d=>{if(txt(d).indexOf('in_ma_mau')>=0)blank(d);});}});
    if(r>=7&&r<=19)cs.forEach(c=>{const s0=+c.getAttribute('s')||0;const n=unbold(s0);if(n!==s0)c.setAttribute('s',String(n));});
    if(ta==='Quy cách mẫu:'&&!PK_NO_QC[loaiOf(sample)]){const cc=cs.find(c=>colOf(c)==='C');if(cc)setT(cc,PK_QC,cc.getAttribute('s'));}}
  /* 2. số báo cáo: giá trị sau khi cấp, canh lề trái */
  const so=(extra&&extra.bc)||'';
  {const a5=cellsOf(5).find(c=>colOf(c)==='A');if(a5){const s0=+a5.getAttribute('s')||0;
    if(so)setT(a5,'Số báo cáo: '+so,align(s0,'left'));else a5.setAttribute('s',String(align(s0,'left')));}}
  /* 3. dòng ký: bỏ hàng tiêu đề người ký, thay bằng "Quảng Trị, ngày tháng năm" (ngày của số báo cáo); hàng cách 65 */
  let R2=0;for(let r=30;r<=140&&!R2;r++){const a=cellsOf(r).find(c=>colOf(c)==='A');if(a&&txt(a).trim()==='Cán bộ thử nghiệm')R2=r;}
  if(R2){const row=rows[R2],cs=cellsOf(R2),a=cs.find(c=>colOf(c)==='A'),s0=+a.getAttribute('s')||0;
    delMergeRow(R2);cs.forEach(c=>{if(c!==a)row.removeChild(c);});
    const m=/(\d{2})\.(\d{2})\.(\d{2})\.\d+/.exec(so);
    const dt=m?('ngày '+m[3]+' tháng '+m[2]+' năm 20'+m[1]):'ngày       tháng       năm';
    setT(a,'Quảng Trị, '+dt,align(unbold(s0),'right'));addMerge('A'+R2+':H'+R2);row.setAttribute('ht','20');row.setAttribute('customHeight','1');
    let sp=rows[R2+1];
    if(!sp){sp=doc.createElementNS(NS_X,'row');sp.setAttribute('r',String(R2+1));const nx=rows[R2+2];if(nx)sd.insertBefore(sp,nx);else sd.appendChild(sp);rows[R2+1]=sp;}
    sp.setAttribute('ht','65');sp.setAttribute('customHeight','1');}
  /* 4. trang in: lề 4,1 / 2,2 / 1,7 / 0,5 cm, tỷ lệ 100 % */
  let pm=doc.getElementsByTagName('pageMargins')[0];
  if(pm){pm.setAttribute('left','0.6693');pm.setAttribute('right','0.1969');pm.setAttribute('top','1.6142');pm.setAttribute('bottom','0.8661');pm.setAttribute('header','0.3');pm.setAttribute('footer','0.3');}
  const ps=doc.getElementsByTagName('pageSetup')[0];
  if(ps){ps.removeAttribute('fitToHeight');ps.removeAttribute('fitToWidth');ps.setAttribute('scale','100');ps.setAttribute('orientation','portrait');ps.setAttribute('paperSize','9');}
  const fp=doc.getElementsByTagName('pageSetUpPr')[0];if(fp)fp.removeAttribute('fitToPage');
  if(pm&&!doc.getElementsByTagName('printOptions')[0]){const po=doc.createElementNS(NS_X,'printOptions');po.setAttribute('horizontalCentered','1');pm.parentNode.insertBefore(po,pm);}
  /* cột A..cột cuối vùng in vừa khổ A4 ở 100 %: tổng độ rộng tối đa 98 ký tự (~18,5 cm) */
  const wbx=await zip.file('xl/workbook.xml').async('string'),pa=/Phieu_KQ['"]?!\$A\$1:\$([A-Z]+)\$\d+/.exec(wbx);
  const colN=L=>L.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0),last=pa?colN(pa[1]):8,cols=Array.from(doc.getElementsByTagName('col'));
  let sum=0;cols.forEach(c=>{if(c.getAttribute('hidden')==='1')return;const a=+c.getAttribute('min'),b=Math.min(+c.getAttribute('max'),last);if(b>=a)sum+=(b-a+1)*(+c.getAttribute('width')||0);});
  if(sum>98){const k=98/sum;cols.forEach(c=>{if(+c.getAttribute('min')<=last&&c.getAttribute('hidden')!=='1')c.setAttribute('width',String(Math.round((+c.getAttribute('width')||0)*k*100)/100));});}
  const ser=d=>{let x=new XMLSerializer().serializeToString(d);return /^<\?xml/.test(x)?x:'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+x;};
  zip.file(p,ser(doc));zip.file('xl/styles.xml',ser(stDoc));
}
'''
rep("async function buildTemplate(sample,tester,form,extra){",fn+"async function buildTemplate(sample,tester,form,extra){")
rep("  if(extra)await issuedParts(zip,extra);\n","  await patchPhieuCommon(zip,sample,extra);\n  if(extra)await issuedParts(zip,extra);\n")
rep("  if(x.tp_tu_thu){setC('D'+(R-2),'Người soát xét');setC('D'+R,toVwx(x.sx_ten||''));}","  if(x.tp_tu_thu){setC('D'+R,toVwx(x.sx_ten||''));}")
rep("['08/11/2026','B28','Claude',","['08/11/2026','B29','Claude','Chỉnh chung sheet Phieu_KQ của mọi biểu mẫu: lề in 4,1/2,2/1,7/0,5 cm, tỷ lệ 100 %; bỏ tiêu đề PHIẾU KẾT QUẢ THỬ NGHIỆM, ngày thử nghiệm, mã mẫu, thiết bị thử nghiệm; quy cách mẫu cố định; nhãn chữ thường; số báo cáo ghi giá trị sau khi cấp, canh trái; dòng ký thay bằng Quảng Trị, ngày tháng năm (ngày theo số báo cáo), hàng cách 65.','Đã kiểm thử'],\n['08/11/2026','B28','Claude',")
open(F,'w',encoding='utf-8').write(s);print('ok')
