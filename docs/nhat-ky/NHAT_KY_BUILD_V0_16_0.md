# Nhật ký build 0.16.0 (05/11/2026), nền 0.15.0
Yêu cầu: (1) bổ sung quyền giao nhận mẫu cho cán bộ thí nghiệm; (2) tab Thanh toán thiết kế thành bảng kê thanh toán theo phiếu yêu cầu; góp ý thêm ý tưởng.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Khảo sát vai trò giao nhận mẫu, trang Thanh toán cũ, mô hình dữ liệu (phiếu yêu cầu, mẫu, đơn giá) | Xong |
| 2 | Thêm quyền giao nhận mẫu cho 6 cán bộ thử nghiệm; sửa nhóm hiển thị ở màn hình đăng nhập | Xong |
| 3 | Thiết kế bảng kê: dữ liệu, số bảng kê, bảng giá, chiết khấu, tạm tính, Excel, in | Xong |
| 4 | Kiểm thử Chrome thật, LibreOffice đối chiếu công thức, hồi quy | Xong |
| 5 | Xuất bản 0.16.0 (Version 14), nhật ký, câu hỏi và góp ý ý tưởng | Xong |
| 6 | Anh dùng thử, nhập bảng giá, trả lời câu hỏi | Chờ anh |

## 1. Quyền giao nhận mẫu
- Sáu cán bộ thử nghiệm (Nguyễn Mậu Thiện, Trần Anh Dũng, Nguyễn Văn Sự, Nguyễn Tiến Hoàng, Lê Phước Đức, Trần Đăng Hùng) có thêm vai trò giao nhận mẫu: thấy và dùng tab Nhận mẫu, vẫn có tab Nhiệm vụ của tôi.
- Không đổi quyền soát xét, phê duyệt hay thanh toán.
- Màn hình đăng nhập gom nhóm "Cán bộ thử nghiệm, giao nhận mẫu".

## 2. Bảng kê thanh toán (tab Thanh toán)
Tab Thanh toán có 3 tab con: **Bảng kê thanh toán**, **Bảng giá**, **Phiếu kết quả, bản giấy** (trang thanh toán cũ giữ nguyên).
- **Danh sách phiếu yêu cầu chưa lập bảng kê**, nhóm theo khách hàng, có lọc theo ngày tạo phiếu. Mỗi phiếu có nút Lập riêng; hoặc chọn nhiều phiếu cùng khách rồi Lập bảng kê cho phiếu đã chọn.
- **Nội dung bảng kê**: Tên khách hàng, Tên công trình, Số bảng kê, ngày; bảng TT, tên mẫu, số lượng, đơn giá, thành tiền; Tổng cộng; Chiết khấu (theo % trên tổng cộng hoặc giảm trừ nhập số tiền); Thành tiền sau chiết khấu; Bằng chữ; Ghi chú.
- **Số bảng kê**: BK<yy>.<mm>.<dd>.<STT>, mốc ngày là ngày tạo phiếu (sửa được ô Ngày bảng kê), STT tăng trong ngày.
- **Mẫu chưa hoàn thành** vẫn lập được (mặc định tính cả). Bảng kê hiện TẠM TÍNH và ghi số mẫu chưa xong; bỏ chọn để chỉ tính mẫu đã phát hành. Nút Cập nhật số mẫu từ phiếu lấy số mới khi mẫu đã xong hoặc có thêm mẫu; danh sách báo "Phiếu đã đổi" cho bảng kê chưa chốt.
- **Gom dòng**: các mẫu cùng loại và cùng tên gom thành một dòng, số lượng là số mẫu. Sửa tên, số lượng, đơn giá, thêm dòng, xóa dòng được.
- **Bảng giá**: đơn giá một mẫu theo loại mẫu, bảng kê mới tự lấy; nút Lấy lại đơn giá từ bảng giá.
- **Xuất**: Tải Excel (công thức thành tiền, tổng, chiết khấu, còn lại; khổ A4), In (hộp thoại in của trình duyệt), Soạn nội dung gửi khách, Xuất danh sách (CSV).
- **Trạng thái**: Nháp tạm tính, Đã gửi khách, Đã thanh toán (khóa sửa, ghi nhận thanh toán cho các phiếu kết quả đã phát hành trong bảng kê), Đã hủy (phiếu quay lại danh sách chờ).
- **Quyền**: kế toán và Trưởng phòng TN.
- **Dữ liệu**: mỗi bảng kê một tài liệu trong bộ sưu tập bangke_<năm>; tải sẵn năm nay và năm trước.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật)
- Đọc số tiền bằng chữ: 12 trường hợp đúng (không, lẻ, mốt, tư, lăm, nghìn, triệu, tỷ).
- Tính tiền: chiết khấu 10 % trên 1.100.000 đồng thành 110.000; giảm trừ lớn hơn tổng chỉ trừ tối đa bằng tổng; làm tròn đồng đúng.
- Luồng: lập riêng phiếu có 2/3 mẫu xong (tạm tính), chiết khấu 10 %, lưu cấp số BK26.11.05.1, gửi khách, ghi nhận thanh toán (hai phiếu kết quả đã phát hành chuyển sang đã thanh toán, mẫu chưa xong không đổi), phiếu thoát khỏi danh sách chờ; lập thêm bảng kê thứ hai số .2; In; tab Bảng giá 26 loại; tab Phiếu kết quả.
- Excel mở bằng LibreOffice: công thức tính lại bằng giá trị lưu sẵn (600.000, 60.000, 540.000); bố cục A4 một trang.
- Tài khoản cán bộ thử nghiệm thấy tab Nhận mẫu, không thấy Thanh toán.
- Hồi quy: 17 trang, test 0.14.0, 0.13.0, 0.11.0, UI cổng khách và nhận thủ công, lưu giữ và QR: không lỗi.

## Hạn chế
- Chưa có VAT, thanh toán nhiều đợt, tạm ứng.
- Bảng giá đang trống: bảng kê hiện 0 đồng đến khi nhập bảng giá.
- In dùng hộp thoại in của trình duyệt; nếu trình duyệt chặn thì dùng Tải Excel.
- Phiếu đã lưu giữ quá 90 ngày không còn hiện để lập bảng kê mới.

## Cần anh xác nhận và góp ý ý tưởng
Xem CAU_HOI_VA_Y_TUONG_BANG_KE_V0_16_0.xlsx: 10 câu hỏi (ưu tiên cao: đơn giá theo loại mẫu hay chỉ tiêu, bảng giá hiện hành, số lượng nén theo mẫu hay viên) và 11 ý tưởng (công nợ và thanh toán nhiều đợt, tạm ứng, QR chuyển khoản, bảng giá theo khách, phụ phí, duyệt bảng kê, nhắc nợ, báo cáo doanh thu).
Câu hỏi các bản trước (chữ ký VietwareX 0.15.0, cấp phối vữa 0.14.0) vẫn còn mở.
