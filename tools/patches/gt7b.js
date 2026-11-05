/* ---- bu lông: thử kéo (BM-BL-01) */
const BL_N=6,BL_DEF={'4.6':[240,400,22],'5.6':[300,500,20],'6.6':[360,600,16],'8.8':[640,800,12],'10.9':[940,1040,9]};
function rcBL(r){
  const n=nzn,rows=[];
  for(let i=0;i<BL_N;i++){
    const tk=r['tk_'+i],d=n(r['d_'+i]),fy=n(r['Fy_'+i]),fu=n(r['Fu_'+i]),dl=n(r['dl_'+i]);
    if(![tk,d,fy,fu,dl].some(x=>x!=null&&x!==''))continue;
    const S=d!=null?d*d*3.1416/4:null;
    rows.push({i,tk:tk||'',d,S,fy,fu,dl,sy:S&&fy!=null?fy*1000/S:null,su:S&&fu!=null?fu*1000/S:null});}
  const mn=k=>{const v=rows.map(x=>x[k]).filter(x=>x!=null);return v.length?Math.min(...v):null;};
  const o={rows,n:rows.filter(x=>x.S!=null).length,sy_min:mn('sy'),su_min:mn('su'),dl_min:mn('dl'),mac:r.mac||'',rsy:n(r.rsy),rsu:n(r.rsu),rdl:n(r.rdl)};
  o.kl=(o.rsy==null||o.rsu==null||o.rdl==null||!o.n||o.sy_min==null||o.su_min==null||o.dl_min==null)?'CHƯA XÉT':((o.sy_min>=o.rsy&&o.su_min>=o.rsu&&o.dl_min>=o.rdl)?'ĐẠT':'KHÔNG ĐẠT');
  return o;}
