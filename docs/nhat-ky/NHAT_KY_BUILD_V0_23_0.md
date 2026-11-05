# Nhật ký build v0.23.0 (05/11/2026)

## Yêu cầu
Trang Firebase báo lỗi đỏ "Không đọc được dữ liệu dùng chung (permission-denied)" ở màn hình đăng nhập. Yêu cầu: người trong danh sách tài khoản của web app đăng nhập bằng mật khẩu tạo ở Firebase; bỏ trang đăng nhập email + mật khẩu ban đầu; viết lại mã.

## Nguyên nhân lỗi
Web app bắt đầu "nghe" các bộ sưu tập dữ liệu ngay khi mở trang, lúc chưa có ai đăng nhập. Luật Firestore chỉ cho email nhân viên đọc, nên mỗi bộ sưu tập (khoảng chục cái) trả một lỗi permission-denied, mỗi lỗi hiện một thông báo đỏ. Gói cũ che bằng khung email/mật khẩu nhưng khung đó chỉ chặn lúc khởi động, không tránh được các lần đọc sớm khi đăng nhập hoặc khi khách mở cổng.

## Thiết kế mới
1. Trang đăng nhập là trang của web app (ảnh trụ sở + danh sách tài khoản). Chọn tên, nhập mật khẩu.
2. Mỗi tài khoản web app ứng với một email Firebase: NS009 = hcly113@gmail.com; còn lại `<mã nhân sự thường>@ptn-vlxd.vn` (cấu hình `FIREBASE_LOGIN` trong firebase-config.js). Cán bộ không gõ email.
3. Chưa đăng nhập nhân viên: cầu nối trả dữ liệu rỗng cho mọi lần đọc, không gửi yêu cầu lên Firebase, nên không còn permission-denied. Khách ẩn danh chỉ đăng nhập khi cần ghi (gửi yêu cầu) hoặc tra cứu QR.
4. Đăng nhập đúng: web app tải lại, phiên khớp với người Firebase đang đăng nhập (ptn_session do cầu nối đồng bộ, sửa tay không đổi được người). Email lạ không thuộc danh sách: bị đăng xuất.
5. Nút Đổi mật khẩu (xác thực lại mật khẩu cũ) và Đăng xuất (thoát cả phiên Firebase; tab khác tự về trang đăng nhập).
6. Luật Firestore: danh sách 11 email nhân viên; hướng dẫn tạo đủ người dùng và tắt tự đăng ký.
7. Dự phòng: toast permission-denied chỉ hiện một lần và chỉ khi đã đăng nhập. Khi không có Firebase, web app vẫn chạy chế độ chọn tên không mật khẩu như cũ.

## Thay đổi file
- app: BUILD 0.23.0; tile tài khoản mở hộp mật khẩu (`fbPwDlg`), `fbChangePwDlg`, `fbLogout`; ghi chú trang đăng nhập; z-index lớp phủ 50 → 70 (hộp thoại nằm trên trang đăng nhập); dòng B17 trong nhật ký build.
- firebase/public/fb-shim.js viết lại (bỏ khung đăng nhập email).
- firebase/public/firebase-config.js: thêm `FIREBASE_LOGIN`.
- firebase/firestore.rules: 11 email.
- firebase/HUONG_DAN_TRIEN_KHAI.md: bảng email, tắt đăng ký, bảng xử lý lỗi.

## Kiểm thử (Firebase giả lập có lưu phiên qua tải lại)
- Trang đăng nhập: không còn khung email, 11 ô tài khoản, 0 lần bị Firebase từ chối, 0 thông báo lỗi.
- Hộp mật khẩu nằm trên trang đăng nhập (điện thoại và máy tính).
- Sai mật khẩu → báo lỗi, chưa vào. Đúng → vào với đúng người, cấp số, ghi, gộp, đọc đạt.
- Đổi mật khẩu: sai mật khẩu cũ bị chặn; đúng thì đổi được.
- Đăng xuất: xóa phiên Firebase và phiên web app. Đăng nhập NS002 bằng mật khẩu riêng đạt. Tài khoản chưa tạo ở Firebase → báo rõ.
- Khách ẩn danh: vào cổng, gửi yêu cầu được, ghi cấu hình bị chặn, không lỗi.
- Phiên cũ ptn_session không có Firebase → về trang đăng nhập.
- Hồi quy test98, test101, smoke92, ui93, test93, test103 (155 đạt, 0 lỗi): đạt.

## Giới hạn / việc anh cần làm
- Chưa thử trên Firebase thật. Cần: tạo đủ 11 người dùng đúng email (bảng trong hướng dẫn), tắt Enable create (sign-up), dán `firestore.rules` mới vào tab Rules và Publish, dán `firebase-config.js` thật.
- Email `@ptn-vlxd.vn` là tên giả, không nhận thư: quên mật khẩu thì trưởng phòng đặt lại trong Console.
- Firebase kiểm soát ai vào được, chưa chặn theo vai ở tầng dữ liệu.
- Mở: QR tra cứu cho khách ẩn danh; chuyển dữ liệu cũ từ Artifact; kho GitHub công khai chứa tên nhân sự và số tài khoản ngân hàng trong mã.
