# Nhật ký build v0.27.0 (06/11/2026)

Phân hệ **Bảng kê và báo giá dịch vụ** cho 3 phòng. Tách riêng khỏi luồng thí nghiệm.

## Phạm vi
- Phòng Kiểm định Hiệu chuẩn đo lường (hai mảng: Kiểm định, hiệu chuẩn = Phụ lục 1; An toàn lao động = Phụ lục 2): bảng kê và báo giá.
- Phòng Hóa sinh môi trường (Phụ lục III): bảng kê và báo giá.
- Phòng Cơ điện VLXD: chỉ báo giá. Bảng kê Cơ điện vẫn ở trang Thanh toán, không đổi.

## Luồng
- Bảng kê: nhân viên giao nhận mẫu lập, thủ quỹ soát xét, kế toán trưởng duyệt trên hệ thống, in (3 khối ký: người lập, thủ quỹ, khách hàng), thu tiền (đề nghị, thủ quỹ xác nhận, VietQR như cũ).
- Báo giá: nhân viên lập, trưởng phòng của phòng duyệt, xuất PDF gửi Zalo. Không chuyển thành bảng kê.
- Đơn giá khóa theo bảng giá; chỉ trưởng phòng hoặc quản trị mở khóa, có lý do và lưu vết. Dòng phát sinh nhập tay.
- Công nợ tách theo phòng, tuổi nợ 30/60/90 ngày, tải Excel.
- Giấy chứng nhận: số, ngày cấp, hạn hiệu lực, liên kết; tra cứu theo số, lọc sắp hết hạn.
- Nhập dòng từ Excel theo mẫu của hệ thống hoặc nhập trực tiếp.

## Dữ liệu
Bộ sưu tập mới: `dv_gia`, `dv_cfg`, `dv_kh`, `dvbk_<yy>`, `dvbg_<yy>`. Không ghi vào `samples_*`, `bangke_*`.
Bảng giá nhúng sẵn (Cơ điện 176, Kiểm định hiệu chuẩn 241, An toàn lao động 72, Hóa sinh 614 mục). Quản trị nhập bản mới từ Excel.

## Tài khoản
NS014 Phan Thanh Hà, NS015 Nguyễn Thị Cẩm Hiền, NS016 Giang Tấn Thông, NS017 Hoàng Thị Châu. **Mã tạm**, cần xác nhận. Đã thêm email `ns014..ns017@ptn-vlxd.vn` vào `firestore.rules`: phải triển khai lại rules và tạo 4 tài khoản trong Firebase Authentication.

## Giả định chờ xác nhận
1. Thuế GTGT mặc định 10 phần trăm (chỉnh trong tab Bảng giá).
2. Tiền tố báo giá Cơ điện: BG.VLXD.
3. Báo giá không có thời hạn hiệu lực.
4. Quản trị (tp) cũng duyệt được báo giá và mở khóa giá.
5. Phạm vi theo phòng chỉ chặn ở giao diện; rules Firestore cho mọi nhân viên đọc ghi.
6. Hóa đơn điện tử, đối soát ngân hàng: chưa làm (đã giữ MST, địa chỉ khách).
7. Một số đơn giá trong phụ lục có dấu hiệu lỗi hoặc giá trọn gói theo nhóm: xem file Ra_soat_bang_gia.

## Kiểm thử
`tools/tests/test110.py`: 30 kiểm tra (lập, soát, duyệt, thanh toán, công nợ, phân quyền theo phòng, báo giá). Hồi quy test103, 106, 108, 109 đều đạt.
