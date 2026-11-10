#!/usr/bin/env python3
"""0.28.8: dựng khu «QUAN TRẮC CHI TIẾT» trong sheet So_lieu của biểu mẫu nhựa đường (MC70, 60/70).
Cách dùng: python3 tools/make_nhua_templates.py app/quan-ly-mau-thu-nghiem.html
- đọc DIRECT_B64 trong HTML, thay So_lieu của NHUA_MC70 và NHUA_6070 (ô B5.. trở thành công thức lấy từ phần chi tiết),
- ghi lại DIRECT_B64, in bản đồ khóa -> ô (map) để dán vào mã JS.
Phong cách ô dùng lại các kiểu sẵn có: 100 tiêu đề, 101 nhãn, 102 ô nhập (vàng), 103 ô tự tính (xám), 104 xám đậm, 106 kết quả (xanh)."""
import sys,re,io,zipfile,base64,html,json
HTML=sys.argv[1]
s=open(HTML,encoding='utf8').read()
i0=s.index('const DIRECT_B64=')+len('const DIRECT_B64=');j0=s.index(';\n',i0)
D=json.loads(s[i0:j0])
def esc(t): return html.escape(str(t),quote=False)
def cellxml(ref,kind,v):
    if kind=='h': return '<c r="%s" s="100" t="inlineStr"><is><t>%s</t></is></c>'%(ref,esc(v))
    if kind=='t': return '<c r="%s" s="98" t="inlineStr"><is><t>%s</t></is></c>'%(ref,esc(v))
    if kind=='n': return '<c r="%s" s="99" t="inlineStr"><is><t>%s</t></is></c>'%(ref,esc(v))
    if kind=='l': return '<c r="%s" s="101" t="inlineStr"><is><t>%s</t></is></c>'%(ref,esc(v))
    if kind=='i': return '<c r="%s" s="102"/>'%ref
    if kind=='c': return '<c r="%s" s="103"><f>%s</f><v></v></c>'%(ref,esc(v))
    if kind=='d': return '<c r="%s" s="104"><f>%s</f><v></v></c>'%(ref,esc(v))
    if kind=='r': return '<c r="%s" s="106"><f>%s</f><v></v></c>'%(ref,esc(v))
    raise SystemExit(kind)
def colnum(c):
    n=0
    for ch in c: n=n*26+ord(ch)-64
    return n
def build(spec,res_rows,res_dp,first_res_row,start):
    """spec: danh sách phần; mỗi phần là danh sách hàng (dict: h=chiều cao, c={cột:(kind,giá trị)}). Trả về (xml các hàng, map khóa->ô, ô công thức)"""
    rows=[];mp={};cal=[]
    r=start
    rows.append((r,{'A':('t','QUAN TRẮC CHI TIẾT TỪNG CHỈ TIÊU (ô VÀNG: nhập số liệu đo; ô XÁM: tự tính; ô XANH: kết quả chuyển lên bảng tổng hợp phía trên)')},None));r+=2
    for sec in spec:
        for rw in sec:
            cells=rw['c'];rows.append((r,cells,rw.get('h')))
            for col,(k,v) in cells.items():
                ref=col+str(r)
                if k=='i' and v: mp[v]=ref
                if k in 'cdr': cal.append((ref,k,v))
            r+=1
        r+=1
    return rows,mp,r
def row_xml(r,cells,h):
    cs=sorted(cells.items(),key=lambda x:colnum(x[0]))
    out=[]
    for col,(k,v) in cs:
        if k=='i': out.append(cellxml(col+str(r),'i',v))
        else: out.append(cellxml(col+str(r),k,v))
    at=' ht="%s" customHeight="1"'%h if h else ''
    return '<row r="%d"%s>%s</row>'%(r,at,''.join(out))
def H(*t,h=None): return {'c':{chr(65+i):('h',x) for i,x in enumerate(t)},'h':h}
def L(lbl,**kw):
    c={'A':('l',lbl)}
    for col,(k,v) in kw.items(): c[col[-1]]=(k,v)
    return {'c':c}
def sec_title(t): return {'c':{'A':('t',t)},'h':20}

def tol(cell,diff,ok,res): return ('c','IF(OR(%s="",%s=""),"",IF(%s<=%s,"Đạt","Thử lại"))'%(diff,cell,diff,cell))

