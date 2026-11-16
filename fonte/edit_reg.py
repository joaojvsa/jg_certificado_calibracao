import re, sys
path=sys.argv[1]
x=open(path,encoding='utf8').read()
CELL=re.compile(r'<w:tc>.*?</w:tc>',re.S)
rows=list(re.finditer(r'<w:tr[ >].*?</w:tr>',x,re.S))
W=[2342,2335,2339]; GS=[3,2,2]

def setp(c,w,gs,vm=None,text=None):
    c=re.sub(r'<w:tcW w:w="\d+"',f'<w:tcW w:w="{w}"',c,1)
    c=re.sub(r'<w:gridSpan w:val="\d+"/>','',c); c=re.sub(r'<w:vMerge[^>]*/>','',c)
    extra=(f'<w:gridSpan w:val="{gs}"/>' if gs>1 else '')+(vm or '')
    c=re.sub(r'(<w:tcW [^>]*/>)',r'\1'+extra,c,1)
    if text is not None:
        c=re.sub(r'<w:t>[^<]*</w:t>',f'<w:t>{text}</w:t>',c,1)
    return c
def empty(c):  # remove runs, keep pPr
    return re.sub(r'<w:r>.*?</w:r>','',c,flags=re.S)

new={}
r=[m.group(0) for m in rows]
# grid: equalize the 3 cycle columns
g_old='<w:gridCol w:w="1252"/><w:gridCol w:w="368"/>'
assert x.count(g_old)==1
for i in (0,2):
    cs=CELL.findall(r[i]); s=r[i]
    s=s.replace(cs[1],setp(cs[1],3065,4)).replace(cs[2],setp(cs[2],8645,9)); new[i]=s
def rebuild(i,start,n,mk):
    cs=CELL.findall(r[i]); a=r[i].index(cs[start]); b=r[i].index(cs[start+n-1])+len(cs[start+n-1])
    new[i]=r[i][:a]+''.join(mk(k) for k in range(3))+r[i][b:]
tpl=CELL.findall(r[9])[3]  # CICLO 1 header cell
rebuild(7,2,2,lambda k: setp(tpl,W[k],GS[k],'<w:vMerge w:val="restart"/>',f'CICLO {k+1}'))
for i,(st,n) in ((8,(2,2)),(9,(2,4))):
    rebuild(i,st,n,lambda k: empty(setp(tpl,W[k],GS[k],'<w:vMerge/>')))
for i in range(10,25):
    d=CELL.findall(r[i])[3]
    assert not re.search(r'<w:t[ >]',d)
    rebuild(i,2,4,lambda k,d=d: setp(d,W[k],GS[k]))
out=[];last=0
for i,m in enumerate(rows):
    out.append(x[last:m.start()]); out.append(new.get(i,m.group(0))); last=m.end()
out.append(x[last:]); y=''.join(out)
y=y.replace(g_old,'<w:gridCol w:w="1077"/><w:gridCol w:w="543"/>')
assert 'ANTES' not in y and 'AJUSTE' not in y
open(path,'w',encoding='utf8').write(y); print('ok')
