/* ====================================================================== 0.13.0 NÉN BÊ TÔNG, NÉN VỮA, ĐO K (DAO VÒNG, PHỄU RÓT CÁT), CẤP PHỐI THIÊN NHIÊN (ĐẦM CHẶT) */
const NB_B64='@@NB@@',NV_B64='@@NV@@',KDV_B64='@@KDV@@',KPR_B64='@@KPR@@',CPT_B64='@@CPT@@';
NGUON_LBL.NEN_BT={l:'Cấu kiện, vị trí đúc mẫu',ph:'Ví dụ: Bê tông cống hộp km0+200',hint:'Ghi cấu kiện hoặc vị trí đổ bê tông lấy mẫu.'};
NGUON_LBL.NEN_VUA={l:'Hạng mục, vị trí lấy mẫu vữa',ph:'Ví dụ: Vữa xây tường nhà lớp học A',hint:'Ghi hạng mục xây hoặc trát lấy mẫu vữa.'};
NGUON_LBL.DO_K_DV={l:'Đoạn, vị trí đo',ph:'Ví dụ: Km0+000 - Km0+500, lớp đắp cát 1',hint:'Ghi đoạn tuyến, lớp đắp được đo hệ số đầm nén K.'};
NGUON_LBL.DO_K_PR=NGUON_LBL.DO_K_DV;
CP_SRC.cp={loai:['CP_TN'],t:'cấp phối thiên nhiên (đầm chặt)'};
const rpt=(r,dp)=>cpRound(r,dp);
/* ---------- nén mẫu bê tông / vữa: cùng một động cơ, khác công thức đổi lực sang cường độ */
const NEN_N=9,ALPHA_BT={100:0.91,150:1,200:1.05,300:1.1};
const nenRc=bt=>r=>{
  const n=nzn,mac=n(r.mac),tuoi=n(r.tuoi),canh=bt?n(r.canh):null,al=bt?(ALPHA_BT[canh]!=null?ALPHA_BT[canh]:null):1,rows=[];
  for(let i=0;i<NEN_N;i++){const f=n(r['f_'+i]);if(f==null)continue;const R=bt?(al==null?null:al*f*100/Math.pow(canh/10,2)):f*1000/1600;rows.push({i,f,R});}
  const ok=rows.filter(x=>x.R!=null),o={rows,n:ok.length,al,mac,tuoi,canh,ftb:null,tb:null,pct:null,lech:null};
  if(ok.length){o.ftb=mean_(ok.map(x=>x.f));o.tb=mean_(ok.map(x=>x.R));o.pct=(mac!=null&&mac>0)?100*o.tb/mac:null;
    ok.forEach(x=>{x.l=100*(x.f-o.ftb)/o.ftb;});o.lech=Math.max(...ok.map(x=>Math.abs(x.l)));}
  return o;};
