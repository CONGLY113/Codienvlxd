#!/usr/bin/env python3
"""Tạo template đá 10x40 và 20x70 từ template đá 5x20 (chuẩn), chỉ khác cỡ sàng, nhóm hạt, mã biểu mẫu.
Đồng thời bỏ yêu cầu độ lệch 2 lần thử khối lượng thể tích xốp (Kiem_tra, _HeThong) ở cả ba loại.
Cách dùng: python3 tools/make_da_templates.py app/quan-ly-mau-thu-nghiem.html
Đọc DA_B64 (5x20) trong file HTML, ghi lại DA_B64, B64N.DA_10_40 và DIRECT_B64.DA_20_70."""
import sys,re,io,zipfile,base64,html,json
HTML=sys.argv[1]
s=open(HTML,encoding='utf8').read()
m=re.search(r"const DA_B64='([A-Za-z0-9+/=]+)'",s)
src=base64.b64decode(m.group(1))
def esc(t): return html.escape(t,quote=False)
def cell(x,ref):
    return re.search(r'<c r="%s"(?: [^>]*?)?(?:/>|>.*?</c>)'%ref,x,re.S)
def put_text(x,ref,text):
    mm=cell(x,ref)
    if not mm: raise SystemExit('thiếu ô '+ref)
    st=re.search(r' s="(\d+)"',mm.group(0).split('>')[0])
    new='<c r="%s"%s t="inlineStr"><is><t>%s</t></is></c>'%(ref,(' s="%s"'%st.group(1)) if st else '',esc(text))
    return x[:mm.start()]+new+x[mm.end():]
def put_num(x,ref,v):
    mm=cell(x,ref)
    st=re.search(r' s="(\d+)"',mm.group(0).split('>')[0])
    new='<c r="%s"%s t="n"><v>%s</v></c>'%(ref,(' s="%s"'%st.group(1)) if st else '',v)
    return x[:mm.start()]+new+x[mm.end():]
def put_f(x,ref,f):
    mm=cell(x,ref)
    st=re.search(r' s="(\d+)"',mm.group(0).split('>')[0])
    new='<c r="%s"%s><f>%s</f><v></v></c>'%(ref,(' s="%s"'%st.group(1)) if st else '',esc(f))
    return x[:mm.start()]+new+x[mm.end():]
def get_text(x,ref):
    mm=cell(x,ref)
    if not mm: return ''
    t=re.search(r'<t[^>]*>(.*?)</t>',mm.group(0),re.S)
    return html.unescape(t.group(1)) if t else ''
def read(zb):
    z=zipfile.ZipFile(io.BytesIO(zb));return {i.filename:z.read(i.filename) for i in z.infolist()},[i.filename for i in z.infolist()]
def write(files,order):
    b=io.BytesIO();z=zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED)
    for n in order: z.writestr(n,files[n])
    z.close();return b.getvalue()
def rx_free(files):
    """bỏ yêu cầu độ lệch 2 lần thử KL thể tích xốp"""
    k=files['xl/worksheets/sheet3.xml'].decode()
    k=put_text(k,'B19','Chênh lệch hai lần thử KL thể tích xốp: không có yêu cầu')
    k=put_f(k,'C19','IF(So_lieu!D16="","THIẾU","OK")')
    k=put_text(k,'D19','Không có yêu cầu độ lệch giữa 2 lần thử')
    files['xl/worksheets/sheet3.xml']=k.encode()
    h=files['xl/worksheets/sheet5.xml'].decode()
    h=put_text(h,'A19','Chênh lệch tối đa 2 lần thử KL thể tích xốp (kg/m³): không áp dụng')
    h=put_text(h,'C19','KHÔNG ÁP DỤNG: không có yêu cầu độ lệch giữa 2 lần thử (đá).')
    files['xl/worksheets/sheet5.xml']=h.encode()
