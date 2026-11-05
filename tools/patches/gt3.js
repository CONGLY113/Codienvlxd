/* ====================================================================== 0.10.0 CẤP PHỐI BÊ TÔNG (BM-CP-01)
   Số liệu vật liệu lấy từ phiếu xi măng, cát, đá đã phát hành (liên kết theo mã mẫu), phụ gia nhập tay.
   Công thức đúng file Excel cấp phối của phòng (phương pháp thể tích tuyệt đối), đã đối chiếu với file gốc trên 60 bộ số ngẫu nhiên và với biểu mẫu mới trên 106 bộ số. */
const CP_B64='@@CP@@';
const CP_T=@@CPTAB@@;
const CP_K=@@CPCONST@@;
const CP_SL=@@CPSL@@;
const CP_MAP=@@CPMAP@@;
const CP_CALC=@@CPCALC@@;
const CP_FIX=@@CPFIX@@;
const CP_DMAX=[10,20,40,70];
const cpLk=(a,x)=>{let i=-1;for(let k=0;k<a.length;k++){if(a[k]<=x)i=k;else break;}return i;};
const nn_=v=>typeof v==='number'&&isFinite(v)?v:0;
const cpRound=(v,dp)=>typeof v==='number'?Math.round(v*Math.pow(10,dp)+(v>=0?1e-9:-1e-9))/Math.pow(10,dp):null;
function rcCP(r){
  const n=nzn,K=CP_K,o={};
  const mac=n(r.mac),sut=n(r.sut),r28=n(r.xm_r28),rho=n(r.xm_rho),rhox=n(r.xm_rhox),mdl=n(r.ct_mdl),crx=n(r.ct_rx),cra=n(r.ct_ra),s5=n(r.ct_s5),
    dmax=n(r.da_dmax),drx=n(r.da_rx),drho=n(r.da_rho),drhov=n(r.da_rhov),hk=n(r.hk),loai=r.da_loai,cl=r.da_cl;
  o.rx=(r28!=null&&r28>0)?r28*K.conv:null;
  const okIn=[mac,sut,o.rx,rho,mdl,crx,cra,s5,dmax,drx,drho,drhov].every(x=>x!=null)&&(loai==='Đá dăm'||loai==='Sỏi')&&(cl==='Tốt'||cl==='Trung bình')&&rho>0&&cra>0&&drho>0&&drhov>0;
  const okTab=dmax!=null&&sut!=null&&CP_DMAX.includes(dmax)&&sut>=1&&sut<=6&&sut===Math.floor(sut);
  o.okTab=okTab;
  const col=mdl==null?0:(mdl<=K.br1?0:mdl<=K.br2?1:mdl<=K.br3?2:3);
  o.N0=(okIn&&okTab)?CP_T.water[sut-1][CP_DMAX.indexOf(dmax)*4+col]:null;
  o.dc=o.N0!=null?((mdl>K.c_hi?K.c_adj_hi:0)+(mdl<K.c_lo?K.c_adj_lo:0)):null;
  o.ds=o.N0!=null?(loai==='Sỏi'?K.soi:0):null;
  o.N1=o.N0!=null?o.N0+o.dc+o.ds:null;
  o.N2=o.N1!=null?o.N1-o.N1*nn_(n(r.pg_giam))/100:null;
  const good=mdl!=null?(((mdl<2?2:1)*(cl==='Tốt'?1:2))===1):null;
  o.A=mdl!=null?(good?K.A_t:K.A_b):null;o.A1=mdl!=null?(good?K.A1_t:K.A1_b):null;
  o.xn1=(o.rx!=null&&o.A!=null&&mac!=null)?K.an*mac/o.rx/o.A+0.5:null;
  o.xn2=(o.rx!=null&&o.A1!=null&&mac!=null)?K.an*mac/o.rx/o.A1-0.5:null;
  o.XN=o.xn1!=null?(o.xn1<=K.xn_lim?o.xn1:o.xn2):null;
  o.X0=(o.N2!=null&&o.XN!=null)?o.N2*o.XN:null;
  const hk1=hk!=null?hk:1;
  o.X1=o.X0!=null?o.X0*hk1:null;
  o.Nf=o.X1!=null?(o.X1>K.x_lim?(o.N2*K.per-K.x_lim)/(K.per-o.XN):o.N2):null;
  o.X=o.X1!=null?(o.X1<=K.x_lim?o.X1:o.Nf*o.XN*hk1):null;
  o.Vh=o.X!=null?o.X/rho+o.Nf:null;
  if(o.Vh!=null&&mdl!=null){const ri=cpLk(CP_T.mrows,mdl),ci=cpLk(CP_T.vh,o.Vh);o.Kd=(ri>=0&&ci>=0)?CP_T.kd[ri][ci]:null;}else o.Kd=null;
  o.kdOut=(o.Vh!=null&&o.Vh>CP_T.vh[CP_T.vh.length-1])||(mdl!=null&&mdl>CP_T.mrows[CP_T.mrows.length-1]);
  o.r=(drx!=null&&drhov!=null&&drhov>0)?1-drx/drhov/1000:null;
  o.Dtt=(o.Kd!=null&&o.r!=null)?drx/(o.r*(o.Kd-1)+1)*(mdl<=K.mdl_k?K.k1:K.k2):null;
  o.C0=o.Dtt!=null?(1000-(o.X/rho+o.Dtt/drho+o.Nf))*cra:null;
  o.C1=o.C0!=null?o.C0+s5*o.C0/100+K.bu:null;
  o.D1=o.C1!=null?o.Dtt-o.C1*s5/100:null;
  const dl=nn_(n(r.dl));
  o.cat=o.C1!=null?o.C1-dl:null;o.da=o.D1!=null?o.D1+dl:null;
  o.pg=o.X!=null?o.X/100*nn_(n(r.pg_lieu)):null;
  o.v_x=o.X!=null?o.X/rho:null;o.v_c=o.cat!=null?o.cat/cra:null;o.v_d=o.da!=null?o.da/drho:null;o.v_n=o.Nf!=null?o.Nf:null;
  o.sumv=(o.v_x!=null&&o.v_c!=null&&o.v_d!=null)?o.v_x+o.v_c+o.v_d+o.v_n:null;
  o.s_x=(o.X!=null&&rhox!=null&&rhox>0)?o.X/rhox:null;o.s_c=(o.cat!=null&&crx!=null&&crx>0)?o.cat/crx*1000:null;o.s_d=(o.da!=null&&drx!=null&&drx>0)?o.da/drx*1000:null;
  const nv=n(r.n_vien),cn=n(r.canh),al=n(r.alpha),wc=nn_(n(r.w_c)),wd=nn_(n(r.w_d));
  o.Vb=(nv!=null&&cn!=null)?K.waste*nv*Math.pow(cn/100,3):null;
  o.b_x=(o.Vb!=null&&o.X!=null)?o.X*o.Vb:null;
  o.b_c=(o.Vb!=null&&o.cat!=null)?o.cat*o.Vb*(1+wc/100):null;
  o.b_d=(o.Vb!=null&&o.da!=null)?o.da*o.Vb*(1+wd/100):null;
  o.b_n=(o.Vb!=null&&o.Nf!=null&&o.cat!=null&&o.da!=null)?o.Nf*o.Vb-o.cat*o.Vb*wc/100-o.da*o.Vb*wd/100:null;
  o.b_p=(o.Vb!=null&&o.pg!=null)?o.pg*o.Vb*1000:null;
  /* nén mẫu đúc */
  const ok=al!=null&&cn!=null&&cn>0;
  ['3','7','28'].forEach(a=>{
    const F=[0,1,2].map(i=>n(r['p'+a+'_'+i])),R=F.map(f=>(f!=null&&ok)?al*f*1000/Math.pow(cn*10,2):null);
    R.forEach((v,i)=>{o['R'+a+'_'+i]=v;});
    o['F'+a]=F.every(x=>x!=null)?(F[0]+F[1]+F[2])/3:null;
    o['R'+a]=R.every(x=>x!=null)?(R[0]+R[1]+R[2])/3:null;
    o['L'+a]=o['R'+a]!=null?Math.max(Math.abs(R[0]-o['R'+a]),Math.abs(R[1]-o['R'+a]),Math.abs(R[2]-o['R'+a]))/o['R'+a]*100:null;
    o['K'+a]=o['R'+a]!=null?o['R'+a]*K.conv:null;
    o['P'+a]=(o['K'+a]!=null&&mac!=null&&mac>0)?o['K'+a]/mac*100:null;});
  o.R28e=(o.R7!=null&&o.R28==null)?o.R7*K.r28/K.r7:null;
  o.K28e=o.R28e!=null?o.R28e*K.conv:null;
  o.P28e=(o.K28e!=null&&mac!=null&&mac>0)?o.K28e/mac*100:null;
  return o;}
