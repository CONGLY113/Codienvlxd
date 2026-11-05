# Nhật ký build v0.24.0 (05/11/2026)

## Yêu cầu
Chạy Firebase làm hệ thống chính, thêm nút xuất toàn bộ dữ liệu ra file Excel để lưu trữ; hệ thống chạy ổn định, mượt.

## Đã làm
1. Cài đặt (trưởng phòng) có mục "Sao lưu dữ liệu ra Excel" với nút "Xuất toàn bộ dữ liệu ra Excel", hiển thị tiến độ từng bước, ghi lại lần sao lưu gần nhất (config/sao_luu: lúc, người, số tài liệu, dung lượng) và ghi nhật ký.
2. File `PTN_SaoLuu_<ngày>_<giờ>.xlsx`:
   - Doc_toi: thông tin lần xuất, số tài liệu, cảnh báo, giải thích từng sheet, lưu ý bảo quản.
   - Mau: mỗi dòng một mẫu (cả mẫu cũ và các kỳ nửa tháng đang trực tuyến), 35 cột.
   - Ket_qua, So_lieu_goc: dạng dọc (một dòng một giá trị) từ kết quả tính, số liệu gốc, bảng sàng, kiểm tra, thiết bị dùng.
   - Bang_ke, Bang_ke_dong: tiêu đề và dòng, cộng tiền, giảm, phải thanh toán, đã thu.
   - Nhat_ky: nhật ký chung và nhật ký trong chi tiết từng mẫu, xếp theo thời gian.
   - Thiet_bi, Cau_hinh, Bieu_mau_lich_su, Luu_giu_chi_muc, Luu_giu_goi, Bo_dem_so, Loi_he_thong.
   - DuLieu_Tho: JSON đầy đủ từng tài liệu, cắt phần 30.000 ký tự mỗi ô, không cắt giữa cặp ký tự đặc biệt; ghép lại đúng nguyên văn.
3. Mặc định không tải nhóm dữ liệu nhị phân (blob_*, files, mauv) để nhẹ và tiết kiệm lượt đọc Firebase; có ô chọn "Kèm cả nội dung file Excel đã nộp" (giới hạn an toàn 120 triệu ký tự).
4. Tổng quan nhắc trưởng phòng khi chưa sao lưu hoặc quá 7 ngày.
5. Ghi file .xlsx bằng JSZip, tự dựng (không thêm thư viện); nhường luồng giao diện giữa các bước để trang không đứng.
6. Data.readAll: đọc đủ cả bộ sưu tập (không giới hạn 1000 như getAll). Dùng dữ liệu đã nghe sẵn cho mẫu, nhật ký, lỗi, lịch sử biểu mẫu để khỏi đọc lại.

## Kiểm thử
- Dữ liệu mẫu 31 tài liệu: xuất đúng 15 sheet; ghép DuLieu_Tho khớp 100% với bản gốc, kể cả chuỗi 30.001 ký tự có ký tự emoji ở biên cắt, ký tự điều khiển, & < >.
- Chế độ kèm file: khôi phục đủ blob, mauv, files.
- Tải lớn: 1.500 mẫu có chi tiết + 3.000 dòng nhật ký (6.031 tài liệu): 8 giây, 10,5 MB, đoạn treo giao diện dài nhất khoảng 0,3 giây.
- Mở bằng openpyxl và LibreOffice không lỗi.
- Qua cầu nối Firebase giả lập: nhân viên xuất được, không có lần bị từ chối.
- Hồi quy test98, test101, smoke92, ui93, test93, test103 (155 đạt, 0 lỗi): đạt.

## Giới hạn
- Chưa chạy trên Firebase thật. Chỉ trưởng phòng thấy nút (trang Cài đặt).
- Không khôi phục ngược từ file Excel vào hệ thống (chưa làm; DuLieu_Tho đủ dữ liệu để làm sau).
- Mỗi lần xuất đọc toàn bộ tài liệu đang trực tuyến, tính vào hạn mức đọc hằng ngày.
- Chỉ gồm dữ liệu đang trực tuyến; hồ sơ đã chuyển lưu giữ nằm trong file ZIP lưu giữ.
- Thẻ "Dung lượng kho dữ liệu" ở Tổng quan vẫn tính theo hạn mức Artifact (không áp dụng cho Firebase).
