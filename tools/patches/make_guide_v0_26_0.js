const fs = require('fs');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType, ShadingType,
  AlignmentType, BorderStyle, LevelFormat, Footer, Header, PageNumber, PageBreak, HeadingLevel, VerticalAlign } = D;

const meta = JSON.parse(fs.readFileSync('/tmp/g/doc/meta.json'));
const FONT = 'Arial';
const TEAL = '0F5C66', RED = 'E11D48', INK = '1F2933', GREY = '5F6B76', LIGHT = 'EAF3F4', AMBER = 'FFF4D6';
const W = 9638; // content width DXA (A4, margins 2cm)

// ---------- helpers ----------
function runs(text, base = {}) {
  // **bold** markup
  const out = [];
  text.split(/(\*\*[^*]+\*\*)/g).forEach(p => {
    if (!p) return;
    if (p.startsWith('**')) out.push(new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, ...base }));
    else out.push(new TextRun({ text: p, font: FONT, ...base }));
  });
  return out;
}
const P = (t, o = {}) => new Paragraph({ spacing: { after: 120, line: 300 }, ...o, children: runs(t, o.run || {}) });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT })] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })] });
const bullet = (t, lvl = 0) => new Paragraph({ numbering: { reference: 'bul', level: lvl }, spacing: { after: 60, line: 290 }, children: runs(t) });
const num = (t, ref = 'num1') => new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 80, line: 290 }, children: runs(t) });
const gap = (n = 120) => new Paragraph({ spacing: { after: n }, children: [] });
const pb = () => new Paragraph({ children: [new PageBreak()] });

const NB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: NB, bottom: NB, left: NB, right: NB };
const thin = { style: BorderStyle.SINGLE, size: 4, color: 'C9D3D8' };
const allThin = { top: thin, bottom: thin, left: thin, right: thin };

function img(name, widthPx, opts = {}) {
  const [w, h] = meta[name];
  const hh = Math.round(h * widthPx / w);
  return new ImageRun({
    type: 'jpg', data: fs.readFileSync(`/tmp/g/doc/${name}.jpg`),
    transformation: { width: widthPx, height: hh },
    altText: { title: name, description: opts.alt || name, name },
  });
}
// Ảnh có khung + chú thích
function figure(name, caption, widthPx = 500) {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 80, after: 60 }, keepNext: true,
      border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, left: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, right: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 } },
      children: [img(name, widthPx - 10, { alt: caption })]
    }),
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 160 }, children: [new TextRun({ text: caption, italics: true, size: 19, color: GREY, font: FONT })] }),
  ];
}
// Bảng chú giải số đỏ
function legend(items) {
  const bw = 520, tw = W - bw;
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [bw, tw],
    rows: items.map(([n, t], idx) => new TableRow({
      cantSplit: true,
      children: [
        new TableCell({ width: { size: bw, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 60, right: 60 },
          shading: { type: ShadingType.CLEAR, fill: RED, color: 'auto' },
          borders: { top: { style: BorderStyle.SINGLE, size: 12, color: 'FFFFFF' }, bottom: { style: BorderStyle.SINGLE, size: 12, color: 'FFFFFF' }, left: NB, right: NB },
          children: [new Paragraph({ keepNext: idx < items.length - 1, alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(n), bold: true, color: 'FFFFFF', font: FONT, size: 22 })] })] }),
        new TableCell({ width: { size: tw, type: WidthType.DXA }, borders: noBorders, verticalAlign: VerticalAlign.CENTER, margins: { top: 40, bottom: 40, left: 100, right: 60 },
          children: [new Paragraph({ keepNext: idx < items.length - 1, spacing: { line: 280 }, children: runs(t) })] }),
      ]
    }))
  });
}
function box(title, lines, fill = AMBER, edge = 'E0A800') {
  const kids = [new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, bold: true, font: FONT, color: INK })] })];
  lines.forEach(l => kids.push(new Paragraph({ spacing: { after: 50, line: 280 }, children: runs(l) })));
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
      borders: { top: NB, bottom: NB, right: NB, left: { style: BorderStyle.SINGLE, size: 24, color: edge } },
      margins: { top: 100, bottom: 80, left: 180, right: 140 }, children: kids })] })]
  });
}
function grid(head, rows, widths) {
  const hdr = new TableRow({ tableHeader: true, cantSplit: true, children: head.map((t, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders: allThin, shading: { type: ShadingType.CLEAR, fill: TEAL, color: 'auto' },
    margins: { top: 70, bottom: 70, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', font: FONT, size: 20 })] })] })) });
  const body = rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((t, i) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, borders: allThin,
    shading: { type: ShadingType.CLEAR, fill: ri % 2 ? 'F6F9FA' : 'FFFFFF', color: 'auto' },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: String(t).split('\n').map(line => new Paragraph({ spacing: { after: 20, line: 270 }, children: runs(line, { size: 20 }) })) })) }));
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows: [hdr, ...body] });
}
function sideBySide(a, b, capA, capB, wpx = 250) {
  const half = Math.floor(W / 2);
  const cell = (n, cap) => new TableCell({
    width: { size: half, type: WidthType.DXA }, borders: noBorders, margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [img(n, wpx)] }),
      new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: cap, italics: true, size: 19, color: GREY, font: FONT })] }),
    ]
  });
  return new Table({ width: { size: half * 2, type: WidthType.DXA }, columnWidths: [half, half], rows: [new TableRow({ cantSplit: true, children: [cell(a, capA), cell(b, capB)] })] });
}

