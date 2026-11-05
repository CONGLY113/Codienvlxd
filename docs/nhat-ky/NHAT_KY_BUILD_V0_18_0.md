# Nhật ký build 0.18.0 (05/11/2026), nền 0.17.0
Yêu cầu (09:30): hoàn thiện bảng kê thanh toán với nhân sự bổ sung Thủ quỹ (Hồ Thị Bích Thuỷ, Trần Hoàn); quy trình hai giai đoạn; bảng tổng hợp thanh toán; mã QR tài khoản ngân hàng cơ quan (Agribank, số tài khoản 3800201005127) mặc định trên bảng kê.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Mô hình dữ liệu, vai Thủ quỹ và Kế toán trưởng, trạng thái bảng kê | Xong |
| 2 | Giai đoạn 1: lập, gửi soát xét, thủ quỹ soát xét, ký duyệt đóng dấu, lưu vết | Xong |
| 3 | Giai đoạn 2: đề nghị và xác nhận thanh toán, tab Tổng hợp thanh toán | Xong |
| 4 | Mã QR VietQR Agribank trên màn hình, bản in, Excel, nội dung gửi khách | Xong |
| 5 | Kiểm thử nhiều vai trên Chrome, hồi quy, xuất bản 0.18.0 (Version 16) | Xong |
| 6 | Anh dùng thử, trả lời câu hỏi xác nhận | Chờ anh |

## 1. Nhân sự và quyền
| Người | Vai | Quyền trong tab Thanh toán |
|---|---|---|
| Hoàng Công Lý (quản trị) | tp, kt | Lập, sửa, gửi soát xét, ghi nhận ký duyệt, đề nghị thanh toán, mở lại bảng kê chưa thanh toán, thu hồi xác nhận |
| Nguyễn Thị Bích Lan (kế toán) | kt | Lập, sửa, gửi soát xét, ghi nhận ký duyệt, đề nghị thanh toán |
| Hồ Thị Bích Thuỷ, Trần Hoàn | tq (mới) | Soát xét (đạt hoặc trả lại kèm lý do), xác nhận Đã thanh toán, trả lại đề nghị, thu hồi xác nhận; xem tất cả |
| Lưu Minh Tuấn (Giám đốc) | pd | Chỉ xem bảng kê, Tổng hợp thanh toán, Bảng giá |
| Kế toán trưởng | ktt (mới, tên tạm là Kế toán trưởng) | Chỉ xem như Giám đốc |
Cán bộ thử nghiệm không thấy tab Thanh toán. Người lập không có vai thủ quỹ nên không tự soát xét bảng kê của mình.

## 2. Giai đoạn 1: lập, soát xét, ký duyệt (ghi nhận hệ thống, chưa thanh toán)
Nháp → Chờ thủ quỹ soát xét → Đã soát xét, chờ ký duyệt → Đã duyệt (chưa thanh toán).
- Lập và sửa chỉ khi ở Nháp. Gửi soát xét thì bảng kê khóa.
- Thủ quỹ soát xét số lượng mẫu và đơn giá: Soát xét đạt (phải tích đã đối chiếu) hoặc Trả lại (bắt buộc lý do), bảng kê về nháp, người lập thấy lý do ở Việc cần làm.
- Sau soát xét: in bản giấy (4 khối ký: người lập, thủ quỹ, ký duyệt đóng dấu, khách hàng), ký, đóng dấu, rồi bấm Ghi nhận đã ký duyệt, đóng dấu bản giấy.
- Mọi bước ghi vào mục Lưu vết bảng kê (thời điểm, người, vai, việc, ghi chú) và nhật ký thao tác.
- Mở lại để sửa: chỉ quản trị, chỉ khi chưa có đợt thanh toán nào.
- Bảng kê 0.16.0 cũ tự chuyển: Đã gửi khách thành Đã duyệt, Đã thanh toán thành Đã duyệt kèm một đợt thanh toán đủ.

## 3. Giai đoạn 2: thanh toán
- Kế toán tích chọn bảng kê khách đã thanh toán ở tab Tổng hợp thanh toán (hoặc ở từng bảng kê), chọn Chuyển khoản về tài khoản cơ quan hoặc Nộp tiền mặt, ngày tiền về, chứng từ, số tiền từng bảng kê (mặc định phần còn lại), gửi thủ quỹ.
- Thủ quỹ thấy mục Đề nghị thanh toán chờ xác nhận, bấm Đã thanh toán (ghi ngày nhận tiền) hoặc Trả lại kèm lý do. Kế toán rút lại được đề nghị chưa xác nhận.
- Thanh toán nhiều đợt: tình trạng Chưa thanh toán, Thanh toán một phần, Đã thanh toán đủ. Đủ tiền thì các mẫu của bảng kê được đánh dấu đã thanh toán (như trang Phiếu kết quả cũ); thu hồi xác nhận thì bỏ đánh dấu.
- **Tab Tổng hợp thanh toán**: TT, Tên khách hàng, Công trình, Số bảng kê, Giá trị, Đã thanh toán, Còn lại, Ngày lập kê, Ngày thanh toán, Trạng thái; lọc theo từ khóa, tình trạng, khoảng ngày lập; dòng cộng; Xuất Excel (có công thức SUM).

## 4. Mã QR thanh toán
- Chuẩn VietQR của Napas (EMVCo): mã BIN Agribank 970405, tài khoản 3800201005127, số tiền = phần còn lại của bảng kê, nội dung chuyển khoản = số bảng kê và tên khách (không dấu, tối đa 25 ký tự theo chuẩn).
- Hiện trên màn hình bảng kê, trong bản in, trong file Excel (ảnh nhúng) và dòng thông tin trong nội dung gửi khách. Bảng kê thanh toán đủ thì không in mã. Có ô tắt in mã QR cho từng bảng kê.
- Tab Bảng giá và tài khoản có mục Tài khoản nhận thanh toán để đổi ngân hàng, số tài khoản, thêm tên chủ tài khoản (mặc định Agribank 3800201005127, chưa có tên chủ tài khoản).

## 5. Kiểm thử
- Mã QR: thử CRC-16 với vector chuẩn (29B1), cấu trúc các trường, giải mã lại ảnh QR trong file Excel khớp từng ký tự với dữ liệu.
- Luồng nhiều vai trên Chrome thật: Lan lập → gửi → thủ quỹ trả lại (thiếu lý do bị chặn) → Lan gửi lại → thủ quỹ soát đạt → Lan ký duyệt → đề nghị 300.000 chuyển khoản, thủ quỹ xác nhận (thanh toán một phần) → đề nghị 300.000 tiền mặt, xác nhận (đủ, mẫu đánh dấu đã thanh toán). Giám đốc, Kế toán trưởng: xem, không có nút sửa. Cán bộ thử nghiệm không thấy tab.
- Bản Excel mở bằng LibreOffice đúng bố cục, có QR; bản in có khối thanh toán và 4 chữ ký; màn hình điện thoại không tràn ngang.
- Hồi quy: smoke, test93, 95, 96, 98, ui93, ui96, t94_b, t97, t97b, kịch bản bảng giá 0.17.0 đều không lỗi, không có lỗi console.

## 6. Còn mở từ trước
Giao nhiệm vụ nhanh theo bảng phân công, phiếu yêu cầu bản in có QR, in thiết bị trên phiếu phát hành, quan trắc đá 5x20, sửa lệch ô nguồn gốc biểu mẫu cũ, phụ gia, tờ nhãn mẫu; câu hỏi 0.14.0 đến 0.17.0 chưa trả lời.
