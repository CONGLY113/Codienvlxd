# Nhật ký build 0.17.0 (05/11/2026), nền 0.16.0
Yêu cầu (08:27): (1) đọc 7 file .xls mẫu, thêm các loại mẫu vật liệu, làm từ mẫu dễ trước, khó sau, theo luồng nghiệp vụ như bản gần nhất; (2) bảng kê thanh toán: đơn giá theo loại mẫu và theo chỉ tiêu, nén bê tông/vữa tính theo tổ mẫu nén (bê tông 3 viên, vữa 6 viên), đo K tính theo điểm; bố trí lại tab Bảng giá theo cột TT, Tên mẫu và chỉ tiêu, Đơn giá, có nút tải file Excel đơn giá lên và nút thêm đơn giá phát sinh.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 7 file .xls, xếp thứ tự từ dễ đến khó | Xong |
| 2 | 4 loại dạng nhập trực tiếp: nhựa đường 60/70, nhựa lỏng MC70, gạch bê tông đặc, gạch bê tông rỗng | Xong |
| 3 | Bu lông (BM-BL-01) | Xong |
| 4 | Đầm chặt cát, cấp phối đá dăm loại I và II (dùng khung cấp phối thiên nhiên) | Xong |
| 5 | Đá dăm 20x70 (thành phần hạt, Dmax, Dmin, nén dập, mài mòn, hàm lượng) | Xong |
| 6 | Tab Bảng giá thiết kế lại; bảng kê tính theo tổ và theo điểm | Xong |
| 7 | Kiểm thử Chrome thật, LibreOffice đối chiếu công thức, hồi quy, xuất bản 0.17.0 (Version 15) | Xong |
| 8 | Anh dùng thử, trả lời câu hỏi xác nhận | Chờ anh |

## 1. Chín loại mẫu mới (mỗi loại một biểu mẫu Excel 5 sheet: Thong_tin, So_lieu, Kiem_tra, Phieu_KQ, _HeThong)
| Thứ tự | Loại mẫu | Mã biểu mẫu | Chỉ tiêu |
|---|---|---|---|
| 1 | Nhựa đường 60/70 | BM-NH-01 (TCVN 7493:2005) | kim lún, kéo dài, hóa mềm, chớp cháy, tỷ trọng, tổn thất, lượng hòa tan, độ dính bám |
| 2 | Nhựa đường lỏng MC70 | BM-NH-02 (TCVN 8818-1:2011) | độ nhớt, chưng cất (225, 260, 316 ºC), cặn, nước, chớp cháy, kim lún, kéo dài, hòa tan |
| 3 | Gạch bê tông đặc | BM-GB-01 (TCVN 6477:2016) | kích thước L,B,H, bền nén, hút nước, cong vênh, sứt, nứt |
| 4 | Gạch bê tông rỗng | BM-GB-02 (TCVN 6477:2016) | như trên, kích thước danh nghĩa và yêu cầu nhập được |
| 5 | Bu lông | BM-BL-01 | giới hạn chảy, bền kéo, độ giãn dài, tiết diện S = d²·π/4, chọn nhanh cấp độ bền 4.6/5.6/6.6/8.8/10.9 |
| 6 | Đầm chặt cát | BM-CT-02 (PP II-A) | dung trọng khô lớn nhất, độ ẩm tốt nhất |
| 7 | Cấp phối đá dăm loại I | BM-CT-03 | như trên |
| 8 | Cấp phối đá dăm loại II | BM-CT-04 | như trên |
| 9 | Đá dăm 20x70 | BM-DA-03 | thành phần hạt (100, 70, 40, 20), Dmax, Dmin, nén dập, mài mòn Los Angeles, hàm lượng sét, thoi dẹt, nhẹ |

Mỗi loại: nhập số liệu trên web, hệ thống tính, tạo file Excel biểu mẫu, nộp file, đối chiếu số liệu với file, soát xét, phê duyệt, phát hành phiếu có QR, bảng kê. Các ô cố định, ô công thức, tên người ký theo cơ chế của 0.15.0.

## 2. Bảng giá và bảng kê
- Tab **Bảng giá** gồm cột TT, Tên mẫu và chỉ tiêu, Đơn giá (đ). Mỗi loại mẫu có giá trọn một mẫu và danh sách chỉ tiêu (mở rộng bằng nút), mỗi chỉ tiêu có giá riêng; có ô tìm nhanh.
- Nút **Tải file Excel đơn giá lên**: nhận theo cột Mã (file tải từ hệ thống) hoặc theo tên mẫu (file riêng của phòng); dòng không nhận ra tên thành đơn giá phát sinh; dòng giá không hợp lệ bị bỏ qua và báo số lượng; tự lưu sau khi nạp.
- Nút **Thêm đơn giá**: tạo đơn giá phát sinh cho mẫu hoặc phép thử mới; trong bảng kê có danh sách Thêm từ đơn giá phát sinh để thêm dòng nhanh.
- Nút **Tải bảng giá hiện tại (Excel)**: file mẫu để sửa rồi tải lên lại (đọc lại khớp 100 % khi thử).
- **Quy tắc tính bảng kê**: nén bê tông = số tổ (3 viên một tổ), nén vữa = số tổ (6 viên một tổ), đo K (dao vòng, phễu rót cát) = số điểm đo. Số viên, số điểm lấy từ kết quả đã nộp; mẫu chưa nộp tạm tính 3 viên, 6 viên, 3 điểm và ghi rõ trên dòng. Loại mẫu có giá trọn thì tính theo giá trọn; để trống giá trọn mà có giá chỉ tiêu thì bảng kê tách từng chỉ tiêu. Số lượng và đơn giá trong bảng kê vẫn sửa tay được.
- Dữ liệu: `config/bang_gia` có thêm `ct` (giá chỉ tiêu) và `them` (giá phát sinh); `gia` theo loại mẫu giữ nguyên nên bảng giá cũ vẫn dùng được.

## 3. Kiểm thử
- Từng loại mẫu mới: nhập số liệu mẫu từ file gốc, so kết quả (ví dụ bu lông S = 254,47 mm², giới hạn chảy 793,8 MPa; cấp phối đá dăm loại I γkmax 2,284 và Wo 4,9 khớp file gốc; đá 20x70 Dmax 67,50, Dmin 24,58), tải file Excel, nộp, sửa số liệu trong file để kiểm tra phát hiện sai lệch, soát xét, phát hành. LibreOffice tính lại công thức: 0 chênh lệch.
- Bảng giá: bkLines với bê tông 9 viên = 3 tổ, vữa 7 viên = 2 tổ, đo K 5 điểm, mẫu chưa nộp tạm tính; tải lên file riêng (giá dạng 120.000 chữ, thêm dòng lạ, dòng hỏng), vòng tải xuống rồi tải lên khớp.
- Hồi quy: smoke, test93, 95, 96, 98, ui93, ui96, t94_b, t97, t97b đều không lỗi. Không có lỗi console.

## 4. Còn mở từ trước
Giao nhiệm vụ nhanh theo bảng phân công, phiếu yêu cầu bản in có QR, in thiết bị trên phiếu phát hành, quan trắc đá 5x20, sửa lệch ô nguồn gốc biểu mẫu cũ, phụ gia, tờ nhãn mẫu; bảng câu hỏi 0.14.0 đến 0.16.0 chưa được trả lời.
