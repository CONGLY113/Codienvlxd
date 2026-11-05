/* ====================================================================== 0.9.0 LOẠI MẪU MÔ TẢ BẰNG BẢNG (GT)
   Mỗi loại mới khai báo một lần: biểu mẫu, ô nhập, công thức tính lại, chỉ tiêu, cách hiện trên điện thoại và trên phiếu.
   Cát và đá 5-20 giữ nguyên mã riêng để không ảnh hưởng phiếu đã phát hành. */
const XM_B64='@@XM_B64@@';
const TH_B64='@@TH_B64@@';
const gt=s=>GT[loaiOf(s)]||null;
const nzn=v=>typeof v==='number'&&isFinite(v)?v:null;
const XM_K={'1':1.15,'1.1':1.07,'1.2':1,'1.3':0.97,'1.4':0.96,'1.5':0.95,'1.7':0.94,'1.8':0.94,'1.9':0.93,'2':0.93,'2.1':0.92,'2.2':0.92};
function rcXM(r){
  const n=nzn,o={};
  const dm=[0,1].map(i=>{const m=n(r['dm_m'+i]),p=n(r['dm_p'+i]);return m&&p!=null?p/m*100:null;});
  o.mjn=dm.every(x=>x!=null)?(dm[0]+dm[1])/2:null;
  o.bd=n(r.dk_bd);o.kt=n(r.dk_kt);
  const on=[0,1].map(i=>{const a=n(r['on_A'+i]),c=n(r['on_C'+i]);return a!=null&&c!=null?c-a:null;});
  o.on=on.every(x=>x!=null)?(on[0]+on[1])/2:null;
  const six=k=>[0,1,2,3,4,5].map(i=>n(r[k+i]));
  const r3=six('r3_').map(f=>f!=null?f*1000/1600:null);
  o.r3=r3.every(x=>x!=null)?r3.reduce((a,b)=>a+b,0)/6:null;
  o.r3_lech=o.r3!=null?Math.max(...r3.map(x=>Math.abs((x-o.r3)/o.r3*100))):null;
  const top4=a=>a.every(x=>x!=null)?a.slice().sort((x,y)=>y-x).slice(0,4).reduce((x,y)=>x+y,0)/4:null;
  const c20=k=>six(k).map(f=>f!=null?f*1000/400:null);
  const R0=top4(c20('r0_')),Rch=top4(c20('rc_'));
  o.R0=R0;o.Rch=Rch;
  o.h=R0&&Rch!=null?Math.round(Rch/R0*10+1e-9)/10:null;
  o.K=o.h!=null&&XM_K[String(o.h)]!==undefined?XM_K[String(o.h)]:null;
  o.r28=o.K!=null&&Rch!=null?o.K*Rch:null;
  return o;}
function rcTH(r){
  const n=nzn,rows=[];
  for(let i=0;i<12;i++){
    const tk=r['tk_'+i],bd=r['bend_'+i],a=n(r['a_'+i]),b=n(r['b_'+i]),fy=n(r['Fy_'+i]),fu=n(r['Fu_'+i]),dl=n(r['dl_'+i]);
    if(![tk,bd,a,b,fy,fu,dl].some(x=>x!=null&&x!==''))continue;
    const A=a!=null&&b!=null?a*b:null;
    rows.push({i,tk:tk||'',a,b,A,fy,fu,dl,bend:bd||'',sy:A&&fy!=null?fy*1000/A:null,su:A&&fu!=null?fu*1000/A:null});}
  const mn=k=>{const v=rows.map(x=>x[k]).filter(x=>x!=null);return v.length?Math.min(...v):null;};
  const o={rows,n:rows.filter(x=>x.A!=null).length,sy_min:mn('sy'),su_min:mn('su'),dl_min:mn('dl'),nut:rows.filter(x=>x.bend==='Nứt').length};
  const q=[n(r.rsy),n(r.rsu),n(r.rdl)];
  o.kl=(q.some(x=>x==null)||!o.n)?'CHƯA XÉT':(o.sy_min>=q[0]&&o.su_min>=q[1]&&o.dl_min>=q[2]&&o.nut===0?'ĐẠT':'KHÔNG ĐẠT');
  return o;}
