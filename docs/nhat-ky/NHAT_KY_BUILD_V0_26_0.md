# Nhật ký build v0.26.0 (06/11/2026)

## Yêu cầu
Khi cán bộ giao nhận mẫu hoặc Trưởng phòng giao việc cho cán bộ thí nghiệm, có thể báo trên máy tính hoặc điện thoại không; nếu được thì triển khai theo phương án tối ưu. Đồng thời hoàn thiện hướng dẫn (sửa đổi phiếu, cài lên màn hình điện thoại) và trả lời việc deploy Firebase có mất dữ liệu không.

## Phương án chọn (hai tầng)
1. Tầng 1, không tốn phí, không cần máy chủ (đã làm và kiểm thử): hộp thông báo riêng cho từng người trong Firestore (bộ sưu tập tb_<mã nhân sự>), chuông và số chưa đọc, trang Thông báo, âm báo, số đỏ trên tiêu đề tab và biểu tượng ứng dụng, thông báo của hệ điều hành khi người dùng ở cửa sổ khác hoặc ứng dụng chạy nền (máy tính, Android, iPhone khi đã cài lên màn hình chính).
2. Tầng 2, tùy chọn, cần gói Blaze (đã làm, chưa thử trên Firebase thật): đẩy nền khi đã tắt hẳn ứng dụng bằng Firebase Cloud Messaging. Web app ghi hàng đợi pushq, Cloud Function guiThongBao (thư mục push/) gửi tới các thiết bị đã đăng ký ở fcm_tokens. Chỉ bật khi firebase-config.js có FIREBASE_PUSH.vapidKey; để trống thì web app không ghi pushq và vẫn chạy tầng 1.
Lý do không gửi trực tiếp từ trình duyệt (Telegram, Zalo, email): cần khóa bí mật nằm ở máy chủ, để trong mã web app sẽ bị lộ.

## Sự kiện có thông báo
- Giao việc một mẫu, giao cả phiếu, đổi người được giao: cán bộ được giao (người bị đổi cũng được báo).
- Soát xét hoặc phê duyệt trả lại: cán bộ thử nghiệm của mẫu, kèm lý do.
- Nộp kết quả: người soát xét (Giám đốc nếu Trưởng phòng tự thử nghiệm).
- Soát xét đạt: Giám đốc (chờ phê duyệt).
- Đề nghị sửa phiếu: lập (cho người soát xét), soát xét đạt (cho Giám đốc), phát hành phiếu thay thế (cho người lập).
- Người thao tác không nhận thông báo của chính mình. Lỗi khi ghi thông báo không làm hỏng thao tác chính (đã kiểm thử).

## Thay đổi mã
- Module "0.26.0 THÔNG BÁO" (tools/patches/tb.js) và patch109.py: tbNotify, tbSync (nghe hộp thông báo của người đang đăng nhập), tbAlert/tbOS/tbBeep/tbBadge, trang pages['thong-bao'], mục menu Thông báo, chuông trên thanh trên điện thoại, CSS.
- Dọn tự động: thông báo đã đọc quá 30 ngày, mọi thông báo quá 90 ngày.
- Gói Firebase: fb-shim.js thêm __fbPushEnable (lấy mã thiết bị FCM, lưu fcm_tokens/<mã>); sw.js thêm xử lý push và notificationclick (không hiện trùng khi đang có cửa sổ hiển thị); firebase-config.js thêm FIREBASE_PUSH; thư mục push/ (firebase.json, .firebaserc, functions/index.js, package.json) tách riêng để deploy thường không đòi gói Blaze.
- Luật Firestore không đổi: quy tắc hiện có (nhân viên trong danh sách) bao quát tb_*, pushq, fcm_tokens.

## Tài liệu
- Hướng dẫn Word 0.26.0 (23 trang): thêm phần 10 Nhận thông báo giao việc.
- HUONG_DAN_TRIEN_KHAI.md: mục "Thông báo giao việc" và "Đẩy nền khi đã tắt ứng dụng (tùy chọn)", trả lời "Deploy lại có mất dữ liệu không".

## Kiểm thử
- test109 (mới): 33 mục đạt, 0 lỗi: giao việc bằng giao diện, nội dung thông báo, người giao không tự nhận, chuông và số chưa đọc, tiêu đề tab, bật thông báo hệ điều hành, thông báo hệ điều hành hiện khi ở cửa sổ khác, mở theo liên kết, đọc tất cả, trả lại, đề nghị sửa phiếu chuyển người soát xét rồi Giám đốc, chuông trên điện thoại 390 px, mọi vai trò mở được trang, hàng đợi pushq chỉ ghi khi có cấu hình, lỗi ghi không chặn thao tác.
- Hồi quy: test108 (79), test103 (155), test106, test101, test_fb đạt.

## Giới hạn
- Tầng đẩy nền (FCM, Cloud Function, service worker push) chưa chạy trên Firebase thật; cần thử sau khi triển khai (nút "Gửi thông báo thử" và một lần giao việc thật; xem Functions > Logs nếu không nhận).
- Khi chưa bật tầng 2 và đã tắt hẳn ứng dụng: không nhận được cho đến khi mở lại.
- iPhone cần iOS 16.4 trở lên và web app đã cài lên màn hình chính.
- Mỗi thiết bị bật quyền riêng; trình duyệt chặn thì phải mở lại trong cài đặt trang web.
- Nhân viên đọc được hộp thông báo của nhau (cùng quy tắc với dữ liệu khác); nội dung có thể hiện trên màn hình khóa.
- Chưa có thông báo cho: khách gửi yêu cầu qua cổng (khách ẩn danh không được ghi), hạn trả sắp tới, bảng kê thanh toán. Có thể bổ sung nếu phòng cần.
