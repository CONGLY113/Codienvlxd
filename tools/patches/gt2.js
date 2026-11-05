/* ====================================================================== 0.9.1 BỔ SUNG LOẠI MẪU: đá 10-40, đá gốc, đá láng nhựa (3 cỡ), gạch (3 loại), thép xây dựng */
const B64N={DA_10_40:'@@DA1040@@',DA_GOC:'@@DG@@',DA_LN_1:'@@LN1@@',DA_LN_2:'@@LN2@@',DA_LN_3:'@@LN3@@',GACH_DAC:'@@GDAC@@',GACH_2L:'@@G2L@@',GACH_6L:'@@G6L@@',THEP_XD:'@@TX@@'};
const mean_=a=>a.reduce((x,y)=>x+y,0)/a.length,allN_=a=>a.every(x=>x!=null);
const ix_=n=>Array.from({length:n},(_,i)=>i);
const sc2=(m,m1)=>nzn(m)&&nzn(m1)!=null?(m-m1)/m*100:null;
const prT=(a,b)=>nzn(a)!=null&&nzn(b)!=null&&a+b?a/(a+b)*100:null;
const secL=(t,s,g,fn)=>sec1(t,s,g,fn?(d=>fn(d)):null);
const L2=(rcf,f)=>d=>{const r=rcf(d);return f(r);};
function fixedDec(rows,extra){return rows.map(([c,l,v])=>[c,l,v]).concat(extra||[]);}
/* ---------- Đá dăm 10-40 */
function rc1040(r){
  const n=nzn,o={cum:null,part:null};
  const sc=[sc2(r.sc_m0,r.sc_m10),sc2(r.sc_m1,r.sc_m11)];o.sc=allN_(sc)?(sc[0]+sc[1])/2:null;o.sc_d=allN_(sc)?Math.abs(sc[0]-sc[1]):null;
  const rx=[[r.rx_V0,r.rx_m0],[r.rx_V1,r.rx_m1]].map(([V,m])=>n(V)&&n(m)!=null?m/V:null);o.rx=allN_(rx)?(rx[0]+rx[1])/2:null;o.rx_d=allN_(rx)?Math.abs(rx[0]-rx[1]):null;
  o.la=n(r.la_m1)&&n(r.la_m2)!=null?(r.la_m1-r.la_m2)/r.la_m1*100:null;
  const tdi=ix_(3).map(i=>prT(r['td_a'+i],r['td_b'+i])),tdw=ix_(3).map(i=>n(r['td_w'+i]));
  const ndi=ix_(3).map(i=>sc2(r['nd_a'+i],r['nd_b'+i])),ndw=ix_(3).map(i=>n(r['nd_w'+i]));
  const wa=(v,w)=>allN_(v)&&allN_(w)&&w[0]+w[1]+w[2]>0?(v[0]*w[0]+v[1]*w[1]+v[2]*w[2])/(w[0]+w[1]+w[2]):null;
  o.td=wa(tdi,tdw);o.nd=wa(ndi,ndw);o.td_w=allN_(tdw)?tdw[0]+tdw[1]+tdw[2]:null;o.nd_w=allN_(ndw)?ndw[0]+ndw[1]+ndw[2]:null;
  const tot=n(r.sieve_total),ret=ix_(5).map(i=>n(r['sieve'+i]));
  if(tot&&allN_(ret)){let c=0;o.part=ret.map(x=>x/tot*100);o.cum=o.part.map(x=>(c+=x));o.loss=Math.abs(tot-ret.reduce((a,b)=>a+b,0))/tot*100;
    const sz=[70,40,20,10],ip=lv=>{const k=o.cum.slice(0,4).filter(x=>x<lv).length;return(k===0||k===4)?null:sz[k-1]-(lv-o.cum[k-1])/(o.cum[k]-o.cum[k-1])*(sz[k-1]-sz[k]);};
    o.dmax=ip(10);o.dmin=ip(90);}
  return o;}
/* ---------- Đá gốc */
function rcDG(r){
  const n=nzn,rows=ix_(5).map(i=>{const a=n(r['dg_a'+i]),b=n(r['dg_b'+i]),c=n(r['dg_c'+i]),d=n(r['dg_d'+i]),F=n(r['dg_F'+i]);
    const S=[a,b,c,d].every(x=>x!=null)?(a*b+c*d)/2:null;return{S,F,R:S!=null&&F!=null&&S>0?F*1000/S:null};});
  return{rows,r:rows.every(x=>x.R!=null)?mean_(rows.map(x=>x.R)):null};}
/* ---------- Đá láng nhựa */
function rcLN(r){
  const n=nzn,o={};
  o.la=n(r.la_m1)&&n(r.la_m2)!=null?(r.la_m1-r.la_m2)/r.la_m1*100:null;
  o.td=prT(r.td_m1,r.td_m2);o.my=n(r.my);
  const sc=[sc2(r.sc_m0,r.sc_m10),sc2(r.sc_m1,r.sc_m11)];o.sc=allN_(sc)?(sc[0]+sc[1])/2:null;o.sc_d=allN_(sc)?Math.abs(sc[0]-sc[1]):null;
  o.db=n(r.db);
  const s=ix_(3).map(i=>n(r['sieve'+i])),t=allN_(s)?s[0]+s[1]+s[2]:null;
  o.s0=t?s[0]/t*100:null;o.s1=t?s[1]/t*100:null;o.s2=t?s[2]/t*100:null;
  return o;}
/* ---------- Gạch */
function rcGach(r){
  const n=nzn,o={},dim=p=>{const v=[];ix_(5).forEach(i=>ix_(3).forEach(j=>v.push(n(r[p+i+j]))));return allN_(v)?mean_(v):null;};
  o.dai=dim('L');o.rong=dim('W');o.day=dim('H');
  const hi=ix_(5).map(i=>{const a=n(r['m0_'+i]),b=n(r['m1_'+i]);return a&&b!=null?(b-a)/a*100:null;});o.hi=hi;o.hut=allN_(hi)?mean_(hi):null;
  const face=(p,q,i)=>{const v=ix_(3).map(j=>n(r[p+i+j])),w=ix_(3).map(j=>n(r[q+i+j]));return allN_(v)&&allN_(w)?mean_(v)*mean_(w):null;};
  o.rows=ix_(5).map(i=>{const St=face('a','b',i),Sd=face('c','d',i),S=St!=null&&Sd!=null?(St+Sd)/2:null,F=n(r['F'+i]);
    return{St,Sd,S,F,R:S!=null&&F!=null&&S>0?F*1000/S:null};});
  o.nen=o.rows.every(x=>x.R!=null)?mean_(o.rows.map(x=>x.R)):null;
  return o;}