const sec1=(t,s,g,live)=>({t,s,g,live});
const XM_SEC=[
 sec1('Độ mịn','TCVN 4030:2003, sàng 0,09 mm',[['Lần thử 1',[['dm_m0','m: khối lượng mẫu (g)'],['dm_p0','p: lượng sót trên sàng (g)']]],['Lần thử 2',[['dm_m1','m: khối lượng mẫu (g)'],['dm_p1','p: lượng sót trên sàng (g)']]]],d=>{const r=rcXM(d);return r.mjn==null?null:['Độ mịn',fnum(r.mjn,1)+' %','',false];}),
 sec1('Thời gian đông kết','TCVN 6017:2015',[['',[['dk_bd','Bắt đầu đông kết (phút)'],['dk_kt','Kết thúc đông kết (phút)']]]],d=>{const r=rcXM(d);return(r.bd==null||r.kt==null)?null:['Đông kết',fnum(r.bd,0)+' / '+fnum(r.kt,0)+' phút','',r.kt<=r.bd];}),
 sec1('Độ ổn định thể tích','Le Chatelier, TCVN 6017:2015',[['Kim 1',[['on_A0','A: trước đun (mm)'],['on_C0','C: sau đun (mm)']]],['Kim 2',[['on_A1','A: trước đun (mm)'],['on_C1','C: sau đun (mm)']]]],d=>{const r=rcXM(d);return r.on==null?null:['Độ ổn định',fnum(r.on,1)+' mm','',r.on<0];}),
 sec1('Cường độ nén 3 ngày','TCVN 6016:2011, 6 nửa lăng trụ 40 x 40 mm',[['Lực nén phá hoại (kN)',[0,1,2,3,4,5].map(i=>['r3_'+i,'Viên '+(i+1)])]],d=>{const r=rcXM(d);return r.r3==null?null:['R3',fnum(r.r3,1)+' MPa','Viên lệch TB lớn nhất '+fnum(r.r3_lech,1)+' %',r.r3_lech>10];}),
 sec1('Cường độ quy về 28 ngày','Phương pháp nhanh, viên 20 x 20 mm',[['Mẫu tự nhiên, lực nén (kN)',[0,1,2,3,4,5].map(i=>['r0_'+i,'Viên '+(i+1)])],['Mẫu luộc, lực nén (kN)',[0,1,2,3,4,5].map(i=>['rc_'+i,'Viên '+(i+1)])]],d=>{const r=rcXM(d);return r.h==null?null:['R28',r.r28==null?'h = '+fnum(r.h,1)+' ngoài bảng K':fnum(r.r28,1)+' MPa','h = '+fnum(r.h,1)+', K = '+(r.K==null?'?':fnum(r.K,2)),r.r28==null];})];
const thRowKeys=i=>['tk_'+i,'a_'+i,'b_'+i,'Fy_'+i,'Fu_'+i,'dl_'+i,'bend_'+i];
function thSections(d){
  const n=d.n||3,out=[sec1('Yêu cầu kỹ thuật (nhập nếu có)','Để trống thì phiếu không kết luận đạt hay không đạt.',[['',[['mac','Mác thép'],['rsy','Giới hạn chảy tối thiểu (MPa)'],['rsu','Giới hạn đứt tối thiểu (MPa)'],['rdl','Dãn dài tối thiểu (%)']]]],d=>{const r=rcTH(d);return r.n?['Kết luận tạm',r.kl,'',r.kl==='KHÔNG ĐẠT']:null;})];
  for(let i=0;i<n;i++)out.push(sec1('Thanh thép '+(i+1),'',[['',[['tk_'+i,'Ký hiệu mẫu'],['a_'+i,'Dày a (mm)'],['b_'+i,'Rộng b (mm)'],['Fy_'+i,'Lực chảy (kN)'],['Fu_'+i,'Lực đứt (kN)'],['dl_'+i,'Dãn dài (%)'],['bend_'+i,'Thử uốn']]]],d=>{const x=rcTH(d).rows.find(y=>y.i===i);return(!x||x.sy==null||x.su==null)?null:['Giới hạn chảy / đứt',fnum(x.sy,0)+' / '+fnum(x.su,0)+' MPa','Tiết diện '+fnum(x.A,1)+' mm²',x.fu!=null&&x.fy!=null&&x.fu<x.fy];}));
  return out;}
