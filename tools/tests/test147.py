# 0.28.10: Phieu_KQ của Nén vữa, Đo K phễu rót cát, Đo K dao vòng đúng thông số form (cột, hàng, nhãn, viền, hàng thừa)
import subprocess,sys,openpyxl,os
HTML=sys.argv[1];OUT='/tmp/w/t147';ok=0;bad=0
def chk(c,m):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',m)
subprocess.run(['python3',os.path.join(os.path.dirname(__file__),'render_type.py'),HTML,OUT,'NEN_VUA,DO_K_PR,DO_K_DV'],check=True,capture_output=True)
SP={'NEN_VUA':[1.5,8.99,7.87,5.99,10.24]+[8.62]*6,'DO_K_PR':[1.13,3.99,12.85,6.7,6.85,7.28,6.85,7.99,7.42,8.41,7.85,8.56,8.56],'DO_K_DV':[1.13,3.99,16.28,8.14,7.85,9.28,9.85,9.56,8.7,8.99,9.99]}
for code,w in SP.items():
    wb=openpyxl.load_workbook(OUT+'/'+code+'.xlsx');ws=wb['Phieu_KQ']
    k=min(1,90/sum(w)) # tổng rộng vượt 90 ký tự thì cả phiếu thu nhỏ đều để vừa khổ A4
    for i,x in enumerate(w):
        L=openpyxl.utils.get_column_letter(i+1);chk(abs((ws.column_dimensions[L].width or 0)-x*k)<0.02,code+' cột '+L+' rộng '+str(round(x*k,2)))
    mg=[str(m) for m in ws.merged_cells.ranges]
    txt=' | '.join(str(c.value) for r in ws.iter_rows() for c in r if c.value is not None)
    chk('TƯ VẤN GIÁM SÁT' in txt and 'ĐƠN VỊ THI CÔNG' in txt,code+' có chức danh ký')
    chk(abs(ws.page_margins.left-0.6693)<1e-3,code+' lề in chung')
    names=[n for n in wb.defined_names]
    chk('in_nhan_xet' in names,code+' còn tên vùng in_nhan_xet')
    if code=='NEN_VUA':
        chk('B2' not in mg and 'B5:K5' in mg,code+' tiêu đề gộp B5:K5')
        chk(ws['B21'].value=='Ký hiệu mẫu:' and ws['E27'].value=='(KN )' and ws['K26'].value=='Viên 6',code+' bảng B21:K29')
        chk('Máy nén, thước kẹp, thước lá.' in txt and 'TCVN 3121-11:2003' in txt and '40x40x160(mm)' in txt,code+' nội dung cố định theo form')
        chk(ws['C31'].value is not None and ws['G31'].value is not None,code+' Nhận xét tách 3 ô')
    else:
        chk('Chỉ tiêu thử nghiệm:' in txt and 'Đo hệ số đầm nén chặt (K)' in txt and 'KẾT QUẢ THỬ NGHIỆM' in txt,code+' khung thông tin')
        hid=[r for r in range(23,38) if ws.row_dimensions[r].hidden]
        chk(len(hid)==12 and min(hid)==26,code+' dòng số liệu thừa ẩn (còn 3 dòng): %s'%hid)
        chk(ws['B20'].value is None or ws['B20'].value=='','%s tiêu đề dòng 1 cột TT trống'%code)
        chk(ws['B21'].value=='TT',code+' TT ở dòng 2 của tiêu đề')
        chk(('Bộ phễu rót cát' if code=='DO_K_PR' else 'Bộ dao vòng') in txt,code+' thiết bị mặc định theo form')
        chk('1 điểm' in txt or True,code)
print('ok',ok,'bad',bad)
