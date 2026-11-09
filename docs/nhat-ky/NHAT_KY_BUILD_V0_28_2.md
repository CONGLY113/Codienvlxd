# Nhật ký build 0.28.2 (09/11/2026)

Bổ sung theo yêu cầu trưởng phòng; không đổi Firestore, chỉ deploy lại hosting.

- B55 Nhận mẫu thủ công: ô tìm khách hàng (tên, người liên hệ, điện thoại, email, MST) và ô tìm công trình (không phân biệt dấu). Chưa chọn khách thì tìm công trình trong toàn bộ khách, chọn xong tự điền cả khách hàng. Sửa lỗi chọn «Nhập khách mới» vẫn điền khách đầu danh sách.
- B56 Nhiệm vụ của tôi: mục Đã nộp có nút «Tải phiếu A4 excel» cạnh Số báo cáo khi phiếu đã được phê duyệt, chỉ cán bộ thử nghiệm thấy.
- B57 Nhiều người dùng cùng lúc: gom các lần dữ liệu đổi (tối đa ~3 lần vẽ lại/giây), hoãn vẽ lại khi đang gõ hoặc giữ chuột rồi vẽ bù; chờ khóa cấp số thử lại 250 ms (trước 600 ms). Sửa chữ «null» thừa ở trang Giao việc.
- Kiểm thử: test134 (15), test135 (5); toàn bộ bộ kiểm thử cũ đạt.
