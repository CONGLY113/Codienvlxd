# Nhật ký build 0.37.0 (11/11/2026)
Gói triển khai Firebase từ file `Quan_ly_mau_thu_nghiem_v0.37.0.html` (bản chạy thử đã xem). Nhật ký này tổng hợp các thay đổi từ 0.29.0 đến 0.37.0 theo chú thích trong mã nguồn; bản 0.28.11 trước đó (nạp bố cục không báo nhầm macro, sửa thứ tự phần tử sheet So_lieu đo K, bỏ chữ «Số báo cáo:», gom tab Thông báo và Sửa đổi phiếu) đã nằm trong file này.

## Thay đổi so với 0.28.11
- **0.29.0 Chốt dữ liệu chính thức:** thay nút «Xóa toàn bộ dữ liệu chạy thử» cũ (còn sót mẫu theo kỳ, bảng kê, thông báo). Quy trình mới: chọn mốc ngày giờ và nhóm dữ liệu, xem trước số bản ghi, bắt buộc sao lưu Excel, gõ cụm xác nhận `XOA DU LIEU THU NGHIEM`, xóa theo lô nhỏ. Chỉ xóa dữ liệu nghiệp vụ tạo trước mốc. Giữ lại: tài khoản, bảng giá, thiết bị, hiệu chuẩn, biểu mẫu, cấu hình, nhật ký thao tác. Danh bạ khách hàng bảng kê 3 phòng mặc định không xóa.
- **0.30.0 Giao diện nền (chỉ CSS) và đăng nhập:** nền tảng giao diện mới, màn đăng nhập giữ ảnh nền, khu chọn sáng và rõ; chỉ báo các bước Đơn vị, Tài khoản, Mật khẩu.
- **0.31.0:** mật khẩu nhập ngay trên thẻ đăng nhập (bước 3); điều hướng theo nhóm; bảng điều khiển Trưởng phòng (chỉ đọc).
- **0.32.0:** bảng danh sách dùng chung có ô tìm, nút lọc nhanh (chỉ hiển thị, không đổi dữ liệu); trang «Nhiệm vụ của tôi».
- **0.33.0:** ô tìm khách hàng, công trình ở nhận mẫu thủ công cao hơn; nhãn nhóm menu; lời chào sau đăng nhập (tên, phòng, lời chúc mỗi ngày), mờ dần rồi vào Việc của tôi hoặc Tổng quan theo vai trò. Số báo cáo luôn ở ô A1 của Phieu_KQ (Times New Roman 9, in thường, nghiêng). Bỏ phần Yêu cầu kỹ thuật, Nhận xét ở phiếu đá gốc, đo K, đo chống sét; chưa ban hành ngưỡng thì dùng ngưỡng trong biểu mẫu gốc, không còn cảnh báo.
- **0.34.0 Gạch bê tông đặc (BM-GB-01) và rỗng (BM-GB-02):** quan trắc gốc từng viên theo 3 bước (10 viên kích thước, cong vênh, khuyết tật; 3 viên nén; 3 viên hút nước). Bảng tổng hợp B5:B12 của So_lieu là công thức lấy từ quan trắc gốc; mức yêu cầu (cột C, D) người thử vẫn sửa được. Mọi loại mẫu đều có tiền tố tên mẫu (nén, đo K theo tên loại; loại khác theo tên mẫu đã nhập, thiếu thì lấy tên loại).
- **0.36.0 Ba phiếu đá láng nhựa 4,75/9,5, 9,5/12,5, 12,5/19:** dựng lại đúng file thông số: A1 số báo cáo, khối thông tin hàng 2–12, bảng 5 chỉ tiêu A14:M19 (cỡ 12,5/19: A14:L19), bảng thành phần hạt C21:G24, nhận xét hàng 25, chức danh ký hàng 26. Số liệu vẫn lấy từ So_lieu qua tên vùng out_*, dp_*, req_*.
- **0.37.0 Vải địa kỹ thuật (BM-VD-01, mã VAI_DIA):** loại mẫu mới, 13 chỉ tiêu, mỗi chỉ tiêu 10 mẫu, cột «Loại» gõ x để loại kết quả dị thường khỏi trung bình; kết quả B5:B17 của So_lieu là công thức. Form không có mức yêu cầu nên không xét đạt / không đạt; hệ thống chỉ cảnh báo thiếu mẫu (n dùng < n quy định) và CV > 20 % (theo TCVN 8222:2009). Phiếu kết quả dựng đúng file thông số (hàng 2 Tên mẫu và Loại, hàng 3–11 thông tin, bảng B13:I26, hàng 27 chức danh ký). Số loại mẫu từ 31 lên 32; có nhập nhiệt độ, độ ẩm như xi măng.

## Triển khai Firebase
- Chỉ thay `public/index.html`. Không đổi `fb-shim.js`, `firestore.rules` (luật chung theo `{col}/{docId}`, đủ 16 email), không cần chỉ mục mới. Lệnh: `firebase deploy --only hosting`, sau đó Ctrl+F5 (hoặc mở lại ứng dụng hai lần) để service worker lấy bản mới.
- Chức năng «Chốt dữ liệu chính thức» đọc và xóa nhiều nhóm dữ liệu: chỉ trưởng phòng dùng, và phải sao lưu Excel trước.

## Kiểm thử trên file 0.37.0
- Cú pháp mã (node --check) đạt; `build_public.py` dựng được `public/index.html` (chèn shim và PWA).
- test148 (gom tab) 16 đạt; test149 68 đạt (cả 32 biểu mẫu đúng thứ tự phần tử sheet, số báo cáo chỉ gồm mã, printerSettings được nạp, vbaProject bị chặn; kỳ vọng số loại đổi thành từ 32); test147 60 đạt; test146 31 đạt; test143 393 đạt. Xuất 32 biểu mẫu gốc và kiểm thứ tự phần tử bằng xlcheck: không lỗi.
- Chưa chạy lại toàn bộ test110–141 trên bản này; các lỗi cũ đã biết (test127, 131, 116, 117, 132, 141) không liên quan thay đổi.
