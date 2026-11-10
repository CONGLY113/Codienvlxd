# Nhật ký build 0.28.9 (10/11/2026)
## 1. Biểu mẫu gốc = phiếu hệ thống đang sinh
- Nút «Tải file mẫu», «Tải bản đang dùng», «Tải bản gốc» và hai nút tải tất cả (.zip) trong tab Biểu mẫu báo cáo nay dựng file bằng đúng bộ dựng phiếu của hệ thống (lề, tỷ lệ in, cột, hàng, biểu đồ, ô ký, dòng số báo cáo) với số liệu minh họa. Không còn lệch giữa file tải ở tab Biểu mẫu và file lúc sinh số báo cáo.
- «Bản gốc» = bố cục hệ thống sinh khi chưa nạp bố cục nào. «Bản đang dùng» = bản gốc cộng bố cục đã nạp.
- tools/export_demo_templates.py xuất 31 file mẫu gốc ra thư mục để lưu trữ, đối chiếu.
## 2. Bố cục in chung của từng loại mẫu (chỉnh một lần, mọi phiếu dùng)
- Quy trình: tải một file báo cáo bất kỳ (hoặc file mẫu), mở Excel chỉnh lề, độ rộng cột, chiều cao hàng, tỷ lệ in, ngắt trang, vị trí và định dạng biểu đồ trên sheet Phieu_KQ, lưu, rồi bấm «Nạp bố cục in» ở đúng loại mẫu.
- Hệ thống chỉ lấy phần kích thước và định dạng biểu đồ. Ô gộp, chữ, công thức, số liệu không bao giờ bị đổi (kiểm thử so từng ô trước và sau khi áp).
- Kiểm tra khi nạp: không macro hay liên kết ngoài; cấu trúc ô gộp phải khớp phiếu hệ thống đang sinh; áp thử lên phiếu minh họa rồi trích lại để chắc chắn giữ nguyên; cảnh báo khi nội dung rộng hơn vùng in A4; bắt buộc ghi nội dung chỉnh sửa; xem khác biệt so với bố cục đang dùng.
- Áp dụng khi dựng file lúc phát hành, và áp lên cả phiếu đã phát hành khi xem và tải (kể cả báo cáo cũ nếu cấu trúc ô gộp khớp). Số liệu đã phát hành không đổi.
- Lưu ở config/layf_<mã loại>, lịch sử trong mauh (kind = layout), nội dung từng bản trong mauv. Có Lịch sử, Khôi phục, Quay về gốc như biểu mẫu đầy đủ. Bản chỉnh đầy đủ cũ vẫn dùng được (nút «Nạp bản đầy đủ»), hai loại chồng được lên nhau.
- Biểu đồ: chỉ thay phần định dạng, vùng số liệu giữ theo từng phiếu; trục đường đầm chặt vẫn tính theo số liệu mẫu.
## 3. Hiển thị web giống file Excel
- Khung giấy A4: lề, tỷ lệ in, ô gộp, vạch ngắt trang đỏ (tự động và thủ công), cảnh báo «tràn lề phải», dòng thông tin trang, lề, tỷ lệ.
- Ô cố định theo chiều cao hàng như Excel (chữ thừa bị cắt, không tự nới hàng). Chữ tự xuống dòng đo rộng hơn Excel vài % được thu tối đa 8%.
- Biểu đồ: đọc đường lưới, đường trục, tick, viền biểu đồ, nền vùng vẽ (kể cả màu theme), vị trí chú giải, tiêu đề (cỡ, đậm), vị trí tuỳ chỉnh (manualLayout) của vùng vẽ, tiêu đề, chú giải.
## 4. Liên kết dữ liệu nguồn
- Cấp phối bê tông, cấp phối vữa nhận cát, đá, xi măng chỉ khi cùng công trình và cùng phiếu yêu cầu. Đo K và đầm chặt chỉ cần cùng công trình.
- Chỉ liệt kê phiếu đã phát hành, có kết quả. Chỉ có một nguồn hợp lệ thì tự liên kết; nhiều nguồn thì phải chọn; có hộp xác nhận nguồn đã liên kết, cảnh báo đỏ khi nguồn không hợp lệ. Kiểm tra lại khi nộp.
## Kiểm thử
- test142 (10/10 liên kết), test143 (31 loại mẫu: dựng mẫu, trích, áp, trích lại, phiếu cũ, ô không đổi, biểu đồ), test144 (hộp thoại nạp, lịch sử, khôi phục, quay về gốc).
