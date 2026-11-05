  const step=(n,t)=>h('span',{class:'lg-step'},h('i',null,n),t);
  root.append(h('div',{class:'lg'},h('div',{class:'lg-in'},
    h('div',{class:'lg-hero'},
      h('img',{class:'lg-bg',src:LG_BG_S,srcset:LG_BG_S+' 720w, '+LG_BG_L+' 1448w',sizes:'(max-width:900px) 100vw, 56vw',alt:'Trụ sở Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng Quảng Trị',decoding:'async',fetchpriority:'high'}),
      h('div',{class:'lg-scrim','aria-hidden':'true'}),
      h('div',{class:'lg-brand'},h('img',{class:'lg-logo',src:LOGO_L,alt:LOGO_ALT,width:72,height:72}),h('div',null,h('small',null,'Trung tâm Kỹ thuật Tiêu chuẩn Đo lường Chất lượng'),h('b',null,'Quảng Trị'))),
      h('div',{class:'lg-hc'},
        h('h1',null,'Phòng thí nghiệm ',h('em',null,'chuyên ngành xây dựng')),
        h('div',{class:'lg-steps'},step('01','Nhận mẫu'),step('02','Thử nghiệm'),step('03','Phát hành'),step('04','Thanh toán')))),
    h('div',{class:'lg-side'},
      h('div',{class:'lg-card'},h('div',{class:'lg-card-h'},h('h2',null,'Chọn tài khoản để vào'),h('p',null,'Tài khoản thử nghiệm của phòng')),q,h('div',{class:'lg-list'},secs,empty)),
      h('a',{class:'lg-cta',href:'#khach-hang'},'Tôi là khách hàng: gửi yêu cầu thử nghiệm',h('span',{'aria-hidden':'true'},'→')),
      h('p',{class:'lg-note'},'Chế độ chạy thử: chọn một tài khoản để vào, chưa có mật khẩu. Vai trò hiện là tạm, chỉ để thử luồng. ',h('span',null,'Phiên bản '+BUILD))))));
