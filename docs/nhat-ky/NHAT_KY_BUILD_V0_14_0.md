# Nhật ký build 0.14.0 (05/11/2026), nền 0.13.0
Mục tiêu: thêm loại mẫu **Thiết kế cấp phối vữa xây** (gộp 3 file Excel cũ M50, M75, M100 thành một biểu mẫu), **mác vữa chọn bằng danh sách ngay lúc tạo phiếu yêu cầu**. Tổng số loại mẫu hiện là 22.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 3 file M50, M75, M100: ô nhập, công thức, bố cục phiếu; so sánh từng ô để tìm chỗ khác nhau giữa 3 mác | Xong |
| 2 | Dựng biểu mẫu BM-CV-01 (5 sheet) một file chung cho 3 mác; bảng hệ số theo mác đặt ở sheet _HeThong (niêm phong) | Xong |
| 3 | LibreOffice tính lại, đối chiếu 3 file gốc (M50, M75, M100) | Xong, 0 lệch |
| 4 | Công thức tính lại trong app, form điện thoại, liên kết phiếu xi măng và phiếu cát đã phát hành, kiểm tra, phiếu xem trước, QR, Quan trắc | Xong |
| 5 | Mác vữa chọn bằng danh sách ở form tiếp nhận (thủ công, từng dòng mẫu) và cổng khách hàng; bắt buộc chọn; điền sẵn vào biểu mẫu | Xong |
| 6 | Chạy thử Chrome thật (CSDL giả), giả mạo, LibreOffice đối chiếu file nộp và phiếu phát hành, hồi quy | Xong |
| 7 | Xuất bản 0.14.0 (Version 12 của artifact), bảng câu hỏi, nhật ký | Xong |
| 8 | Chạy thử trên CSDL thật, anh xác nhận hệ số từng mác | Chờ anh |

## Cách hoạt động
- **Chọn mác lúc tạo yêu cầu**: khi loại mẫu là Thiết kế cấp phối vữa xây, ô "Quy cách" đổi thành danh sách **Mác vữa thiết kế** (M50, M75, M100). Ở tiếp nhận thủ công, mỗi dòng mẫu có danh sách mác riêng nên một phiếu có thể có nhiều mác. Không chọn mác thì không gửi được. Mác lưu ở ô quy cách của mẫu và điền sẵn vào biểu mẫu và form điện thoại.
- **Tính toán (theo file cũ)**: xi măng X = Mác / (Rx x 0,9) x 1000 x 1,1; cát = 130 x KLTT xốp cát (g/cm³) x X / 50 x hệ số cát; nước = X x hệ số nước / 50; thể tích tuyệt đối và xốp; độ hỗng cát; cường độ dự kiến sau 3, 7, 28 ngày = mác x 1,15 x hệ số. Hệ số cát, hệ số nước, hệ số R3/R7/R28 theo từng mác nằm ở bảng _HeThong; sửa bảng thì nộp bị chặn.
- **Vật liệu**: xi măng và cát chọn từ phiếu đã phát hành (có kiểm tra khớp, lệch hoặc sai loại thì báo lỗi) hoặc nhập tay (cảnh báo cho người soát xét). Rx điền sẵn bằng R28 x 10,197 khi chọn phiếu xi măng, sửa được; lệch quá 10 % thì cảnh báo.
- **Phiếu**: 3 phần như phiếu cũ: A. vật liệu sử dụng, B. thành phần cấp phối vữa (khối lượng, thể tích tuyệt đối, thể tích xốp, tỷ lệ), C. cường độ dự kiến 3, 7, 28 ngày; ghi chú độ ẩm vật liệu 0 % và 28 ngày chỉ tham khảo.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật)
- Biểu mẫu đối chiếu 3 file gốc: M50 xi măng 212, cát 1975, nước 178; M75 295, 1820, 218; M100 384, 1600, 277; cường độ dự kiến M75 48 / 64 / 89, M100 64 / 83 / 120: khớp.
- Tạo mẫu 3 mác, giao việc, tải biểu mẫu, nhập, nộp, soát xét, phát hành, tải phiếu: đạt. Biểu mẫu nhận mác từ phiếu yêu cầu.
- Giả mạo bị phát hiện: sửa công thức, sửa hệ số cát mác 75, sửa hằng số 1,1. Thiếu mác, mác ngoài bảng, thiếu số liệu: báo CHƯA HỢP LỆ. Mác biểu mẫu khác phiếu yêu cầu, Rx lệch R28: cảnh báo.
- Liên kết xi măng, cát: đúng thì qua; sửa Mđl thì lỗi; chọn phiếu sai loại thì lỗi; số lô khác phiếu xi măng thì cảnh báo.
- Form tiếp nhận: cổng khách hàng (điện thoại 390x844) và tiếp nhận thủ công 3 dòng (M100, M50, cát) cho mỗi mẫu đúng mác; chưa chọn mác thì báo thiếu; đổi sang loại khác thì ô quy cách trở lại.
- Điện thoại: form 3 khối, tạm tính xi măng, cát, nước, R28 dự kiến.
- LibreOffice tính lại 7 file (3 mác, liên kết, 3 phiếu phát hành): 0 ô lệch (chỉ 2 ô chuỗi rỗng ở dòng chữ ký như trước).
- Hồi quy: 17 trang, kiểm thử 0.13.0 (5 loại mới), 0.11.0, lưu giữ 90 ngày và QR: không lỗi.

## Hạn chế và việc cần lưu ý
- Hệ số theo mác lấy từ 3 file cũ, chưa rõ nguồn; hệ số R7 và R28 của M100 (0,72 và 1,04) khác M50, M75 (0,74 và 1,03).
- Rx trong file cũ (288, 311, 318 kgf/cm²) không bằng R28 xi măng x 10,197 (330, 330, 383): M50 và M100 sẽ có cảnh báo lệch.
- Phiếu chưa ghi cấp phối tính cho 1 m³ vữa hay 1 m³ cát (file cũ không ghi); tiêu chuẩn trên phiếu đang ghi "Tính toán thành phần cấp phối vữa xi măng cát".
- Chưa làm ngày xuất kết quả = ngày đúc + 7 như file cũ.
- Chỉ có 3 mác; mác khác cần thêm hệ số.

## Cần anh xác nhận
12 câu trong CAU_HOI_CAP_PHOI_VUA_V0_14_0.xlsx (có đề xuất mặc định). Ưu tiên cao: nguồn hệ số từng mác, hệ số M100, cấp phối tính cho 1 m³ gì, nguồn của Rx.

## Việc tiếp theo đề xuất
1. Anh dùng thử với số liệu thật và trả lời bảng câu hỏi.
2. Giao nhiệm vụ nhanh theo bảng phân công, phiếu yêu cầu bản in có QR.
3. In Thiết bị thử nghiệm trên phiếu phát hành; tab Quan trắc cho đá 5x20; sửa lệch ô nguồn gốc biểu mẫu cũ; Phụ gia.
