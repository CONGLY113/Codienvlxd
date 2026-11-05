async function validateTemplate(u8,code){
  code=code||'CAT_XD';
  const E=[],W=[];
  if(u8.length>200*1024)return{E:['File lớn hơn 200 KB. Xóa bớt ảnh hoặc định dạng thừa rồi lưu lại.'],W};
  let zip;try{zip=await JSZip.loadAsync(u8);}catch(e){return{E:['Không đọc được file. Hãy lưu bằng Excel dưới dạng .xlsx (Excel Workbook).'],W};}
  const names=Object.keys(zip.files);
  if(names.some(n=>/vbaProject|externalLinks|activeX|\.bin$/i.test(n)))E.push('File có macro, liên kết ngoài hoặc ActiveX. Không được phép nạp.');
  const wb=await zText(zip,'xl/workbook.xml');if(!wb)return{E:['Thiếu xl/workbook.xml, đây không phải file Excel hợp lệ.'],W};
  const ref=await JSZip.loadAsync(b64ToU8(origB64(code)));
  const rwb=await zText(ref,'xl/workbook.xml');
  const rsh=mauSheetNames(rwb),sh=mauSheetNames(wb);
  const pi=rsh.indexOf('Phieu_KQ')+1;
  if(pi<1)return{E:['Biểu mẫu gốc của loại này không có sheet Phieu_KQ, không thể thay.'],W};
  if(sh.join('|')!==rsh.join('|'))E.push('Các sheet phải đúng tên và thứ tự: '+rsh.join(', ')+'. File đang có: '+(sh.join(', ')||'không có')+'.');
  else{
    const rl=await zText(zip,'xl/_rels/workbook.xml.rels')||'';const rid={};Array.from(rl.matchAll(/<Relationship\b[^>]*>/g)).forEach(m=>{const i=/\bId="([^"]+)"/.exec(m[0]),t=/\bTarget="([^"]+)"/.exec(m[0]);if(i&&t)rid[i[1]]=t[1];});
    Array.from(wb.matchAll(/<sheet\b[^>]*\/>/g)).forEach((m,i)=>{const r=/r:id="([^"]+)"/.exec(m[0]);const t=r&&rid[r[1]]||'';if(!new RegExp('worksheets/sheet'+(i+1)+'\\.xml$').test(t))E.push('Sheet '+rsh[i]+' không nằm đúng vị trí sheet'+(i+1)+'.xml. Không thêm, xóa hoặc đổi chỗ sheet.');});
  }
  const rn=defNames(rwb),un=defNames(wb);
  const free=['in_nhan_xet','ten_can_bo','ten_truong_phong','ten_giam_doc'];
  const lost=[];Object.keys(rn).forEach(k=>{if(k.indexOf('_xlnm.')===0)return;if(free.includes(k))return;if(!un[k])lost.push(k);
    else if(/^Phieu_KQ!/.test(rn[k])){if(!/^Phieu_KQ!/.test(un[k]))E.push('Tên vùng '+k+' phải nằm trên sheet Phieu_KQ.');}
    else if(un[k]!==rn[k])E.push('Tên vùng '+k+' phải trỏ '+rn[k]+', file đang trỏ '+un[k]+'.');});
  if(lost.length)E.push('Thiếu '+lost.length+' tên vùng dữ liệu: '+lost.slice(0,6).join(', ')+(lost.length>6?'…':'')+'. Không xóa hoặc đổi tên.');
  if(rn['in_nhan_xet']&&!/^Phieu_KQ!/.test(un['in_nhan_xet']||''))E.push('Tên vùng in_nhan_xet phải nằm trên sheet Phieu_KQ.');
  ['ten_truong_phong','ten_giam_doc'].forEach(k=>{if(rn[k]&&!/^Phieu_KQ!/.test(un[k]||''))W.push('Chưa có tên vùng '+k+' trên Phieu_KQ, hệ thống sẽ không điền được tên người ký.');});
  const sa=await sstOf(ref),sb=await sstOf(zip);
  for(let n=1;n<=rsh.length;n++){
    if(n===pi)continue;
    const a=await sheetCells(ref,n,sa),b=await sheetCells(zip,n,sb);const bad=[];
    Object.keys(a).forEach(r=>{const x=a[r],y=b[r];
      if(x.f){if(!y||!y.f)bad.push(r+' mất công thức');else if(x.f!=='*'&&y.f!=='*'&&x.f!==y.f)bad.push(r+' đổi công thức');}
      else if(n!==1&&typeof x.v==='string'&&x.v!==''&&(!y||xnv(y.v)!==xnv(x.v)))bad.push(r+' đổi nội dung');});
    if(bad.length)E.push('Sheet '+rsh[n-1]+' bị sửa ('+bad.length+' ô): '+bad.slice(0,5).join('; ')+(bad.length>5?'…':'')+'. Chỉ được sửa sheet Phieu_KQ.');
  }
  const px='xl/worksheets/sheet'+pi+'.xml';
  const x4=await zText(zip,px)||'',r4=await zText(ref,px)||'';const c4=await sheetCells(zip,pi,sb),rc4=await sheetCells(ref,pi,sa);
  if(/paperSize="9"/.test(r4)&&!/paperSize="9"/.test(x4))E.push('Phiếu kết quả phải đặt khổ giấy A4 (paperSize 9).');
  const pm=/<pageMargins\b[^>]*>/.exec(x4),rpm=/<pageMargins\b[^>]*>/.exec(r4);
  if(rpm){if(!pm)E.push('Phieu_KQ chưa đặt lề in.');else [['left','trái'],['right','phải'],['top','trên'],['bottom','dưới']].forEach(([k,vn])=>{
    const g=new RegExp('\\b'+k+'="([\\d.]+)"');const a=g.exec(rpm[0]),b=g.exec(pm[0]);const want=a?+a[1]*2.54:null,got=b?+b[1]*2.54:null;
    if(want!==null&&(got===null||Math.abs(got-want)>0.03))E.push('Lề '+vn+' phải '+String(+want.toFixed(2)).replace('.',',')+' cm, file đang '+(got===null?'chưa đặt':got.toFixed(2).replace('.',',')+' cm')+'.');});}
  if(/<pageSetUpPr\b[^>]*fitToPage="(1|true)"/.test(r4)&&!/<pageSetUpPr\b[^>]*fitToPage="(1|true)"/.test(x4))W.push('Phiếu chưa bật Fit to page, có thể tràn sang trang 2.');
  const chartsOf=async z=>{let n=0,s=0;for(const c of Object.keys(z.files).filter(n=>/^xl\/charts\/chart\d+\.xml$/.test(n))){n++;s+=((await zText(z,c))||'').split(/<(?:c:)?ser>/).length-1;}return{n,s};};
  const rch=await chartsOf(ref),nch=await chartsOf(zip);
  if(rch.n){if(!/<drawing\b/.test(x4)||!nch.n||!nch.s)E.push('Phieu_KQ phải có biểu đồ (ít nhất một đường dữ liệu).');else if(nch.s<rch.s)W.push('Biểu đồ còn '+nch.s+' đường dữ liệu, biểu mẫu gốc có '+rch.s+'.');}
  const allF=Object.values(c4).map(c=>c.f||'').join(' '),refF=Object.values(rc4).map(c=>c.f||'').join(' ');
  Object.keys(rn).forEach(k=>{if(k.indexOf('_xlnm.')===0||free.includes(k))return;if(new RegExp('\\b'+k+'\\b').test(refF)&&!new RegExp('\\b'+k+'\\b').test(allF))E.push('Phieu_KQ không còn lấy kết quả từ '+k+'. Giữ công thức liên kết.');});
  const xc=t=>(t.match(/[A-Za-z_][A-Za-z0-9_]*!/g)||[]).length;
  if(xc(refF)>0&&xc(allF)<Math.floor(xc(refF)*0.9))E.push('Các bảng trên Phieu_KQ phải lấy số từ sheet dữ liệu: biểu mẫu gốc có '+xc(refF)+' tham chiếu, file đang có '+xc(allF)+'.');
  const nf=o=>Object.values(o).filter(c=>c.f).length,rnf=nf(rc4);
  if(rnf&&nf(c4)<Math.floor(rnf*0.85))E.push('Phieu_KQ mất nhiều công thức ('+nf(c4)+' so với '+rnf+' của biểu mẫu gốc).');
  const txt=Object.values(c4).map(c=>c.v||'').join('|'),rtxt=Object.values(rc4).map(c=>c.v||'').join('|');
  ['Cán bộ thử nghiệm','Trưởng phòng TN','Giám đốc'].forEach(t=>{if(rtxt.includes(t)&&!txt.includes(t))E.push('Thiếu tiêu đề chữ ký "'+t+'".');});
  ['Người thử nghiệm','Người soát xét','Người phê duyệt'].forEach(t=>{if(txt.includes(t)&&!rtxt.includes(t))E.push('Còn tiêu đề cũ "'+t+'". Dùng Cán bộ thử nghiệm, Trưởng phòng TN, Giám đốc.');});
  return{E,W};
}
/* tóm tắt khác biệt giữa hai bản trên Phieu_KQ, ghi vào lịch sử */
async function mauDiff(aU8,bU8,code){
  const out=[];
  try{
    const A=await JSZip.loadAsync(aU8),B=await JSZip.loadAsync(bU8);
    const sh=mauSheetNames(await zText(B,'xl/workbook.xml')),pi=sh.indexOf('Phieu_KQ')+1;if(pi<1)return out;
    const ca=await sheetCells(A,pi,await sstOf(A)),cb=await sheetCells(B,pi,await sstOf(B));
    const keys=Array.from(new Set(Object.keys(ca).concat(Object.keys(cb))));const ch=[];
    keys.forEach(k=>{const x=ca[k]||{f:null,v:null},y=cb[k]||{f:null,v:null};if((x.f||'')!==(y.f||'')||(x.v||'')!==(y.v||'')){if(x.f==='*'||y.f==='*')return;ch.push(k+(y.f?' (công thức)':': "'+String(y.v==null?'':y.v).slice(0,30)+'"'));}});
    if(ch.length)out.push('Sửa '+ch.length+' ô trên Phieu_KQ: '+ch.slice(0,6).join('; ')+(ch.length>6?'…':''));
    const px='xl/worksheets/sheet'+pi+'.xml',xa=await zText(A,px)||'',xb=await zText(B,px)||'';
    const cols=x=>{const o={};Array.from(x.matchAll(/<col\b[^>]*>/g)).forEach(m=>{const mi=/\bmin="(\d+)"/.exec(m[0]),ma=/\bmax="(\d+)"/.exec(m[0]),w=/\bwidth="([\d.]+)"/.exec(m[0]);if(mi&&ma&&w)for(let i=+mi[1];i<=Math.min(+ma[1],+mi[1]+60);i++)o[i]=Math.round(+w[1]*10)/10;});return o;};
    const colL=n=>{let s='';while(n>0){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;};
    const wa=cols(xa),wb=cols(xb);const cd=Array.from(new Set(Object.keys(wa).concat(Object.keys(wb)))).filter(k=>wa[k]!==wb[k]).map(k=>colL(+k));
    if(cd.length)out.push('Đổi độ rộng cột '+cd.slice(0,10).join(', ')+(cd.length>10?'…':''));
    const rows=x=>{const o={};Array.from(x.matchAll(/<row\b[^>]*>/g)).forEach(m=>{const r=/\br="(\d+)"/.exec(m[0]),h=/\bht="([\d.]+)"/.exec(m[0]),hi=/\bhidden="(1|true)"/.test(m[0]);if(r)o[r[1]]=(h?Math.round(+h[1]*10)/10:'')+(hi?'h':'');});return o;};
    const ra=rows(xa),rb=rows(xb);const rd=Array.from(new Set(Object.keys(ra).concat(Object.keys(rb)))).filter(k=>(ra[k]||'')!==(rb[k]||''));
    if(rd.length)out.push('Đổi chiều cao/ẩn hiện '+rd.length+' hàng');
    const mg=x=>(x.match(/<mergeCell\b[^>]*>/g)||[]).sort().join('');if(mg(xa)!==mg(xb))out.push('Đổi các ô gộp');
    const pr=x=>((/<pageMargins\b[^>]*>/.exec(x)||[''])[0])+((/<pageSetup\b[^>]*>/.exec(x)||[''])[0]);if(pr(xa)!==pr(xb))out.push('Đổi lề hoặc thiết lập trang in');
    const charts=async z=>(await Promise.all(Object.keys(z.files).filter(n=>/^xl\/(charts\/chart\d+|drawings\/drawing\d+)\.xml$/.test(n)).sort().map(n=>zText(z,n)))).join('');
    if(await charts(A)!==await charts(B))out.push('Đổi biểu đồ');
    if((await zText(A,'xl/styles.xml'))!==(await zText(B,'xl/styles.xml')))out.push('Đổi định dạng (font, màu, viền)');
  }catch(e){console.warn('mauDiff',e);}
  return out;
}
