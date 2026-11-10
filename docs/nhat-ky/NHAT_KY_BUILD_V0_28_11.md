# Nhật ký build 0.28.11 (11/11/2026)
Sửa lỗi nạp bố cục in, lỗi Excel báo «XML error» ở hai biểu mẫu đo K, bỏ chữ «Số báo cáo:» ở góc phiếu, gom lại các tab.

## 1. Nạp bố cục in báo «File có macro, liên kết ngoài hoặc ActiveX»
- Nguyên nhân: kiểm tra cũ chặn mọi file có đuôi `.bin` trong gói. Excel tự thêm `xl/printerSettings/printerSettings1.bin` mỗi khi lưu file trên máy có cấu hình máy in, nên file người dùng chỉnh rồi lưu lại bị chặn nhầm dù không có macro.
- Sửa: chỉ chặn `vbaProject`, `externalLinks`, `activeX`, `oleObject`, thư mục `embeddings`, đuôi `.xlsm`. Gói có `printerSettings*.bin` được nạp bình thường; gói có `vbaProject.bin` vẫn bị chặn.
## 2. Excel báo «We found a problem… sheet2.xml … XML error» (BM-DK-01_DO_K_DV, BM-DK-02_DO_K_PR)
- Nguyên nhân: ở sheet So_lieu của hai biểu mẫu đo K, phần tử `sheetProtection` bị đặt sau `mergeCells` và `dataValidations`. Lược đồ Excel bắt buộc đúng thứ tự phần tử nên Excel thay sheet bằng bản rỗng.
- Sửa: thêm `wsReorder` sắp lại các phần tử con của worksheet theo đúng thứ tự lược đồ trước khi ghi. Chỉ hai loại đo K bị; 29 loại còn lại đã đúng thứ tự (test149 kiểm cả 31 loại).
## 3. Số báo cáo ở góc trái trên
- Ô số báo cáo của mọi phiếu chỉ còn mã dạng `BC.YY.MM.DD.stt`, bỏ tiền tố «Số báo cáo: » (cả khi chưa cấp số, công thức cũng bỏ tiền tố). Không đổi ô gộp nên bố cục đã nạp không bị vô hiệu.
- Dòng cuối phiếu «Số báo cáo … / Tra cứu» và đầu bản nháp trên web giữ nguyên.
## 4. Gom tab (chỉ đổi chỗ hiển thị, không đổi luồng nghiệp vụ)
- Thông báo nằm trong Cài đặt; Sửa đổi phiếu nằm trong Hồ sơ lưu trữ. Mỗi trang có thanh tab con ở đầu trang (Thông báo | Thiết lập; Hồ sơ | Sửa đổi phiếu).
- Người không có quyền thiết lập: «Cài đặt» chỉ mở Thông báo (thanh tab con ẩn). Chuông thông báo và đường dẫn cũ `#thong-bao`, `#sua-phieu` vẫn hoạt động; số chưa đọc hiển thị ở mục Cài đặt, số yêu cầu sửa ở mục Hồ sơ lưu trữ.
## Quy tắc chỉnh biểu mẫu để nạp không lỗi
1. Chỉ chỉnh trên sheet Phieu_KQ: độ rộng cột, chiều cao hàng, lề, tỷ lệ in, ngắt trang, vị trí và kích thước biểu đồ.
2. Không gộp hoặc bỏ gộp ô, không thêm/xóa hàng cột, không đổi chữ và công thức (hệ thống so cấu trúc ô gộp để nhận biết).
3. Lưu dạng .xlsx; không dùng .xlsm, macro, liên kết ngoài, ActiveX, đối tượng nhúng.
4. Tổng độ rộng cột nằm trong vùng in A4 (khoảng 18,8 cm); hệ thống cảnh báo khi vượt.
5. Nạp đúng loại phiếu; hệ thống hiện bảng so sánh trước khi áp dụng.
6. File Excel tự thêm printerSettings là bình thường, không còn bị chặn.
## Kiểm thử
- test149 (mới): 66 đạt (31 biểu mẫu đúng thứ tự phần tử; số báo cáo chỉ gồm mã; printerSettings được nạp; vbaProject bị chặn). test148 (gom tab): 16 đạt. test147, 136, 137, 142–146 đạt. test111, 113 cập nhật theo menu mới. Lỗi cũ giữ nguyên như HEAD: test127 (2), test131 (12), test116/117/132/141 (test cũ lỗi).