// ---------- NỘI DUNG ----------
const C = []; // children

// Trang bìa
C.push(gap(1400));
C.push(new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'PHÒNG THÍ NGHIỆM VLXD · QUẢNG TRỊ', bold: true, size: 22, color: TEAL, font: FONT, characterSpacing: 40 })] }));
C.push(new Paragraph({ spacing: { after: 60, line: 900, lineRule: 'atLeast' }, children: [new TextRun({ text: 'Hướng dẫn đăng nhập', bold: true, size: 64, color: INK, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 160, line: 900, lineRule: 'atLeast' }, border: { bottom: { style: BorderStyle.SINGLE, size: 18, color: TEAL, space: 10 } }, children: [new TextRun({ text: 'và trải nghiệm web app', bold: true, size: 64, color: INK, font: FONT })] }));
C.push(new Paragraph({ spacing: { after: 400 }, children: [new TextRun({ text: 'Quản lý mẫu thử nghiệm · Phiên bản 0.26.0', size: 30, color: GREY, font: FONT })] }));
C.push(img('tong-quan', 600) && new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, border: { top: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, left: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 }, right: { style: BorderStyle.SINGLE, size: 6, color: 'C9D3D8', space: 4 } }, children: [img('tong-quan', 600)] }));
C.push(grid(['Thông tin', 'Nội dung'], [
  ['Phiên bản', '0.26.0 (cập nhật 06/11/2026)'],
  ['Đối tượng', 'Trưởng phòng, giám đốc, cán bộ giao nhận mẫu, cán bộ thử nghiệm, kế toán, thủ quỹ'],
  ['Địa chỉ web app', '[Trưởng phòng điền địa chỉ sau khi triển khai trên Firebase]'],
  ['Mật khẩu', 'Do trưởng phòng cấp riêng cho từng người; có thể tự đổi sau khi vào'],
], [2400, 7238]));
C.push(pb());

// Mục lục nhanh
C.push(H1('Nội dung hướng dẫn'));
C.push(grid(['Phần', 'Nội dung', 'Dành cho'], [
  ['1', 'Web app này làm được gì?', 'Tất cả'],
  ['2', 'Đăng nhập lần đầu (máy tính và điện thoại)', 'Tất cả'],
  ['3', 'Đổi mật khẩu, đăng xuất, quên mật khẩu', 'Tất cả'],
  ['4', 'Một phiếu đi qua hệ thống như thế nào (7 bước)', 'Tất cả'],
  ['5', 'Làm quen từng màn hình theo công việc', 'Theo vai trò'],
  ['6', 'Cổng khách hàng gửi yêu cầu thử nghiệm', 'Khách hàng, giao nhận mẫu'],
  ['7', 'Sao lưu toàn bộ dữ liệu ra Excel', 'Trưởng phòng'],
  ['8', 'Sửa đổi, thay thế phiếu đã phát hành', 'Giao nhận mẫu, trưởng phòng, giám đốc'],
  ['9', 'Cài web app lên màn hình điện thoại', 'Tất cả'],
  ['10', 'Nhận thông báo giao việc (máy tính, điện thoại)', 'Tất cả'],
  ['11', 'Gặp sự cố thì xử lý thế nào', 'Tất cả'],
], [900, 6338, 2400]));
C.push(gap(160));
C.push(box('Cách đọc tài liệu này', [
  'Trên mỗi ảnh có các **số đỏ ①②③**. Bảng ngay bên dưới ảnh giải thích từng số.',
  'Ảnh chụp dùng **dữ liệu mẫu giả lập** (tên công trình, khách hàng là ví dụ), không phải số liệu thật của phòng.',
], LIGHT, TEAL));

// 1
C.push(H1('1. Web app này làm được gì?'));
C.push(P('Web app giúp phòng thí nghiệm quản lý **toàn bộ đường đi của một mẫu**: từ lúc tiếp nhận, giao việc, thử nghiệm, soát xét, phê duyệt, phát hành phiếu kết quả cho đến thanh toán và lưu trữ hồ sơ. Mỗi người đăng nhập bằng tài khoản riêng và chỉ thấy các chức năng thuộc vai trò của mình.'));
C.push(bullet('**Không cần cài đặt**: mở bằng trình duyệt (Chrome, Edge, Safari) trên máy tính, máy tính bảng hoặc điện thoại.'));
C.push(bullet('**Vẫn dùng Excel quen thuộc**: cán bộ thử nghiệm tải biểu mẫu BM-CAT-01 về, nhập số liệu, rồi upload lại để hệ thống kiểm tra và tính toán.'));
C.push(bullet('**Mọi thao tác đều được ghi nhật ký**: ai làm gì, lúc nào.'));
C.push(bullet('**Dữ liệu lưu trên Firebase** và có thể xuất toàn bộ ra một file Excel để lưu trữ (Phần 7).'));
C.push(...figure('tong-quan', 'Hình 1. Màn hình Tổng quan của trưởng phòng: 7 trạng thái của mẫu, việc cần làm và hoạt động gần đây'));

