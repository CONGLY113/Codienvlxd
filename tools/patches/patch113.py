import sys,re
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:60],s.count(a)); s=s.replace(a,b)
rep("const BUILD='0.27.2 · 06/11/2026';","const BUILD='0.27.3 · 07/11/2026';")
# dvPay: khoán chi
rep("function dvPay(b){\n  const T=dvTotals(b).tt","function dvPay(b){\n  const T0=0;const T=dvTotals(b).tt")
i=s.index("function dvPay(b){"); j=s.index("function dvStLabel")
seg=s[i:j]; a="return{tt:T,da,cho,con,ngay,st:"; assert seg.count(a)==1
seg=seg.replace(a,"const kc=bkSum(ok.filter(x=>x.ht==='kc'),x=>x.so_tien);\n  return{tt:T,da,kc,tien:da-kc,cho,con,ngay,st:")
s=s[:i]+seg+s[j:]
# HT_L in dv region -> DV_HT
i=s.index("function dvPayDlg(b){"); j=s.index("function dvConfirmPay")
j=s.index("\n}\n",j)+3
seg=s[i:j].replace("HT_L[","DV_HT[")
seg=seg.replace("h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ'))","h('option',{value:'tm'},'Nộp tiền mặt cho thủ quỹ'),h('option',{value:'kc'},'Khoán chi (đối trừ vào khoản chi)'))")
assert "value:'kc'" in seg
s=s[:i]+"const DV_HT={ck:'Chuyển khoản',tm:'Tiền mặt',kc:'Khoán chi'};\n"+seg+s[j:]
# editor payment table
rep("h('td',null,HT_L[p.ht||'ck']),h('td',{class:'num'},fmtN(p.so_tien)+' đ'),h('td',null,p.ct||'')","h('td',null,DV_HT[p.ht||'ck']),h('td',{class:'num'},fmtN(p.so_tien)+' đ'),h('td',null,p.ct||'')")
# summary
fn=r'''
/* ---- tổng hợp thanh toán (0.27.3) */
function dvSumRows(room,f){
  const q=dvNorm1(f.q||'').split(' ').filter(Boolean);
  return dvAllBk().filter(b=>b.phong===room&&b.trang_thai==='da_duyet').map(b=>({b,P:dvPay(b)})).filter(({b,P})=>{
    if(f.from&&b.ngay<f.from)return false;if(f.to&&b.ngay>f.to)return false;
    if(f.st==='chua'&&P.con<=0)return false;if(f.st==='da'&&P.da-P.kc<=0)return false;if(f.st==='kc'&&P.kc<=0)return false;
    const t=dvNorm1([b.so,b.khach.ten,b.cong_trinh,b.khach.mst].join(' '));return q.every(w=>t.includes(w));
  }).sort((a,b)=>(b.b.ngay||'').localeCompare(a.b.ngay||'')||(b.b.so||'').localeCompare(a.b.so||''));
}
function dvSummary(box){
  const rs=dvScope('bk');
  if(!rs.length){box.append(emptyState('Chưa có phòng','Bạn chưa thuộc phòng nào lập bảng kê dịch vụ.'));return;}
  DVS.sf=DVS.sf||{q:'',st:'',from:'',to:''};const f=DVS.sf;
  rs.forEach(room=>{
    const body=h('tbody'),pipe=h('div',{class:'pipe'}),xl=h('button',{class:'btn','data-act':'dv-sum-xlsx'},'Xuất Excel');let L=[];
    const draw=()=>{L=dvSumRows(room,f);const T=L.reduce((a,x)=>({c:a.c+x.P.con,d:a.d+x.P.da-x.P.kc,k:a.k+x.P.kc,t:a.t+x.P.tt}),{c:0,d:0,k:0,t:0});
      body.replaceChildren(...L.map(({b,P},i)=>h('tr',null,h('td',null,i+1),h('td',null,h('b',null,b.so)),h('td',null,b.khach.ten),h('td',null,b.cong_trinh||''),h('td',null,fd(b.ngay)),h('td',{class:'num'},fmtN(P.con)),h('td',{class:'num'},fmtN(P.da-P.kc)),h('td',{class:'num'},fmtN(P.kc)),h('td',null,h('button',{class:'btn sm','data-act':'dv-open',onclick:()=>dvOpen(b)},'Mở')))),
        ...(L.length?[h('tr',{class:'bk-grp'},h('td'),h('td',{colspan:'4'},h('b',null,'Cộng '+L.length+' bảng kê')),h('td',{class:'num'},h('b',null,fmtN(T.c))),h('td',{class:'num'},h('b',null,fmtN(T.d))),h('td',{class:'num'},h('b',null,fmtN(T.k))),h('td'))]:[]));
      pipe.replaceChildren(...[['Bảng kê',L.length],['Giá trị',fmtN(T.t)+' đ'],['Chưa thanh toán',fmtN(T.c)+' đ'],['Đã thanh toán',fmtN(T.d)+' đ'],['Thanh toán khoán chi',fmtN(T.k)+' đ']].map(([k,v])=>h('div',null,h('b',null,v),h('span',null,k))));
      xl.disabled=!L.length;};
    xl.onclick=async()=>{const T=L.reduce((a,x)=>({c:a.c+x.P.con,d:a.d+x.P.da-x.P.kc,k:a.k+x.P.kc}),{c:0,d:0,k:0});
      saveBytes('Tong_hop_thanh_toan_'+room+'_'+todayISO()+'.xlsx',await bkTblXlsx('TỔNG HỢP THANH TOÁN · '+dvRoomName(room).toUpperCase(),'Tính đến '+fd(todayISO())+(f.from||f.to?' · lập từ '+(f.from?fd(f.from):'…')+' đến '+(f.to?fd(f.to):'…'):''),['TT','Mã bảng kê','Khách hàng','Công trình, cơ sở','Ngày lập','Chưa thanh toán','Đã thanh toán','Thanh toán khoán chi'],L.map(({b,P},i)=>[i+1,b.so,b.khach.ten,b.cong_trinh||'',fd(b.ngay),P.con,P.da-P.kc,P.kc]),{widths:[6,22,38,38,13,18,18,20],num:[5,6,7],sum:[5,6,7],sheet:'Tong hop'}));};
    const q=h('input',{type:'text',placeholder:'Tìm mã, khách hàng, công trình','aria-label':'Tìm',value:f.q,oninput:e=>{f.q=e.target.value;draw();}}),
      st=h('select',{'aria-label':'Lọc tình trạng',onchange:e=>{f.st=e.target.value;draw();}},[['','Tất cả'],['chua','Còn chưa thanh toán'],['da','Có thanh toán'],['kc','Có khoán chi']].map(([v,t])=>h('option',{value:v},t))),
      d0=h('input',{type:'date','aria-label':'Từ ngày',value:f.from,onchange:e=>{f.from=e.target.value;draw();}}),d1=h('input',{type:'date','aria-label':'Đến ngày',value:f.to,onchange:e=>{f.to=e.target.value;draw();}});st.value=f.st;
    draw();
    box.append(h('div',{class:'card stack','data-sec':'sum-'+room},h('div',{class:'card-h'},h('div',null,h('h2',null,'Tổng hợp thanh toán · '+dvRoomName(room)),h('p',{class:'muted small'},'Các bảng kê đã duyệt. Đã thanh toán là tiền thủ quỹ đã xác nhận; khoán chi là phần đối trừ vào khoản chi, không thu tiền.')),xl),
      h('div',{class:'row',style:'gap:8px;flex-wrap:wrap'},q,st,h('label',{class:'small'},'Từ ',d0),h('label',{class:'small'},'Đến ',d1)),pipe,
      h('div',{class:'tbl-wrap'},h('table',{class:'bk-sum'},h('thead',null,h('tr',null,['TT','Mã bảng kê','Khách hàng','Công trình, cơ sở','Ngày lập','Chưa thanh toán','Đã thanh toán','Thanh toán khoán chi',''].map(x=>h('th',null,x)))),body))));});
}
'''
rep("/* ---- bảng giá */\nfunction dvPrices(box){",fn+"/* ---- bảng giá */\nfunction dvPrices(box){")
rep("bkOk?[['no','Công nợ'],['cn','Giấy chứng nhận']]:[]","bkOk?[['no','Công nợ'],['th','Tổng hợp thanh toán'],['cn','Giấy chứng nhận']]:[]")
rep("else if(DVS.tab==='no')dvDebt(box);","else if(DVS.tab==='no')dvDebt(box);else if(DVS.tab==='th')dvSummary(box);")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['07/11/2026','B24','Claude','Thêm tab Tổng hợp thanh toán cho các phòng (mã bảng kê, khách hàng, công trình, ngày lập, chưa thanh toán, đã thanh toán, khoán chi; lọc, cộng, xuất Excel). Thêm hình thức thanh toán Khoán chi. Không đổi luồng cũ.','Đã kiểm thử'],\n")
open(F,'w',encoding='utf-8').write(s)