function nenSpec(bt){
  const code=bt?'NEN_BT':'NEN_VUA',unit=bt?'daN/cm²':'N/mm²',udp=bt?0:1,NMIN=bt?3:6,rcf=nenRc(bt);
  const map={mac:'B4',tuoi:'B5'};if(bt)map.canh='B6';for(let i=0;i<NEN_N;i++)map['f_'+i]='B'+(10+i);
  const fixed=bt?[['B11','Số chữ số thập phân cường độ',0],['B12','Số chữ số thập phân lực nén',1],['B13','Số chữ số thập phân % so với mác',1],['B14','Số viên tối thiểu',3],['B15','Ngưỡng cảnh báo viên lệch (%)',15]].concat([100,150,200,300].flatMap((c,i)=>[['B'+(19+i),'Bảng hệ số quy đổi: cạnh '+(i+1),c],['C'+(19+i),'Bảng hệ số quy đổi: hệ số tại cạnh '+c,ALPHA_BT[c]]]))
    :[['B11','Số chữ số thập phân cường độ',1],['B12','Số chữ số thập phân lực nén',1],['B13','Số chữ số thập phân % so với mác',1],['B14','Số viên tối thiểu',6],['B15','Ngưỡng cảnh báo viên lệch (%)',15],['B16','Diện tích mặt nén (mm²)',1600]];
  const test={code:bt?'NB_01':'NV_01',name:bt?'Cường độ chịu nén bê tông':'Cường độ chịu nén mẫu vữa',std:bt?'TCVN 3118:93':'TCVN 3121-11:2003',unit,key:'tb'};
  const dp={tb:udp,pct:1,ftb:1,lech:1,n:0};
  const sizeKeys=i=>['f_'+i];
  const defN=NMIN,cnt=d=>Math.max(1,Math.min(NEN_N,d.n||defN));
  const G={code,form:{code:bt?'BM-NB-01':'BM-NV-01',ver:'v1.0'},ten:bt?'Nén mẫu bê tông':'Nén mẫu vữa',b64:()=>bt?NB_B64:NV_B64,map,textKeys:[],fixed,tests:[test],dp,rc:rcf,rkeys:['n','ftb','tb','pct','lech'],
    cacheCells:{n:'B21',ftb:'B22',tb:'B23',pct:'B24',lech:'B25'},
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{if(x.R!=null){o['C'+(10+x.i)]=x.R;o['D'+(10+x.i)]=x.l;}});return o;},
    expect:rc=>Object.assign({n:rc.n,ftb:rc.ftb,tb:rc.tb,pct:rc.pct,lech:rc.lech},G.rowCache(rc)),
    results:(rc,raw)=>({n:rc.n,ftb:rc.ftb,tb:rc.tb,pct:rc.pct,lech:rc.lech,mac:rc.mac,tuoi:rc.tuoi,canh:rc.canh,al:rc.al,rows:rc.rows.map(x=>({f:x.f,R:x.R,l:x.l}))}),
    qr:[['tb','R TB ('+unit+')'],['pct','% so voi mac'],['n','So vien']],
    ph:{mac:bt?'200':'7,5',tuoi:'28',f_0:bt?'500':'14,3',f_1:bt?'470':'13',f_2:bt?'495':'13,6',f_3:'13,4',f_4:'13,1',f_5:'13,1'},defaults:Object.assign({n:defN,tuoi:28},bt?{canh:150}:{}),
    init:s=>{const m=s.mau||{},a=m.ngay_lay,b=m.ngay_nhan;if(a&&b){const t=Math.round((Date.parse(b)-Date.parse(a))/864e5);if(t>=1&&t<=400)return{tuoi:t};}return{};},
    opts:{canh:[[100,'100 mm'],[150,'150 mm'],[200,'200 mm'],[300,'300 mm']]},
    kind:k=>k==='canh'?'numsel':'num',
    sections:d=>{const n=cnt(d),out=[];
      out.push(Object.assign(sec1('Thông số mẫu',bt?'Mác thiết kế theo hồ sơ; tuổi mẫu tính từ ngày lấy mẫu đến ngày nén (đã điền sẵn, sửa được).':'Mác vữa thiết kế theo hồ sơ (N/mm²); tuổi mẫu tính từ ngày lấy mẫu đến ngày nén.',[['',[['mac','Mác thiết kế ('+unit+')'],['tuoi','Tuổi mẫu (ngày)']].concat(bt?[['canh','Cạnh mẫu lập phương']]:[])]]),{live:dd=>{const r=rcf(dd);return bt&&r.al!=null?['Hệ số quy đổi mẫu '+r.canh+' mm',fnum(r.al,2),'(chuẩn là mẫu 150 mm)',false]:null;}}));
      out.push(sec1('Lực nén phá hoại (kN)','Nhập lực từng viên. Hệ thống tính cường độ, trung bình và so với mác.',[['',ix_(n).map(i=>['f_'+i,'Viên '+(i+1)])]],dd=>{const r=rcf(dd);return r.n?['Cường độ nén TB',fnum(r.tb,udp)+' '+unit,(r.pct!=null?'= '+fnum(r.pct,1)+' % mác · ':'')+'lệch lớn nhất '+fnum(r.lech,1)+' %',r.lech>15||r.n<NMIN]:null;}));
      return out;},
    need:d=>{let c=0;['mac','tuoi'].concat(bt?['canh']:[]).forEach(k=>{if(typeof d[k]!=='number')c++;});const n=cnt(d);for(let i=0;i<n;i++)if(typeof d['f_'+i]!=='number')c++;return c;},
    total:d=>2+(bt?1:0)+cnt(d),
    valid:(d,rc)=>rc.mac>0&&rc.tuoi>0&&(!bt||rc.al!=null)&&rc.n>=NMIN&&rc.rows.every(x=>x.R!=null&&x.f>0),
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn','data-act':'nen-add',onclick:()=>{if(cnt(d)>=NEN_N){toast('Tối đa '+NEN_N+' viên trên một phiếu.','bad');return;}d.n=cnt(d)+1;again();}},'＋ Thêm viên'),
      cnt(d)>1?h('button',{class:'btn','data-act':'nen-del',onclick:()=>{const i=cnt(d)-1;sizeKeys(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một viên'):null),
    verify:(raw,sample)=>{const out=[],r=rcf(raw),W='Lưu ý khi kiểm tra: ',m=(sample&&sample.mau)||{};
      if(r.n&&r.lech>15)out.push({label:W+'Viên lệch so với trung bình không quá 15 %',state:'warn',note:'Viên lệch '+fnum(r.lech,1)+' % so với trung bình. Người soát xét cần xem lại.'});
      if(r.tuoi!=null&&r.tuoi!==28)out.push({label:W+'Tuổi mẫu 28 ngày',state:'warn',note:'Tuổi mẫu ghi '+r.tuoi+' ngày: % so với mác chỉ mang tính tham khảo.'});
      if(r.tuoi!=null&&m.ngay_lay&&m.ngay_nhan){const t=Math.round((Date.parse(m.ngay_nhan)-Date.parse(m.ngay_lay))/864e5);if(t!==r.tuoi)out.push({label:W+'Tuổi mẫu khớp ngày lấy mẫu và ngày nhận',state:'warn',note:'Ngày lấy '+fd(m.ngay_lay)+', ngày nhận '+fd(m.ngay_nhan)+' là '+t+' ngày, biểu mẫu ghi '+r.tuoi+' ngày.'});}
      return out;},
    head:['TT','Viên mẫu','Lực nén (kN)','Cường độ nén ('+unit+')','Lệch so với TB (%)'],
    table:r=>(r.rows||[]).map((x,i)=>[i+1,'Viên '+(x.i!=null?x.i+1:i+1),fnum(x.f,1),fnum(x.R,udp),fnum(x.l,1)]),
    nhanXet:r=>!r.n?'':('Cường độ nén trung bình '+fnum(r.tb,udp)+' '+unit+(r.pct!=null?'; đạt '+fnum(r.pct,1)+' % so với mác thiết kế '+fnum(r.mac,udp)+' '+unit+(bt?' (tính theo mẫu chuẩn)':'')+'.':'.')),
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp),out=[['Mác · tuổi'+(bt?' · cạnh':''),f(raw.mac,udp===0?1:1)+' '+unit+' · '+f(raw.tuoi,0)+' ngày'+(bt?' · '+f(raw.canh,0)+' mm':'')]];
      out.push(['Lực nén (kN)',ix_(NEN_N).filter(i=>raw['f_'+i]!=null).map(i=>f(raw['f_'+i],1)).join(' · ')]);return out;}};
  G.qt=()=>[['Thông số',[QT_C('Mác ('+unit+')','mac',bt?0:1),QT_C('Tuổi (ngày)','tuoi',0)].concat(bt?[QT_C('Cạnh mẫu (mm)','canh',0)]:[])],
    ['Lực nén từng viên (kN)',ix_(NEN_N).map(i=>QT_C('Viên '+(i+1),'f_'+i,1))],
    ['Kết quả',[QT_R('Số viên','n',0),QT_R('Lực TB (kN)','ftb',1),QT_R('Cường độ TB ('+unit+')','tb',udp),QT_R('% so với mác','pct',1)]]];
  GT[code]=G;ALL_TESTS.push(test);}
