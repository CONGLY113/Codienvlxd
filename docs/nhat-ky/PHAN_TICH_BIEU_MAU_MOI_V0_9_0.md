# Phân tích 10 biểu mẫu vật liệu mới (04/11/2026), nền app 0.8.0

## 1. Hiện trạng app
- App có 2 loại chạy hết luồng: Cát xây dựng (BM-CAT-01) và Đá dăm 5-20 (BM-DA-01).
- Đá 5-20 đang viết riêng (recomputeDA, analyzeUploadDA, MF_MAP_DA...), rải ở khoảng 20 chỗ trong code. Thêm mỗi loại theo cách này sẽ nhân đôi code và dễ sai.
- Mỗi loại cần: file Excel biểu mẫu (Thong_tin, So_lieu, Kiem_tra, Phieu_KQ, _HeThong), công thức tính lại trong app, ô nhập điện thoại, phân tích file nộp, phiếu A4, trang Quan trắc, tra cứu QR.

## 2. Bảng 10 biểu mẫu
| # | File | Sheet | Chỉ tiêu / nội dung | Độ khó | Ghi chú |
|---|---|---|---|---|---|
| 1 | Đá xây dựng 10-40 | Da10-40, nap so lieu | Bùn bụi sét, KL thể tích xốp, thoi dẹt (3 nhóm 5-10/10-20/20-40), Los Angeles, nén dập (3 nhóm), thành phần hạt sàng 70/40/20/10/<10, Dmax, Dmin | Thấp | Giống đá 5-20, đổi bộ sàng và số nhóm hạt |
| 2 | Xi măng PCB40 | XM PCB40, nap so lieu | Độ mịn, đông kết bắt đầu/kết thúc, ổn định thể tích, cường độ nén 3 ngày, quy về 28 ngày | Trung bình | Có mức yêu cầu theo TCVN 6260:2009; nhãn hiệu, số lô |
| 3 | Cấp phối bê tông | Phieu kq, Nap so lieu (DI74), The mau | Vật liệu sử dụng, thành phần cấp phối (xi măng, cát, đá, nước, phụ gia), nén mẫu 3/7/28 ngày, độ sụt | Cao | Phiếu dài, nhiều bảng, mẫu đúc có ngày đúc, kết quả nén theo từng tuổi |
| 4 | Đá gốc | Da goc | Cường độ nén bão hòa, 5 viên, kích thước, lực nén, trung bình | Thấp | Một bảng 5 viên |
| 5 | Đá dăm láng nhựa (lượng nhựa) | 4.75-9.5, 9.5-12.5, 12.5-19 | Los Angeles, thoi dẹt, hạt mềm yếu phong hóa, bụi bùn sét, độ dính bám nhựa, thành phần hạt | Trung bình | 3 sheet theo cỡ đá, mức yêu cầu khác nhau |
| 6 | Gạch 2 lỗ | Gach 2 lo, nap so lieu | Kích thước (dài, rộng, dày), độ bền nén, độ hút nước | Trung bình | TCVN 6355; nhiều viên thử |
| 7 | Gạch đặc | gach dac, nap so lieu | Như gạch 2 lỗ | Trung bình | |
| 8 | Gạch 6 lỗ | Gach 6lo, nap so lieu | Như gạch 2 lỗ | Trung bình | |
| 9 | Thép xây dựng | Phieu KQ1, Nhap so lieu | Mỗi đường kính D6 đến D32 thử 3 lần: khối lượng, chiều dài, L1, L2, lực chảy, lực đứt, tiết diện, giới hạn chảy, giới hạn đứt, dãn dài, sai lệch khối lượng, thử uốn | Cao | Nhiều dòng; xem mục 4 |
| 10 | Thép hình | Thep, Thep (2) | Ký hiệu, dày x rộng, tiết diện, lực chảy, giới hạn chảy, lực đứt, giới hạn đứt, dãn dài, uốn | Trung bình | Số dòng thay đổi theo lô |