const CP_REQ=['mac','sut','xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra','ct_s5','da_dmax','da_rx','da_rho','da_rhov','n_vien','canh','alpha','sut_do'];
const CP_TXT_REQ=['da_loai','da_cl'];
const CP_F37=['p3_0','p3_1','p3_2','p7_0','p7_1','p7_2'],CP_F28=['p28_0','p28_1','p28_2'];
const cp28=d=>CP_F28.filter(k=>typeof d[k]==='number').length;
/* ---- liên kết số liệu với phiếu vật liệu đã phát hành */
const CP_SRC={xm:{loai:['XM_PCB40'],t:'xi măng'},ct:{loai:['CAT_XD'],t:'cát'},da:{loai:['DA_5_20','DA_10_40'],t:'đá'}};
function cpVals(kind,src){
  const r=(src.nop&&src.nop.results)||{},dpx=DPof(src);
  if(kind==='xm')return{xm_r28:cpRound(r.r28,dpx.r28)};
  if(kind==='ct')return{ct_mdl:cpRound(r.mdl,dpx.mdl),ct_rx:cpRound(r.rx,dpx.rx),ct_ra:cpRound(r.ra,dpx.ra),ct_s5:cpRound(r.s5,dpx.s5)};
  return{da_rx:cpRound(r.rx,dpx.rx),da_nd:cpRound(r.nd,dpx.nd),da_dmax:loaiOf(src)==='DA_10_40'?40:20};}
