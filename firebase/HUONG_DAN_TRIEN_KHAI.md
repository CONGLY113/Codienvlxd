# Triển khai web app lên Firebase

Gói này chạy web app **Quản lý mẫu thử nghiệm** (bản 0.27.5) trên Firebase Hosting, lưu dữ liệu dùng chung bằng Cloud Firestore, đăng nhập bằng Firebase Authentication. Web app tự nhận ra có Firebase (nhờ `public/fb-shim.js`) và chuyển sang đăng nhập bằng mật khẩu; không có Firebase thì vẫn chạy chế độ chọn tên như cũ.

## Gói gồm

| File | Việc |
|---|---|
| `public/index.html` | Web app (đã gắn cầu nối Firebase). Sinh ra bằng `scripts/build_public.py`. |
| `public/fb-shim.js` | Cầu nối: đăng nhập theo mật khẩu từng người, kho dữ liệu, khóa cấp số thứ tự. |
| `public/firebase-config.js` | **Cần điền** cấu hình Firebase của anh; có thêm khối `FIREBASE_LOGIN` (đuôi email, ngoại lệ). |
| `public/manifest.webmanifest`, `public/sw.js`, `public/icons/` | Cài web app lên màn hình điện thoại với icon logo. |
| `push/` | **Tùy chọn**, cần gói Blaze: Cloud Function gửi thông báo đẩy nền khi đã tắt ứng dụng. Xem mục "Thông báo giao việc". |
| `firestore.rules` | Luật bảo mật: chỉ email trong danh sách được vào. Đã ghi sẵn 16 email của 16 tài khoản. |
| `firebase.json`, `.firebaserc` | Cấu hình triển khai. `.firebaserc` **cần điền** mã dự án. |
| `scripts/build_public.py` | Sinh lại `public/index.html` khi có phiên bản web app mới. |

## Các bước (khoảng 20 phút)

**1. Tạo dự án.** Vào https://console.firebase.google.com, Add project, đặt tên (ví dụ `ptn-vlxd-quangtri`). Tắt Google Analytics cũng được. Ghi lại **Project ID**.

**2. Bật đăng nhập và tạo người dùng.** Build, Authentication, Get started, Sign-in method:
- Bật **Email/Password**.
- Bật **Anonymous** (cho cổng khách hàng gửi yêu cầu, không cần tài khoản).

Sang tab **Users**, Add user, tạo **đủ 16 người dùng** sau (mật khẩu do trưởng phòng đặt, đưa riêng cho từng người). Email là tên đăng nhập ngầm: cán bộ **không phải gõ email**, chỉ chọn tên mình trong danh sách của web app rồi nhập mật khẩu.

| Tài khoản trong web app | Email tạo ở Firebase |
|---|---|
| NS009 Hoàng Công Lý | `hcly113@gmail.com` |
| NS010 Lưu Minh Tuấn | `ns010@ptn-vlxd.vn` |
| NS011 Nguyễn Thị Bích Lan | `ns011@ptn-vlxd.vn` |
| NS002 Trần Đăng Hùng | `ns002@ptn-vlxd.vn` |
| NS001 Nguyễn Văn Sự | `ns001@ptn-vlxd.vn` |
| NS003 Nguyễn Mậu Thiện | `ns003@ptn-vlxd.vn` |
| NS004 Trần Anh Dũng | `ns004@ptn-vlxd.vn` |
| NS007 Lê Phước Đức | `ns007@ptn-vlxd.vn` |
| NS008 Nguyễn Tiến Hoàng | `ns008@ptn-vlxd.vn` |
| NS012 Hồ Thị Bích Thuỷ | `ns012@ptn-vlxd.vn` |
| NS013 Trần Hoàn | `ns013@ptn-vlxd.vn` |
| NS014 Phan Thanh Hà (Trưởng phòng Kiểm định Hiệu chuẩn, mã tạm) | `ns014@ptn-vlxd.vn` |
| NS015 Nguyễn Thị Cẩm Hiền (giao nhận mẫu, mã tạm) | `ns015@ptn-vlxd.vn` |
| NS016 Giang Tấn Thông (Trưởng phòng Hóa sinh môi trường, mã tạm) | `ns016@ptn-vlxd.vn` |
| NS017 Hoàng Thị Châu (giao nhận mẫu, mã tạm) | `ns017@ptn-vlxd.vn` |
| NS018 Phan Thanh Giàn (Phó giám đốc, mã tạm) | `ns018@ptn-vlxd.vn` |

