from PIL import Image, ImageDraw, ImageFont
S=4
W,H=520*S,150*S
im=Image.new("RGBA",(W,H),(255,255,255,0)); d=ImageDraw.Draw(im)
fb=ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",78*S)
fr=ImageFont.truetype("/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",34*S)
d.text((0,8*S),"neoenergia",font=fb,fill=(0x5C,0x89,0x2F,255))
x=d.textlength("neoenergia",font=fb)
d.text((4*S,98*S),"Pernambuco",font=fr,fill=(0x4D,0x4D,0x4D,255))
bb=im.getbbox(); im=im.crop((0,0,bb[2]+4*S,bb[3]+4*S)); im.save("logo.png"); print(im.size)
