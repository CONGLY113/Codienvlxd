import re
# ---- bảng kê: bkLines mới (đơn vị tổ/điểm, giá theo chỉ tiêu) + bảng giá mới
a=s.index('function bkLines(groups,chiXong,old){');b=s.index('\nfunction bkTotals(b){',a)
s=s[:a]+open('/tmp/w/p/bk_prices.js',encoding='utf8').read().rstrip('\n')+s[b:]
a=s.index('function bkPrices(box,canEdit){');b=s.index('\nfunction bkPendingGroups(){',a)
s=s[:a]+open('/tmp/w/p/bk_prices2.js',encoding='utf8').read().rstrip('\n')+s[b:]
rep("const BK={tab:'bangke',draft:null,dirty:false,","const BK={tab:'bangke',draft:null,dirty:false,pdirty:false,")
rep("S.bgia=((list.find(x=>x.id==='bang_gia')||{}).gia)||{};","{const bg=list.find(x=>x.id==='bang_gia')||{};S.bgia=bg.gia||{};S.bgiaCt=bg.ct||{};S.bgiaThem=Array.isArray(bg.them)?bg.them:[];}")
rep("if(BK.draft&&BK.dirty&&k!=='bangke'){toast('Lưu hoặc đóng bảng kê đang sửa trước.','bad');return;}","if(BK.draft&&BK.dirty&&k!=='bangke'){toast('Lưu hoặc đóng bảng kê đang sửa trước.','bad');return;}if(BK.pdirty&&BK.tab==='banggia'&&k!=='banggia'){toast('Bấm Lưu bảng giá trước khi chuyển tab.','bad');return;}")
rep("update(){if(BK.draft)return;","update(){if(BK.draft||(BK.tab==='banggia'&&BK.pdirty))return;")
rep("(l.sl!==l.n?' · số lượng đã sửa tay':'')","(l.sl!==(l.q0!=null?l.q0:l.n)?' · số lượng đã sửa tay':'')+(l.est?' · '+l.est+' mẫu chưa nộp kết quả, tạm tính số '+((BK_UNIT[l.loai]||{}).u||'')+' theo mặc định':'')")
rep("b.dong.forEach(l=>{if(!l.tay)l.don_gia=(S.bgia&&+S.bgia[l.loai])||l.don_gia;});","b.dong.forEach(l=>{if(!l.tay)l.don_gia=bkPriceFor(l)||l.don_gia;});")
# nút thêm dòng từ đơn giá phát sinh
rep("    h('button',{class:'btn',disabled:locked,onclick:()=>{b.dong.push({k:'tay|'+rid(),ten:'',loai:'',sl:1,n:1,xong:1,don_gia:0,ma:[],tay:true});mark();rowsBuild();refresh();}},'Thêm dòng'),",
"""    h('button',{class:'btn',disabled:locked,onclick:()=>{b.dong.push({k:'tay|'+rid(),ten:'',loai:'',sl:1,n:1,xong:1,don_gia:0,ma:[],tay:true});mark();rowsBuild();refresh();}},'Thêm dòng'),
    (S.bgiaThem&&S.bgiaThem.length)?(()=>{const sel=h('select',{'aria-label':'Thêm từ đơn giá phát sinh','data-act':'bk-ps',disabled:locked,style:'width:230px',onchange:()=>{const t=S.bgiaThem.find(x=>x.id===sel.value);sel.value='';if(!t)return;b.dong.push({k:'tay|'+rid(),ten:t.ten,loai:'',sl:1,n:1,xong:1,don_gia:+t.gia||0,ma:[],tay:true});mark();rowsBuild();refresh();}},h('option',{value:''},'Thêm từ đơn giá phát sinh…'),S.bgiaThem.map(t=>h('option',{value:t.id},t.ten+(t.gia?' · '+fmtN(t.gia)+' đ':''))));return sel;})():null,""")
rep("window.__ptn={S,bkLines,","window.__ptn={S,BK_UNIT,bkQty,bkPriceFor,bkPriceCatalog,bkParsePrices,bkPricesXlsx,bkLines,")
# nhật ký
rep("const BUILD_LOG=[\n","""const BUILD_LOG=[
['05/11/2026','B10','Claude','Tab Bảng giá bố trí lại theo cột TT, Tên mẫu và chỉ tiêu, Đơn giá: đơn giá theo loại mẫu (giá trọn) và theo từng chỉ tiêu; nút tải file Excel đơn giá lên hệ thống (nhận theo cột Mã hoặc theo tên, dòng lạ vào đơn giá phát sinh); nút Thêm đơn giá để dự phòng mẫu phát sinh; tải bảng giá hiện tại ra Excel làm file mẫu. Bảng kê: nén bê tông tính theo tổ 3 viên, nén vữa theo tổ 6 viên, đo K theo điểm đo, loại mẫu không có giá trọn thì tính theo chỉ tiêu; thêm dòng nhanh từ đơn giá phát sinh','Chờ thử','Số viên, số điểm lấy từ kết quả đã nộp; mẫu chưa nộp tạm tính 3 viên (bê tông), 6 viên (vữa), 3 điểm (đo K) và ghi rõ trên bảng kê'],
['05/11/2026','B9','Claude','Thêm 9 loại mẫu: nhựa đường 60/70, nhựa đường lỏng MC70, gạch bê tông đặc, gạch bê tông rỗng, bu lông, đầm chặt cát, cấp phối đá dăm loại I và II, đá dăm 20x70. Mỗi loại một biểu mẫu Excel 5 sheet, tự tính và đối chiếu khi nộp','Chờ thử','Các ngưỡng yêu cầu lấy theo biểu mẫu gốc, xem bảng câu hỏi xác nhận'],
""")
rep("BK.tab=k;render();}},l))));","BK.tab=k;BK.pnote='';render();}},l))));")
