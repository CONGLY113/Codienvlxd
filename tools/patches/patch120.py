import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)

# bảng thông số theo loại (đặt ngay trước patchPhieuCommon)
rep("const PK_NO_QC={NEN_BT:1,NEN_VUA:1};","""const PK_NO_QC={NEN_BT:1,NEN_VUA:1};
/* chỉnh riêng theo loại mẫu: nofill = bỏ nền màu; hide = ẩn hàng theo nhãn cột A; drop = xóa ô nhãn và ô giá trị cùng hàng; rep = đổi chữ (tiêu chuẩn) ở Phieu_KQ và So_lieu */
const PK_TYPE=(()=>{const xm={nofill:1,hide:['Phương pháp thử:'],rep:[['TCVN 4030:2003','TCVN 13605:2023']]},nh={hide:['Phương pháp thử:']},ln={nofill:1};
  return{XM_PCB30:xm,XM_PCB40:xm,DO_CS:{nofill:1,drop:['Khu vực đo:'],hide:['Ghi chú đo:']},
    DO_K_DV:{nofill:1,drop:['Đoạn, vị trí đo:'],rep:[['22 TCN 02:71','TCVN 12791:2020']]},DO_K_PR:{nofill:1,drop:['Đoạn, vị trí đo:']},
    DA_LN_1:ln,DA_LN_2:ln,DA_LN_3:ln,NHUA_6070:nh,NHUA_MC70:nh,GACH_BT_DAC:nh,GACH_BT_RONG:nh};})();""")

# gọi trong patchPhieuCommon: trước phần "4. trang in"
rep("  /* 4. trang in: lề 4,1","""  /* 3b. chỉnh riêng theo loại mẫu */
  const TP=PK_TYPE[loaiOf(sample)];
  if(TP){
    (TP.hide||[]).forEach(lb=>{for(let r=1;r<=maxHead;r++){const a=cellsOf(r).find(c=>colOf(c)==='A');if(a&&txt(a).trim()===lb)rows[r].setAttribute('hidden','1');}});
    (TP.drop||[]).forEach(lb=>{for(let r=1;r<=maxHead;r++){const cs=cellsOf(r),l=cs.find(c=>txt(c).trim()===lb);if(!l)continue;blank(l);
      const v=cs.find(c=>colOf(c)>colOf(l)&&txt(c).indexOf('in_nguon_goc')>=0);if(v)blank(v);}});
    if(TP.nofill)Array.from(doc.getElementsByTagName('c')).forEach(c=>{const s0=+c.getAttribute('s')||0,b=xfs.children[s0];if(!b)return;const fid=+b.getAttribute('fillId')||0;if(!fid)return;
      const n=newXf(s0,'nf',x=>{x.setAttribute('fillId','0');x.setAttribute('applyFill','1');});c.setAttribute('s',String(n));});
  }
  /* 4. trang in: lề 4,1""")
rep("  zip.file(p,ser(doc));zip.file('xl/styles.xml',ser(stDoc));\n}","""  zip.file(p,ser(doc));zip.file('xl/styles.xml',ser(stDoc));
  if(TP&&TP.rep)for(const pp of ['xl/worksheets/sheet4.xml','xl/worksheets/sheet2.xml']){const f2=zip.file(pp);if(!f2)continue;let x2=await f2.async('string'),ch=false;
    TP.rep.forEach(([a,b])=>{if(x2.indexOf(a)>=0){x2=x2.split(a).join(b);ch=true;}});if(ch)zip.file(pp,x2);}
}""")
# phía HTML: tiêu chuẩn
rep("'Độ mịn','TCVN 4030:2003, sàng 0,09 mm'","'Độ mịn','TCVN 13605:2023, sàng 0,09 mm'")
rep("['XM_01','Độ mịn (phần còn lại trên sàng 0,09 mm)','TCVN 4030:2003','%','mjn']","['XM_01','Độ mịn (phần còn lại trên sàng 0,09 mm)','TCVN 13605:2023','%','mjn']")
rep("std:dv?'22 TCN 02:71':'22 TCN 346:2006'","std:dv?'TCVN 12791:2020':'22 TCN 346:2006'")
rep("['08/11/2026','B30','Claude',","['08/11/2026','B31','Claude','Phiếu kết quả theo loại mẫu (nhóm đơn giản): xi măng (bỏ nền, bỏ dòng phương pháp thử, TCVN 4030:2003 → TCVN 13605:2023), đo chống sét (bỏ khu vực đo, ghi chú đo, nền), đo K dao vòng/phễu rót cát (bỏ đoạn vị trí đo, nền; 22 TCN 02:71 → TCVN 12791:2020), đá láng nhựa (bỏ nền), nhựa đường, nhựa đường lỏng, gạch bê tông đặc/rỗng (bỏ dòng phương pháp thử).','Đã kiểm thử'],\n['08/11/2026','B30','Claude',")
open(F,'w',encoding='utf-8').write(s);print('ok')
