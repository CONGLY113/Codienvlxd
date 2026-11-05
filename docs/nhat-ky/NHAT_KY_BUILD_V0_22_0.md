# Nhật ký build 0.22.0 · 05/11/2026

**Yêu cầu (14:11):** đưa ảnh trụ sở đơn vị làm hình nền trang đăng nhập, cân đối, chuyên nghiệp; bỏ dòng "Quản lý toàn bộ quy trình thí nghiệm vật liệu xây dựng: nhận mẫu, giao việc…"; giao diện mượt, nét.

## Đã làm
1. **Bố cục máy tính:** ảnh trụ sở phủ toàn bộ nửa trái trang (cao hết màn hình), giữ nguyên mặt tiền và biển tên Trung tâm ở vị trí dễ đọc. Mép phải ảnh hòa vào nền xanh đậm của nửa phải.
   - Góc trên trái: logo tròn, tên Trung tâm, "Quảng Trị" trên lớp mờ nhẹ.
   - Phía dưới ảnh: tiêu đề "Phòng thí nghiệm chuyên ngành xây dựng" và bốn bước (Nhận mẫu, Thử nghiệm, Phát hành, Thanh toán) dạng viên kính mờ, trên lớp mờ chuyển màu để chữ rõ nhưng không che biển tên.
   - Nửa phải: thẻ chọn tài khoản có ô tìm kiếm, nút khách hàng gửi yêu cầu, ghi chú chạy thử và số phiên bản.
2. **Bỏ dòng mô tả quy trình.**
3. **Điện thoại và máy tính bảng:** ảnh thành dải đầu trang (cao theo chiều rộng màn hình), tiêu đề đè lên chân ảnh, thẻ tài khoản bên dưới. Bốn viên bước ẩn trên màn hình nhỏ.
4. **Độ nét:** nhúng hai cỡ ảnh WebP (720 px và 1448 px), trình duyệt tự chọn theo màn hình. Ảnh vào trang có hiệu ứng phóng nhẹ, tắt khi máy bật "giảm chuyển động".
5. **Sửa nhỏ:** ô tìm kiếm trên điện thoại bị biểu tượng kính lúp đè chữ; chữ gradient ở tiêu đề bị tối do bóng chữ.

## Thử
Màn hình 1920, 1366, 1280x640, máy tính bảng 820, điện thoại 390 và chế độ nền tối; lọc tài khoản; không lỗi console; hồi quy test98, test101, smoke92, ui93, test93, test103 đạt.

## Lưu ý
- Ảnh gốc có sẵn chữ "TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG" trên biển, nên phần chữ trên ảnh không bị cắt hay che.
- Ảnh nhúng làm file tăng khoảng 0,55 MB.