const GT={};
(function(){
  const xmMap={dm_m0:'B5',dm_p0:'C5',dm_m1:'B6',dm_p1:'C6',dk_bd:'B9',dk_kt:'B10',on_A0:'B13',on_C0:'C13',on_A1:'B14',on_C1:'C14'};
  for(let i=0;i<6;i++){xmMap['r3_'+i]='B'+(19+i);xmMap['r0_'+i]='B'+(29+i);xmMap['rc_'+i]='B'+(37+i);}
  const xmFixed=[['B11','Số chữ số thập phân độ mịn',1],['B12','Số chữ số thập phân đông kết',0],['B13','Số chữ số thập phân độ ổn định',1],['B14','Số chữ số thập phân cường độ 3 ngày',1],['B15','Số chữ số thập phân cường độ 28 ngày',1],['B18','Mức yêu cầu độ mịn',10],['B19','Mức yêu cầu bắt đầu đông kết',45],['B20','Mức yêu cầu kết thúc đông kết',420],['B21','Mức yêu cầu độ ổn định',10],['B22','Mức yêu cầu cường độ 3 ngày',18],['B23','Mức yêu cầu cường độ 28 ngày',40]];
  Object.keys(XM_K).forEach((h_,i)=>{const c=String.fromCharCode(66+i);xmFixed.push([c+'26','Bảng hệ số K: h '+h_,+h_]);xmFixed.push([c+'27','Bảng hệ số K: K tại h '+h_,XM_K[h_]]);});
  const xmTests=[['XM_01','Độ mịn (phần còn lại trên sàng 0,09 mm)','TCVN 4030:2003','%','mjn'],['XM_02','Thời gian bắt đầu đông kết','TCVN 6017:2015','Phút','bd'],['XM_03','Thời gian kết thúc đông kết','TCVN 6017:2015','Phút','kt'],['XM_04','Độ ổn định thể tích (Le Chatelier)','TCVN 6017:2015','mm','on'],['XM_05','Cường độ nén sau 3 ngày','TCVN 6016:2011','MPa','r3'],['XM_06','Cường độ nén quy về 28 ngày','Phương pháp nhanh','MPa','r28']].map(x=>({code:x[0],name:x[1],std:x[2],unit:x[3],key:x[4]}));
  const xmReq={mjn:'≤ 10',bd:'≥ 45',kt:'≤ 420',on:'≤ 10',r3:'≥ 18,0',r28:'≥ 40,0'};
  const xmOk=r=>r.mjn<=10&&r.bd>=45&&r.kt<=420&&r.on<=10&&r.r3>=18&&r.r28>=40;
  GT.XM_PCB40={code:'XM_PCB40',form:{code:'BM-XM-01',ver:'v1.0'},ten:'Xi măng PCB40',b64:()=>XM_B64,map:xmMap,textKeys:[],fixed:xmFixed,tests:xmTests,
    dp:{mjn:1,bd:0,kt:0,on:1,r3:1,r28:1},rc:rcXM,rkeys:['mjn','bd','kt','on','r3','r28'],
    cacheCells:{mjn:'D7',bd:'D9',kt:'D10',on:'D15',r3:'C25',r28:'C46'},
    expect:rc=>({mjn:rc.mjn,bd:rc.bd,kt:rc.kt,on:rc.on,r3:rc.r3,r28:rc.r28}),
    results:(rc)=>({mjn:rc.mjn,bd:rc.bd,kt:rc.kt,on:rc.on,r3:rc.r3,r28:rc.r28}),
    qr:[['mjn','Do min'],['bd','Dong ket bd'],['kt','Dong ket kt'],['on','On dinh TT'],['r3','R3'],['r28','R28']],
    ph:{dm_m0:'10',dm_p0:'0,3',dm_m1:'10',dm_p1:'0,4',dk_bd:'115',dk_kt:'160',on_A0:'9,6',on_C0:'10,4',on_A1:'9,8',on_C1:'11,0',r3_0:'36,0',r3_1:'44,9',r3_2:'44,3',r3_3:'46,8',r3_4:'46,1',r3_5:'43,1',r0_0:'18,3',r0_1:'17,2',r0_2:'18,1',r0_3:'18,6',r0_4:'18,8',r0_5:'18,2',rc_0:'21,2',rc_1:'23,1',rc_2:'16,3',rc_3:'16,8',rc_4:'16,4',rc_5:'16,4'},
    kind:()=>'num',sections:()=>XM_SEC,need:d=>Object.keys(xmMap).filter(k=>typeof d[k]!=='number').length,total:()=>Object.keys(xmMap).length,
    valid:(d,rc)=>Object.keys(xmMap).every(k=>typeof d[k]==='number')&&rc.r28!=null,
    table:r=>xmTests.map((t,i)=>[i+1,t.name,t.std,t.unit,r[t.key]==null?'':fnum(r[t.key],({mjn:1,bd:0,kt:0,on:1,r3:1,r28:1})[t.key]),xmReq[t.key]]),
    head:['TT','Chỉ tiêu kiểm tra','Phương pháp thử','Đơn vị','Kết quả','Mức yêu cầu'],
    nhanXet:r=>(xmTests.every(t=>r[t.key]!=null)?('Mẫu xi măng trên có '+(xmOk(r)?'các chỉ tiêu đã kiểm tra đạt':'chỉ tiêu không đạt')+' yêu cầu loại xi măng PCB40 theo TCVN 6260:2009.'):''),
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp);const six=k=>[0,1,2,3,4,5].map(i=>f(raw[k+i],2)).join(' · ');
      return[['Độ mịn · lần 1 / 2','m = '+f(raw.dm_m0,1)+', p = '+f(raw.dm_p0,2)+' / m = '+f(raw.dm_m1,1)+', p = '+f(raw.dm_p1,2)],['Đông kết (phút)','Bắt đầu '+f(raw.dk_bd,0)+', kết thúc '+f(raw.dk_kt,0)],['Le Chatelier (mm)','Kim 1: '+f(raw.on_A0,1)+' → '+f(raw.on_C0,1)+'; Kim 2: '+f(raw.on_A1,1)+' → '+f(raw.on_C1,1)],['Lực nén 3 ngày (kN)',six('r3_')],['Mẫu tự nhiên (kN)',six('r0_')],['Mẫu luộc (kN)',six('rc_')]];}};
  const thMap={mac:'B4',rsy:'B5',rsu:'B6',rdl:'B7'};
  for(let i=0;i<12;i++){const r=10+i;Object.assign(thMap,{['tk_'+i]:'B'+r,['a_'+i]:'C'+r,['b_'+i]:'D'+r,['Fy_'+i]:'F'+r,['Fu_'+i]:'H'+r,['dl_'+i]:'J'+r,['bend_'+i]:'K'+r});}
  const thTests=[{code:'TH_01',name:'Thử kéo: giới hạn chảy, giới hạn đứt, dãn dài',std:'TCVN 197:2002',unit:'MPa',key:'sy_min'},{code:'TH_02',name:'Thử uốn nguội',std:'TCVN 198:2008',unit:'-',key:'nut'}];
  GT.THEP_HINH={code:'THEP_HINH',form:{code:'BM-TH-01',ver:'v1.0'},ten:'Thép hình',b64:()=>TH_B64,map:thMap,textKeys:['mac'],textPrefix:['tk_','bend_'],
    fixed:[['B11','Số chữ số thập phân tiết diện',0],['B12','Số chữ số thập phân lực',0],['B13','Số chữ số thập phân giới hạn chảy, đứt',0],['B14','Số chữ số thập phân dãn dài',1],['B16','Số thanh tối đa trên một phiếu',12]],
    tests:thTests,dp:{sy_min:0,su_min:0,dl_min:1,nut:0,n:0},rc:rcTH,rkeys:['n','sy_min','su_min','dl_min','nut'],
    cacheCells:{n:'D24',sy_min:'D25',su_min:'D26',dl_min:'D27',nut:'D28'},
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{if(x.A!=null){o['E'+(10+x.i)]=x.A;if(x.sy!=null)o['G'+(10+x.i)]=x.sy;if(x.su!=null)o['I'+(10+x.i)]=x.su;}});return o;},
    expect:rc=>Object.assign({n:rc.n,sy_min:rc.sy_min,su_min:rc.su_min,dl_min:rc.dl_min,nut:rc.nut},GT.THEP_HINH.rowCache(rc)),
    results:(rc,raw)=>({n:rc.n,sy_min:rc.sy_min,su_min:rc.su_min,dl_min:rc.dl_min,nut:rc.nut,kl:rc.kl,mac:raw.mac||'',rows:rc.rows.map(x=>({tk:x.tk,a:x.a,b:x.b,A:x.A,fy:x.fy,sy:x.sy,fu:x.fu,su:x.su,dl:x.dl,bend:x.bend}))}),
    qr:[['sy_min','Gh chay min'],['su_min','Gh dut min'],['dl_min','Dan dai min'],['nut','Uon nut']],
    ph:{mac:'CT38',rsy:'240',rsu:'380',rdl:'23',tk_0:'PL10',a_0:'10',b_0:'37,2',Fy_0:'102',Fu_0:'156',dl_0:'30,6',bend_0:'Không nứt'},
    kind:k=>(k==='mac'||k.indexOf('tk_')===0)?'text':(k.indexOf('bend_')===0?'bend':'num'),sections:d=>thSections(d),
    need:d=>{let c=0;for(let i=0;i<(d.n||3);i++){['a_','b_','Fy_','Fu_','dl_'].forEach(p=>{if(typeof d[p+i]!=='number')c++;});['tk_','bend_'].forEach(p=>{if(!d[p+i])c++;});}return c;},
    total:d=>(d.n||3)*7,valid:(d,rc)=>GT.THEP_HINH.need(d)===0&&rc.n>0,
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn',onclick:()=>{if((d.n||3)>=12){toast('Tối đa 12 thanh trên một phiếu. Hãy tách thành mẫu khác cùng phiếu yêu cầu.','bad');return;}d.n=(d.n||3)+1;again();}},'＋ Thêm thanh thép'),
      (d.n||3)>1?h('button',{class:'btn',onclick:()=>{const i=(d.n||3)-1;thRowKeys(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một thanh'):null),
    head:['TT','Ký hiệu','Dày x Rộng (mm)','Tiết diện (mm²)','Chảy: lực (kN) / giới hạn (MPa)','Đứt: lực (kN) / giới hạn (MPa)','Dãn dài (%)','Uốn'],
    table:r=>(r.rows||[]).map((x,i)=>[i+1,x.tk,(x.a==null?'':fnum(x.a,1))+' x '+(x.b==null?'':fnum(x.b,1)),x.A==null?'':fnum(x.A,0),fnum(x.fy,0)+' / '+fnum(x.sy,0),fnum(x.fu,0)+' / '+fnum(x.su,0),fnum(x.dl,1),x.bend]),
    nhanXet:r=>!r.n?'':(r.kl==='ĐẠT'?'Các mẫu thép trên có các chỉ tiêu đã kiểm tra đạt mác thép '+(r.mac||'')+'.':(r.kl==='KHÔNG ĐẠT'?'Các mẫu thép trên có chỉ tiêu không đạt mác thép '+(r.mac||'')+'.':'Kết quả thử kéo và thử uốn các mẫu thép nêu trên.')),
    rawRows:raw=>{const out=[['Mác thép / yêu cầu',(raw.mac||'')+' · chảy ≥ '+fnum(raw.rsy,0)+' · đứt ≥ '+fnum(raw.rsu,0)+' · dãn dài ≥ '+fnum(raw.rdl,1)]];
      for(let i=0;i<12;i++){if(raw['a_'+i]==null&&!raw['tk_'+i])continue;out.push(['Thanh '+(i+1)+' · '+(raw['tk_'+i]||''),fnum(raw['a_'+i],1)+' x '+fnum(raw['b_'+i],1)+' mm · Fy '+fnum(raw['Fy_'+i],1)+' · Fu '+fnum(raw['Fu_'+i],1)+' kN · dãn dài '+fnum(raw['dl_'+i],1)+' % · '+(raw['bend_'+i]||'')]);}return out;}};
  GT.XM_PCB40.tests.concat(GT.THEP_HINH.tests).forEach(t=>ALL_TESTS.push(t));
})();
const rawGT=raw=>raw&&raw.dm_m0!==undefined?GT.XM_PCB40:(raw&&(raw.a_0!==undefined||raw.tk_0!==undefined)?GT.THEP_HINH:null);
async function analyzeUploadGT(sample,u8){
  const G=gt(sample),checks=[],add=(l,s,n)=>checks.push({label:l,state:s,note:n||''});
  let wb;try{wb=await readXlsx(u8);}catch(e){return{checks:[{label:'Đọc được file Excel (.xlsx)',state:'fail',note:'File hỏng hoặc không phải .xlsx.'}],ok:false};}
  const T=wb.Thong_tin,L=wb.So_lieu,K=wb.Kiem_tra,H=wb._HeThong;
  if(!T||!L||!K||!H)return{checks:[{label:'Đúng cấu trúc biểu mẫu',state:'fail',note:'Thiếu sheet Thong_tin, So_lieu, Kiem_tra hoặc _HeThong. Dùng đúng file tải từ hệ thống.'}],ok:false};
  add('Đọc được file Excel (.xlsx)','ok');
  const F=G.form,okF=H.B3===F.code&&H.B4===F.ver;
  add('Đúng biểu mẫu và phiên bản ('+F.code+' / '+F.ver+')',okF?'ok':'fail',okF?'':'File ghi '+(H.B3||'?')+' / '+(H.B4||'?')+'.');
  const num=v=>(v===undefined||v===null||v==='')?null:(isNaN(+v)?v:+v),tx=v=>num(v)===null?'trống':num(v);
  const fb=G.fixed.filter(c=>num(H[c[0]])!==c[2]);
  add('Cách làm tròn, mức yêu cầu và tham số khớp bản ban hành',fb.length?'fail':'ok',fb.length?'Sheet _HeThong bị đổi: '+fb.slice(0,6).map(c=>c[1]+' (file ghi '+tx(H[c[0]])+', chuẩn '+c[2]+')').join('; ')+(fb.length>6?'; …':'')+'. Tải lại biểu mẫu từ hệ thống.':'');
  const mm=T.B5===sample.ma_mau&&T.B6===sample.so_yc;add('Mã mẫu và số phiếu yêu cầu khớp hệ thống',mm?'ok':'fail',mm?'':'File ghi mã mẫu "'+(T.B5||'')+'", hệ thống là "'+sample.ma_mau+'".');
  const who=T.B19===(sample.giao&&sample.giao.ma_nv);add('Cán bộ thử nghiệm khớp người được giao',who?'ok':'fail',who?'':'File ghi mã "'+(T.B19||'')+'".');
  const raw={};Object.keys(G.map).forEach(k=>{const v=L[G.map[k]];raw[k]=v===undefined?null:v;});
  Object.keys(raw).forEach(k=>{const isText=G.textKeys.includes(k)||(G.textPrefix||[]).some(p=>k.indexOf(p)===0);if(!isText&&typeof raw[k]!=='number')raw[k]=null;if(isText&&raw[k]!=null)raw[k]=String(raw[k]);});
  const rc=G.rc(raw),exp=G.expect(rc),ek=Object.keys(exp).filter(k=>exp[k]!=null);
  const cellOf=k=>G.cacheCells[k]||k;
  const cached={};ek.forEach(k=>{cached[k]=L[cellOf(k)];});
  const hasCache=ek.length>0&&ek.every(k=>typeof cached[k]==='number');
  add('File đã được Excel tính toán và lưu',hasCache?'ok':'fail',hasCache?'':'Chưa thấy đủ kết quả tính. Mở bằng Excel, nhập đủ số liệu rồi lưu lại.');
  const kt=K.C22;add('Kiểm tra nội bộ của biểu mẫu: '+(kt||'chưa có'),kt==='HỢP LỆ'?'ok':'fail',kt==='HỢP LỆ'?'':'Sheet Kiem_tra còn mục THIẾU hoặc VƯỢT ngưỡng.');
  if(hasCache){const bad=ek.filter(k=>Math.abs(exp[k]-cached[k])>1e-6*Math.max(1,Math.abs(exp[k])));
    add('Công thức không bị sửa: kết quả trong file khớp tính lại từ số liệu gốc',bad.length?'fail':'ok',bad.length?'Lệch ở ô: '+bad.slice(0,8).map(cellOf).join(', ')+'.':'');}
  for(let r=5;r<=20;r++){if(K['C'+r]==='LƯU Ý')add('Lưu ý khi kiểm tra: '+(K['B'+r]||'mục '+(r-4)),'warn',K['D'+r]||'');}
  const dNhan=sample.mau&&sample.mau.ngay_nhan,d0=isoFromSerialUTC(T.B23),d1=isoFromSerialUTC(T.B24),datesOk=d0&&d1&&dNhan&&dNhan<=d0&&d0<=d1;
  add('Ngày thử hợp lệ (ngày nhận ≤ bắt đầu ≤ kết thúc)',datesOk?'ok':'fail',datesOk?'':'Nhận '+fd(dNhan)+', bắt đầu '+(fd(d0)||'?')+', kết thúc '+(fd(d1)||'?')+'.');
  if(d1&&d1>todayISO())add('Ngày kết thúc không ở tương lai','warn','Ngày kết thúc '+fd(d1)+' sau hôm nay.');
  const tc=T.B25,ha=T.B26,envOk=typeof tc==='number'&&typeof ha==='number'&&tc>=0&&tc<=60&&ha>=0&&ha<=100;
  add('Nhiệt độ, độ ẩm phòng thử là số hợp lý',envOk?'ok':'warn',envOk?'':'Cần nhập nhiệt độ (0-60 °C) và độ ẩm (0-100 %RH).');
  return{checks,ok:!checks.some(c=>c.state==='fail'),limits_file:[],results:hasCache?G.results(rc,raw):null,raw,sieve:null,devs:[],d0,d1,nhiet_do:tc,do_am:ha,tinh_trang:T.B27,hao_hut:null};}
