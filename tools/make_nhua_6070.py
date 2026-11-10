"""0.28.8: khu «QUAN TRẮC CHI TIẾT» của nhựa đường đặc 60/70 theo Nhật ký quan trắc gốc (8 chỉ tiêu, mỗi chỉ tiêu có lần đo riêng)."""
def spec(m):
    H,sec_title=m.H,m.sec_title
    def I(col,key): return (col,('i',key))
    def row(lbl,**kw):
        c={'A':('l',lbl)}
        for col,v in kw.items(): c[col]=v
        return {'c':c}
    S=[]
    S.append([sec_title('1. ĐỘ KIM LÚN Ở 25 °C, 100 g, 5 s | TCVN 7495:2005 | Yêu cầu: 60 ÷ 70 (0,1 mm)'),
      H('Thông số thử','Nhiệt độ thử (°C)','Khối lượng kim + gá (g)','Thời gian đo (s)','Sai lệch cho phép giữa các lần trong cốc (0,1 mm)','Thiết bị / số hiệu máy',h=45),
      row('Nhập số liệu →',B=('i','kim_T'),C=('i','kim_m'),D=('i','kim_tg'),E=('i','kim_tol'),F=('i','kim_tb')),
      H('Mẫu','Lần đo 1 (0,1 mm)','Lần đo 2 (0,1 mm)','Lần đo 3 (0,1 mm)','Trung bình cốc (0,1 mm)','Chênh lệch lớn nhất (0,1 mm)',h=45)]+
      [row('Cốc mẫu %d'%k,B=('i','kim_%d1'%k),C=('i','kim_%d2'%k),D=('i','kim_%d3'%k),
           E=('c','IF(COUNT(B{r}:D{r})=0,"",AVERAGE(B{r}:D{r}))'),F=('c','IF(COUNT(B{r}:D{r})<2,"",MAX(B{r}:D{r})-MIN(B{r}:D{r}))')) for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch lớn nhất (0,1 mm)','Kiểm tra lặp lại','KẾT QUẢ (0,1 mm) – trung bình',h=30),
       row('',B=('c','IF(COUNT(F{a}:F{b})=0,"",MAX(F{a}:F{b}))'),C=('c','IF(OR(B{r}="",E{p}=""),"",IF(B{r}<=E{p},"Đạt","Thử lại"))'),D=('r','IF(COUNT(E{a}:E{b})=0,"",AVERAGE(E{a}:E{b}))'))])
    S.append([sec_title('2. ĐỘ KÉO DÀI Ở 25 °C, 5 cm/phút | TCVN 7496:2005 | Yêu cầu: ≥ 100 cm'),
      H('Thông số thử','Nhiệt độ nước (°C)','Tốc độ kéo (cm/phút)','Ổn nhiệt (phút)',h=30),
      row('Nhập số liệu →',B=('i','kd_T'),C=('i','kd_v'),D=('i','kd_tg')),
      H('Mẫu','Độ kéo dài khi đứt (cm)','Tình trạng sợi nhựa (đứt đồng đều / chạm đáy / nổi lên mặt nước)',h=45)]+
      [row('Mẫu %d'%k,B=('i','kd_%d'%k),C=('i','kd_s%d'%k)) for k in (1,2,3)]+
      [H('Kết quả tính (tự động)','Chênh lệch lớn nhất (cm)','KẾT QUẢ (cm) – trung bình',h=30),
       row('',B=('c','IF(COUNT(B{a}:B{b})<2,"",MAX(B{a}:B{b})-MIN(B{a}:B{b}))'),C=('r','IF(COUNT(B{a}:B{b})=0,"",AVERAGE(B{a}:B{b}))'))])
    S.append([sec_title('3. ĐIỂM HÓA MỀM – DỤNG CỤ VÒNG VÀ BI | TCVN 7497:2005 | Yêu cầu: ≥ 46 °C'),
      H('Thông số thử','Môi trường gia nhiệt (nước / glycerin)','Tốc độ gia nhiệt (°C/phút)','Sai lệch cho phép giữa 2 vòng (°C)',h=45),
      row('Nhập số liệu →',B=('i','hm_mt'),C=('i','hm_v'),D=('i','hm_tol')),
      H('Mẫu','Nhiệt độ bi chạm tấm đáy (°C)','Hiệu chỉnh nhiệt kế (°C)','Kết quả sau hiệu chỉnh (°C)',h=45)]+
      [row('Vòng %d'%k,B=('i','hm_o%d'%k),C=('i','hm_n%d'%k),D=('c','IF(B{r}="","",B{r}+N(C{r}))')) for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 vòng (°C)','Kiểm tra lặp lại','KẾT QUẢ (°C) – trung bình',h=30),
       row('',B=('c','IF(COUNT(D{a}:D{b})<2,"",ABS(D{a}-D{b}))'),C=('c','IF(OR(B{r}="",D{p}=""),"",IF(B{r}<=D{p},"Đạt","Thử lại"))'),D=('r','IF(COUNT(D{a}:D{b})=0,"",AVERAGE(D{a}:D{b}))'))])
    S.append([sec_title('4. ĐIỂM CHỚP CHÁY – CỐC HỞ CLEVELAND | TCVN 7498:2005 | Yêu cầu: ≥ 232 °C'),
      H('Thông số thử','Thiết bị / cốc thử','Áp suất khí quyển K (kPa)','Hệ số hiệu chỉnh áp suất (°C/kPa), trống = 0,25','Tốc độ gia nhiệt giai đoạn cuối (°C/phút)',h=45),
      row('Nhập số liệu →',B=('i','cc_tb'),C=('i','cc_K'),D=('i','cc_hs'),E=('i','cc_v')),
      H('Lần đo','Nhiệt độ quan sát khi chớp cháy (°C)','Hiệu chỉnh áp suất (°C)','Nhiệt độ chớp cháy đã hiệu chỉnh (°C)',h=45),
      row('Kết quả',B=('i','cc_o'),C=('c','IF($C${p}="","",IF($D${p}="",0.25,$D${p})*(101.3-$C${p}))'),D=('c','IF(OR(B{r}="",C{r}=""),"",B{r}+C{r})')),
      H('Kết quả tính (tự động)','KẾT QUẢ (°C)',h=30),
      row('',B=('r','IF(D{a}="","",D{a})'))])
    S.append([sec_title('5. TỶ LỆ KIM LÚN SAU GIA NHIỆT 5 GIỜ Ở 163 °C | TCVN 7495:2005 | Yêu cầu: ≥ 75 % (thông số gia nhiệt dùng chung cho chỉ tiêu 6)'),
      H('Thông số gia nhiệt','Phương pháp thử (TCVN …)','Giờ đưa mẫu vào tủ sấy','Giờ lấy mẫu ra','Nhiệt độ tủ sấy thực tế (°C)','Tốc độ quay giá mẫu (vòng/phút)',h=45),
      row('Nhập số liệu →',B=('i','tk_pp'),C=('i','tk_gv'),D=('i','tk_gr'),E=('i','tk_nd'),F=('i','tk_qv')),
      H('Lần đo','Kim lún sau gia nhiệt (0,1 mm)',h=30)]+
      [row('Lần %d'%k,B=('i','tk_%d'%k)) for k in (1,2,3)]+
      [H('Kết quả tính (tự động)','Kim lún sau gia nhiệt TB (0,1 mm)','Kim lún ban đầu – mục 1 (0,1 mm)','Chênh lệch lớn nhất (0,1 mm)','KẾT QUẢ tỷ lệ (%) = sau / ban đầu × 100',h=45),
       row('',B=('c','IF(COUNT(B{a}:B{b})=0,"",AVERAGE(B{a}:B{b}))'),C=('c','IF({R0}="","",ROUND({R0},dp_kim))'),D=('c','IF(COUNT(B{a}:B{b})<2,"",MAX(B{a}:B{b})-MIN(B{a}:B{b}))'),
           E=('r','IF(OR(B{r}="",C{r}="",C{r}=0),"",B{r}/C{r}*100)'))])
    S.append([sec_title('6. TỔN THẤT KHỐI LƯỢNG SAU GIA NHIỆT 5 GIỜ Ở 163 °C | TCVN 7499:2005 | Yêu cầu: ≤ 0,5 %'),
      H('Thông số thử','Phương pháp thử (TCVN …)','Cân (độ chia, g)',h=30),
      row('Nhập số liệu →',B=('i','tt_pp'),C=('i','tt_cb')),
      H('Mẫu','Khối lượng mẫu + khay trước (g)','Khối lượng mẫu + khay sau (g)','Khối lượng khay (g)','Tổn thất (%) = (trước − sau) / (trước − khay) × 100',h=45)]+
      [row('Mẫu %d'%k,B=('i','tt_a%d'%k),C=('i','tt_b%d'%k),D=('i','tt_k%d'%k),E=('c','IF(OR(B{r}="",C{r}="",D{r}=""),"",IF(B{r}=D{r},"",(B{r}-C{r})/(B{r}-D{r})*100))')) for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 mẫu (%)','KẾT QUẢ (%) – trung bình',h=30),
       row('',B=('c','IF(COUNT(E{a}:E{b})<2,"",ABS(E{a}-E{b}))'),C=('r','IF(COUNT(E{a}:E{b})=0,"",AVERAGE(E{a}:E{b}))'))])
    W='(0.999842594+6.793952E-05*F{r}-9.09529E-06*F{r}^2+1.001685E-07*F{r}^3-1.120083E-09*F{r}^4+6.536332E-12*F{r}^5)'
    S.append([sec_title('7. KHỐI LƯỢNG RIÊNG Ở 25 °C – BÌNH TỶ TRỌNG | Yêu cầu: 1,00 ÷ 1,05 g/cm³'),
      H('Thông số thử','Phương pháp thử (TCVN …)','Sai lệch cho phép giữa 2 lần (g/cm³)',h=45),
      row('Nhập số liệu →',B=('i','kr_pp'),C=('i','kr_tol')),
      H('Lần đo','A – Khối lượng bình khô (g)','B – Khối lượng bình + nước (g)','C – Khối lượng bình + nhựa (g)','D – Khối lượng bình + nhựa + nước (g)','Nhiệt độ thử (°C)','Tỷ trọng = (C − A) / [(B − A) − (D − C)]','Khối lượng riêng (g/cm³) = tỷ trọng × ρ nước (theo nhiệt độ thử)',h=75)]+
      [row('Lần %d'%k,B=('i','kr_A%d'%k),C=('i','kr_B%d'%k),D=('i','kr_C%d'%k),E=('i','kr_D%d'%k),F=('i','kr_T%d'%k),
           G=('c','IF(COUNT(B{r}:E{r})<4,"",IF((C{r}-B{r})-(E{r}-D{r})=0,"",(D{r}-B{r})/((C{r}-B{r})-(E{r}-D{r}))))'),
           H=('c','IF(OR(G{r}="",F{r}=""),"",G{r}*'+W+')')) for k in (1,2)]+
      [H('Kết quả tính (tự động)','Chênh lệch giữa 2 lần (g/cm³)','Kiểm tra lặp lại','KẾT QUẢ (g/cm³) – trung bình',h=30),
       row('',B=('c','IF(COUNT(H{a}:H{b})<2,"",ABS(H{a}-H{b}))'),C=('c','IF(OR(B{r}="",C{p}=""),"",IF(B{r}<=C{p},"Đạt","Thử lại"))'),D=('r','IF(COUNT(H{a}:H{b})=0,"",AVERAGE(H{a}:H{b}))'))])
    S.append([sec_title('8. ĐỘ DÍNH BÁM VỚI ĐÁ | Yêu cầu: cấp ≥ 3'),
      H('Thông số thử','Phương pháp thử (TCVN …)','Loại đá, nguồn gốc, cỡ hạt','Điều kiện thử (nhiệt độ, thời gian ngâm)','Quan sát diện tích màng nhựa còn bao phủ đá',h=45),
      row('Nhập số liệu →',B=('i','db_pp'),C=('i','db_da'),D=('i','db_dk'),E=('i','db_qs')),
      H('Đánh giá','Cấp (1 ÷ 5)',h=20),
      row('Người đánh giá 1',B=('i','db_1')),row('Người đánh giá 2',B=('i','db_2')),row('Cấp kết luận (người thử nhập)',B=('i','db_kl')),
      H('Kết quả (tự động)','KẾT QUẢ (cấp)',h=30),
      row('',B=('r','IF(B{b}="","",B{b})'))])
    return S
def run(m):
    keys=['kim','kd','hm','cc','tk','tt','kr','db']
    def rm(res,bases):
        return [(5+k,'IF(%s="","",ROUND(%s,dp_%s))'%(c,c,keys[k])) for k,c in enumerate(res)]
    return m.run('NHUA_6070',spec(m),rm)
