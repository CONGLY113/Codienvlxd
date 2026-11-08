# Nhật ký build 0.27.6 (08/11/2026) - sửa lỗi theo file V0.27.5

## Nhóm sửa nhanh (B27 đến B32)
- Tổng hợp quan trắc gốc bỏ Trung bình/Nhỏ nhất/Lớn nhất; Hồ sơ lưu trữ bỏ nhật ký thao tác; in Phiếu nhận mẫu.
- Bỏ nhập nhiệt độ, độ ẩm trừ xi măng; tên file báo cáo BC.dd.mm.yyyy.stt. Đơn vị thi công (viết tắt). Công trình (viết tắt).xlsx.
- Chỉnh chung Phieu_KQ (lề, dòng ký, số báo cáo), gợi ý giá trị đo ở So_lieu, công cụ vẽ bảng Phieu_KQ.

## Phiếu kết quả theo loại mẫu (B33 đến B36)
- Nén bê tông, nén vữa; thép xây dựng, bu lông; thiết kế cấp phối vữa, bê tông; đầm chặt có biểu đồ; đá dăm 5x20, 10x40, 20x70.

## B37 Tổng quan
- Dashboard tiến độ từng thí nghiệm viên.

## B38 Hồ sơ lưu trữ = sheet Phieu_KQ
- Bộ tính công thức, vẽ ô gộp, viền, ảnh, biểu đồ trong app. Đối chiếu 2.209 ô x 31 mẫu: 0 lệch (tools/tests/pkv123.py).

## B39 Thanh toán và báo giá
- Một mục menu, một tab Bảng giá và tài khoản; /dich-vu chuyển về /thanh-toan; nạp đơn giá theo loại mẫu (tools/tests/test124.py, 26 kiểm tra).

## Chưa làm / còn mở
- Bốn tính năng thanh toán chưa làm: nhắc nợ, phiếu thu in, báo cáo doanh thu, xuất Excel hóa đơn điện tử.
- Mã NS014 đến NS018 là giả định; rules Firestore mới kiểm ở phía ứng dụng; 244 dòng đơn giá cần rà soát.
- Câu hỏi mở: chức danh chữ ký, nguồn ngày báo cáo, liên kết Ký hiệu mẫu, nhóm DA 10x40/20x70, báo cáo DM cũ.

## Kiểm thử
test103 155, test108 79, test109 33, test110 37, test111 27, test113 28, test114 3, test115 11, test117 305, test118 21, test119 5518, test120 52, test121 24, test124 26, pkv123 0 lệch.
