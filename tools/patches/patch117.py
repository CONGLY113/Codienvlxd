import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)

# 1. helper
rep("const loaiOf=s=>(s&&s.mau&&s.mau.loai)||'CAT_XD';",
"const loaiOf=s=>(s&&s.mau&&s.mau.loai)||'CAT_XD';\n/* 0.27.6: chỉ mẫu xi măng còn nhập nhiệt độ, độ ẩm phòng thử */\nconst envNeed=code=>/^XM_/.test(code||'');")

# 2. ba hàm phân tích file tải lên
old1="""  const tc=T.B25,ha=T.B26,envOk=typeof tc==='number'&&typeof ha==='number'&&tc>=0&&tc<=60&&ha>=0&&ha<=100;
  add('Nhiệt độ, độ ẩm phòng thử là số hợp lý',envOk?'ok':'warn',envOk?'':'Cần nhập nhiệt độ (0-60 °C) và độ ẩm (0-100 %RH).');"""
new1="""  const needEnv=envNeed(loaiOf(sample)),tc=needEnv&&typeof T.B25==='number'?T.B25:null,ha=needEnv&&typeof T.B26==='number'?T.B26:null,envOk=typeof tc==='number'&&typeof ha==='number'&&tc>=0&&tc<=60&&ha>=0&&ha<=100;
  if(needEnv)add('Nhiệt độ, độ ẩm phòng thử là số hợp lý',envOk?'ok':'warn',envOk?'':'Cần nhập nhiệt độ (0-60 °C) và độ ẩm (0-100 %RH).');"""
rep(old1,new1,2)
old2="""  const tc=g(T,'B25'),ha=g(T,'B26');
  const envOk=typeof tc==='number'&&typeof ha==='number'&&tc>=0&&tc<=60&&ha>=0&&ha<=100;
  add('Nhiệt độ, độ ẩm phòng thử là số hợp lý',envOk?'ok':'warn',envOk?'':'Cần nhập nhiệt độ (0-60 °C) và độ ẩm (0-100 %RH).');"""
new2="""  const needEnv=envNeed(loaiOf(sample)),tc=needEnv&&typeof g(T,'B25')==='number'?g(T,'B25'):null,ha=needEnv&&typeof g(T,'B26')==='number'?g(T,'B26'):null;
  const envOk=typeof tc==='number'&&typeof ha==='number'&&tc>=0&&tc<=60&&ha>=0&&ha<=100;
  if(needEnv)add('Nhiệt độ, độ ẩm phòng thử là số hợp lý',envOk?'ok':'warn',envOk?'':'Cần nhập nhiệt độ (0-60 °C) và độ ẩm (0-100 %RH).');"""
rep(old2,new2)

# 3. buildTemplate: không ghi, xóa ô nhiệt độ/độ ẩm, Kiem_tra B7:D7 không áp dụng
rep("""    if(typeof f.tc==='number')num('B25',f.tc);if(typeof f.ha==='number')num('B26',f.ha);str('B27',f.tt);""",
"""    if(envNeed(loaiOf(sample))){if(typeof f.tc==='number')num('B25',f.tc);if(typeof f.ha==='number')num('B26',f.ha);}str('B27',f.tt);""")
rep("""  str('B19',tester.id);str('B20',tester.name);if(extra&&extra.bc)str('B7',extra.bc);
""","""  str('B19',tester.id);str('B20',tester.name);if(extra&&extra.bc)str('B7',extra.bc);
  const noEnv=!envNeed(loaiOf(sample));
  if(noEnv)['A25','B25','C25','A26','B26','C26'].forEach(r=>{const c=cell(r);if(!c)return;clear(c);c.removeAttribute('t');c.removeAttribute('s');});
""")
rep("""  zip.file(p,xmlOut);
  if(form){ /* ghi số liệu gốc""","""  zip.file(p,xmlOut);
  if(noEnv){const pk='xl/worksheets/sheet3.xml',kd=new DOMParser().parseFromString(await zip.file(pk).async('string'),'application/xml');
    const kc=r=>Array.from(kd.getElementsByTagName('c')).find(x=>x.getAttribute('r')===r),kclr=c=>{while(c.firstChild)c.removeChild(c.firstChild);};
    const kstr=(r,v)=>{const c=kc(r);if(!c)return;kclr(c);c.setAttribute('t','inlineStr');const is=kd.createElementNS(NS_X,'is'),t=kd.createElementNS(NS_X,'t');t.textContent=v;is.appendChild(t);c.appendChild(is);};
    kstr('B7','Nhiệt độ, độ ẩm phòng thử: không yêu cầu');kstr('D7','Không áp dụng');
    const c7=kc('C7');if(c7){kclr(c7);c7.setAttribute('t','str');const f=kd.createElementNS(NS_X,'f'),v=kd.createElementNS(NS_X,'v');f.textContent='"OK"';v.textContent='OK';c7.appendChild(f);c7.appendChild(v);}
    let kx=new XMLSerializer().serializeToString(kd);if(!/^<\\?xml/.test(kx))kx='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\\n'+kx;zip.file(pk,kx);}
  if(form){ /* ghi số liệu gốc""")