// 2
C.push(H1('2. Đăng nhập lần đầu'));
C.push(box('Chuẩn bị trước khi đăng nhập', [
  '• **Địa chỉ web app** do trưởng phòng gửi (nên lưu vào thanh dấu trang / màn hình chính điện thoại).',
  '• **Mật khẩu của riêng bạn** do trưởng phòng đặt khi tạo tài khoản trên Firebase. Không dùng chung mật khẩu với người khác.',
], LIGHT, TEAL));
C.push(gap(140));
C.push(H2('2.1. Chọn tài khoản của mình'));
C.push(P('Mở địa chỉ web app. Trang đăng nhập hiện danh sách tài khoản của phòng, chia theo nhóm công việc.'));
C.push(...figure('fb-login', 'Hình 2. Trang đăng nhập: chọn tên của mình trong danh sách'));
C.push(legend([
  [1, '**Ô tìm kiếm**: gõ một phần tên hoặc chức danh để lọc nhanh danh sách.'],
  [2, '**Thẻ tài khoản**: hiện họ tên, chức danh và các quyền của người đó. **Bấm vào thẻ có tên của bạn.**'],
  [3, '**Nút dành cho khách hàng**: khách bên ngoài bấm vào đây để gửi yêu cầu thử nghiệm, không cần tài khoản (xem Phần 6).'],
  [4, '**Dòng nhắc**: chọn đúng tài khoản rồi nhập mật khẩu do trưởng phòng cấp. Quên mật khẩu thì báo trưởng phòng đặt lại.'],
]));
C.push(gap(160));
C.push(H2('2.2. Nhập mật khẩu'));
C.push(P('Sau khi bấm vào thẻ tên, hộp thoại **Đăng nhập** hiện ra.'));
C.push(...figure('fb-pw', 'Hình 3. Hộp thoại nhập mật khẩu'));
C.push(legend([
  [1, 'Xác nhận **đúng tên và chức danh** của mình. Nếu nhầm người, bấm **Đóng** rồi chọn lại.'],
  [2, 'Ô **Mật khẩu**: nhập mật khẩu được cấp.'],
  [3, 'Đánh dấu **Hiện mật khẩu** nếu muốn xem lại những gì vừa gõ (nên tắt khi có người đứng cạnh).'],
  [4, 'Bấm **Đăng nhập** (hoặc nhấn phím Enter). Vào được là thấy màn hình Tổng quan.'],
]));
C.push(gap(160));
C.push(H2('2.3. Nhập sai mật khẩu'));
C.push(P('Nếu nhập sai, hộp thoại giữ nguyên và báo lỗi màu đỏ ngay dưới ô mật khẩu. Bạn chỉ cần gõ lại.'));
C.push(...figure('fb-pw-sai', 'Hình 4. Thông báo khi nhập sai mật khẩu (đã bật “Hiện mật khẩu” để dễ kiểm tra lỗi gõ)'));
C.push(legend([[1, 'Dòng báo lỗi đỏ. Kiểm tra phím Caps Lock, bộ gõ tiếng Việt, rồi gõ lại. Sai nhiều lần thì báo trưởng phòng đặt lại mật khẩu.']]));
C.push(gap(160));
C.push(H2('2.4. Đăng nhập trên điện thoại'));
C.push(P('Giao diện tự co lại vừa màn hình điện thoại. Các bước giống hệt trên máy tính: chạm vào tên, nhập mật khẩu, chạm **Đăng nhập**.'));
C.push(sideBySide('fb-m-login', 'fb-m-pw', 'Hình 5a. Chọn tài khoản', 'Hình 5b. Nhập mật khẩu'));
C.push(gap(100));
C.push(box('Lưu ý khi dùng điện thoại', [
  '• Có thể thêm web app vào **màn hình chính** để mở như một ứng dụng (menu trình duyệt → “Thêm vào màn hình chính”).',
  '• Cán bộ thử nghiệm dùng điện thoại để **nhập số liệu tại hiện trường** ngay trong mục Nhiệm vụ của tôi (Phần 5.4).',
]));

// 3
C.push(pb());
C.push(H1('3. Đổi mật khẩu, đăng xuất, quên mật khẩu'));
C.push(P('Ở góc dưới thanh menu bên trái luôn có khung thông tin tài khoản đang dùng.'));
C.push(...figure('fb-me', 'Hình 6. Khung tài khoản: họ tên, chức danh, quyền, nút Đổi mật khẩu và Đăng xuất', 300));
C.push(H2('3.1. Đổi mật khẩu'));
C.push(P('Nên đổi mật khẩu ngay sau lần đăng nhập đầu tiên (mật khẩu ban đầu do trưởng phòng đặt).'));
C.push(...figure('fb-doimk', 'Hình 7. Hộp thoại Đổi mật khẩu'));
C.push(legend([
  [1, 'Nhập **mật khẩu hiện tại**.'],
  [2, 'Nhập **mật khẩu mới** (ít nhất 8 ký tự; nên gồm chữ, số và ký tự đặc biệt).'],
  [3, '**Nhập lại** mật khẩu mới cho trùng khớp.'],
  [4, 'Bấm **Đổi mật khẩu**. Lần sau đăng nhập bằng mật khẩu mới.'],
]));
C.push(gap(140));
C.push(H2('3.2. Đăng xuất'));
C.push(P('Bấm **Đăng xuất** khi dùng xong, nhất là trên máy tính dùng chung. Nếu bạn đang mở web app ở nhiều thẻ trình duyệt, đăng xuất ở một thẻ thì các thẻ còn lại cũng tự thoát.'));
C.push(H2('3.3. Quên mật khẩu'));
C.push(P('Báo **trưởng phòng** để đặt lại mật khẩu cho bạn trên Firebase. Trưởng phòng không xem được mật khẩu cũ, chỉ đặt được mật khẩu mới.'));

