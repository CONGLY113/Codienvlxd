# Nhật ký build 0.9.0 (04/11/2026), nền 0.8.0
Mục tiêu: thêm biểu mẫu vật liệu mới vào luồng nghiệp vụ đã có (nhận mẫu, giao việc, nhập số liệu, nộp, soát xét, phê duyệt, phiếu A4, QR, tra cứu).

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 10 file Excel mới, lập bảng cấu trúc (xem PHAN_TICH_BIEU_MAU_MOI_V0_9_0.md) | Xong |
| 2 | Phương án phiếu thép: mỗi sheet một số báo cáo | Xong (anh chọn) |
| 3 | Khung dùng chung "GT" (bảng mô tả loại vật liệu) trong app | Xong |
| 4 | Biểu mẫu Excel BM-XM-01 (xi măng PCB40), BM-TH-01 (thép hình), kiểm tra công thức bằng LibreOffice | Xong |
| 5 | Nhập điện thoại, kiểm tra file nộp, soát xét, phiếu xem trước, QR, tải phiếu A4 cho 2 loại | Xong |
| 6 | Chạy thử Chrome thật (CSDL giả), kiểm tra hồi quy cát/đá | Xong |
| 7 | Xuất bản 0.9.0 | Xong |
| 8 (0.9.x) | Đá 10-40, Đá gốc, Đá láng nhựa | Chưa |
| 9 (0.9.x) | Gạch 2 lỗ, gạch đặc, gạch 6 lỗ | Chưa |
| 10 (0.9.x) | Thép xây dựng + nút tách theo nhóm đường kính | Chưa |
| 11 (0.9.x) | Cấp phối bê tông | Chưa |
| 12 (0.8.1 cũ) | Lưu giữ sau 90 ngày | Chưa, vẫn cần trước khi dữ liệu thật quá 2 tháng |

## Xi măng PCB40 (BM-XM-01)
- Chỉ tiêu: độ mịn (2 lần, sót sàng 0,09 mm), đông kết bắt đầu và kết thúc, ổn định thể tích Le Chatelier (2 kim), cường độ nén 3 ngày (6 viên 40x40), quy về 28 ngày phương pháp nhanh (6 viên tự nhiên, 6 viên luộc, h, K).
- Công thức giữ đúng file cũ. R0 và Rch lấy trung bình 4 viên lớn nhất; R28 = K x Rch; K tra bảng.
- Mức yêu cầu PCB40 (TCVN 6260:2009) lấy từ file cũ: mịn <= 10; bắt đầu >= 45; kết thúc <= 420; ổn định <= 10; R3 >= 18; R28 >= 40. Ghi ở _HeThong, app khóa theo bản ban hành.
- Cần anh xác nhận: bảng K của file cũ thiếu h = 1,6 và h > 2,2. App chặn nộp khi h rơi ngoài bảng (báo "VƯỢT"). Cần bổ sung K cho các h này nếu có.
- Cần anh xác nhận: file cũ lấy trung bình cả 6 viên R3. Biểu mẫu mới giữ nguyên và chỉ cảnh báo (LƯU Ý) nếu viên nào lệch TB quá 10 % (TCVN 6016 yêu cầu xem xét loại).

## Thép hình (BM-TH-01)
- Mỗi phiếu tối đa 12 thanh. Nhập: ký hiệu, dày a, rộng b, lực chảy, lực đứt, dãn dài, thử uốn (Không nứt / Nứt).
- Tiết diện = a x b (file cũ tách chuỗi "10.0 x 37.2" bằng LEFT/RIGHT, dễ sai nên đổi thành 2 ô số).
- Giới hạn chảy, giới hạn đứt = lực x 1000 / tiết diện.
- Yêu cầu kỹ thuật (mác thép, giới hạn chảy, đứt, dãn dài tối thiểu) nhập theo từng phiếu; để trống thì phiếu không kết luận đạt hay không (không tự đặt tiêu chuẩn).

## Sửa lỗi cũ phát hiện khi làm
- File Excel phiếu A4 (cát, đá) trước đây: mã QR không được chèn vào hình vẽ và vùng in không mở rộng tới khối QR, mã băm. Đã sửa (đọc đúng thẻ drawing và tên vùng in, thêm kiểu png vào [Content_Types]). Đã kiểm tra bằng LibreOffice cho cát, đá, xi măng, thép hình.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật của nền tảng)
- Xi măng và thép hình: tạo mẫu, tải biểu mẫu, nhập số liệu mẫu, phân tích file nộp đạt, sửa 1 ô số liệu không tính lại bị phát hiện, soát xét (tính lại khớp), phát hành, tải phiếu A4 đúng BM-XM-01 và BM-TH-01, QR sinh đúng nội dung, phiếu xem trước và bảng số liệu gốc hiển thị đúng.
- Form nhập điện thoại: xi măng 28 số liệu, thép hình thêm/bớt thanh (3 đến 12), tiến độ tính đúng.
- Form nhận mẫu: chọn được Xi măng PCB40, Thép hình.
- Hồi quy: cát và đá 5-20 chạy lại toàn bộ kịch bản 0.8.0, không có lỗi trang.

## Hạn chế còn lại
- Trang Quan trắc (bảng ngang tổng hợp) chưa có 2 loại mới.
- Mẫu thép hình chỉ có Mác thép là chữ tự do; chưa có danh mục mác thép và ngưỡng chuẩn.
- Chưa có lưu giữ sau 90 ngày.
