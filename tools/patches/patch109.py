src=open('/tmp/w/out108.html',encoding='utf8').read()
tb=open('/tmp/w/p/tb.js',encoding='utf8').read()
def rep(a,b,cnt=1):
    global src
    n=src.count(a)
    assert n==cnt,('anchor count %d (want %d): %s'%(n,cnt,a[:100]))
    src=src.replace(a,b)
rep("const BUILD='0.25.0 · 06/11/2026';","const BUILD='0.26.0 · 06/11/2026';")
rep("  const p={sand:'M3 17c3-1 4-5 7-5s","  const p={bell:'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',sand:'M3 17c3-1 4-5 7-5s")
rep("/* ---- devices */\nlet dvF='all',dvQ='';",tb+"\n/* ---- devices */\nlet dvF='all',dvQ='';")
rep(" {k:'tong-quan',t:'Tổng quan',show:()=>true},\n"," {k:'tong-quan',t:'Tổng quan',show:()=>true},\n {k:'thong-bao',t:'Thông báo',show:()=>true,count:()=>tbUnread()},\n")
rep("function render(){\n  let k=route();const app=$('#app');","function render(){\n  tbSync();\n  let k=route();const app=$('#app');")
rep("      h('button',{class:'avatar','aria-label':'Tài khoản và menu'","      h('button',{class:'bell','aria-label':'Thông báo','data-act':'bell',onclick:()=>{location.hash='thong-bao';}},icon('bell'),tbUnread()?h('span',{class:'count'},tbUnread()):null),\n      h('button',{class:'avatar','aria-label':'Tài khoản và menu'")
# hook: giao việc một mẫu
rep("      await audit(s,reassign?'Đổi người được giao':'Giao nhiệm vụ',who.name+' · hạn '+fd(hanIn.value));return ma_gv;});",
"""      await audit(s,reassign?'Đổi người được giao':'Giao nhiệm vụ',who.name+' · hạn '+fd(hanIn.value));
      await tbNotify([who.id],{title:reassign?'Bạn được giao thay':'Nhiệm vụ mới',body:tbSmp(s)+' · hạn '+fd(hanIn.value)+(note.value.trim()?' · '+tbShort(note.value.trim(),60):''),link:'nhiem-vu',kind:'giao',sample:s.id});
      if(reassign&&s.giao&&s.giao.ma_nv&&s.giao.ma_nv!==who.id)await tbNotify([s.giao.ma_nv],{title:'Mẫu đã chuyển cho người khác',body:tbSmp(s)+' chuyển cho '+who.name,link:'nhiem-vu',kind:'giao',sample:s.id});
      return ma_gv;});""")
# giao cả phiếu
rep("    await audit(s,'Giao nhiệm vụ (cả phiếu)',who.name+' · hạn '+fd(hanIn.value));}return true;});",
"""    await audit(s,'Giao nhiệm vụ (cả phiếu)',who.name+' · hạn '+fd(hanIn.value));}
    await tbNotify([who.id],{title:'Nhiệm vụ mới: '+list.length+' mẫu',body:(s0.du_an&&s0.du_an.cong_trinh?tbShort(s0.du_an.cong_trinh,48)+' · ':'')+list.map(x=>x.ma_mau).join(', ')+' · hạn '+fd(hanIn.value),link:'nhiem-vu',kind:'giao',sample:list[0]&&list[0].id});return true;});""")
# nộp kết quả
rep("await audit(s,'Nộp kết quả, chờ soát xét',u.name+' · SHA-256 '+(u.hash||'').slice(0,12));return true;","await audit(s,'Nộp kết quả, chờ soát xét',u.name+' · SHA-256 '+(u.hash||'').slice(0,12));await tbNotifySx(s);return true;",2)
# trả lại, soát xét đạt
rep("await audit(s,'Trả lại làm lại ('+(isSx?'soát xét':'phê duyệt')+')',why);return {back:true};","await audit(s,'Trả lại làm lại ('+(isSx?'soát xét':'phê duyệt')+')',why);await tbNotify([s.giao&&s.giao.ma_nv],{title:'Mẫu bị trả lại',body:tbSmp(s)+' · '+tbShort(why,80),link:'nhiem-vu',kind:'tra_lai',sample:s.id});return {back:true};")
rep("await audit(s,'Soát xét đạt',why);return {sx:true};","await audit(s,'Soát xét đạt',why);await tbNotifyPd(s);return {sx:true};")
# sửa phiếu
rep("' · '+doc.ly_do);\n  return Object.assign({id},doc);","' · '+doc.ly_do);\n  if(o.loai!=='D')await tbNotify(tbRole('sx'),{title:'Đề nghị sửa phiếu chờ soát xét',body:ma+' · '+tbShort(doc.cong_trinh||doc.khach,40)+' · '+(doc.bc_goc||''),link:'sua-phieu',kind:'sua_phieu',sample:s.id});\n  return Object.assign({id},doc);")
rep("if(s)await audit(s,note+' '+d.ma,'');\n}","if(s)await audit(s,note+' '+d.ma,'');\n  if(to==='cho_phe_duyet')await tbNotify(tbRole('pd'),{title:'Đề nghị sửa phiếu chờ phê duyệt',body:d.ma+' · '+(d.bc_goc||''),link:'sua-phieu',kind:'sua_phieu',sample:d.sample});\n}")
rep("' · SHA-256 '+phieu.hash.slice(0,12));\n","' · SHA-256 '+phieu.hash.slice(0,12));\n  await tbNotify([d.lap&&d.lap.by_id],{title:'Đã phát hành phiếu thay thế',body:d.ma+' · '+bcNew+'. Giao khách và thu hồi bản cũ.',link:'sua-phieu',kind:'sua_phieu',sample:d.sample});\n",1) if src.count("' · SHA-256 '+phieu.hash.slice(0,12));\n")==1 else None
# xuất để kiểm thử
rep("window.__ptn={sdCreate,","window.__ptn={tbNotify,tbSync,tbAlert,tbEnable,tbRead,tbReadAll,tbUnread,tbOS,TB,sdCreate,")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['06/11/2026','B20','Claude','Thêm Thông báo: mỗi người có hộp thông báo riêng (chuông, đếm chưa đọc, âm báo, thông báo hệ điều hành). Gửi khi giao việc, đổi người, trả lại, nộp chờ soát xét, chờ phê duyệt, đề nghị sửa phiếu. Gói đẩy nền Firebase Cloud Messaging làm sẵn, tùy chọn.','Chờ phòng chạy thử','','','0.26.0'],\n")
css=""".bell{position:relative;width:40px;height:40px;border-radius:50%;border:1px solid var(--line);background:var(--bg);color:var(--ink);display:grid;place-items:center;flex:none;cursor:pointer}
.bell .count{position:absolute;top:-3px;right:-3px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:var(--bad);color:#fff;font-size:10.5px;display:grid;place-items:center}
.tb-item{display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}
.tb-item[data-unread="1"]{background:var(--accent-soft);margin:0 -10px;padding:10px;border-radius:8px}
.tb-item .tb-main{min-width:0;flex:1}
@media(min-width:900px){.bell{display:none}}
"""
rep("@media print{.topbar,.tabbar,.sheet,.side{display:none!important}}",css+"@media print{.topbar,.tabbar,.sheet,.side{display:none!important}}")
open('/tmp/w/out109.html','w',encoding='utf8').write(src)
print(len(src))
