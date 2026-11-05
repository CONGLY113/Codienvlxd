/* ====================================================================== 0.14.0 THIẾT KẾ CẤP PHỐI VỮA XÂY (M50, M75, M100: một biểu mẫu, mác chọn khi tạo yêu cầu) */
const CV_B64='@@CV@@';
NGUON_LBL.CP_VUA={l:'Hạng mục, vị trí sử dụng vữa',ph:'Ví dụ: Vữa xây tường nhà lớp học A',hint:'Ghi hạng mục hoặc vị trí sẽ sử dụng vữa.'};
/* mác vữa chọn lúc tạo phiếu yêu cầu: lưu ở mau.quy_cach (M50, M75, M100) và điền sẵn vào biểu mẫu */
const MAT_OPT={CP_VUA:{l:'Mác vữa thiết kế',list:['M50','M75','M100'],hint:'Chọn mác vữa cần thiết kế cấp phối. Mác này điền sẵn vào biểu mẫu.'}};
const macOf=q=>{const m=/^\s*M?\s*(\d{2,3})\s*$/i.exec(q||'');return m?+m[1]:null;};
const CV_T={50:[2.495,42,0.56,0.74,1.03],75:[1.599,37,0.56,0.74,1.03],100:[1.118,36,0.56,0.72,1.04]};
const CV_K={dx:0.9,kx:1.1,c:130,den:50,rt:1.15,mpa:10.197,tol:10};
const cvRc=r=>{
  const n=nzn,mac=n(r.mac),rx=n(r.rx),rho=n(r.xm_rho),rhox=n(r.xm_rhox),cm=n(r.ct_mdl),cx=n(r.ct_rx),ca=n(r.ct_ra),t=CV_T[mac]||null,o={mac,rx,t:!!t};
  o.X=(mac!=null&&rx!=null&&rx>0)?mac/(rx*CV_K.dx)*1000*CV_K.kx:null;
  o.cat=(o.X!=null&&cx!=null&&t)?CV_K.c*(cx/1000)*o.X/CV_K.den*t[0]:null;
  o.N=(o.X!=null&&t)?o.X*t[1]/CV_K.den:null;
  o.vx=(o.X!=null&&rho!=null&&rho>0)?o.X/rho:null;
  o.vc=(o.cat!=null&&ca!=null&&ca>0)?o.cat/ca:null;
  o.sx=(o.X!=null&&rhox!=null&&rhox>0)?o.X/rhox:null;
  o.sc=(o.cat!=null&&cx!=null&&cx>0)?o.cat/(cx/1000):null;
  o.hong=(cx!=null&&ca!=null&&ca>0)?(1-(cx/1000)/ca)*100:null;
  o.Rtk=mac!=null?mac*CV_K.rt:null;
  o.R3=(o.Rtk!=null&&t)?o.Rtk*t[2]:null;o.R7=(o.Rtk!=null&&t)?o.Rtk*t[3]:null;o.R28=(o.Rtk!=null&&t)?o.Rtk*t[4]:null;
  o.rc=(o.X!=null&&o.cat!=null&&o.X>0)?o.cat/o.X:null;o.rn=(o.X!=null&&o.N!=null&&o.X>0)?o.N/o.X:null;
  o.rv=(o.sx!=null&&o.sc!=null&&o.sx>0)?o.sc/o.sx:null;
  o.rxMpa=(rx!=null&&n(r.xm_r28)!=null&&n(r.xm_r28)>0)?rx/(n(r.xm_r28)*CV_K.mpa):null;
  return o;};
