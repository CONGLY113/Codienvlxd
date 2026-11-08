import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
fn=r'''
/* ===== 0.27.6 Sheet So_lieu: gợi ý giá trị đo ở các ô nhập (hộp nhắc khi chọn ô, không chặn nhập) ===== */
const SL_EX=[[/^g$/i,'500,0'],[/^kg$/i,'5,00'],[/^mg$/i,'250'],[/^mm$/i,'40,00'],[/^cm$/i,'15,0'],[/^m$/i,'1,00'],[/^kn$/i,'150,0'],[/^n$/i,'1500'],[/^mpa$/i,'25,0'],[/^n\/mm/i,'400'],[/^daN\/cm/i,'300'],[/^%/,'2,5'],[/^phút/i,'120'],[/^giờ/i,'24'],[/^°c/i,'27'],[/^cm(³|3)$/i,'100,0'],[/^ml$/i,'250'],[/^l$|^lít$/i,'1,00'],[/^g\/cm/i,'2,65'],[/^kg\/m/i,'1450'],[/^1\/10 ?mm/i,'65'],[/^s(ec)?$|^giây/i,'45']];
async function patchSoLieuHints(zip){
  const p='xl/worksheets/sheet2.xml',sf=zip.file(p),stF=zip.file('xl/styles.xml');if(!sf||!stF)return;
  const P=new DOMParser(),doc=P.parseFromString(await sf.async('string'),'application/xml'),sd=doc.getElementsByTagName('sheetData')[0];if(!sd||doc.getElementsByTagName('dataValidations')[0])return;
  const stDoc=P.parseFromString(await stF.async('string'),'application/xml'),fills=Array.from((stDoc.getElementsByTagName('fills')[0]||{children:[]}).children),xfs=Array.from((stDoc.getElementsByTagName('cellXfs')[0]||{children:[]}).children);
  const fillRgb=i=>{const f=fills[i];const fg=f&&f.getElementsByTagName('fgColor')[0];return fg?String(fg.getAttribute('rgb')||'').toUpperCase():'';};
  const kind=s=>{const x=xfs[s];if(!x)return'';const r=fillRgb(+x.getAttribute('fillId')||0);return r.endsWith('FFF2CC')?'in':r.endsWith('DDEBF7')?'head':'';};
  let sst=[];const ssf=zip.file('xl/sharedStrings.xml');
  if(ssf){const sx=P.parseFromString(await ssf.async('string'),'application/xml');sst=Array.from(sx.getElementsByTagName('si')).map(si=>Array.from(si.getElementsByTagName('t')).map(t=>t.textContent).join(''));}
  const txt=c=>{const t=c.getAttribute('t');if(t==='inlineStr')return Array.from(c.getElementsByTagName('t')).map(x=>x.textContent).join('');const v=c.getElementsByTagName('v')[0];if(t==='s'&&v)return sst[+v.textContent]||'';if(c.getElementsByTagName('f')[0])return'';return v?v.textContent:'';};
  const colL=ref=>(ref.match(/^[A-Z]+/)||[''])[0],rowN=ref=>+(ref.match(/\d+/)||[0])[0];
  const grid={},ins=[];
  Array.from(doc.getElementsByTagName('c')).forEach(c=>{const r=c.getAttribute('r'),k=kind(+c.getAttribute('s')||0);grid[r]={t:txt(c).trim(),k};if(k==='in')ins.push(r);});
  if(!ins.length)return;
  const unitOf=s=>{const m=/\(([^()]+)\)\s*$/.exec(s)||/\(([^()]+)\)/.exec(s);return m?m[1].trim():'';};
  const by={};
  ins.forEach(ref=>{const col=colL(ref),n=rowN(ref);
    let head='';for(let r=n-1;r>=1&&r>=n-60;r--){const g=grid[col+r];if(g&&g.k==='head'&&g.t){head=g.t;break;}if(g&&g.k!=='in'&&g.t&&!/^(Lần|Viên|Kim|Mẫu)/i.test(g.t)&&r<n-1&&!grid['A'+r])break;}
    const lab=(grid['A'+n]||{}).t||'';let unit=unitOf(head)||unitOf(lab);if(!unit){for(const L of ['F','E','D','G']){const g=grid[L+n];if(g&&g.t&&g.t.length<=8&&g.k===''&&!/^\d/.test(g.t)){unit=g.t;break;}}}
    const ex=(SL_EX.find(e=>e[0].test(unit))||[])[1];
    const what=[lab,head].filter((x,i,a)=>x&&a.indexOf(x)===i).join(' · ')||'Số đo';
    const prompt=('Nhập số đo thực tế'+(unit?' (đơn vị: '+unit+')':'')+(ex?'. Ví dụ: '+ex:'')+'. Dùng dấu thập phân của Excel; ô xám, xanh lá tự tính, không sửa.').slice(0,250);
    const title=what.replace(/\s*\([^)]*\)\s*$/,'').slice(0,30)||'Số đo';
    (by[title+'\u0001'+prompt]=by[title+'\u0001'+prompt]||[]).push(ref);});
  const dvs=doc.createElementNS(NS_X,'dataValidations');let cnt=0;
  Object.keys(by).forEach(k=>{const [title,prompt]=k.split('\u0001'),d=doc.createElementNS(NS_X,'dataValidation');
    d.setAttribute('allowBlank','1');d.setAttribute('showInputMessage','1');d.setAttribute('promptTitle',title);d.setAttribute('prompt',prompt);d.setAttribute('sqref',by[k].join(' '));dvs.appendChild(d);cnt++;});
  dvs.setAttribute('count',String(cnt));
  const after=['hyperlinks','printOptions','pageMargins','pageSetup','headerFooter','rowBreaks','colBreaks','customProperties','cellWatches','ignoredErrors','smartTags','drawing','legacyDrawing','legacyDrawingHF','picture','oleObjects','controls','webPublishItems','tableParts','extLst'];
  let ref=null;for(const nm of after){const e=doc.getElementsByTagName(nm)[0];if(e&&e.parentNode===doc.documentElement){ref=e;break;}}
  if(ref)doc.documentElement.insertBefore(dvs,ref);else doc.documentElement.appendChild(dvs);
  let x=new XMLSerializer().serializeToString(doc);if(!/^<\?xml/.test(x))x='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'+x;zip.file(p,x);
}
'''
rep("async function buildTemplate(sample,tester,form,extra){",fn+"async function buildTemplate(sample,tester,form,extra){")
rep("  if(form){ /* ghi số liệu gốc","  await patchSoLieuHints(zip);\n  if(form){ /* ghi số liệu gốc")
rep("['08/11/2026','B29','Claude',","['08/11/2026','B30','Claude','Sheet So_lieu của mọi biểu mẫu: thêm hộp gợi ý giá trị đo ở các ô nhập (tên chỉ tiêu, đơn vị, ví dụ số đo), không chặn nhập.','Đã kiểm thử'],\n['08/11/2026','B29','Claude',")
open(F,'w',encoding='utf-8').write(s);print('ok')