function cpCands(s,kind){
  const ct=(s&&s.du_an&&s.du_an.cong_trinh)||'';
  return S.samples.filter(x=>x.status==='da_phat_hanh'&&x.so_bao_cao&&CP_SRC[kind].loai.includes(loaiOf(x))&&x.nop&&x.nop.results)
    .sort((a,b)=>{const ca=((a.du_an&&a.du_an.cong_trinh)||'')===ct?0:1,cb=((b.du_an&&b.du_an.cong_trinh)||'')===ct?0:1;if(ca!==cb)return ca-cb;return((b.mau&&b.mau.ngay_nhan)||'')<((a.mau&&a.mau.ngay_nhan)||'')?-1:1;}).slice(0,150);}
function cpFill(kind,src,d){
  d[kind+'_src']=src.ma_mau;d[kind+'_bc']=src.so_bao_cao;d[kind+'_ten']=(src.mau&&(src.mau.nguon_goc||src.mau.ten))||'';
  Object.assign(d,cpVals(kind,src));
  if(kind==='da'&&!d.da_loai)d.da_loai='Đá dăm';}
function cpUnlink(kind,d){delete d[kind+'_src'];delete d[kind+'_bc'];}
function cpPicker(kind){return(d,again,s)=>{
  const cands=cpCands(s,kind),T=CP_SRC[kind].t;
  const sel=h('select',{'aria-label':'Chọn phiếu '+T+' đã phát hành',onchange:e=>{const v=e.target.value;if(!v)cpUnlink(kind,d);else{const x=cands.find(c=>c.ma_mau===v);if(x)cpFill(kind,x,d);}again();}},
    [h('option',{value:''},'Nhập tay, không liên kết')].concat(cands.map(x=>h('option',{value:x.ma_mau,selected:d[kind+'_src']===x.ma_mau},x.so_bao_cao+' · '+x.ma_mau+' · '+((x.mau&&x.mau.nguon_goc)||'')+' · nhận '+fd(x.mau&&x.mau.ngay_nhan)))));
  return h('div',{class:'mf-g'},h('b',null,'Lấy số liệu từ phiếu '+T+' đã phát hành'),h('div',{class:'mf-f'},h('label',{style:'grid-column:1/-1'},'Phiếu nguồn',sel)),
    h('div',{class:'small muted',style:'margin-top:4px'},d[kind+'_src']?('Đã liên kết '+d[kind+'_bc']+'. Số liệu bên dưới điền từ phiếu; sửa tay sẽ bị báo lệch khi kiểm tra hồ sơ.'):(cands.length?'Chọn phiếu để điền sẵn số liệu, hoặc nhập tay nếu vật liệu thử ở nơi khác.':'Chưa có phiếu '+T+' đã phát hành trong hệ thống. Nhập tay.')));};}