# ---------------------------------------------------------------- MC70
def mc70():
    S=[]
    r0=22
    S.append([sec_title('1. ĐỘ NHỚT SAYBOLT FUROL | TCVN 8817-2:2011 | Yêu cầu: 60 ÷ 120 s'),
      H('Thông số thử','Nhiệt độ thử (°C)','Số hiệu nhớt kế / lỗ Furol','Hệ số hiệu chuẩn (trống = 1)','Sai lệch cho phép giữa các lần (%)','Ổn nhiệt mẫu (phút)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','nh_T'),'C':('i','nh_ma'),'D':('i','nh_hs'),'E':('i','nh_tol'),'F':('i','nh_on')}},
      H('Lần đo','Thời gian chảy 60 mL (s)','Nhiệt độ mẫu lúc đo (°C)','Giờ đo',h=30)]+
      [{'c':{'A':('l','Lần %d%s'%(k,' (nếu cần)' if k==3 else '')),'B':('i','nh_t%d'%k),'C':('i','nh_c%d'%k),'D':('i','nh_g%d'%k)}} for k in (1,2,3)]+
      [H('Kết quả tính (tự động)','Trung bình (s)','Chênh lệch lớn nhất (%)','Kiểm tra lặp lại','KẾT QUẢ (s)',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(B{a}:B{b})=0,"",AVERAGE(B{a}:B{b}))'),'C':('c','IF(COUNT(B{a}:B{b})<2,"",(MAX(B{a}:B{b})-MIN(B{a}:B{b}))/AVERAGE(B{a}:B{b})*100)'),
        'D':('c','IF(OR(C{r}="",E{p}=""),"",IF(C{r}<=E{p},"Đạt","Thử lại"))'),'E':('r','IF(B{r}="","",B{r}*IF(D{p}="",1,D{p}))')}}])
    S.append([sec_title('2. ĐIỂM CHỚP CHÁY | TCVN 8818-2:2011 | Yêu cầu: ≥ 38 °C'),
      H('Thông số thử','Thiết bị / cốc thử','Áp suất khí quyển K (kPa)','Hệ số hiệu chỉnh áp suất (°C/kPa), trống = 0,25','Tốc độ gia nhiệt (°C/phút)','Sai lệch cho phép giữa 2 lần (°C)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','cc_tb'),'C':('i','cc_K'),'D':('i','cc_hs'),'E':('i','cc_v'),'F':('i','cc_tol')}},
      H('Lần đo','Nhiệt độ quan sát khi chớp cháy (°C)','Hiệu chỉnh nhiệt kế (°C)','Hiệu chỉnh áp suất (°C)','Nhiệt độ chớp cháy đã hiệu chỉnh (°C)',h=45)]+
      [{'c':{'A':('l','Lần %d'%k),'B':('i','cc_o%d'%k),'C':('i','cc_n%d'%k),'D':('c','IF($C${p}="","",IF($D${p}="",0.25,$D${p})*(101.3-$C${p}))'),'E':('c','IF(OR(B{r}="",D{r}=""),"",B{r}+N(C{r})+D{r})')}} for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 lần (°C)','Kiểm tra lặp lại','KẾT QUẢ (°C) – trung bình',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(E{a}:E{b})<2,"",ABS(E{a}-E{b}))'),'C':('c','IF(OR(B{r}="",F{p}=""),"",IF(B{r}<=F{p},"Đạt","Thử lại"))'),'D':('r','IF(COUNT(E{a}:E{b})=0,"",AVERAGE(E{a}:E{b}))')}}])
    S.append([sec_title('3. HÀM LƯỢNG NƯỚC | TCVN 8818-3:2011 | Yêu cầu: ≤ 0,2 %'),
      H('Thông số thử','Dung môi và thể tích (mL)','Thiết bị hứng nước (độ chia)','Thời gian chưng cất (phút)','Khối lượng riêng nước (g/mL), trống = 1','Sai lệch cho phép giữa 2 lần (%)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','nu_dm'),'C':('i','nu_tb'),'D':('i','nu_tg'),'E':('i','nu_rho'),'F':('i','nu_tol')}},
      H('Lần đo','Lượng mẫu (g hoặc mL)','Thể tích nước thu được (mL)','Hàm lượng nước (%)',h=30)]+
      [{'c':{'A':('l','Lần %d'%k),'B':('i','nu_m%d'%k),'C':('i','nu_v%d'%k),'D':('c','IF(OR(B{r}="",C{r}=""),"",C{r}*IF($E${p}="",1,$E${p})/B{r}*100)')}} for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 lần (%)','Kiểm tra lặp lại','KẾT QUẢ (%) – trung bình',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(D{a}:D{b})<2,"",ABS(D{a}-D{b}))'),'C':('c','IF(OR(B{r}="",F{p}=""),"",IF(B{r}<=F{p},"Đạt","Thử lại"))'),'D':('r','IF(COUNT(D{a}:D{b})=0,"",AVERAGE(D{a}:D{b}))')}}])
    S.append([sec_title('4. THỬ NGHIỆM CHƯNG CẤT | TCVN 8818-4:2011 | Yêu cầu: tới 225 °C ≤ 20 %; tới 260 °C 20 ÷ 60 %; tới 316 °C 65 ÷ 90 %; nhựa còn lại ≥ 55 %'),
      H('Thông số thử','Thể tích mẫu đưa vào bình cất (mL)','Loại bình cất / thiết bị','Tốc độ gia nhiệt (°C/phút)','Áp suất khí quyển (kPa)','Nhiệt độ khi giọt đầu tiên rơi (°C)','Khối lượng cặn thu được (g)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','ca_V'),'C':('i','ca_tb'),'D':('i','ca_v'),'E':('i','ca_P'),'F':('i','ca_gd'),'G':('i','ca_cn')}},
      H('Mốc nhiệt độ chưng cất','Nhiệt độ nhiệt kế đọc được (°C)','Giờ đạt mốc','Thể tích chất lỏng tích lũy (mL)','% so với tổng thể tích ở 360 °C',h=45)]+
      [{'c':{'A':('l',t),'B':('i','ca_n%d'%k),'C':('i','ca_g%d'%k),'D':('i','ca_c%d'%k),'E':('c','IF(OR(D{r}="",$D${q}=""),"",D{r}/$D${q}*100)')}} for k,t in ((1,'Đến 225 °C'),(2,'Đến 260 °C'),(3,'Đến 316 °C'),(4,'Đến 360 °C (tổng thể tích)'))]+
      [H('Kết quả tính (tự động)','Tổng chất lỏng ở 360 °C, gồm cả nước (mL)','Chất lỏng so với thể tích mẫu (%)','HÀM LƯỢNG NHỰA (%) = 100 − ô bên',h=45),
       {'c':{'A':('l',''),'B':('c','IF(D{q}="","",D{q})'),'C':('c','IF(OR(D{q}="",B{p}=""),"",D{q}/B{p}*100)'),'D':('r','IF(C{r}="","",100-C{r})')}}])
    S.append([sec_title('5. ĐỘ NHỚT TUYỆT ĐỐI Ở 60 °C (trên cặn chưng cất) | TCVN 8818-5:2011 | Yêu cầu: 30 ÷ 120 Pa·s'),
      H('Thông số thử','Nhiệt độ bể thử (°C) – yêu cầu 60','Số hiệu ống nhớt kế chân không','Hằng số ống K (Pa·s/s)','Độ chân không (kPa)','Ổn nhiệt trong bể (phút)','Sai lệch cho phép giữa 2 lần (%)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','nt_T'),'C':('i','nt_ma'),'D':('i','nt_K'),'E':('i','nt_P'),'F':('i','nt_tg'),'G':('i','nt_tol')}},
      H('Lần đo','Thời gian chảy qua các vạch (s)','Độ nhớt = K × t (Pa·s)',h=30)]+
      [{'c':{'A':('l','Lần %d'%k),'B':('i','nt_t%d'%k),'C':('c','IF(OR(B{r}="",$D${p}=""),"",$D${p}*B{r})')}} for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 lần (%)','Kiểm tra lặp lại','KẾT QUẢ (Pa·s) – trung bình',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(C{a}:C{b})<2,"",ABS(C{a}-C{b})/AVERAGE(C{a}:C{b})*100)'),'C':('c','IF(OR(B{r}="",G{p}=""),"",IF(B{r}<=G{p},"Đạt","Thử lại"))'),'D':('r','IF(COUNT(C{a}:C{b})=0,"",AVERAGE(C{a}:C{b}))')}}])
    S.append([sec_title('6. ĐỘ KÉO DÀI Ở 25 °C (trên cặn chưng cất) | TCVN 7496:2005 | Yêu cầu: ≥ 100 cm'),
      H('Thông số thử','Nhiệt độ nước (°C)','Tốc độ kéo (cm/phút)','Ổn nhiệt (phút)','Nhiệt độ rót cặn vào khuôn (°C)','Sai lệch cho phép giữa các mẫu (cm)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','kd_T'),'C':('i','kd_v'),'D':('i','kd_tg'),'E':('i','kd_ro'),'F':('i','kd_tol')}},
      H('Mẫu','Độ kéo dài khi đứt (cm)','Tình trạng sợi nhựa','Ghi chú',h=30)]+
      [{'c':{'A':('l','Mẫu %d'%k),'B':('i','kd_%d'%k),'C':('i','kd_s%d'%k),'D':('i','kd_g%d'%k)}} for k in (1,2,3)]+
      [H('Kết quả tính (tự động)','Chênh lệch lớn nhất (cm)','Kiểm tra lặp lại','KẾT QUẢ (cm) – trung bình',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(B{a}:B{b})<2,"",MAX(B{a}:B{b})-MIN(B{a}:B{b}))'),'C':('c','IF(OR(B{r}="",F{p}=""),"",IF(B{r}<=F{p},"Đạt","Thử lại"))'),'D':('r','IF(COUNT(B{a}:B{b})=0,"",AVERAGE(B{a}:B{b}))')}}])
    S.append([sec_title('7. LƯỢNG HÒA TAN TRONG TRICHLOROETHYLENE (trên cặn chưng cất) | TCVN 7500:2005 | Yêu cầu: ≥ 99,0 %'),
      H('Thông số thử','Dung môi và thể tích (mL)','Loại phễu lọc / đệm lọc','Nhiệt độ, thời gian sấy','Sai lệch cho phép giữa 2 lần (%)',h=45),
      {'c':{'A':('l','Nhập số liệu →'),'B':('i','ht_dm'),'C':('i','ht_ph'),'D':('i','ht_say'),'E':('i','ht_tol')}},
      H('Lần đo','Khối lượng mẫu (g)','Khối lượng bì lọc đã sấy (g)','Bì lọc + cặn không tan sau sấy (g)','Cặn không tan (g)','Lượng không tan (%)','Lượng hòa tan (%)',h=45)]+
      [{'c':{'A':('l','Lần %d'%k),'B':('i','ht_m%d'%k),'C':('i','ht_b%d'%k),'D':('i','ht_c%d'%k),'E':('c','IF(OR(C{r}="",D{r}=""),"",D{r}-C{r})'),'F':('c','IF(OR(E{r}="",B{r}=""),"",E{r}/B{r}*100)'),'G':('c','IF(F{r}="","",100-F{r})')}} for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 lần (%)','Kiểm tra lặp lại','KẾT QUẢ (%) – trung bình',h=30),
       {'c':{'A':('l',''),'B':('c','IF(COUNT(G{a}:G{b})<2,"",ABS(G{a}-G{b}))'),'C':('c','IF(OR(B{r}="",E{p}=""),"",IF(B{r}<=E{p},"Đạt","Thử lại"))'),'D':('r','IF(COUNT(G{a}:G{b})=0,"",AVERAGE(G{a}:G{b}))')}}])
    return S

def resolve(S,start):
    """đánh số hàng và thay {r} hàng hiện tại, {p} hàng thông số (hàng nhập ngay trên bảng lần đo), {a}/{b} khối lần đo, {q} hàng cuối (mốc 360)"""
    rows=[];mp={};r=start
    rows.append((r,{'A':('t','QUAN TRẮC CHI TIẾT TỪNG CHỈ TIÊU (ô VÀNG: nhập số liệu đo; ô XÁM: tự tính; ô XANH: kết quả, chuyển lên bảng tổng hợp phía trên)')},None));r+=2
    results=[];bases=[]
    for sec in S:
        base=r;bases.append(base)
        # hàng thông số = hàng thứ 3 của phần (tiêu đề, tiêu đề cột, nhập); khối lần đo = các hàng có khóa dạng lần
        p=base+2
        # tìm khối đo: các hàng liên tiếp có ô 'i' sau hàng tiêu đề thứ hai
        idx=[k for k,rw in enumerate(sec)]
        n=len(sec)
        # hàng kết quả = hàng cuối; khối đo = từ hàng 5 (index 4) đến trước hàng tiêu đề kết quả (index n-2)
        a=base+4;b=base+n-3
        q=b  # hàng cuối khối (mốc 360 cho chưng cất)
        for k,rw in enumerate(sec):
            rr=base+k
            cells={}
            for col,(kind,v) in rw['c'].items():
                if kind in 'cdr':
                    v=v.replace('{r}',str(rr)).replace('{p}',str(p)).replace('{a}',str(a)).replace('{b}',str(b)).replace('{q}',str(q))
                    for kk,vv in enumerate(results): v=v.replace('{R%d}'%kk,vv)
                    if kind=='r': results.append(col+str(rr))
                if kind=='i' and v: mp[v]=col+str(rr)
                cells[col]=(kind,v)
            rows.append((rr,cells,rw.get('h')))
        r=base+n+1
    return rows,mp,results,r,bases

def patch_so_lieu(x,rows,res_cells,res_map,kiem_row=None):
    """x: sheet2.xml (So_lieu). Đặt B5.. thành công thức kết quả; thêm hàng chi tiết; cập nhật dimension, cột."""
    for k,(row,cell) in enumerate(res_map):
        pat=re.compile(r'<c r="B%d" s="102" t="n"></c>'%row)
        assert pat.search(x),'không thấy B%d'%row
        x=pat.sub('<c r="B%d" s="104"><f>%s</f><v></v></c>'%(row,esc(cell)),x)
    xml=''.join(row_xml(r,c,h) for r,c,h in rows)
    x=x.replace('</sheetData>',xml+'</sheetData>')
    last=max(r for r,_,_ in rows)
    x=re.sub(r'<dimension ref="[^"]+"/>','<dimension ref="A1:H%d"/>'%last,x)
    x=x.replace('<col width="10" customWidth="1" style="65" min="6" max="6"/></cols>','<col width="16" customWidth="1" style="65" min="6" max="6"/><col width="16" customWidth="1" style="65" min="7" max="8"/></cols>')
    return x

def run(code,S,res_map_fn):
    z=zipfile.ZipFile(io.BytesIO(base64.b64decode(D[code])))
    files={n:z.read(n) for n in z.namelist()}
    x=files['xl/worksheets/sheet2.xml'].decode('utf8')
    rows,mp,results,end,bases=resolve(S,22)
    rm=res_map_fn(results,bases)
    x=patch_so_lieu(x,rows,results,rm)
    files['xl/worksheets/sheet2.xml']=x.encode('utf8')
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED) as zo:
        for n,b in files.items(): zo.writestr(n,b)
    D[code]=base64.b64encode(buf.getvalue()).decode()
    return mp,results

