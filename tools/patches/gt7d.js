/* ---- đá dăm 20-70 (BM-DA-03): thành phần hạt sàng 100, 70, 40, 20; mỗi phép thử làm một lần như file Excel cũ */
function rc2070(r){
  const n=nzn,o={cum:null,part:null};
  o.sc=sc2(r.sc_m,r.sc_m1);
  o.rx=n(r.rx_V)&&n(r.rx_m)!=null?r.rx_m/r.rx_V:null;
  o.la=n(r.la_m1)&&n(r.la_m2)!=null?(r.la_m1-r.la_m2)/r.la_m1*100:null;
  const tdi=ix_(4).map(i=>prT(r['td_a'+i],r['td_b'+i])),tdw=ix_(4).map(i=>n(r['td_w'+i]));
  const ndi=ix_(3).map(i=>sc2(r['nd_a'+i],r['nd_b'+i])),ndw=ix_(3).map(i=>n(r['nd_w'+i]));
  const wa=(v,w)=>allN_(v)&&allN_(w)&&w.reduce((a,b)=>a+b,0)>0?v.reduce((a,x,i)=>a+x*w[i],0)/w.reduce((a,b)=>a+b,0):null;
  o.td=wa(tdi,tdw);o.nd=wa(ndi,ndw);o.td_w=allN_(tdw)?tdw.reduce((a,b)=>a+b,0):null;o.nd_w=allN_(ndw)?ndw.reduce((a,b)=>a+b,0):null;
  const tot=n(r.sieve_total),ret=ix_(5).map(i=>n(r['sieve'+i]));
  if(tot&&allN_(ret)){let c=0;o.part=ret.map(x=>x/tot*100);o.cum=o.part.map(x=>(c+=x));o.loss=Math.abs(tot-ret.reduce((a,b)=>a+b,0))/tot*100;
    const sz=[100,70,40,20],ip=lv=>{const k=o.cum.slice(0,4).filter(x=>x<lv).length;return(k===0||k===4)?null:sz[k-1]-(lv-o.cum[k-1])/(o.cum[k]-o.cum[k-1])*(sz[k-1]-sz[k]);};
    o.dmax=ip(10);o.dmin=ip(90);}
  return o;}