Đuôi `@ptn-vlxd.vn` chỉ là tên giả để ghép với mã nhân sự, không cần là hộp thư thật. Vì vậy nút "quên mật khẩu bằng email" không dùng được với các email này: khi ai quên mật khẩu, trưởng phòng vào Authentication, Users, bấm dấu ba chấm ở người đó, chọn Reset password (hoặc xóa người dùng rồi tạo lại). Người dùng tự đổi mật khẩu bằng nút **Đổi mật khẩu** ở thanh bên của web app.

**Bắt buộc: tắt cho phép tự đăng ký.** Authentication, Settings, User actions, bỏ chọn **Enable create (sign-up)**, bấm Save. Nếu không, người lạ có thể tự đăng ký đúng một email trong danh sách mà anh chưa tạo và vào được hệ thống.

**3. Tạo cơ sở dữ liệu.** Build, Firestore Database, Create database, chọn **Production mode**, vùng `asia-southeast1` (Singapore) cho gần Việt Nam.

**4. Lấy cấu hình web.** Project settings (biểu tượng bánh răng), mục Your apps, bấm biểu tượng `</>` để đăng ký web app, copy khối `firebaseConfig`. Dán các giá trị vào `public/firebase-config.js`. Điền Project ID vào `.firebaserc`.

**5. Kiểm tra danh sách email trong luật bảo mật.** Mở `firestore.rules`, hàm `staffEmails()` đã ghi sẵn 16 email ở bảng trên. Chỉ email trong danh sách mới đọc và ghi được dữ liệu. Thêm người mới trong web app thì phải thêm cả email vào đây (và vào `firebase-config.js` nếu dùng email riêng, như NS009), rồi chạy `firebase deploy --only firestore:rules`. Nếu muốn đổi đuôi email, sửa `domain` trong `public/firebase-config.js` và sửa cả danh sách trong luật.

**6. Cài công cụ và triển khai.**
```
npm install -g firebase-tools
firebase login
cd firebase
firebase deploy
```
Lệnh đẩy cả trang web (Hosting) và luật bảo mật (Firestore rules). Kết thúc sẽ hiện địa chỉ dạng `https://<project-id>.web.app`. Gửi địa chỉ này cho cán bộ.

**7. Sau khi vào được.** Chọn phòng Cơ điện vật liệu xây dựng, chọn tên Hoàng Công Lý, nhập mật khẩu đã tạo cho `hcly113@gmail.com`, vào Cài đặt, mục "Link web app", dán địa chỉ `.web.app` (để mã QR tra cứu trên phiếu trỏ đúng). Nhập lại đơn giá, thông tin ngân hàng ở các mục tương ứng nếu chạy mới hoàn toàn.

## Đưa web app ra màn hình điện thoại (có icon logo)

Bản triển khai đã có sẵn manifest, icon logo (thư mục `public/icons/`) và `sw.js`, nên mỗi người tự cài được, không cần cửa hàng ứng dụng:

- **iPhone/iPad (Safari)**: mở địa chỉ web app → nút Chia sẻ → **Thêm vào Màn hình chính** → Thêm.
- **Android (Chrome)**: mở địa chỉ → menu ⋮ → **Cài đặt ứng dụng** (hoặc **Thêm vào màn hình chính**).
- **Máy tính (Chrome/Edge)**: biểu tượng cài đặt ở cuối thanh địa chỉ.

