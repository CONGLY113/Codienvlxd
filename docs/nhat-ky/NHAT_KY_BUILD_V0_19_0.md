# Nhật ký build 0.19.0 (05/11/2026)

Bản này áp dụng các câu trả lời trong file CAU_HOI_XAC_NHAN_V0_18_0.xlsx. Nền: 0.18.0.

## Thay đổi theo câu trả lời

| Câu | Trả lời của anh | Đã làm |
|---|---|---|
| 1 | Kế toán trưởng là Trần Hoàn | Tài khoản NS013 Trần Hoàn chuyển sang vai Kế toán trưởng (chỉ xem), bỏ tài khoản tạm NS014. Trần Hoàn không còn quyền thủ quỹ. |
| 2 | Ghi nhận ký duyệt: quản trị, trưởng phòng TN, giám đốc. Ký soát xét bảng kê: thủ quỹ, dò lại số mẫu và đóng dấu mộc bản giấy | Nút "Ghi nhận ký duyệt" chỉ hiện cho quản trị, trưởng phòng TN, giám đốc (kế toán và thủ quỹ không bấm được). Thủ quỹ soát xét kèm xác nhận đã dò số mẫu và đóng dấu mộc. Việc cần làm, số đếm menu và nhãn các bước đổi theo. |
| 3 | Giám đốc, Kế toán trưởng chỉ xem | Giữ. Riêng Giám đốc có thêm nút Ghi nhận ký duyệt theo câu 2. |
| 12 | 3 khối ký: Người lập, Thủ quỹ, Khách hàng | Bản in và Excel bảng kê còn 3 khối, bỏ khối "Ký duyệt, đóng dấu". |
| 10 | Số bảng kê và tên khách viết tắt | Nội dung chuyển khoản: số bảng kê + chữ cái đầu mỗi từ của tên khách (từ viết hoa như TNHH giữ nguyên), tối đa 25 ký tự. Ví dụ BK26.11.05.1 CTDV. |
| 22 | Một lần thử, bình quân gia quyền như đá 5-20 | Đá 20x70 đã làm đúng như vậy (thoi dẹt, nén dập là bình quân gia quyền theo % khối lượng hỗn hợp, một lần thử). Giữ nguyên. |
| 23 | Đầm chặt cát không hiệu chỉnh; hiệu chỉnh chỉ cho cấp phối thiên nhiên và cấp phối đá dăm | Đầm chặt cát: bỏ 9 ô hiệu chỉnh trên màn hình, trong Excel và trên phiếu. Biểu mẫu Excel BM-CT-02 dựng lại (kết quả cuối tại So_lieu B23, B24). Cấp phối thiên nhiên, CPĐD I, II giữ hiệu chỉnh. |
| 26, 27 | Mỗi sheet bê tông hoặc vữa tính một tổ | Nén bê tông, nén vữa: mỗi phiếu một tổ, không còn chia viên ÷ 3 hay ÷ 6. Bảng giá ghi "giá trọn một tổ". |
| 28 | Đo K tạm tính 3 điểm; nhiều phiếu thì đếm số điểm đo; ghi rõ trên bảng kê | Số điểm lấy từ kết quả nộp của từng phiếu, cộng vào một dòng. Phiếu chưa nộp tạm tính 3 điểm, có ghi chú trên màn hình, bản in và Excel ("Đo hệ số K: n mẫu chưa nộp kết quả, tạm tính 3 điểm đo mỗi mẫu"). |
| Còn lại | Theo đề xuất mặc định | Không đổi. |

## Kiểm thử
- Luồng đầy đủ nhiều vai (test101): lập, gửi, thủ quỹ trả lại và soát xét, kế toán không thấy việc ký duyệt, Giám đốc ghi nhận ký duyệt, QR giải mã khớp, thanh toán 2 đợt, Giám đốc và Kế toán trưởng chỉ xem. Đạt.
- Đầm chặt cát: tải biểu mẫu, nhập số liệu, tính lại, phát hiện sửa tham số, phát hành phiếu, xuất Excel. Đạt.
- Hồi quy: smoke92, test93, test95, test96, test98, test99e, test100b, test100m, ui93, ui96, t94_b, t97, t97b. Đạt.

## Điểm cần anh lưu ý
- Trần Hoàn trước đó được liệt kê là thủ quỹ; câu trả lời số 1 đặt anh Hoàn là Kế toán trưởng nên hiện chỉ còn một thủ quỹ (Hồ Thị Bích Thuỷ). Nếu cần thủ quỹ dự phòng, cho em biết ai.
- Giám đốc vừa "chỉ xem" (câu 3) vừa được ghi nhận ký duyệt (câu 2): em cho Giám đốc đúng một quyền bấm đó.
- Kế toán (chị Lan) lập và gửi soát xét nhưng không bấm được Ghi nhận ký duyệt.
- File Excel đầm chặt cát tải từ bản cũ không còn khớp, cần tải lại.
