# Nhật ký build 0.13.0 (04/11/2026), nền 0.12.0
Mục tiêu: thêm **5 loại mẫu** (Nén mẫu bê tông, Nén mẫu vữa, Đo K dao vòng, Đo K phễu rót cát, Cấp phối thiên nhiên đầm chặt) và quy tắc **số phiếu yêu cầu cố định theo tháng** cho nén bê tông và nén vữa. Tổng số loại mẫu hiện là 21.

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 5 file mẫu: Nén BT 3 Viên.xlsx, Nen mau vua.xls, Đo K cát đường.xls, CPthiên nhiên đầm chặt.xls, Đo K đất.xlsm (ô nhập, công thức, bố cục phiếu) | Xong |
| 2 | Dựng 5 biểu mẫu Excel theo quy ước 5 sheet: BM-NB-01, BM-NV-01, BM-DK-01, BM-DK-02, BM-CT-01; LibreOffice tính lại, đối chiếu giá trị file gốc | Xong, 0 lệch |
| 3 | Viết công thức tính lại trong app cho 5 loại, kiểm tra hợp lệ, cảnh báo, nhận xét, bảng trên phiếu | Xong |
| 4 | Quy tắc số yêu cầu theo tháng cho nén BT và vữa (dùng chung trong tháng, khóa chống trùng khi nhiều người cùng tạo) | Xong |
| 5 | Form điện thoại: thêm/bớt viên, điểm đo, điểm đầm nén; chọn Trái/Phải/Tim, chọn cạnh mẫu; tạm tính ngay | Xong |
| 6 | Liên kết Đo K với phiếu Cấp phối thiên nhiên đã phát hành (Wo, γkmax); lệch hoặc sai loại thì báo lỗi, không liên kết thì cảnh báo | Xong |
| 7 | Chạy thử Chrome thật (CSDL giả) cả vòng đời, giả mạo, giới hạn; LibreOffice đối chiếu file nộp và phiếu phát hành | Xong |
| 8 | Hồi quy: 17 trang, kiểm thử 0.11.0, giao diện điện thoại, lưu giữ 90 ngày và tra cứu QR | Xong, không lỗi |
| 9 | Xuất bản 0.13.0 (Version 11 của artifact) | Xong |
| 10 | Bảng tổng hợp và câu hỏi: CAU_HOI_VA_TONG_HOP_V0_13_0.xlsx (23 câu mới, 22 câu cũ còn treo) | Xong |
| 11 | Chạy thử trên CSDL thật, mở file bằng Excel thật | Chờ anh |

