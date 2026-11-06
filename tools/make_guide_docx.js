const fs=require('fs');
const D=require('/home/claude/.npm-global/lib/node_modules/docx');
const {Document,Packer,Paragraph,TextRun,ImageRun,Table,TableRow,TableCell,WidthType,ShadingType,BorderStyle,AlignmentType,HeadingLevel,LevelFormat,Footer,Header,PageNumber,PageBreak}=D;
const G='/tmp/claude-0/-home-claude/c64f2c08-0025-5f29-8403-f78a9d20d6b8/scratchpad/g/';
const SZ=JSON.parse(fs.readFileSync(G+'sizes.json'));
const FONT='Arial',TEAL='0F5E66';
const W=9638;
function runs(t,o={}){ // **bold** parsing
  return t.split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(s=>s.startsWith('**')?new TextRun({text:s.slice(2,-2),bold:true,font:FONT,...o}):new TextRun({text:s,font:FONT,...o}));}
const P=(t,o={})=>new Paragraph({children:runs(t),spacing:{after:100,line:300},...o});
const H1=t=>new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun({text:t,font:FONT})],pageBreakBefore:true});
const H1n=t=>new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun({text:t,font:FONT})]});
const H2=t=>new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:t,font:FONT})]});
const B=t=>new Paragraph({numbering:{reference:'bul',level:0},children:runs(t),spacing:{after:60,line:290}});
let numId=0;const steps=[];
function S(list){const ref='n'+(++numId);steps.push(ref);return list.map(t=>new Paragraph({numbering:{reference:ref,level:0},children:runs(t),spacing:{after:70,line:290}}));}
function IMG(name,cap,maxW=600,maxH=560){const [w,h]=SZ[name];let k=Math.min(maxW/w,maxH/h);
  return [new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:80,after:40},keepNext:true,children:[new ImageRun({type:'png',data:fs.readFileSync(G+name+'.png'),transformation:{width:Math.round(w*k),height:Math.round(h*k)},altText:{title:cap,description:cap,name}})]}),
   new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:160},children:[new TextRun({text:cap,italics:true,size:19,color:'555555',font:FONT})]})];}
const bd={style:BorderStyle.SINGLE,size:4,color:'BBBBBB'},bds={top:bd,bottom:bd,left:bd,right:bd};
function cell(t,w,o={}){return new TableCell({width:{size:w,type:WidthType.DXA},borders:bds,margins:{top:70,bottom:70,left:110,right:110},shading:o.fill?{type:ShadingType.CLEAR,fill:o.fill,color:'auto'}:undefined,children:(Array.isArray(t)?t:[t]).map(x=>new Paragraph({spacing:{after:30},children:runs(x,{size:20,bold:o.bold,color:o.color})}))});}
function TBL(head,rows,ws){return new Table({width:{size:W,type:WidthType.DXA},columnWidths:ws,rows:[new TableRow({tableHeader:true,children:head.map((t,i)=>cell(t,ws[i],{fill:TEAL,bold:true,color:'FFFFFF'}))}),...rows.map((r,j)=>new TableRow({cantSplit:true,children:r.map((t,i)=>cell(t,ws[i],{fill:j%2?'F3F7F7':undefined}))}))]});}
function NOTE(title,lines,fill='FFF6DD',edge='D9A400'){const b={style:BorderStyle.SINGLE,size:4,color:edge},bl={style:BorderStyle.SINGLE,size:24,color:edge};
  return new Table({width:{size:W,type:WidthType.DXA},columnWidths:[W],rows:[new TableRow({cantSplit:true,children:[new TableCell({width:{size:W,type:WidthType.DXA},borders:{top:b,bottom:b,right:b,left:bl},shading:{type:ShadingType.CLEAR,fill,color:'auto'},margins:{top:100,bottom:100,left:160,right:160},children:[new Paragraph({spacing:{after:50},children:[new TextRun({text:title,bold:true,font:FONT,size:21})]}),...lines.map(l=>new Paragraph({spacing:{after:40,line:280},children:runs(l,{size:20})}))]})]})]});}
const GAP=()=>new Paragraph({spacing:{after:120},children:[]});