Biểu tượng hiện logo của đơn vị, tên dưới icon là "Mẫu thử nghiệm", mở ra toàn màn hình không có thanh địa chỉ. Muốn đổi logo hoặc tên: thay file trong `public/icons/` và sửa `short_name` trong `public/manifest.webmanifest`, rồi `firebase deploy`. iPhone chỉ cài được từ Safari. Nếu đã cài từ trước mà icon cũ, xóa icon rồi thêm lại.

## Thông báo giao việc (bản 0.26.0)

**Có sẵn, không cần cấu hình thêm, không tốn phí.** Khi trưởng phòng giao việc, đổi người, trả lại, hoặc cán bộ nộp kết quả chờ soát xét, hoặc chờ phê duyệt, hoặc có đề nghị sửa phiếu, người liên quan nhận thông báo:
- chuông trên điện thoại, số chưa đọc ở menu và trên tiêu đề tab, trang **Thông báo**, âm báo;
- thông báo của hệ điều hành (Windows, macOS, Android) khi người đó đang ở cửa sổ khác hoặc ứng dụng chạy nền;
- mỗi người tự bấm **Bật thông báo trên thiết bị này** ở trang Thông báo (trình duyệt hỏi quyền một lần cho mỗi thiết bị).

Giới hạn: khi đã **tắt hẳn** ứng dụng hoặc trình duyệt, chưa nhận được thông báo; thông báo chờ sẵn trong hộp và hiện khi mở lại. Muốn nhận cả lúc tắt ứng dụng, bật tầng đẩy nền dưới đây.

### Đẩy nền khi đã tắt ứng dụng (tùy chọn)

Cần: dự án Firebase ở **gói Blaze** (trả theo mức dùng, cần thẻ thanh toán; với quy mô của phòng thường trong hạn mức miễn phí, nên đặt cảnh báo ngân sách), cài Node.js và Firebase CLI.

1. Firebase Console > Project settings > **Cloud Messaging** > **Web Push certificates** > Generate key pair. Sao chép khóa công khai.
2. Dán khóa vào `public/firebase-config.js`, dòng `window.FIREBASE_PUSH={ vapidKey:"..." }`.
3. Mở `push/functions/index.js`, sửa `REGION` cho cùng khu vực với Firestore (Firebase Console > Firestore > Data > Location).
4. Sửa `push/.firebaserc` cho đúng mã dự án. Trong thư mục `push`, chạy:
   ```
   cd push/functions && npm install && cd ..
   firebase deploy --only functions
   ```
5. Triển khai lại giao diện: `firebase deploy --only hosting` (từ thư mục gốc của gói).
6. Mỗi cán bộ mở web app trên thiết bị, vào **Thông báo**, bấm **Bật thông báo trên thiết bị này** và chọn Cho phép.

Cách hoạt động: web app ghi `pushq/<mã>`; hàm `guiThongBao` đọc mã thiết bị ở `fcm_tokens/<mã nhân sự>`, gửi qua Firebase Cloud Messaging rồi xóa tài liệu `pushq`. Chưa bật bước 1 đến 4 thì web app không ghi `pushq`, mọi thứ vẫn chạy ở tầng miễn phí.

Lưu ý: iPhone chỉ nhận được khi web app đã cài lên màn hình chính (iOS 16.4 trở lên). Nội dung thông báo có thể hiện trên màn hình khóa. Tầng đẩy nền chưa được thử trên Firebase thật; sau khi triển khai, dùng nút **Gửi thông báo thử** và một lần giao việc thật để kiểm tra, xem Firebase Console > Functions > Logs nếu không nhận được.

Dọn dẹp: thông báo đã đọc quá 30 ngày và mọi thông báo quá 90 ngày được tự xóa khi người dùng vào web app. Mọi tài khoản nhân viên đọc được hộp thông báo của nhau (cùng quy tắc với dữ liệu khác).

