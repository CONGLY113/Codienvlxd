# Nhật ký build v0.25.0 (06/11/2026)

## Yêu cầu
Nghiên cứu Văn bản hợp nhất 54/VBHN-BXD (Bộ Xây dựng) về thí nghiệm chuyên ngành xây dựng, nêu điểm cần bổ sung khi sửa phiếu; xây dựng quy trình sửa đổi để trình ban hành; thực hiện chức năng đó trong web app, không thay đổi luồng nghiệp vụ cũ.

## Kết quả nghiên cứu (tóm tắt, chi tiết ở file Word quy trình, mục 8)
- Phụ lục III: phiếu kết quả có 9 nội dung bắt buộc; phiếu thay thế dùng cùng mẫu BM nên vẫn đủ.
- Điều 5 (điều kiện hoạt động, gồm ISO/IEC 17025) làm mục 7.8.8 thành yêu cầu phải tuân thủ.
- Điều 5c: tổ chức tự công bố, chịu trách nhiệm trước pháp luật, nên hồ sơ sửa phải đủ để chứng minh.
- Điều 8a khoản 4: báo cáo hằng năm trước 15/12; số liệu sửa phiếu nên có sẵn.
- Đính chính: Điều 7 (đình chỉ, hủy giấy chứng nhận) đã bị bãi bỏ trong bản hợp nhất; trả lời trước đó nhắc Điều 7 là chưa đúng. Không viện dẫn Điều 7.
- Không thấy quy định riêng về thời hạn lưu phiếu hay thủ tục đính chính trong phần đã đọc. Toàn văn một số điều không truy cập đủ; cần đối chiếu bản chính thức trước khi ban hành.

## Đã làm
1. Mục mới "Sửa đổi phiếu" (menu cho giao nhận mẫu, Trưởng phòng, soát xét, phê duyệt). Ba loại hồ sơ:
   - A: phòng ghi nhầm, ghi sót (bằng chứng đối chiếu, miễn phí).
   - B: khách đề nghị đổi thông tin do khách cung cấp (văn bản đề nghị, phí hành chính nếu có).
   - D: liên quan mẫu, chỉ tiêu, kết quả, hoặc đổi ngày nhận mẫu theo ý khách: không sửa, ghi nhận từ chối.
2. Nội dung được sửa: tên khách hàng, tên công trình, hạng mục, chủ đầu tư, tư vấn giám sát, đơn vị thi công, địa chỉ; ngày nhận mẫu chỉ ở loại A, do Trưởng phòng lập, hệ thống chặn nếu trước ngày lấy mẫu, sau ngày bắt đầu thử, ở tương lai, hoặc làm lệch tuổi mẫu.
3. Luồng: lập đề nghị, soát xét, phê duyệt và phát hành phiếu thay thế, xác nhận thu hồi bản cũ (ba tình huống), đóng hồ sơ. Có từ chối, hủy. Người lập không tự soát xét, phê duyệt (cả giao diện lẫn hàm ghi dữ liệu).
4. Phiếu thay thế: số = số gốc + "-SĐ01", "-SĐ02"...; Excel có dòng "Phiếu này thay thế phiếu số ... Nội dung thay đổi ..."; mã băm SHA-256, QR mới. Phiếu cũ lưu nguyên trong hồ sơ suadoi, tải lại được với dòng "ĐÃ BỊ THAY THẾ".
5. Tra cứu QR: số cũ báo "đã bị thay thế" và chỉ phiếu hiện hành; số mới báo "bản sửa đổi lần n".
6. Phê duyệt ghi dữ liệu theo thứ tự an toàn: kiểm tra lại, lưu giá trị cũ, phát hành, cập nhật mẫu; lỗi giữa chừng thì hoàn lại. Ghi đủ các đối tượng con (khách, dự án, mẫu, phiếu) để chạy đúng với Firestore (cập nhật thay cả nhánh).
7. Biểu mẫu in BM-SĐ-01 (đề nghị điều chỉnh), BM-SĐ-02 (biên bản đính chính, thu hồi); sổ theo dõi xuất CSV; sao lưu Excel thêm sheet Sua_phieu.
8. Giữ nguyên: số báo cáo gốc vẫn là khóa của thanh toán, bảng kê, lưu trữ, tra cứu; hồ sơ lưu trữ hiển thị thêm biểu ngữ phiên bản và nút "Đề nghị sửa phiếu".
9. Hộp đăng nhập, PWA (cài lên màn hình điện thoại, có icon logo) ở bản Firebase: đã thêm từ cuối bản 0.24.0 (manifest, icon, service worker tối thiểu).
10. Tài liệu: QUY_TRINH_SUA_DOI_THAY_THE_PHIEU_KET_QUA_DU_THAO.docx (9 trang: mục đích, phạm vi, căn cứ, nguyên tắc, phân loại, 8 bước, trường hợp đặc biệt, trách nhiệm, bổ sung từ 54/VBHN-BXD, biểu mẫu, hướng dẫn thao tác, phụ lục bảng kiểm và mẫu đề nghị của khách).

## Lỗi gặp và sửa trong lúc kiểm thử
- Sau khi gửi đề nghị, hộp chi tiết không mở vì danh sách chưa kịp nhận dữ liệu: thêm chờ ngắn (sdOpenSoon).
- Hàm phê duyệt không tự kiểm tra trạng thái và quyền (chỉ giao diện kiểm tra): thêm kiểm tra trong chính hàm, tránh phát hành nhầm khi gọi lại hoặc gọi sai bước.

## Kiểm thử
- test108 (mới): 79 mục đạt, 0 lỗi, trên dữ liệu giả lập: phiếu mẫu mới (chi tiết tách riêng) và mẫu cũ (file phiếu lưu riêng); lập đề nghị bằng giao diện; soát xét, phê duyệt theo từng người; mã băm khớp snap; tên file, dòng thay thế, số SĐ01, SĐ02; tra cứu số cũ, số mới; thu hồi; chặn trùng hồ sơ; chặn khi giá trị cũ lệch; kiểm tra ngày; loại D; biểu mẫu in; sao lưu có suadoi; mọi trang dựng được cho từng vai trò; thủ quỹ không thấy menu.
- Hồi quy: test103 (155 đạt, 0 lỗi), test106, test101, test_fb (cầu nối Firebase giả lập) đạt. test100 lỗi như bản 0.24.0 (kịch bản cũ, không do thay đổi này).

## Giới hạn
- Chỉ sửa được phiếu đang đã phát hành trong hệ thống; hồ sơ đã chuyển lưu trữ quá 90 ngày chưa hỗ trợ.
- Bảng kê, hóa đơn không tự cập nhật tên mới (có cảnh báo cho kế toán).
- Đổi ngày nhận mẫu không đổi mã mẫu đã cấp.
- Tra cứu QR người ngoài vẫn dựa trên chỉ mục lưu trữ công khai.
- Chưa chạy trên Firebase thật. Quy trình là dự thảo, cần đối chiếu bản chính thức của văn bản hợp nhất và tư vấn pháp lý trước khi ban hành.