nenSpec(true);nenSpec(false);
/* ---------- đo hệ số đầm nén K: dao vòng (cát) và phễu rót cát (đất) */
const K_N=15;
const kRc=dv=>r=>{
  const n=nzn,wo=n(r.wo),gk=n(r.gkmax),V=n(r.V),yc=n(r.yc),m0=dv?n(r.m0):null,gc=dv?null:n(r.gc),mp=(!dv&&V!=null&&gc!=null)?V*gc:null,rows=[];
  for(let i=0;i<K_N;i++){
    const lt=r['lt_'+i],vt=r['vt_'+i],ct=n(r['ct_'+i]),w=n(r['w_'+i]),f=n(r['f_'+i]),g=dv?null:n(r['g_'+i]),hh=dv?null:n(r['h_'+i]);
    if(![lt,vt,ct,w,f,g,hh].some(x=>x!=null&&x!==''))continue;
    const o={i,lt:lt||'',vt:vt||'',ct,w,f,g,h:hh,vh:null,gw:null,gk:null,K:null,cat:null};
    if(dv){if(f!=null&&m0!=null)o.cat=f-m0;if(o.cat!=null&&V!=null&&V>0)o.gw=o.cat/V;}
    else{if(g!=null&&hh!=null&&mp!=null&&gc!=null&&gc!==0)o.vh=(g-hh-mp)/gc;if(f!=null&&o.vh!=null&&o.vh!==0)o.gw=f/o.vh;}
    if(o.gw!=null&&w!=null)o.gk=o.gw/(1+0.01*w);
    if(o.gk!=null&&gk!=null&&gk!==0)o.K=o.gk*100/gk;
    rows.push(o);}
  const ks=rows.map(x=>x.K).filter(x=>x!=null),o={rows,wo,gk,V,m0,gc,mp,yc,n:ks.length,kmin:null,kmax:null,ktb:null,bad:null};
  if(ks.length){o.kmin=Math.min(...ks);o.kmax=Math.max(...ks);o.ktb=mean_(ks);}
  if(yc!=null)o.bad=rows.filter(x=>x.K!=null&&x.K<yc).length;
  o.kl=(yc==null||!o.n)?'CHƯA XÉT':(o.kmin>=yc?'ĐẠT':'KHÔNG ĐẠT');
  return o;};
const kpCp=x=>{const r=(x.nop&&x.nop.results)||{};return{wo:r.w!=null?rpt(r.w,1):null,gkmax:r.gk!=null?rpt(r.gk,3):null};};
function kpPicker(d,again,s){
  const cands=cpCands(s,'cp'),T=CP_SRC.cp.t;
  const sel=h('select',{'aria-label':'Chọn phiếu cấp phối thiên nhiên đã phát hành',onchange:e=>{const v=e.target.value;if(!v){delete d.cp_src;delete d.cp_bc;}else{const x=cands.find(c=>c.ma_mau===v);if(x){d.cp_src=x.ma_mau;d.cp_bc=x.so_bao_cao;const k=kpCp(x);if(k.wo!=null)d.wo=k.wo;if(k.gkmax!=null)d.gkmax=k.gkmax;}}again();}},
    [h('option',{value:''},'Nhập tay, không liên kết')].concat(cands.map(x=>h('option',{value:x.ma_mau,selected:d.cp_src===x.ma_mau},x.so_bao_cao+' · '+x.ma_mau+' · '+((x.mau&&x.mau.nguon_goc)||'')+' · nhận '+fd(x.mau&&x.mau.ngay_nhan)))));
  return h('div',{class:'mf-g'},h('b',null,'Lấy Wo và γkmax từ phiếu '+T+' đã phát hành'),h('div',{class:'mf-f'},h('label',{style:'grid-column:1/-1'},'Phiếu nguồn',sel)),
    h('div',{class:'small muted',style:'margin-top:4px'},d.cp_src?('Đã liên kết '+d.cp_bc+'. Wo và γkmax lấy từ phiếu (giá trị hiệu chỉnh nếu có); sửa tay sẽ bị báo lệch khi kiểm tra hồ sơ.'):(cands.length?'Chọn phiếu để điền sẵn Wo, γkmax, hoặc nhập tay nếu thí nghiệm ở nơi khác.':'Chưa có phiếu cấp phối thiên nhiên đã phát hành. Nhập tay.')));}
function kVerify(raw,sample){
  const out=[],W='Lưu ý khi kiểm tra: ',src=raw.cp_src;
  if(!src)out.push({label:'Wo và γkmax nhập tay, không liên kết phiếu cấp phối thiên nhiên',state:'warn',note:'Người soát xét cần đối chiếu phiếu đầm chặt ở nơi thử khác.'});
  else{const x=S.samples.find(s=>s.ma_mau===src);
    if(!x||!CP_SRC.cp.loai.includes(loaiOf(x)))out.push({label:'Phiếu cấp phối thiên nhiên nguồn '+src+' tồn tại và đúng loại',state:'fail',note:x?'Mẫu '+src+' là '+loaiOf(x)+'.':'Không tìm thấy mẫu '+src+'.'});
    else if(x.status!=='da_phat_hanh'||!x.so_bao_cao||!x.nop||!x.nop.results)out.push({label:'Phiếu cấp phối thiên nhiên nguồn '+src+' đã phát hành',state:'fail',note:'Mẫu '+src+' chưa phát hành số báo cáo.'});
    else{const v=kpCp(x),bad=[];if(!(typeof raw.wo==='number'&&Math.abs(raw.wo-v.wo)<1e-9))bad.push('Wo');if(!(typeof raw.gkmax==='number'&&Math.abs(raw.gkmax-v.gkmax)<1e-9))bad.push('γkmax');if(raw.cp_bc!==x.so_bao_cao)bad.push('số báo cáo');
      out.push({label:'Wo, γkmax khớp phiếu '+x.so_bao_cao+' ('+src+')',state:bad.length?'fail':'ok',note:bad.length?'Lệch ở: '+bad.join(', ')+'. Điền lại từ phiếu nguồn hoặc bỏ liên kết nếu nhập tay.':''});}}
  const r=(raw.__rc||null);
  return out;}
