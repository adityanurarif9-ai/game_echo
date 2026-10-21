from collections import deque
from pathlib import Path
from PIL import Image, ImageFilter

root = Path(__file__).resolve().parents[1]
source = root / 'public' / 'assets'
out = root / 'public' / 'sprites'
out.mkdir(exist_ok=True)

# Original artwork is a 5 x 4 pose sheet. Extract a character-shaped region
# from each cell, then put every pose on the same foot baseline.
def frame(sheet, col, row):
    w,h=sheet.size
    box=(round(col*w/5),round(row*h/4),round((col+1)*w/5),round((row+1)*h/4))
    im=sheet.crop(box).convert('RGBA')
    width,height=im.size
    px=im.load()
    rough=Image.new('L',(width,height),0)
    mp=rough.load()
    for y in range(height):
        for x in range(width):
            r,g,b,_=px[x,y]
            # The contact sheet is light grey/white. Dark outlines, clothing,
            # and coloured skin are reliable character seeds.
            if min(r,g,b)<143 or max(r,g,b)-min(r,g,b)>27:
                mp[x,y]=255
    rough=rough.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
    mp=rough.load()
    seen=bytearray(width*height)
    largest=[]
    for y in range(height):
        for x in range(width):
            start=y*width+x
            if not mp[x,y] or seen[start]:continue
            q=deque([(x,y)]);seen[start]=1;component=[]
            while q:
                cx,cy=q.popleft();component.append((cx,cy))
                for dx,dy in ((-1,0),(1,0),(0,-1),(0,1)):
                    nx,ny=cx+dx,cy+dy
                    if 0<=nx<width and 0<=ny<height:
                        i=ny*width+nx
                        if mp[nx,ny] and not seen[i]:seen[i]=1;q.append((nx,ny))
            if len(component)>len(largest):largest=component
    mask=Image.new('L',(width,height),0)
    m=mask.load()
    for x,y in largest:m[x,y]=255
    # Fill the light hair/face areas enclosed by the dark outline.
    exterior=bytearray(width*height);q=deque()
    for x in range(width):
        for y in (0,height-1):
            if not m[x,y] and not exterior[y*width+x]:exterior[y*width+x]=1;q.append((x,y))
    for y in range(height):
        for x in (0,width-1):
            if not m[x,y] and not exterior[y*width+x]:exterior[y*width+x]=1;q.append((x,y))
    while q:
        cx,cy=q.popleft()
        for dx,dy in ((-1,0),(1,0),(0,-1),(0,1)):
            nx,ny=cx+dx,cy+dy
            if 0<=nx<width and 0<=ny<height:
                i=ny*width+nx
                if not m[nx,ny] and not exterior[i]:exterior[i]=1;q.append((nx,ny))
    for y in range(height):
        for x in range(width):
            if not exterior[y*width+x]:m[x,y]=255
    mask=mask.filter(ImageFilter.GaussianBlur(.55))
    im.putalpha(mask)
    # Ignore one-pixel JPEG speckles when finding the visible bounds.
    alpha=im.getchannel('A')
    rows=[y for y in range(height) if sum(alpha.crop((0,y,width,y+1)).get_flattened_data())>10*255]
    cols=[x for x in range(width) if sum(alpha.crop((x,0,x+1,height)).get_flattened_data())>10*255]
    if not rows or not cols:return Image.new('RGBA',(128,200))
    art=im.crop((min(cols),min(rows),max(cols)+1,max(rows)+1))
    scale=min(112/art.width,192/art.height)
    art=art.resize((round(art.width*scale),round(art.height*scale)),Image.Resampling.LANCZOS)
    canvas=Image.new('RGBA',(128,200))
    canvas.alpha_composite(art,((128-art.width)//2,198-art.height))
    return canvas

characters={'agen-r.png':'r','agen-v.jpg':'v','chief.jpg':'chief','anonim.jpg':'anonim','pelaku.jpg':'pelaku'}
for filename,slug in characters.items():
    sheet=Image.open(source/filename)
    frame(sheet,0,0).save(out/f'{slug}-idle.png')
    for col in range(5):frame(sheet,col,1).save(out/f'{slug}-walk-{col}.png')
print('Generated transparent, grounded frames for five characters.')
