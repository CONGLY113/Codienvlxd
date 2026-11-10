# Nhật ký build 0.28.7 (10/11/2026)
## Phiếu KQ theo biểu mẫu .xls
- Đo chống sét (BM-CS-01): dựng lại theo form: 10 dòng thông tin (Chỉ tiêu, Công trình … Thiết bị, Ngày đo), bảng TT | Vị trí | ĐVT | 3 lần đo | Trung bình | Ghi chú (ô gộp «Sơ đồ vị trí … mặt sau»), 15 điểm đo, chức danh ký, ngày tháng.
- Đá dăm 5x20, đá 10-40, đá gốc, thép hình, thép xây dựng, bu lông, đầm chặt cát, cấp phối đá dăm loại I/II, cấp phối thiên nhiên: thêm dòng «Thiết bị thử nghiệm» (giá trị mặc định lấy theo form .xls, ưu tiên thiết bị khai ở Thong_tin) và chức danh «TƯ VẤN GIÁM SÁT / ĐƠN VỊ THI CÔNG»; bỏ nền màu tiêu đề bảng thép; giữ khối ký trong một trang.
- Luồng dữ liệu So_lieu/Thong_tin → Phieu_KQ không đổi.
## Rà soát đồng thời nhiều người (10 người cùng tạo dữ liệu)
- Cấp số mã mẫu / phiếu yêu cầu / báo cáo: trước đây dùng khóa hết hạn 4 giây không trả khóa, người thứ 2..10 chờ tối đa 5 giây rồi cấp số KHÔNG khóa → có thể trùng số. Nay dùng giao dịch Firestore tăng-một (fb-shim: incr), thử lại có giãn cách; khóa cũ chỉ còn là phương án dự phòng.
- Phiếu yêu cầu dùng chung cả tháng (nén, đo K): tạo-nếu-chưa-có bằng giao dịch (fb-shim: setOnce).
- Nhật ký thao tác, nộp kết quả, phát hành: trước đây đọc cả tài liệu chi tiết rồi ghi đè toàn bộ → có thể mất dữ liệu người khác vừa lưu; nay ghi gộp theo từng trường.
- Kiểm thử mới: tools/tests/test138.py (10 lời gọi cấp số đồng thời → 10 số khác nhau).
