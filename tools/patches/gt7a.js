/* ====================================================================== 0.17.0 BỔ SUNG LOẠI MẪU: nhựa đường 60/70, nhựa lỏng MC70, gạch bê tông đặc và rỗng (nhập kết quả trực tiếp) */
const DIRECT_SPECS=@@SPECS@@;
const DIRECT_B64=@@DB64@@;
const reqTxt=(lo,hi,dp)=>{const f=x=>fnum(x,dp);return lo!=null&&hi!=null?f(lo)+' ÷ '+f(hi):lo!=null?'≥ '+f(lo):hi!=null?'≤ '+f(hi):'';};
const asciiOf=t=>String(t).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^A-Za-z0-9 ./%-]/g,'').trim();
function directGT(s){
  const items=s.items,N=items.length,R0=5,r1=R0+N+1,map={},fixed=[],tests=[],dp={n:0,bad:0},defaults={},ph=Object.assign({},s.ph);
  items.forEach((t,i)=>{map[t.k]='B'+(R0+i);dp[t.k]=t.dp;
    if(t.inp){map[t.k+'_lo']='C'+(R0+i);map[t.k+'_hi']='D'+(R0+i);if(t.lo!=null)defaults[t.k+'_lo']=t.lo;if(t.hi!=null)defaults[t.k+'_hi']=t.hi;}
    fixed.push(['B'+(11+i),'Số chữ số thập phân: '+t.name,t.dp]);
    if(!t.inp){if(t.lo!=null)fixed.push(['C'+(11+i),'Yêu cầu nhỏ nhất: '+t.name,t.lo]);if(t.hi!=null)fixed.push(['D'+(11+i),'Yêu cầu lớn nhất: '+t.name,t.hi]);}
    tests.push({code:t.code,name:t.name,std:t.std,unit:t.unit,key:t.k});});
  fixed.push(['B'+(11+N),'Số chỉ tiêu trên một phiếu',N]);
  const rcf=r=>{const n=nzn,o={n:0,bad:0,v:{},ok:{},lo:{},hi:{}};
    items.forEach(t=>{const v=n(r[t.k]),lo=t.inp?n(r[t.k+'_lo']):t.lo,hi=t.inp?n(r[t.k+'_hi']):t.hi;o.v[t.k]=v;o.lo[t.k]=lo;o.hi[t.k]=hi;
      let ok=null;if(v!=null){o.n++;if(lo!=null||hi!=null){ok=(lo==null||v>=lo)&&(hi==null||v<=hi);if(!ok)o.bad++;}}o.ok[t.k]=ok;});
    o.ketluan=o.n<N?'CHƯA ĐỦ':(o.bad?'KHÔNG ĐẠT':'ĐẠT');return o;};
  const grps=[];items.forEach(t=>{let g=grps.find(x=>x.n===(t.grp||''));if(!g){g={n:t.grp||'',it:[]};grps.push(g);}g.it.push(t);});
  const live=d=>{const r=rcf(d);return r.n?['Đã nhập',r.n+'/'+N+' chỉ tiêu',r.bad?' · '+r.bad+' chỉ tiêu không đạt mức yêu cầu':' · chưa có chỉ tiêu nào không đạt',r.bad>0]:null;};
  const lbl=t=>t.tt+'. '+t.name.replace(/^Chưng cất: |^Kích thước cơ bản: |^Khuyết tật bên ngoài: /,'')+' ('+t.unit+')';
  const G={code:s.code,form:{code:s.form,ver:s.ver},ten:s.ten,b64:()=>DIRECT_B64[s.code],map,textKeys:[],fixed,tests,dp,rc:rcf,rkeys:['n','bad'],
    cacheCells:{n:'B'+r1,bad:'B'+(r1+1)},expect:rc=>({n:rc.n,bad:rc.bad}),
    results:rc=>Object.assign({n:rc.n,bad:rc.bad,ketluan:rc.ketluan,ok:rc.ok,lo:rc.lo,hi:rc.hi},rc.v),
    qr:items.slice(0,8).map(t=>[t.k,t.ql]),
    verify:raw=>{const rc=rcf(raw),miss=items.filter(t=>rc.ok[t.k]===false);return miss.length?[{label:'Lưu ý khi kiểm tra: Các chỉ tiêu đều đạt mức yêu cầu',state:'warn',note:'Chỉ tiêu không đạt: '+miss.map(t=>t.tt+' '+t.name.slice(0,40)+' = '+fnum(rc.v[t.k],t.dp)).join('; ')+'.'}]:[];},
    ph,defaults,kind:()=>'num',
    sections:()=>grps.map((g,gi)=>sec1(g.n||'Kết quả thử nghiệm',(g.n?'':'Nhập kết quả từng chỉ tiêu theo '+s.std+'. ')+(g.it.some(t=>t.inp)?'Mức yêu cầu điền sẵn theo mẫu cũ, sửa được; để trống thì không xét đạt hay không đạt.':'Mức yêu cầu theo '+s.std+' do hệ thống giữ cố định.'),
      g.it.map(t=>t.inp?[t.tt+'. '+t.name.replace(/^Kích thước cơ bản: |^Khuyết tật bên ngoài: /,''),[[t.k,'Kết quả ('+t.unit+')'],[t.k+'_lo','Yêu cầu nhỏ nhất'],[t.k+'_hi','Yêu cầu lớn nhất']]]:['',[[t.k,lbl(t)]]]),
      gi===grps.length-1?live:null)),
    need:d=>items.filter(t=>typeof d[t.k]!=='number').length,total:()=>N,
    valid:(d,rc)=>rc.n===N&&items.every(t=>rc.v[t.k]>=0),
    head:['TT','Chỉ tiêu kiểm tra','Phương pháp thử','Đơn vị','Kết quả','Mức yêu cầu'],
    table:r=>items.map(t=>[t.tt,t.name,t.std,t.unit,r[t.k]==null?'':(t.pre||'')+fnum(r[t.k],t.dp),t.inp?reqTxt(r.lo&&r.lo[t.k],r.hi&&r.hi[t.k],t.dp):t.req]),
    nhanXet:r=>(r.n==null||r.n<N)?'':s.nx.replace('{kq}',r.bad?'không đạt':'đạt'),
    rawRows:raw=>items.map(t=>[t.tt+'. '+t.name,fnum(raw[t.k],t.dp)+' '+t.unit+(t.inp?' · yêu cầu '+(reqTxt(raw[t.k+'_lo'],raw[t.k+'_hi'],t.dp)||'không nhập'):'')])};
  G.qt=()=>[['Kết quả các chỉ tiêu',items.map(t=>QT_C(t.tt+' '+asciiOf(t.name).slice(0,28)+' ('+t.unit+')',t.k,t.dp)).concat([QT_R('Số chỉ tiêu không đạt','bad',0)])]];
  GT[s.code]=G;tests.forEach(t=>ALL_TESTS.push(t));return G;}
DIRECT_SPECS.forEach(directGT);
Object.assign(NGUON_LBL,{NHUA_6070:{l:'Nguồn gốc nhựa',ph:'Ví dụ: Petrolimex, độ kim lún 60/70',hint:'Ghi nhà cung cấp, nhãn hiệu nhựa đường.'},NHUA_MC70:{l:'Nguồn gốc nhựa',ph:'Ví dụ: Thiên Tai, nhựa lỏng MC70',hint:'Ghi nhà cung cấp, nhãn hiệu nhựa đường lỏng.'},GACH_BT_DAC:{l:'Nơi sản xuất gạch',ph:'Ví dụ: Cơ sở gạch bê tông ABC',hint:'Ghi nhà máy hoặc cơ sở sản xuất gạch.'},GACH_BT_RONG:{l:'Nơi sản xuất gạch',ph:'Ví dụ: Cơ sở gạch bê tông ABC',hint:'Ghi nhà máy hoặc cơ sở sản xuất gạch.'}});