if __name__=='__main__':
    def rm_mc70(res,bases):
        b4=bases[3]
        # B5..B14: nh, cc, nu, c225, c260, c316, cn, nt, kd, ht
        cells=[res[0],res[1],res[2],'E%d'%(b4+4),'E%d'%(b4+5),'E%d'%(b4+6),res[3],res[4],res[5],res[6]]
        dps=['nh','cc','nu','c225','c260','c316','cn','nt','kd','ht']
        return [(5+k,'IF(%s="","",ROUND(%s,dp_%s))'%(c,c,dps[k])) for k,c in enumerate(cells)]
    out={}
    old={}
    if 'const NHUA_MAP=' in s:
        a=s.index('const NHUA_MAP=')+len('const NHUA_MAP=');old=json.loads(s[a:s.index(';\n',a)])
    z0=zipfile.ZipFile(io.BytesIO(base64.b64decode(D['NHUA_MC70'])))
    if b'<c r="B5" s="102" t="n"></c>' in z0.read('xl/worksheets/sheet2.xml'):
        mp,res=run('NHUA_MC70',mc70(),rm_mc70);out['NHUA_MC70']=mp
    else: out['NHUA_MC70']=old['NHUA_MC70']
    try:
        import make_nhua_6070 as m6
        mp2,res2=m6.run(sys.modules[__name__]);out['NHUA_6070']=mp2
    except ImportError:
        pass
    s2=s[:i0]+json.dumps(D)+s[j0:]
    mj='const NHUA_MAP='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';\n'
    if 'const NHUA_MAP=' in s2:
        a=s2.index('const NHUA_MAP=');b=s2.index(';\n',a)+2;s2=s2[:a]+mj+s2[b:]
    else:
        e=s2.index(';\n',s2.index('const DIRECT_B64='))+2;s2=s2[:e]+mj+s2[e:]
    open(HTML,'w',encoding='utf8').write(s2)
    json.dump(out,open('/tmp/nhua_map.json','w'),ensure_ascii=False,indent=0)
    print('Đã cập nhật DIRECT_B64:',{k:len(v) for k,v in out.items()})
