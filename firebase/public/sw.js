/* Service worker: giữ cho trình duyệt cho phép "Cài đặt ứng dụng" và hiện thông báo đẩy nền.
   Không lưu đệm dữ liệu: web app luôn lấy bản mới nhất và dữ liệu thật từ Firebase. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',()=>{});

/* Thông báo đẩy nền (Firebase Cloud Messaging, thư mục push/). Nếu đang có cửa sổ web app hiển thị thì web app tự báo, không hiện thêm. */
self.addEventListener('push',e=>{
  let j={};try{j=e.data?e.data.json():{};}catch(x){}
  const d=j.data||j.notification||j||{};
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    if(cs.some(c=>c.visibilityState==='visible'))return;
    return self.registration.showNotification(d.title||'Phòng thí nghiệm',{body:d.body||'',tag:d.tag||undefined,icon:'icons/icon-192.png',badge:'icons/favicon-32.png',data:{link:d.link||''}});
  }));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  const link=(e.notification.data&&e.notification.data.link)||'';
  const url=self.registration.scope+(link?'#'+link:'');
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if('focus' in c){return c.focus().then(w=>{try{if(link&&w&&'navigate' in w)return w.navigate(url);}catch(x){}});}}
    return self.clients.openWindow(url);
  }));
});