// 4
C.push(H1('4. Một phiếu đi qua hệ thống như thế nào'));
C.push(P('Mỗi phiếu yêu cầu đi qua các trạng thái sau. Thanh trạng thái này nằm ở đầu màn hình Tổng quan (Hình 1), con số là số mẫu đang ở từng bước.'));
C.push(grid(['Bước', 'Trạng thái', 'Ai làm', 'Làm ở đâu'], [
  ['1', 'Chờ tiếp nhận', 'Giao nhận mẫu', 'Nhận mẫu → Hàng đợi từ khách (hoặc Nhập thủ công)'],
  ['2', 'Chờ giao việc', 'Trưởng phòng', 'Giao việc'],
  ['3', 'Đã giao', 'Cán bộ thử nghiệm', 'Nhiệm vụ của tôi → Tải biểu mẫu BM-CAT-01'],
  ['4', 'Đang thử', 'Cán bộ thử nghiệm', 'Nhiệm vụ của tôi → Nhập số liệu và Upload'],
  ['5', 'Chờ soát xét', 'Trưởng phòng', 'Soát xét, phê duyệt → tab Chờ soát xét'],
  ['6', 'Chờ phê duyệt', 'Giám đốc', 'Soát xét, phê duyệt → tab Chờ phê duyệt'],
  ['7', 'Đã phát hành', 'Hệ thống / trưởng phòng', 'Phiếu kết quả; sau đó Thanh toán và Hồ sơ lưu trữ'],
], [800, 2000, 2400, 4438]));
C.push(gap(120));
C.push(box('Nguyên tắc kiểm soát', [
  '• Cán bộ thử nghiệm **không được soát xét hoặc phê duyệt mẫu do chính mình làm**.',
  '• Số báo cáo chỉ được cấp **sau khi phê duyệt**.',
  '• Biểu mẫu nộp lên được hệ thống **kiểm tra tự động** (ô còn thiếu, giá trị lệch ngưỡng) trước khi chuyển soát xét.',
]));

// 5
C.push(pb());
C.push(H1('5. Làm quen từng màn hình'));
C.push(P('Menu bên trái chỉ hiện những mục bạn có quyền dùng, nên mỗi người thấy một menu khác nhau.'));
C.push(grid(['Vai trò', 'Các mục chính trong menu'], [
  ['Trưởng phòng thí nghiệm, quản trị', 'Tất cả, gồm Giao việc, Soát xét, Cài đặt và Sao lưu'],
  ['Giám đốc', 'Phê duyệt kết quả'],
  ['Cán bộ giao nhận mẫu, kế toán', 'Nhận mẫu, Thanh toán, Hồ sơ lưu trữ, Thiết bị'],
  ['Cán bộ thử nghiệm', 'Nhiệm vụ của tôi, Hồ sơ lưu trữ, Thiết bị, Biểu mẫu báo cáo'],
  ['Thủ quỹ, kế toán trưởng', 'Thanh toán (soát xét, ký duyệt bảng kê)'],
], [3600, 6038]));
C.push(gap(160));

C.push(H2('5.1. Tổng quan'));
C.push(P('Trang đầu tiên sau khi đăng nhập: số mẫu ở từng trạng thái, **Việc của bạn** (bấm **Mở** để làm ngay), danh sách **mẫu quá hạn trả kết quả**, dung lượng kho dữ liệu và hoạt động gần đây. Xem lại Hình 1.'));

C.push(H2('5.2. Nhận mẫu (giao nhận mẫu)'));
C.push(P('Ba đường vào của mẫu: yêu cầu khách tự gửi qua cổng khách hàng, nhập thủ công khi khách mang mẫu đến, hoặc bổ sung mẫu vào phiếu đang thực hiện. Mọi mẫu đều qua bước **xem xét yêu cầu** rồi mới được cấp mã mẫu.'));
C.push(...figure('nhan-mau', 'Hình 8. Màn hình Nhận mẫu của cán bộ giao nhận mẫu'));
C.push(legend([
  [1, 'Ba tab: **Hàng đợi từ khách** (yêu cầu mới, có mã tra cứu KH-xxxx), **Phiếu đang thực hiện**, **Nhập thủ công**.'],
  [2, 'Bấm **Xem xét** để kiểm tra thông tin khách, công trình, chỉ tiêu; chấp nhận thì hệ thống cấp mã mẫu và chuyển sang giao việc.'],
]));
C.push(gap(160));

C.push(H2('5.3. Giao việc (trưởng phòng)'));
C.push(P('Chọn cán bộ thử nghiệm có tên trong công bố năng lực cho chỉ tiêu của mẫu. Bên dưới có biểu đồ khối lượng việc của từng người để chia việc cân đối.'));
C.push(...figure('giao-viec', 'Hình 9. Màn hình Giao việc'));
C.push(legend([
  [1, '**Giao cả phiếu** cho một cán bộ: nhanh khi cả phiếu do một người làm.'],
  [2, '**Giao việc** từng mẫu trong danh sách Chờ giao việc.'],
  [3, '**Đổi người** nếu cần giao lại khi mẫu đã giao nhưng chưa tải biểu mẫu.'],
]));
C.push(gap(160));