base,order=read(src)
rx_free(base)
out={'DA_B64':write(base,order)}
CFG={
 'DA_10_40':dict(size='10-40',form='BM-DA-02',rng='DA10_01 ... DA10_07',sv=[70,40,20,10],last='< 10',g=[('Nhóm 10-20 mm (mẫu thử 1 kg)','Nhóm 10-20 mm (sót riêng sàng 10)'),('Nhóm 20-40 mm (mẫu thử 5 kg)','Nhóm 20-40 mm (sót riêng sàng 20)')],gom='Gộp phần sót trên sàng 40 mm vào nhóm 20-40 (1 = có, 0 = không)',mx=70,mu=10,sh_note=' (cốt liệu lớn)',tpl='DA_10_40'),
 'DA_20_70':dict(size='20-70',form='BM-DA-03',rng='DA20_01 ... DA20_07',sv=[100,70,40,20],last='< 20',g=[('Nhóm 20-40 mm (mẫu thử 5 kg)','Nhóm 20-40 mm (sót riêng sàng 20)'),('Nhóm 40-70 mm (mẫu thử 15 kg)','Nhóm 40-70 mm (sót riêng sàng 40)')],gom='Gộp phần sót trên sàng 70 mm vào nhóm 40-70 (1 = có, 0 = không)',mx=100,mu=20,sh_note=' (cốt liệu lớn)',tpl='DA_20_70'),
}
old=json.load(open(sys.argv[2])) if len(sys.argv)>2 else {}
for code,c in CFG.items():
    f,od=read(src)
    # sheet1
    x=f['xl/worksheets/sheet1.xml'].decode();x=put_text(x,'A1','BIỂU MẪU THỬ NGHIỆM ĐÁ DĂM XÂY DỰNG CỠ %s - %s / v1.0'%(c['size'],c['form']));f['xl/worksheets/sheet1.xml']=x.encode()
    # sheet2
    x=f['xl/worksheets/sheet2.xml'].decode()
    x=put_text(x,'A1','SỐ LIỆU THỬ NGHIỆM GỐC - ĐÁ DĂM XÂY DỰNG CỠ '+c['size'])
    for r,(lab,lab2) in zip([(24,25),(30,31)],[c['g'],c['g']]): pass
    for (r1,r2) in [(24,25),(30,31)]:
        x=put_text(x,'A%d'%r1,c['g'][0][0]);x=put_text(x,'A%d'%r2,c['g'][1][0])
    x=put_text(x,'A48',c['g'][0][1]);x=put_text(x,'A49',c['g'][1][1])
    for i,v in enumerate(c['sv']): x=put_num(x,'A%d'%(37+i),v)
    x=put_text(x,'A41',c['last']+' (đáy khay)')
    x=put_text(x,'F35','Khối lượng mẫu đem sàng theo TCVN 7572-2:2006.')
    f['xl/worksheets/sheet2.xml']=x.encode()
    # sheet4
    x=f['xl/worksheets/sheet4.xml'].decode()
    for i,v in enumerate(c['sv']): x=put_num(x,'J%d'%(28+i),v)
    x=put_text(x,'A32',c['last'])
    x=put_text(x,'C34','Mẫu đá trên có các chỉ tiêu đã kiểm tra đạt yêu cầu kỹ thuật theo TCVN 7570:2006'+c['sh_note']+'.')
    f['xl/worksheets/sheet4.xml']=x.encode()
    # sheet5
    x=f['xl/worksheets/sheet5.xml'].decode()
    x=put_text(x,'B3',c['form']);x=put_text(x,'B5',code);x=put_text(x,'B6',c['rng'])
    x=put_text(x,'A23',c['gom'])
    for i,v in enumerate(c['sv']): x=put_num(x,'A%d'%(27+i),v)
    x=put_text(x,'A31','Bộ số giới hạn đường thành phần hạt lấy theo mẫu đá 5-20 (cận trên 0/0/40/90, cận dưới 0/10/70/100), áp cho 4 cỡ sàng lớn nhất của cỡ đá %s. Xác nhận theo TCVN 7570:2006 trước khi ban hành.'%c['size'])
    for ref in ['C11','C12','C13','C14','C15','C16','C17']:
        t=old.get(code,{}).get(ref)
        if t: x=put_text(x,ref,t)
    f['xl/worksheets/sheet5.xml']=x.encode()
    # chart
    ch=f['xl/charts/chart1.xml'].decode()
    ch=ch.replace('<max val="40"/>','<max val="%d"/>'%c['mx'],1).replace('<majorUnit val="10"/>','<majorUnit val="%d"/>'%c['mu'],1)
    f['xl/charts/chart1.xml']=ch.encode()
    out[code]=write(f,od)
res={k:base64.b64encode(v).decode() for k,v in out.items()}
json.dump(res,open('/tmp/w/da_b64.json','w'))
# ghi lại vào HTML
s=s.replace(m.group(0),"const DA_B64='%s'"%res['DA_B64'])
def swap(s,pat,new):
    mm=re.search(pat,s)
    if not mm: raise SystemExit('không thấy '+pat)
    return s[:mm.start(1)]+new+s[mm.end(1):]
s=swap(s,r"B64N=\{DA_10_40:'([A-Za-z0-9+/=]+)'",res['DA_10_40'])
s=swap(s,r'"DA_20_70": "([A-Za-z0-9+/=]+)"',res['DA_20_70'])
open(HTML,'w',encoding='utf8').write(s)
print({k:len(v) for k,v in res.items()})
