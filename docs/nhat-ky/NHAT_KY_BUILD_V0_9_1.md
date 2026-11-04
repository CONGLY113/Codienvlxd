# Nhật ký build 0.9.1 (04/11/2026), nền 0.9.0
Mục tiêu: hoàn thiện trang Quan trắc cho Xi măng PCB40 và Thép hình; làm đủ luồng nghiệp vụ (biểu mẫu Excel, nhập điện thoại, kiểm tra file nộp, soát xét, phiếu A4, QR, Quan trắc) cho Đá dăm 10-40, Đá gốc, Đá láng nhựa (3 cỡ), Gạch đặc, Gạch 2 lỗ, Gạch 6 lỗ, Thép xây dựng (3 nhóm đường kính trên 1 phiếu).

## Kế hoạch từng bước
| Bước | Việc | Trạng thái |
|---|---|---|
| 1 | Đọc 8 file Excel còn lại, lập bảng cấu trúc ô nhập, công thức, phiếu | Xong |
| 2 | Dựng 9 biểu mẫu Excel theo quy ước 5 sheet (Thong_tin, So_lieu, Kiem_tra, Phieu_KQ, _HeThong) | Xong |
| 3 | Khai báo 9 loại trong khung "GT" của app (ô nhập, công thức tính lại, kết quả, phiếu, QR, cột Quan trắc) | Xong |
| 4 | Trang Quan trắc: thêm cột cho Xi măng PCB40, Thép hình và 9 loại mới (tổng 12 tab) | Xong |
| 5 | Mở 9 loại trong form Nhận mẫu, form nhập trên điện thoại | Xong |
| 6 | Chạy thử Chrome thật (CSDL giả): tạo mẫu, tải biểu mẫu, nộp, soát xét, tính lại, phát hành, phiếu A4, QR | Xong |
| 7 | Tính lại công thức Excel bằng LibreOffice, đối chiếu từng ô với giá trị app ghi | Xong, khớp 100% |
| 8 | Hồi quy 0.8.0 và 0.9.0 (cát, đá 5-20, xi măng, thép hình) | Xong, không lỗi |
| 9 | Xuất bản 0.9.1 | Xong |
| 10 | Cấp phối bê tông | Chưa (chưa yêu cầu ở lượt này) |
| 11 | Lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2) | Chưa, vẫn cần trước khi dữ liệu thật quá 2 tháng |

## Các loại mới
| Loại mẫu | Biểu mẫu | Số liệu nhập | Kết luận trên phiếu |
|---|---|---|---|
| Đá dăm 10-40 | BM-DA-02 | 34: bùn bụi sét (2 lần), KL thể tích xốp (2 lần), Los Angeles, hạt thoi dẹt (3 viên/lần), nén dập xi lanh (3 lần), sàng 70/40/20/10 và đáy | Kết quả + biểu đồ thành phần hạt; nhận xét giữ như đá 5-20 (câu cố định theo TCVN 7570:2006) |
| Đá gốc | BM-DG-01 | 25: 5 viên, kích thước a, b, c, d, lực nén | Trung bình cường độ nén bão hòa; không kết luận đạt hay không (file cũ không nêu mức yêu cầu) |
| Đá láng nhựa 4,75/9,5; 9,5/12,5; 12,5/19 | BM-LN-01, 02, 03 | 12: LA, thoi dẹt, mềm yếu (tùy chọn), bụi bùn sét, dính bám (cấp 1-5), sót sàng | Có kết luận theo mức yêu cầu ở _HeThong (LA <= 25, thoi dẹt <= 15, mềm yếu <= 5, Sc <= 1, dính bám >= 3, sót sàng lớn <= 15, lọt đáy <= 10) |
| Gạch đặc, 2 lỗ, 6 lỗ | BM-GD-01, BM-G2-01, BM-G6-01 | 120: dài, rộng, dày (5 viên x 3 vị trí), hút nước (5 viên, m0, m1), nén (5 viên, 4 cạnh) | Trung bình 5 viên; không kết luận (file cũ không nêu mức yêu cầu) |
| Thép xây dựng | BM-TX-01 | Tối đa 3 nhóm đường kính, mỗi nhóm 3 mẫu thử, 23 số liệu/nhóm (69 khi đủ 3 nhóm) | Mỗi nhóm: đạt / không đạt / chưa xét / chưa đủ |

## Thép xây dựng: một phiếu, ba nhóm đường kính
- Một mẫu = một mã mẫu = một số báo cáo = một tờ A4. Một tờ chứa tối đa 3 nhóm đường kính (9 dòng thử). Nhóm thứ 4 trở đi: tạo mẫu mới, số báo cáo mới.
- Nhóm nhập: đường kính danh nghĩa d, ký hiệu, mác thép; yêu cầu (giới hạn chảy, đứt, dãn dài tối thiểu, sai lệch KL tối đa) nhập nếu có. Để trống thì nhóm đó không kết luận.
- Mỗi mẫu thử: khối lượng, chiều dài, L1, L2, lực chảy, lực đứt, thử uốn. Tính: KL 1 m dài, sai lệch, đường kính thực, giới hạn chảy, đứt, dãn dài.
- Kết luận nhóm: ĐẠT khi chảy, đứt, dãn dài nhỏ nhất đạt yêu cầu, không nứt khi uốn, sai lệch KL không vượt mức; CHƯA ĐỦ khi nhóm chưa đủ 3 mẫu hợp lệ.
- Form điện thoại: nút "＋ Thêm nhóm đường kính" và "Bớt một nhóm" (1 đến 3 nhóm).