const c=[];
// ---- bìa
c.push(new Paragraph({spacing:{before:2400,after:120},alignment:AlignmentType.CENTER,children:[new TextRun({text:'TRUNG TÂM KỸ THUẬT TIÊU CHUẨN ĐO LƯỜNG CHẤT LƯỢNG',bold:true,size:24,font:FONT,color:TEAL})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:900},children:[new TextRun({text:'Web app Quản lý mẫu thử nghiệm · LAB TDC',size:22,font:FONT,color:'555555'})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'HƯỚNG DẪN SỬ DỤNG',bold:true,size:56,font:FONT})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:200},children:[new TextRun({text:'Đăng nhập và phân hệ Thanh toán',bold:true,size:40,font:FONT,color:TEAL})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:1600},children:[new TextRun({text:'Bảng kê, thu tiền, khoán chi, công nợ, tổng hợp thanh toán, báo giá',size:24,font:FONT})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{after:60},children:[new TextRun({text:'Phiên bản phần mềm 0.27.4 · ngày 07/11/2026',size:22,font:FONT})]}));
c.push(new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Áp dụng cho Phòng Kiểm định Hiệu chuẩn đo lường, Phòng Hóa sinh môi trường, Phòng Cơ điện vật liệu xây dựng',size:20,font:FONT,color:'555555'})]}));
// ---- mục lục thủ công
c.push(H1('Nội dung hướng dẫn'));
[['1','Tổng quan: ai làm gì, theo thứ tự nào'],['2','Đăng nhập'],['3','Làm quen màn hình Bảng kê và báo giá'],['4','Lập bảng kê (cán bộ lập)'],['5','Soát xét và duyệt bảng kê'],['6','In, lưu PDF, tải Excel'],['7','Thu tiền: đề nghị, xác nhận, khoán chi'],['8','Tổng hợp thanh toán và xuất Excel'],['9','Công nợ theo tuổi nợ'],['10','Báo giá và bảng giá'],['11','Phòng Cơ điện vật liệu xây dựng'],['12','Bảng phân quyền'],['13','Lỗi thường gặp và cách xử lý']].forEach(([n,t])=>c.push(new Paragraph({spacing:{after:90},children:[new TextRun({text:n+'.  ',bold:true,font:FONT,color:TEAL}),new TextRun({text:t,font:FONT})]})));
c.push(GAP());
c.push(NOTE('Cách dùng tài liệu này',['Mỗi phần có các bước đánh số, ảnh chụp màn hình thật của phần mềm và khung lưu ý. Tên nút, tên tab trong tài liệu trùng với chữ hiện trên màn hình.','Ảnh minh họa dùng dữ liệu thử (khách hàng và bảng kê giả định), không phải số liệu thật của đơn vị.'],'EAF3F4',TEAL));

// ---- 1
c.push(H1('1. Tổng quan: ai làm gì, theo thứ tự nào'));
c.push(P('Phân hệ Thanh toán giúp ba phòng lập bảng kê dịch vụ cho khách hàng theo đúng đơn giá đã ban hành, duyệt trên hệ thống, thu tiền và theo dõi công nợ. Phân hệ này tách riêng khỏi phần thử nghiệm mẫu nên không ảnh hưởng công việc chuyên môn.'));
c.push(H2('Luồng một bảng kê'));
c.push(TBL(['Bước','Việc cần làm','Người thực hiện','Trạng thái hiện trên màn hình'],[
 ['1','Lập bảng kê, chọn dịch vụ từ bảng giá, bấm Gửi thủ quỹ soát xét','Cán bộ lập của phòng','Nháp → Chờ thủ quỹ soát xét'],
 ['2','Soát xét: bấm Soát xét đạt hoặc Trả lại','Thủ quỹ','Đã soát xét, chờ kế toán trưởng duyệt'],
 ['3','Duyệt: bấm Duyệt (kế toán trưởng)','Kế toán trưởng','Đã duyệt'],
 ['4','In bảng kê (3 khối chữ ký), ký, đóng dấu, gửi khách','Cán bộ lập','Đã duyệt'],
 ['5','Khách thanh toán: đề nghị thủ quỹ xác nhận','Cán bộ lập','Chờ thủ quỹ xác nhận'],
 ['6','Đối chiếu tiền về, bấm Xác nhận','Thủ quỹ','Thanh toán một phần hoặc Đã thanh toán'],
 ['7','Theo dõi công nợ, tổng hợp, xuất Excel','Cả phòng, kế toán','Tab Công nợ, Tổng hợp thanh toán']],[700,3900,2000,3038]));
c.push(GAP());
c.push(NOTE('Cần nhớ',['**Giám đốc không nằm trong chuỗi duyệt bảng kê** của ba phòng mới: chuỗi gồm người lập, thủ quỹ soát xét, kế toán trưởng duyệt.','**Báo giá** do trưởng phòng của phòng đó duyệt, xuất PDF gửi khách, không chuyển thành bảng kê.','**Đơn giá chưa gồm thuế GTGT.** Thuế mặc định 0%, chỉnh trực tiếp trong bảng kê khi cần.','Mỗi phòng có số liệu, công nợ, thiết bị và hồ sơ lưu trữ riêng.']));

// ---- 2
c.push(H1('2. Đăng nhập'));
c.push(P('Trang đăng nhập chia thành **5 khối**: Ban Giám đốc, ba phòng chuyên môn (Cơ điện vật liệu xây dựng, Kiểm định Hiệu chuẩn đo lường, Hóa sinh môi trường) và Phòng Hành chính tổng hợp. Ngoài đăng nhập chỉ hiện **họ tên**, không hiện chức danh hay quyền.'));
c.push(H2('2.1. Đăng nhập từng bước'));
c.push(...S(['Mở địa chỉ web của hệ thống. Trang **Chọn đơn vị** hiện ra.','Bấm vào khối của đơn vị mình. Rê chuột qua một khối, ảnh nền bên trái đổi theo phòng.','Ở bước tiếp theo bấm vào **tên của bạn**. Có ô tìm nhanh nếu danh sách dài.','Khi hệ thống chạy trên Firebase, hộp thoại **Mật khẩu** hiện ra: nhập mật khẩu rồi bấm **Đăng nhập**. Ở bản chạy thử (chưa kết nối Firebase), bấm tên là vào luôn.']));
c.push(...IMG('01_login_khoi','Hình 1. Bước 1: chọn đơn vị trong 5 khối',560,360));
c.push(...IMG('02_login_ten','Hình 2. Bước 2: chọn tên của mình trong phòng',560,360));
c.push(H2('2.2. Sau khi đăng nhập'));
c.push(B('Hệ thống mở **không gian làm việc của phòng** bạn chọn: thiết bị, hồ sơ lưu trữ, bảng kê, công nợ đều là dữ liệu riêng của phòng đó.'));
c.push(B('Người thuộc Ban Giám đốc và Phòng Hành chính tổng hợp xem được cả ba phòng. Dùng ô **Đang xem phòng** ở thanh bên trái để chuyển phòng (xem Hình 3 ở phần sau).'));
c.push(B('Bấm **Đăng xuất** ở góc dưới thanh bên khi dùng xong, nhất là trên máy dùng chung.'));
c.push(NOTE('Lưu ý khi đăng nhập',['Chỉ chọn đúng tên của mình. Mọi thao tác (lập, soát xét, duyệt, xác nhận thanh toán) đều được ghi tên người làm vào lưu vết của từng bảng kê.','Quên mật khẩu hoặc không thấy tên mình: báo quản trị hệ thống.']));

// ---- 3
c.push(H1('3. Làm quen màn hình Bảng kê và báo giá'));
c.push(P('Sau khi đăng nhập, bấm mục **Bảng kê và báo giá** ở thanh bên. Phía trên có các tab. Số tab bạn thấy phụ thuộc vào phòng và quyền của bạn.'));
c.push(...IMG('03_dichvu_tab','Hình 3. Màn hình Bảng kê và báo giá; ô Đang xem phòng nằm ở thanh bên (người xem nhiều phòng)',580,380));
c.push(TBL(['Tab','Dùng để làm gì'],[
 ['Bảng kê','Lập mới, mở, sửa, gửi duyệt và in bảng kê. Có thanh lọc theo tình trạng.'],
 ['Báo giá','Lập báo giá gửi khách, do trưởng phòng duyệt, xuất PDF.'],
 ['Công nợ','Bảng kê đã duyệt còn thiếu tiền, nhóm theo khách hàng và theo tuổi nợ.'],
 ['Tổng hợp thanh toán','Bảng liệt kê mọi bảng kê đã duyệt: chưa thanh toán, đã thanh toán, khoán chi; có nút Xuất Excel.'],
 ['Giấy chứng nhận','Tải lên danh sách giấy chứng nhận kiểm định, hiệu chuẩn (chỉ lưu số liên kết với dòng bảng kê).'],
 ['Bảng giá','Xem đơn giá ban hành, cài thuế GTGT mặc định (người có quyền).']],[2300,7338]));
c.push(GAP());
c.push(P('Số bảng kê tự cấp khi lưu, theo mảng việc: **BK.KĐHC.** (Kiểm định, hiệu chuẩn), **BK.ATLĐ.** (An toàn lao động), **BK.HSMT.** (Hóa sinh, môi trường). Số báo giá bắt đầu bằng **BG.**'));

// ---- 4
c.push(H1('4. Lập bảng kê (cán bộ lập)'));
c.push(...S(['Vào tab **Bảng kê**, bấm **Lập bảng kê mới**.','Chọn **mảng việc** (ví dụ Kiểm định, hiệu chuẩn) rồi xác nhận. Phòng Kiểm định Hiệu chuẩn đo lường có hai mảng; Hóa sinh môi trường có một mảng.','Gõ **tên khách hàng**. Nếu khách đã có trong danh bạ, chọn trong gợi ý để tự điền mã số thuế, địa chỉ, liên hệ.','Điền **Mã số thuế** và **Địa chỉ** (cần để kế toán xuất hóa đơn), **Công trình, nội dung**.','Bấm **Thêm từ bảng giá**, tìm và bấm **Thêm** ở từng dịch vụ, xong bấm **Xong**. Đơn giá điền sẵn theo bảng giá ban hành.','Nhập **Số lượng** từng dòng. Chọn chiết khấu nếu có. Kiểm tra **Thuế GTGT** (mặc định 0%).','Bấm **Lưu** để giữ bản nháp, hoặc **Gửi thủ quỹ soát xét** để chuyển bước tiếp.']));
c.push(...IMG('04_chon_mang','Hình 4. Chọn mảng việc khi lập bảng kê mới',520,330));
c.push(...IMG('05_chon_dich_vu','Hình 5. Chọn dịch vụ từ bảng giá, bấm Thêm ở dòng cần dùng',560,360));
c.push(...IMG('06a','Hình 6a. Phần thông tin khách hàng và danh sách dịch vụ',580,330));
c.push(...IMG('06b','Hình 6b. Phần tổng tiền, ghi chú và các nút Lưu, Gửi thủ quỹ soát xét',580,330));
c.push(NOTE('Về đơn giá',['Đơn giá bị **khóa** theo bảng giá ban hành, cán bộ lập không sửa được. Dịch vụ chưa có trong bảng giá: dùng **Thêm dòng phát sinh** và ghi rõ lý do trong ghi chú.','Chỉ **trưởng phòng hoặc quản trị** mới mở khóa đơn giá, phải nhập lý do, hệ thống lưu vết.','Có thể **Nhập từ Excel** hàng loạt dòng dịch vụ; bấm **Tải mẫu Excel** để lấy file mẫu đúng cột.']));
c.push(GAP());
c.push(...IMG('07_gui_soat_xet','Hình 7. Hộp thoại xác nhận khi gửi thủ quỹ soát xét',560,360));
c.push(...IMG('08_ds_bang_ke','Hình 8. Danh sách bảng kê: tình trạng hiện ở từng dòng',560,360));
c.push(P('Sau khi gửi, bảng kê **khóa lại**, cán bộ lập không sửa được nữa. Nếu thủ quỹ trả lại, bảng kê quay về trạng thái nháp để sửa rồi gửi lại.'));

// ---- 5
c.push(H1('5. Soát xét và duyệt bảng kê'));
c.push(H2('5.1. Thủ quỹ soát xét'));
c.push(...S(['Vào **Bảng kê và báo giá**. Số trên menu cho biết có việc đang chờ bạn.','Mở bảng kê đang **Chờ thủ quỹ soát xét**.','Đối chiếu khách hàng, dịch vụ, số lượng, đơn giá, thuế.','Bấm **Soát xét đạt** để chuyển kế toán trưởng, hoặc **Trả lại** và ghi lý do để người lập sửa.']));
c.push(...IMG('09c','Hình 9. Màn hình của thủ quỹ: các nút Soát xét đạt, Trả lại',580,330));
c.push(H2('5.2. Kế toán trưởng duyệt'));
c.push(...S(['Mở bảng kê **Đã soát xét, chờ kế toán trưởng duyệt**.','Bấm **Duyệt (kế toán trưởng)**. Hộp thoại hiện số bảng kê và giá trị; nhập ghi chú nếu cần.','Bấm **Duyệt** trong hộp thoại để hoàn tất. Muốn gửi về người lập sửa thì bấm **Trả lại** và ghi lý do.']));
c.push(...IMG('11_duyet_hop_thoai','Hình 10. Hộp thoại duyệt của kế toán trưởng',560,360));
c.push(NOTE('Lưu ý',['Sau khi duyệt, bảng kê không sửa được. Nếu có sai sót, **kế toán trưởng hoặc quản trị** bấm **Mở lại bảng kê** (chỉ khi chưa có khoản thanh toán nào, kể cả khoản đang chờ xác nhận), bảng kê về nháp, phải gửi soát xét và duyệt lại.','Người lập có thể bấm **Thu hồi về nháp** khi bảng kê còn đang chờ soát xét hoặc chờ duyệt. Bảng kê lập nhầm có thể **Hủy bảng kê** (bản hủy vẫn lưu để đối chiếu).','Trưởng phòng và Giám đốc không có nút duyệt bảng kê. Phần **Lưu vết** cuối bảng kê cho thấy ai, lúc nào, làm gì.']));

// ---- 6
c.push(H1('6. In, lưu PDF, tải Excel'));
c.push(P('Bảng kê đã duyệt có các nút **In / Lưu PDF** và **Tải Excel** ở cuối màn hình.'));
c.push(...S(['Mở bảng kê đã duyệt, bấm **In / Lưu PDF**.','Trong hộp thoại in của trình duyệt chọn máy in, hoặc chọn **Lưu thành PDF**.','Ký ba khối: **Người lập bảng kê**, **Thủ quỹ**, **Đại diện khách hàng**; đóng dấu theo quy định rồi gửi khách.']));
c.push(...IMG('22_ban_in','Hình 11. Bản in bảng kê: thông tin khách, bảng dịch vụ, tổng cộng, bằng chữ và 3 khối chữ ký',560,420));
c.push(B('Nếu tích **In mã QR thanh toán trên bảng kê** và đơn vị đã cài tài khoản nhận thanh toán, bản in có mã VietQR tự điền số tiền còn lại và nội dung chuyển khoản là số bảng kê.'));
c.push(B('Trình duyệt không cho in trực tiếp: bấm **Tải Excel**, mở file và in từ Excel.'));

// ---- 7
c.push(H1('7. Thu tiền: đề nghị, xác nhận, khoán chi'));
c.push(P('Khi khách thanh toán, người lập ghi nhận và **đề nghị thủ quỹ xác nhận**. Tiền chỉ được tính vào “đã thanh toán” sau khi **thủ quỹ xác nhận**. Có thể thanh toán nhiều đợt cho một bảng kê.'));
c.push(H2('7.1. Cán bộ lập: đề nghị xác nhận'));
c.push(...S(['Mở bảng kê **Đã duyệt**. Kéo xuống khung **Thanh toán**.','Bấm **Đề nghị thủ quỹ xác nhận thanh toán**.','Chọn **Hình thức**: Chuyển khoản về tài khoản cơ quan, Nộp tiền mặt cho thủ quỹ, hoặc Khoán chi.','Chọn **Ngày tiền về, ngày nộp**, nhập **Số tiền** (tối đa bằng số còn lại), ghi **Chứng từ, ghi chú** (số giao dịch, người nộp).','Bấm **Gửi thủ quỹ**.']));
c.push(...IMG('12_the_thanh_toan','Hình 12. Khung Thanh toán của bảng kê đã duyệt, chưa có khoản nào',560,200));
c.push(...IMG('13_de_nghi_thanh_toan','Hình 13. Hộp thoại đề nghị thủ quỹ xác nhận thanh toán',560,360));
c.push(...IMG('14_cho_xac_nhan','Hình 14. Sau khi gửi: khoản thanh toán ở trạng thái chờ thủ quỹ xác nhận',560,260));
c.push(P('Nhầm số tiền hoặc khách chưa nộp: bấm **Rút lại** ở dòng khoản đang chờ xác nhận.'));
c.push(H2('7.2. Thủ quỹ: xác nhận'));
c.push(...S(['Mở bảng kê có khoản **Chờ thủ quỹ xác nhận**.','Đối chiếu tiền đã về tài khoản hoặc đã nhận tiền mặt.','Bấm **Xác nhận**, kiểm tra ngày nhận tiền, ghi chú rồi bấm **Đã thanh toán**.','Chưa thấy tiền hoặc sai số: bấm **Trả lại** và ghi lý do.']));
c.push(...IMG('15_thu_quy_xac_nhan','Hình 15. Hộp thoại xác nhận của thủ quỹ',560,360));
c.push(NOTE('Chỉ bấm xác nhận khi tiền đã về',['Xác nhận là bước ghi nhận cuối cùng. Nếu lỡ bấm, thủ quỹ dùng **Thu hồi xác nhận** (phải ghi lý do); khoản đó chuyển sang “bị trả lại” và công nợ tính lại.']));
c.push(GAP());
c.push(H2('7.3. Khoán chi'));
c.push(P('**Khoán chi** là phần thanh toán đối trừ vào khoản chi, không thu tiền mặt hay chuyển khoản. Quy trình giống tiền thật: người lập đề nghị, thủ quỹ xác nhận.'));
c.push(...S(['Trong hộp thoại đề nghị, ở ô **Hình thức** chọn **Khoán chi (đối trừ vào khoản chi)**.','Nhập số tiền và ghi rõ căn cứ ở **Chứng từ, ghi chú** (ví dụ số biên bản đối trừ).','Gửi thủ quỹ; thủ quỹ xác nhận như các khoản khác.']));
c.push(...IMG('16_khoan_chi','Hình 16. Chọn hình thức Khoán chi và ghi căn cứ đối trừ',560,360));
c.push(...IMG('17_the_thanh_toan_xong','Hình 17. Kết quả: khoản chuyển khoản và khoản khoán chi cùng nằm trong bảng thanh toán',560,260));
c.push(NOTE('Cách tính',['**Đã thu (xác nhận)** = tiền chuyển khoản và tiền mặt đã xác nhận. **Khoán chi** tách riêng một ô.','**Còn lại** = Tổng cộng thanh toán − tiền đã thu − khoán chi. Khoản còn **chờ xác nhận** vẫn tính là chưa thanh toán cho tới khi thủ quỹ xác nhận.'],'EAF3F4',TEAL));

// ---- 8
c.push(H1('8. Tổng hợp thanh toán và xuất Excel'));
c.push(P('Tab **Tổng hợp thanh toán** liệt kê mọi bảng kê **đã duyệt** của phòng đang xem, mỗi bảng kê một dòng.'));
c.push(...IMG('18_tong_hop','Hình 18. Tab Tổng hợp thanh toán: số tổng ở trên, bảng chi tiết ở dưới',600,420));
c.push(TBL(['Cột','Ý nghĩa'],[
 ['Mã bảng kê','Số bảng kê, ví dụ BK.KĐHC.26.11.07.1'],
 ['Khách hàng','Tên khách hàng hoặc cơ sở'],
 ['Công trình, cơ sở','Nội dung ghi trong bảng kê'],
 ['Ngày lập','Ngày ghi trên bảng kê'],
 ['Chưa thanh toán','Phần còn thiếu (kể cả khoản đang chờ thủ quỹ xác nhận)'],
 ['Đã thanh toán','Tiền chuyển khoản, tiền mặt đã được thủ quỹ xác nhận'],
 ['Thanh toán khoán chi','Phần đối trừ vào khoản chi đã được xác nhận']],[2700,6938]));
c.push(GAP());
c.push(H2('Cách dùng'));
c.push(B('Ô **Tìm** nhận mã bảng kê, tên khách, công trình hoặc mã số thuế.'));
c.push(B('Ô **Lọc tình trạng**: Tất cả, Còn chưa thanh toán, Có thanh toán, Có khoán chi.'));
c.push(B('**Từ**, **Đến**: giới hạn theo ngày lập bảng kê.'));
c.push(B('Dòng **Cộng** cuối bảng cộng đúng các dòng đang lọc.'));
c.push(B('Bấm **Xuất Excel**: tải file `Tong_hop_thanh_toan_<phòng>_<ngày>.xlsx` có tiêu đề, các cột như trên và dòng tổng bằng công thức. File chỉ gồm các dòng đang lọc.'));

// ---- 9
c.push(H1('9. Công nợ theo tuổi nợ'));
c.push(P('Tab **Công nợ** gom các bảng kê đã duyệt còn thiếu tiền theo từng khách hàng. **Tuổi nợ** tính từ ngày duyệt bảng kê.'));
c.push(...IMG('19_cong_no','Hình 19. Tab Công nợ của phòng: tổng hợp và phân nhóm tuổi nợ',600,420));
c.push(B('Dải số liệu phía trên: số khách còn nợ, tổng phải thu, đã thu, còn lại, số tiền quá 90 ngày.'));
c.push(B('Các cột **≤ 30 ngày**, **31–60**, **61–90**, **> 90** cho biết nợ nằm ở nhóm tuổi nào; cột **Lâu nhất** là tuổi nợ của bảng kê cũ nhất.'));
c.push(B('Bấm dấu **+** đầu dòng để xem từng bảng kê của khách; bấm **Mở** để vào bảng kê.'));
c.push(B('Bấm **Tải Excel** để xuất công nợ của phòng.'));

// ---- 10
c.push(H1('10. Báo giá và bảng giá'));
c.push(H2('10.1. Báo giá'));
c.push(...S(['Vào tab **Báo giá**, bấm lập mới, chọn mảng việc.','Nhập khách hàng, nội dung, thêm dịch vụ từ bảng giá, nhập số lượng.','Gửi **trưởng phòng** của phòng mình duyệt.','Sau khi duyệt, bấm **In / Lưu PDF** gửi khách.']));
c.push(...IMG('21_bao_gia','Hình 20. Tab Báo giá',560,360));
c.push(P('Báo giá **không** chuyển thành bảng kê. Khi khách đồng ý và dịch vụ được thực hiện, lập bảng kê riêng ở tab Bảng kê.'));
c.push(H2('10.2. Bảng giá'));
c.push(...IMG('20_bang_gia','Hình 21. Tab Bảng giá: đơn giá ban hành, chưa gồm thuế GTGT',560,360));
c.push(B('Đổi mảng bằng ô chọn ở đầu bảng, gõ từ khóa để tìm dịch vụ.'));
c.push(B('**Thuế GTGT mặc định** (0%, 5%, 8%, 10%) chỉ **quản trị** chỉnh, và chỉ áp dụng cho bảng kê, báo giá lập **mới**. Bảng kê đã lập giữ nguyên đơn giá và thuế lúc lập. Riêng từng bảng kê vẫn chọn thuế ngay trong bảng kê khi lập.'));
c.push(B('Khi ban hành bảng giá mới, **quản trị** bấm **Nhập bảng giá mới từ Excel**; hệ thống lưu theo phiên bản.'));

// ---- 11
c.push(H1('11. Phòng Cơ điện vật liệu xây dựng'));
c.push(P('Phòng Cơ điện có bảng kê thanh toán dịch vụ thí nghiệm **theo luồng cũ**, giữ nguyên trong mục **Thanh toán** ở thanh bên. Tab **Bảng kê và báo giá** của phòng này dùng cho báo giá (số BG.VLXD.).'));
c.push(H2('Khoán chi ở phòng Cơ điện'));
c.push(...S(['Vào **Thanh toán**, chọn các bảng kê khách đã thanh toán, bấm **Khách đã thanh toán, gửi thủ quỹ xác nhận**.','Ở ô **Hình thức** chọn **Khoán chi (đối trừ vào khoản chi)**, nhập ngày, chứng từ và số tiền từng bảng kê.','Thủ quỹ xác nhận trong danh sách **Đề nghị thanh toán chờ thủ quỹ xác nhận**.']));
c.push(P('Bảng **Tổng hợp thanh toán các bảng kê** của Cơ điện có thêm cột **Khoán chi (đ)**; cột **Đã thanh toán (đ)** chỉ gồm tiền thực thu. File Excel xuất ra cũng có đủ cột này.'));

// ---- 12
c.push(H1('12. Bảng phân quyền'));
c.push(TBL(['Việc','Cán bộ lập','Thủ quỹ','Kế toán trưởng','Trưởng phòng','Giám đốc, Phó GĐ'],[
 ['Lập, sửa bảng kê nháp, gửi soát xét','Có','Không','Không','Có (phòng mình)','Không'],
 ['Soát xét bảng kê','Không','Có','Không','Không','Không'],
 ['Duyệt bảng kê','Không','Không','Có','Không','Không'],
 ['In, tải Excel bảng kê đã duyệt','Có','Có','Có','Có','Xem'],
 ['Đề nghị thanh toán, rút lại','Có','Không','Không','Có (phòng mình)','Không'],
 ['Xác nhận, trả lại, thu hồi thanh toán','Không','Có','Không','Không','Không'],
 ['Lập báo giá','Có','Không','Không','Có (phòng mình)','Không'],
 ['Duyệt báo giá','Không','Không','Không','Có','Không'],
 ['Xem công nợ, tổng hợp thanh toán','Phòng mình','Cả 3 phòng','Cả 3 phòng','Phòng mình','Cả 3 phòng (xem)']],[2900,1200,1100,1350,1500,1588]));
c.push(GAP());
c.push(P('Đơn giá bị khóa với cán bộ lập; trưởng phòng và quản trị mở khóa kèm lý do. Quản trị (Trưởng phòng thí nghiệm) có thể thao tác ở cả ba phòng. Bảng trên là quy định theo thiết kế hiện tại; nếu đơn vị đổi cách phân công, báo quản trị để điều chỉnh.',{}));

// ---- 13
c.push(H1('13. Lỗi thường gặp và cách xử lý'));
c.push(TBL(['Hiện tượng','Nguyên nhân thường gặp','Cách xử lý'],[
 ['Không thấy mục Bảng kê và báo giá','Tài khoản chưa được cấp quyền lập bảng kê','Báo quản trị cấp quyền'],
 ['Không thấy tab Bảng kê, chỉ có Báo giá','Phòng đang xem không lập bảng kê dịch vụ theo luồng mới (ví dụ Cơ điện)','Chuyển sang phòng đúng ở ô Đang xem phòng, hoặc dùng mục Thanh toán (Cơ điện)'],
 ['Không sửa được đơn giá','Đơn giá bị khóa theo bảng giá ban hành','Báo trưởng phòng mở khóa, ghi lý do'],
 ['Báo “Số tiền không hợp lệ”','Số tiền lớn hơn phần còn lại, hoặc bằng 0','Nhập số tiền không vượt số còn lại (đã trừ khoản đang chờ xác nhận)'],
 ['Không thấy nút Đề nghị thanh toán','Bảng kê chưa duyệt, đã thanh toán đủ, hoặc không phải bạn lập','Kiểm tra trạng thái; chỉ người lập đề nghị'],
 ['Công nợ không giảm sau khi khách nộp','Khoản mới ở trạng thái Chờ thủ quỹ xác nhận','Nhắc thủ quỹ xác nhận'],
 ['Không in được','Trình duyệt chặn cửa sổ in','Bấm Tải Excel và in từ Excel'],
 ['Không thấy dữ liệu phòng khác','Mỗi phòng có dữ liệu riêng','Người có quyền xem nhiều phòng dùng ô Đang xem phòng'],
 ['Nhập nhầm xác nhận thanh toán','Thủ quỹ bấm nhầm','Thủ quỹ dùng Thu hồi xác nhận, ghi lý do']],[2700,3300,3638]));
c.push(GAP());
c.push(NOTE('Cần hỗ trợ',['Ghi lại số bảng kê, tên người thao tác, thời điểm và chụp màn hình thông báo lỗi khi báo quản trị. Phần **Lưu vết** của bảng kê giúp tra nhanh ai đã làm gì.'],'EAF3F4',TEAL));

const doc=new Document({
 creator:'LAB TDC',title:'Hướng dẫn sử dụng đăng nhập và phân hệ thanh toán',
 styles:{default:{document:{run:{font:FONT,size:22}}},paragraphStyles:[
  {id:'Heading1',name:'Heading 1',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:FONT,size:34,bold:true,color:TEAL},paragraph:{spacing:{before:120,after:200},keepNext:true,outlineLevel:0,border:{bottom:{style:BorderStyle.SINGLE,size:8,color:TEAL,space:4}}}},
  {id:'Heading2',name:'Heading 2',basedOn:'Normal',next:'Normal',quickFormat:true,run:{font:FONT,size:26,bold:true,color:'1B1B1B'},paragraph:{spacing:{before:260,after:120},keepNext:true,outlineLevel:1}}]},
 numbering:{config:[{reference:'bul',levels:[{level:0,format:LevelFormat.BULLET,text:'•',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:270}}}}]},
  ...steps.map(r=>({reference:r,levels:[{level:0,format:LevelFormat.DECIMAL,text:'%1.',alignment:AlignmentType.LEFT,style:{paragraph:{indent:{left:540,hanging:360}},run:{bold:true,color:TEAL}}}]}))]},
 sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},
  headers:{default:new Header({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new TextRun({text:'Hướng dẫn sử dụng · Đăng nhập và phân hệ Thanh toán · v0.27.4',size:17,color:'777777',font:FONT})]})]})},
  footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:'Trang ',size:18,color:'777777',font:FONT}),new TextRun({children:[PageNumber.CURRENT],size:18,color:'777777',font:FONT})]})]})},
  children:c}]});
Packer.toBuffer(doc).then(b=>{fs.writeFileSync('/tmp/claude-0/-home-claude/c64f2c08-0025-5f29-8403-f78a9d20d6b8/scratchpad/Huong_dan_dang_nhap_va_thanh_toan_v0_27_4.docx',b);console.log('ok')});
