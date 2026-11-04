# Nhật ký build 0.12.0 (04/11/2026), nền 0.11.0
Mục tiêu: làm hai việc còn treo từ đầu: **lưu giữ hồ sơ sau 90 ngày (0.8.1)** và **tra cứu hồ sơ lưu bằng mã QR (0.8.2)**, để kho dữ liệu dùng chung không đầy khi mỗi tháng có khoảng 1500 phiếu.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc cách app chia dữ liệu theo kỳ nửa tháng, trang Hồ sơ lưu trữ và trang Tra cứu hiện có | Xong |
| 2 | Thiết kế: gói ZIP mỗi kỳ, chỉ mục gọn, điều kiện xóa an toàn | Xong |
| 3 | Đóng gói kỳ: mẫu, số liệu gốc, nhật ký, file Excel gốc, chỉ mục CSV, mã băm SHA-256 từng file, tùy chọn kèm phiếu A4 | Xong |
| 4 | Kiểm tra lại gói do người dùng chọn lại file, rồi mới ghi chỉ mục và xóa | Xong |
| 5 | Tra cứu hồ sơ lưu: quét QR phiếu cũ ra thông tin và mã băm; mở file ZIP xem lại toàn bộ phiếu | Xong |
| 6 | Giao diện: trang Hồ sơ lưu trữ có 3 tab, nhắc kỳ đến hạn ở trang Tổng quan | Xong |
| 7 | Chạy thử Chrome thật (CSDL giả), kỳ 700 hồ sơ, hồi quy | Xong |
| 8 | Xuất bản 0.12.0 (Version 10 của artifact) | Xong |
| 9 | Làm thử một kỳ thật nhỏ trên CSDL thật | Chờ anh |

## Cách hoạt động
- **Hạn 90 ngày** tính từ ngày cuối của kỳ nửa tháng (kỳ a: ngày 1 đến 15, kỳ b: ngày 16 đến cuối tháng). Ví dụ kỳ 15/06/2026 đến hạn từ 14/09/2026.
- **Chỉ Trưởng phòng TN** thao tác ở tab Gói lưu giữ. Mỗi kỳ đến hạn có nút Lưu giữ kỳ này, mở cửa sổ 3 bước:
  1. Tạo gói ZIP và lưu file ra máy.
  2. Chọn lại chính file vừa lưu. App kiểm tra từng file trong gói khớp mã băm trong manifest.json.
  3. Chỉ khi bước 2 đạt, nút xóa mới sáng, phải bấm hai lần. Trước khi xóa, app đọc lại từng mẫu và chi tiết trên kho, so với gói; mẫu nào đã thay đổi sau khi đóng gói thì giữ lại.