(function(){
  const m={sc_m:'B6',sc_m1:'C6',rx_V:'B13',rx_m:'C13',la_m1:'B20',la_m2:'C20',sieve_total:'B40'};
  ix_(4).forEach(i=>{m['td_a'+i]='B'+(24+i);m['td_b'+i]='C'+(24+i);m['td_w'+i]='E'+(24+i);});
  ix_(3).forEach(i=>{m['nd_a'+i]='B'+(33+i);m['nd_b'+i]='C'+(33+i);m['nd_w'+i]='E'+(33+i);});
  ix_(5).forEach(i=>{m['sieve'+i]='B'+(42+i);});
  const gT=['Nhóm 5-10 mm (mẫu thử 0,25 kg)','Nhóm 10-20 mm (mẫu thử 1 kg)','Nhóm 20-40 mm (mẫu thử 5 kg)','Nhóm 40-70 mm (mẫu thử 15 kg)'];
  const tests=[{code:'DA20_01',name:'Hàm lượng bùn, bụi, sét',std:'TCVN 7572-8:2006',unit:'%',key:'sc'},{code:'DA20_02',name:'Khối lượng thể tích xốp',std:'TCVN 7572-6:2006',unit:'kg/m³',key:'rx'},{code:'DA20_03',name:'Hàm lượng hạt thoi dẹt',std:'TCVN 7572-13:2006',unit:'%',key:'td'},
    {code:'DA20_04',name:'Độ hao mòn Los Angeles',std:'TCVN 7572-12:2006',unit:'%',key:'la'},{code:'DA20_05',name:'Độ nén dập trong xi lanh',std:'TCVN 7572-11:2006',unit:'%',key:'nd'},{code:'DA20_06',name:'Đường kính lớn nhất (Dmax)',std:'TCVN 7572-2:2006',unit:'mm',key:'dmax'},{code:'DA20_07',name:'Đường kính nhỏ nhất (Dmin)',std:'TCVN 7572-2:2006',unit:'mm',key:'dmin'}];
  const dp={sc:2,rx:0,td:1,la:1,nd:1,dmax:1,dmin:1};
  const ok=d=>{const r=rc2070(d);return Object.keys(m).every(k=>typeof d[k]==='number')&&r.dmax!=null&&r.dmin!=null&&Math.abs(r.td_w-100)<=0.5&&Math.abs(r.nd_w-100)<=0.5;};
  const LIM=[[100,0,0],[70,0,10],[40,40,70],[20,90,100]];
  const fixed=[['B5','Mã loại mẫu','DA_20_70'],['B11','Số chữ số thập phân: bùn, bụi, sét',2],['B12','Số chữ số thập phân: KL thể tích xốp',0],['B13','Số chữ số thập phân: hạt thoi dẹt',1],['B14','Số chữ số thập phân: Los Angeles',1],['B15','Số chữ số thập phân: độ nén dập',1],['B16','Số chữ số thập phân: Dmax',1],['B17','Số chữ số thập phân: Dmin',1],['B21','Mức sót tích lũy xác định Dmax (%)',10],['B22','Mức sót tích lũy xác định Dmin (%)',90]];
  LIM.forEach(([z,u,l],i)=>{const r=27+i;fixed.push(['A'+r,'Cỡ sàng giới hạn '+(i+1),z],['B'+r,'Cận trên sàng '+z,u],['C'+r,'Cận dưới sàng '+z,l]);});
  const wsum=k=>d=>{const r=rc2070(d),s=k==='td'?r.td_w:r.nd_w,v=k==='td'?r.td:r.nd;if(v==null&&s==null)return null;return v==null?['Tổng % KLHH',fnum(s,1),' (phải bằng 100)',Math.abs(s-100)>0.5]:[k==='td'?'Td':'Nd',fnum(v,1)+' %',' · tổng KLHH '+fnum(s,1),Math.abs(s-100)>0.5];};
  const G={code:'DA_20_70',form:{code:'BM-DA-03',ver:'v1.0'},ten:'Đá dăm 20-70',b64:()=>DIRECT_B64.DA_20_70,map:m,textKeys:[],fixed,tests,dp,rc:rc2070,rkeys:['sc','rx','la','td','nd','dmax','dmin'],
    cacheCells:{sc:'D8',rx:'D15',la:'D20',td:'D28',nd:'D36',dmax:'D53',dmin:'D54',cum0:'D42',cum1:'D43',cum2:'D44',cum3:'D45',cum4:'D46'},
    expect:rc=>Object.assign({sc:rc.sc,rx:rc.rx,la:rc.la,td:rc.td,nd:rc.nd,dmax:rc.dmax,dmin:rc.dmin},rc.cum?Object.fromEntries(rc.cum.map((c,i)=>['cum'+i,c])):{}),
    results:rc=>({sc:rc.sc,rx:rc.rx,td:rc.td,la:rc.la,nd:rc.nd,dmax:rc.dmax,dmin:rc.dmin}),
    sieve:(rc,raw)=>rc.cum?[100,70,40,20,0].map((z,i)=>({sang:z,lab:i<4?String(z):'< 20',kl:raw['sieve'+i],rieng:rc.part[i],tich_luy:rc.cum[i]})):null,
    qr:[['sc','Bun bui set'],['rx','KLTT xop'],['td','Thoi det'],['la','Los Angeles'],['nd','Nen dap'],['dmax','Dmax'],['dmin','Dmin']],
    ph:{sc_m:'10000',sc_m1:'9971',rx_V:'20',rx_m:'28546',la_m1:'5003',la_m2:'3812',td_a0:'55',td_b0:'206',td_w0:'20',td_a1:'202',td_b1:'856',td_w1:'25',td_a2:'1021',td_b2:'4502',td_w2:'15',td_a3:'1102',td_b3:'4325',td_w3:'40',nd_a0:'456',nd_b0:'400',nd_w0:'45',nd_a1:'3325',nd_b1:'2902',nd_w1:'33',nd_a2:'3365',nd_b2:'2985',nd_w2:'22',sieve_total:'37379',sieve0:'0',sieve1:'2101',sieve2:'19665',sieve3:'15405',sieve4:'208'},
    kind:()=>'num',
    sections:()=>[secL('Bùn, bụi, sét','TCVN 7572-8:2006',[['',[['sc_m','m: trước khi rửa (g)'],['sc_m1','m1: sau rửa, sấy khô (g)']]]],d=>{const r=rc2070(d);return r.sc==null?null:['Sc',fnum(r.sc,2)+' %','',false];}),
      secL('Khối lượng thể tích xốp','TCVN 7572-6:2006',[['',[['rx_V','V: thể tích thùng (l)'],['rx_m','m: khối lượng vật liệu (g)']]]],d=>{const r=rc2070(d);return r.rx==null?null:['ρx',fnum(r.rx,0)+' kg/m³','',false];}),
      secL('Độ hao mòn Los Angeles','TCVN 7572-12:2006',[['',[['la_m1','m1: trước khi thử (g)'],['la_m2','m2: sót trên sàng 1,70 mm (g)']]]],d=>{const r=rc2070(d);return r.la==null?null:['LA',fnum(r.la,1)+' %','',false];}),
      secL('Hạt thoi dẹt','TCVN 7572-13:2006. Nhập % KLHH của từng nhóm theo thực tế sàng mẫu (tổng bằng 100).',ix_(4).map(i=>[gT[i],[['td_a'+i,'m1: hạt thoi dẹt (g)'],['td_b'+i,'m2: hạt còn lại (g)'],['td_w'+i,'% KLHH của nhóm']]]),wsum('td')),
      secL('Độ nén dập trong xi lanh','TCVN 7572-11:2006. Nhập % KLHH của từng nhóm theo thực tế (tổng bằng 100).',ix_(3).map(i=>[gT[i],[['nd_a'+i,'m1: trước khi nén (g)'],['nd_b'+i,'m2: sót sau khi nén (g)'],['nd_w'+i,'% KLHH của nhóm']]]),wsum('nd')),
      secL('Thành phần hạt, Dmax, Dmin','TCVN 7572-2:2006',[['Khối lượng mẫu',[['sieve_total','Tổng mẫu đem sàng (g)']]],['Lượng sót trên từng sàng (g)',[['sieve0','Sàng 100 mm'],['sieve1','Sàng 70 mm'],['sieve2','Sàng 40 mm'],['sieve3','Sàng 20 mm'],['sieve4','< 20 mm (đáy khay)']]]],d=>{const r=rc2070(d);return r.dmax==null&&r.dmin==null?null:['Dmax / Dmin',fnum(r.dmax,1)+' / '+fnum(r.dmin,1)+' mm',r.loss!=null?' · hao hụt '+fnum(r.loss,2)+' %':'',false];})],
    need:d=>Object.keys(m).filter(k=>typeof d[k]!=='number').length,total:()=>Object.keys(m).length,valid:(d,rc)=>ok(d),
    head:['TT','Chỉ tiêu thử nghiệm','Phương pháp thử','Đơn vị','Kết quả'],table:r=>tests.map((t,i)=>[i+1,t.name,t.std,t.unit,r[t.key]==null?'':fnum(r[t.key],dp[t.key])]),
    nhanXet:r=>r.sc==null?'':'Mẫu đá trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 7570:2006 (cốt liệu lớn).',
    rawRows:raw=>{const f=(a,d_)=>a==null?'':fnum(a,d_);return[['Bùn, bụi, sét',f(raw.sc_m,1)+' → '+f(raw.sc_m1,1)+' g'],['KL thể tích xốp','V '+f(raw.rx_V,1)+' l / m '+f(raw.rx_m,0)+' g'],['Los Angeles','m1 '+f(raw.la_m1,1)+' / m2 '+f(raw.la_m2,1)+' g'],
      ['Hạt thoi dẹt',ix_(4).map(i=>f(raw['td_a'+i],1)+'/'+f(raw['td_b'+i],1)+' (KLHH '+f(raw['td_w'+i],1)+')').join(' · ')],['Nén dập',ix_(3).map(i=>f(raw['nd_a'+i],1)+'/'+f(raw['nd_b'+i],1)+' (KLHH '+f(raw['nd_w'+i],1)+')').join(' · ')],['Thành phần hạt','Tổng '+f(raw.sieve_total,1)+' g · sót '+ix_(5).map(i=>f(raw['sieve'+i],1)).join(' · ')]];}};
  G.qt=()=>[['Bùn, bụi, sét',[QT_C('m (g)','sc_m'),QT_C('m1 (g)','sc_m1'),QT_R('Sc (%)','sc',2)]],['KL thể tích xốp',[QT_C('V (l)','rx_V'),QT_C('m (g)','rx_m'),QT_R('ρx (kg/m³)','rx',0)]],['Los Angeles',[QT_C('m1 (g)','la_m1'),QT_C('m2 (g)','la_m2'),QT_R('LA (%)','la',1)]],
    ['Hạt thoi dẹt',ix_(4).map(i=>[QT_C(['5-10','10-20','20-40','40-70'][i]+': m1 (g)','td_a'+i),QT_C(['5-10','10-20','20-40','40-70'][i]+': m2 (g)','td_b'+i),QT_C(['5-10','10-20','20-40','40-70'][i]+': %KLHH','td_w'+i,1)]).flat().concat([QT_R('Td (%)','td',1)])],
    ['Nén dập trong xi lanh',ix_(3).map(i=>[QT_C(['5-10','10-20','20-40'][i]+': m1 (g)','nd_a'+i),QT_C(['5-10','10-20','20-40'][i]+': m2 (g)','nd_b'+i),QT_C(['5-10','10-20','20-40'][i]+': %KLHH','nd_w'+i,1)]).flat().concat([QT_R('Nd (%)','nd',1)])],
    ['Thành phần hạt',QT_SIEVE('sieve',['sàng 100','sàng 70','sàng 40','sàng 20','< 20'],'sieve_total').concat([QT_R('Dmax (mm)','dmax',1),QT_R('Dmin (mm)','dmin',1)])]];
  GT.DA_20_70=G;tests.forEach(t=>ALL_TESTS.push(t));
})();