function cvLinkChecks(raw,kinds){
  const out=[];
  kinds.forEach(kind=>{
    const T=CP_SRC[kind].t,src=raw[kind+'_src'];
    if(!src){out.push({label:'Số liệu '+T+' nhập tay, không liên kết phiếu đã phát hành',state:'warn',note:'Người soát xét cần đối chiếu phiếu '+T+' ở nơi thử khác.'});return;}
    const x=S.samples.find(s=>s.ma_mau===src);
    if(!x||!CP_SRC[kind].loai.includes(loaiOf(x))){out.push({label:'Phiếu '+T+' nguồn '+src+' tồn tại và đúng loại vật liệu',state:'fail',note:x?'Mẫu '+src+' là '+loaiOf(x)+'.':'Không tìm thấy mẫu '+src+'.'});return;}
    if(x.status!=='da_phat_hanh'||!x.so_bao_cao||!x.nop||!x.nop.results){out.push({label:'Phiếu '+T+' nguồn '+src+' đã phát hành',state:'fail',note:'Mẫu '+src+' chưa phát hành số báo cáo.'});return;}
    const v=cpVals(kind,x),bad=Object.keys(v).filter(k=>v[k]!=null&&!(typeof raw[k]==='number'&&Math.abs(raw[k]-v[k])<1e-9));
    if(raw[kind+'_bc']!==x.so_bao_cao)bad.push('số báo cáo');
    out.push({label:'Số liệu '+T+' khớp phiếu '+x.so_bao_cao+' ('+src+')',state:bad.length?'fail':'ok',note:bad.length?'Lệch ở: '+bad.map(k=>({xm_r28:'R28',ct_mdl:'Mđl',ct_rx:'KLTT xốp cát',ct_ra:'KL riêng cát',ct_s5:'hạt > 5 mm'})[k]||k).join(', ')+'. Điền lại từ phiếu nguồn hoặc bỏ liên kết nếu nhập tay.':''});
    if(kind==='xm'&&x.mau&&(raw.xm_lo||'')!==(x.mau.nguon_goc||''))out.push({label:'Lưu ý khi kiểm tra: Số lô xi măng khớp phiếu '+x.so_bao_cao,state:'warn',note:'Cấp phối ghi lô "'+(raw.xm_lo||'')+'", phiếu xi măng ghi lô "'+(x.mau.nguon_goc||'')+'".'});});
  return out;}
