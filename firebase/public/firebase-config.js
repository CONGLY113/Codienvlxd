/* Dán cấu hình web app của dự án Firebase vào đây (Firebase Console > Project settings > Your apps > Web app > Config).
   Các giá trị này không phải bí mật; quyền truy cập do firestore.rules và đăng nhập quyết định. */
window.FIREBASE_CONFIG={
  apiKey:"DIEN_API_KEY",
  authDomain:"DIEN_PROJECT_ID.firebaseapp.com",
  projectId:"DIEN_PROJECT_ID",
  storageBucket:"DIEN_PROJECT_ID.appspot.com",
  messagingSenderId:"DIEN_SENDER_ID",
  appId:"DIEN_APP_ID"
};

/* Đăng nhập theo danh sách tài khoản của web app: mỗi tài khoản ứng với một email trong Firebase Authentication.
   Mặc định email = <mã nhân sự viết thường>@<domain>, trừ các tài khoản ghi riêng ở "emails".
   Nếu sửa ở đây thì sửa cả danh sách staffEmails() trong firestore.rules cho khớp. */
window.FIREBASE_LOGIN={
  domain:"ptn.local",
  altDomains:["ptn-vlxd.vn"],
  emails:{ NS009:"hcly113@gmail.com" }
};

/* Thông báo đẩy nền khi đã tắt ứng dụng (tùy chọn, cần gói Blaze và thư mục push/ trong gói triển khai).
   Dán khóa "Web Push certificate" (Firebase Console > Project settings > Cloud Messaging) vào vapidKey.
   Để trống: vẫn có chuông, đếm chưa đọc, âm báo và thông báo của hệ điều hành khi ứng dụng đang mở hoặc chạy nền. */
window.FIREBASE_PUSH={ vapidKey:"" };
