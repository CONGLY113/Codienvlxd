# Nhật ký build 0.28.0 (08/11/2026)

Sửa lỗi theo file «Sửa lỗi phiên bản V28». Không đổi Firestore, không đổi dữ liệu cũ.

## B45 Việc của bạn
- Tổng quan, mục «Việc của bạn» hiển thị tên mẫu.

## B46 Bảng kê thanh toán
- Đơn giá bê tông, vữa (theo tổ) và đo K (theo điểm) lấy từ bảng giá, kể cả khi bấm «Lấy lại đơn giá từ bảng giá».
- Kiểm thử: test130 (6).

## B47 Số báo cáo và số phiếu yêu cầu
- Số báo cáo cấp riêng cho từng sheet kết quả, mốc theo ngày báo cáo của sheet; số phiếu yêu cầu dùng chung trong một tháng.

## B48 Nén bê tông, nén vữa nhiều sheet
- So_lieu nhập theo bảng: mỗi dòng một sheet kết quả (ký hiệu mẫu, mác, tuổi, ngày đúc, ngày thử = đúc + tuổi, cạnh mẫu và hệ số quy đổi, lực nén viên 1 đến 6, cường độ, trung bình, độ lệch).
- Tải lên file có thêm dòng thì hệ thống tự thêm sheet kết quả (Phieu_KQ_n); mỗi sheet có số báo cáo và mã QR riêng.
- Sheet kết quả bỏ Tên mẫu, Cấu kiện; ngày thử, ngày đúc, tuổi lấy từ So_lieu; Nhận xét ngay dưới Cường độ trung bình.
- Tên file tải về có tiền tố tên mẫu: «Nén bê tông .BC.30.11.2026.1. …».
- Kiểm thử: test131 (67).

## B49 Đo K dao vòng, phễu rót cát nhiều sheet
- So_lieu có tối đa 10 khối giống nhau (khối 1 là bản gốc, mỗi khối cách nhau 40 dòng); mỗi khối có thông số và tối đa 15 điểm đo riêng.
- Khối nào có số liệu thì khi tải lên hệ thống tự thêm sheet kết quả, nhân bản Phieu_KQ và trỏ công thức về đúng khối; mỗi sheet một số báo cáo, mã QR riêng.
- Tên file có tiền tố «Đo K dao vòng .BC…» hoặc «Đo K phễu rót cát .BC…».
- Kế toán tính tiền theo tổng số điểm đo đã nhập ở các sheet (chưa nhập thì tạm tính 3 điểm).
- LibreOffice tính lại khớp 100% giá trị lưu sẵn (So_lieu và 3 sheet Phieu_KQ).
- Kiểm thử: test132 (51).

## Chưa làm / lưu ý
- Nhập trên điện thoại (biểu mẫu web) vẫn một sheet; nhiều sheet nhập qua file Excel.
- Kiem_tra trong Excel chỉ chấm khối 1; hệ thống kiểm tra đủ mọi khối khi tải lên.
- Sửa đổi phiếu nhiều sheet: các sheet thêm nhận số -SĐn, số cũ của sheet thêm chưa tra cứu được.