## Sao lưu dữ liệu ra Excel

Vào **Cài đặt** (tài khoản trưởng phòng), mục **Sao lưu dữ liệu ra Excel**, bấm **Xuất toàn bộ dữ liệu ra Excel**. File `PTN_SaoLuu_<ngày>_<giờ>.xlsx` gồm các sheet đọc được (Mau, Ket_qua, So_lieu_goc, Bang_ke, Bang_ke_dong, Nhat_ky, Thiet_bi, Cau_hinh, Bieu_mau_lich_su, Luu_giu_chi_muc, Bo_dem_so, Loi_he_thong), sheet `Doc_toi` giải thích và sheet `DuLieu_Tho` chứa nguyên văn từng tài liệu (JSON, cắt phần 30.000 ký tự mỗi ô) để khôi phục hoặc đối chiếu.

- Nên sao lưu mỗi tuần một lần, cất file vào Google Drive của phòng hoặc ổ cứng ngoài. Web app nhắc trên trang Tổng quan khi quá 7 ngày chưa sao lưu.
- Mặc định bỏ các file nhị phân (file Excel cán bộ đã nộp, phiếu lưu bản cũ, bản biểu mẫu tùy chỉnh) để file nhẹ và đỡ tốn lượt đọc. Tick "Kèm cả nội dung file Excel đã nộp" nếu cần.
- Mỗi lần xuất đọc toàn bộ tài liệu đang trực tuyến: mỗi tài liệu tính một lượt đọc trong hạn mức 50.000 lượt mỗi ngày của gói Spark. Phòng vài nghìn tài liệu dùng không đáng kể. Dữ liệu cũ đã chuyển lưu giữ nằm trong các file ZIP lưu giữ, không nằm trong file Excel này.
- File chứa thông tin khách hàng và công trình: bảo quản kín.

## Cập nhật phiên bản mới

```
python3 scripts/build_public.py ../app/quan-ly-mau-thu-nghiem.html
firebase deploy --only hosting
```
Sửa danh sách email: `firebase deploy --only firestore:rules`.

### Deploy lại có mất dữ liệu cán bộ đã nhập không?

Không. Dữ liệu (mẫu, phiếu, bảng kê, nhật ký, cấu hình, hồ sơ sửa phiếu) nằm trong **Firestore**; tài khoản nằm trong **Authentication**. Hai nơi này tách khỏi Hosting.

| Lệnh | Việc làm | Dữ liệu |
|---|---|---|
| `firebase deploy --only hosting` | Thay file giao diện (index.html, sw.js, icon) | Giữ nguyên |
| `firebase deploy --only firestore:rules` | Thay quy tắc truy cập, không đổi dữ liệu | Giữ nguyên |
| `firebase deploy` (không `--only`) | Hosting, quy tắc, chỉ mục | Giữ nguyên |

Những điều cần chú ý:
- Luôn deploy đúng dự án (kiểm tra `.firebaserc` hoặc `firebase use`). Deploy sang dự án khác sẽ thấy dữ liệu trống vì mỗi dự án có Firestore riêng.
- Chỉ **xóa dữ liệu** khi vào Firebase Console xóa bộ sưu tập, xóa dự án, hoặc chạy lệnh xóa riêng (`firebase firestore:delete`). Deploy không làm việc này.
- Nhân viên đang mở trang vẫn dùng bản cũ đến khi tải lại trang (F5 hoặc mở lại ứng dụng); không mất dữ liệu đã lưu.
- Trước mỗi lần cập nhật lớn, bấm **Xuất toàn bộ dữ liệu ra Excel** trong Cài đặt để có bản lưu.
- Dữ liệu nhập ở bản chạy thử Artifact (kho riêng của Artifact) **không** tự sang Firebase. Dữ liệu chỉ ở Firebase sau khi cán bộ nhập trên địa chỉ Firebase.

