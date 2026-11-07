import sys
F=sys.argv[1]; s=open(F,encoding='utf-8').read()
def rep(a,b,n=1):
    global s
    assert s.count(a)==n,(a[:70],s.count(a)); s=s.replace(a,b)
rep("{id:'NS018',name:'Phan Thanh Giàn',title:'Phó giám đốc',roles:['pd']}","{id:'NS018',name:'Phan Thanh Giàn',title:'Phó giám đốc',roles:['pgd']}")
rep("ktt:'Kế toán trưởng',","ktt:'Kế toán trưởng',pgd:'Phó giám đốc (chỉ xem thanh toán)',")
rep("const bkVai=()=>{const r=['tq','kt','tp','ktt','pd']","const bkVai=()=>{const r=['tq','kt','tp','ktt','pd','pgd']")
rep("const dvViewRooms=()=>(dvAdmin()||hasRole('tq')||hasRole('ktt')||hasRole('pd'))","const dvViewRooms=()=>(dvAdmin()||hasRole('tq')||hasRole('ktt')||hasRole('pd')||hasRole('pgd'))")
rep("{k:'thanh-toan',t:'Thanh toán',show:()=>['kt','tp','tq','ktt','pd'].some(r=>hasRole(r))","{k:'thanh-toan',t:'Thanh toán',show:()=>['kt','tp','tq','ktt','pd','pgd'].some(r=>hasRole(r))")
rep("{k:'luu-tru',t:'Hồ sơ lưu trữ',show:()=>true}","{k:'luu-tru',t:'Hồ sơ lưu trữ',show:()=>!hasRole('pgd')}")
rep("{k:'thiet-bi',t:'Thiết bị',show:()=>true}","{k:'thiet-bi',t:'Thiết bị',show:()=>!hasRole('pgd')}")
rep("const BUILD='0.27.4 · 07/11/2026';","const BUILD='0.27.5 · 07/11/2026';")
rep("const BUILD_LOG=[\n","const BUILD_LOG=[\n['07/11/2026','B26','Claude','Phân quyền riêng cho Phó giám đốc Phan Thanh Giàn (vai trò pgd): chỉ xem bảng kê thanh toán, công nợ, tổng hợp thanh toán của các phòng; không soát xét, phê duyệt phiếu, không có Sửa đổi phiếu, Thiết bị, Hồ sơ lưu trữ, không ký duyệt bảng kê.','Đã kiểm thử'],\n")
open(F,'w',encoding='utf-8').write(s)
