# Nhật ký build 0.10.0 (04/11/2026), nền 0.9.1
Mục tiêu: thêm loại mẫu **Cấp phối bê tông** (biểu mẫu BM-CP-01): thiết kế thành phần 1 m³ bê tông theo đúng file Excel cấp phối của phòng, số liệu xi măng, cát, đá lấy từ phiếu đã phát hành, kèm mẻ trộn thử và nén mẫu 3, 7, 28 ngày.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc file Excel cấp phối của phòng, lập bảng ô nhập, công thức, bảng tra (nước theo độ sụt, Dmax, Mđl; hệ số dư vữa Kd) | Xong |
| 2 | Viết chương trình Python độc lập tính lại cấp phối, đối chiếu với file gốc (LibreOffice tính lại) trên 60 bộ số ngẫu nhiên | Xong, 0 lệch |
| 3 | Dựng biểu mẫu BM-CP-01 (5 sheet theo quy ước), đối chiếu với Python trên 48 bộ số | Xong, 0 lệch |
| 4 | Viết công thức tính lại bằng JavaScript trong app, đối chiếu với biểu mẫu tính bằng LibreOffice: 48 bộ số + 58 bộ số biên (bỏ trống từng ô, ngoài bảng, giá trị 0, loại cốt liệu sai) | Xong, 0 lệch (5.521 ô so sánh) |
| 5 | Tích hợp vào app: loại mẫu, form điện thoại có ô chọn phiếu nguồn, kiểm tra file nộp, soát xét, phiếu A4, QR, Quan trắc | Xong |
| 6 | Chạy thử Chrome thật (CSDL giả): tạo mẫu, liên kết nguồn, tải biểu mẫu, nộp, soát xét, tính lại, phát hành, tải phiếu | Xong |
| 7 | Tính lại file nộp và file phiếu bằng LibreOffice, đối chiếu từng ô với giá trị app ghi | Xong, 0 ô lệch (trừ 2 ô trống ở dòng chữ ký phiếu) |
| 8 | Hồi quy toàn bộ loại cũ (cát, đá 5-20, xi măng, thép hình, 9 loại của 0.9.1), 17 trang x 3 tài khoản | Xong, không lỗi |
| 9 | Xuất bản 0.10.0 | Xong |
| 10 | Lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2) | Chưa làm |

## Phương pháp tính (đúng file Excel của phòng)
1. Rx = R28 xi măng (MPa) x 10,197 (kgf/cm²).
2. Nước ban đầu N0 tra bảng theo nhóm độ sụt (1 đến 6), Dmax (10, 20, 40, 70 mm) và khoảng Mđl cát (<= 1,0; <= 2,0; <= 2,4; lớn hơn).
3. Hiệu chỉnh nước: cát Mđl > 3 trừ 5 lít, Mđl < 1,4 cộng 5 lít; dùng sỏi trừ 10 lít; phụ gia giảm nước: N2 = N1 x (1 - % giảm).
4. X/N: công thức A (1,1 M / (Rx A) + 0,5) khi kết quả <= 2,5, ngược lại công thức A1 (1,1 M / (Rx A1) - 0,5). A = 0,54 và A1 = 0,34 khi cát Mđl >= 2 và đá chất lượng Tốt; còn lại A = 0,5 và A1 = 0,32.
5. Xi măng X = N2 x X/N x hệ số hiệu chỉnh sau nén 7 ngày. Nếu X > 400 kg: nước tăng theo N = (10 N2 - 400) / (10 - X/N), X tính lại theo nước mới.
6. Vh = X / KL riêng xi măng + N. Hệ số dư vữa Kd tra theo Vh (220 đến 400 lít) và Mđl (0,7 đến 3,0).
7. Độ rỗng đá r = 1 - KLTT xốp / KL thể tích hạt / 1000. Đá = KLTT xốp / (r (Kd - 1) + 1) x 0,89 (Mđl <= 3,2) hoặc 0,90.
8. Cát = (1000 - (X / ρx + Đá / ρđá + N)) x ρcát, cộng 1 kg, cộng hạt > 5 mm trong cát; đá trừ lượng đó; có ô chuyển cát sang đá (kg).
9. Mẻ trộn thử = 1,2 x số viên x cạnh³; cát, đá nhân (1 + độ ẩm); nước trừ phần nước có sẵn trong cát, đá (theo khối lượng khô, file cũ theo khối lượng ướt).
10. Nén mẫu: R = α x lực x 1000 / cạnh² (MPa), trung bình 3 viên, quy kgf/cm² và so với mác. R28 dự kiến từ R7 = R7 x 1,035 / 0,77, chỉ tham khảo.