## Cách hoạt động và phân quyền

- Mở địa chỉ web: hiện trang đăng nhập của web app (danh sách tài khoản). Chọn tên mình, nhập mật khẩu đã tạo ở Firebase. Đúng thì vào, web app tải lại với phiên của người đó; sai thì báo "Sai mật khẩu". Chưa đăng nhập thì web app **không đọc dữ liệu dùng chung** nên không còn lỗi `permission-denied`.
- Phiên được giữ trên máy (không phải nhập lại mỗi lần mở). Bấm **Đăng xuất** ở thanh bên để thoát hẳn, kể cả phiên Firebase. Đăng xuất ở một tab thì các tab khác tự về trang đăng nhập.
- Mục "Tôi là khách hàng" và địa chỉ có `#khach-hang` đăng nhập ẩn danh. Khách chỉ **tạo mới** được yêu cầu (`kenh = khach`, `status = cho_tiep_nhan`) và dòng nhật ký, không đọc hay sửa được dữ liệu nào khác.
- Phân vai (trưởng phòng, soát xét, kế toán…) do web app quyết định theo tài khoản đã đăng nhập (mỗi người chỉ vào được tài khoản của mình vì mật khẩu riêng). Firebase kiểm soát **ai vào được** và chưa phân quyền theo vai ở tầng dữ liệu: người có tài khoản hợp lệ về kỹ thuật vẫn có thể gọi thẳng kho dữ liệu ngoài giao diện. Muốn chặn cứng theo vai cần làm thêm (custom claims).
- Máy dùng chung: nhớ bấm Đăng xuất sau khi dùng.

## Giới hạn cần biết

1. **Tra cứu phiếu bằng mã QR cho khách chưa đăng nhập:** trang tra cứu cần đọc danh sách bản lưu (`archive`), luật hiện **không** cho khách ẩn danh làm việc đó để không lộ hồ sơ. Khách quét QR sẽ thấy "không tìm thấy". Hai cách: (a) mở dòng `allow list` đã chú thích sẵn trong `firestore.rules` (ai có link đều xem được phiếu, kèm rủi ro lộ hồ sơ lưu trữ), hoặc (b) làm thêm Cloud Function tra cứu theo từng mã (cần gói Blaze). Nên quyết định trước khi phát hành phiếu có QR.
2. **Chưa chuyển dữ liệu cũ:** dữ liệu đang nằm trong kho của Artifact trên claude.ai. Bản Firebase bắt đầu trống. Việc xuất và nhập dữ liệu cũ làm được, cần yêu cầu riêng.
3. **Thẻ "Dung lượng kho dữ liệu" trên Tổng quan** vẫn tính theo hạn mức 25.000 tài liệu của Artifact, chỉ mang tính tham khảo trên Firebase.
4. **Chi phí:** gói Spark (miễn phí) cho 50.000 lượt đọc và 20.000 lượt ghi mỗi ngày, 1 GiB dữ liệu. Với một phòng vài chục người dùng là đủ. Bộ nhớ đệm trong trình duyệt được bật để giảm lượt đọc. Theo dõi tại Firebase Console, Usage.
5. **Chưa thử trên dự án Firebase thật** (cần tài khoản của anh). Cầu nối đã thử với bản giả lập Firebase: chọn tên + mật khẩu, sai mật khẩu, tài khoản chưa tạo, đổi mật khẩu, đăng xuất, trang đăng nhập không phát sinh lỗi từ chối, cấp số thứ tự, ghi, đọc, gộp dữ liệu, khách ẩn danh gửi yêu cầu và bị chặn ghi cấu hình. Luật bảo mật chưa chạy thử trên trình giả lập chính thức, nên hãy thử bằng tài khoản thật sau khi triển khai (đăng nhập, tạo mẫu, khách gửi yêu cầu).

## Tự động triển khai từ GitHub (tùy chọn)