function cpVerify(raw,sample){
  const out=[],K=CP_K;
  ['xm','ct','da'].forEach(kind=>{
    const T=CP_SRC[kind].t,src=raw[kind+'_src'];
    if(!src){out.push({label:'Số liệu '+T+' nhập tay, không liên kết phiếu đã phát hành',state:'warn',note:'Người soát xét cần đối chiếu phiếu '+T+' ở nơi thử khác.'});return;}
    const x=S.samples.find(s=>s.ma_mau===src);
    if(!x||!CP_SRC[kind].loai.includes(loaiOf(x))){out.push({label:'Phiếu '+T+' nguồn '+src+' tồn tại và đúng loại vật liệu',state:'fail',note:x?'Mẫu '+src+' là '+loaiOf(x)+'.':'Không tìm thấy mẫu '+src+'.'});return;}
    if(x.status!=='da_phat_hanh'||!x.so_bao_cao||!x.nop||!x.nop.results){out.push({label:'Phiếu '+T+' nguồn '+src+' đã phát hành',state:'fail',note:'Mẫu '+src+' chưa phát hành số báo cáo.'});return;}
    const v=cpVals(kind,x),bad=Object.keys(v).filter(k=>v[k]!=null&&(k==='da_nd'?(raw[k]!=null&&!(typeof raw[k]==='number'&&Math.abs(raw[k]-v[k])<1e-9)):!(typeof raw[k]==='number'&&Math.abs(raw[k]-v[k])<1e-9)));
    if(raw[kind+'_bc']!==x.so_bao_cao)bad.push('số báo cáo');
    out.push({label:'Số liệu '+T+' khớp phiếu '+x.so_bao_cao+' ('+src+')',state:bad.length?'fail':'ok',note:bad.length?'Lệch ở: '+bad.map(k=>({xm_r28:'R28',ct_mdl:'Mđl',ct_rx:'KLTT xốp cát',ct_ra:'KL riêng cát',ct_s5:'hạt > 5 mm',da_rx:'KLTT xốp đá',da_nd:'nén dập',da_dmax:'Dmax (đá 5x20 là 20, đá 10x40 là 40)'})[k]||k).join(', ')+'. Điền lại từ phiếu nguồn hoặc bỏ liên kết nếu nhập tay.':''});});
  const rc=rcCP(raw),W='Lưu ý khi kiểm tra: ',sl=CP_SL[(raw.sut||0)-1],mxL=Math.max.apply(null,['L3','L7','L28'].map(k=>rc[k]).filter(x=>x!=null).concat([-1]));
  if(rc.sumv!=null&&Math.abs(rc.sumv-1000)>K.tol_v)out.push({label:W+'Tổng thể tích tuyệt đối gần 1000 lít',state:'warn',note:'Tổng '+fnum(rc.sumv,1)+' lít. Lệch nhiều thường do chuyển cát sang đá hoặc số liệu vật liệu.'});
  if(sl&&typeof raw.sut_do==='number'&&(raw.sut_do<sl[1]||raw.sut_do>sl[2]))out.push({label:W+'Độ sụt đo nằm trong khoảng yêu cầu',state:'warn',note:'Độ sụt đo '+fnum(raw.sut_do,1)+' cm, yêu cầu '+sl[0]+'.'});
  if(rc.kdOut)out.push({label:'Hệ số dư vữa Kd nằm trong phạm vi bảng tra',state:'warn',note:'Bảng Kd chỉ có Vh đến '+CP_T.vh[CP_T.vh.length-1]+' lít và Mđl đến '+fnum(CP_T.mrows[CP_T.mrows.length-1],1).replace('.',',')+'. Vh = '+fnum(rc.Vh,1)+' lít, Mđl = '+fnum(raw.ct_mdl,2)+': Kd lấy ở cột hoặc hàng cuối của bảng, kết quả cấp phối chỉ gần đúng, nên thử lại bằng mẻ trộn.'});
  if(mxL>K.tol_r)out.push({label:W+'Từng viên không lệch trung bình quá 15 %',state:'warn',note:'Viên lệch '+fnum(mxL,1)+' % so với trung bình.'});
  return out;}
