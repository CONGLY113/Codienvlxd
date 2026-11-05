/* ---- đơn vị tính riêng: nén theo tổ mẫu, đo K theo điểm */
const BK_UNIT={NEN_BT:{u:'tổ',sz:3,def:3,ghi:'tổ 3 viên'},NEN_VUA:{u:'tổ',sz:6,def:6,ghi:'tổ 6 viên'},DO_K_DV:{u:'điểm',sz:1,def:3,ghi:'điểm đo'},DO_K_PR:{u:'điểm',sz:1,def:3,ghi:'điểm đo'}};
function bkQty(s){const U=BK_UNIT[loaiOf(s)];if(!U)return{q:1,est:false};const r=s.nop&&s.nop.results,n=r&&+r.n>0?Math.round(+r.n):0,v=n||U.def;return{q:U.sz>1?Math.max(1,Math.ceil(v/U.sz)):v,est:!n};}
const bkNorm=t=>String(t==null?'':t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();
const bkCt=()=>S.bgiaCt||{};
function bkPriceFor(l){if(l.ct)return+bkCt()[l.ct]||0;return+(S.bgia||{})[l.loai]||0;}
/* gom mẫu thành các dòng: theo loại mẫu (giá trọn) hoặc theo từng chỉ tiêu nếu loại mẫu chưa có giá trọn mà có giá chỉ tiêu */
function bkLines(groups,chiXong,old){
  const mp=new Map(),pr=S.bgia||{},ct=bkCt();
  groups.forEach(e=>e.mau.forEach(s=>{
    const done=s.status==='da_phat_hanh';if(chiXong&&!done)return;
    const loai=loaiOf(s),tn=typeNameOf(s),U=BK_UNIT[loai],Q=bkQty(s),cts=s.chi_tieu||[],legacy=+((s.tt||{}).don_gia)||0;
    const byCt=!(+pr[loai]>0)&&cts.some(c=>+ct[c]>0);
    const add=(k,ten,code,dg)=>{let l=mp.get(k);
      if(!l){l={k,ten,loai,sl:0,n:0,xong:0,don_gia:0,ma:[],_dg:[],est:0};if(code)l.ct=code;mp.set(k,l);}
      l.sl+=Q.q;l.n++;l.ma.push(s.ma_mau);if(done)l.xong++;if(Q.est)l.est++;l._dg.push(dg);};
    const suf=U?' (tính theo '+U.ghi+')':'';
    if(byCt)cts.forEach(c=>{const t=ALL_TESTS.find(x=>x.code===c);add(loai+'|'+tn+'|ct:'+c,tn+' - '+(t?t.name:c)+suf,c,+ct[c]||0);});
    else add(loai+'|'+tn,tn+suf,null,legacy);
  }));
  const out=Array.from(mp.values()).map(l=>{
    const o=(old||[]).find(x=>x.k===l.k&&!x.tay);
    const dgs=l._dg.filter(x=>x>0),legacy=!l.ct&&dgs.length&&dgs.every(x=>x===dgs[0])?dgs[0]:0;
    const base=l.ct?(+ct[l.ct]||0):(+pr[l.loai]||0);
    l.don_gia=o?o.don_gia:(base||legacy||0);if(o)l.ten=o.ten;l.q0=l.sl;if(!l.est)delete l.est;delete l._dg;return l;});
  (old||[]).filter(x=>x.tay).forEach(x=>out.push(x));
  return out;
}