(function(){
  const CV_REQ=['mac','rx','xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra','ct_s5'],CV_TXT=['xm_ten','xm_lo','ct_ten'];
  const txtKeys=['xm_src','xm_bc','xm_ten','xm_lo','ct_src','ct_bc','ct_ten'];
  const map={mac:'B4',rx:'B5',xm_ten:'B8',xm_lo:'B9',xm_r28:'B10',xm_rho:'B11',xm_rhox:'B12',ct_ten:'B15',ct_mdl:'B16',ct_rx:'B17',ct_ra:'B18',ct_s5:'B19',xm_src:'B45',xm_bc:'B46',ct_src:'B47',ct_bc:'B48'};
  const fixed=[['B11','Số chữ số thập phân khối lượng',0],['B12','Số chữ số thập phân thể tích',0],['B13','Số chữ số thập phân độ hỗng',1],['B14','Số chữ số thập phân cường độ dự kiến',0],['B15','Số chữ số thập phân tỷ lệ',2],
    ['B16','Hệ số 0,9',0.9],['B17','Hệ số 1,1',1.1],['B18','Hằng số 130',130],['B19','Mẫu số 50',50],['B20','Rtk = Mác x',1.15],['B21','Hệ số đổi MPa sang kgf/cm²',10.197],['B22','Ngưỡng lệch Rx (%)',10]];
  [50,75,100].forEach((m,i)=>{const t=CV_T[m];fixed.push(['A'+(25+i),'Bảng hệ số: mác '+(i+1),m],['B'+(25+i),'Hệ số cát mác '+m,t[0]],['C'+(25+i),'Hệ số nước mác '+m,t[1]],['D'+(25+i),'R3/Rtk mác '+m,t[2]],['E'+(25+i),'R7/Rtk mác '+m,t[3]],['F'+(25+i),'R28/Rtk mác '+m,t[4]]);});
  const test={code:'CV_01',name:'Thiết kế thành phần cấp phối vữa xây xi măng cát',std:'Tính theo hệ số của phòng thí nghiệm',unit:'kg',key:'X'};
  const dp={mac:0,rx:0,X:0,cat:0,N:0,vx:0,vc:0,sx:0,sc:0,hong:1,Rtk:0,R3:0,R7:0,R28:0,rc:2,rn:2,rv:2};
  const cells={X:'B28',cat:'B29',N:'B30',vx:'B31',vc:'B32',sx:'B33',sc:'B34',hong:'B35',Rtk:'B36',R3:'B37',R7:'B38',R28:'B39',rc:'B40',rn:'B41',rv:'B42'};
  const cpf=(v,d)=>v==null?'':fnum(v,d);
  const live=fn=>d=>fn(cvRc(d),d);
  const G={code:'CP_VUA',form:{code:'BM-CV-01',ver:'v1.0'},ten:'Thiết kế cấp phối vữa xây',b64:()=>CV_B64,map,textKeys:txtKeys,fixed,tests:[test],dp,rc:cvRc,
    rkeys:['X','cat','N','R3','R7','R28'],cacheCells:cells,
    expect:rc=>{const e={};Object.keys(cells).forEach(k=>{if(typeof rc[k]==='number'&&isFinite(rc[k]))e[cells[k]]=rc[k];});return e;},
    results:(rc,raw)=>{const o={};Object.keys(cells).concat(['mac','rx']).forEach(k=>{if(rc[k]!=null)o[k]=rc[k];});
      o.t={};txtKeys.forEach(k=>{if(raw[k])o.t[k]=String(raw[k]);});o.m={};['xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra','ct_s5'].forEach(k=>{if(nzn(raw[k])!=null)o.m[k]=raw[k];});return o;},
    qr:[['mac','Mac vua'],['X','Xi mang kg'],['cat','Cat kg'],['N','Nuoc lit']],
    ph:{mac:'75',rx:'311',xm_ten:'COSEVCO 6 - PCB30',xm_lo:'016',xm_r28:'32,4',xm_rho:'3,1',xm_rhox:'1,1',ct_ten:'Nguồn Đồng Lào',ct_mdl:'2,84',ct_rx:'1485',ct_ra:'2,65',ct_s5:'0'},
    defaults:{xm_rho:3.1,xm_rhox:1.1},
    init:s=>{const m=macOf(s&&s.mau&&s.mau.quy_cach);return(m!=null&&CV_T[m])?{mac:m}:{};},
    opts:{mac:[[50,'M50'],[75,'M75'],[100,'M100']]},
    kind:k=>txtKeys.includes(k)?'text':k==='mac'?'numsel':'num',
    sections:d=>[
      Object.assign(sec1('Yêu cầu thiết kế','Mác vữa chọn ở phiếu yêu cầu (đã điền sẵn). Rx là mác xi măng thực tế dùng để tính.',[['',[['mac','Mác vữa thiết kế'],['rx','Mác xi măng thực tế Rx (kgf/cm²)']]]]),{live:live(o=>o.X==null?null:['Cấp phối','xi măng '+fnum(o.X,0)+' kg · cát '+(o.cat==null?'?':fnum(o.cat,0))+' kg · nước '+(o.N==null?'?':fnum(o.N,0))+' lít',o.R28!=null?' R28 dự kiến '+fnum(o.R28,0)+' daN/cm²':'',false])}),
      {t:'Xi măng',s:'Số liệu từ phiếu xi măng đã phát hành. Rx điền sẵn bằng R28 x 10,197 khi chọn phiếu (sửa được).',node:(d,again,s)=>cpPicker('xm')(d,()=>{if(d.xm_src&&d.rx==null&&nzn(d.xm_r28)!=null)d.rx=cpRound(d.xm_r28*CV_K.mpa,0);again();},s),
        g:[['',[['xm_ten','Loại, nhãn hiệu xi măng'],['xm_lo','Số lô'],['xm_r28','R28, phương pháp nhanh (MPa)'],['xm_rho','Khối lượng riêng (g/cm³)'],['xm_rhox','KL thể tích xốp (g/cm³)']]]],
        live:live(o=>o.rxMpa==null?null:['Rx / (R28 x 10,197)',fnum(o.rxMpa,2),o.rxMpa<0.9||o.rxMpa>1.1?'lệch quá '+CV_K.tol+' %':'',o.rxMpa<0.9||o.rxMpa>1.1])},
      {t:'Cát',s:'Số liệu từ phiếu cát đã phát hành.',node:cpPicker('ct'),g:[['',[['ct_ten','Nguồn cát'],['ct_mdl','Mô đun độ lớn Mđl'],['ct_rx','KL thể tích xốp (kg/m³)'],['ct_ra','Khối lượng riêng (g/cm³)'],['ct_s5','Hạt > 5 mm (%)']]]],
        live:live(o=>o.hong==null?null:['Độ hỗng của cát',fnum(o.hong,1)+' %','',false])}],
    need:d=>CV_REQ.filter(k=>typeof d[k]!=='number').length+CV_TXT.filter(k=>!d[k]).length,
    total:d=>CV_REQ.length+CV_TXT.length,
    valid:(d,rc)=>{const n=nzn;return rc.t&&n(d.rx)>0&&CV_REQ.every(k=>n(d[k])!=null)&&['xm_r28','xm_rho','xm_rhox','ct_mdl','ct_rx','ct_ra'].every(k=>n(d[k])>0)&&n(d.ct_s5)>=0&&CV_TXT.every(k=>!!d[k])&&rc.X!=null&&rc.cat!=null&&rc.N!=null&&rc.R28!=null;},
    verify:(raw,sample)=>{const out=cvLinkChecks(raw,['xm','ct']),rc=cvRc(raw),W='Lưu ý khi kiểm tra: ',q=macOf(sample&&sample.mau&&sample.mau.quy_cach);
      if(q!=null&&rc.mac!=null&&q!==rc.mac)out.push({label:W+'Mác vữa khớp phiếu yêu cầu',state:'warn',note:'Phiếu yêu cầu ghi M'+q+', biểu mẫu ghi M'+rc.mac+'.'});
      if(rc.rxMpa!=null&&Math.abs(rc.rxMpa-1)*100>CV_K.tol)out.push({label:W+'Rx gần R28 xi măng x 10,197 (lệch không quá '+CV_K.tol+' %)',state:'warn',note:'Rx = '+fnum(raw.rx,0)+' kgf/cm², R28 x 10,197 = '+fnum(raw.xm_r28*CV_K.mpa,0)+' kgf/cm². Người soát xét cần đối chiếu.'});
      return out;},
    head:['TT','Vật liệu','Khối lượng (kg)','TT tuyệt đối (lít)','TT xốp (lít)'],
    table:r=>[[1,'Xi măng',cpf(r.X,0),cpf(r.vx,0),cpf(r.sx,0)],[2,'Cát',cpf(r.cat,0),cpf(r.vc,0),cpf(r.sc,0)],[3,'Nước',cpf(r.N,0),cpf(r.N,0),cpf(r.N,0)]],
    body:r=>{const m=r.m||{},t=r.t||{};
      const tb=(head,rows,w)=>h('table',null,h('thead',null,h('tr',null,head.map(x=>h('th',null,x)))),h('tbody',null,rows.map(rw=>h('tr',null,rw.map((c,i)=>h('td',(w&&w[i]==='l')?{style:'text-align:left'}:{class:'c'},c==null?'':String(c)))))));
      return h('div',null,
        h('p',{style:'font-size:12px;margin:6px 0'},h('b',null,'Yêu cầu: '),'thiết kế cấp phối vữa xi măng cát mác M'+cpf(r.mac,0)+' · kích thước mẫu 40 x 40 x 160 mm'),
        h('div',{style:'margin-top:6px'},h('b',null,'A. Các loại vật liệu sử dụng')),
        tb(['TT','Vật liệu, nguồn gốc','KL riêng (g/cm³)','KLTT xốp (g/cm³)','Đặc trưng khác'],[
          [1,'Cát '+(t.ct_ten||''),cpf(m.ct_ra,2),cpf(m.ct_rx!=null?m.ct_rx/1000:null,3),'Mđl = '+cpf(m.ct_mdl,2)+'; độ hỗng '+cpf(r.hong,1)+' %'],
          [2,(t.xm_ten||'')+(t.xm_lo?', số lô '+t.xm_lo:''),cpf(m.xm_rho,2),cpf(m.xm_rhox,2),'R28 (P.P nhanh) = '+cpf(m.xm_r28,1)+' MPa']],['c','l','c','c','l']),
        h('div',{style:'margin-top:8px'},h('b',null,'B. Kết quả thành phần cấp phối vữa')),
        tb(['TT','Vật liệu','Tính theo trọng lượng (kg)','Tính theo TT tuyệt đối (lít)','Tính theo TT xốp (lít)','Tỷ lệ theo KL xi măng'],[
          [1,'Xi măng',cpf(r.X,0),cpf(r.vx,0),cpf(r.sx,0),cpf(1,2)],[2,'Cát',cpf(r.cat,0),cpf(r.vc,0),cpf(r.sc,0),cpf(r.rc,2)],[3,'Nước',cpf(r.N,0),cpf(r.N,0),cpf(r.N,0),cpf(r.rn,2)]],['c','l','c','c','c','c']),
        h('p',{style:'font-size:12px;margin:6px 0'},'Tỷ lệ thể tích xốp cát : xi măng = '+cpf(r.rv,2)+' : 1.'),
        h('div',{style:'margin-top:6px'},h('b',null,'C. Kết quả nén mẫu đúc thử (dự kiến)')),
        tb(['TT','Tuổi mẫu','Cường độ chịu nén (daN/cm²)','Ghi chú'],[[1,'Sau 3 ngày',cpf(r.R3,0),''],[2,'Sau 7 ngày',cpf(r.R7,0),''],[3,'Sau 28 ngày',cpf(r.R28,0),'dự kiến']],['c','l','c','c']));},
    nhanXet:r=>r.X==null?'':'Độ ẩm vật liệu khi tính bằng 0 %. Cường độ chịu nén dự kiến sau 28 ngày chỉ có giá trị tham khảo.',
    rawRows:raw=>{const f=(a,dp)=>a==null?'':fnum(a,dp),src=k=>raw[k+'_src']?(raw[k+'_bc']+' ('+raw[k+'_src']+')'):'nhập tay';
      return[['Yêu cầu','Mác vữa M'+f(raw.mac,0)+' · Rx '+f(raw.rx,0)+' kgf/cm²'],
        ['Xi măng · nguồn '+src('xm'),(raw.xm_ten||'')+' · lô '+(raw.xm_lo||'')+' · R28 '+f(raw.xm_r28,1)+' MPa · ρ '+f(raw.xm_rho,2)+' · ρx '+f(raw.xm_rhox,2)],
        ['Cát · nguồn '+src('ct'),(raw.ct_ten||'')+' · Mđl '+f(raw.ct_mdl,2)+' · ρx '+f(raw.ct_rx,1)+' · ρ '+f(raw.ct_ra,2)+' · hạt > 5 mm '+f(raw.ct_s5,2)+' %']];},
    qt:()=>[['Yêu cầu',[QT_C('Mác vữa','mac',0),QT_C('Rx (kgf/cm²)','rx',0)]],['Xi măng',[QT_C('R28 (MPa)','xm_r28',1),QT_C('KL riêng (g/cm³)','xm_rho',2),QT_C('KLTT xốp (g/cm³)','xm_rhox',2)]],
      ['Cát',[QT_C('Mđl','ct_mdl',2),QT_C('KLTT xốp (kg/m³)','ct_rx',1),QT_C('KL riêng (g/cm³)','ct_ra',2),QT_C('Hạt > 5 mm (%)','ct_s5',2)]],
      ['Cấp phối',[QT_R('Xi măng (kg)','X',0),QT_R('Cát (kg)','cat',0),QT_R('Nước (lít)','N',0),QT_R('R3 (daN/cm²)','R3',0),QT_R('R7 (daN/cm²)','R7',0),QT_R('R28 (daN/cm²)','R28',0)]]]};
  GT.CP_VUA=G;ALL_TESTS.push(test);
})();