C.push(H2('5.4. Nhiệm vụ của tôi (cán bộ thử nghiệm)'));
C.push(P('Đây là màn hình làm việc chính của cán bộ thử nghiệm: mỗi phiếu được giao hiện thành một khối, trong đó liệt kê các mẫu cần làm.'));
C.push(...figure('nhiem-vu', 'Hình 10. Nhiệm vụ của tôi của cán bộ thử nghiệm'));
C.push(legend([
  [1, '**Tải BM-CAT-01**: tải file Excel biểu mẫu đã được điền sẵn thông tin mẫu về máy.'],
  [2, '**Nhập số liệu điện thoại**: nhập số liệu trực tiếp trên điện thoại tại hiện trường, không cần Excel.'],
  [3, '**Upload**: tải file Excel đã nhập số liệu thật lên để hệ thống kiểm tra, tính toán và chuyển soát xét.'],
]));
C.push(gap(100));
C.push(P('Phần **Đã nộp** ở cuối trang cho biết mẫu đã nộp, trạng thái và số báo cáo (nếu đã phát hành). Trên điện thoại màn hình hiện như sau:'));
C.push(sideBySide('m-tong-quan', 'm-nhiem-vu', 'Hình 11a. Tổng quan trên điện thoại', 'Hình 11b. Nhiệm vụ của tôi trên điện thoại'));
C.push(gap(160));

C.push(H2('5.5. Soát xét, phê duyệt'));
C.push(P('Trưởng phòng soát xét kết quả, giám đốc phê duyệt. Cột **Kiểm tra file** cho biết file nộp đã đạt kiểm tra tự động hay còn cảnh báo.'));
C.push(...figure('soat-xet', 'Hình 12. Màn hình Soát xét, phê duyệt'));
C.push(legend([
  [1, 'Hai tab: **Chờ soát xét** và **Chờ phê duyệt**, kèm số lượng.'],
  [2, 'Bấm **Soát xét** (hoặc **Phê duyệt**) để xem kết quả, số liệu gốc rồi chấp nhận hoặc trả lại cán bộ làm lại.'],
]));
C.push(gap(160));

C.push(H2('5.6. Thanh toán'));
C.push(P('Giai đoạn 1: lập bảng kê, thủ quỹ soát xét và đóng dấu, ghi nhận ký duyệt. Giai đoạn 2: khách thanh toán, kế toán chọn bảng kê, thủ quỹ xác nhận đã thanh toán.'));
C.push(...figure('thanh-toan', 'Hình 13. Màn hình Thanh toán của kế toán'));
C.push(legend([
  [1, 'Các tab: **Bảng kê thanh toán**, **Tổng hợp thanh toán**, **Bảng giá và tài khoản**, **Phiếu kết quả, bản giấy**.'],
  [2, 'Tick chọn một hoặc nhiều phiếu của cùng khách rồi bấm **Lập bảng kê cho phiếu đã chọn**.'],
]));
C.push(gap(160));

C.push(H2('5.7. Hồ sơ lưu trữ'));
C.push(P('Mỗi báo cáo được lưu trọn gói: yêu cầu, file Excel gốc cán bộ nộp, kết quả và nhật ký thao tác. Tìm theo số báo cáo, mã mẫu, khách hàng hoặc công trình; bấm **Mở hồ sơ** để xem. Mẫu quá 90 ngày được chuyển sang tab **Gói lưu giữ**.'));
C.push(...figure('luu-tru', 'Hình 14. Hồ sơ lưu trữ: tab Đang lưu trực tuyến, Đã lưu giữ, Gói lưu giữ'));

C.push(H2('5.8. Thiết bị'));
C.push(P('Danh mục thiết bị kiểm soát, hạn hiệu chuẩn tiếp theo và tình trạng **Quá hạn, Sắp hết hạn, Còn hạn**. Lọc nhanh bằng các nút trạng thái hoặc tìm theo mã, tên, số sê-ri, người quản lý.'));
C.push(...figure('thiet-bi', 'Hình 15. Danh mục thiết bị và hạn hiệu chuẩn'));

C.push(H2('5.9. Biểu mẫu báo cáo'));
C.push(P('Toàn bộ biểu mẫu gốc của từng loại mẫu (cát xây dựng, đá dăm, xi măng, thép hình, bê tông, vữa…). **Tải biểu mẫu** để dùng, hoặc **Nạp bản chính** khi cập nhật bản mới (chỉ trưởng phòng, quản lý chất lượng). Mỗi lần nạp được lưu thành một phiên bản, có **Lịch sử** để khôi phục.'));
C.push(...figure('mau-bieu', 'Hình 16. Danh mục biểu mẫu theo loại mẫu'));

C.push(H2('5.10. Nhật ký'));
C.push(P('Tra lại lỗi khi chạy thử, lỗi hệ thống và **thao tác của từng người** (ai làm gì, lúc nào, trên mẫu nào). Dùng khi cần truy vết hoặc báo lỗi cho người phát triển.'));
C.push(...figure('nhat-ky', 'Hình 17. Màn hình Nhật ký (tab Nhật ký build)'));

