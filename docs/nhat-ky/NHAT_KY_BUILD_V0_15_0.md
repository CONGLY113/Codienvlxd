# Nhật ký build 0.15.0 (05/11/2026), nền 0.14.0
Yêu cầu: tên người ký trên mọi biểu mẫu (Cán bộ thử nghiệm, Trưởng phòng TN Hoàng Công Lý, Giám đốc Lưu Minh Tuấn) dùng **mã VietwareX, font VNshelleyAllegro cỡ 16**, sửa trực tiếp trong biểu mẫu; tên cán bộ thử nghiệm theo người đăng nhập.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Khảo sát ô chữ ký của 22 biểu mẫu (20 loại + đá 5x20 + cát xây dựng): tên vùng ten_can_bo, ten_truong_phong, ten_giam_doc; ô gộp, độ rộng, kiểu ô | Xong |
| 2 | Lấy bảng mã VietwareX chuẩn từ mã nguồn UniKey (mục VIETWARE-X), đổi xuôi và ngược cho 8 tên | Xong, khớp |
| 3 | Sửa app: hàm đổi Unicode sang VietwareX, ghi tên vào ô với font VNshelleyAllegro cỡ 16, tải biểu mẫu và phát hành phiếu | Xong |
| 4 | Kiểm thử 22 biểu mẫu, 7 tên người đăng nhập, phiếu phát hành, hồi quy | Xong |
| 5 | Xuất bản 0.15.0 (Version 13), nhật ký, câu hỏi | Xong |
| 6 | Anh mở thử file mẫu trên máy có font, đối chiếu mặt chữ | Chờ anh |

## Cách hoạt động
- Bảng mã VietwareX (UniKey): mỗi chữ có dấu thành 1 hoặc 2 ký tự Windows-1252, dấu viết sau chữ cái. Ví dụ: Hoàng Công Lý thành "Hoaìng Cäng Lyï"; Lưu Minh Tuấn thành "Læu Minh Tuáún". Font VNshelleyAllegro hiển thị các ký tự này thành chữ tiếng Việt.
- Khi tải biểu mẫu hoặc phát hành phiếu, app ghi trực tiếp vào ô chữ ký của Phieu_KQ: font VNshelleyAllegro cỡ 16, căn giữa, tự co chữ khi ô hẹp, hàng cao tối thiểu 30. Nếu file chưa có font này trong styles thì app tự thêm.
- **Cán bộ thử nghiệm**: tên người đăng nhập lúc tải biểu mẫu; khi phát hành phiếu lấy tên người được giao. Công thức cũ ở ô này thay bằng giá trị tên.
- **Trưởng phòng TN, Giám đốc**: lấy từ mục Biểu mẫu báo cáo > Tên người ký (mặc định Hoàng Công Lý, Lưu Minh Tuấn), tự đổi sang VietwareX. Ô "mã VietwareX" chỉ dùng khi muốn ghi đè bằng tên dán tay.
- Khi Trưởng phòng tự thử nghiệm, tên người soát xét ở ô giữa cũng đổi sang VietwareX.
- Giá trị tính toán và kiểm tra không đổi.

## Kết quả kiểm thử (Chrome thật, CSDL giả)
- 22 biểu mẫu tải về: cả 3 ô tên đúng chuỗi VietwareX, font VNshelleyAllegro, cỡ 16, tự co chữ, hàng cao từ 30 (0 file sai).
- 7 tài khoản đăng nhập (6 cán bộ và Trưởng phòng): tên đổi ngược đúng bằng tên gốc; phiếu phát hành 3 mác vữa có tên đúng; trường hợp Trưởng phòng tự thử nghiệm đúng.
- Xuất PDF bằng LibreOffice: khối ký nằm một dòng, vị trí cũ (máy kiểm thử không có font nên hiện chữ thay thế).
- Hồi quy: 17 trang, test 0.14.0, 0.13.0, 0.11.0, lưu giữ và QR: không lỗi. LibreOffice tính lại: không lệch số liệu; chỉ khác tên người ký và ngày chạy.

## Hạn chế
- Font VNshelleyAllegro không nhúng trong file, máy mở và in phải cài sẵn.
- Mã VietwareX lấy từ bảng UniKey, chưa nhìn được mặt chữ thật trên máy có font.
- Phiếu xem trên màn hình app vẫn hiện tên Unicode.

## Cần anh xác nhận
5 câu trong CAU_HOI_CHU_KY_V0_15_0.xlsx. Ưu tiên cao: mở MAU_KIEM_TRA_CHU_KY_V0_15_0.xlsx trên máy có font và xem ba tên có đúng dấu không.
Các câu hỏi cấp phối vữa 0.14.0 (CAU_HOI_CAP_PHOI_VUA_V0_14_0.xlsx) vẫn còn mở.

## Việc tiếp theo đề xuất
Giao nhiệm vụ nhanh theo bảng phân công; phiếu yêu cầu bản in có QR; in thiết bị thử nghiệm trên phiếu phát hành; quan trắc đá 5x20; sửa lệch ô nguồn gốc biểu mẫu cũ; Phụ gia.
