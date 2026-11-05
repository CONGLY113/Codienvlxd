# Triển khai web app lên Firebase

Gói này chạy web app **Quản lý mẫu thử nghiệm** (bản 0.22.0) trên Firebase Hosting, lưu dữ liệu dùng chung bằng Cloud Firestore, đăng nhập bằng Firebase Authentication. Mã web app không đổi; file `public/fb-shim.js` nối web app với Firebase.

## Gói gồm

| File | Việc |
|---|---|
| `public/index.html` | Web app (đã gắn cầu nối Firebase). Sinh ra bằng `scripts/build_public.py`. |
| `public/fb-shim.js` | Cầu nối: đăng nhập, kho dữ liệu, khóa cấp số thứ tự. |
| `public/firebase-config.js` | **Cần điền** cấu hình Firebase của anh. |
| `firestore.rules` | Luật bảo mật: chỉ email trong danh sách được vào. **Cần sửa danh sách email.** |
| `firebase.json`, `.firebaserc` | Cấu hình triển khai. `.firebaserc` **cần điền** mã dự án. |
| `scripts/build_public.py` | Sinh lại `public/index.html` khi có phiên bản web app mới. |

## Các bước (khoảng 20 phút)

**1. Tạo dự án.** Vào https://console.firebase.google.com, Add project, đặt tên (ví dụ `ptn-vlxd-quangtri`). Tắt Google Analytics cũng được. Ghi lại **Project ID**.

**2. Bật đăng nhập.** Build, Authentication, Get started, Sign-in method:
- Bật **Email/Password**.
- Bật **Anonymous** (cho cổng khách hàng gửi yêu cầu, không cần tài khoản).
Sang tab Users, Add user: nhập email và mật khẩu cho từng cán bộ (trưởng phòng, giao nhận mẫu, thử nghiệm, kế toán, thủ quỹ, giám đốc). Cán bộ tự đổi mật khẩu bằng nút "Quên mật khẩu" ở màn hình đăng nhập.

**3. Tạo cơ sở dữ liệu.** Build, Firestore Database, Create database, chọn **Production mode**, vùng `asia-southeast1` (Singapore) cho gần Việt Nam.

**4. Lấy cấu hình web.** Project settings (biểu tượng bánh răng), mục Your apps, bấm biểu tượng `</>` để đăng ký web app, copy khối `firebaseConfig`. Dán các giá trị vào `public/firebase-config.js`. Điền Project ID vào `.firebaserc`.

**5. Điền danh sách email nhân viên.** Mở `firestore.rules`, trong hàm `staffEmails()` ghi các email (chữ thường) đã tạo ở bước 2. Chỉ người có email trong danh sách mới đọc và ghi được dữ liệu, kể cả khi người lạ tự tạo được tài khoản.

**6. Cài công cụ và triển khai.**
```
npm install -g firebase-tools
firebase login
cd firebase
firebase deploy
```
Lệnh đẩy cả trang web (Hosting) và luật bảo mật (Firestore rules). Kết thúc sẽ hiện địa chỉ dạng `https://<project-id>.web.app`. Gửi địa chỉ này cho cán bộ.

**7. Sau khi vào được.** Đăng nhập bằng email trưởng phòng, chọn tài khoản người dùng ở màn hình chọn vai, vào Cài đặt, mục "Link web app", dán địa chỉ `.web.app` (để mã QR tra cứu trên phiếu trỏ đúng). Nhập lại đơn giá, thông tin ngân hàng ở các mục tương ứng nếu chạy mới hoàn toàn.

## Cập nhật phiên bản mới

```
python3 scripts/build_public.py ../app/quan-ly-mau-thu-nghiem.html
firebase deploy --only hosting
```
Sửa danh sách email: `firebase deploy --only firestore:rules`.

## Cách hoạt động và phân quyền

- Mở địa chỉ web: hiện màn hình đăng nhập email và mật khẩu. Đăng nhập xong web app chạy như bản cũ.
- Mục "Tôi là khách hàng" và địa chỉ có `#khach-hang` đăng nhập ẩn danh. Khách chỉ **tạo mới** được yêu cầu (`kenh = khach`, `status = cho_tiep_nhan`) và dòng nhật ký, không đọc hay sửa được dữ liệu nào khác.
- Phân vai (trưởng phòng, soát xét, kế toán…) vẫn do web app quyết định theo tài khoản chọn trong app, như cũ. Firebase kiểm soát **ai vào được**, chưa phân quyền theo vai ở tầng dữ liệu. Muốn chặn cứng theo vai cần làm thêm.
- Người đã đăng nhập vẫn giữ phiên. Muốn đổi tài khoản Firebase trên máy dùng chung: mở Console của trình duyệt chạy `__fbSignOut()` hoặc xóa dữ liệu trang.

## Giới hạn cần biết

1. **Tra cứu phiếu bằng mã QR cho khách chưa đăng nhập:** trang tra cứu cần đọc danh sách bản lưu (`archive`), luật hiện **không** cho khách ẩn danh làm việc đó để không lộ hồ sơ. Khách quét QR sẽ thấy "không tìm thấy". Hai cách: (a) mở dòng `allow list` đã chú thích sẵn trong `firestore.rules` (ai có link đều xem được phiếu, kèm rủi ro lộ hồ sơ lưu trữ), hoặc (b) làm thêm Cloud Function tra cứu theo từng mã (cần gói Blaze). Nên quyết định trước khi phát hành phiếu có QR.
2. **Chưa chuyển dữ liệu cũ:** dữ liệu đang nằm trong kho của Artifact trên claude.ai. Bản Firebase bắt đầu trống. Việc xuất và nhập dữ liệu cũ làm được, cần yêu cầu riêng.
3. **Thẻ "Dung lượng kho dữ liệu" trên Tổng quan** vẫn tính theo hạn mức 25.000 tài liệu của Artifact, chỉ mang tính tham khảo trên Firebase.
4. **Chi phí:** gói Spark (miễn phí) cho 50.000 lượt đọc và 20.000 lượt ghi mỗi ngày, 1 GiB dữ liệu. Với một phòng vài chục người dùng là đủ. Bộ nhớ đệm trong trình duyệt được bật để giảm lượt đọc. Theo dõi tại Firebase Console, Usage.
5. **Chưa thử trên dự án Firebase thật** (cần tài khoản của anh). Cầu nối đã thử với bản giả lập Firebase: đăng nhập, sai mật khẩu, cấp số thứ tự, ghi, đọc, gộp dữ liệu, khách ẩn danh gửi yêu cầu và bị chặn ghi cấu hình. Luật bảo mật chưa chạy thử trên trình giả lập chính thức, nên hãy thử bằng tài khoản thật sau khi triển khai (đăng nhập, tạo mẫu, khách gửi yêu cầu).

## Tự động triển khai từ GitHub (tùy chọn)

Xem `deploy-github-actions.yml.example`: sao chép thành `.github/workflows/firebase-deploy.yml`, tạo khóa dịch vụ (`firebase init hosting:github` làm tự động) và thêm bí mật `FIREBASE_SERVICE_ACCOUNT` trong cài đặt kho GitHub. Mỗi lần đẩy mã lên nhánh `main` sẽ tự triển khai.
