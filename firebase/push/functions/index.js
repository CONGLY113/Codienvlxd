/* Gửi thông báo đẩy nền cho web app Quản lý mẫu thử nghiệm.
   Web app ghi một tài liệu vào pushq/<mã> khi có thông báo (chỉ khi firebase-config.js có FIREBASE_PUSH.vapidKey).
   Hàm này đọc mã thiết bị ở fcm_tokens/<mã nhân sự>, gửi qua Firebase Cloud Messaging rồi xóa tài liệu pushq.
   REGION phải cùng khu vực với cơ sở dữ liệu Firestore (xem Firebase Console > Firestore > Data, mục Location).
   Ví dụ: Singapore = asia-southeast1; nam5 (đa vùng Hoa Kỳ) = us-central1. */
const REGION = 'asia-southeast1';
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');
admin.initializeApp();

exports.guiThongBao = onDocumentCreated({ document: 'pushq/{id}', region: REGION }, async (event) => {
  const snap = event.data;
  if (!snap) return;
  const d = snap.data() || {};
  try {
    if (d.to) {
      const ref = admin.firestore().doc('fcm_tokens/' + d.to);
      const doc = await ref.get();
      const toks = (doc.exists && doc.data().tokens) || {};
      const entries = Object.entries(toks).filter(([, v]) => v && v.token);
      if (entries.length) {
        const res = await admin.messaging().sendEachForMulticast({
          tokens: entries.map(([, v]) => v.token),
          data: { title: String(d.title || ''), body: String(d.body || ''), link: String(d.link || ''), tag: String(d.tag || '') },
          webpush: { headers: { Urgency: 'high', TTL: '86400' } },
        });
        const dead = {};
        res.responses.forEach((r, i) => {
          const code = (r.error && r.error.code) || '';
          if (!r.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(code)) {
            dead['tokens.' + entries[i][0]] = admin.firestore.FieldValue.delete();
          }
        });
        if (Object.keys(dead).length) await ref.update(dead);
      }
    }
  } catch (e) {
    console.error('guiThongBao', e);
  }
  await snap.ref.delete();
});
