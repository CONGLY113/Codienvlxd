import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
# bkPay
i=s.index("function bkPay(b){"); j=s.index("function bkStLabel")
seg=s[i:j]; a="return{tt:T,da,cho,con,ngay,"; assert seg.count(a)==1
seg=seg.replace(a,"const kc=bkSum(ok.filter(x=>x.ht==='kc'),x=>x.so_tien);\n  return{tt:T,da,kc,cho,con,ngay,")
s=s[:i]+seg+s[j:]
rep("const HT_L={ck:'Chuyển khoản',tm:'Tiền mặt'};","const HT_L={ck:'Chuyển khoản',tm:'Tiền mặt',kc:'Khoán chi'};")
rep("h('option',{value:'ck'},'Chuyển khoản về tài khoản cơ quan'),h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ'));\n  const ngay=h('input',{type:'date',value:todayISO(),'aria-label':'Ngày tiền về hoặc ngày nộp'}),ct=","h('option',{value:'ck'},'Chuyển khoản về tài khoản cơ quan'),h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ'),h('option',{value:'kc'},'Khoán chi (đối trừ vào khoản chi)'));\n  const ngay=h('input',{type:'date',value:todayISO(),'aria-label':'Ngày tiền về hoặc ngày nộp'}),ct=")
rep("P.tt,P.da,P.con,fd(b.ngay),P.ngay?fd(P.ngay):'',(bkStLabel(b)||[''])[0]];});","P.tt,P.da-P.kc,P.kc,P.con,fd(b.ngay),P.ngay?fd(P.ngay):'',(bkStLabel(b)||[''])[0]];});")
rep("'Giá trị (đ)','Đã thanh toán (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái'],rows,{num:[4,5,6],sum:[4,5,6],widths:[6,34,40,18,16,18,16,14,16,26]}","'Giá trị (đ)','Đã thanh toán (đ)','Thanh toán khoán chi (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái'],rows,{num:[4,5,6,7],sum:[4,5,6,7],widths:[6,34,40,18,16,18,20,16,14,16,26]}")
rep("'Giá trị (đ)','Đã thanh toán (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái',''].map(","'Giá trị (đ)','Đã thanh toán (đ)','Khoán chi (đ)','Còn lại (đ)','Ngày lập kê','Ngày thanh toán','Trạng thái',''].map(")
rep("h('td',{class:'num'},fmtN(P.tt)),h('td',{class:'num'},fmtN(P.da)),h('td',{class:'num'},fmtN(P.con)),h('td',null,fd(b.ngay)),h('td',{title:ds}","h('td',{class:'num'},fmtN(P.tt)),h('td',{class:'num'},fmtN(P.da-P.kc)),h('td',{class:'num'},fmtN(P.kc)),h('td',{class:'num'},fmtN(P.con)),h('td',null,fd(b.ngay)),h('td',{title:ds}")
rep("h('td',{class:'num','data-label':'Đã thanh toán (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).da)))),","h('td',{class:'num','data-label':'Đã thanh toán (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).da-bkPay(b).kc)))),h('td',{class:'num','data-label':'Khoán chi (đ)'},h('b',null,fmtN(bkSum(l,b=>bkPay(b).kc)))),")
rep("colspan:'12'","colspan:'13'")
rep("[['Giá trị',P.tt],['Đã thanh toán',P.da],['Chờ xác nhận',P.cho],['Còn lại',P.con]]","[['Giá trị',P.tt],['Đã thanh toán',P.da-P.kc],['Khoán chi',P.kc],['Chờ xác nhận',P.cho],['Còn lại',P.con]]")
rep("const BUILD='0.27.3 · 07/11/2026';","const BUILD='0.27.4 · 07/11/2026';")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['07/11/2026','B25','Claude','Thêm hình thức thanh toán Khoán chi vào module Thanh toán của phòng Cơ điện vật liệu xây dựng: lựa chọn khi đề nghị, cột Khoán chi trong Tổng hợp thanh toán và file Excel. Khoán chi được tính vào phần đã thanh toán của bảng kê.','Đã kiểm thử'],\n")
open(F,'w',encoding='utf-8').write(s)