## Trang Quan trắc
- 12 tab: Cát, Xi măng PCB40, Thép hình, Đá 10-40, Đá gốc, Đá láng nhựa x3, Gạch x3, Thép xây dựng.
- Mỗi tab xếp ngang số liệu gốc từ So_lieu, cột nền xanh là kết quả; có dòng Trung bình, Nhỏ nhất, Lớn nhất và xuất CSV.
- Kiểm tra bằng 1 mẫu mỗi loại: cột có số liệu đủ (xi măng 34/34, đá 10-40 41/41, đá gốc 26/26, gạch 65/65, thép xây dựng 69/69, đá láng nhựa 17/18 vì mẫu thử không nhập mục mềm yếu, thép hình 20/65 vì mẫu thử có 3 thanh trong tối đa 12).

## Kết quả kiểm thử (Chrome thật, CSDL giả; chưa chạy trên CSDL thật của nền tảng)
- 9 loại mới: phân tích file nộp đạt, sửa 1 ô số liệu không tính lại bị phát hiện, soát xét tính lại khớp, phát hành phiếu, QR, tải biểu mẫu đúng tên (ví dụ BM-TX-01_BC26.11.03.9.xlsx). Không có lỗi trang.
- LibreOffice tính lại công thức của 9 biểu mẫu (bỏ giá trị đã lưu): 0 ô lệch so với giá trị app ghi.
- Phiếu A4 chuyển PDF: đá 10-40 (kèm biểu đồ), đá láng nhựa, gạch 6 lỗ, thép xây dựng đều một trang.
- Form điện thoại: số mục và tiến độ đúng; thép xây dựng bớt nhóm còn 46 số liệu (2 nhóm).
- Hồi quy: test 0.8.0 (4.516 mẫu, tải 57 ms) và test 0.9.0 (xi măng, thép hình) không lỗi.

## Lỗi gặp và cách xử lý
- Công thức kết luận nhóm thép trong Excel thiếu nhánh CHƯA ĐỦ (nhóm thiếu mẫu có thể hiện ĐẠT sai vì ô rỗng so với số). Đã thêm kiểm tra COUNT, thử lại bằng LibreOffice.
- Nhận xét thép trong Excel khác app khi chưa nhập yêu cầu. Đã thống nhất câu.
- Trang Quan trắc hiện chữ "null" dưới bảng (do nối phần tử rỗng). Đã sửa.
- Tiêu đề nhóm cột Quan trắc căn giữa nên nhóm rộng (thép xây dựng) không thấy tên khi mới mở. Đã căn trái.
- Một số lỗi cú pháp và form điện thoại khi dựng (đã sửa trong quá trình).

## Cần anh xác nhận
1. Đá 10-40 (và đá 5-20): nhận xét trên phiếu là câu cố định "đạt theo TCVN 7570:2006", app chưa tự so ngưỡng. Nếu cần tự kết luận, xin các mức yêu cầu (Sc, thoi dẹt, LA, nén dập, thành phần hạt).
2. Bảng giới hạn thành phần hạt trong file đá 5-20 có vẻ lấy từ file đá 10-40. Xin kiểm tra lại.
3. Gạch và đá gốc: file cũ không có mức yêu cầu nên phiếu chỉ ghi kết quả trung bình. Nếu cần kết luận, xin mác gạch hoặc mức yêu cầu.
4. Gạch: diện tích tính không làm tròn trung gian, có thể lệch rất nhỏ so với file Excel cũ.
5. Thép xây dựng: dòng "Phương pháp thử" trên phiếu đang ghi TCVN 197:2002; TCVN 198:2008; TCVN 7937-1:2009; TCVN 1651:2008. Sheet nhập cũ ghi TCVN 198-1985. Xin chọn bản đúng.
6. Xi măng: bảng K thiếu h = 1,6 và h > 2,2; quy tắc loại viên R3 lệch quá 10 % (đang chỉ cảnh báo). Vẫn chờ anh.

## Tệp
- Quản_lý_mẫu_thử_nghiệm_0_9_1.html (bản xuất bản).
- NHAT_KY_BUILD_V0_9_1.md (tệp này), các nhật ký 0.9.0 và 0.8.0 giữ nguyên.

## Bước tiếp theo đề nghị
1. Anh chạy thử từng loại trên bản xuất bản (CSDL thật): nhận mẫu, giao việc, nhập, nộp, soát xét, phát hành, xem Quan trắc.
2. Trả lời 6 mục cần xác nhận.
3. Làm Cấp phối bê tông.
4. Làm lưu giữ sau 90 ngày (0.8.1) và tra cứu hồ sơ lưu bằng QR (0.8.2) trước khi dữ liệu thật vượt 2 tháng.