- **Phạm vi**: mẫu đã phát hành và mẫu từ chối. Mẫu chưa xong luôn ở lại trực tuyến. Kỳ hết mẫu thì bị đóng (bỏ khỏi danh sách kỳ đang mở). Mẫu cũ (id s_xxx, chưa chia kỳ) chưa thuộc phạm vi.
- **Trong gói ZIP**: manifest.json (mã băm mọi file), chi-muc.csv (mở bằng Excel), DOC-TOI.txt (hướng dẫn), mỗi hồ sơ một thư mục gồm mau.json, chi-tiet.json (số liệu gốc, nhật ký, dữ liệu niêm phong), file-goc.xlsx và phieu.xlsx (nếu chọn kèm).
- **Chỉ mục còn lại trên kho**: archive/ix_<yymm>_<kỳ>_<lần>_<k> (150 dòng mỗi tài liệu: số báo cáo, mã mẫu, loại, khách, công trình, ngày phát hành, mã băm phiếu, tên gói) và archive/run_... (tên gói, số hồ sơ, SHA-256 của gói). Khóa theo **tháng của số báo cáo** vì số báo cáo lấy ngày theo ngày nhận mẫu, có thể khác kỳ lưu của mẫu.
- **Tra cứu QR**: quét QR phiếu đã lưu giữ ra trang Tra cứu với thông tin chỉ mục và mã băm niêm phong. Người dùng đăng nhập có thể chọn file ZIP để xem toàn bộ phiếu.
- **Tab Đã lưu giữ**: tìm trong chỉ mục, danh sách các gói; Mở file ZIP lưu giữ để xem phiếu, số liệu gốc, nhật ký, tải lại phiếu A4 (tạo lại từ dữ liệu niêm phong) và file Excel gốc. Có báo Nguyên vẹn hoặc KHÔNG KHỚP theo mã băm.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật)
- File không phải ZIP, gói sửa 1 byte, gói của kỳ khác: đều bị chặn, nút xóa vẫn khóa.
- Mẫu bị sửa sau khi đóng gói được giữ lại (bỏ qua 1), 6 hồ sơ chuyển sang lưu giữ, kỳ còn 2 mẫu; đóng gói lần 2 chuyển nốt mẫu đã sửa.
- Kỳ chỉ có mẫu xong: lưu giữ hết, kỳ được đóng, kho không còn bộ sưu tập kỳ đó.
- Quét QR: phiếu kỳ 2606a ra thông tin và mã băm khớp; phiếu có số báo cáo tháng 5 nhưng nằm kỳ 2606b cũng ra đúng; số báo cáo sai báo không tìm thấy; phiếu chưa lưu giữ vẫn xem như cũ.
- Mở ZIP: phiếu hiện đủ, báo nguyên vẹn, tải được phiếu A4 (đúng mã biểu mẫu) và file gốc.
- Tài khoản không phải Trưởng phòng TN thấy thông báo chỉ Trưởng phòng được lưu giữ.
- Kỳ 700 hồ sơ (gần mức tối đa của nửa tháng): đóng gói 2,9 giây, gói 35 MB, kiểm tra 1 giây, 5 tài liệu chỉ mục.
- Hồi quy: 17 trang, kết quả các loại mẫu giống hệt 0.11.0, form điện thoại và cấp phối không lỗi.

## Hạn chế và việc cần lưu ý
- Chưa chạy trên CSDL thật: tốc độ xóa 3 tài liệu mỗi mẫu qua mạng chưa biết; nên làm thử một kỳ nhỏ trước.
- Gói ZIP nằm ngoài hệ thống: **phải tự sao lưu hai nơi**. Mất file ZIP là mất số liệu gốc (chỉ mục trực tuyến chỉ có thông tin tóm tắt và mã băm).
- Cấp phối bê tông chọn phiếu nguồn đã lưu giữ: phải nhập tay số liệu (app báo cảnh báo nhập tay không liên kết).
- Trang Thống kê chỉ tính dữ liệu đang trực tuyến.
- Mẫu cũ id s_xxx (trước 0.8.0) chưa lưu giữ được.
- Trang Hồ sơ lưu trữ đang mở thì dữ liệu mẫu vừa xóa biến mất khỏi danh sách trực tuyến (đúng thiết kế).

## Cần anh xác nhận
1. Mốc 90 ngày tính từ cuối kỳ nửa tháng (đề xuất) hay từ ngày phát hành từng phiếu?
2. Gói có kèm file phiếu A4 mặc định không? Hiện để tùy chọn, mặc định tắt (nhanh hơn; app vẫn tạo lại phiếu từ dữ liệu niêm phong khi mở ZIP).
3. Nơi lưu gói ZIP (ổ mạng phòng, Google Drive...) và ai giữ để QR tra cứu có người hỗ trợ khách khi cần xem phiếu cũ.
4. Khách hàng chỉ thấy thông tin tóm tắt khi quét QR phiếu đã lưu giữ. Anh muốn hiện thêm gì (kết luận đạt/không đạt, bảng kết quả)? Việc này cần lưu thêm dữ liệu vào chỉ mục.

## Việc tiếp theo đề xuất
1. Làm thử lưu giữ một kỳ thật nhỏ, ghi lại thời gian xóa.
2. Giao nhiệm vụ nhanh theo bảng phân công, phiếu yêu cầu bản in (cần anh trả lời các câu ở file TONG_HOP_MAU_VA_CAU_HOI_V0_11_0.xlsx).
3. In Thiết bị thử nghiệm trên phiếu phát hành, tab Quan trắc đá 5x20, sửa lệch ô nguồn gốc ở biểu mẫu cũ.
