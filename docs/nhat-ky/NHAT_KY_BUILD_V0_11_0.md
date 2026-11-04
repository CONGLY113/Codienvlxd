# Nhật ký build 0.11.0 (04/11/2026), nền 0.10.0
Mục tiêu: thêm 2 loại mẫu (**Xi măng PCB30**, **Đo chống sét**), đổi ô "Nguồn gốc mẫu" của xi măng thành **Số lô** để chuyển sang cấp phối bê tông, bổ sung **bảng vẽ sơ đồ vị trí điểm đo trên điện thoại** và đưa ảnh sơ đồ vào mặt sau phiếu chống sét, lập **bảng tổng hợp các loại mẫu đã làm** kèm danh sách điểm cần anh xác nhận.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 2 file gốc Chống sét.xls và Xi măng PCB 30.xls (ô nhập, công thức, bố cục phiếu, mặt sau sơ đồ) | Xong |
| 2 | Dựng biểu mẫu BM-XM-02 (xi măng PCB30) và BM-CS-01 (chống sét) theo quy ước 5 sheet; LibreOffice tính lại, đối chiếu với giá trị file gốc | Xong, 0 lệch |
| 3 | Viết công thức tính lại trong app: xi măng PCB30 (dùng chung phương pháp PCB40, yêu cầu R3 từ 14, R28 từ 30), chống sét (trung bình 3 lần đo mỗi điểm, tối đa 15 điểm, điện trở tối đa tùy chọn) | Xong |
| 4 | Đổi ô Nguồn gốc mẫu của xi măng thành Số lô (form tiếp nhận, cổng khách hàng, biểu mẫu, phiếu, cấp phối) | Xong |
| 5 | Cấp phối bê tông nhận phiếu PCB30, lấy số lô và R28 từ phiếu xi măng | Xong |
| 6 | Bảng vẽ sơ đồ trên điện thoại: bút, đường, mũi tên, khung, elip, chữ, số điểm, gôm, hoàn tác, làm lại, xóa hết (bấm 2 lần), khổ ngang hoặc đứng, màu, nét, lưới | Xong |
| 7 | Lưu sơ đồ dạng nét vector gọn trong bản nháp, xuất PNG đưa vào mặt sau biểu mẫu Excel, đọc lại ảnh khi nộp, lưu ở hồ sơ chi tiết, hiện ở phiếu xem trước và phiếu phát hành | Xong |
| 8 | Chạy thử Chrome thật khổ điện thoại 390x844 (CSDL giả): nhập số đo, thêm hoặc bớt điểm, vẽ sơ đồ, tạo hồ sơ, nộp soát xét, cổng khách hàng | Xong, không lỗi |
| 9 | Tính lại file nộp và phiếu bằng LibreOffice, đối chiếu từng ô | Xong, 0 ô lệch (trừ 2 ô chuỗi rỗng ở dòng chữ ký phiếu) |
| 10 | Hồi quy: 17 trang, các loại cũ, cấp phối với PCB40 | Xong, không lỗi |
| 11 | Xuất bản 0.11.0 (Version 9 của artifact) | Xong |
| 12 | Bảng tổng hợp các loại mẫu và danh sách câu hỏi: TONG_HOP_MAU_VA_CAU_HOI_V0_11_0.xlsx | Xong |
| 13 | Lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2) | Chưa làm |