## Cách hoạt động
- **Số yêu cầu theo tháng**: với Nén mẫu bê tông và Nén mẫu vữa, số phiếu yêu cầu là một số chung cho cả tháng, lấy theo ngày nhận mẫu đầu tiên của tháng (ví dụ mẫu đầu tiên nhận 12/10 thì mọi mẫu BT và vữa nhận trong tháng 10 đều mang YC26.10.12.1). Sang tháng mới app cấp số mới. **Số báo cáo** vẫn theo quy tắc cũ (BCyy.mm.dd.n theo ngày nhận). Các loại khác không đổi. Phiếu yêu cầu chỉ tạo nhiều mẫu khác loại thì vẫn lập số riêng như trước. Khi giao nhiệm vụ, app gom theo số yêu cầu + khách hàng + công trình để các khách khác nhau không lẫn.
- **Nén bê tông**: cường độ = lực x hệ số quy đổi theo cạnh mẫu / diện tích (TCVN 3118:93); hệ số 0,91 / 1,00 / 1,05 / 1,10 cho cạnh 100 / 150 / 200 / 300 mm; 3 đến 9 viên; trung bình, % so với mác, lệch từng viên; cảnh báo viên lệch quá 15 % và tuổi khác 28 ngày.
- **Nén vữa**: diện tích 1600 mm², tối thiểu 6 viên (TCVN 3121-11:2003), cường độ 1 chữ số thập phân.
- **Đo K dao vòng (22 TCN 02:71) và phễu rót cát (22 TCN 346:2006)**: tối đa 15 điểm; K từng điểm, nhỏ nhất, lớn nhất, trung bình; kết luận ĐẠT / KHÔNG ĐẠT theo K yêu cầu (để trống thì CHƯA XÉT). Wo, γkmax nhập tay hoặc lấy từ phiếu Cấp phối thiên nhiên.
- **Cấp phối thiên nhiên (22 TCN 333-06 P.P II-D)**: 3 đến 7 điểm đầm nén (tối thiểu 5 để hợp lệ); γkmax và Wo lấy ở điểm có dung trọng khô lớn nhất; hiệu chỉnh hạt lớn hơn 19 mm nếu nhập đủ 9 số; phiếu vẽ đường cong; cảnh báo nếu đỉnh nằm ở điểm cuối.
- Mọi biểu mẫu theo quy ước cũ: App ghi số liệu gốc và kết quả tạm tính, Excel tính lại khi mở, khi nộp app tính lại và so; sửa công thức hoặc sửa hằng số ở sheet _HeThong bị phát hiện.

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật)
- Số yêu cầu theo tháng: 4 mẫu BT/vữa trong tháng 10 (ngày 12, 20, 25 và nhận lùi 05) cùng số YC26.10.12.1; tháng 11 ra số mới YC26.11.02.1.
- Số liệu từ các file gốc cho kết quả khớp: BT 500/470/495 kN, cạnh 150 → 222/209/220 daN/cm², TB 217, 108,5 % mác 200; vữa 6 viên TB 8,4 N/mm², 111,8 % mác 7,5; Đo K dao vòng 91,2 / 89,7 / 88,3 %; phễu rót cát 86,1 / 98,3 / 70,3 %; cấp phối thiên nhiên γkmax 1,872 → 1,898 g/cm³ và Wo 13,5 → 12,8 % sau hiệu chỉnh.
- Tạo mẫu, giao, tải biểu mẫu, nộp, soát xét, phát hành, tải phiếu: cả 5 loại. Phiếu hiện đủ bảng, cấp phối có đường cong, QR có nội dung đúng, vùng in đúng độ rộng.
- Giả mạo bị phát hiện: sửa công thức (cả 5 loại), sửa hằng số _HeThong (hệ số cạnh, diện tích), nộp sai biểu mẫu.
- Thiếu dữ liệu hoặc ngoài quy tắc bị báo CHƯA HỢP LỆ: BT 2 viên, cạnh 120 mm, vữa 3 viên, cấp phối 3 điểm, hiệu chỉnh thiếu 1 số. Cảnh báo: viên lệch 29 %, đỉnh nằm ở điểm cuối, K chưa nhập yêu cầu, Wo nhập tay.
- Liên kết Đo K với phiếu cấp phối: đúng thì qua; sửa Wo thì lỗi; chọn phiếu sai loại hoặc không tồn tại thì lỗi.
- Điện thoại 390x844: nhập, thêm/bớt điểm, tạm tính ĐẠT/KHÔNG ĐẠT từng điểm, không lỗi console.
- LibreOffice tính lại 19 file (biểu mẫu nộp, phiếu phát hành, 15 điểm, 9 viên): 0 ô lệch (chỉ 2 ô chuỗi rỗng ở dòng chữ ký phiếu, như trước).
- Hồi quy: 17 trang không lỗi; kiểm thử 0.11.0, giao diện, lưu giữ và QR đều đạt.

## Hạn chế và việc cần lưu ý
- Chưa chạy trên CSDL thật; chưa mở bằng Excel thật và điện thoại thật.
- Macro VBA của Đo K đất.xlsm chưa giải mã, biểu mẫu mới chỉ dùng ô và công thức.
- Kết luận K dùng giá trị chưa làm tròn (phiếu in 1 chữ số thập phân), cần anh quyết định (câu hỏi 16).
- Phiếu yêu cầu bản in chưa có cho nén BT và vữa.
- Số yêu cầu theo tháng là một số chung cho mọi khách hàng; nếu cần tách theo khách thì phải đổi.
- **An toàn**: Nen mau vua.xls và Chống sét.xls có sheet ẩn "00000000" chứa chuỗi giống mã virus macro Excel. Các biểu mẫu của app không chứa mã này. Nên quét virus và không dùng các file gốc làm mẫu nữa.

## Cần anh xác nhận
Đầy đủ trong CAU_HOI_VA_TONG_HOP_V0_13_0.xlsx (sheet Cần xác nhận mới, 23 câu có đề xuất mặc định; sheet 3 giữ 22 câu cũ). Ưu tiên cao:
1. Phạm vi số yêu cầu tháng (chung BT và vữa, mọi khách), mẫu nhận lùi ngày, tháng tính theo ngày nhận hay ngày nén.
2. Bảng hệ số quy đổi cạnh mẫu bê tông và đơn vị mác (daN/cm² hay MPa).
3. Cách kết luận K (từng điểm hay trung bình; số đã làm tròn hay chưa) và nguồn Wo, γkmax.
4. Cách lấy γkmax/Wo ở cấp phối thiên nhiên và công thức hiệu chỉnh hạt quá cỡ.
5. Nội dung macro trong Đo K đất.xlsm; quét virus các file gốc.

## Việc tiếp theo đề xuất
1. Anh dùng thử 5 loại mới với số liệu thật, báo lỗi và trả lời câu hỏi.
2. Giao nhiệm vụ nhanh theo bảng phân công, phiếu yêu cầu bản in có QR.
3. In Thiết bị thử nghiệm trên phiếu phát hành; tab Quan trắc cho đá 5x20; sửa lệch ô nguồn gốc ở biểu mẫu cũ; Phụ gia; tờ nhãn mẫu.
