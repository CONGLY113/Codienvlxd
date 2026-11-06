import re,json,sys
SC='/tmp/claude-0/-home-claude/c64f2c08-0025-5f29-8403-f78a9d20d6b8/scratchpad/'
P='tools/patches/';H='app/quan-ly-mau-thu-nghiem.html'
s=open(H,encoding='utf8').read()
assert 'dich-vu' not in s,'đã vá'
a=open(P+'dv_a.js',encoding='utf8').read()
a=a.replace("gq:'',cnTab:'',uid:null}","gq:'',cnSoon:false,pm:'',pq:'',cnTab:'',uid:null}")
a=a.replace("function dvWatchInit(){\n","let DVINIT=false;\nfunction dvWatchInit(){\n  if(DVINIT)return;DVINIT=true;\n",1)
seed=json.dumps(json.load(open(SC+'prices.json',encoding='utf8')),ensure_ascii=False,separators=(',',':'))
mod='/* ===== MODULE BẢNG KÊ VÀ BÁO GIÁ DỊCH VỤ (v0.27.0) ===== */\nconst DV_SEED='+seed+';\n'+a+'\n'+''.join(open(P+f,encoding='utf8').read()+'\n' for f in ['dv_b.js','dv_c.js','dv_d.js'])+'/* ===== HẾT MODULE ===== */\n'
assert s.count('const NAV=[')==1
s=s.replace('const NAV=[',mod+'const NAV=[',1)
s=s.replace(" {k:'thong-ke',"," {k:'dich-vu',t:'Bảng kê và báo giá',show:()=>dvShow(),count:()=>dvMineCount()},\n {k:'thong-ke',",1)
s=s.replace("const BUILD='0.26.0 · 06/11/2026'","const BUILD='0.27.0 · 06/11/2026'")
s=s.replace("tq:'Thủ quỹ',ktt:'Kế toán trưởng'};","tq:'Thủ quỹ',ktt:'Kế toán trưởng',dvl_kd:'Giao nhận mẫu · P. Kiểm định Hiệu chuẩn',dvt_kd:'Trưởng phòng · P. Kiểm định Hiệu chuẩn',dvl_hs:'Giao nhận mẫu · P. Hóa sinh môi trường',dvt_hs:'Trưởng phòng · P. Hóa sinh môi trường',dvl_co:'Lập báo giá · P. Cơ điện VLXD',dvt_co:'Duyệt báo giá · P. Cơ điện VLXD'};",1)
s=s.replace("roles:['tp','tiepnhan','sx','pd','ql','kt','tn']}","roles:['tp','tiepnhan','sx','pd','ql','kt','tn','dvl_co','dvt_co']}",1)
s=s.replace("roles:['tiepnhan','kt']}","roles:['tiepnhan','kt','dvl_co']}",1)
s=s.replace("{id:'NS013',name:'Trần Hoàn',title:'Kế toán trưởng',roles:['ktt']}];","""{id:'NS013',name:'Trần Hoàn',title:'Kế toán trưởng',roles:['ktt']},
 {id:'NS014',name:'Phan Thanh Hà',title:'Trưởng phòng Kiểm định Hiệu chuẩn đo lường',roles:['dvt_kd']},
 {id:'NS015',name:'Nguyễn Thị Cẩm Hiền',title:'Giao nhận mẫu, P. Kiểm định Hiệu chuẩn đo lường',roles:['dvl_kd']},
 {id:'NS016',name:'Giang Tấn Thông',title:'Trưởng phòng Hóa sinh môi trường',roles:['dvt_hs']},
 {id:'NS017',name:'Hoàng Thị Châu',title:'Giao nhận mẫu, P. Hóa sinh môi trường',roles:['dvl_hs']}];""",1)
s=s.replace("syncSampleWatchers();bkWatchInit();","syncSampleWatchers();bkWatchInit();dvWatchInit();",1)
s=s.replace("window.__ptn={","window.__ptn={dvTotals,dvPay,dvSave,dvAct,dvNumber,dvBook,dvLineFrom,dvAllBk,dvAllBg,dvImportLines,dvReadXlsx,dvTemplateXlsx,dvPriceXlsx,dvMine,dvDebtData,DV,DVS,dvShow,dvOpen,",1)
open(H,'w',encoding='utf8').write(s)
print('ok',len(s))