C.push(H2('5.11. Cài đặt (chỉ trưởng phòng)'));
C.push(P('Gồm cài đặt chung (hạn trả kết quả mặc định, chế độ chạy thử), **link web app**, ngưỡng chênh lệch của biểu mẫu BM-CAT-01 và thẻ **Sao lưu dữ liệu ra Excel** (Phần 7).'));
C.push(...figure('cai-dat', 'Hình 18. Màn hình Cài đặt của trưởng phòng', 440));

// 6
C.push(H1('6. Cổng khách hàng gửi yêu cầu'));
C.push(P('Khách hàng không cần tài khoản. Ở trang đăng nhập, khách bấm **Tôi là khách hàng: gửi yêu cầu thử nghiệm** (xem số ③ ở Hình 2), điền thông tin rồi gửi. Yêu cầu hiện ngay ở **Nhận mẫu → Hàng đợi từ khách** (Hình 8) để cán bộ giao nhận mẫu xem xét.'));
C.push(...figure('khach-hang', 'Hình 19. Biểu mẫu khách hàng điền: thông tin khách, dự án/công trình, mẫu thử'));
C.push(bullet('Dấu **\\*** là ô bắt buộc (ví dụ tên đơn vị, công trình).'));
C.push(bullet('Sau khi gửi, khách nhận một **mã tra cứu** dạng KH-xxxx để đối chiếu khi liên hệ với phòng.'));
C.push(bullet('Yêu cầu của khách **chỉ là đề nghị**, chưa có mã mẫu cho đến khi cán bộ giao nhận mẫu xem xét và chấp nhận.'));

// 7
C.push(H1('7. Sao lưu toàn bộ dữ liệu ra Excel'));
C.push(P('Dữ liệu chạy chính trên Firebase. Để có thêm một bản lưu độc lập và dễ xem, **trưởng phòng** xuất toàn bộ dữ liệu ra một file Excel (.xlsx).'));
C.push(num('Vào **Cài đặt**, kéo xuống thẻ **Sao lưu dữ liệu ra Excel**.', 'num2'));
C.push(num('(Tuỳ chọn) đánh dấu **Kèm cả nội dung file Excel đã nộp**. Mục này rất nặng, thường không cần vì tạo lại được từ dữ liệu.', 'num2'));
C.push(num('Bấm **Xuất toàn bộ dữ liệu ra Excel** và chờ file tải về.', 'num2'));
C.push(num('Cất file ở nơi an toàn (Google Drive của phòng, ổ cứng ngoài).', 'num2'));
C.push(...figure('fb-saoluu', 'Hình 20. Thẻ Sao lưu dữ liệu ra Excel trong Cài đặt'));
C.push(P('File gồm các sheet: **Mau** (mẫu), **Ket_qua**, **So_lieu_goc**, **Bang_ke**, **Nhat_ky**, **Thiet_bi**, **Cau_hinh**… và **DuLieu_Tho** (bản nguyên văn từng tài liệu, dùng khi cần khôi phục). Sheet **Doc_toi** giải thích ý nghĩa các sheet.'));
C.push(box('Khuyến nghị', [
  '• Sao lưu **mỗi tuần một lần**. Nếu quá 7 ngày chưa sao lưu, màn hình Tổng quan của trưởng phòng hiện **dòng nhắc màu vàng**.',
  '• Lần sao lưu gần nhất được ghi lại ngay trong thẻ (ngày giờ, người làm, số dòng).',
  '• Việc xuất tính vào hạn mức đọc hằng ngày của Firebase (mỗi tài liệu một lượt đọc); với quy mô của phòng là không đáng kể.',
]));

// 8
C.push(gap(160));