## Phương pháp
- **Xi măng PCB30 (BM-XM-02)**: cùng chỉ tiêu và phương pháp thử với PCB40 (độ mịn, đông kết, Le Chatelier, nén 3 ngày, quy về 28 ngày), khác mức yêu cầu R3 ≥ 14 và R28 ≥ 30 MPa lấy từ file Excel cũ. Ô Nguồn gốc mẫu ghi là **Số lô** (kèm nhãn hiệu nếu cần).
- **Đo chống sét (BM-CS-01)**: mỗi điểm đo 3 lần, trung bình; tối đa 15 điểm trên một phiếu; làm tròn 2 chữ số thập phân; điện trở tối đa cho phép nhập được (để trống thì không kết luận); ô nguồn gốc ghi là **Khu vực đo**. Ngày nhận, ngày bắt đầu, ngày kết thúc ghi là ngày nhận yêu cầu, ngày bắt đầu đo, ngày kết thúc đo.
- **Sơ đồ**: lưu các nét vector trong bản nháp (khoảng vài trăm ký tự đến vài chục nghìn; quá 60.000 ký tự thì không đẩy lên bản nháp từ xa), khi tạo hồ sơ vẽ ra PNG, ghi đè ảnh có tên "SoDoViTri" ở mặt sau phiếu. Khi nộp file Excel app đọc lại ảnh, chuẩn hóa về PNG không quá 150 KB, lưu ở hồ sơ chi tiết; khi phát hành chèn lại; không có sơ đồ thì phiếu in ảnh trống "Chưa có sơ đồ vị trí các điểm đo" và app cảnh báo.
- **Liên kết cấp phối**: cấp phối nhận cả PCB40 và PCB30; số lô của phiếu xi măng chép sang ô số lô cấp phối, tên xi măng bỏ chữ "Xi măng". Số lô cấp phối khác phiếu xi măng chỉ CẢNH BÁO.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật của nền tảng)
- Xi măng PCB30 và chống sét: tạo mẫu, giao việc, tải biểu mẫu, nhập, nộp, soát xét, tính lại, phát hành, tải phiếu, QR. Đã thử file có 15 điểm, khổ đứng, không sơ đồ, ảnh JPEG chèn thay sơ đồ.
- Giả mạo bị phát hiện: sửa công thức, sửa hằng số ở _HeThong, nộp sai biểu mẫu.
- Điện thoại (390x844): form chống sét 5 mục, tạm tính ĐẠT hoặc KHÔNG ĐẠT từng điểm, thêm hoặc bớt điểm, mở bảng vẽ; vẽ 9 nét, gôm rồi hoàn tác khôi phục nét, hủy không đổi nét đã lưu, đổi khổ chỉ khi chưa vẽ (có thông báo), xóa hết cần bấm 2 lần.
- Sơ đồ đi qua: bản nháp, bản nháp từ xa, hồ sơ nộp, hồ sơ chi tiết, phiếu xem trước, phiếu phát hành.
- Cổng khách hàng: nhãn ô đổi theo loại mẫu (Số lô, Khu vực đo, Nguồn gốc mẫu); yêu cầu PCB30 gửi từ cổng được lưu đúng loại, đủ 6 chỉ tiêu.
- LibreOffice tính lại 9 file (xi măng, chống sét, phiếu phát hành): 0 ô lệch.
- Hồi quy: 17 trang x 3 tài khoản không lỗi; cấp phối với PCB40 cho kết quả không đổi; các loại cũ không lỗi.

## Lỗi gặp và cách xử lý
- Cổng khách hàng bỏ qua ô Loại mẫu (luôn lấy cát): đã sửa, lấy đúng loại đã chọn; ô nhãn đổi theo loại.
- Tên nhãn "Tên mẫu" trên phiếu mới bị xuống dòng trong cột hẹp: đã tắt xuống dòng ở nhãn.
- Ảnh sơ đồ đè dòng phụ đề: đã nới chiều cao 2 dòng phía trên ảnh.
- Nhãn "Hạng mục, khu vực đo" dễ nhầm với "Hạng mục" của công trình: đã đổi thành **Khu vực đo**.
- Chưa sửa: ô "Nguồn gốc mẫu" trên phiếu Excel của các loại cũ còn lệch dòng (biểu mẫu mới đã sửa); phiếu phát hành chưa in Thiết bị thử nghiệm (lỗi có từ trước); đá dăm 5x20 chưa có tab Quan trắc.
- **An toàn**: file Chống sét.xls gốc có sheet ẩn "00000000" chứa chuỗi mã virus macro Excel. Các biểu mẫu mới của app không chứa mã này. Nên quét virus và không dùng file gốc làm mẫu nữa.

## Cần anh xác nhận
Đầy đủ 22 câu (kèm đề xuất mặc định, ô vàng để trả lời) ở file TONG_HOP_MAU_VA_CAU_HOI_V0_11_0.xlsx, sheet Cần xác nhận. Nhóm ưu tiên cao:
1. Điện trở nối đất tối đa cho phép, và dòng Phương pháp thử của phiếu chống sét (TCVN 9385:2012).
2. Mức yêu cầu xi măng PCB30 (R3 ≥ 14, R28 ≥ 30 MPa, TCVN 6260:2009).
3. Các hệ số cấp phối lấy từ file cũ (0,89 và 0,90, 10,197, 1,035/0,77, 1,2, 1,1, cộng 1 kg cát) và cách trừ nước mẻ trộn (khối lượng khô hay ướt).
4. Thiết bị in trên phiếu phát hành; bảng phân công người phụ trách theo loại mẫu để giao nhiệm vụ nhanh; mẫu phiếu yêu cầu bản in.
5. Làm phần lưu giữ sau 90 ngày trước khi dùng dữ liệu thật; quét virus file Chống sét.xls.

## Việc tiếp theo đề xuất
1. Lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2).
2. Giao nhiệm vụ nhanh theo bảng phân công (một lần bấm cho cả phiếu yêu cầu), phiếu yêu cầu bản in có QR.
3. In Thiết bị thử nghiệm trên phiếu phát hành; tab Quan trắc cho đá 5x20; sửa lệch ô nguồn gốc ở biểu mẫu cũ.
4. Loại mẫu Phụ gia, nén cấp phối nhiều giai đoạn, tờ nhãn mẫu.