/* ---------- Thép xây dựng: tối đa 3 nhóm đường kính, mỗi nhóm 3 mẫu */
const rnd1_=x=>Math.round((x+1e-9)*10)/10;
function rcTX(r){
  const n=nzn,groups=[],o={};
  for(let g=0;g<3;g++){
    const d=n(r['dd'+g]);if(d==null&&!r['tk'+g])continue;
    const rows=ix_(3).map(i=>{const k=p=>n(r[p+g+i]);const m=k('m'),Lc=k('Lc'),L1=k('L1_'),L2=k('L2_'),Fy=k('Fy'),Fu=k('Fu'),bd=r['bd'+g+i]||'';
      const Sdn=d!=null?rnd1_(3.1416*d*d/4):null,okm=d!=null&&m!=null&&Lc!=null&&Lc>0;
      const Sth=okm?m/Lc/7.85*100:null,Dth=Sth!=null?Math.sqrt(Sth/Math.PI)*2:null,kgm=okm?m/Lc/10:null,kgs=d!=null?(d/2)*(d/2)*3.1416/100*0.785:null;
      const sl=kgm!=null&&kgs!=null&&kgs>0?(kgm-kgs)/kgs*100:null;
      return{m,Lc,L1,L2,Fy,Fu,bd,Sdn,Sth,Dth,kgm,kgs,sl,sy:Sdn&&Fy!=null?Fy*1000/Sdn:null,su:Sdn&&Fu!=null?Fu*1000/Sdn:null,dl:L1!=null&&L2!=null&&L1>0?(L2-L1)/L1*100:null};});
    const mn=k=>{const v=rows.map(x=>x[k]);return allN_(v)?Math.min(...v):null;};
    const G={g,d,tk:r['tk'+g]||'',mac:r['mac'+g]||'',rows,sy_min:mn('sy'),su_min:mn('su'),dl_min:mn('dl'),sl_max:allN_(rows.map(x=>x.sl))?Math.max(...rows.map(x=>Math.abs(x.sl))):null,nut:rows.filter(x=>x.bd==='Nứt').length};
    const q=['rsy','rsu','rdl'].map(k=>n(r[k+g])),rkl=n(r['rkl'+g]);
    G.kl=d==null?'':(q.some(x=>x==null)?'CHƯA XÉT':([G.sy_min,G.su_min,G.dl_min,G.sl_max].some(x=>x==null)?'CHƯA ĐỦ':(G.sy_min>=q[0]&&G.su_min>=q[1]&&G.dl_min>=q[2]&&G.nut===0&&(rkl==null||G.sl_max<=rkl)?'ĐẠT':'KHÔNG ĐẠT')));
    groups.push(G);
    ['sy_min','su_min','dl_min','sl_max','nut'].forEach(k=>{o[k+g]=G[k];});
  }
  o.groups=groups;o.n=groups.length;return o;}