// 8
C.push(H1('8. Sửa đổi, thay thế phiếu đã phát hành'));
C.push(P('Khi khách muốn đổi nội dung trên phiếu đã giao (tên công trình, chủ đầu tư, tư vấn, thi công...) hoặc phòng phát hiện ghi nhầm, **không sửa đè phiếu cũ**. Hệ thống phát hành một **phiếu thay thế** mang số cũ kèm hậu tố **-SĐ01** (lần sau là -SĐ02). Phiếu cũ vẫn được lưu để đối chiếu và không còn giá trị sử dụng. Số liệu thử nghiệm **không bao giờ đổi** theo cách này.'));
C.push(grid(['Loại', 'Khi nào', 'Cần gì'], [
  ['A', 'Phòng ghi nhầm, ghi sót', 'Bằng chứng đối chiếu (phiếu giao nhận, phiếu yêu cầu...); miễn phí'],
  ['B', 'Khách đề nghị đổi thông tin do khách cung cấp', 'Văn bản đề nghị của khách (số, ngày, người đề nghị)'],
  ['D', 'Đổi mẫu, chỉ tiêu, kết quả, hoặc đổi ngày nhận mẫu theo ý khách', 'Không sửa. Hệ thống chỉ ghi nhận từ chối; khách gửi mẫu mới để thử lại'],
], [900, 4200, 4538]));
C.push(gap(100));
C.push(H2('Các bước thực hiện'));
C.push(num('**Cán bộ giao nhận mẫu hoặc trưởng phòng**: vào **Sửa đổi phiếu → Lập đề nghị sửa phiếu**. Gõ số báo cáo, chọn loại A hoặc B, điền ô cần đổi (để trống ô giữ nguyên), nhập căn cứ và lý do, bấm **Gửi đề nghị**.', 'num3'));
C.push(num('**Người soát xét** (khác người lập): mở hồ sơ, đối chiếu văn bản hoặc bằng chứng, bấm **Soát xét đạt** (hoặc Từ chối kèm lý do).', 'num3'));
C.push(num('**Người phê duyệt** (khác người lập): mở hồ sơ, bấm **Phê duyệt và phát hành phiếu thay thế**.', 'num3'));
C.push(num('**Giao nhận mẫu**: tải phiếu thay thế (Excel) giao khách, in **BM-SĐ-02** cho khách ký, thu hồi bản giấy cũ (đóng dấu ĐÃ BỊ THAY THẾ), chọn tình trạng bản cũ và bấm **Xác nhận và đóng hồ sơ**.', 'num3'));
C.push(...figure('sd-list', 'Hình 21. Danh sách hồ sơ sửa phiếu (dữ liệu minh họa)', 520));
C.push(...figure('sd-dlg', 'Hình 22. Lập đề nghị: chọn phiếu, loại thay đổi, nhập giá trị mới', 440));
C.push(...figure('sd-look', 'Hình 23. Trang tra cứu của phiếu thay thế: ghi rõ phiếu bị thay thế, mã băm khớp', 440));
C.push(box('Cần nhớ', [
  '• Quét mã QR của **phiếu cũ** sẽ báo “đã bị thay thế” và chỉ phiếu hiện hành.',
  '• **Ngày nhận mẫu** chỉ sửa khi phòng ghi nhầm và có bằng chứng, do trưởng phòng lập; hệ thống chặn ngày trước ngày lấy mẫu, sau ngày thử nghiệm, hoặc làm lệch tuổi mẫu.',
  '• Người lập hồ sơ **không tự soát xét, tự phê duyệt** hồ sơ của mình.',
  '• Bảng kê và hóa đơn không tự đổi tên mới: hệ thống nhắc, kế toán xử lý.',
  '• Phiếu đã chuyển sang lưu trữ quá 90 ngày chưa lập đề nghị trực tiếp được trong bản này.',
  '• Quy trình đầy đủ, biểu mẫu BM-SĐ-01, BM-SĐ-02 xem file dự thảo “Quy trình sửa đổi, thay thế phiếu kết quả”.',
]));

// 9
C.push(H1('9. Cài web app lên màn hình điện thoại'));
C.push(new Paragraph({ spacing: { after: 100 }, children: [img('app-icon', 64, { alt: 'Biểu tượng web app' }), new TextRun({ text: '   Biểu tượng logo đơn vị sẽ nằm trên màn hình chính, mở ra như một ứng dụng.', font: FONT, size: 24 })] }));
C.push(P('Cài một lần, sau đó chỉ cần chạm biểu tượng. Dữ liệu vẫn nằm trên Firebase, không nằm trong điện thoại; cần có mạng để dùng. Phiên bản mới được cập nhật tự động mỗi khi mở.'));
C.push(grid(['Thiết bị', 'Cách cài'], [
  ['Android, Chrome', 'Mở địa chỉ web app. Bấm dấu **ba chấm** góc phải, chọn **Cài đặt ứng dụng** (hoặc **Thêm vào màn hình chính**), bấm **Cài đặt**.'],
  ['iPhone, iPad, Safari', 'Mở địa chỉ web app bằng **Safari**. Bấm nút **Chia sẻ** (hình vuông mũi tên lên), kéo xuống chọn **Thêm vào Màn hình chính**, bấm **Thêm**.'],
  ['Máy tính, Chrome hoặc Edge', 'Bấm biểu tượng **cài đặt** ở cuối ô địa chỉ (hoặc menu, chọn **Cài đặt ứng dụng**), bấm **Cài đặt**.'],
], [2600, 7038]));
C.push(gap(100));
C.push(box('Lưu ý', [
  '• Trên iPhone chỉ cài được từ **Safari**, không cài được từ Chrome hoặc trình duyệt nhúng trong Zalo.',
  '• Vẫn phải đăng nhập bằng tài khoản của bạn. Dùng xong trên máy dùng chung thì bấm **Đăng xuất**.',
  '• Nếu biểu tượng cũ chưa đổi, gỡ biểu tượng rồi cài lại.',
], LIGHT, TEAL));


