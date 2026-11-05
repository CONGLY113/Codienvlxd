import sys,base64,json,os
OUT=sys.argv[1] if len(sys.argv)>1 else '/tmp/w/out99.html'
s=open('/tmp/w/out98.html',encoding='utf8').read()
def rep(old,new,cnt=1):
    global s
    assert s.count(old)==cnt,(s.count(old),old[:110])
    s=s.replace(old,new)
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
rep("const BUILD='0.16.0 · 05/11/2026';","const BUILD='0.17.0 · 05/11/2026';")
mk="  GT.CP_VUA=G;ALL_TESTS.push(test);\n})();\n"
blocks=[]
# ---- phần A: nhập kết quả trực tiếp
specs=json.load(open('/tmp/w/t7/specs.json',encoding='utf8'))
g=open('/tmp/w/p/gt7a.js',encoding='utf8').read()
codes=[x['code'] for x in specs]+['BU_LONG','DAM_CHAT_CAT','CPDD_1','CPDD_2','DA_20_70']
g=g.replace('@@SPECS@@',json.dumps(specs,ensure_ascii=False)).replace('@@DB64@@',json.dumps({c:b64('/tmp/w/t7/%s.xlsx'%c) for c in codes}))
blocks.append(g)
for f in ['gt7b.js','gt7c.js','gt7d.js']:
    p='/tmp/w/p/'+f
    if os.path.exists(p): blocks.append(open(p,encoding='utf8').read())
rep(mk,mk+'\n'.join(blocks)+"\n")
# ---- danh mục loại mẫu
add="['NHUA_6070','Nhựa đường 60/70',true,'Nhựa đường đặc 60/70'],['NHUA_MC70','Nhựa đường lỏng MC70',true,'Nhựa đường lỏng đông đặc vừa MC70'],['GACH_BT_DAC','Gạch bê tông đặc',true,'Gạch bê tông đặc'],['GACH_BT_RONG','Gạch bê tông rỗng',true,'Gạch bê tông rỗng'],['BU_LONG','Bu lông',true,'Bu lông'],['DAM_CHAT_CAT','Đầm chặt cát',true,'Cát hạt mịn đầm chặt'],"
rep("['THEP_XD','Thép xây dựng',true,'Thép xây dựng'],","['THEP_XD','Thép xây dựng',true,'Thép xây dựng'],"+add)
rep("['DA_20_70','Đá dăm 20x70',false],","['DA_20_70','Đá dăm 20x70',true,'Đá dăm xây dựng cỡ 20-70 (mm)'],")
rep("['CPDD_1','Cấp phối đá dăm loại I',false],['CPDD_2','Cấp phối đá dăm loại II',false],","['CPDD_1','Cấp phối đá dăm loại I',true,'Cấp phối đá dăm loại I'],['CPDD_2','Cấp phối đá dăm loại II',true,'Cấp phối đá dăm loại II'],")
extra=open('/tmp/w/p/patch99_more.py',encoding='utf8').read() if os.path.exists('/tmp/w/p/patch99_more.py') else ''
if extra: exec(extra)
open(OUT,'w',encoding='utf8').write(s);print('ok',len(s))
