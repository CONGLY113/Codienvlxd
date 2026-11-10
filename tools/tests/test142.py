# 0.28.9: quy tắc nhận diện liên kết phiếu nguồn
import asyncio,sys,json
from playwright.async_api import async_playwright
src=open('/tmp/w/test80.py',encoding='utf8').read()
FAKE=src.split('FAKE = r"""')[1].split('"""')[0]
JSZIP=open('/opt/npm-tools/node_modules/jszip/dist/jszip.min.js',encoding='utf8').read()
HTML=sys.argv[1];ok=0;bad=0
def chk(c,msg):
    global ok,bad
    if c: ok+=1
    else: bad+=1;print('  FAIL',msg)
async def main():
    async with async_playwright() as pw:
        br=await pw.chromium.launch(executable_path='/usr/bin/google-chrome',headless=True,args=['--no-sandbox'])
        page=await (await br.new_context()).new_page();errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)))
        async def route(r):
            u=r.request.url
            if 'jszip' in u: await r.fulfill(body=JSZIP,content_type='application/javascript')
            elif u.startswith('file://'): await r.continue_()
            else: await r.fulfill(body='',content_type='text/css' if 'css' in u else 'application/javascript')
        await page.route('**/*',route);await page.add_init_script(FAKE)
        await page.goto('file://'+HTML)
        await page.wait_for_function('window.__ptn && window.__ptn.db === true',timeout=15000)
        r=await page.evaluate("""()=>{const S=window.__ptn.S;
          const mk=(ma,loai,ct,yc,extra)=>Object.assign({ma_mau:ma,status:'da_phat_hanh',so_bao_cao:'26.11.'+ma,so_yc:yc,du_an:{cong_trinh:ct},mau:{loai,ngay_nhan:'2026-11-0'+(ma.length%9+1),nguon_goc:'Nguồn '+ma},nop:{results:{r28:40,mdl:2.5,rx:1.4,ra:2.65,s5:1,nd:10,w:10.5,gk:1.95}}},extra||{});
          S.samples=[mk('C1','CAT_XD','Cầu A','YC1'),mk('C2','CAT_XD','cầu  a','YC2'),mk('C3','CAT_XD','Cầu B','YC1'),mk('X1','XM_PCB40','Cầu A','YC1'),mk('D1','DA_5_20','Cầu A','YC1'),mk('D2','DA_10_40','Cầu A','YC1'),
            mk('T1','CP_TN','Cầu A','YC9'),mk('T2','CP_TN','Cầu B','YC1'),mk('V1','DAM_CHAT_CAT','Cầu A','YC7'),mk('P1','CPDD_1','Cầu A','YC8')];
          const bt={ma_mau:'B1',so_yc:'YC1',du_an:{cong_trinh:'Cầu A'},mau:{loai:'CP_BT'}};
          const kpr={ma_mau:'K1',so_yc:'YC5',du_an:{cong_trinh:'Cầu A'},mau:{loai:'DO_K_PR'}},kdv=Object.assign({},kpr,{ma_mau:'K2',mau:{loai:'DO_K_DV'}}),kb=Object.assign({},kpr,{du_an:{cong_trinh:'Cầu B'}});
          const P=window.__ptn,ids=a=>a.map(x=>x.ma_mau).sort().join(',');
          return {ct:ids(P.cpCands(bt,'ct')),xm:ids(P.cpCands(bt,'xm')),da:ids(P.cpCands(bt,'da')),kpr:ids(P.cpCands(kpr,'cp')),kdv:ids(P.cpCands(kdv,'cp')),kb:ids(P.cpCands(kb,'cp')),
            why:P.linkWhy(bt,S.samples[2],'ct'),why2:P.linkWhy(bt,S.samples[1],'ct'),why3:P.linkWhy(kpr,S.samples[6],'cp')}}""")
        print(json.dumps(r,ensure_ascii=False))
        chk(r['ct']=='C1,C2' or r['ct']=='C1','cát chỉ cùng công trình+phiếu: '+r['ct'])
        chk(r['xm']=='X1','xi măng '+r['xm'])
        chk(r['da']=='D1,D2','đá '+r['da'])
        chk(r['kpr']=='P1,T1','đo K phễu: cùng công trình, khác phiếu vẫn được '+r['kpr'])
        chk(r['kdv']=='V1','đo K dao vòng: đầm chặt cát '+r['kdv'])
        chk(r['kb']=='T2','đo K công trình B '+r['kb'])
        chk('khác công trình' in r['why'],'why '+r['why']);chk('khác phiếu yêu cầu' in r['why2'],'why2 '+r['why2']);chk(r['why3']=='','đo K không cần cùng phiếu')
        chk(not errs,'errs %s'%errs)
        await br.close()
asyncio.run(main());print('ok',ok,'bad',bad)