(function(){
  const map={mac:'B4',rsy:'B5',rsu:'B6',rdl:'B7'};
  for(let i=0;i<BL_N;i++){const r=10+i;Object.assign(map,{['tk_'+i]:'B'+r,['d_'+i]:'C'+r,['Fy_'+i]:'E'+r,['Fu_'+i]:'G'+r,['dl_'+i]:'I'+r});}
  const keysOf=i=>['tk_'+i,'d_'+i,'Fy_'+i,'Fu_'+i,'dl_'+i],cnt=d=>Math.max(1,Math.min(BL_N,d.n||3));
  const test={code:'BL_01',name:'Thử kéo bu lông: giới hạn chảy, giới hạn đứt, độ dãn dài',std:'TCVN 197:2002',unit:'N/mm²',key:'sy_min'};
  const G={code:'BU_LONG',form:{code:'BM-BL-01',ver:'v1.0'},ten:'Bu lông',b64:()=>DIRECT_B64.BU_LONG,map,textKeys:['mac'],textPrefix:['tk_'],
    fixed:[['B11','Số chữ số thập phân tiết diện',1],['B12','Số chữ số thập phân lực',0],['B13','Số chữ số thập phân giới hạn chảy, đứt',0],['B14','Số chữ số thập phân dãn dài',1],['B15','Số mẫu tối đa trên một phiếu',BL_N],['B16','Hằng số π trong công thức tiết diện',3.1416]],
    tests:[test],dp:{sy_min:0,su_min:0,dl_min:1,n:0},rc:rcBL,rkeys:['n','sy_min','su_min','dl_min'],
    cacheCells:{n:'D19',sy_min:'D20',su_min:'D21',dl_min:'D22'},
    rowCache:rc=>{const o={};rc.rows.forEach(x=>{if(x.S!=null){o['D'+(10+x.i)]=x.S;if(x.sy!=null)o['F'+(10+x.i)]=x.sy;if(x.su!=null)o['H'+(10+x.i)]=x.su;}});return o;},
    expect:rc=>Object.assign({n:rc.n,sy_min:rc.sy_min,su_min:rc.su_min,dl_min:rc.dl_min},G.rowCache(rc)),
    results:(rc,raw)=>({n:rc.n,sy_min:rc.sy_min,su_min:rc.su_min,dl_min:rc.dl_min,kl:rc.kl,mac:rc.mac,rsy:rc.rsy,rsu:rc.rsu,rdl:rc.rdl,rows:rc.rows.map(x=>({tk:x.tk,d:x.d,S:x.S,fy:x.fy,sy:x.sy,fu:x.fu,su:x.su,dl:x.dl}))}),
    qr:[['sy_min','Gh chay min'],['su_min','Gh dut min'],['dl_min','Dan dai min'],['n','So mau']],
    ph:{mac:'8.8',rsy:'640',rsu:'800',rdl:'12',tk_0:'M18',d_0:'18',Fy_0:'202',Fu_0:'225',dl_0:'14,3',tk_1:'M18',d_1:'18',Fy_1:'205',Fu_1:'228',dl_1:'14'},
    defaults:{n:3},kind:k=>(k==='mac'||k.indexOf('tk_')===0)?'text':'num',
    sections:d=>{const n=cnt(d),out=[Object.assign(sec1('Cấp độ bền và yêu cầu kỹ thuật','Chọn nhanh cấp độ bền để điền mức yêu cầu tham khảo (sửa được theo hồ sơ thiết kế). Để trống thì phiếu không kết luận đạt hay không đạt.',[['',[['mac','Cấp độ bền (ví dụ 8.8)'],['rsy','Giới hạn chảy tối thiểu (N/mm²)'],['rsu','Giới hạn đứt tối thiểu (N/mm²)'],['rdl','Dãn dài tối thiểu (%)']]]],dd=>{const r=rcBL(dd);return r.n?['Kết luận tạm',r.kl,'',r.kl==='KHÔNG ĐẠT']:null;}),
      {node:(dd,again)=>h('div',{class:'row',style:'margin:6px 0'},Object.keys(BL_DEF).map(k=>h('button',{class:'btn'+(dd.mac===k?' primary':''),type:'button','data-act':'bl-cap-'+k,onclick:()=>{dd.mac=k;dd.rsy=BL_DEF[k][0];dd.rsu=BL_DEF[k][1];dd.rdl=BL_DEF[k][2];again();}},'Cấp '+k)))})];
      for(let i=0;i<n;i++)out.push(sec1('Bu lông '+(i+1),'Tiết diện = d × d × 3,1416 / 4; giới hạn = lực × 1000 / tiết diện.',[['',[['tk_'+i,'Ký hiệu mẫu'],['d_'+i,'Đường kính thực d (mm)'],['Fy_'+i,'Lực chảy (kN)'],['Fu_'+i,'Lực đứt (kN)'],['dl_'+i,'Dãn dài (%)']]]],dd=>{const x=rcBL(dd).rows.find(y=>y.i===i);return(!x||x.sy==null||x.su==null)?null:['Giới hạn chảy / đứt',fnum(x.sy,0)+' / '+fnum(x.su,0)+' N/mm²','Tiết diện '+fnum(x.S,1)+' mm²',x.fu!=null&&x.fy!=null&&x.fu<x.fy];}));
      return out;},
    need:d=>{let c=0;for(let i=0;i<cnt(d);i++){['d_','Fy_','Fu_','dl_'].forEach(p=>{if(typeof d[p+i]!=='number')c++;});if(!d['tk_'+i])c++;}return c;},
    total:d=>cnt(d)*5,valid:(d,rc)=>BL_G().need(d)===0&&rc.n>0&&rc.rows.every(x=>x.d>0&&x.fy>0&&x.fu>=x.fy),
    extra:(d,again)=>h('div',{class:'row'},h('button',{class:'btn','data-act':'bl-add',onclick:()=>{if(cnt(d)>=BL_N){toast('Tối đa '+BL_N+' bu lông trên một phiếu. Hãy tách thành mẫu khác cùng phiếu yêu cầu.','bad');return;}d.n=cnt(d)+1;again();}},'＋ Thêm bu lông'),
      cnt(d)>1?h('button',{class:'btn','data-act':'bl-del',onclick:()=>{const i=cnt(d)-1;keysOf(i).forEach(k=>{delete d[k];});d.n=i;again();}},'Bớt một bu lông'):null),
    verify:raw=>{const r=rcBL(raw),out=[];if(r.kl==='KHÔNG ĐẠT')out.push({label:'Lưu ý khi kiểm tra: Kết quả đạt yêu cầu kỹ thuật',state:'warn',note:'Giá trị nhỏ nhất thấp hơn mức yêu cầu của cấp độ bền '+r.mac+'.'});return out;},
    head:['TT','Ký hiệu','Đường kính thực (mm)','Tiết diện (mm²)','Chảy: lực (kN) / giới hạn (N/mm²)','Đứt: lực (kN) / giới hạn (N/mm²)','Dãn dài (%)'],
    table:r=>(r.rows||[]).map((x,i)=>[i+1,x.tk,fnum(x.d,1),fnum(x.S,1),fnum(x.fy,0)+' / '+fnum(x.sy,0),fnum(x.fu,0)+' / '+fnum(x.su,0),fnum(x.dl,1)]),
    nhanXet:r=>!r.n?'':(r.kl==='ĐẠT'?'Mẫu bu lông trên có các chỉ tiêu kiểm tra đạt cấp độ bền '+r.mac+' theo TCVN 1916:1995.':(r.kl==='KHÔNG ĐẠT'?'Mẫu bu lông trên có chỉ tiêu không đạt cấp độ bền '+r.mac+' theo TCVN 1916:1995.':'Kết quả thử kéo các mẫu bu lông nêu trên.')),
    rawRows:raw=>{const out=[['Cấp độ bền / yêu cầu',(raw.mac||'không nhập')+' · chảy ≥ '+fnum(raw.rsy,0)+' · đứt ≥ '+fnum(raw.rsu,0)+' · dãn dài ≥ '+fnum(raw.rdl,1)]];
      for(let i=0;i<BL_N;i++){if(raw['d_'+i]==null&&!raw['tk_'+i])continue;out.push(['Bu lông '+(i+1)+' · '+(raw['tk_'+i]||''),'d '+fnum(raw['d_'+i],1)+' mm · Fy '+fnum(raw['Fy_'+i],1)+' · Fu '+fnum(raw['Fu_'+i],1)+' kN · dãn dài '+fnum(raw['dl_'+i],1)+' %']);}return out;}};
  G.qt=()=>[['Kết quả tổng hợp',[QT_R('Số mẫu','n',0),QT_R('Gh chảy nhỏ nhất (N/mm²)','sy_min',0),QT_R('Gh đứt nhỏ nhất (N/mm²)','su_min',0),QT_R('Dãn dài nhỏ nhất (%)','dl_min',1)]],
    ['Số liệu từng bu lông',ix_(BL_N).flatMap(i=>[QT_C('B'+(i+1)+' d (mm)','d_'+i,1),QT_C('B'+(i+1)+' Fy (kN)','Fy_'+i,1),QT_C('B'+(i+1)+' Fu (kN)','Fu_'+i,1),QT_C('B'+(i+1)+' dãn dài (%)','dl_'+i,1)])]];
  const BL_G=()=>G;
  GT.BU_LONG=G;ALL_TESTS.push(test);
})();
Object.assign(NGUON_LBL,{BU_LONG:{l:'Nhà cung cấp, nơi sản xuất',ph:'Ví dụ: Bu lông cường độ cao, nhà máy ABC',hint:'Ghi nhà cung cấp hoặc nơi sản xuất bu lông.'}});