const GTX=[];
(function(){
  const F=(c,l,v)=>[c,l,v];
  const decF=[F('B11','Số chữ số thập phân thứ nhất',0)];
  /* ===== Đá 10-40 */
  const m1040={sc_m0:'B6',sc_m10:'C6',sc_m1:'B7',sc_m11:'C7',rx_V0:'B13',rx_m0:'C13',rx_V1:'B14',rx_m1:'C14',la_m1:'B20',la_m2:'C20',sieve_total:'B39'};
  ix_(3).forEach(i=>{m1040['td_a'+i]='B'+(24+i);m1040['td_b'+i]='C'+(24+i);m1040['td_w'+i]='E'+(24+i);m1040['nd_a'+i]='B'+(32+i);m1040['nd_b'+i]='C'+(32+i);m1040['nd_w'+i]='E'+(32+i);});
  ix_(5).forEach(i=>{m1040['sieve'+i]='B'+(41+i);});
  const grpN=['Nhóm 5-10 mm (mẫu thử 0,25 kg)','Nhóm 10-20 mm (mẫu thử 1 kg)','Nhóm 20-40 mm (mẫu thử 5 kg)'];
  const t1040=[{code:'DA10_01',name:'Hàm lượng bùn, bụi, sét',std:'TCVN 7572-8:2006',unit:'%',key:'sc'},{code:'DA10_02',name:'Khối lượng thể tích xốp',std:'TCVN 7572-6:2006',unit:'kg/m³',key:'rx'},{code:'DA10_03',name:'Hàm lượng hạt thoi dẹt',std:'TCVN 7572-13:2006',unit:'%',key:'td'},
    {code:'DA10_04',name:'Độ hao mòn Los Angeles',std:'TCVN 7572-12:2006',unit:'%',key:'la'},{code:'DA10_05',name:'Độ nén dập trong xi lanh',std:'TCVN 7572-11:2006',unit:'%',key:'nd'},{code:'DA10_06',name:'Đường kính lớn nhất (Dmax)',std:'TCVN 7572-2:2006',unit:'mm',key:'dmax'},{code:'DA10_07',name:'Đường kính nhỏ nhất (Dmin)',std:'TCVN 7572-2:2006',unit:'mm',key:'dmin'}];
  const dp1040={sc:2,rx:0,td:1,la:1,nd:1,dmax:1,dmin:1};
  const ok1040=d=>{const r=rc1040(d);return Object.keys(m1040).every(k=>typeof d[k]==='number')&&r.dmax!=null&&r.dmin!=null&&Math.abs(r.td_w-100)<=0.5&&Math.abs(r.nd_w-100)<=0.5;};
  const wsum=(k,l)=>L2(rc1040,r=>{const s=k==='td'?r.td_w:r.nd_w;return s==null?null:['Tổng % KLHH ',fnum(s,1),' (phải bằng 100)',Math.abs(s-100)>0.5];});
  GTX.push(GT.DA_10_40={code:'DA_10_40',form:{code:'BM-DA-02',ver:'v1.0'},ten:'Đá dăm 10-40',b64:()=>B64N.DA_10_40,map:m1040,textKeys:[],
    fixed:[['B5','Mã loại mẫu','DA_10_40'],['B11','Số chữ số thập phân: bùn, bụi, sét',2],['B12','Số chữ số thập phân: KL thể tích xốp',0],['B13','Số chữ số thập phân: hạt thoi dẹt',1],['B14','Số chữ số thập phân: Los Angeles',1],['B15','Số chữ số thập phân: độ nén dập',1],['B16','Số chữ số thập phân: Dmax',1],['B17','Số chữ số thập phân: Dmin',1],['B21','Mức sót tích lũy xác định Dmax (%)',10],['B22','Mức sót tích lũy xác định Dmin (%)',90],
      ['A27','Cỡ sàng giới hạn 1',70],['B27','Cận trên sàng 70',0],['C27','Cận dưới sàng 70',0],['A28','Cỡ sàng giới hạn 2',40],['B28','Cận trên sàng 40',0],['C28','Cận dưới sàng 40',10],['A29','Cỡ sàng giới hạn 3',20],['B29','Cận trên sàng 20',40],['C29','Cận dưới sàng 20',70],['A30','Cỡ sàng giới hạn 4',10],['B30','Cận trên sàng 10',90],['C30','Cận dưới sàng 10',100]],
    tests:t1040,dp:dp1040,rc:rc1040,rkeys:['sc','rx','la','td','nd','dmax','dmin'],
    cacheCells:{sc:'D8',rx:'D15',la:'D20',td:'D27',nd:'D35',dmax:'D52',dmin:'D53',cum0:'D41',cum1:'D42',cum2:'D43',cum3:'D44',cum4:'D45'},
    expect:rc=>Object.assign({sc:rc.sc,rx:rc.rx,la:rc.la,td:rc.td,nd:rc.nd,dmax:rc.dmax,dmin:rc.dmin},rc.cum?Object.fromEntries(rc.cum.map((c,i)=>['cum'+i,c])):{}),
    results:rc=>({sc:rc.sc,rx:rc.rx,td:rc.td,la:rc.la,nd:rc.nd,dmax:rc.dmax,dmin:rc.dmin}),
    sieve:(rc,raw)=>rc.cum?[70,40,20,10,0].map((z,i)=>({sang:z,lab:i<4?String(z):'< 10',kl:raw['sieve'+i],rieng:rc.part[i],tich_luy:rc.cum[i]})):null,
    qr:[['sc','Bun bui set'],['rx','KLTT xop'],['td','Thoi det'],['la','Los Angeles'],['nd','Nen dap'],['dmax','Dmax'],['dmin','Dmin']],
    ph:{sc_m0:'500',sc_m10:'497',sc_m1:'500',sc_m11:'498',rx_V0:'10',rx_m0:'14025',rx_V1:'10',rx_m1:'14030',la_m1:'5001',la_m2:'3659',td_a0:'55',td_b0:'206',td_w0:'20',td_a1:'202',td_b1:'856',td_w1:'25',td_a2:'1021',td_b2:'4502',td_w2:'55',nd_a0:'456',nd_b0:'400',nd_w0:'45',nd_a1:'3325',nd_b1:'2902',nd_w1:'33',nd_a2:'3365',nd_b2:'2985',nd_w2:'22',sieve_total:'10000',sieve0:'0',sieve1:'752',sieve2:'3902',sieve3:'4856',sieve4:'490'},
    kind:()=>'num',
    sections:()=>[secL('Bùn, bụi, sét','TCVN 7572-8:2006',[['Lần thử 1',[['sc_m0','m: trước khi rửa (g)'],['sc_m10','m1: sau rửa, sấy khô (g)']]],['Lần thử 2',[['sc_m1','m: trước khi rửa (g)'],['sc_m11','m1: sau rửa, sấy khô (g)']]]],L2(rc1040,r=>r.sc==null?null:['Sc',fnum(r.sc,2)+' %','',false])),
      secL('Khối lượng thể tích xốp','TCVN 7572-6:2006',[['Lần thử 1',[['rx_V0','V: thể tích thùng (l)'],['rx_m0','m: khối lượng vật liệu (g)']]],['Lần thử 2',[['rx_V1','V: thể tích thùng (l)'],['rx_m1','m: khối lượng vật liệu (g)']]]],L2(rc1040,r=>r.rx==null?null:['ρx',fnum(r.rx,0)+' kg/m³','',false])),
      secL('Độ hao mòn Los Angeles','TCVN 7572-12:2006',[['',[['la_m1','m1: trước khi thử (g)'],['la_m2','m2: sót trên sàng 1,70 mm (g)']]]],L2(rc1040,r=>r.la==null?null:['LA',fnum(r.la,1)+' %','',false])),
      secL('Hạt thoi dẹt','TCVN 7572-13:2006. Nhập % KLHH của từng nhóm theo thực tế sàng mẫu (tổng bằng 100).',ix_(3).map(i=>[grpN[i],[['td_a'+i,'m1: hạt thoi dẹt (g)'],['td_b'+i,'m2: hạt còn lại (g)'],['td_w'+i,'% KLHH của nhóm']]]),L2(rc1040,r=>{const s=r.td_w;if(r.td==null&&s==null)return null;return r.td==null?['Tổng % KLHH',fnum(s,1),' (phải bằng 100)',Math.abs(s-100)>0.5]:['Td',fnum(r.td,1)+' %',' · tổng KLHH '+fnum(s,1),Math.abs(s-100)>0.5];})),
      secL('Độ nén dập trong xi lanh','TCVN 7572-11:2006. Nhập % KLHH của từng nhóm theo thực tế (tổng bằng 100).',ix_(3).map(i=>[grpN[i],[['nd_a'+i,'m1: trước khi nén (g)'],['nd_b'+i,'m2: sót sau khi nén (g)'],['nd_w'+i,'% KLHH của nhóm']]]),L2(rc1040,r=>{const s=r.nd_w;if(r.nd==null&&s==null)return null;return r.nd==null?['Tổng % KLHH',fnum(s,1),' (phải bằng 100)',Math.abs(s-100)>0.5]:['Nd',fnum(r.nd,1)+' %',' · tổng KLHH '+fnum(s,1),Math.abs(s-100)>0.5];})),
      secL('Thành phần hạt, Dmax, Dmin','TCVN 7572-2:2006',[['Khối lượng mẫu',[['sieve_total','Tổng mẫu đem sàng (g)']]],['Lượng sót trên từng sàng (g)',[['sieve0','Sàng 70 mm'],['sieve1','Sàng 40 mm'],['sieve2','Sàng 20 mm'],['sieve3','Sàng 10 mm'],['sieve4','< 10 mm (đáy khay)']]]],L2(rc1040,r=>r.dmax==null&&r.dmin==null?null:['Dmax / Dmin',fnum(r.dmax,1)+' / '+fnum(r.dmin,1)+' mm',r.loss!=null?' · hao hụt '+fnum(r.loss,2)+' %':'',false]))],
    need:d=>Object.keys(m1040).filter(k=>typeof d[k]!=='number').length,total:()=>Object.keys(m1040).length,valid:(d,rc)=>ok1040(d),
    head:['TT','Chỉ tiêu thử nghiệm','Phương pháp thử','Đơn vị','Kết quả'],table:r=>t1040.map((t,i)=>[i+1,t.name,t.std,t.unit,r[t.key]==null?'':fnum(r[t.key],dp1040[t.key])]),
    nhanXet:r=>r.sc==null?'':'Mẫu đá trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 7570:2006 (cốt liệu lớn).',
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp);return[['Bùn, bụi, sét',f(raw.sc_m0,1)+' → '+f(raw.sc_m10,1)+' · '+f(raw.sc_m1,1)+' → '+f(raw.sc_m11,1)+' g'],['KL thể tích xốp','V '+f(raw.rx_V0,1)+' / m '+f(raw.rx_m0,0)+' · V '+f(raw.rx_V1,1)+' / m '+f(raw.rx_m1,0)],['Los Angeles','m1 '+f(raw.la_m1,1)+' / m2 '+f(raw.la_m2,1)+' g'],
      ['Hạt thoi dẹt',ix_(3).map(i=>f(raw['td_a'+i],1)+'/'+f(raw['td_b'+i],1)+' (KLHH '+f(raw['td_w'+i],1)+')').join(' · ')],['Nén dập',ix_(3).map(i=>f(raw['nd_a'+i],1)+'/'+f(raw['nd_b'+i],1)+' (KLHH '+f(raw['nd_w'+i],1)+')').join(' · ')],['Thành phần hạt','Tổng '+f(raw.sieve_total,1)+' g · sót '+ix_(5).map(i=>f(raw['sieve'+i],1)).join(' · ')]];},
    qt:()=>[['Bùn, bụi, sét',[QT_C('m lần 1 (g)','sc_m0'),QT_C('m1 lần 1 (g)','sc_m10'),QT_C('m lần 2 (g)','sc_m1'),QT_C('m1 lần 2 (g)','sc_m11'),QT_R('Sc TB (%)','sc',2)]],['KL thể tích xốp',[QT_C('V lần 1 (l)','rx_V0'),QT_C('m lần 1 (g)','rx_m0'),QT_C('V lần 2 (l)','rx_V1'),QT_C('m lần 2 (g)','rx_m1'),QT_R('ρx TB (kg/m³)','rx',0)]],['Los Angeles',[QT_C('m1 (g)','la_m1'),QT_C('m2 (g)','la_m2'),QT_R('LA (%)','la',1)]],
      ['Hạt thoi dẹt',ix_(3).map(i=>[QT_C(['5-10','10-20','20-40'][i]+': m1 (g)','td_a'+i),QT_C(['5-10','10-20','20-40'][i]+': m2 (g)','td_b'+i),QT_C(['5-10','10-20','20-40'][i]+': %KLHH','td_w'+i,1)]).flat().concat([QT_R('Td (%)','td',1)])],
      ['Nén dập trong xi lanh',ix_(3).map(i=>[QT_C(['5-10','10-20','20-40'][i]+': m1 (g)','nd_a'+i),QT_C(['5-10','10-20','20-40'][i]+': m2 (g)','nd_b'+i),QT_C(['5-10','10-20','20-40'][i]+': %KLHH','nd_w'+i,1)]).flat().concat([QT_R('Nd (%)','nd',1)])],
      ['Thành phần hạt',QT_SIEVE('sieve',['sàng 70','sàng 40','sàng 20','sàng 10','< 10'],'sieve_total').concat([QT_R('Dmax (mm)','dmax',1),QT_R('Dmin (mm)','dmin',1)])]]});
  /* ===== Đá gốc */
  const mDG={};ix_(5).forEach(i=>{mDG['dg_a'+i]='B'+(5+i);mDG['dg_b'+i]='C'+(5+i);mDG['dg_c'+i]='D'+(5+i);mDG['dg_d'+i]='E'+(5+i);mDG['dg_F'+i]='G'+(5+i);});
  const tDG=[{code:'DG_01',name:'Cường độ chịu nén của đá gốc ở trạng thái bão hòa nước',std:'TCVN 7572:2006',unit:'MPa',key:'r'}];
  GTX.push(GT.DA_GOC={code:'DA_GOC',form:{code:'BM-DG-01',ver:'v1.0'},ten:'Đá gốc',b64:()=>B64N.DA_GOC,map:mDG,textKeys:[],
    fixed:[['B5','Mã loại mẫu','DA_GOC'],['B11','Số chữ số thập phân: diện tích',0],['B12','Số chữ số thập phân: lực nén',0],['B13','Số chữ số thập phân: cường độ chịu nén',1]],
    tests:tDG,dp:{r:1},rc:rcDG,rkeys:['r'],
    cacheCells:Object.assign({r:'H10'},...ix_(5).map(i=>({['S'+i]:'F'+(5+i),['R'+i]:'H'+(5+i)}))),
    expect:rc=>Object.assign({r:rc.r},...rc.rows.map((x,i)=>({['S'+i]:x.S,['R'+i]:x.R}))),
    results:rc=>({r:rc.r,rows:rc.rows.map(x=>({S:x.S,F:x.F,R:x.R}))}),
    qr:[['r','Nen bao hoa']],
    ph:Object.assign({},...ix_(5).map(i=>({['dg_a'+i]:['48','44','44','44','44'][i],['dg_b'+i]:['45','44','42','45','45'][i],['dg_c'+i]:['47','45','43','45','45'][i],['dg_d'+i]:['46','46','45','46','46'][i],['dg_F'+i]:['169','150','176','188','145'][i]}))),
    kind:()=>'num',
    sections:()=>[secL('Nén đá gốc bão hòa nước','TCVN 7572:2006. Diện tích = trung bình hai mặt (dài x rộng).',ix_(5).map(i=>['Viên '+(i+1),[['dg_a'+i,'Mặt trên: dài (mm)'],['dg_b'+i,'Mặt trên: rộng (mm)'],['dg_c'+i,'Mặt dưới: dài (mm)'],['dg_d'+i,'Mặt dưới: rộng (mm)'],['dg_F'+i,'Lực nén phá hoại (kN)']]]),L2(rcDG,r=>r.r==null?null:['Cường độ TB',fnum(r.r,1)+' MPa','',false]))],
    need:d=>Object.keys(mDG).filter(k=>typeof d[k]!=='number').length,total:()=>25,valid:(d,rc)=>Object.keys(mDG).every(k=>typeof d[k]==='number')&&rc.r!=null,
    head:['TT','Ký hiệu mẫu','Diện tích TB (mm²)','Lực nén (kN)','Cường độ nén (MPa)'],
    table:r=>(r.rows||[]).map((x,i)=>[i+1,'Viên '+(i+1),fnum(x.S,0),fnum(x.F,0),fnum(x.R,1)]).concat(r.r==null?[]:[['','Trung bình','','',fnum(r.r,1)]]),
    nhanXet:r=>r.r==null?'':'Cường độ chịu nén của đá gốc ở trạng thái bão hòa nước là trung bình của 5 viên thử. Hồ sơ chưa nêu mức yêu cầu nên phiếu không kết luận đạt hay không đạt.',
    rawRows:raw=>ix_(5).map(i=>['Viên '+(i+1),fnum(raw['dg_a'+i],1)+' x '+fnum(raw['dg_b'+i],1)+' / '+fnum(raw['dg_c'+i],1)+' x '+fnum(raw['dg_d'+i],1)+' mm · lực '+fnum(raw['dg_F'+i],1)+' kN']),
    qt:()=>[['Nén đá gốc bão hòa',ix_(5).map(i=>[QT_C('V'+(i+1)+' a (mm)','dg_a'+i,1),QT_C('V'+(i+1)+' b (mm)','dg_b'+i,1),QT_C('V'+(i+1)+' c (mm)','dg_c'+i,1),QT_C('V'+(i+1)+' d (mm)','dg_d'+i,1),QT_C('V'+(i+1)+' lực (kN)','dg_F'+i,1)]).flat().concat([QT_R('Cường độ TB (MPa)','r',1)])]]});
  /* ===== Đá láng nhựa (3 cỡ) */
  [['1','4,75/9,5','9,5','4,75','< 4,75','BM-LN-01'],['2','9,5/12,5','12,5','9,5','< 9,5','BM-LN-02'],['3','12,5/19','19','12,5','< 12,5','BM-LN-03']].forEach(([k,co,s0,s1,s2,code])=>{
    const loai='DA_LN_'+k,mLN={la_m1:'B5',la_m2:'C5',td_m1:'B9',td_m2:'C9',my:'B12',sc_m0:'B16',sc_m10:'C16',sc_m1:'B17',sc_m11:'C17',db:'B21',sieve0:'B25',sieve1:'B26',sieve2:'B27'};
    const REQ={la:25,td:15,my:5,sc:1,db:3,s0:15,s2:10};
    const tLN=[{code:'LN'+k+'_01',name:'Độ mài mòn Los Angeles',std:'TCVN 7572-12:2006',unit:'%',key:'la',rq:'≤ 25'},{code:'LN'+k+'_02',name:'Lượng hạt thoi dẹt (hạt trên sàng 4,75 mm)',std:'TCVN 7572-13:2006',unit:'%',key:'td',rq:'≤ 15'},{code:'LN'+k+'_03',name:'Lượng hạt mềm yếu và phong hóa',std:'TCVN 7572-17:2006',unit:'%',key:'my',rq:'≤ 5'},
      {code:'LN'+k+'_04',name:'Hàm lượng chung bụi, bùn, sét',std:'TCVN 7572-8:2006',unit:'%',key:'sc',rq:'≤ 1'},{code:'LN'+k+'_05',name:'Độ dính bám của đá với nhựa',std:'TCVN 7504:2005',unit:'cấp',key:'db',rq:'≥ Cấp 3'},
      {code:'LN'+k+'_06',name:'Thành phần hạt: sót riêng trên sàng '+s0+' mm',std:'TCVN 7572-2:2006',unit:'%',key:'s0',rq:'≤ 15'},{code:'LN'+k+'_07',name:'Thành phần hạt: sót riêng trên sàng '+s1+' mm',std:'TCVN 7572-2:2006',unit:'%',key:'s1',rq:'-'},{code:'LN'+k+'_08',name:'Thành phần hạt: lọt sàng '+s1+' mm (đáy)',std:'TCVN 7572-2:2006',unit:'%',key:'s2',rq:'≤ 10'}];
    const dpLN={la:1,td:1,my:1,sc:2,db:0,s0:1,s1:1,s2:1};
    const okLN=r=>r.la!=null&&r.td!=null&&r.sc!=null&&r.db!=null&&r.s0!=null&&r.s2!=null&&r.la<=REQ.la&&r.td<=REQ.td&&(r.my==null||r.my<=REQ.my)&&r.sc<=REQ.sc&&r.db>=REQ.db&&r.s0<=REQ.s0&&r.s2<=REQ.s2;
    const reqK=Object.keys(mLN).filter(x=>x!=='my');
    GTX.push(GT[loai]={code:loai,form:{code,ver:'v1.0'},ten:'Đá láng nhựa '+co,b64:()=>B64N[loai],map:mLN,textKeys:[],
      fixed:[['B5','Mã loại mẫu',loai],['B11','Số chữ số thập phân: Los Angeles',1],['B12','Số chữ số thập phân: hạt thoi dẹt',1],['B13','Số chữ số thập phân: hạt mềm yếu',1],['B14','Số chữ số thập phân: bụi, bùn, sét',2],['B15','Số chữ số thập phân: độ dính bám',0],['B16','Số chữ số thập phân: lượng sót riêng',1],
        ['B18','Los Angeles tối đa',25],['B19','Hạt thoi dẹt tối đa',15],['B20','Hạt mềm yếu tối đa',5],['B21','Bụi, bùn, sét tối đa',1],['B22','Độ dính bám tối thiểu (cấp)',3],['B23','Sót riêng sàng lớn tối đa',15],['B24','Lọt sàng đáy tối đa',10]],
      tests:tLN,dp:dpLN,rc:rcLN,rkeys:['la','td','sc','db','s0','s1','s2'],
      cacheCells:{la:'D5',td:'D9',my:'D12',sc:'D18',db:'D21',s0:'C25',s1:'C26',s2:'C27'},
      expect:rc=>({la:rc.la,td:rc.td,my:rc.my,sc:rc.sc,db:rc.db,s0:rc.s0,s1:rc.s1,s2:rc.s2}),
      results:rc=>({la:rc.la,td:rc.td,my:rc.my,sc:rc.sc,db:rc.db,s0:rc.s0,s1:rc.s1,s2:rc.s2}),
      qr:[['la','Los Angeles'],['td','Thoi det'],['sc','Bui bun set'],['db','Dinh bam'],['s0','Sot sang lon'],['s2','Lot day']],
      ph:{la_m1:'5000',la_m2:'4240',td_m1:'83',td_m2:'917',my:'',sc_m0:'1000',sc_m10:'997.5',sc_m1:'1000',sc_m11:'997.5',db:'4',sieve0:'656',sieve1:'8569',sieve2:'265'},
      kind:()=>'num',
      sections:()=>[secL('Độ hao mòn Los Angeles','TCVN 7572-12:2006',[['',[['la_m1','m1: trước khi thử (g)'],['la_m2','m2: sót trên sàng 1,70 mm (g)']]]],L2(rcLN,r=>r.la==null?null:['LA',fnum(r.la,1)+' %',' (yêu cầu ≤ 25)',r.la>REQ.la])),
        secL('Hạt thoi dẹt','TCVN 7572-13:2006',[['',[['td_m1','m1: hạt thoi dẹt (g)'],['td_m2','m2: hạt còn lại (g)']]]],L2(rcLN,r=>r.td==null?null:['Td',fnum(r.td,1)+' %',' (yêu cầu ≤ 15)',r.td>REQ.td])),
        secL('Hạt mềm yếu và phong hóa','TCVN 7572-17:2006. Không thử thì để trống.',[['',[['my','Kết quả (%)']]]],L2(rcLN,r=>r.my==null?null:['Mềm yếu',fnum(r.my,1)+' %',' (yêu cầu ≤ 5)',r.my>REQ.my])),
        secL('Bụi, bùn, sét','TCVN 7572-8:2006',[['Lần thử 1',[['sc_m0','m: trước khi rửa (g)'],['sc_m10','m1: sau rửa, sấy khô (g)']]],['Lần thử 2',[['sc_m1','m: trước khi rửa (g)'],['sc_m11','m1: sau rửa, sấy khô (g)']]]],L2(rcLN,r=>r.sc==null?null:['Sc',fnum(r.sc,2)+' %',' (yêu cầu ≤ 1)',r.sc>REQ.sc])),
        secL('Độ dính bám của đá với nhựa','TCVN 7504:2005. Cấp từ 1 đến 5.',[['',[['db','Cấp độ dính bám']]]],L2(rcLN,r=>r.db==null?null:['Dính bám','Cấp '+fnum(r.db,0),' (yêu cầu ≥ cấp 3)',r.db<REQ.db||r.db>5||r.db!==Math.floor(r.db)])),
        secL('Thành phần hạt','TCVN 7572-2:2006',[['Khối lượng sót lại (g)',[['sieve0','Sàng '+s0+' mm'],['sieve1','Sàng '+s1+' mm'],['sieve2',s2+' mm (đáy khay)']]]],L2(rcLN,r=>r.s0==null?null:['Sót riêng',fnum(r.s0,1)+' / '+fnum(r.s1,1)+' / '+fnum(r.s2,1)+' %',' (sàng lớn ≤ 15, đáy ≤ 10)',r.s0>REQ.s0||r.s2>REQ.s2]))],
      need:d=>reqK.filter(k=>typeof d[k]!=='number').length,total:()=>reqK.length,valid:(d,rc)=>reqK.every(k=>typeof d[k]==='number')&&rc.db>=1&&rc.db<=5&&rc.db===Math.floor(rc.db)&&rc.s0!=null,
      head:['TT','Chỉ tiêu kiểm tra','Phương pháp thử','Đơn vị','Kết quả','Mức yêu cầu'],
      table:r=>tLN.map((t,i)=>[i<5?i+1:'6.'+(i-4),t.name,t.std,t.unit,t.key==='my'?(r.my==null?'-':fnum(r.my,1)):(r[t.key]==null?'':fnum(r[t.key],dpLN[t.key])),t.rq]),
      nhanXet:r=>(r.la==null||r.s0==null)?'':(okLN(r)?'Mẫu đá dăm trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 8863:2011.':'Mẫu đá dăm trên có chỉ tiêu không đạt yêu cầu kỹ thuật theo TCVN 8863:2011.'),
      rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp);return[['Los Angeles','m1 '+f(raw.la_m1,1)+' / m2 '+f(raw.la_m2,1)+' g'],['Hạt thoi dẹt','m1 '+f(raw.td_m1,1)+' / m2 '+f(raw.td_m2,1)+' g'],['Hạt mềm yếu',raw.my==null?'không thử':f(raw.my,1)+' %'],['Bụi, bùn, sét',f(raw.sc_m0,1)+' → '+f(raw.sc_m10,1)+' · '+f(raw.sc_m1,1)+' → '+f(raw.sc_m11,1)+' g'],['Độ dính bám','cấp '+f(raw.db,0)],['Thành phần hạt','sót '+[0,1,2].map(i=>f(raw['sieve'+i],1)).join(' · ')+' g']];},
      qt:()=>[['Los Angeles',[QT_C('m1 (g)','la_m1'),QT_C('m2 (g)','la_m2'),QT_R('LA (%)','la',1)]],['Hạt thoi dẹt',[QT_C('m1 (g)','td_m1'),QT_C('m2 (g)','td_m2'),QT_R('Td (%)','td',1)]],['Mềm yếu, phong hóa',[QT_C('Kết quả (%)','my',1)]],['Bụi, bùn, sét',[QT_C('m lần 1 (g)','sc_m0'),QT_C('m1 lần 1 (g)','sc_m10'),QT_C('m lần 2 (g)','sc_m1'),QT_C('m1 lần 2 (g)','sc_m11'),QT_R('Sc (%)','sc',2)]],['Dính bám',[QT_C('Cấp','db',0)]],
        ['Thành phần hạt',[QT_C('Sót '+s0+' (g)','sieve0'),QT_C('Sót '+s1+' (g)','sieve1'),QT_C(s2+' (g)','sieve2'),QT_R('Sót riêng '+s0+' (%)','s0',1),QT_R('Lọt đáy (%)','s2',1)]]]});
  });
  /* ===== Gạch (đặc, 2 lỗ, 6 lỗ) */
  [['DAC','Gạch đặc đất sét nung','BM-GD-01','GACH_DAC'],['2L','Gạch rỗng 2 lỗ đất sét nung','BM-G2-01','GACH_2L'],['6L','Gạch rỗng 6 lỗ đất sét nung','BM-G6-01','GACH_6L']].forEach(([k,ten,code,loai])=>{
    const mG={};
    ix_(5).forEach(i=>{ix_(3).forEach(j=>{const c=String.fromCharCode(66+j),c2=String.fromCharCode(69+j);mG['L'+i+j]=c+(5+i);mG['W'+i+j]=c+(14+i);mG['H'+i+j]=c+(23+i);mG['a'+i+j]=c+(41+i);mG['b'+i+j]=c2+(41+i);mG['c'+i+j]=c+(48+i);mG['d'+i+j]=c2+(48+i);});mG['m0_'+i]='B'+(32+i);mG['m1_'+i]='C'+(32+i);mG['F'+i]='E'+(55+i);});
    const tG=[{code:k+'_01',name:'Kích thước cơ bản (dài, rộng, dày)',std:'TCVN 6355-1:2009',unit:'mm',key:'dai'},{code:k+'_02',name:'Độ bền nén',std:'TCVN 6355-2:2009',unit:'MPa',key:'nen'},{code:k+'_03',name:'Độ hút nước của gạch',std:'TCVN 6355-4:2009',unit:'%',key:'hut'}];
    const dpG={dai:1,rong:1,day:1,hut:1,nen:1};
    const phG={};
    const LL=[[205,204,205],[203,204,206],[205,204,207],[208,208,209],[204,203,208]],WW=[[98,97,96],[98,95,97],[94,93,92],[96,94,98],[95,97,93]],HH=[[56.1,55.4,54.1],[53.4,55.7,54.2],[52.5,51.3,53.6],[54.8,54.5,54.8],[55.3,56.2,53.3]];
    const TOP=[[95,96,97,98,94,98],[96,94,93,92,95,97],[93,94,96,94,98,95],[96,95,94,96,92,94],[94,96,97,95,99,93]],BOT=[[88,89,93,95,97,96],[94,95,93,92,95,97],[94,95,95,93,92,94],[96,95,94,96,95,94],[96,95,94,96,95,94]];
    ix_(5).forEach(i=>{ix_(3).forEach(j=>{phG['L'+i+j]=String(LL[i][j]);phG['W'+i+j]=String(WW[i][j]);phG['H'+i+j]=String(HH[i][j]);phG['a'+i+j]=String(TOP[i][j]);phG['b'+i+j]=String(TOP[i][3+j]);phG['c'+i+j]=String(BOT[i][j]);phG['d'+i+j]=String(BOT[i][3+j]);});phG['m0_'+i]=String([2135,1856,1702,1502,1366][i]);phG['m1_'+i]=String([2352,2000,1985,1602,1489][i]);phG['F'+i]=String([85,86,73,88,65][i]);});
    const cc={dai:'E10',rong:'E19',day:'E28',hut:'D37',nen:'F60'};ix_(5).forEach(i=>{cc['hi'+i]='D'+(32+i);cc['St'+i]='B'+(55+i);cc['Sd'+i]='C'+(55+i);cc['S'+i]='D'+(55+i);cc['R'+i]='F'+(55+i);});
    const dimSec=(t,p,lab)=>secL(t,'TCVN 6355-1:2009. Mỗi viên đo 3 lần.',ix_(5).map(i=>['Viên '+(i+1),ix_(3).map(j=>[p+i+j,lab+(j+1)+' (mm)'])]),L2(rcGach,r=>{const v=p==='L'?r.dai:p==='W'?r.rong:r.day;return v==null?null:['Trung bình',fnum(v,1)+' mm','',false];}));
    GTX.push(GT[loai]={code:loai,form:{code,ver:'v1.0'},ten,b64:()=>B64N[loai],map:mG,textKeys:[],
      fixed:[['B5','Mã loại mẫu',loai],['B11','Số chữ số thập phân: kích thước',1],['B12','Số chữ số thập phân: độ hút nước',1],['B13','Số chữ số thập phân: độ bền nén',1],['B15','Số viên thử mỗi chỉ tiêu',5]],
      tests:tG,dp:dpG,rc:rcGach,rkeys:['dai','rong','day','hut','nen'],cacheCells:cc,
      expect:rc=>Object.assign({dai:rc.dai,rong:rc.rong,day:rc.day,hut:rc.hut,nen:rc.nen},...rc.hi.map((x,i)=>({['hi'+i]:x})),...rc.rows.map((x,i)=>({['St'+i]:x.St,['Sd'+i]:x.Sd,['S'+i]:x.S,['R'+i]:x.R}))),
      results:rc=>({dai:rc.dai,rong:rc.rong,day:rc.day,hut:rc.hut,nen:rc.nen,R:rc.rows.map(x=>x.R)}),
      qr:[['dai','Dai'],['rong','Rong'],['day','Day'],['nen','Do ben nen'],['hut','Hut nuoc']],ph:phG,kind:()=>'num',
      sections:()=>[dimSec('Kích thước: dài','L','L'),dimSec('Kích thước: rộng','W','W'),dimSec('Kích thước: dày (chiều cao)','H','H'),
        secL('Độ hút nước','TCVN 6355-4:2009',ix_(5).map(i=>['Viên '+(i+1),[['m0_'+i,'m0: khối lượng khô (g)'],['m1_'+i,'m1: sau ngâm nước (g)']]]),L2(rcGach,r=>r.hut==null?null:['Hút nước TB',fnum(r.hut,1)+' %','',false])),
        secL('Độ bền nén: kích thước mặt ép trên','TCVN 6355-2:2009. a1..a3 và b1..b3 là các lần đo hai cạnh mặt ép trên.',ix_(5).map(i=>['Viên '+(i+1),ix_(3).map(j=>['a'+i+j,'a'+(j+1)+' (mm)']).concat(ix_(3).map(j=>['b'+i+j,'b'+(j+1)+' (mm)']))]),null),
        secL('Độ bền nén: kích thước mặt ép dưới','TCVN 6355-2:2009. c1..c3 và d1..d3 là các lần đo hai cạnh mặt ép dưới.',ix_(5).map(i=>['Viên '+(i+1),ix_(3).map(j=>['c'+i+j,'c'+(j+1)+' (mm)']).concat(ix_(3).map(j=>['d'+i+j,'d'+(j+1)+' (mm)']))]),null),
        secL('Độ bền nén: lực phá hoại','TCVN 6355-2:2009',[['Lực nén (kN)',ix_(5).map(i=>['F'+i,'Viên '+(i+1)])]],L2(rcGach,r=>r.nen==null?null:['Độ bền nén TB',fnum(r.nen,1)+' MPa','',false]))],
      need:d=>Object.keys(mG).filter(k=>typeof d[k]!=='number').length,total:()=>Object.keys(mG).length,valid:(d,rc)=>Object.keys(mG).every(k=>typeof d[k]==='number')&&rc.nen!=null&&rc.hut!=null,
      head:['TT','Chỉ tiêu kiểm tra','Phương pháp thử','Đơn vị','Kết quả (TB 5 viên)'],
      table:r=>[[1,'Kích thước cơ bản: dài','TCVN 6355-1:2009','mm',r.dai==null?'':fnum(r.dai,1)],['','Kích thước cơ bản: rộng','TCVN 6355-1:2009','mm',r.rong==null?'':fnum(r.rong,1)],['','Kích thước cơ bản: dày','TCVN 6355-1:2009','mm',r.day==null?'':fnum(r.day,1)],[2,'Độ bền nén','TCVN 6355-2:2009','MPa',r.nen==null?'':fnum(r.nen,1)],[3,'Độ hút nước của gạch','TCVN 6355-4:2009','%',r.hut==null?'':fnum(r.hut,1)]],
      nhanXet:r=>r.nen==null?'':'Kết quả là giá trị trung bình của 5 viên gạch thử. Hồ sơ chưa nêu mức yêu cầu nên phiếu không kết luận đạt hay không đạt.',
      rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp);const avg3=(p,i)=>ix_(3).map(j=>f(raw[p+i+j],1)).join('/');return ix_(5).map(i=>['Viên '+(i+1),'dài '+avg3('L',i)+' · rộng '+avg3('W',i)+' · dày '+avg3('H',i)+' · m0 '+f(raw['m0_'+i],0)+' / m1 '+f(raw['m1_'+i],0)+' g · lực '+f(raw['F'+i],1)+' kN']);},
      qt:()=>[['Kích thước dài',ix_(5).map(i=>ix_(3).map(j=>QT_C('V'+(i+1)+' L'+(j+1),'L'+i+j,1))).flat().concat([QT_R('Dài TB (mm)','dai',1)])],['Kích thước rộng',ix_(5).map(i=>ix_(3).map(j=>QT_C('V'+(i+1)+' W'+(j+1),'W'+i+j,1))).flat().concat([QT_R('Rộng TB (mm)','rong',1)])],['Kích thước dày',ix_(5).map(i=>ix_(3).map(j=>QT_C('V'+(i+1)+' H'+(j+1),'H'+i+j,1))).flat().concat([QT_R('Dày TB (mm)','day',1)])],
        ['Hút nước',ix_(5).map(i=>[QT_C('V'+(i+1)+' m0 (g)','m0_'+i,1),QT_C('V'+(i+1)+' m1 (g)','m1_'+i,1)]).flat().concat([QT_R('Hút nước TB (%)','hut',1)])],['Độ bền nén',ix_(5).map(i=>QT_C('V'+(i+1)+' lực (kN)','F'+i,1)).concat([QT_R('Độ bền nén TB (MPa)','nen',1)])]]});
  });
  /* ===== Thép xây dựng */
  const mT={},rowKeys=g=>ix_(3).flatMap(i=>['m'+g+i,'Lc'+g+i,'L1_'+g+i,'L2_'+g+i,'Fy'+g+i,'Fu'+g+i,'bd'+g+i]);
  ix_(3).forEach(g=>{mT['dd'+g]='B'+(5+g);mT['tk'+g]='C'+(5+g);mT['mac'+g]='D'+(5+g);mT['rsy'+g]='E'+(5+g);mT['rsu'+g]='F'+(5+g);mT['rdl'+g]='G'+(5+g);mT['rkl'+g]='H'+(5+g);
    ix_(3).forEach(i=>{const r=10+3*g+i;mT['m'+g+i]='C'+r;mT['Lc'+g+i]='D'+r;mT['L1_'+g+i]='E'+r;mT['L2_'+g+i]='F'+r;mT['Fy'+g+i]='G'+r;mT['Fu'+g+i]='H'+r;mT['bd'+g+i]='I'+r;});});
  const tTX=[{code:'TX_01',name:'Thử kéo: giới hạn chảy, giới hạn đứt, dãn dài',std:'TCVN 197:2002',unit:'N/mm²',key:'sy_min0'},{code:'TX_02',name:'Thử uốn nguội',std:'TCVN 198:2008',unit:'-',key:'nut0'},{code:'TX_03',name:'Khối lượng 1 m dài và sai lệch khối lượng',std:'TCVN 7937-1:2009',unit:'kg/m',key:'sl_max0'}];
  const ccT={};ix_(3).forEach(g=>{ccT['sy_min'+g]='C'+(22+g);ccT['su_min'+g]='D'+(22+g);ccT['dl_min'+g]='E'+(22+g);ccT['sl_max'+g]='F'+(22+g);ccT['nut'+g]='G'+(22+g);});
  const nG=d=>Math.max(1,Math.min(3,d.n||3));
  const needG=(d,g)=>{let c=0;if(typeof d['dd'+g]!=='number')c++;if(!d['tk'+g])c++;ix_(3).forEach(i=>{['m','Lc','L1_','L2_','Fy','Fu'].forEach(p=>{if(typeof d[p+g+i]!=='number')c++;});if(!d['bd'+g+i])c++;});return c;};
  const grpName=g=>'Nhóm '+(g+1);
  GTX.push(GT.THEP_XD={code:'THEP_XD',form:{code:'BM-TX-01',ver:'v1.0'},ten:'Thép xây dựng',b64:()=>B64N.THEP_XD,map:mT,textKeys:[],textPrefix:['tk','mac','bd'],
    fixed:[['B5','Mã loại mẫu','THEP_XD'],['B11','Số chữ số thập phân: kg/m',3],['B12','Số chữ số thập phân: đường kính thực',2],['B13','Số chữ số thập phân: lực',1],['B14','Số chữ số thập phân: giới hạn chảy, đứt',0],['B15','Số chữ số thập phân: dãn dài',1],['B16','Số chữ số thập phân: sai lệch khối lượng',1],['B17','Số nhóm đường kính tối đa',3],['B18','Khối lượng riêng thép (g/cm³)',7.85],['B19','Hằng số π',3.1416]],
    tests:tTX,dp:{sl_max:1,nut:0,sy_min:0,su_min:0,dl_min:1,n:0},rc:rcTX,
    rkeys:(raw,rc)=>rc.groups.flatMap(G=>['sy_min','su_min','dl_min','sl_max','nut'].map(k=>k+G.g)),
    cacheCells:ccT,
    rowCache:rc=>{const o={};rc.groups.forEach(G=>G.rows.forEach((x,i)=>{const r=10+3*G.g+i;[['J','Sdn'],['K','Sth'],['L','Dth'],['M','kgm'],['N','kgs'],['O','sl'],['P','sy'],['Q','su'],['R','dl']].forEach(([c,k])=>{if(x[k]!=null)o[c+r]=x[k];});}));return o;},
    expect:rc=>{const o=GT.THEP_XD.rowCache(rc);rc.groups.forEach(G=>['sy_min','su_min','dl_min','sl_max','nut'].forEach(k=>{if(G[k]!=null)o[k+G.g]=G[k];}));return o;},
    results:(rc,raw)=>{const o={n:rc.n,groups:rc.groups.map(G=>({g:G.g,d:G.d,tk:G.tk,mac:G.mac,kl:G.kl,rows:G.rows.map(x=>({kgm:x.kgm,sl:x.sl,Dth:x.Dth,Fy:x.Fy,sy:x.sy,Fu:x.Fu,su:x.su,dl:x.dl,bend:x.bd}))}))};rc.groups.forEach(G=>['sy_min','su_min','dl_min','sl_max','nut'].forEach(k=>{o[k+G.g]=G[k];}));return o;},
    qr:[['sy_min0','Gh chay N1'],['su_min0','Gh dut N1'],['dl_min0','Dan dai N1'],['sy_min1','Gh chay N2'],['su_min1','Gh dut N2'],['dl_min1','Dan dai N2'],['sy_min2','Gh chay N3'],['su_min2','Gh dut N3'],['dl_min2','Dan dai N3']],
    ph:(()=>{const o={mac0:'CB240-T',rsy0:'240',rsu0:'380',rdl0:'20'};
      [[6,[[105,45.5,3,3.89,7,24],[115,50,3,3.85,7,24],[130,56.2,3,3.86,7,23.5]]],[10,[[232.2,39,5,6.21,25,39],[264.2,46.3,5,6.15,26,41],[286.3,49.9,5,6.19,26,40]]],[12,[[322,37.6,6,7.45,39,60],[484,56.8,6,7.42,38,62],[485,57,6,7.33,41,61]]]].forEach(([d,rows],g)=>{
        o['dd'+g]=String(d);o['tk'+g]='VPS';rows.forEach((x,i)=>{o['m'+g+i]=String(x[0]);o['Lc'+g+i]=String(x[1]);o['L1_'+g+i]=String(x[2]);o['L2_'+g+i]=String(x[3]);o['Fy'+g+i]=String(x[4]);o['Fu'+g+i]=String(x[5]);o['bd'+g+i]='Không nứt';});});
      return o;})(),
    kind:k=>/^(tk|mac)\d$/.test(k)?'text':(/^bd\d\d$/.test(k)?'bend':'num'),
    sections:d=>{const out=[];for(let g=0;g<nG(d);g++){
        out.push(secL(grpName(g)+': đường kính, ký hiệu, yêu cầu','Ba mẫu thử cùng đường kính. Yêu cầu kỹ thuật để trống thì phiếu không kết luận cho nhóm.',[['Đường kính và ký hiệu',[['dd'+g,'Đường kính danh nghĩa d (mm)'],['tk'+g,'Ký hiệu / nhà sản xuất']]],['Yêu cầu kỹ thuật (nhập nếu có)',[['mac'+g,'Mác thép'],['rsy'+g,'Giới hạn chảy tối thiểu (N/mm²)'],['rsu'+g,'Giới hạn đứt tối thiểu (N/mm²)'],['rdl'+g,'Dãn dài tối thiểu (%)'],['rkl'+g,'Sai lệch khối lượng tối đa (±%)']]]],null));
        out.push(secL(grpName(g)+': số liệu 3 mẫu thử','TCVN 197:2002, TCVN 198:2008, TCVN 7937-1:2009. L1 là chiều dài đo ban đầu, L2 là chiều dài đo sau khi kéo đứt.',ix_(3).map(i=>['Mẫu '+(i+1),[['m'+g+i,'Khối lượng (g)'],['Lc'+g+i,'Chiều dài (cm)'],['L1_'+g+i,'L1 (cm)'],['L2_'+g+i,'L2 (cm)'],['Fy'+g+i,'Lực chảy (kN)'],['Fu'+g+i,'Lực đứt (kN)'],['bd'+g+i,'Thử uốn']]]),
          dd=>{const G=rcTX(dd).groups.find(x=>x.g===g);if(!G||G.sy_min==null)return null;return['D'+G.d+': chảy / đứt / dãn dài nhỏ nhất',fnum(G.sy_min,0)+' / '+fnum(G.su_min,0)+' N/mm² / '+fnum(G.dl_min,1)+' %',G.kl&&G.kl!=='CHƯA XÉT'?' · '+G.kl:'',G.kl==='KHÔNG ĐẠT'];}));}
      return out;},
    need:d=>{let c=0;for(let g=0;g<nG(d);g++)c+=needG(d,g);return c;},total:d=>nG(d)*23,valid:(d,rc)=>GT.THEP_XD.need(d)===0&&rc.n===nG(d),
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn',onclick:()=>{if(nG(d)>=3){toast('Tối đa 3 nhóm đường kính trên một phiếu. Hãy tạo thêm mẫu thép khác cùng phiếu yêu cầu.','bad');return;}d.n=nG(d)+1;again();}},'＋ Thêm nhóm đường kính'),
      nG(d)>1?h('button',{class:'btn',onclick:()=>{const g=nG(d)-1;['dd','tk','mac','rsy','rsu','rdl','rkl'].forEach(p=>{delete d[p+g];});rowKeys(g).forEach(k=>{delete d[k];});d.n=g;again();}},'Bớt một nhóm'):null),
    head:['TT','Loại (mm)','KL 1 m dài (kg/m) / sai lệch (%)','Đường kính thực (mm)','Chảy: lực (kN) / giới hạn (N/mm²)','Đứt: lực (kN) / giới hạn (N/mm²)','Dãn dài (%)','Thử uốn'],
    table:r=>{let t=0;return(r.groups||[]).flatMap(G=>G.rows.map(x=>[++t,'D'+(G.d==null?'':fnum(G.d,0)),x.kgm==null?'':fnum(x.kgm,3)+' / '+fnum(x.sl,1),x.Dth==null?'':fnum(x.Dth,2),x.Fy==null?'':fnum(x.Fy,1)+' / '+fnum(x.sy,0),x.Fu==null?'':fnum(x.Fu,1)+' / '+fnum(x.su,0),x.dl==null?'':fnum(x.dl,1),x.bend||x.bd||'']));},
    nhanXet:r=>{const p=(r.groups||[]).filter(G=>G.kl==='ĐẠT'||G.kl==='KHÔNG ĐẠT').map(G=>'Nhóm thép D'+fnum(G.d,0)+(G.mac?', mác '+G.mac:'')+': '+(G.kl==='ĐẠT'?'các chỉ tiêu đã kiểm tra đạt yêu cầu.':'có chỉ tiêu không đạt yêu cầu.'));return p.length?p.join(' '):((r.groups||[]).length?'Kết quả thử nghiệm các mẫu thép nêu trên. Chưa nhập yêu cầu kỹ thuật nên phiếu không kết luận đạt hay không đạt.':'');},
    rawRows:raw=>{const out=[];ix_(3).forEach(g=>{if(raw['dd'+g]==null&&!raw['tk'+g])return;out.push([grpName(g)+' · D'+fnum(raw['dd'+g],0)+' · '+(raw['tk'+g]||''),(raw['mac'+g]?'mác '+raw['mac'+g]+' · ':'')+'yêu cầu chảy ≥ '+fnum(raw['rsy'+g],0)+', đứt ≥ '+fnum(raw['rsu'+g],0)+', dãn dài ≥ '+fnum(raw['rdl'+g],1)]);
        ix_(3).forEach(i=>out.push(['  Mẫu '+(i+1),'m '+fnum(raw['m'+g+i],1)+' g · dài '+fnum(raw['Lc'+g+i],1)+' cm · L1 '+fnum(raw['L1_'+g+i],2)+' · L2 '+fnum(raw['L2_'+g+i],2)+' · Fy '+fnum(raw['Fy'+g+i],1)+' · Fu '+fnum(raw['Fu'+g+i],1)+' kN · '+(raw['bd'+g+i]||'')]));});return out;},
    qt:()=>ix_(3).map(g=>['Nhóm '+(g+1),[QT_C('d (mm)','dd'+g,0)].concat(ix_(3).flatMap(i=>[QT_C('M'+(i+1)+' KL (g)','m'+g+i,1),QT_C('M'+(i+1)+' dài (cm)','Lc'+g+i,2),QT_C('M'+(i+1)+' L1','L1_'+g+i,2),QT_C('M'+(i+1)+' L2','L2_'+g+i,2),QT_C('M'+(i+1)+' Fy (kN)','Fy'+g+i,1),QT_C('M'+(i+1)+' Fu (kN)','Fu'+g+i,1)])).concat([QT_R('Gh chảy min','sy_min'+g,0),QT_R('Gh đứt min','su_min'+g,0),QT_R('Dãn dài min','dl_min'+g,1),QT_R('|Sai lệch KL| max','sl_max'+g,1)])])});
  GTX.forEach(G=>G.tests.forEach(t=>ALL_TESTS.push(t)));
  /* quan trắc cho xi măng và thép hình */
  GT.XM_PCB40.qt=()=>[['Độ mịn',[QT_C('m lần 1 (g)','dm_m0'),QT_C('p lần 1 (g)','dm_p0',2),QT_C('m lần 2 (g)','dm_m1'),QT_C('p lần 2 (g)','dm_p1',2),QT_R('Độ mịn TB (%)','mjn',1)]],['Đông kết',[QT_C('Bắt đầu (phút)','dk_bd',0),QT_C('Kết thúc (phút)','dk_kt',0),QT_R('Bắt đầu (phút)','bd',0),QT_R('Kết thúc (phút)','kt',0)]],
    ['Ổn định thể tích',[QT_C('Kim 1: A (mm)','on_A0',1),QT_C('Kim 1: C (mm)','on_C0',1),QT_C('Kim 2: A (mm)','on_A1',1),QT_C('Kim 2: C (mm)','on_C1',1),QT_R('C - A TB (mm)','on',1)]],['Cường độ 3 ngày',ix_(6).map(i=>QT_C('Viên '+(i+1)+' (kN)','r3_'+i,1)).concat([QT_R('R3 (MPa)','r3',1)])],
    ['Quy về 28 ngày',ix_(6).map(i=>QT_C('Tự nhiên V'+(i+1)+' (kN)','r0_'+i,1)).concat(ix_(6).map(i=>QT_C('Luộc V'+(i+1)+' (kN)','rc_'+i,1)),[QT_R('R28 (MPa)','r28',1)])]];
  GT.THEP_HINH.qt=()=>[['Kết quả tổng hợp',[QT_R('Số thanh','n',0),QT_R('Gh chảy nhỏ nhất (MPa)','sy_min',0),QT_R('Gh đứt nhỏ nhất (MPa)','su_min',0),QT_R('Dãn dài nhỏ nhất (%)','dl_min',1),QT_R('Số thanh uốn nứt','nut',0)]],
    ['Số liệu từng thanh',ix_(12).flatMap(i=>[QT_C('T'+(i+1)+' dày a','a_'+i,1),QT_C('T'+(i+1)+' rộng b','b_'+i,1),QT_C('T'+(i+1)+' Fy (kN)','Fy_'+i,1),QT_C('T'+(i+1)+' Fu (kN)','Fu_'+i,1),QT_C('T'+(i+1)+' dãn dài (%)','dl_'+i,1)])]];
})();
