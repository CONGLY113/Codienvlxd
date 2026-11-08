import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)

# 1. bộ công cụ vẽ bảng trong patchPhieuCommon
rep("  const maxHead=30;\n","""  const maxHead=30;
  /* --- công cụ vẽ lại bảng kết quả theo loại mẫu --- */
  const fontC={},bdC={},flC={},nfC={};let nfId=0;
  const mkFont=o=>{const k=JSON.stringify([o.b,o.i,o.sz,o.fc]);if(fontC[k]!=null)return fontC[k];const f=stDoc.createElementNS(fonts.namespaceURI,'font');
    if(o.b)f.appendChild(stDoc.createElementNS(fonts.namespaceURI,'b'));if(o.i)f.appendChild(stDoc.createElementNS(fonts.namespaceURI,'i'));
    const sz=stDoc.createElementNS(fonts.namespaceURI,'sz');sz.setAttribute('val',String(o.sz||11));f.appendChild(sz);
    const co=stDoc.createElementNS(fonts.namespaceURI,'color');co.setAttribute('rgb',o.fc||'FF000000');f.appendChild(co);
    const nm=stDoc.createElementNS(fonts.namespaceURI,'name');nm.setAttribute('val','Times New Roman');f.appendChild(nm);const fm=stDoc.createElementNS(fonts.namespaceURI,'family');fm.setAttribute('val','1');f.appendChild(fm);
    fonts.appendChild(f);fonts.setAttribute('count',String(fonts.children.length));return(fontC[k]=fonts.children.length-1);};
  const bordersEl=stDoc.getElementsByTagName('borders')[0],fillsEl=stDoc.getElementsByTagName('fills')[0];
  const mkBorder=spec=>{if(!spec)return 0;if(bdC[spec]!=null)return bdC[spec];const b=stDoc.createElementNS(bordersEl.namespaceURI,'border');
    [['left','l'],['right','r'],['top','t'],['bottom','b']].forEach(([n,ch])=>{const e=stDoc.createElementNS(bordersEl.namespaceURI,n),m=new RegExp(ch+'(d?)').exec(spec);
      if(m){e.setAttribute('style',m[1]?'dotted':'thin');const c=stDoc.createElementNS(bordersEl.namespaceURI,'color');c.setAttribute('rgb','FF000000');e.appendChild(c);}b.appendChild(e);});
    b.appendChild(stDoc.createElementNS(bordersEl.namespaceURI,'diagonal'));bordersEl.appendChild(b);bordersEl.setAttribute('count',String(bordersEl.children.length));return(bdC[spec]=bordersEl.children.length-1);};
  const mkFill=rgb=>{if(!rgb)return 0;if(flC[rgb]!=null)return flC[rgb];const f=stDoc.createElementNS(fillsEl.namespaceURI,'fill'),pf=stDoc.createElementNS(fillsEl.namespaceURI,'patternFill');pf.setAttribute('patternType','solid');
    const fg=stDoc.createElementNS(fillsEl.namespaceURI,'fgColor');fg.setAttribute('rgb',rgb);pf.appendChild(fg);f.appendChild(pf);fillsEl.appendChild(f);fillsEl.setAttribute('count',String(fillsEl.children.length));return(flC[rgb]=fillsEl.children.length-1);};
  const mkNum=code=>{if(!code)return 0;if(nfC[code]!=null)return nfC[code];let ne=stDoc.getElementsByTagName('numFmts')[0];
    if(!ne){ne=stDoc.createElementNS(fonts.namespaceURI,'numFmts');stDoc.documentElement.insertBefore(ne,stDoc.documentElement.firstChild);}
    if(!nfId)nfId=Math.max(163,...Array.from(ne.children).map(x=>+x.getAttribute('numFmtId')||0));nfId++;const e=stDoc.createElementNS(fonts.namespaceURI,'numFmt');e.setAttribute('numFmtId',String(nfId));e.setAttribute('formatCode',code);ne.appendChild(e);ne.setAttribute('count',String(ne.children.length));return(nfC[code]=nfId);};
  const xfK={};
  const xf=o=>{o=o||{};const k=JSON.stringify(o);if(xfK[k]!=null)return xfK[k];const x=stDoc.createElementNS(xfs.namespaceURI,'xf');
    x.setAttribute('numFmtId',String(mkNum(o.num)));x.setAttribute('fontId',String(mkFont(o)));x.setAttribute('fillId',String(mkFill(o.fill)));x.setAttribute('borderId',String(mkBorder(o.bd)));x.setAttribute('xfId','0');
    ['applyNumberFormat','applyFont','applyFill','applyBorder','applyAlignment'].forEach(a=>x.setAttribute(a,'1'));
    const al=stDoc.createElementNS(xfs.namespaceURI,'alignment');al.setAttribute('horizontal',o.al||'center');al.setAttribute('vertical',o.va||'center');if(o.wrap!==false)al.setAttribute('wrapText','1');x.appendChild(al);
    xfs.appendChild(x);xfs.setAttribute('count',String(xfs.children.length));return(xfK[k]=xfs.children.length-1);};
  const colNum=L=>L.split('').reduce((n,ch)=>n*26+ch.charCodeAt(0)-64,0);
  const cellEl=ref=>{const rn=+(ref.match(/\\d+/)||[0])[0],row=mkRow(rn);let e=Array.from(row.children).find(c=>c.getAttribute('r')===ref);if(e)return e;
    e=doc.createElementNS(NS_X,'c');e.setAttribute('r',ref);const cn=colNum(ref.replace(/\\d+/,'')),nx=Array.from(row.children).find(c=>colNum(c.getAttribute('r').replace(/\\d+/,''))>cn);if(nx)row.insertBefore(e,nx);else row.appendChild(e);return e;};
  const put=(ref,o)=>{const c=cellEl(ref);while(c.firstChild)c.removeChild(c.firstChild);c.removeAttribute('t');if(o.s)c.setAttribute('s',String(xf(o.s)));
    if(o.f!=null){const f=doc.createElementNS(NS_X,'f');f.textContent=o.f;c.appendChild(f);if(!o.num)c.setAttribute('t','str');c.appendChild(doc.createElementNS(NS_X,'v'));}
    else if(typeof o.v==='number'){const v=doc.createElementNS(NS_X,'v');v.textContent=String(o.v);c.appendChild(v);}
    else if(o.v!=null&&o.v!==''){setT(c,String(o.v));if(o.s)c.setAttribute('s',String(xf(o.s)));}return c;};
  const rmRows=(r1,r2)=>{for(let r=r1;r<=r2;r++){const row=rows[r];if(!row)continue;while(row.firstChild)row.removeChild(row.firstChild);row.removeAttribute('ht');row.removeAttribute('customHeight');}
    if(mc)Array.from(mc.getElementsByTagName('mergeCell')).forEach(m=>{const q=/^[A-Z]+(\\d+):[A-Z]+(\\d+)$/.exec(m.getAttribute('ref')||'');if(q&&+q[1]>=r1&&+q[2]<=r2)mc.removeChild(m);});mcSync();};
  const rowH=(r,h)=>{const e=mkRow(r);e.setAttribute('ht',String(h));e.setAttribute('customHeight','1');};
  const grid=(r1,r2,c1,c2,o)=>{for(let r=r1;r<=r2;r++)for(let c=colNum(c1);c<=colNum(c2);c++){const L=String.fromCharCode(64+c);if(!cellsOf(r).some(x=>x.getAttribute('r')===L+r)||true){const e=cellEl(L+r);if(!e.getAttribute('s'))e.setAttribute('s',String(xf(o)));}}};
  const CTX={doc,sd,rows,mkRow,cellsOf,txt,put,rmRows,rowH,addMerge,xf,grid,colNum,sample,extra};
""")
rep("  /* 4. trang in: lề 4,1","""  if(PK_LAYOUT[loaiOf(sample)])PK_LAYOUT[loaiOf(sample)](CTX);
  /* 4. trang in: lề 4,1""")
rep("const PK_NO_QC={NEN_BT:1,NEN_VUA:1};","""const PK_NO_QC={NEN_BT:1,NEN_VUA:1};
/* bố cục bảng kết quả riêng theo loại mẫu, mỗi hàm nhận CTX (xem patchPhieuCommon) */
const PK_LAYOUT={};""")
rep("['08/11/2026','B31','Claude',","['08/11/2026','B32','Claude','Bộ công cụ vẽ lại bảng kết quả trong sheet Phieu_KQ (ô, ô gộp, viền, kiểu chữ) dùng cho các bố cục riêng theo loại mẫu.','Đã kiểm thử'],\n['08/11/2026','B31','Claude',")
open(F,'w',encoding='utf-8').write(s);print('ok')
