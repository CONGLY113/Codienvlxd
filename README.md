# Thí nghiệm xây dựng: Quản lý mẫu thử nghiệm

Web app một file (HTML, JavaScript thuần) quản lý toàn bộ quy trình thí nghiệm vật liệu xây dựng của Phòng thí nghiệm chuyên ngành xây dựng, Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng Quảng Trị: tiếp nhận mẫu, giao việc, nhập số liệu, tự tính toán, soát xét, phê duyệt, phát hành phiếu kết quả (có mã QR tra cứu), bảng kê và thanh toán, quản lý thiết bị, lưu trữ.

Phiên bản hiện tại: **0.27.0** (06/11/2026). Nhật ký từng phiên bản nằm trong `docs/nhat-ky/`.

## Cấu trúc

| Thư mục | Nội dung |
|---|---|
| `app/quan-ly-mau-thu-nghiem.html` | Web app (bản mới nhất). Lịch sử Git giữ các bản 0.12.0 đến 0.27.0. |
| `docs/nhat-ky/` | Nhật ký build từng phiên bản, phân tích biểu mẫu. |
| `docs/quy-trinh/` | Dự thảo quy trình sửa đổi, thay thế phiếu kết quả (Word). |
| `docs/cau-hoi/` | Các file Excel câu hỏi xác nhận và mẫu kiểm tra đã gửi. |
| `assets/` | Logo đơn vị (nền trong suốt), ảnh trụ sở dùng cho trang đăng nhập. |
| `firebase/` | Gói triển khai lên Firebase (Hosting + Firestore + Authentication). Xem `firebase/HUONG_DAN_TRIEN_KHAI.md`. |
| `tools/patches/` | Mã vá theo từng phiên bản (`patchNN.py`) và các đoạn JS/CSS chèn vào. |
| `tools/templates/` | Biểu mẫu Excel gốc của các loại mẫu (nguồn nhúng vào web app). |
| `tools/tests/` | Kiểm thử Playwright (đăng nhập, bảng kê, biểu mẫu, hồi quy) và ảnh chụp. |

## Cách chạy

- Mở trực tiếp file HTML trong trình duyệt để xem thử (dữ liệu lưu cục bộ trong trình duyệt).
- Để dùng chung cho cả phòng, đăng file HTML thành Artifact trên claude.ai (có kho dữ liệu dùng chung), chia sẻ link và mời cán bộ quyền Contributor trở lên.

## Triển khai lên Firebase

Xem `firebase/HUONG_DAN_TRIEN_KHAI.md`. Sau khi sửa `app/quan-ly-mau-thu-nghiem.html`, sinh lại trang triển khai:

```
python3 firebase/scripts/build_public.py app/quan-ly-mau-thu-nghiem.html
cd firebase && firebase deploy --only hosting
```

## Kiểm thử

Các bài kiểm thử trong `tools/tests/` dùng Python Playwright và thư viện JSZip, chạy với đường dẫn file HTML:

```
python3 tools/tests/test103.py app/quan-ly-mau-thu-nghiem.html
```

Lưu ý: một số script còn trỏ đường dẫn làm việc cũ (`/tmp/w/...`) vì viết trong môi trường dựng. Cần sửa đường dẫn khi chạy ở máy khác. Bài `test80.py` chứa bộ kho dữ liệu giả lập mà các bài khác dùng.

## Vận hành

- Chạy độc lập (không Firebase): tài khoản trong màn hình đăng nhập chưa có mật khẩu (chế độ chạy thử).
- Chạy trên Firebase: chọn tên trong danh sách rồi nhập mật khẩu tạo ở Firebase Authentication (xem bảng email trong `firebase/HUONG_DAN_TRIEN_KHAI.md`).
- Dữ liệu thật nằm trong kho dữ liệu của Artifact, không nằm trong kho Git này.
- Dữ liệu cấu hình (đơn giá, ngân hàng, biểu mẫu tùy chỉnh) lưu trong kho dữ liệu, không nằm trong mã nguồn.