## Nguồn số liệu lấy từ phiếu vật liệu
| Vật liệu | Lấy từ phiếu đã phát hành | Nhập tay |
|---|---|---|
| Xi măng PCB40 | R28 (làm tròn 1 chữ số như trên phiếu), nhãn hiệu | KL riêng (mặc định 3,1), KLTT xốp (mặc định 1,1), số lô |
| Cát xây dựng | Mđl, KLTT xốp, KL riêng, hạt > 5 mm (làm tròn như trên phiếu) | Không |
| Đá dăm 5x20, 10x40 | KLTT xốp, độ nén dập; Dmax gán theo loại (20, 40) | KL riêng, KL thể tích hạt, loại cốt liệu (đá dăm, sỏi), chất lượng |
| Phụ gia | Chưa có loại mẫu riêng | Tên, liều lượng (lít/100 kg XM), % giảm nước |
- Ô chọn phiếu nguồn xếp phiếu cùng công trình lên đầu, rồi mới nhất; chỉ hiện phiếu đã phát hành đúng loại.
- Khi nộp, app đối chiếu từng số liệu với phiếu nguồn: lệch, nguồn sai loại, chưa phát hành hoặc không tồn tại là LỖI (không nộp được). Nhập tay không liên kết là CẢNH BÁO.
- Cảnh báo thêm (không chặn): tổng thể tích tuyệt đối lệch 1000 lít quá 10 lít; độ sụt đo ngoài khoảng yêu cầu; viên lệch trung bình quá 15 %; Vh hoặc Mđl vượt bảng Kd (Kd lấy ở cột hoặc hàng cuối).

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật của nền tảng)
- Mẫu A (đá dăm 5x20, đủ 28 ngày) và mẫu B (sỏi, đá 10x40, có phụ gia, chưa có 28 ngày): phân tích đạt, soát xét tính lại khớp, phát hành, tải phiếu BM-CP-01_BCxx.xlsx, QR.
- Giả mạo bị phát hiện: sửa 1 ô số liệu không tính lại; đổi 1 hằng số ở _HeThong; sửa R28 xi măng hoặc Mđl cát khác phiếu nguồn; liên kết nhầm loại; liên kết mẫu chưa phát hành; mã mẫu không tồn tại; thiếu 1 viên 28 ngày; Mđl ngoài bảng.
- Phiếu A4 chuyển PDF: một trang, hai bảng vật liệu, bảng nén có ngày thử và so với mác, dòng phụ gia chỉ hiện khi dùng.
- Form điện thoại: 9 mục, 28 số liệu (25 khi chưa có 28 ngày), chọn nguồn tự điền, kết quả tạm tính từng mục.
- Quan trắc: thêm tab Cấp phối bê tông, 7 nhóm cột, 29 trên 30 cột có số liệu ở mẫu thử.

## Lỗi gặp và cách xử lý
- Dòng 5 (phụ gia) trên phiếu vẫn hiện số thứ tự khi không dùng phụ gia: đã đổi thành công thức.
- Ô chọn phiếu nguồn trên điện thoại dính chữ với tiêu đề: đã tách dòng.
- Dòng nhật ký 0.9.1 trong trang Nhật ký bị lệch cột (9 phần tử thay vì 8): đã gộp lại.
- Một số lỗi cú pháp khi dựng biểu mẫu (đã sửa trong quá trình).
- Chưa sửa: ô "Nguồn gốc mẫu" trên phiếu Excel nằm lệch dòng so với nhãn. Lỗi có sẵn ở các phiếu cũ, do bố cục gốc.

## Cần anh xác nhận
1. Các hệ số lấy từ file cũ, không rõ nguồn: 0,89 và 0,90 (hiệu chỉnh khối lượng đá), cộng thêm 1 kg cát, hệ số đổi 10,197 (hay 10), tỷ số 1,035/0,77 (R28 dự kiến), hệ số hao hụt mẻ 1,2, hệ số an toàn 1,1.
2. Mẻ trộn thử: file cũ trừ nước có sẵn theo khối lượng ướt, biểu mẫu mới trừ theo khối lượng khô. Xin chọn cách đúng.
3. Dòng "Phương pháp thử" trên phiếu do tôi đặt tạm: Thiết kế theo phương pháp thể tích tuyệt đối; TCVN 3105:2022; TCVN 3106:2022; TCVN 3118:2022.
4. Phiếu đá chưa có khối lượng riêng và khối lượng thể tích hạt (TCVN 7572-4): đang nhập tay. Nên thêm vào biểu mẫu đá để lấy tự động.
5. KL riêng xi măng 3,1 và KLTT xốp 1,1 là mặc định chung vì phiếu xi măng chưa có.
6. Dmax gán theo loại đá (5x20 là 20 mm, 10x40 là 40 mm). Đá dăm 20x70 chưa có biểu mẫu nên chưa dùng được Dmax 70.
7. Mác cao (từ khoảng M500) cho X rất lớn vì phương pháp này không dành cho bê tông mác cao. App chỉ cảnh báo khi vượt bảng Kd.
8. Nén 28 ngày hiện nhập trong cùng một lần nộp (có thể để trống, phiếu ghi dự kiến chỉ tham khảo). Nếu cần nộp 7 ngày trước, bổ sung 28 ngày sau, phải làm thêm luồng nhiều giai đoạn.
9. Chỉ chọn được phiếu nguồn trong dữ liệu đang mở (khoảng 18 tuần gần nhất). Nguồn cũ hơn nhập tay cho đến khi có phần lưu giữ 0.8.1.

## Việc tiếp theo đề xuất
1. Lưu giữ sau 90 ngày và tra cứu hồ sơ lưu bằng QR (0.8.1, 0.8.2), cần xong trước khi dữ liệu thật quá 2 tháng.
2. Thêm khối lượng riêng, khối lượng thể tích hạt vào biểu mẫu đá và cát (nếu cát chưa có đủ).
3. Loại mẫu Phụ gia, nén cấp phối nhiều giai đoạn.
4. Tờ nhãn mẫu (The mau).
