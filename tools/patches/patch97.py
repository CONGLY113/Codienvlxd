import json,re
OUT='/tmp/w/out97.html'
s=open('/tmp/w/out96_final.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:100])
    s=s.replace(old,new)
rep("const BUILD='0.14.0 · 04/11/2026';","const BUILD='0.15.0 · 05/11/2026';")
m=json.load(open('/tmp/w/vw/vwx.json',encoding='utf8'))
vwx=json.dumps(m,ensure_ascii=True,separators=(',',':'))
js="""/* VietwareX (UniKey VIETWARE-X): mỗi ký tự Unicode tiếng Việt đổi thành 1 hoặc 2 ký tự Windows-1252, dấu viết sau chữ cái; dùng với font VNshelleyAllegro */
const VWX=%s;
function toVwx(t){return Array.from(String(t==null?'':t).normalize('NFC')).map(c=>VWX[c]||c).join('');}
"""%vwx
rep("const MAU_DEF=",js+"const MAU_DEF=")
# applyMau
a=s.index("async function applyMau(zip){")
b=s.index("async function mauSave(patch)")
new="""async function applyMau(zip,tester){
  try{
    const o=mauOpts(),nm=defNames(await zText(zip,'xl/workbook.xml')),p4='xl/worksheets/sheet4.xml';let x4=await zText(zip,p4);let st=await zText(zip,'xl/styles.xml')||'';
    /* font VNshelleyAllegro cỡ 16 và kiểu ô riêng cho tên người ký (căn giữa, tự co chữ nếu ô hẹp) được ghi thẳng vào biểu mẫu */
    const fm=/<fonts\\b[^>]*?\\bcount="(\\d+)"[^>]*>([\\s\\S]*?)<\\/fonts>/.exec(st);
    let vf=-1;
    if(fm){const fl=fm[2].match(/<font\\b[\\s\\S]*?<\\/font>|<font\\/>/g)||[];vf=fl.findIndex(f=>/VNshelleyAllegro/i.test(f)&&/<sz val="16"/.test(f));
      if(vf<0){vf=fl.length;st=st.replace(/(<fonts\\b[^>]*?\\bcount=")\\d+(")/,(q,a1,a2)=>a1+(fl.length+1)+a2).replace('</fonts>','<font><name val="VNshelleyAllegro"/><family val="1"/><sz val="16"/></font></fonts>');}}
    let vx=-1;
    const xm=/<cellXfs\\b[^>]*?\\bcount="(\\d+)"[^>]*>/.exec(st);
    if(vf>=0&&xm){vx=+xm[1];st=st.replace(/(<cellXfs\\b[^>]*?\\bcount=")\\d+(")/,(q,a1,a2)=>a1+(vx+1)+a2).replace('</cellXfs>','<xf numFmtId="0" fontId="'+vf+'" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment horizontal="center" vertical="center" shrinkToFit="1"/></xf></cellXfs>');zip.file('xl/styles.xml',st);}
    const put=(name,uni,vw)=>{const m=/Phieu_KQ!\\$?([A-Z]+)\\$?(\\d+)/.exec(nm[name]||'');if(!m)return;const r=m[1]+m[2];
      const re=new RegExp('<c\\\\b[^>]*\\\\br="'+r+'"[^>]*?(?:/>|>[\\\\s\\\\S]*?</c>)');const cur=re.exec(x4);if(!cur)return;
      const s0=/\\bs="(\\d+)"/.exec(cur[0]);const useVw=vx>=0&&(vw||uni);const s=useVw?vx:(s0?s0[1]:0);
      x4=x4.replace(re,()=>'<c r="'+r+'" s="'+s+'" t="inlineStr"><is><t xml:space="preserve">'+xesc(useVw?(vw||toVwx(uni)):uni)+'</t></is></c>');
      x4=x4.replace(new RegExp('<row r="'+m[2]+'"([^>]*)>'),(q,a)=>{const h=/\\bht="([\\d.]+)"/.exec(a);if(h&&+h[1]>=30)return q;a=a.replace(/\\s*\\bht="[^"]*"/,'').replace(/\\s*\\bcustomHeight="[^"]*"/,'');return '<row r="'+m[2]+'"'+a+' ht="30" customHeight="1">';});};
    put('ten_truong_phong',o.tp_uni||MAU_DEF.tp_uni,o.tp_vw);put('ten_giam_doc',o.gd_uni||MAU_DEF.gd_uni,o.gd_vw);
    if(tester&&tester.name)put('ten_can_bo',tester.name,'');
    zip.file(p4,x4);
    for(const n of Object.keys(zip.files).filter(n=>/^xl\\/charts\\/chart\\d+\\.xml$/.test(n)))zip.file(n,lineOpts(await zip.file(n).async('string'),o));
  }catch(e){console.warn('applyMau',e);}
}
"""
s=s[:a]+new+s[b:]
rep("await applyMau(zip);await fitRows(zip,sample);","await applyMau(zip,tester);await fitRows(zip,sample);")
# issuedParts reviewer name
rep("setC('D'+R,x.sx_ten||'');","setC('D'+R,toVwx(x.sx_ten||''));")
# settings text
rep("Font VNshelleyAllegro dùng bảng mã VietwareX. Gõ tên trong Excel với UniKey: kiểu gõ Telex, bảng mã VietwareX, font VNshelleyAllegro, rồi chép ô đó dán vào ô bên dưới. Để trống thì hệ thống ghi tên Unicode bằng font Times New Roman nghiêng cỡ 16.",
    "Tên người ký trong mọi biểu mẫu dùng font VNshelleyAllegro cỡ 16, bảng mã VietwareX. Hệ thống tự đổi tên Unicode sang VietwareX nên chỉ cần gõ tên tiếng Việt bình thường; tên Cán bộ thử nghiệm lấy theo người đăng nhập. Chỉ dán vào ô VietwareX khi muốn ghi đè (ví dụ tên viết khác).")
rep("placeholder:'Dán tên đã gõ trong Excel (VietwareX)',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});\n  const gdU","placeholder:'Để trống: tự đổi từ Unicode',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});\n  const gdU")
rep("placeholder:'Dán tên đã gõ trong Excel (VietwareX)',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});\n  const saveOpts","placeholder:'Để trống: tự đổi từ Unicode',style:'font-family:VNshelleyAllegro,cursive;font-size:20px'});\n  const saveOpts")
rep("window.__ptn={","window.__ptn={toVwx,VWX,applyMau,")
row=""" ['05/11/2026','B7','Claude','Tên người ký trong mọi biểu mẫu (cán bộ thử nghiệm, Trưởng phòng TN, Giám đốc) dùng font VNshelleyAllegro cỡ 16, bảng mã VietwareX, ghi trực tiếp vào ô chữ ký của Phieu_KQ (kiểu ô căn giữa, tự co chữ khi ô hẹp, hàng cao 30). Hệ thống tự đổi tên Unicode sang VietwareX theo bảng mã của UniKey (không cần dán tay); tên cán bộ lấy theo người đăng nhập khi tải biểu mẫu và theo người được giao khi phát hành phiếu; tên người soát xét khi Trưởng phòng tự thử nghiệm cũng đổi mã','Chờ thử','Font VNshelleyAllegro không nhúng trong file, máy mở và in phải cài sẵn font. Mã VietwareX lấy từ bảng của UniKey, cần anh mở thử một biểu mẫu trên máy có font để đối chiếu mặt chữ. Tên ngoài danh sách vẫn đổi tự động'],
"""
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n"+row)
open(OUT,'w',encoding='utf8').write(s); print(len(s))
