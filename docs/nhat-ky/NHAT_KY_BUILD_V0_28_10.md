# Nhật ký build 0.28.10 (11/11/2026)
Nạp ba file Thong_so_form: Nén vữa, Đo K phễu rót cát (file «Do_K_»), Đo K dao vòng (file «Do_K_cat»).

## 1. Nén mẫu vữa (Phieu_KQ)
- Cột: A lề 1,5 · B 8,99 · C 7,87 · D 5,99 · E 10,24 · viên 1–6 từ cột F, mỗi viên 8,62 (cột viên 7–9 chỉ hiện khi sheet có đủ viên). Times New Roman 12.
- Nhãn từ cột B, giá trị từ cột D; bảng B21:K29 (nhãn B:E, đơn vị cột E, số liệu từ cột F), viền ngoài thin, viền trong hair.
- Quy cách mẫu, Mác thiết kế (đơn vị N/mm2), Phương pháp TCVN 3121-11:2003, Thiết bị «Máy nén, thước kẹp, thước lá.», Kích thước mẫu 40x40x160(mm) đúng như form. Dòng Thiết bị hiện lại (trước đó ẩn).
- Nhận xét tách 3 ô như form: «Cường độ nén đạt» | số % | «% so với mác thiết kế»; tên vùng in_nhan_xet chuyển sang ô số %.
- Thêm dòng chức danh TƯ VẤN GIÁM SÁT / ĐƠN VỊ THI CÔNG, khoảng ký, «N mẫu» (N = số viên có kết quả). Khối ngày và tên người ký của phòng thí nghiệm giữ ở dưới như cũ.
- Bê tông (NEN_BT) không đổi (chưa có thông số riêng).
## 2. Đo K phễu rót cát và dao vòng (Phieu_KQ)
- Phễu rót cát: 13 cột A:M (A 1,13 · B 3,99 · C 12,85 · D 6,7 · E 6,85 · F 7,28 · G 6,85 · H 7,99 · I 7,42 · J 8,41 · K 7,85 · L 8,56 · M 8,56). Dao vòng: 11 cột A:K (1,13 · 3,99 · 16,28 · 8,14 · 7,85 · 9,28 · 9,85 · 9,56 · 8,7 · 8,99 · 9,99). Tổng rộng vượt 90 ký tự nên toàn phiếu thu nhỏ đều khoảng 5 % để vừa A4.
- Khung thông tin: Chỉ tiêu thử nghiệm «Đo hệ số đầm nén chặt (K)», nhãn cột A tràn sang B–C, giá trị từ cột D; thêm dòng Ngày thử nghiệm; bỏ dòng Tên mẫu và Ngày nhận yêu cầu (form không có). Thiết bị thử nghiệm: lấy theo thiết bị đã chọn, nếu trống dùng chữ mặc định của form (phễu rót cát: «Bộ phễu rót cát, cân kỹ thuật, bếp ga, khay đựng mẫu, búa, đục.»; dao vòng: «Bộ dao vòng, cân kỹ thuật, bếp ga, khay đựng mẫu, búa, tấm lót.»).
- «KẾT QUẢ THỬ NGHIỆM» (đậm nghiêng giữa), hai dòng Wo / dung trọng khô lớn nhất / dung trọng cát chuẩn (phễu) và thể tích phễu / lượng cát trong phễu (hoặc thể tích dao vòng / khối lượng dao), gạch chân dưới nhãn thể tích.
- Bảng tiêu đề 3 dòng (chữ cỡ 9, thin dọc, không kẻ ngang giữa 3 dòng); dòng số liệu nét hair; dao vòng đổi tiêu đề cột 2 thành «Vị trí điểm đo».
- Dòng số liệu thừa tự ẩn: tối thiểu 3 dòng như form, nhiều điểm hơn thì hiện thêm và thu thấp hàng (27 → 24 → 20 pt) để vừa trang. Công thức, tên vùng, liên kết So_lieu từng sheet theo ngày đo giữ nguyên.
- Nhận xét K, chức danh ký, khoảng ký, «N điểm» (đếm cột Hệ số K) như form.
## Kiểm thử
- test147 (mới): độ rộng cột, nhãn, ô gộp, chức danh ký, dòng ẩn của ba loại: 60 đạt. test137 (đo K nhiều sheet) 91 đạt (cập nhật nhãn «Ngày thử nghiệm», «Độ ẩm tốt nhất (Wo)» theo form). test136, 142–146 đạt. test127 vẫn 2 lỗi cũ (ngày đúc) như bản trước.
