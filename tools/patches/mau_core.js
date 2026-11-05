/* ====================================================== 0.21.0 BIỂU MẪU GỐC CỦA MỌI LOẠI MẪU */
function mauName(code){const t=MAT_TYPES.find(x=>x[0]===code);return t?t[1]:code;}
function mauCodes(){return MAT_TYPES.filter(t=>t[2]).map(t=>t[0]);}
function origB64(code){const g=GT[code];if(g&&g.b64)return g.b64();return code==='DA_5_20'?DA_B64:TEMPLATE_B64;}
function mauOv(code){const d=S.mauf&&S.mauf[code];if(d&&d.b64)return d;if(code==='CAT_XD'&&S.mau&&S.mau.b64)return Object.assign({legacy:true,rev:0,hid:''},S.mau);return null;}
function activeB64(code){const o=mauOv(code);return o?o.b64:origB64(code);}
function activeTemplateB64(){return activeB64('CAT_XD');}
function mauFormOf(code){return loaiForm({mau:{loai:code}});}
function mauFile(code,kind,rev){const f=mauFormOf(code);return f.code+'_'+code+'_'+kind+(rev?'_r'+rev:'')+'.xlsx';}
const mauSheetNames=x=>Array.from((x||'').matchAll(/<sheet\b[^>]*?\bname="([^"]+)"[^>]*\/>/g)).map(m=>m[1]);
