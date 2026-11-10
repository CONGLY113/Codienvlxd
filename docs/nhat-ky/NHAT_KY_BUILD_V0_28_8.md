# Nhật ký build 0.28.8 (10/11/2026)
## Nhựa đường: nhập từng lần đo theo nhật ký quan trắc gốc
- Nhựa đường lỏng MC70 (7 nhóm chỉ tiêu → 10 kết quả: Furol, chớp cháy, hàm lượng nước, chưng cất 225/260/316 °C và nhựa còn lại, nhớt tuyệt đối, kéo dài, hòa tan) và nhựa đường đặc 60/70 (8 chỉ tiêu: kim lún, kéo dài, hóa mềm, chớp cháy, tỷ lệ kim lún sau gia nhiệt, tổn thất khối lượng, khối lượng riêng, dính bám) làm độc lập, mỗi mẫu có chỉ tiêu và lần đo riêng theo báo cáo của từng mẫu.
- Sheet So_lieu: bảng tổng hợp phía trên (B5…) là công thức lấy từ khu «QUAN TRẮC CHI TIẾT» (từ hàng 22). Ô vàng nhập số liệu đo, ô xám tự tính, ô xanh là kết quả chuyển lên bảng tổng hợp. Luồng So_lieu → Phieu_KQ không đổi.
- Hệ số hiệu chỉnh là ô nhập có mặc định như file (áp suất chớp cháy 0,25 °C/kPa; hệ số Furol 1; ρ nước 1). Khối lượng riêng nhựa đặc dùng ρ nước theo nhiệt độ thử (công thức Kell).
- Chênh lệch giữa các lần đo vượt sai lệch cho phép: chỉ cảnh báo «Thử lại», vẫn cho nộp. Chỉ kiểm tra khi người thử nhập sai lệch cho phép.
- Tỷ lệ kim lún sau gia nhiệt = trung bình sau gia nhiệt / kim lún ban đầu (mục 1, đã làm tròn) × 100.
## Kiểm thử
- test139 (MC70), test140 (60/70): kết quả trong web khớp kết quả Excel tính lại bằng LibreOffice; test141: tải lên file điền sẵn → hệ thống phân tích đạt.
- Lỗi phát hiện và sửa khi kiểm thử: kiểm tra lặp lại gặp mục rỗng; ô đối chiếu kết quả tính (n, bad) cố định theo MC70, nay tính theo số chỉ tiêu.
## Công cụ
- tools/make_nhua_templates.py và tools/make_nhua_6070.py dựng khu quan trắc chi tiết trong DIRECT_B64.