Xem `deploy-github-actions.yml.example`: sao chép thành `.github/workflows/firebase-deploy.yml`, tạo khóa dịch vụ (`firebase init hosting:github` làm tự động) và thêm bí mật `FIREBASE_SERVICE_ACCOUNT` trong cài đặt kho GitHub. Mỗi lần đẩy mã lên nhánh `main` sẽ tự triển khai.

## Nếu gặp lỗi

| Hiện tượng | Nguyên nhân thường gặp |
|---|---|
| "Sai mật khẩu, hoặc tài khoản này chưa được tạo trên Firebase" | Chưa tạo người dùng đó ở Authentication, email tạo sai so với bảng ở bước 2, hoặc mật khẩu sai. |
| Đăng nhập được nhưng báo `permission-denied` sau khi vào | Email người đó chưa có trong `staffEmails()` của `firestore.rules`, hoặc chưa chạy `firebase deploy --only firestore:rules`. |
| "Chưa bật đăng nhập Email/Password" | Bước 2 chưa bật Email/Password. |
| Banner vàng "Không kết nối được Firebase" | Sai cấu hình trong `firebase-config.js` hoặc mất mạng; lúc này web app chạy chế độ cục bộ, ai cũng chọn tên vào được nhưng dữ liệu không dùng chung. |

## Bản 0.27.1: ba phòng làm việc riêng

- Trang đăng nhập có 5 khối: Ban Giám đốc, ba phòng chuyên môn (Cơ điện vật liệu xây dựng, Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường), Phòng Hành chính tổng hợp; chọn khối rồi chọn tên. Sau đăng nhập mọi màn hình hiện theo phòng.
- Dữ liệu mới nằm ở các bộ sưu tập riêng `dv_gia`, `dv_cfg`, `dv_kh`, `dvbk_<yy>`, `dvbg_<yy>`, `dv_tb` (thiết bị), `dv_cc` (giấy chứng nhận). Không đụng dữ liệu thí nghiệm cũ. Luật `firestore.rules` đã áp dụng cho mọi bộ sưu tập, không cần sửa thêm.
- Có 5 email mới cần tạo trong Authentication: `ns014` đến `ns018@ptn-vlxd.vn` (mã nhân viên tạm).
- Nhớ chạy `firebase deploy --only firestore:rules,hosting` để cập nhật cả luật và web app.

## Bản 0.27.3: Tổng hợp thanh toán và Khoán chi

- Trang **Dịch vụ** của phòng Kiểm định hiệu chuẩn đo lường, Hóa sinh môi trường (và Cơ điện nếu có quyền lập bảng kê dịch vụ) có thêm tab **Tổng hợp thanh toán**: mã bảng kê, khách hàng, công trình/cơ sở, ngày lập, chưa thanh toán, đã thanh toán, thanh toán khoán chi. Có tìm kiếm, lọc theo tình trạng và khoảng ngày, dòng cộng, nút **Xuất Excel**.
- Khi đề nghị thanh toán, chọn thêm hình thức **Khoán chi (đối trừ vào khoản chi)**. Thủ quỹ vẫn xác nhận như thường; khoản này tính vào cột khoán chi và trừ vào công nợ.
- Không có collection hay quy tắc mới: deploy lại hosting là đủ, dữ liệu cũ giữ nguyên.

## Bản 0.27.4: Khoán chi cho phòng Cơ điện vật liệu xây dựng

- Ở trang **Thanh toán** của phòng Cơ điện, hộp thoại đề nghị thủ quỹ xác nhận có thêm hình thức **Khoán chi (đối trừ vào khoản chi)**.
- Tab Tổng hợp thanh toán và file Excel của Cơ điện có thêm cột **Khoán chi**; cột Đã thanh toán chỉ còn phần tiền thực thu. Khoán chi vẫn trừ vào số còn lại.
- Không đổi cấu trúc dữ liệu: deploy lại hosting là đủ.