# 4. form điện thoại
rep("""      h('label',null,'Nhiệt độ phòng (°C)',h('input',""","""      envNeed(loaiOf(s))?h('label',null,'Nhiệt độ phòng (°C)',h('input',""")
rep("""d.tc=t!==''&&!isNaN(+t)?+t:null;save();}})),
      h('label',null,'Độ ẩm phòng (%RH)',h('input',""","""d.tc=t!==''&&!isNaN(+t)?+t:null;save();}})):null,
      envNeed(loaiOf(s))?h('label',null,'Độ ẩm phòng (%RH)',h('input',""")
rep("""d.ha=t!==''&&!isNaN(+t)?+t:null;save();}}))),""","""d.ha=t!==''&&!isNaN(+t)?+t:null;save();}})):null),""")
rep("""    if(!d.d0||!d.d1||d.tc==null||d.ha==null){toast('Cần nhập ngày thử, nhiệt độ và độ ẩm.','bad');return;}""",
"""    if(!d.d0||!d.d1||(envNeed(loaiOf(s))&&(d.tc==null||d.ha==null))){toast(envNeed(loaiOf(s))?'Cần nhập ngày thử, nhiệt độ và độ ẩm.':'Cần nhập ngày bắt đầu và ngày kết thúc thử.','bad');return;}""")
rep("ngày thử, nhiệt độ, độ ẩm và mã thiết bị ở sheet Thong_tin.","ngày thử và mã thiết bị ở sheet Thong_tin (mẫu xi măng nhập thêm nhiệt độ, độ ẩm).")

# 5. tên file báo cáo
rep("function phieuStamp(s){",r'''/* 0.27.6: tên file báo cáo BC.dd.mm.yyyy.stt. Đơn vị thi công (viết tắt). Công trình (viết tắt).xlsx */
function bcFileName(s,so){
  so=so||phieuNo(s);const m=/(\d{2})\.(\d{2})\.(\d{2})\.(\d+)\s*$/.exec(String(so||''));
  let dd='',mm='',yy='',stt='';
  if(m){yy='20'+m[1];mm=m[2];dd=m[3];stt=m[4];}
  else{const iso=((s.phieu&&s.phieu.at)||'').slice(0,10)||todayISO();yy=iso.slice(0,4);mm=iso.slice(5,7);dd=iso.slice(8,10);}
  const da=s.du_an||{},cl=t=>abbrName(t,60).replace(/\.{3}$/,'').replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').replace(/[.\s]+$/,'').trim();
  const dv=cl(da.thi_cong||(s.khach&&s.khach.ten)),ct=cl(da.cong_trinh);
  return [['BC',dd,mm,yy,stt].filter(Boolean).join('.'),dv,ct].filter(Boolean).join('. ')+'.xlsx';
}
function phieuStamp(s){''')
rep("""  const p=s.phieu,F=loaiForm(s),name=F.code+'_'+phieuNo(s)+'.xlsx',ck=s.id+'|'+p.hash+'|'+F.code;""",
"""  const p=s.phieu,F=loaiForm(s),name=bcFileName(s),ck=s.id+'|'+p.hash+'|'+F.code+'|'+name;""")
rep("if(f&&f.b64&&f.form===F.code)out={bytes:b64ToU8(f.b64),name:f.name||name};","if(f&&f.b64&&f.form===F.code)out={bytes:b64ToU8(f.b64),name};")
rep("BUILD_PLACEHOLDER","BUILD_PLACEHOLDER",0) if False else None
open(F,'w',encoding='utf-8').write(s); print('ok')
