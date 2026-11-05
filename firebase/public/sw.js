/* Service worker tối thiểu để trình duyệt cho phép "Cài đặt ứng dụng".
   Không lưu đệm dữ liệu: web app luôn lấy bản mới nhất và dữ liệu thật từ Firebase. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});
