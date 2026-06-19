import math, cairosvg

def star_points(cx, cy, R, r, n=5, rot=-90):
    pts=[]
    for i in range(n*2):
        ang = math.radians(rot + i*(360/(n*2)))
        rad = R if i%2==0 else r
        pts.append((cx+rad*math.cos(ang), cy+rad*math.sin(ang)))
    return "M " + " L ".join(f"{x:.2f},{y:.2f}" for x,y in pts) + " Z"

def sunburst(cx, cy, R, n=16):
    # alternating triangle rays
    paths=[]
    for i in range(n):
        a0 = math.radians(i*(360/n))
        a1 = math.radians((i+0.5)*(360/n))
        a2 = math.radians((i+1)*(360/n))
        rOuter = R
        rInner = R*0.62
        x0,y0 = cx+rInner*math.cos(a0), cy+rInner*math.sin(a0)
        x1,y1 = cx+rOuter*math.cos(a1), cy+rOuter*math.sin(a1)
        x2,y2 = cx+rInner*math.cos(a2), cy+rInner*math.sin(a2)
        paths.append(f'<path d="M {x0:.1f},{y0:.1f} L {x1:.1f},{y1:.1f} L {x2:.1f},{y2:.1f} Z" fill="#FFD45E"/>')
    return "\n".join(paths)

def build(size, pad=0.0):
    s=512
    cx=cy=s/2
    R = s/2*(1-pad)
    ink="#1A1726"
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {s} {s}" width="{size}" height="{size}">
<defs>
  <radialGradient id="field" cx="50%" cy="42%" r="65%">
    <stop offset="0%" stop-color="#3A3358"/>
    <stop offset="100%" stop-color="#241F38"/>
  </radialGradient>
  <linearGradient id="starg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FF5A4D"/>
    <stop offset="100%" stop-color="#D6261D"/>
  </linearGradient>
</defs>
<rect width="{s}" height="{s}" fill="#E5332A"/>
<circle cx="{cx}" cy="{cy}" r="{R-6}" fill="#1A1726"/>
<circle cx="{cx}" cy="{cy}" r="{R-22}" fill="#F2B705"/>
<circle cx="{cx}" cy="{cy}" r="{R-50}" fill="#1A1726"/>
<circle cx="{cx}" cy="{cy}" r="{R-58}" fill="url(#field)"/>
<g transform="translate({cx},{cy-10})">
  {sunburst(0,0,R-72,16)}
</g>
<circle cx="{cx}" cy="{cy-10}" r="{R-150}" fill="#2B2640" opacity="0.0"/>
<path d="{star_points(cx, cy-14, R-92, (R-92)*0.42)}" fill="url(#starg)" stroke="{ink}" stroke-width="14" stroke-linejoin="round"/>
<path d="{star_points(cx-3, cy-20, (R-92)*0.5, (R-92)*0.22)}" fill="#FF8C82" opacity="0.55"/>
<g>
  <rect x="{cx-150}" y="{cy+ (R-150)}" width="300" height="78" rx="14" fill="#FFF4E0" stroke="{ink}" stroke-width="12"/>
  <text x="{cx}" y="{cy + (R-150)+54}" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="52" fill="#E5332A" text-anchor="middle" letter-spacing="2">VELMORA</text>
</g>
</svg>'''
    return svg

# Standard icons
open("icons/emblem.svg","w").write(build(512))
cairosvg.svg2png(bytestring=build(512).encode(), write_to="icons/icon-512.png", output_width=512, output_height=512)
cairosvg.svg2png(bytestring=build(192).encode(), write_to="icons/icon-192.png", output_width=192, output_height=192)
# Maskable with safe padding (content within inner 80%)
open("icons/emblem-maskable.svg","w").write(build(512, pad=0.12))
cairosvg.svg2png(bytestring=build(512,pad=0.12).encode(), write_to="icons/icon-512-maskable.png", output_width=512, output_height=512)
# Favicon
cairosvg.svg2png(bytestring=build(64).encode(), write_to="icons/favicon-64.png", output_width=64, output_height=64)
print("icons written")