/* ---- phiếu: phần thân gồm 3 bảng */
const cpf=(v,dp)=>v==null?'':fnum(v,dp);
function cpBody(r){
  const m=r.m||{},t=r.t||{};
  const tb=(head,rows,w)=>h('table',null,h('thead',null,h('tr',null,head.map(x=>h('th',null,x)))),h('tbody',null,rows.map(rw=>h('tr',null,rw.map((c,i)=>h('td',(w&&w[i]==='l')?{style:'text-align:left'}:{class:'c'},c==null?'':String(c)))))));
  const sl=(CP_SL[(r.sut||0)-1]||[''])[0];
  return h('div',null,
    h('p',{style:'font-size:12px;margin:6px 0'},h('b',null,'Yêu cầu: '),'thiết kế thành phần cấp phối bê tông mác '+cpf(r.mac,0)+' kgf/cm², độ sụt '+sl),
    h('div',{style:'margin-top:6px'},h('b',null,'A. Vật liệu sử dụng')),
    tb(['TT','Vật liệu, nguồn gốc','Số báo cáo nguồn','KL riêng (g/cm³)','KLTT xốp (kg/m³)','Đặc trưng khác'],[
      [1,'Xi măng '+(t.xm_ten||'')+(t.xm_lo?', lô '+t.xm_lo:''),t.xm_bc||'',cpf(m.xm_rho,2),cpf(m.xm_rhox!=null?m.xm_rhox*1000:null,0),'R28 = '+cpf(m.xm_r28,1)+' MPa ('+cpf(m.rx,0)+' kgf/cm²)'],
      [2,'Cát '+(t.ct_ten||''),t.ct_bc||'',cpf(m.ct_ra,2),cpf(m.ct_rx,1),'Mđl = '+cpf(m.ct_mdl,2)+'; hạt > 5 mm: '+cpf(m.ct_s5,1)+' %'],
      [3,(t.da_loai||'Đá dăm')+' '+(t.da_ten||''),t.da_bc||'',cpf(m.da_rho,2),cpf(m.da_rx,0),'Dmax '+cpf(m.da_dmax,0)+' mm; KL thể tích hạt '+cpf(m.da_rhov,2)+'; độ rỗng '+cpf(m.r!=null?m.r*100:null,1)+' %'+(m.da_nd!=null?'; nén dập '+cpf(m.da_nd,1)+' %':'')],
      [4,t.pg_ten||'Không sử dụng','','','',(m.pg_lieu>0)?'Liều lượng '+cpf(m.pg_lieu,2)+' lít/100 kg XM; giảm nước '+cpf(m.pg_giam||0,1)+' %':'']],['c','l','c','c','c','l']),
    h('div',{style:'margin-top:8px'},h('b',null,'B. Thành phần cấp phối cho 1 m³ bê tông')),
    tb(['TT','Vật liệu','Khối lượng (kg)','Thể tích tuyệt đối (lít)','Thể tích xốp (lít)','Tỷ lệ theo khối lượng xi măng'],[
      [1,'Xi măng',cpf(r.X,0),cpf(r.v_x,1),cpf(r.s_x,1),cpf(1,2)],[2,'Cát',cpf(r.cat,0),cpf(r.v_c,1),cpf(r.s_c,1),cpf(r.X?r.cat/r.X:null,2)],
      [3,'Đá dăm, sỏi',cpf(r.da,0),cpf(r.v_d,1),cpf(r.s_d,1),cpf(r.X?r.da/r.X:null,2)],[4,'Nước',cpf(r.Nf,0),cpf(r.v_n,1),'',cpf(r.X?r.Nf/r.X:null,2)]].concat(m.pg_lieu>0?[[5,'Phụ gia '+(t.pg_ten||''),cpf(r.pg,2)+' lít','','','']]:[]),['c','l','c','c','c','c']),
    h('p',{style:'font-size:12px;margin:6px 0'},'X/N = '+cpf(r.XN,3)+'; N/X = '+cpf(r.XN?1/r.XN:null,3)+'; thể tích hồ xi măng '+cpf(r.Vh,1)+' lít; hệ số dư vữa Kd = '+cpf(r.Kd,2)+'; tổng thể tích tuyệt đối '+cpf(r.sumv,1)+' lít.'),
    h('div',{style:'margin-top:6px'},h('b',null,'C. Kết quả nén mẫu đúc thử (mẫu lập phương '+cpf(r.canh!=null?r.canh*10:null,0)+' mm)')),
    tb(['TT','Tuổi (ngày)','Lực nén TB (kN)','Cường độ (MPa)','Cường độ (kgf/cm²)','So với mác thiết kế (%)'],[
      [1,3,cpf(r.F3,1),cpf(r.R3,1),cpf(r.K3,0),cpf(r.P3,1)],[2,7,cpf(r.F7,1),cpf(r.R7,1),cpf(r.K7,0),cpf(r.P7,1)],
      r.R28!=null?[3,28,cpf(r.F28,1),cpf(r.R28,1),cpf(r.K28,0),cpf(r.P28,1)]:[3,'28 (dự kiến)','',cpf(r.R28e,1),cpf(r.K28e,0),cpf(r.P28e,1)]]),
    h('p',{style:'font-size:12px;margin:6px 0'},'Độ sụt đo ban đầu: '+cpf(r.sut_do,1)+' cm (yêu cầu '+sl+').'));}