function kSpec(dv){
  const code=dv?'DO_K_DV':'DO_K_PR',rcf=kRc(dv),R0=dv?13:14,CC=dv?{n:'B30',kmin:'B31',kmax:'B32',ktb:'B33',bad:'B34'}:{n:'B31',kmin:'B32',kmax:'B33',ktb:'B34',bad:'B35'};
  const map=dv?{wo:'B4',gkmax:'B5',V:'B6',m0:'B7',yc:'B8',cp_src:'B9',cp_bc:'B10'}:{wo:'B4',gkmax:'B5',V:'B6',gc:'B7',yc:'B9',cp_src:'B10',cp_bc:'B11'};
  for(let i=0;i<K_N;i++){const r=R0+i;Object.assign(map,{['lt_'+i]:'B'+r,['vt_'+i]:'C'+r,['ct_'+i]:'D'+r,['w_'+i]:'E'+r,['f_'+i]:'F'+r});if(!dv){map['g_'+i]='G'+r;map['h_'+i]='H'+r;}}
  const fixed=[['B11','Số chữ số thập phân độ ẩm',1],['B12','Số chữ số thập phân khối lượng',0],['B13','Số chữ số thập phân dung trọng',3],['B14','Số chữ số thập phân hệ số K',1],['B15','Số điểm đo tối đa',K_N]].concat(dv?[]:[['B16','Số chữ số thập phân thể tích hố đào',0]]);
  const test={code:dv?'DK_01':'DK_02',name:dv?'Hệ số đầm nén chặt K (dao vòng)':'Hệ số đầm nén chặt K (phễu rót cát)',std:dv?'22 TCN 02:71':'22 TCN 346:2006',unit:'%',key:'kmin'};
  const keysOf=i=>['lt_'+i,'vt_'+i,'ct_'+i,'w_'+i,'f_'+i].concat(dv?[]:['g_'+i,'h_'+i]);
  const dpr={wo:1,gk:3,K:1,gw:3,f:0,cat:0,vh:0,w:1};
  const cnt=d=>Math.max(1,Math.min(K_N,d.n||3));
  const sectPt=i=>sec1('Điểm đo '+(i+1),dv?'Đo bằng dao vòng, 1 điểm một lần lấy mẫu.':'Đo bằng phễu rót cát, 1 điểm một hố đào.',[['',[['lt_'+i,'Lý trình (ví dụ Km0+36)'],['vt_'+i,'Vị trí (Trái/Phải/Tim)'],['ct_'+i,'Cách tim (m)'],['w_'+i,'Độ ẩm W (%)']].concat(dv?[['f_'+i,'KL cát + dao (g)']]:[['f_'+i,'KL đất đào (g)'],['g_'+i,'KL cát ban đầu (g)'],['h_'+i,'KL cát còn lại (g)']])]],
    d=>{const x=rcf(d).rows.find(y=>y.i===i);return(!x||x.K==null)?null:['K = ',fnum(x.K,1)+' %','γk = '+fnum(x.gk,3)+' g/cm³'+(d.yc!=null&&x.K<d.yc?' · dưới yêu cầu':''),d.yc!=null&&x.K<d.yc];});
  const G={code,form:{code:dv?'BM-DK-01':'BM-DK-02',ver:'v1.0'},ten:dv?'Đo K dao vòng':'Đo K phễu rót cát',b64:()=>dv?KDV_B64:KPR_B64,map,textKeys:['cp_src','cp_bc'],textPrefix:['lt_','vt_'],fixed,tests:[test],
    dp:{kmin:1,kmax:1,ktb:1,n:0},rc:rcf,rkeys:['n','kmin','kmax','ktb'],
    cacheCells:Object.assign({},CC,dv?{}:{mp:'B8'}),
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{const r=R0+x.i;if(dv){if(x.cat!=null)o['G'+r]=x.cat;if(x.gw!=null)o['H'+r]=x.gw;if(x.gk!=null)o['I'+r]=x.gk;if(x.K!=null)o['J'+r]=x.K;}else{if(x.vh!=null)o['I'+r]=x.vh;if(x.gw!=null)o['J'+r]=x.gw;if(x.gk!=null)o['K'+r]=x.gk;if(x.K!=null)o['L'+r]=x.K;}});return o;},
    expect:rc=>Object.assign({n:rc.n,kmin:rc.kmin,kmax:rc.kmax,ktb:rc.ktb,bad:rc.bad},dv?{}:{mp:rc.mp},G.rowCache(rc)),
    results:(rc,raw)=>({n:rc.n,kmin:rc.kmin,kmax:rc.kmax,ktb:rc.ktb,bad:rc.bad,kl:rc.kl,yc:rc.yc,wo:rc.wo,gkmax:rc.gk,V:rc.V,m0:rc.m0,gc:rc.gc,mp:rc.mp,cp_src:raw.cp_src||'',cp_bc:raw.cp_bc||'',
      rows:rc.rows.map(x=>({lt:x.lt,vt:x.vt,ct:x.ct,w:x.w,f:x.f,g:x.g,h:x.h,cat:x.cat,vh:x.vh,gw:x.gw,gk:x.gk,K:x.K}))}),
    qr:[['kmin','K min (%)'],['kmax','K max (%)'],['n','So diem']],
    ph:{wo:dv?'9,1':'13,6',gkmax:dv?'1,637':'2,375',V:dv?'190,7':'1025',m0:'231',gc:'1,486',yc:'85',lt_0:'Km0+36',vt_0:'Trái',ct_0:'0,7',w_0:dv?'8,5':'3',f_0:dv?'540':'3128',g_0:'6493',h_0:'2762'},
    defaults:{n:3},kind:k=>(/^(lt_|cp_)/.test(k))?'text':(/^vt_/.test(k)?'sel':'num'),
    opts:(()=>{const o={};for(let i=0;i<K_N;i++)o['vt_'+i]=['Trái','Phải','Tim'];return o;})(),
    sections:d=>{const n=cnt(d),out=[];
      out.push(Object.assign(sec1('Thông số thí nghiệm','Wo và γkmax lấy từ thí nghiệm đầm chặt (có thể liên kết phiếu cấp phối thiên nhiên đã phát hành).',[['',[['wo','Độ ẩm tốt nhất Wo (%)'],['gkmax','Dung trọng khô lớn nhất γkmax (g/cm³)']].concat(dv?[['V','Thể tích dao vòng (cm³)'],['m0','Khối lượng dao (g)']]:[['V','Thể tích phễu cát (cm³)'],['gc','Dung trọng cát chuẩn (g/cm³)']]).concat([['yc','Yêu cầu K tối thiểu (%) - nếu có']])]],
        d=>{const r=rcf(d);return r.n?['Kết luận tạm',r.kl,'K nhỏ nhất '+fnum(r.kmin,1)+' %'+(r.mp!=null?' · cát trong phễu '+fnum(r.mp,0)+' g':''),r.kl==='KHÔNG ĐẠT']:null;}),{node:kpPicker}));
      for(let i=0;i<n;i++)out.push(sectPt(i));
      return out;},
    need:d=>{let c=0;['wo','gkmax','V',dv?'m0':'gc'].forEach(k=>{if(typeof d[k]!=='number')c++;});for(let i=0;i<cnt(d);i++){if(!d['lt_'+i])c++;if(!d['vt_'+i])c++;if(typeof d['w_'+i]!=='number')c++;if(typeof d['f_'+i]!=='number')c++;if(!dv){if(typeof d['g_'+i]!=='number')c++;if(typeof d['h_'+i]!=='number')c++;}}return c;},
    total:d=>4+cnt(d)*(dv?4:6),
    valid:(d,rc)=>rc.wo>0&&rc.gk>0&&rc.V>0&&(dv?rc.m0>0:rc.gc>0)&&rc.rows.length>0&&rc.rows.every(x=>x.lt&&x.vt&&x.K!=null&&x.w>=0),
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn','data-act':'k-add',onclick:()=>{if(cnt(d)>=K_N){toast('Tối đa '+K_N+' điểm đo trên một phiếu. Hãy tách thành mẫu khác cùng phiếu yêu cầu.','bad');return;}d.n=cnt(d)+1;again();}},'＋ Thêm điểm đo'),
      cnt(d)>1?h('button',{class:'btn','data-act':'k-del',onclick:()=>{const i=cnt(d)-1;keysOf(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một điểm'):null),
    verify:(raw,sample)=>{const out=kVerify(raw,sample),rc=rcf(raw),W='Lưu ý khi kiểm tra: ';
      if(rc.rows.some(x=>x.K!=null&&x.K>100))out.push({label:W+'Hệ số K không lớn hơn 100 %',state:'warn',note:'Có điểm K lớn hơn 100 %: kiểm tra lại γkmax hoặc số đo.'});
      if(rc.yc==null)out.push({label:W+'Đã nhập yêu cầu hệ số đầm nén K',state:'warn',note:'Để trống thì phiếu không kết luận đạt hay không đạt.'});
      return out;},
    body:r=>{const rows=r.rows||[];
      const head=dv?['TT','Lý trình','Vị trí','Cách tim (m)','Độ ẩm W (%)','KL cát + dao (g)','KL cát trong dao (g)','Dung trọng ướt (g/cm³)','Dung trọng khô (g/cm³)','K (%)']:['TT','Lý trình','Vị trí','Cách tim (m)','Độ ẩm W (%)','KL đất đào (g)','KL cát ban đầu (g)','KL cát còn lại (g)','Thể tích hố đào (cm³)','Dung trọng ướt (g/cm³)','Dung trọng khô (g/cm³)','K (%)'];
      const line=x=>dv?[x.lt,x.vt,x.ct==null?'-':fnum(x.ct,1),fnum(x.w,1),fnum(x.f,0),fnum(x.cat,0),fnum(x.gw,3),fnum(x.gk,3),fnum(x.K,1)]:[x.lt,x.vt,x.ct==null?'-':fnum(x.ct,1),fnum(x.w,1),fnum(x.f,0),fnum(x.g,0),fnum(x.h,0),fnum(x.vh,0),fnum(x.gw,3),fnum(x.gk,3),fnum(x.K,1)];
      return h('div',null,
        h('p',{style:'font-size:12px;margin:6px 0'},h('b',null,'Thông số: '),'Wo = '+fnum(r.wo,1)+' % · γkmax = '+fnum(r.gkmax,3)+' g/cm³ · '+(dv?'thể tích dao vòng '+fnum(r.V,1)+' cm³ · khối lượng dao '+fnum(r.m0,0)+' g':'thể tích phễu cát '+fnum(r.V,0)+' cm³ · dung trọng cát '+fnum(r.gc,3)+' g/cm³ · cát trong phễu '+fnum(r.mp,0)+' g')+(r.yc!=null?' · yêu cầu K ≥ '+fnum(r.yc,0)+' %':'')),
        h('table',null,h('thead',null,h('tr',null,head.map(x=>h('th',null,x)))),h('tbody',null,rows.map((x,i)=>h('tr',{style:(r.yc!=null&&x.K!=null&&x.K<r.yc)?'color:#b00020':''},[i+1].concat(line(x)).map((c,j)=>h('td',{class:j===1||j===2?'':'c'},c==null?'':String(c))))))));},
    table:r=>(r.rows||[]).map((x,i)=>[i+1,x.lt,x.vt,fnum(x.K,1)]),head:['TT','Lý trình','Vị trí','K (%)'],
    nhanXet:r=>!r.n?'':(r.kl==='ĐẠT'?'Hệ số đầm nén K tại các điểm đo nêu trên đạt yêu cầu (K ≥ '+fnum(r.yc,0)+' %). K nhỏ nhất '+fnum(r.kmin,1)+' %.':(r.kl==='KHÔNG ĐẠT'?'Có điểm đo hệ số đầm nén K nhỏ hơn yêu cầu (K ≥ '+fnum(r.yc,0)+' %). K nhỏ nhất '+fnum(r.kmin,1)+' %.':'Kết quả đo hệ số đầm nén K tại các điểm nêu trên.')),
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp),out=[['Thông số','Wo '+f(raw.wo,1)+' % · γkmax '+f(raw.gkmax,3)+' · '+(dv?'V dao '+f(raw.V,1)+' · m dao '+f(raw.m0,0):'V phễu '+f(raw.V,0)+' · γ cát '+f(raw.gc,3))+' · yêu cầu K '+(raw.yc==null?'không nhập':f(raw.yc,0)+' %')],['Nguồn Wo, γkmax',raw.cp_src?(raw.cp_bc+' ('+raw.cp_src+')'):'nhập tay']];
      for(let i=0;i<K_N;i++){if(!raw['lt_'+i]&&raw['f_'+i]==null)continue;out.push(['Điểm '+(i+1)+' · '+(raw['lt_'+i]||'')+' · '+(raw['vt_'+i]||''),'W '+f(raw['w_'+i],1)+' %'+(dv?' · cát+dao '+f(raw['f_'+i],0):' · đất '+f(raw['f_'+i],0)+' · cát đầu '+f(raw['g_'+i],0)+' · cát còn '+f(raw['h_'+i],0))+' g']);}return out;}};
  G.qt=()=>[['Thông số',[QT_C('Wo (%)','wo',1),QT_C('γkmax (g/cm³)','gkmax',3),QT_C(dv?'Thể tích dao (cm³)':'Thể tích phễu (cm³)','V',1),dv?QT_C('KL dao (g)','m0',0):QT_C('Dung trọng cát (g/cm³)','gc',3),QT_C('Yêu cầu K (%)','yc',0)]],
    ['Số liệu từng điểm',ix_(K_N).flatMap(i=>[QT_C('Đ'+(i+1)+' W (%)','w_'+i,1),QT_C('Đ'+(i+1)+(dv?' cát+dao (g)':' đất đào (g)'),'f_'+i,0)].concat(dv?[]:[QT_C('Đ'+(i+1)+' cát đầu (g)','g_'+i,0),QT_C('Đ'+(i+1)+' cát còn (g)','h_'+i,0)]))],
    ['Kết quả',[QT_R('Số điểm','n',0),QT_R('K nhỏ nhất (%)','kmin',1),QT_R('K lớn nhất (%)','kmax',1),QT_R('K trung bình (%)','ktb',1)]]];
  GT[code]=G;ALL_TESTS.push(test);}