Lưu ý chung về các file gốc: là file Excel cũ, ô kết quả có chỗ nhập tay sẵn trong sheet phiếu, nhiều chỗ liên kết ngoài ([3]...). Khi đưa vào app phải thay bằng biểu mẫu mới có sheet Thong_tin, So_lieu, Kiem_tra, Phieu_KQ, _HeThong như cát và đá.

## 3. Kiến trúc đề xuất: bảng mô tả vật liệu (spec) dùng chung
Mỗi loại vật liệu khai báo một lần: mã loại, mã biểu mẫu, danh sách chỉ tiêu, ô nhập, công thức, mức yêu cầu, bảng phiếu. Các hàm nhập điện thoại, phân tích file, phát hành phiếu, Quan trắc, tra cứu đọc từ spec. Cát và đá 5-20 giữ nguyên để không phá phiếu đã phát hành, các loại mới đi theo spec.

## 4. Phương án phiếu thép nhiều đường kính (D6 đến D32)
Vấn đề: mỗi đường kính thử 3 lần, tổng nhiều dòng; một trang A4 chỉ chứa khoảng 6 dòng (cách làm cũ), số báo cáo phải thay đổi theo từng trang.
- Phương án A (đề xuất): MỘT số báo cáo cho cả phiếu yêu cầu, file Excel có 3 đến 4 sheet in "Trang 1/N ... Trang N/N". Mỗi trang ghi "BC26.11.04.3, trang 1/3". Một mã băm, một QR, tra cứu một lần ra toàn bộ. Nhóm dòng: mỗi trang tối đa 6 đến 9 dòng, không cắt đôi một đường kính.
- Phương án B: mỗi sheet một số báo cáo riêng (BC...3.1, BC...3.2, BC...3.3). Nhiều số, kế toán và lưu trữ phức tạp hơn, QR phải gắn từng phiếu.
- Số trang N do app tính từ số dòng thực tế (không cố định 3 hay 4); nhận xét đạt/không đạt theo từng nhóm đường kính ở trang cuối.

## 5. Thứ tự làm đề xuất
1. Nền spec chung + Đá 10-40 (kiểm chứng kiến trúc trên loại gần giống đá 5-20).
2. Thép xây dựng (phiếu nhiều trang) và Thép hình.
3. Xi măng PCB40, Đá gốc, Đá dăm láng nhựa.
4. Gạch 2 lỗ, gạch đặc, gạch 6 lỗ (cùng khung).
5. Cấp phối bê tông (phức tạp nhất, làm sau cùng).

## 6. Quyết định của anh (04/11/2026)
- Phiếu thép nhiều đường kính: MỖI SHEET (MỖI MẪU) MỘT SỐ BÁO CÁO RIÊNG.
- Thứ tự làm: Xi măng PCB40 và Thép hình trước.

## 7. Cách áp dụng quyết định "mỗi sheet một số báo cáo"
- Mỗi mẫu trong app = 1 mã mẫu = 1 số báo cáo = 1 trang phiếu A4 (một sheet in).
- Thép hình: tối đa 12 thanh trên một phiếu. Nhiều hơn thì nhập thêm dòng mẫu "Thép hình" ở form nhận mẫu (cùng phiếu yêu cầu), mỗi dòng có mã mẫu và số báo cáo riêng. Không cần cơ chế đánh số mới.
- Thép xây dựng (làm sau): chia theo nhóm đường kính, mỗi nhóm một mẫu; bước sau sẽ thêm nút "Tách theo nhóm đường kính" tự tạo 3-4 mẫu từ một danh sách D6-D32.

## 8. Trạng thái
- Bước 1 (đọc 10 file): Xong.
- Bước 2 (phương án thép): Xong, theo lựa chọn ở mục 6.
- Bước 3 (làm vào app): Bản 0.9.0 xong Xi măng PCB40 và Thép hình. Còn lại: Đá 10-40, Đá gốc, Đá láng nhựa (3 cỡ), Gạch 2 lỗ, Gạch đặc, Gạch 6 lỗ, Thép xây dựng, Cấp phối bê tông.