## Danh sách email đăng nhập đã chốt (bản 0.27.4)

Mọi tài khoản dùng đuôi **@ptn-vlxd.vn**, riêng NS009 dùng `hcly113@gmail.com`. Phải tạo đủ 16 người dùng này ở Firebase Console > Authentication > Users (mật khẩu do trưởng phòng đặt). Tài khoản cũ đuôi `@ptn.local` không còn được chấp nhận ở đăng nhập và ở `firestore.rules`.

Sau khi sửa file, chạy: `firebase deploy --only hosting,firestore:rules`.

## Bản 0.27.5: phân quyền Phó giám đốc

NS018 Phan Thanh Giàn có vai trò riêng chỉ xem thanh toán: thấy Bảng kê và báo giá của ba phòng (bảng kê, công nợ, tổng hợp thanh toán) và mục Thanh toán của Cơ điện; không có Soát xét phê duyệt, Sửa đổi phiếu, Thiết bị, Hồ sơ lưu trữ và không ký duyệt bảng kê. Không đổi Firestore: chỉ deploy lại hosting. Phân quyền này chặn ở giao diện, còn `firestore.rules` vẫn cho mọi nhân viên đọc ghi.

## Bản 0.28.2: bổ sung và tối ưu nhiều người dùng
Không đổi Firestore: chỉ deploy lại hosting (`firebase deploy --only hosting`).
- Nhận mẫu thủ công: thêm ô tìm khách hàng và ô tìm công trình (gõ không dấu cũng được).
- Nhiệm vụ của tôi (cán bộ thử nghiệm): phiếu đã phê duyệt có nút «Tải phiếu A4 excel» cạnh Số báo cáo.
- Tối ưu khi 8 người dùng chung: gom lần vẽ lại trang, không mất chữ đang gõ khi người khác cập nhật dữ liệu, cấp số mã phản hồi nhanh hơn.


## Bản 0.28.3
Chỉ thay `public/index.html` rồi triển khai lại (firebase deploy --only hosting). Không đổi quy tắc bảo mật hay dữ liệu. Nén bê tông/vữa: 100 dòng số liệu, phiếu theo biểu mẫu mới; Đo K: nhiều ngày đo trong một bảng, mỗi ngày một sheet phiếu.

## Bản 0.28.4
Chỉ thay `public/index.html` rồi triển khai lại. Phiếu kết quả gạch 2 lỗ đổi bố cục theo form mới.

## Bản 0.28.5
Chỉ thay `public/index.html`. Phiếu xi măng và cát đổi bố cục theo form mới.

## 0.28.6 (10/11/2026)
Phiếu KQ cấp phối bê tông dựng lại theo form CPBT. Chỉ đổi giao diện phiếu; chưa triển khai Firebase (chờ người dùng duyệt bản xem trước).

## 0.28.7 (10/11/2026)
- Cập nhật cả `public/index.html` và `public/fb-shim.js` (shim có thêm incr/setOnce cho cấp số đồng thời). Triển khai: `firebase deploy --only hosting` (không đổi firestore.rules).
- Sau khi triển khai nhấn Ctrl+F5 (hoặc mở lại ứng dụng hai lần) để service worker lấy bản mới.

## 0.28.8 (10/11/2026)
- Nhựa đường lỏng MC70 và nhựa đường đặc 60/70 nhập từng lần đo (biểu mẫu Excel So_lieu mới, mã phiên bản biểu mẫu không đổi). Chỉ đổi `public/index.html`; không đổi `fb-shim.js`, `firestore.rules`. Triển khai: `firebase deploy --only hosting`.
- Sau khi triển khai nhấn Ctrl+F5 (hoặc mở lại ứng dụng hai lần) để service worker lấy bản mới. Mẫu nhựa đã tạo trước đó dùng file Excel cũ cần tải lại biểu mẫu mới.