kSpec(true);kSpec(false);
/* ---------- cấp phối thiên nhiên: tương quan dung trọng khô và độ ẩm (đầm chặt), hiệu chỉnh hạt quá cỡ */
const CT_N=7,CT_HC=['M','S','m1','m2','q1','q2','B','C','A'];
function rcCT(r){
  const n=nzn,V=n(r.V),cm=n(r.cm),rows=[];
  for(let i=0;i<CT_N;i++){
    const mt=n(r['mt_'+i]),ma=n(r['ma_'+i]),mk=n(r['mk_'+i]),mh=n(r['mh_'+i]);
    if(![mt,ma,mk,mh].some(x=>x!=null))continue;
    const o={i,mt,ma,mk,mh,mw:null,gw:null,w:null,gk:null};
    if(mt!=null&&cm!=null)o.mw=mt-cm;if(o.mw!=null&&V!=null&&V>0)o.gw=o.mw/V;
    if(ma!=null&&mk!=null&&mh!=null&&mk>mh)o.w=(ma-mk)*100/(mk-mh);
    if(o.gw!=null&&o.w!=null)o.gk=o.gw/(1+0.01*o.w);
    rows.push(o);}
  const ok=rows.filter(x=>x.gk!=null),o={rows,V,cm,n:ok.length,gk0:null,w0:null,peak:null,hc:false,gk:null,w:null};
  if(ok.length){o.gk0=Math.max(...ok.map(x=>x.gk));const pk=rows.find(x=>x.gk===o.gk0);o.w0=pk.w;o.peak=pk.i+1;}
  const hv=CT_HC.map(k=>n(r['hc_'+k])),cnt=hv.filter(x=>x!=null).length;o.hcCount=cnt;
  if(cnt===9){o.hc=true;const[M,Sx,m1,m2,q1,q2,Bb,Cc,Aa]=hv;
    o.Mutc=M-Sx;o.Wtc=rpt((m1-m2)/m2*100,1);o.Mktc=rpt(o.Mutc/(1+0.01*o.Wtc),0);o.Muqc=Sx;o.Wqc=rpt((q1-q2)/q2*100,1);o.Mkqc=rpt(o.Muqc/(1+0.01*o.Wqc),0);
    o.Ptc=rpt(100*o.Mktc/(o.Mktc+o.Mkqc),1);o.Pqc=100-o.Ptc;o.G=rpt(Aa/(Bb-Cc),2);
    if(o.n>0){o.gkh=rpt(100*o.gk0*o.G/(o.gk0*o.Pqc+o.G*o.Ptc),3);o.wh=rpt((o.w0*o.Ptc+o.Pqc*o.Wqc)/100,1);}}
  if(o.n>0){o.gk=(o.hc&&o.gkh!=null)?o.gkh:o.gk0;o.w=(o.hc&&o.wh!=null)?o.wh:o.w0;}
  return o;}
