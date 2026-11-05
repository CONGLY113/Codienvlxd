# Nhật ký build 0.20.0 (05/11/2026)

Nền: 0.19.0. Ba yêu cầu của anh lúc 11:34.

## 1. Nạp đơn giá thí nghiệm
- Đọc file Bang_gia_thi_nghiem_2026-11-05.xlsx: 31 loại mẫu có đơn giá trọn, 4 chỉ tiêu có đơn giá (CT_01 300.000; 2L_01, 2L_02, 2L_03 mỗi chỉ tiêu 400.000). Phần đơn giá phát sinh để trống.
- Đã ghi vào cơ sở dữ liệu của hệ thống (config/bang_gia), mọi người dùng thấy ngay trong tab Thanh toán, Bảng giá. Không cần tải file lên lại.
- Giá trị chính: Cát xây dựng 270.000; Đá dăm 5x20, 10x40, 20x70 và đá láng nhựa 390.000; Xi măng 400.000; Nén bê tông 90.000/tổ; Nén vữa 80.000/tổ; Đo K 65.000/điểm; Nhựa 60/70 1.200.000; Nhựa MC70 4.000.000; Cấp phối bê tông 800.000.
- Lưu ý: loại mẫu đã có giá trọn thì bảng kê dùng giá trọn và bỏ qua giá chỉ tiêu, nên giá chỉ tiêu của cấp phối thiên nhiên (CT_01) và gạch 2 lỗ (2L_01 đến 2L_03) chưa được dùng khi tính tiền. Muốn tính theo chỉ tiêu thì xóa giá trọn của loại đó.
- Cột đơn vị tính trong file ghi "tổ 3 viên", "tổ 6 viên" là chữ của bản cũ; từ 0.19.0 mỗi phiếu nén bê tông hoặc nén vữa là một tổ.

## 2. Số bảng kê có ký hiệu VL
- Dạng mới: BKVL26.11.05.1 (BKVL + năm.tháng.ngày + số thứ tự trong ngày).
- Bảng kê cũ dạng BK26... giữ nguyên số. Số thứ tự trong ngày vẫn đếm liên tục, không trùng.
- Nội dung chuyển khoản QR theo số mới, ví dụ BKVL26.11.05.1 CTDV.

## 3. Logo và giao diện
- Logo đơn vị tách nền trong suốt (file kèm theo), dùng ở: trang đăng nhập, thanh bên, thanh trên điện thoại, cổng khách hàng, trang tra cứu phiếu, bản in bảng kê và biểu tượng tab trình duyệt.
- Trang đăng nhập thiết kế lại theo xu hướng 2026: nền gradient aurora xanh theo màu logo, thẻ kính mờ, tiêu đề lớn có chữ gradient, 4 thẻ bento các bước nghiệp vụ, thẻ chọn tài khoản có ô tìm kiếm (gõ không dấu cũng tìm được), ảnh đại diện chữ cái, hiệu ứng vào nhẹ (tắt khi máy bật giảm chuyển động). Hiển thị đúng ở máy tính và điện thoại 390 px, không tràn ngang.
- Giữ nguyên nhóm tài khoản và nút khách hàng gửi yêu cầu.

## Kiểm thử
- test101 (luồng bảng kê nhiều vai, QR), test98, smoke92, test100m, test93, ui93: đạt. Ảnh chụp đăng nhập ở máy tính, điện thoại, chế độ tối: không lỗi.
- Chưa làm: logo trên phiếu kết quả Excel (biểu mẫu BM-xx) và Excel bảng kê.
