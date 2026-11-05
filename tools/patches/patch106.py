s=open('/tmp/w/out105.html',encoding='utf8').read()
js=open('/tmp/w/p/bkup.js',encoding='utf8').read()
def rep(old,new,n=1):
    global s
    c=s.count(old);assert c==n,(old[:80],c);s=s.replace(old,new)
rep("const BUILD='0.23.0 · 05/11/2026';","const BUILD='0.24.0 · 05/11/2026';")
# Data.readAll: đọc đủ cả bộ sưu tập (không giới hạn 1000)
rep("  async getAll(col){","  async readAll(col){ /* đọc toàn bộ một bộ sưu tập (dùng cho sao lưu) */\n    if(DB){const s=await DB.collection(col).get();return s.docs.map(d=>Object.assign({id:d.id},d.data()));}\n    return Object.keys(mem[col]||{}).map(id=>Object.assign({id},mem[col][id]));\n  },\n  async getAll(col){")
rep("async function importEquip(f){",js+"\nasync function importEquip(f){")
rep("    h('div',{class:'card stack'},h('h2',null,'Dữ liệu chạy thử')","    bkupCard(),\n    h('div',{class:'card stack'},h('h2',null,'Dữ liệu chạy thử')")
rep("S.perCfg=list.find(x=>x.id==='periods')||null;","S.perCfg=list.find(x=>x.id==='periods')||null;S.saoLuu=list.find(x=>x.id==='sao_luu')||null;S.cfgLoaded=true;")
rep("  root.append(pageHead('Tổng quan','Mẫu đang ở đâu trong luồng, và việc nào đang chờ bạn.'));",
"""  root.append(pageHead('Tổng quan','Mẫu đang ở đâu trong luồng, và việc nào đang chờ bạn.'));
  if(hasRole('tp')&&S.cfgLoaded&&S.samples.length){const bd=bkupDueDays();if(bd===null||bd>=7)root.append(h('div',{class:'banner','data-tone':'warn'},h('div',null,h('b',null,bd===null?'Chưa sao lưu dữ liệu ra Excel. ':'Đã '+bd+' ngày chưa sao lưu dữ liệu ra Excel. '),h('a',{href:'#cai-dat'},'Sao lưu ngay trong Cài đặt'))));}""")
rep("window.__ptn={mauApply,","window.__ptn={bkupRun,bkupCollect,xlBook,mauApply,")
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B18','Claude','Cài đặt có mục Sao lưu dữ liệu ra Excel (trưởng phòng): một file .xlsx gồm sheet Mau, Ket_qua, So_lieu_goc, Bang_ke, Bang_ke_dong, Nhat_ky, Thiet_bi, Cau_hinh, Bieu_mau_lich_su, Luu_giu_chi_muc, Bo_dem_so, Loi_he_thong và DuLieu_Tho (JSON đầy đủ từng tài liệu, cắt ô 30.000 ký tự), sheet Doc_toi giải thích. Ghi lại lần sao lưu gần nhất, nhắc trên Tổng quan khi quá 7 ngày. Mặc định bỏ nội dung file nhị phân để file nhẹ, có tùy chọn kèm theo','Chờ thử','','Thử với dữ liệu thật, mở bằng Excel kiểm tra từng sheet'],
""")
open('/tmp/w/out106.html','w',encoding='utf8').write(s)
print('ok',len(s))
