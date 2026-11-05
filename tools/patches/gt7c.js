/* ---- đầm chặt cát, cấp phối đá dăm loại I và II: cùng bộ tính với cấp phối thiên nhiên (khác cối đầm, phương pháp, mẫu biểu) */
(function(){
  const T0=GT.CP_TN;
  const mk=(code,form,ten,tc,pp,tname,ph,lbl)=>{
    const test=Object.assign({},T0.tests[0],{code:tc,name:tname,std:'22TCN 333-06 ('+pp+')'});
    const G=Object.assign({},T0,{code,form:{code:form,ver:'v1.0'},ten,b64:()=>DIRECT_B64[code],tests:[test],ph:Object.assign({},T0.ph,ph),
      body:r=>{const nd=T0.body(r),p=nd&&nd.querySelector&&nd.querySelector('p');if(p&&p.lastChild&&p.lastChild.nodeValue)p.lastChild.nodeValue=p.lastChild.nodeValue.replace('P.P II-D',pp);return nd;}});
    G.qt=()=>T0.qt();GT[code]=G;ALL_TESTS.push(test);NGUON_LBL[code]=lbl;};
  mk('DAM_CHAT_CAT','BM-CT-02','Đầm chặt cát','CT_02','P.P II-A','Tương quan dung trọng khô - độ ẩm của cát (đầm nén tiêu chuẩn)',{V:'989',cm:'4087',mt_0:'5677',ma_0:'540,14',mk_0:'515,24',mh_0:'62,59',mt_1:'5763',ma_1:'639,21',mk_1:'601,23',mh_1:'58,71',hc_M:'32512',hc_S:'2525',hc_m1:'536,36',hc_m2:'500,25',hc_q1:'500,2',hc_q2:'488,6',hc_B:'1932',hc_C:'1102',hc_A:'1862'},
    {l:'Nguồn gốc cát',ph:'Ví dụ: Cát hạt mịn, xã Quảng Xuân',hint:'Ghi mỏ hoặc vị trí lấy cát đầm chặt.'});
  mk('CPDD_1','BM-CT-03','Cấp phối đá dăm loại I','CT_03','P.P II-D','Tương quan dung trọng khô - độ ẩm của cấp phối đá dăm loại I (đầm nén tiêu chuẩn)',{},
    {l:'Nguồn gốc mẫu (mỏ đá)',ph:'Ví dụ: Mỏ đá Áng Sơn',hint:'Ghi tên mỏ đá cung cấp cấp phối đá dăm.'});
  mk('CPDD_2','BM-CT-04','Cấp phối đá dăm loại II','CT_04','P.P II-D','Tương quan dung trọng khô - độ ẩm của cấp phối đá dăm loại II (đầm nén tiêu chuẩn)',{},
    {l:'Nguồn gốc mẫu (mỏ đá)',ph:'Ví dụ: Mỏ đá Áng Sơn',hint:'Ghi tên mỏ đá cung cấp cấp phối đá dăm.'});
})();
