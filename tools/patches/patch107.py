s=open('/tmp/w/out106.html',encoding='utf8').read()
def rep(old,new,n=1):
    global s
    c=s.count(old);assert c==n,(old[:80],c);s=s.replace(old,new)
rep("input[type=text],input[type=email],input[type=tel],input[type=date]","input[type=password],input[type=text],input[type=email],input[type=tel],input[type=date]",2)
rep("h('form',{onsubmit:async ev=>{ev.preventDefault();","h('form',{class:'stack',onsubmit:async ev=>{ev.preventDefault();",2)
rep("['05/11/2026','B18','Claude',","['05/11/2026','B18b','Claude','Sửa giao diện hộp đăng nhập và đổi mật khẩu: ô nhập mật khẩu có kiểu giống các ô khác (bo góc, viền), các ô cách nhau rõ, không đè lên nhãn','Chờ thử','Ô mật khẩu chưa có kiểu, nhãn sát ô phía trên','Chỉ đổi giao diện'],\n['05/11/2026','B18','Claude',")
open('/tmp/w/out107.html','w',encoding='utf8').write(s);print('ok')