/* ---- khai báo loại */
(function(){
  const tests=[{code:'CP_01',name:'Thiết kế thành phần cấp phối bê tông',std:'Phương pháp thể tích tuyệt đối',unit:'kg/m³',key:'X'},{code:'CP_02',name:'Cường độ chịu nén mẫu bê tông đúc thử',std:'TCVN 3118:2022',unit:'MPa',key:'R7'}];
  const dp={mac:0,sut:0,X:0,cat:0,da:0,Nf:0,XN:3,Kd:2,Vh:1,sumv:1,pg:2,R3:2,R7:2,R28:2,K3:0,K7:0,K28:0,rx:0,F3:1,F7:1,F28:1};
  const txtKeys=['xm_src','xm_bc','xm_ten','xm_lo','ct_src','ct_bc','ct_ten','da_src','da_bc','da_ten','da_loai','da_cl','pg_ten'];
  const ph={mac:'300',sut:'4',hk:'1',dl:'90',xm_ten:'Sông Gianh PCB40',xm_lo:'4B-QB0144089',xm_r28:'44,8',xm_rho:'3,1',xm_rhox:'1,1',ct_ten:'Nguồn Long Đại',ct_mdl:'2,65',ct_rx:'1452',ct_ra:'2,61',ct_s5:'0',
    da_ten:'Mỏ đá Lèn Bạc',da_loai:'Đá dăm',da_dmax:'20',da_cl:'Tốt',da_rx:'1455',da_rho:'2,7',da_rhov:'2,68',da_nd:'10,3',pg_ten:'',pg_lieu:'0',pg_giam:'0',n_vien:'9',canh:'15',alpha:'1',w_c:'0',w_d:'0',sut_do:'7,4',
    p3_0:'455',p3_1:'448',p3_2:'462',p7_0:'590',p7_1:'582',p7_2:'598',p28_0:'795',p28_1:'810',p28_2:'801'};
  const F=(k,l)=>[k,l];
  const live=(fn)=>d=>{const o=rcCP(d);return fn(o,d);};
  GT.CP_BT={code:'CP_BT',form:{code:'BM-CP-01',ver:'v1.0'},ten:'Cấp phối bê tông',b64:()=>CP_B64,map:CP_MAP,textKeys:txtKeys,fixed:[['B5','Mã loại mẫu','CP_BT']].concat(CP_FIX),tests,dp,rc:rcCP,
    rkeys:(raw,rc)=>['XN','X','Nf','cat','da','Vh','Kd','R3','R7'].concat(rc.R28!=null?['R28']:[]),
    cacheCells:{},
    expect:rc=>{const e={};CP_CALC.forEach(([cell,k])=>{if(typeof rc[k]==='number'&&isFinite(rc[k]))e[cell]=rc[k];});return e;},
    results:(rc,raw)=>{const o={};['mac','sut','XN','N0','N2','X','Nf','cat','da','pg','Vh','Kd','sumv','v_x','v_c','v_d','v_n','s_x','s_c','s_d','Vb','b_x','b_c','b_d','b_n','b_p','F3','F7','F28','R3','R7','R28','K3','K7','K28','P3','P7','P28','R28e','K28e','P28e','L3','L7','L28'].forEach(k=>{const v=(k==='mac'||k==='sut')?nzn(raw[k]):rc[k];if(v!=null)o[k]=v;});
      o.sut_do=nzn(raw.sut_do);o.canh=nzn(raw.canh);
      o.t={};txtKeys.forEach(k=>{if(raw[k])o.t[k]=String(raw[k]);});
      o.m={};['xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra','ct_s5','da_dmax','da_rx','da_rho','da_rhov','da_nd','pg_lieu','pg_giam'].forEach(k=>{if(nzn(raw[k])!=null)o.m[k]=raw[k];});o.m.rx=rc.rx;o.m.r=rc.r;return o;},
    qr:[['mac','Mac BT'],['X','Xi mang'],['cat','Cat'],['da','Da'],['Nf','Nuoc'],['R7','R7 MPa'],['R28','R28 MPa']],
    ph,defaults:{hk:1,dl:0,xm_rho:3.1,xm_rhox:1.1,da_loai:'Đá dăm',da_cl:'Tốt',pg_lieu:0,pg_giam:0,n_vien:9,canh:15,alpha:1,w_c:0,w_d:0},
    opts:{da_loai:['Đá dăm','Sỏi'],da_cl:['Tốt','Trung bình'],sut:CP_SL.map((x,i)=>[i+1,x[0]]),da_dmax:CP_DMAX.map(x=>[x,x+' mm'])},
    kind:k=>(txtKeys.includes(k)&&k!=='da_loai'&&k!=='da_cl')?'text':(k==='da_loai'||k==='da_cl')?'sel':(k==='sut'||k==='da_dmax')?'numsel':'num',
    sections:d=>[
      {t:'Yêu cầu thiết kế',s:'Mác và độ sụt theo hồ sơ thiết kế.',g:[['',[F('mac','Mác bê tông M (kgf/cm²)'),F('sut','Nhóm độ sụt yêu cầu'),F('hk','Hệ số hiệu chỉnh xi măng sau nén 7 ngày'),F('dl','Chuyển từ cát sang đá (kg/m³, dương: tăng đá)')]]],
        live:live((o)=>{if(o.X==null)return null;if(o.Kd==null)return['Cấp phối','Ngoài bảng hệ số dư vữa','Vh = '+fnum(o.Vh,1)+' lít',true];return['Cấp phối 1 m³','xi măng '+fnum(o.X,0)+' · cát '+fnum(o.cat,0)+' · đá '+fnum(o.da,0)+' · nước '+fnum(o.Nf,0),' X/N = '+fnum(o.XN,3)+', Kd = '+fnum(o.Kd,2)+(o.kdOut?' (ngoài bảng, chỉ gần đúng)':'')+', tổng thể tích '+fnum(o.sumv,1)+' lít',Math.abs(o.sumv-1000)>CP_K.tol_v||o.kdOut];})},
      {t:'Xi măng',s:'Số liệu từ phiếu xi măng đã phát hành.',node:cpPicker('xm'),g:[['',[F('xm_ten','Nhãn hiệu, nguồn gốc'),F('xm_lo','Số lô'),F('xm_r28','R28 (MPa)'),F('xm_rho','Khối lượng riêng (g/cm³)'),F('xm_rhox','KL thể tích xốp (g/cm³)')]]],
        live:live(o=>o.rx==null?null:['Rx',fnum(o.rx,0)+' kgf/cm²','',false])},
      {t:'Cát',s:'Số liệu từ phiếu cát đã phát hành.',node:cpPicker('ct'),g:[['',[F('ct_ten','Nguồn cát'),F('ct_mdl','Mô đun độ lớn Mđl'),F('ct_rx','KL thể tích xốp (kg/m³)'),F('ct_ra','Khối lượng riêng (g/cm³)'),F('ct_s5','Hạt > 5 mm (%)')]]]},
      {t:'Đá dăm hoặc sỏi',s:'KLTT xốp lấy từ phiếu đá; khối lượng riêng và KL thể tích hạt nhập từ thí nghiệm riêng (phiếu đá chưa có).',node:cpPicker('da'),g:[['',[F('da_ten','Nguồn đá'),F('da_loai','Loại cốt liệu'),F('da_dmax','Dmax danh nghĩa'),F('da_cl','Chất lượng'),F('da_rx','KL thể tích xốp (kg/m³)'),F('da_rho','Khối lượng riêng (g/cm³)'),F('da_rhov','KL thể tích hạt (g/cm³)'),F('da_nd','Độ nén dập (%)')]]],
        live:live(o=>o.r==null?null:['Độ rỗng của đá',fnum(o.r*100,1)+' %','',false])},
      {t:'Phụ gia',s:'Để trống nếu không dùng.',g:[['',[F('pg_ten','Loại phụ gia'),F('pg_lieu','Liều lượng (lít/100 kg XM)'),F('pg_giam','Giảm nước (%)')]]]},
      {t:'Mẻ trộn thử và mẫu đúc',s:'Độ ẩm vật liệu dùng để tính lượng cân thực tế cho mẻ trộn thử.',g:[['',[F('n_vien','Số viên đúc'),F('canh','Cạnh mẫu (cm)'),F('alpha','Hệ số quy đổi kích thước mẫu'),F('w_c','Độ ẩm cát (%)'),F('w_d','Độ ẩm đá (%)'),F('sut_do','Độ sụt đo được (cm)')]]],
        live:live(o=>o.Vb==null||o.b_x==null?null:['Mẻ trộn thử',fnum(o.Vb*1000,1)+' lít',' xi măng '+fnum(o.b_x,2)+' · cát ướt '+fnum(o.b_c,2)+' · đá ướt '+fnum(o.b_d,2)+' · nước '+fnum(o.b_n,2)+' (kg, lít)',false])},
      {t:'Nén mẫu 3 ngày',s:'Lực nén phá hoại từng viên (kN).',g:[['',[F('p3_0','Viên 1'),F('p3_1','Viên 2'),F('p3_2','Viên 3')]]],live:live(o=>o.R3==null?null:['R3',fnum(o.R3,2)+' MPa',' ('+fnum(o.K3,0)+' kgf/cm²) · lệch lớn nhất '+fnum(o.L3,1)+' %',o.L3>CP_K.tol_r])},
      {t:'Nén mẫu 7 ngày',s:'Lực nén phá hoại từng viên (kN).',g:[['',[F('p7_0','Viên 1'),F('p7_1','Viên 2'),F('p7_2','Viên 3')]]],live:live(o=>o.R7==null?null:['R7',fnum(o.R7,2)+' MPa',' ('+fnum(o.K7,0)+' kgf/cm²) · lệch lớn nhất '+fnum(o.L7,1)+' %',o.L7>CP_K.tol_r])},
      {t:'Nén mẫu 28 ngày (nếu đã có)',s:'Bỏ trống nếu chưa nén; phiếu sẽ ghi cường độ 28 ngày dự kiến từ R7, chỉ tham khảo.',g:[['',[F('p28_0','Viên 1'),F('p28_1','Viên 2'),F('p28_2','Viên 3')]]],live:live(o=>o.R28==null?(o.R28e==null?null:['R28 dự kiến',fnum(o.R28e,2)+' MPa',' từ R7, chỉ tham khảo',false]):['R28',fnum(o.R28,2)+' MPa',' ('+fnum(o.K28,0)+' kgf/cm²) · lệch lớn nhất '+fnum(o.L28,1)+' %',o.L28>CP_K.tol_r])}],
    need:d=>CP_REQ.filter(k=>typeof d[k]!=='number').length+CP_TXT_REQ.filter(k=>!d[k]).length+CP_F37.filter(k=>typeof d[k]!=='number').length+(cp28(d)>0?3-cp28(d):0),
    total:d=>CP_REQ.length+CP_TXT_REQ.length+CP_F37.length+(cp28(d)>0?3:0),
    valid:(d,rc)=>{const n=nzn;return n(d.mac)!=null&&n(d.sut)!=null&&['xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra','ct_s5','da_dmax','da_rx','da_rho','da_rhov','n_vien','canh','alpha','sut_do'].every(k=>n(d[k])!=null)
      &&(d.da_loai==='Đá dăm'||d.da_loai==='Sỏi')&&(d.da_cl==='Tốt'||d.da_cl==='Trung bình')&&rc.okTab&&rc.Kd!=null&&CP_F37.every(k=>n(d[k])!=null)&&(cp28(d)===0||cp28(d)===3);},
    verify:cpVerify,
    head:['TT','Vật liệu','Khối lượng (kg/m³)','Thể tích tuyệt đối (lít)'],
    table:r=>[[1,'Xi măng',cpf(r.X,0),cpf(r.v_x,1)],[2,'Cát',cpf(r.cat,0),cpf(r.v_c,1)],[3,'Đá dăm, sỏi',cpf(r.da,0),cpf(r.v_d,1)],[4,'Nước',cpf(r.Nf,0),cpf(r.v_n,1)]],
    body:cpBody,
    nhanXet:r=>r.X==null?'':('Thành phần cấp phối tính cho 1 m³ bê tông theo số liệu vật liệu nêu trên, độ ẩm vật liệu khi thiết kế bằng 0 %. Khi trộn cần hiệu chỉnh theo độ ẩm thực tế của cát và đá. '+(r.R28!=null?'Cường độ nén sau 28 ngày đạt '+fnum(r.P28,1)+' % so với mác thiết kế.':(r.R28e!=null?'Cường độ nén sau 28 ngày dự kiến chỉ có giá trị tham khảo.':''))),
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp);const src=k=>raw[k+'_src']?(raw[k+'_bc']+' ('+raw[k+'_src']+')'):'nhập tay';
      return[['Yêu cầu','M'+f(raw.mac,0)+' · nhóm độ sụt '+f(raw.sut,0)+' · hk '+f(raw.hk,2)+' · chuyển cát sang đá '+f(raw.dl,0)+' kg'],
        ['Xi măng · nguồn '+src('xm'),(raw.xm_ten||'')+' · lô '+(raw.xm_lo||'')+' · R28 '+f(raw.xm_r28,1)+' MPa · ρ '+f(raw.xm_rho,2)+' · ρx '+f(raw.xm_rhox,2)],
        ['Cát · nguồn '+src('ct'),(raw.ct_ten||'')+' · Mđl '+f(raw.ct_mdl,2)+' · ρx '+f(raw.ct_rx,1)+' · ρ '+f(raw.ct_ra,2)+' · hạt > 5 mm '+f(raw.ct_s5,2)+' %'],
        ['Đá · nguồn '+src('da'),(raw.da_loai||'')+' '+(raw.da_ten||'')+' · Dmax '+f(raw.da_dmax,0)+' · '+(raw.da_cl||'')+' · ρx '+f(raw.da_rx,0)+' · ρ '+f(raw.da_rho,2)+' · ρv '+f(raw.da_rhov,2)],
        ['Phụ gia',(raw.pg_ten||'không dùng')+' · '+f(raw.pg_lieu,2)+' lít/100 kg · giảm nước '+f(raw.pg_giam,1)+' %'],
        ['Mẫu đúc','n = '+f(raw.n_vien,0)+' · cạnh '+f(raw.canh,0)+' cm · α '+f(raw.alpha,2)+' · ẩm cát '+f(raw.w_c,1)+' % · ẩm đá '+f(raw.w_d,1)+' % · độ sụt đo '+f(raw.sut_do,1)+' cm'],
        ['Lực nén (kN)','3 ngày: '+[0,1,2].map(i=>f(raw['p3_'+i],1)).join(' · ')+' | 7 ngày: '+[0,1,2].map(i=>f(raw['p7_'+i],1)).join(' · ')+' | 28 ngày: '+[0,1,2].map(i=>f(raw['p28_'+i],1)).join(' · ')]];},
    qt:()=>[['Yêu cầu',[QT_C('Mác (kgf/cm²)','mac',0),QT_C('Nhóm độ sụt','sut',0),QT_C('Độ sụt đo (cm)','sut_do',1)]],
      ['Xi măng',[QT_C('R28 (MPa)','xm_r28',1),QT_C('KL riêng (g/cm³)','xm_rho',2),QT_C('KLTT xốp (g/cm³)','xm_rhox',2)]],
      ['Cát',[QT_C('Mđl','ct_mdl',2),QT_C('KLTT xốp (kg/m³)','ct_rx',1),QT_C('KL riêng (g/cm³)','ct_ra',2),QT_C('Hạt > 5 mm (%)','ct_s5',2)]],
      ['Đá',[QT_C('Dmax (mm)','da_dmax',0),QT_C('KLTT xốp (kg/m³)','da_rx',0),QT_C('KL riêng (g/cm³)','da_rho',2),QT_C('KL thể tích hạt (g/cm³)','da_rhov',2),QT_C('Nén dập (%)','da_nd',1)]],
      ['Phụ gia',[QT_C('Liều lượng (lít/100 kg XM)','pg_lieu',2),QT_C('Giảm nước (%)','pg_giam',1)]],
      ['Cấp phối 1 m³',[QT_R('X/N','XN',3),QT_R('Xi măng (kg)','X',0),QT_R('Cát (kg)','cat',0),QT_R('Đá (kg)','da',0),QT_R('Nước (lít)','Nf',0),QT_R('Phụ gia (lít)','pg',2),QT_R('Kd','Kd',2),QT_R('Tổng TT tuyệt đối (lít)','sumv',1)]],
      ['Nén mẫu',[QT_R('R3 (MPa)','R3',2),QT_R('R7 (MPa)','R7',2),QT_R('R28 (MPa)','R28',2),QT_R('R7 (kgf/cm²)','K7',0),QT_R('R28 dự kiến (MPa)','R28e',2)]]]};
  GT.CP_BT.tests.forEach(t=>ALL_TESTS.push(t));
})();