(function(){
  const map={V:'B4',cm:'B5'};for(let i=0;i<CT_N;i++)Object.assign(map,{['mt_'+i]:'B'+(8+i),['ma_'+i]:'C'+(8+i),['mk_'+i]:'D'+(8+i),['mh_'+i]:'E'+(8+i)});CT_HC.forEach((k,i)=>{map['hc_'+k]='B'+(23+i);});
  const fixed=[['B11','Số chữ số thập phân dung trọng',3],['B12','Số chữ số thập phân độ ẩm',1],['B13','Số chữ số thập phân khối lượng',0],['B14','Số điểm đầm nén tối thiểu',5],['B15','Số điểm đầm nén tối đa',CT_N],['B16','Khối lượng chày (kg)',4.54],['B17','Chiều cao rơi (mm)',457],['B18','Sàng loại hạt quá cỡ (mm)',19]];
  const test={code:'CT_01',name:'Tương quan dung trọng khô - độ ẩm của đất (đầm nén tiêu chuẩn)',std:'22TCN 333-06 (P.P II-D)',unit:'g/cm³',key:'gk'};
  const cnt=d=>Math.max(1,Math.min(CT_N,d.n||5)),keysOf=i=>['mt_'+i,'ma_'+i,'mk_'+i,'mh_'+i];
  const cacheCells={n:'B17',gk0:'B18',w0:'B19',peak:'B20',Mutc:'B33',Wtc:'B34',Mktc:'B35',Muqc:'B36',Wqc:'B37',Mkqc:'B38',Ptc:'B39',Pqc:'B40',G:'B41',gkh:'B42',wh:'B43',gk:'B46',w:'B47'};
  const G={code:'CP_TN',form:{code:'BM-CT-01',ver:'v1.0'},ten:'Cấp phối thiên nhiên (đầm chặt)',b64:()=>CPT_B64,map,textKeys:[],fixed,tests:[test],dp:{gk:3,w:1,gk0:3,w0:1,n:0},rc:rcCT,
    rkeys:(raw,rc)=>['n','gk0','w0','gk','w'].concat(rc.hc?['gkh','wh','Ptc','Pqc','G']:[]),
    cacheCells,
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{const r=8+x.i;if(x.mw!=null)o['F'+r]=x.mw;if(x.gw!=null)o['G'+r]=x.gw;if(x.w!=null)o['H'+r]=x.w;if(x.gk!=null)o['I'+r]=x.gk;});return o;},
    expect:rc=>{const o={n:rc.n,gk0:rc.gk0,w0:rc.w0,peak:rc.peak,gk:rc.gk,w:rc.w};if(rc.hc){['Mutc','Wtc','Mktc','Muqc','Wqc','Mkqc','Ptc','Pqc','G','gkh','wh'].forEach(k=>{if(rc[k]!=null)o[k]=rc[k];});}return Object.assign(o,G.rowCache(rc));},
    results:(rc,raw)=>({n:rc.n,gk0:rc.gk0,w0:rc.w0,peak:rc.peak,gk:rc.gk,w:rc.w,hc:rc.hc,V:rc.V,cm:rc.cm,Ptc:rc.hc?rc.Ptc:null,Pqc:rc.hc?rc.Pqc:null,G:rc.hc?rc.G:null,gkh:rc.hc?rc.gkh:null,wh:rc.hc?rc.wh:null,
      Wtc:rc.hc?rc.Wtc:null,Wqc:rc.hc?rc.Wqc:null,rows:rc.rows.map(x=>({mt:x.mt,mw:x.mw,gw:x.gw,ma:x.ma,mk:x.mk,mh:x.mh,w:x.w,gk:x.gk}))}),
    qr:[['gk','Gamma k max'],['w','Wo (%)'],['n','So diem']],
    ph:{V:'2132',cm:'7000',mt_0:'10995',ma_0:'518,81',mk_0:'485,36',mh_0:'67,29',mt_1:'11228',ma_1:'547,17',mk_1:'504,25',mh_1:'66,24',hc_M:'36502',hc_S:'3025',hc_m1:'536,36',hc_m2:'500,25',hc_q1:'508,36',hc_q2:'486,36',hc_B:'1932',hc_C:'1102',hc_A:'1862'},
    defaults:{n:5},kind:()=>'num',
    sections:d=>{const n=cnt(d),out=[sec1('Cối đầm','Thể tích và khối lượng cối đầm tiêu chuẩn.',[['',[['V','Thể tích cối (cm³)'],['cm','Khối lượng cối (g)']]]])];
      for(let i=0;i<n;i++)out.push(sec1('Điểm đầm nén '+(i+1),'Mỗi điểm một độ ẩm khác nhau.',[['',[['mt_'+i,'KL cối + đất ướt (g)'],['ma_'+i,'KL đất ướt + hộp (g)'],['mk_'+i,'KL đất khô + hộp (g)'],['mh_'+i,'KL hộp (g)']]]],
        dd=>{const x=rcCT(dd).rows.find(y=>y.i===i);return(!x||x.gk==null)?null:['γk',fnum(x.gk,3)+' g/cm³','W = '+fnum(x.w,1)+' % · γ ướt '+fnum(x.gw,3),false];}));
      out.push(sec1('Hiệu chỉnh hạt lớn hơn 19 mm (nếu mẫu có)','Nhập đủ 9 số liệu hoặc để trống hết nếu không cần hiệu chỉnh.',[['Hàm lượng hạt D > 19 mm',[['hc_M','Tổng khối lượng mẫu (g)'],['hc_S','KL mẫu sót trên sàng 19 mm (g)']]],['Độ ẩm hạt tiêu chuẩn',[['hc_m1','Khối lượng mẫu ướt m1 (g)'],['hc_m2','Khối lượng mẫu khô m2 (g)']]],['Độ ẩm hạt quá cỡ',[['hc_q1',"Khối lượng mẫu ướt m1' (g)"],['hc_q2',"Khối lượng mẫu khô m2' (g)"]]],['Tỷ trọng khối hạt quá cỡ',[['hc_B','Khô bề mặt B (g)'],['hc_C','Cân trong nước C (g)'],['hc_A','Khô hoàn toàn A (g)']]]],
        dd=>{const r=rcCT(dd);if(!r.n)return null;return['Kết quả',fnum(r.gk,3)+' g/cm³ · Wo '+fnum(r.w,1)+' %',r.hc?'đã hiệu chỉnh (Ptc '+fnum(r.Ptc,1)+' %, Pqc '+fnum(r.Pqc,1)+' %, G '+fnum(r.G,2)+')':'chưa hiệu chỉnh'+(r.hcCount?' (còn thiếu '+(9-r.hcCount)+' số liệu hiệu chỉnh)':''),r.peak<=1||r.peak>=r.n||(r.hcCount>0&&!r.hc)];}));
      return out;},
    need:d=>{let c=0;['V','cm'].forEach(k=>{if(typeof d[k]!=='number')c++;});for(let i=0;i<cnt(d);i++)keysOf(i).forEach(k=>{if(typeof d[k]!=='number')c++;});const hn=CT_HC.filter(k=>typeof d['hc_'+k]==='number').length;if(hn>0)c+=9-hn;return c;},
    total:d=>2+cnt(d)*4+(CT_HC.some(k=>typeof d['hc_'+k]==='number')?9:0),
    valid:(d,rc)=>rc.V>0&&rc.cm>0&&rc.n>=5&&rc.rows.every(x=>x.gk!=null)&&(rc.hcCount===0||rc.hc),
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn','data-act':'ct-add',onclick:()=>{if(cnt(d)>=CT_N){toast('Tối đa '+CT_N+' điểm đầm nén trên một phiếu.','bad');return;}d.n=cnt(d)+1;again();}},'＋ Thêm điểm đầm nén'),
      cnt(d)>1?h('button',{class:'btn','data-act':'ct-del',onclick:()=>{const i=cnt(d)-1;keysOf(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một điểm'):null),
    verify:(raw)=>{const r=rcCT(raw),W='Lưu ý khi kiểm tra: ',out=[];
      if(r.n>=3&&(r.peak<=1||r.peak>=r.n))out.push({label:W+'Điểm đỉnh của đường cong không nằm ở đầu hoặc cuối',state:'warn',note:'Dung trọng khô lớn nhất ở điểm '+r.peak+'/'+r.n+': chưa bao được đỉnh, nên thêm điểm đầm nén.'});
      if(r.hc&&r.Pqc>30)out.push({label:W+'Hạt quá cỡ không quá 30 %',state:'warn',note:'Hạt lớn hơn 19 mm chiếm '+fnum(r.Pqc,1)+' %.'});
      return out;},
    body:r=>{const rows=r.rows||[];
      const pts=rows.filter(x=>x.gk!=null&&x.w!=null),svg=(()=>{if(pts.length<2)return '';const W=320,H=170,L=44,B=28,xs=pts.map(p=>p.w),ys=pts.map(p=>p.gk),x0=Math.min(...xs)-0.5,x1=Math.max(...xs)+0.5,y0=Math.min(...ys)-0.03,y1=Math.max(...ys)+0.03;
        const X=v=>L+(v-x0)/(x1-x0)*(W-L-8),Y=v=>H-B-(v-y0)/(y1-y0)*(H-B-8);
        return '<svg viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:360px;border:1px solid #ccc;border-radius:6px;background:#fff" role="img" aria-label="Đường cong đầm nén"><polyline fill="none" stroke="#0050c8" stroke-width="2" points="'+pts.map(p=>X(p.w).toFixed(1)+','+Y(p.gk).toFixed(1)).join(' ')+'"/>'+pts.map(p=>'<circle cx="'+X(p.w).toFixed(1)+'" cy="'+Y(p.gk).toFixed(1)+'" r="3.5" fill="'+(p.gk===r.gk0?'#d00000':'#0050c8')+'"/>').join('')+
          '<text x="'+(W/2)+'" y="'+(H-6)+'" font-size="10" text-anchor="middle" fill="#444">Độ ẩm W (%)</text><text x="10" y="'+(H/2)+'" font-size="10" fill="#444" transform="rotate(-90 10 '+(H/2)+')" text-anchor="middle">γk (g/cm³)</text>'+
          '<text x="'+L+'" y="'+(H-B+12)+'" font-size="9" fill="#666">'+fnum(x0,1)+'</text><text x="'+(W-8)+'" y="'+(H-B+12)+'" font-size="9" text-anchor="end" fill="#666">'+fnum(x1,1)+'</text><text x="'+(L-4)+'" y="'+(Y(y1)+3)+'" font-size="9" text-anchor="end" fill="#666">'+fnum(y1,2)+'</text><text x="'+(L-4)+'" y="'+Y(y0)+'" font-size="9" text-anchor="end" fill="#666">'+fnum(y0,2)+'</text></svg>';})();
      return h('div',null,
        h('p',{style:'font-size:12px;margin:6px 0'},h('b',null,'Phương pháp: '),'đầm nén tiêu chuẩn 22TCN 333-06 (P.P II-D) · thể tích cối '+fnum(r.V,0)+' cm³ · khối lượng cối '+fnum(r.cm,0)+' g'),
        h('table',null,h('thead',null,h('tr',null,['Thí nghiệm số','KL cối + đất ướt (g)','KL đất ướt (g)','Dung trọng ướt (g/cm³)','KL ướt + hộp (g)','KL khô + hộp (g)','KL hộp (g)','Độ ẩm W (%)','Dung trọng khô (g/cm³)'].map(x=>h('th',null,x)))),
          h('tbody',null,rows.map((x,i)=>h('tr',null,[i+1,fnum(x.mt,0),fnum(x.mw,0),fnum(x.gw,3),fnum(x.ma,2),fnum(x.mk,2),fnum(x.mh,2),fnum(x.w,1),fnum(x.gk,3)].map(c=>h('td',{class:'c'},String(c))))))),
        h('table',{style:'margin-top:8px'},h('thead',null,h('tr',null,['Kết quả','Chưa hiệu chỉnh','Hiệu chỉnh'].map(x=>h('th',null,x)))),
          h('tbody',null,h('tr',null,h('td',null,'Khối lượng thể tích khô lớn nhất (g/cm³)'),h('td',{class:'c'},fnum(r.gk0,3)),h('td',{class:'c'},r.hc?fnum(r.gkh,3):'')),h('tr',null,h('td',null,'Độ ẩm tối ưu (%)'),h('td',{class:'c'},fnum(r.w0,1)),h('td',{class:'c'},r.hc?fnum(r.wh,1):'')))),
        r.hc?h('p',{style:'font-size:12px;margin:6px 0'},'Hiệu chỉnh hạt lớn hơn 19 mm: hạt tiêu chuẩn Ptc = '+fnum(r.Ptc,1)+' %; hạt quá cỡ Pqc = '+fnum(r.Pqc,1)+' %; tỷ trọng khối hạt quá cỡ G = '+fnum(r.G,2)+' g/cm³.'):null,
        svg?h('div',{style:'margin-top:8px',html:svg}):null);},
    table:r=>(r.rows||[]).map((x,i)=>[i+1,fnum(x.w,1),fnum(x.gk,3)]),head:['Thí nghiệm số','Độ ẩm W (%)','Dung trọng khô (g/cm³)'],
    nhanXet:r=>!r.n?'':('Khối lượng thể tích khô lớn nhất '+fnum(r.gk,3)+' g/cm³ ứng với độ ẩm tối ưu '+fnum(r.w,1)+' %'+(r.hc?' (đã hiệu chỉnh hạt quá cỡ).':'.')),
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp),out=[['Cối','V '+f(raw.V,0)+' cm³ · khối lượng '+f(raw.cm,0)+' g']];
      for(let i=0;i<CT_N;i++){if(raw['mt_'+i]==null)continue;out.push(['Điểm '+(i+1),'cối+đất ướt '+f(raw['mt_'+i],0)+' · ướt+hộp '+f(raw['ma_'+i],2)+' · khô+hộp '+f(raw['mk_'+i],2)+' · hộp '+f(raw['mh_'+i],2)+' g']);}
      if(CT_HC.some(k=>raw['hc_'+k]!=null))out.push(['Hiệu chỉnh (g)',CT_HC.map(k=>f(raw['hc_'+k],2)).join(' · ')]);return out;}};
  G.qt=()=>[['Cối đầm',[QT_C('Thể tích cối (cm³)','V',0),QT_C('Khối lượng cối (g)','cm',0)]],
    ['Số liệu từng điểm',ix_(CT_N).flatMap(i=>[QT_C('Đ'+(i+1)+' cối+đất ướt (g)','mt_'+i,0),QT_C('Đ'+(i+1)+' ướt+hộp (g)','ma_'+i,2),QT_C('Đ'+(i+1)+' khô+hộp (g)','mk_'+i,2),QT_C('Đ'+(i+1)+' hộp (g)','mh_'+i,2)])],
    ['Hiệu chỉnh',CT_HC.map(k=>QT_C('hc '+k,'hc_'+k,2))],
    ['Kết quả',[QT_R('Số điểm','n',0),QT_R('γkmax chưa hiệu chỉnh','gk0',3),QT_R('Wo chưa hiệu chỉnh (%)','w0',1),QT_R('γkmax cuối (g/cm³)','gk',3),QT_R('Wo cuối (%)','w',1)]]];
  GT.CP_TN=G;ALL_TESTS.push(test);
})();