// 10
C.push(H1('10. Nhận thông báo giao việc'));
C.push(P('Khi có việc liên quan đến bạn, web app báo ngay: **chuông** trên điện thoại, **số đỏ** ở menu và trên tiêu đề tab, **âm báo**, và **thông báo của hệ điều hành** (máy tính, Android) khi bạn đang ở cửa sổ khác.'));
C.push(grid(['Sự kiện', 'Ai nhận thông báo'], [
  ['Trưởng phòng giao việc, giao cả phiếu, đổi người', 'Cán bộ thử nghiệm được giao (người bị đổi cũng được báo)'],
  ['Soát xét hoặc phê duyệt trả lại làm lại', 'Cán bộ thử nghiệm của mẫu đó, kèm lý do'],
  ['Cán bộ nộp kết quả', 'Người soát xét (Giám đốc nếu Trưởng phòng tự thử nghiệm)'],
  ['Soát xét đạt', 'Giám đốc, chờ phê duyệt'],
  ['Đề nghị sửa phiếu: lập, soát xét đạt, phát hành', 'Người soát xét, Giám đốc, người lập đề nghị'],
], [4600, 5038]));
C.push(gap(100));
C.push(H2('Bật thông báo trên thiết bị của bạn (làm một lần mỗi thiết bị)'));
C.push(num('Đăng nhập, vào mục **Thông báo** (menu, hoặc bấm biểu tượng chuông trên điện thoại).', 'num4'));
C.push(num('Bấm **Bật thông báo trên thiết bị này**, trình duyệt hỏi quyền, chọn **Cho phép**.', 'num4'));
C.push(num('Bấm **Gửi thông báo thử** để kiểm tra. Có thể tắt âm báo hoặc thông báo hệ điều hành bằng hai ô đánh dấu.', 'num4'));
C.push(...figure('tb-page', 'Hình 24. Trang Thông báo: trạng thái, nút bật, danh sách thông báo (dữ liệu minh họa)', 520));
C.push(box('Cần nhớ', [
  '• Mỗi thiết bị bật riêng: bật ở máy tính chưa có nghĩa là điện thoại cũng nhận.',
  '• Khi **đã tắt hẳn** ứng dụng hoặc trình duyệt, thông báo chờ sẵn trong hộp và hiện khi bạn mở lại. Muốn nhận cả lúc tắt ứng dụng, trưởng phòng cần bật dịch vụ đẩy nền của Firebase (gói Blaze), xem hướng dẫn triển khai.',
  '• **iPhone** chỉ nhận được khi đã cài web app lên màn hình chính (Phần 9) và dùng iOS 16.4 trở lên.',
  '• Nếu thấy “Đang bị chặn”: vào cài đặt trang web của trình duyệt, cho phép Thông báo rồi tải lại trang.',
  '• Bạn không nhận thông báo cho chính thao tác của mình.',
]));

C.push(H1('11. Gặp sự cố thì xử lý thế nào'));
C.push(grid(['Hiện tượng', 'Nguyên nhân thường gặp', 'Cách xử lý'], [
  ['Báo sai mật khẩu', 'Gõ nhầm, bật Caps Lock, bộ gõ tiếng Việt', 'Bật “Hiện mật khẩu” kiểm tra, gõ lại. Vẫn sai: báo trưởng phòng đặt lại.'],
  ['Quên mật khẩu', '—', 'Báo trưởng phòng đặt lại mật khẩu trên Firebase.'],
  ['Đăng nhập được nhưng thấy trống, hoặc báo “không có quyền”', 'Email của tài khoản chưa có trong danh sách được phép (quy tắc Firebase)', 'Báo trưởng phòng bổ sung email của bạn vào danh sách rồi đăng nhập lại.'],
  ['Dải màu vàng báo Firebase không kết nối', 'Mất mạng, hoặc chưa cấu hình dự án Firebase', 'Kiểm tra Wi-Fi/4G; nếu vẫn lỗi, báo trưởng phòng.'],
  ['Tải biểu mẫu hoặc Upload không được', 'Mạng chậm, file Excel đang mở, sai biểu mẫu', 'Đóng file Excel, thử lại; dùng đúng biểu mẫu tải từ hệ thống.'],
  ['Không thấy mục trong menu', 'Tài khoản chưa được cấp quyền mục đó', 'Báo trưởng phòng cấp thêm quyền.'],
  ['Máy dùng chung', 'Người sau vào được tài khoản của bạn', 'Luôn bấm Đăng xuất khi dùng xong.'],
], [2700, 3300, 3638]));
C.push(P('**Khi cần hỗ trợ:** chụp màn hình lỗi (kèm thời gian) và gửi trưởng phòng. Mục Nhật ký → Lỗi khi chạy ghi lại các lỗi hệ thống để truy nguyên.', { spacing: { before: 160, after: 0 } }));

// ---------- tài liệu ----------
const doc = new Document({
  creator: 'Phòng thí nghiệm VLXD',
  title: 'Hướng dẫn đăng nhập và trải nghiệm web app Quản lý mẫu thử nghiệm v0.26.0',
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: INK } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 34, bold: true, color: TEAL },
        paragraph: { spacing: { before: 360, after: 160 }, keepNext: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: TEAL, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: INK },
        paragraph: { spacing: { before: 260, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ]
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] },
    { reference: 'num1', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    { reference: 'num4', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    { reference: 'num3', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
    { reference: 'num2', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 360 } } } }] },
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } }, titlePage: true },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Hướng dẫn đăng nhập và trải nghiệm web app · v0.26.0', size: 17, color: GREY, font: FONT })] })] }), first: new Header({ children: [new Paragraph({ children: [] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Phòng thí nghiệm VLXD · Quảng Trị    |    Trang ', size: 17, color: GREY, font: FONT }), new TextRun({ children: [PageNumber.CURRENT], size: 17, color: GREY, font: FONT })] })] }), first: new Footer({ children: [new Paragraph({ children: [] })] }) },
    children: C,
  }],
});

Packer.toBuffer(doc).then(b => {
  fs.mkdirSync('/mnt/user-data/outputs', { recursive: true });
  fs.writeFileSync('/mnt/user-data/outputs/HUONG_DAN_DANG_NHAP_VA_SU_DUNG_V0_26_0.docx', b);
  console.log('ok', (b.length / 1e6).toFixed(2), 'MB');
});
