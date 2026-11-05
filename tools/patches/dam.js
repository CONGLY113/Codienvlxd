/* 0.19.0: đầm chặt cát không hiệu chỉnh hạt quá cỡ (hiệu chỉnh chỉ dùng cho cấp phối thiên nhiên và cấp phối đá dăm) */
(function(){
  const G=GT.DAM_CHAT_CAT,T0=GT.CP_TN;
  const HCK=['Mutc','Wtc','Mktc','Muqc','Wqc','Mkqc','Ptc','Pqc','G','gkh','wh'];
  const st=d=>{const o=Object.assign({},d);CT_HC.forEach(k=>{delete o['hc_'+k];});return o;};
  G.map=Object.assign({},T0.map);CT_HC.forEach(k=>{delete G.map['hc_'+k];});
  G.rc=d=>rcCT(st(d));
  G.cacheCells=Object.assign({},T0.cacheCells,{gk:'B23',w:'B24'});HCK.forEach(k=>{delete G.cacheCells[k];});
  G.rkeys=['n','gk0','w0','gk','w'];
  G.fixed=T0.fixed.filter(f=>f[0]!=='B18');
  G.expect=rc=>Object.assign({n:rc.n,gk0:rc.gk0,w0:rc.w0,peak:rc.peak,gk:rc.gk,w:rc.w},G.rowCache(rc));
  G.results=(rc,raw)=>({n:rc.n,gk0:rc.gk0,w0:rc.w0,peak:rc.peak,gk:rc.gk,w:rc.w,hc:false,V:rc.V,cm:rc.cm,rows:rc.rows.map(x=>({mt:x.mt,mw:x.mw,gw:x.gw,ma:x.ma,mk:x.mk,mh:x.mh,w:x.w,gk:x.gk}))});
  const ph=Object.assign({},T0.ph);CT_HC.forEach(k=>{delete ph['hc_'+k];});G.ph=ph;
  G.sections=d=>{const out=T0.sections(d);out.pop();
    out.push(sec1('Kết quả tương quan','Dung trọng khô lớn nhất γkmax và độ ẩm tối ưu Wo lấy tại điểm có dung trọng khô lớn nhất. Đầm chặt cát không hiệu chỉnh hạt quá cỡ.',[],dd=>{const r=rcCT(st(dd));return r.n?['Kết quả',fnum(r.gk0,3)+' g/cm³ · Wo '+fnum(r.w0,1)+' %','',r.peak<=1||r.peak>=r.n]:null;}));return out;};
  G.need=d=>T0.need(st(d));G.total=d=>T0.total(st(d));
  G.valid=(d,rc)=>rc.V>0&&rc.cm>0&&rc.n>=5&&rc.rows.every(x=>x.gk!=null);
  G.verify=raw=>T0.verify(st(raw));
  G.rawRows=raw=>T0.rawRows(st(raw));
  G.qt=()=>T0.qt().filter(g=>g[0]!=='Hiệu chỉnh');
  const body0=G.body;
  G.body=r=>{const nd=body0(Object.assign({},r,{hc:false}));
    const tb=nd&&nd.querySelectorAll?nd.querySelectorAll('table')[1]:null;
    if(tb){const t=h('table',{style:'margin-top:8px'},h('thead',null,h('tr',null,['Kết quả','Giá trị'].map(x=>h('th',null,x)))),
      h('tbody',null,h('tr',null,h('td',null,'Khối lượng thể tích khô lớn nhất (g/cm³)'),h('td',{class:'c'},fnum(r.gk0,3))),h('tr',null,h('td',null,'Độ ẩm tối ưu (%)'),h('td',{class:'c'},fnum(r.w0,1)))));tb.replaceWith(t);}
    return nd;};
  G.nhanXet=r=>!r.n?'':('Khối lượng thể tích khô lớn nhất '+fnum(r.gk0,3)+' g/cm³ ứng với độ ẩm tối ưu '+fnum(r.w0,1)+' %.');
})();
