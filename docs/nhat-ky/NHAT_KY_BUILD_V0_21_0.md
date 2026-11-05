# Nhật ký build 0.21.0 và bản vá 0.21.1 · 05/11/2026

**Yêu cầu:** Tab "Biểu mẫu báo cáo" hiển thị tất cả biểu mẫu gốc của các loại mẫu; có nút tải xuống và upload để chỉnh nội dung, bố cục (chủ yếu sheet Phieu_KQ); cán bộ thí nghiệm cũng được chỉnh; lưu vết quá trình chỉnh sửa.

## Đã làm
1. **Danh sách 31 loại mẫu** (cát, đá, xi măng, thép, gạch, nhựa đường, nén bê tông/vữa, đo K, cấp phối, đầm chặt cát, bu lông…): mã biểu mẫu, bản đang dùng (gốc/bản chỉnh), người và thời điểm chỉnh gần nhất. Có ô tìm kiếm.
2. **Nút trên từng dòng:** Tải bản đang dùng (hoặc Tải biểu mẫu), Tải bản gốc, Nạp bản chỉnh, Lịch sử, Dùng lại bản gốc. Phía trên: tải tất cả bản đang dùng (.zip), tải tất cả bản gốc (.zip), Nhật ký chỉnh sửa chung.
3. **Kiểm tra bản nạp theo đúng biểu mẫu gốc của loại đó:** đủ sheet đúng thứ tự, không macro, đủ tên vùng, các sheet dữ liệu không bị sửa công thức/nội dung, Phieu_KQ giữ khổ A4 và lề, còn biểu đồ, còn công thức nối số liệu, còn tiêu đề chữ ký. Không đạt thì không cho áp dụng. Tên vùng nằm trên Phieu_KQ được phép dời vị trí khi sửa bố cục.
4. **Lưu vết:** mỗi lần nạp bắt buộc ghi "Nội dung chỉnh sửa"; hệ thống tự tóm tắt khác biệt so với bản đang dùng (số ô sửa, cột đổi rộng, hàng đổi cao, ô gộp, lề, biểu đồ, định dạng). Mỗi bản có số thứ tự, người, giờ, tên file, kích thước, mã băm SHA-256. Lịch sử không ghi đè, không xóa; từng bản tải về lại được; **Khôi phục** bản cũ (tạo bản mới ghi rõ khôi phục từ bản nào); **Dùng lại bản gốc** cũng được ghi. Mọi thao tác ghi thêm vào Nhật ký hệ thống.
5. **Quyền:** Trưởng phòng, Quản lý chất lượng và Cán bộ thử nghiệm thấy tab và được nạp/khôi phục. Giám đốc, giao nhận mẫu, thủ quỹ, kế toán không thấy tab.
6. **Áp dụng:** phiếu và file Excel tải về của loại mẫu nào dùng bản đang dùng của đúng loại đó (`buildTemplate`). Loại khác không bị ảnh hưởng.
7. **Tương thích:** bản cát đã nạp theo cách cũ (config/mau_kq) tự hiển thị là "Tùy chỉnh (bản nạp trước 0.21.0)"; tên người ký và nét biểu đồ giữ nguyên (mục 2, 3 của trang).

## Dữ liệu
- `config/mauf_<mã loại>`: bản đang dùng.
- `mauh/<id>`: lịch sử (không chứa file).
- `mauv/<id>`: nội dung file từng bản (đọc khi tải/khôi phục).

## Kiểm thử (Playwright)
- 31/31 biểu mẫu gốc tự đạt bộ kiểm tra của chính loại đó.
- 31/31 loại: sửa độ rộng cột Phieu_KQ vẫn đạt, tóm tắt khác biệt nhận ra "đổi độ rộng cột".
- Chặn đúng: mất tên vùng, đổi khổ giấy, đổi lề, sửa công thức sheet dữ liệu, bỏ biểu đồ, có macro, file của loại khác.
- Giao diện cán bộ thử nghiệm NS004: thấy tab, 31 dòng, tìm kiếm, nạp, bắt buộc ghi chú, lịch sử, nạp lần 2, khôi phục bản 1, về bản gốc, nhật ký chung; buildTemplate dùng bản sửa, loại khác không đổi; Giám đốc/Thủ quỹ/Giao nhận không thấy tab; di động 390 px.
- Hồi quy test101, test98, smoke92, test100m, test93, ui93: đạt, không lỗi console.
- Kho dữ liệu thật: ghi/xóa thử collection mới thành công.

## Lưu ý
- Giới hạn file nạp 200 KB.
- Lề và khổ A4 bắt buộc giống biểu mẫu gốc (vì in trên giấy có tiêu đề).
- Chưa thử trong Excel thật việc người dùng lưu lại file sau khi chỉnh (Excel có thể thêm thành phần mới); nếu bị từ chối oan, gửi file để nới luật kiểm tra.

## Bản vá 0.21.1 (13:58 05/11)
**Lỗi:** cán bộ tải biểu mẫu gốc cát, chỉnh chiều cao hàng và nét biểu đồ trong Excel, lưu lại rồi nạp thì bị từ chối: "So_lieu bị sửa 25 ô, Kiem_tra 14 ô, _HeThong C16 đổi nội dung".

**Nguyên nhân:** bộ kiểm tra so công thức ở dạng chữ thô trong XML. File gốc ghi dấu nháy kép là `&quot;`, Excel khi lưu lại ghi `"` nên khác nhau dù công thức giống hệt. Ô _HeThong C16 tương tự (ký tự mã hóa, xuống dòng).

**Sửa:** giải mã đúng các ký tự XML trước khi so, bỏ qua khác biệt khoảng trắng và xuống dòng, chuẩn hóa dấu nháy đơn trong tên vùng. Bỏ cảnh báo font tên người ký (Excel tự xóa font không dùng; hệ thống tự thêm lại khi tải phiếu).

**Thử:** 31/31 biểu mẫu gốc ở dạng "Excel lưu lại" có đổi chiều cao hàng và nét biểu đồ đều đạt; các lỗi cố ý (mất tên vùng, đổi A4, đổi lề, sửa công thức, bỏ biểu đồ, macro, file loại khác) vẫn bị chặn; thử thêm vòng ghi lại bằng LibreOffice 6 loại; hồi quy đạt.
