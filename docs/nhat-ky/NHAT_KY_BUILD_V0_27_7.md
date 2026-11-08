# Nhật ký build 0.27.7 (08/11/2026) - trả lời các câu hỏi mở của 0.27.6

## B40 Chức danh dòng ký
- Phiếu hiển thị trên web có dòng Cán bộ thử nghiệm, Trưởng phòng TN (hoặc Người soát xét), Giám đốc. File Excel biểu mẫu không có dòng này; khi in từ web dòng này ẩn.

## B41 Ngày báo cáo
- Ngày kết thúc thử = ngày nhận + 0 (nén bê tông, nén vữa), +1 (đo K), +3 (cát, đá, đầm chặt, đất cấp phối thiên nhiên, đá láng nhựa, đá gốc), +4 (nhựa đường, gạch), +10 (cấp phối bê tông, vữa); dời sang ngày làm việc kế tiếp nếu rơi vào thứ bảy, chủ nhật, lễ, Tết.
- Lịch nghỉ 2026 và 2027 có sẵn trong app; ngày nghỉ thêm và ngày làm bù nhập ở Cài đặt.
- Số báo cáo BCyy.mm.dd.stt và dòng Quảng Trị, ngày… lấy theo ngày báo cáo (= ngày kết thúc thử).
- Giả định chờ xác nhận: +N là ngày lịch; xi măng, thép, bu lông +3; đo chống sét +1.

## B42 Ký hiệu mẫu, ngày đúc, tuổi mẫu (nén bê tông, nén vữa)
- So_lieu: C4/D4 Ký hiệu mẫu, C5/D5 Ngày đúc mẫu (tên vùng in_ky_hieu, in_ngay_duc); tuổi mẫu ở B5 như cũ.
- Form nhập trên web có 3 ô; đổi ngày đúc hoặc ngày bắt đầu thì tuổi mẫu tính lại.
- Mỗi phiếu một ký hiệu mẫu, một ngày đúc; nhiều lứa tuổi thì lập nhiều phiếu.

## B43 Tính lại đầm chặt theo cực trị parabol
- Sửa đổi phiếu có nút «Tính lại đầm chặt theo đỉnh parabol» (Trưởng phòng): liệt kê phiếu đầm chặt đã phát hành, so γkmax, Wo cũ và mới, lập hồ sơ loại T.
- Hồ sơ loại T đi qua soát xét, phê duyệt rồi phát hành phiếu thay thế số cũ kèm SĐ01; phiếu cũ giữ nguyên file đã phát hành.
- Phiếu đo K liên kết với phiếu đầm chặt bị thay cần được tính lại K riêng (app cảnh báo, không tự sửa).

## Kiểm thử
test125 (32), test126 (23), test127 (18), test128 (22) và các bài hồi quy cũ.
