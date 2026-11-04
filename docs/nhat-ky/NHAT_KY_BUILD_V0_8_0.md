# Nhật ký build 0.8.0 (04/11/2026), nền 0.7.13
Mục tiêu: chịu được 1500 phiếu mẫu/tháng, 8 người dùng cùng lúc, giữ trực tuyến 90 ngày rồi lưu giữ ra ngoài, internet ổn định, không cần ngoại tuyến.

## Phát hiện quyết định hướng làm (đọc db.d.ts của nền tảng)
- Cơ sở dữ liệu của trang chứa TỐI ĐA 25.000 tài liệu tổng cộng; mỗi tài liệu tối đa 256 KiB.
- Lọc, sắp xếp quét cả bộ sưu tập, không có chỉ mục: nên giữ mỗi bộ sưu tập ở mức vài trăm đến vài nghìn tài liệu.
- Bản 0.7.13 mỗi mẫu tạo ~10 tài liệu: 1 mẫu + 6 đến 8 dòng nhật ký (audit) + 2 file (file nộp, file phiếu).
  => 1500 mẫu/tháng = ~15.000 tài liệu/tháng: ĐẦY SAU ~1,7 THÁNG. Đây là điểm nghẽn cứng, nghiêm trọng hơn dự đoán ban đầu.

## Thiết kế mới (mục tiêu: 3 tài liệu/mẫu, mỗi tháng một bộ sưu tập)
| Thành phần | Cũ | Mới |
|---|---|---|
| Mẫu | samples/{id} đầy đủ | samples_YYMM/{id}: bản NHẸ (không raw, sieve, checks, devs, snap) |
| Chi tiết | nằm trong mẫu | detail_YYMM/{id}: raw, sieve, checks, devs, snap, nhật ký (log) |
| File nộp | files/f_{id}_{time} mỗi lần nộp | blob_YYMM/{id}: ghi đè khi nộp lại |
| File phiếu | files/f_{id}_bc | KHÔNG lưu; tạo lại từ dữ liệu niêm phong khi tải (đã làm ở 0.7.13) |
| Nhật ký | audit/a_xxx: 1 tài liệu/thao tác | detail.log (mảng), mẫu nhẹ giữ last_at, last_by, last_action |
- id mẫu mới = 's'+YYMM+'_'+rid(): suy ra bộ sưu tập từ id, không cần tra cứu.
- Dữ liệu cũ (id s_xxx, bộ sưu tập samples, files, audit) vẫn đọc được, không bắt buộc chuyển đổi.
- Danh sách tháng đang mở lưu ở config/months; chỉ nạp các tháng này (khoảng 90 ngày).
- Quy mô sau khi sửa: 90 ngày x 4500 mẫu x 3 = ~13.500 tài liệu (54% hạn mức 25.000).

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 0 | Đo, đọc giới hạn nền tảng, thiết kế | Xong |
| 1 | Hàm đường dẫn theo tháng (sp, dp, bp), id mẫu mới, nạp nhiều bộ sưu tập | Xong |
| 2 | Tách nhẹ/nặng khi nộp, phát hành; đọc chi tiết khi mở mẫu | Xong |
| 3 | Nhật ký vào detail.log, bỏ Data.watch('audit') toàn bộ | Xong |
| 4 | Đồng hồ dung lượng ở Tổng quan (số tài liệu ước tính / 25.000) | Xong |
| 5 | Kiểm thử trên Chrome thật bằng dữ liệu giả (mô phỏng 1500 mẫu) | Xong |
| 6 | Xuất bản 0.8.0 | Xong (xem dưới) |
| 7 (0.8.1) | Lưu giữ: gói ZIP theo tháng (phiếu, file gốc, dữ liệu), chỉ mục lưu giữ, xóa khỏi DB sau khi xác nhận | Hẹn bản sau |
| 8 (0.8.2) | Tra cứu phiếu đã lưu giữ qua QR, tìm kiếm theo tháng | Hẹn bản sau |

## Lưu ý
- Nền tảng artifact phù hợp giai đoạn thí điểm; khi ổn định cần cơ sở dữ liệu thật (PostgreSQL) như đã đề xuất.
- Trước khi có 0.8.1 (lưu giữ), không để dữ liệu thật quá khoảng 2 tháng.

## Điều chỉnh so với thiết kế ban đầu
- Chia theo KỲ NỬA THÁNG (yymm + a: ngày 1-15, b: 16-cuối) thay vì tháng, để mỗi bộ sưu tập dưới 1000 tài liệu (giới hạn truy vấn). id mẫu mới: s<yymm><a|b>_<rid>.
- Danh sách kỳ đang mở lưu ở config/periods; kỳ hiện tại tự thêm.

## Kết quả kiểm thử (Chrome thật, CSDL giả mô phỏng nền tảng; không phải CSDL thật)
- 6 mẫu đi hết quy trình: nộp, duyệt, phát hành, tải Phiếu A4 đúng biểu mẫu (đá BM-DA-01, cát BM-CAT-01); mẫu cũ vẫn tải được.
- 24 tài liệu cho 6 mẫu (3 tài liệu/mẫu + sổ đếm + dữ liệu cũ).
- Mô phỏng 4.516 mẫu: nạp 117 ms, dựng lại 0 ms, trạng thái ~7,2 MB.
- Chế độ cục bộ (không CSDL dùng chung): chạy đúng, nhật ký vào detail.log.
- Không có lỗi trang.

## Hạn chế còn lại
- Nhật ký ghi theo kiểu người ghi sau thắng, hiếm khi mất 1 dòng nếu 2 người thao tác cùng 1 mẫu cùng lúc.
- Mỗi máy nạp ~1,6 KB/mẫu nhẹ (~7 MB ở 4.500 mẫu).
- Trang Quan trắc nạp chi tiết cả kỳ (tối đa ~750 tài liệu/kỳ).
- Chưa có lưu giữ sau 90 ngày: chờ bản 0.8.1; không để dữ liệu thật quá ~2 tháng.
